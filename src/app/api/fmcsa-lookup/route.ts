import { NextResponse } from 'next/server'

const FMCSA_BASE = 'https://mobile.fmcsa.dot.gov/qc/services'

/** Normalize MC to docket format (digits only or MC-XXXXXX). */
function normalizeMc(mc: string): string {
  const digits = mc.replace(/\D/g, '')
  return digits ? `MC-${digits}` : mc
}

/**
 * GET /api/fmcsa-lookup?mc=123456 | ?dot=1234567
 * Looks up carrier/broker by MC or DOT using FMCSA WebKey (server-side only).
 * Returns legal name, DOT number, MC number for auto-fill on signup.
 */
export async function GET(request: Request) {
  const webKey = process.env.FMCSA_WEB_KEY?.trim()
  if (!webKey) {
    return NextResponse.json({ error: 'FMCSA lookup not configured' }, { status: 503 })
  }

  const { searchParams } = new URL(request.url)
  const mc = searchParams.get('mc')?.trim()
  const dot = searchParams.get('dot')?.trim()

  if (!mc && !dot) {
    return NextResponse.json({ error: 'Provide mc or dot query parameter' }, { status: 400 })
  }

  try {
    let url: string
    if (dot) {
      const dotDigits = dot.replace(/\D/g, '')
      if (!dotDigits) {
        return NextResponse.json({ error: 'Invalid DOT number' }, { status: 400 })
      }
      url = `${FMCSA_BASE}/carriers/${dotDigits}?webKey=${encodeURIComponent(webKey)}`
    } else {
      const docket = normalizeMc(mc!)
      url = `${FMCSA_BASE}/carriers/docket-number/${encodeURIComponent(docket)}?webKey=${encodeURIComponent(webKey)}`
    }

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('FMCSA API error:', res.status, text.slice(0, 200))
      return NextResponse.json(
        { error: res.status === 404 ? 'Carrier not found' : 'Lookup failed' },
        { status: res.status === 404 ? 404 : 502 }
      )
    }

    const data = await res.json().catch(() => null)
    if (!data) {
      return NextResponse.json({ error: 'Invalid response from FMCSA' }, { status: 502 })
    }

    // FMCSA response shape: can be single carrier or content with carrier list
    const carrier = data.carrier ?? data.content?.[0] ?? (Array.isArray(data) ? data[0] : data)
    const legalName =
      carrier?.legalName ??
      carrier?.legal_name ??
      carrier?.name ??
      (carrier?.carrier?.legalName ?? carrier?.carrier?.legal_name)
    const dotNumber =
      carrier?.dotNumber ??
      carrier?.dot_number ??
      carrier?.dot ??
      (carrier?.carrier?.dotNumber ?? carrier?.carrier?.dot_number)
    const mcNumber =
      carrier?.docketNumber ??
      carrier?.docket_number ??
      carrier?.mcNumber ??
      carrier?.mc_number ??
      (carrier?.carrier?.docketNumber ?? carrier?.carrier?.mc_number)

    const out = {
      legalName: typeof legalName === 'string' ? legalName.trim() || null : null,
      dotNumber: dotNumber != null ? String(dotNumber).replace(/\D/g, '') || null : null,
      mcNumber:
        mcNumber != null
          ? String(mcNumber).replace(/^MC-?/i, '').trim() || null
          : mc
            ? mc.replace(/\D/g, '') || null
            : null,
    }

    if (!out.legalName && !out.dotNumber && !out.mcNumber) {
      return NextResponse.json({ error: 'Carrier not found or no data returned' }, { status: 404 })
    }

    return NextResponse.json(out)
  } catch (err) {
    console.error('FMCSA lookup error:', err)
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
}
