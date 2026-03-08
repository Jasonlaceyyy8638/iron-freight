'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { CameraAccess } from '@/components/CameraAccess'
import { Camera, Zap, ZapOff } from 'lucide-react'
import { compressImageUnder1MB } from '@/lib/image-compression'
import { uploadSecurityDoc, type SecurityDocType } from '@/lib/uploadSecurityDoc'
import { getSupabase } from '@/lib/supabase/client'

type DocKind = 'cdl' | 'bol'

export function DocumentScanner({
  loadId,
  driverId,
  type,
  onSuccess,
  onCancel,
}: {
  loadId: string
  driverId: string
  type: DocKind
  onSuccess: () => void
  onCancel: () => void
}) {
  const [capturedFile, setCapturedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [torchOn, setTorchOn] = useState(false)

  const docLabel = type === 'cdl' ? 'CDL' : 'BOL'

  return (
    <CameraAccess facingMode="environment">
      {({ stream, requestAccess, stopStream }) => {
        if (!stream) {
          return (
            <div className="space-y-3">
              <p className="text-sm text-iron-400">
                Rear camera required to scan your {docLabel}. Use the rectangular guide to frame the document.
              </p>
              <button
                type="button"
                onClick={requestAccess}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C1FF00] py-3 font-semibold text-iron-950"
              >
                <Camera className="h-5 w-5" />
                Start {docLabel} scan
              </button>
              <button type="button" onClick={onCancel} className="w-full rounded-lg border border-iron-600 py-2 text-sm text-iron-400">
                Cancel
              </button>
            </div>
          )
        }
        return (
          <DocScannerView
            stream={stream}
            loadId={loadId}
            driverId={driverId}
            type={type}
            torchOn={torchOn}
            setTorchOn={setTorchOn}
            onCapture={(file) => setCapturedFile(file)}
            onRetake={() => setCapturedFile(null)}
            onCancel={() => {
              stopStream()
              onCancel()
            }}
            onUpload={async (file) => {
              const supabase = getSupabase()
              if (!supabase) {
                setError('Not configured')
                return
              }
              setUploading(true)
              setError(null)
              try {
                const compressed = await compressImageUnder1MB(file)
                const { error: err } = await uploadSecurityDoc(supabase, {
                  loadId,
                  driverId,
                  file: compressed,
                  type: type as SecurityDocType,
                })
                if (err) throw err
                stopStream()
                onSuccess()
              } catch (e) {
                setError(e instanceof Error ? e.message : 'Upload failed')
              } finally {
                setUploading(false)
              }
            }}
            capturedFile={capturedFile}
            uploading={uploading}
            error={error}
          />
        )
      }}
    </CameraAccess>
  )
}

function DocScannerView({
  stream,
  loadId,
  driverId,
  type,
  torchOn,
  setTorchOn,
  onCapture,
  onRetake,
  onCancel,
  onUpload,
  capturedFile,
  uploading,
  error,
}: {
  stream: MediaStream
  loadId: string
  driverId: string
  type: DocKind
  torchOn: boolean
  setTorchOn: (v: boolean) => void
  onCapture: (file: File) => void
  onRetake: () => void
  onCancel: () => void
  onUpload: (file: File) => Promise<void>
  capturedFile: File | null
  uploading: boolean
  error: string | null
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream
  }, [stream])

  const toggleTorch = useCallback(() => {
    const track = stream.getVideoTracks()[0]
    if (!track || !('getCapabilities' in track)) return
    const caps = track.getCapabilities() as { torch?: boolean }
    if (!caps.torch) return
    const next = !torchOn
    track.applyConstraints(
      { advanced: [{ torch: next }] } as unknown as MediaTrackConstraints
    )
      .then(() => setTorchOn(next))
      .catch(() => {})
  }, [stream, torchOn])

  const handleCapture = useCallback(() => {
    const video = videoRef.current
    if (!video || video.readyState < 2) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `${type}-${Date.now()}.jpg`, { type: 'image/jpeg' })
          onCapture(file)
        }
      },
      'image/jpeg',
      0.9
    )
  }, [onCapture, type])

  const docLabel = type === 'cdl' ? 'CDL' : 'BOL'

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
        {/* Rectangular guide */}
        <div className="absolute left-1/2 top-1/2 h-3/4 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border-4 border-[#C1FF00] bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
        <div className="absolute right-3 top-3">
          <button
            type="button"
            onClick={toggleTorch}
            className="rounded-lg border border-iron-600 bg-iron-900/90 p-2 text-white"
            title="Flash / Torch"
          >
            {torchOn ? <ZapOff className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {!capturedFile ? (
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 rounded-lg border border-iron-600 py-2 text-sm text-iron-400">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCapture}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#C1FF00] py-2 font-semibold text-iron-950"
          >
            <Camera className="h-4 w-4" />
            Capture {docLabel}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-center text-xs text-[#C1FF00]">Image captured. Upload to iron-vault (under 1MB).</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onRetake}
              className="rounded-lg border border-iron-600 py-2 text-sm text-iron-400"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={() => onUpload(capturedFile)}
              disabled={uploading}
              className="flex-1 rounded-xl bg-[#C1FF00] py-2 font-semibold text-iron-950 disabled:opacity-60"
            >
              {uploading ? 'Uploading…' : `Upload ${docLabel}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
