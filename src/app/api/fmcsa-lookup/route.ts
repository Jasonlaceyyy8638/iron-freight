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
    return NextResponse.json(
      { error: 'FMCSA lookup not configured. Add FMCSA_WEB_KEY to your environment (e.g. Netlify).' },
      { status: 503 }
    )
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

    let res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    })

    // Some FMCSA environments expect docket as digits only (no "MC-" prefix)
    if (!res.ok && mc && !dot) {
      const mcDigits = mc.replace(/\D/g, '')
      const docket = normalizeMc(mc)
      if (mcDigits && docket.startsWith('MC-')) {
        const altUrl = `${FMCSA_BASE}/carriers/docket-number/${mcDigits}?webKey=${encodeURIComponent(webKey)}`
        const altRes = await fetch(altUrl, { headers: { Accept: 'application/json' }, next: { revalidate: 0 } })
        if (altRes.ok) {
          res = altRes
        }
      }
    }

    if (!res.ok) {
      const text = await res.text()
      console.error('[FMCSA] status:', res.status, 'url:', res.url, 'body:', text.slice(0, 400))
      if (res.status === 404) {
        return NextResponse.json({ error: 'Carrier not found for this MC/DOT number.' }, { status: 404 })
      }
      if (res.status === 401 || res.status === 403) {
        return NextResponse.json(
          { error: 'FMCSA API key invalid or expired. Check FMCSA_WEB_KEY in your environment.' },
          { status: 502 }
        )
      }
      return NextResponse.json(
        { error: 'FMCSA service temporarily unavailable. Try again or use "Open in FMCSA Safer" to verify the number.' },
        { status: 502 }
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

    const out: {
      legalName: string | null
      dotNumber: string | null
      mcNumber: string | null
      suggestedRole?: 'broker' | 'carrier'
    } = {
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

    // Fetch operating authority to determine broker vs carrier (for signup pricing)
    const dotForAuthority = out.dotNumber || (dot ? dot.replace(/\D/g, '') : null)
    if (webKey && dotForAuthority) {
      try {
        const authUrl = `${FMCSA_BASE}/carriers/${dotForAuthority}/authority?webKey=${encodeURIComponent(webKey)}`
        const authRes = await fetch(authUrl, { headers: { Accept: 'application/json' }, next: { revalidate: 0 } })
        if (authRes.ok) {
          const authData = await authRes.json().catch(() => null)
          const authStr = JSON.stringify(authData ?? {}).toLowerCase()
          // Broker authority often appears as "broker", "bk", or "property broker"
          const isBroker =
            authStr.includes('"broker"') ||
            authStr.includes('"bk"') ||
            /broker\s*authority|property\s*broker/i.test(authStr)
          out.suggestedRole = isBroker ? 'broker' : 'carrier'
        }
      } catch {
        // Keep suggestedRole unset; frontend can keep user's choice
      }
    }

    return NextResponse.json(out)
  } catch (err) {
    console.error('[FMCSA] lookup error:', err)
    return NextResponse.json(
      { error: 'Lookup failed. Check the terminal (npm run dev) for the FMCSA response.' },
      { status: 500 }
    )
  }
}
