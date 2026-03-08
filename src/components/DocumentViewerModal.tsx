'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, IdCard, FileCheck, Shield } from 'lucide-react'
import { getSupabase } from '@/lib/supabase/client'

const WATERMARK_TEXT = 'FOR VERIFICATION ONLY - IRONFREIGHT'

function WatermarkedImage({ src, alt, label }: { src: string; alt: string; label: string }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/15 bg-black/40">
      <img
        src={src}
        alt={alt}
        className="h-auto w-full max-h-[360px] object-contain"
      />
      {/* Watermark overlay — prevents document theft */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        aria-hidden
      >
        <div
          className="flex flex-wrap justify-center gap-x-12 gap-y-6 px-4 py-8"
          style={{
            transform: 'rotate(-35deg)',
            textShadow: '0 1px 3px rgba(0,0,0,0.9)',
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="whitespace-nowrap text-xl font-bold tracking-widest text-white/50"
            >
              {WATERMARK_TEXT}
            </span>
          ))}
        </div>
      </div>
      {label && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
          <p className="text-xs font-medium text-white/90">{label}</p>
        </div>
      )}
    </div>
  )
}

type DocItem = { path: string; label: string; signedUrl: string | null }

export function DocumentViewerModal({
  carrierId,
  carrierName,
  onClose,
}: {
  carrierId: string
  carrierName: string
  onClose: () => void
}) {
  const [cdlDocs, setCdlDocs] = useState<DocItem[]>([])
  const [bolDocs, setBolDocs] = useState<DocItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const client = getSupabase()
    if (!client) {
      setError('Not configured')
      setLoading(false)
      return
    }

    async function fetchDocs() {
      if (!client) return
      setLoading(true)
      setError(null)
      try {
        const [driversRes, loadsRes] = await Promise.all([
          client.from('drivers').select('id, full_name, cdl_image_url').eq('carrier_id', carrierId),
          client.from('loads').select('id, load_number, bol_image_url').eq('carrier_id', carrierId),
        ])
        if (cancelled) return
        if (driversRes.error) throw driversRes.error
        if (loadsRes.error) throw loadsRes.error

        const cdlPaths = (driversRes.data ?? [])
          .filter((d) => d.cdl_image_url)
          .map((d) => ({ path: d.cdl_image_url!, label: `CDL — ${d.full_name}`, signedUrl: null as string | null }))
        const bolPaths = (loadsRes.data ?? [])
          .filter((l) => l.bol_image_url)
          .map((l) => ({ path: l.bol_image_url!, label: `eBOL — ${l.load_number}`, signedUrl: null as string | null }))

        const sign = async (path: string) => {
          const { data } = await client.storage.from('documents').createSignedUrl(path, 3600)
          return data?.signedUrl ?? null
        }
        const cdlSigned = await Promise.all(cdlPaths.map((d) => sign(d.path)))
        const bolSigned = await Promise.all(bolPaths.map((d) => sign(d.path)))
        if (cancelled) return

        setCdlDocs(cdlPaths.map((d, i) => ({ ...d, signedUrl: cdlSigned[i] ?? null })))
        setBolDocs(bolPaths.map((d, i) => ({ ...d, signedUrl: bolSigned[i] ?? null })))
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load documents')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchDocs()
    return () => { cancelled = true }
  }, [carrierId])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-viewer-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-xl border border-white/15 bg-[#0A0A0B] shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 id="document-viewer-title" className="font-display text-lg font-bold text-white">
            Document gallery — {carrierName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-white/60 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/60">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="mt-3 text-sm">Loading documents…</p>
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-red-400">{error}</p>
          ) : (
            <div className="space-y-8">
              {/* CDL */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C1FF00]">
                  <IdCard className="h-4 w-4" />
                  CDL (Driver licenses)
                </h3>
                {cdlDocs.length === 0 ? (
                  <p className="rounded border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50">
                    No CDL documents on file.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {cdlDocs.map((d) =>
                      d.signedUrl ? (
                        <WatermarkedImage key={d.path} src={d.signedUrl} alt={d.label} label={d.label} />
                      ) : (
                        <div key={d.path} className="rounded-lg border border-white/15 bg-white/5 p-4 text-sm text-white/50">
                          {d.label} — unavailable
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>

              {/* COI */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C1FF00]">
                  <Shield className="h-4 w-4" />
                  Certificate of Insurance (COI)
                </h3>
                <p className="rounded border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50">
                  No COI document on file.
                </p>
              </section>

              {/* eBOL */}
              <section>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C1FF00]">
                  <FileCheck className="h-4 w-4" />
                  eBOL (Bills of lading)
                </h3>
                {bolDocs.length === 0 ? (
                  <p className="rounded border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50">
                    No eBOL documents on file.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {bolDocs.map((d) =>
                      d.signedUrl ? (
                        <WatermarkedImage key={d.path} src={d.signedUrl} alt={d.label} label={d.label} />
                      ) : (
                        <div key={d.path} className="rounded-lg border border-white/15 bg-white/5 p-4 text-sm text-white/50">
                          {d.label} — unavailable
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
