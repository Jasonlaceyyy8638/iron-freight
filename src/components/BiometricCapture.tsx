'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { CameraAccess } from '@/components/CameraAccess'
import { VerificationLoader } from '@/components/VerificationLoader'
import { Camera } from 'lucide-react'
import { compressImageUnder1MB } from '@/lib/image-compression'
import { uploadSecurityDoc } from '@/lib/uploadSecurityDoc'
import { getSupabase } from '@/lib/supabase/client'

type Step = 'align' | 'hold' | 'capturing'

const INSTRUCTIONS: Record<Step, string> = {
  align: 'Align your face within the oval',
  hold: 'Hold still...',
  capturing: 'Capturing...',
}

function SelfieView({
  stream,
  loadId,
  driverId,
  onCapture,
  onCancel,
}: {
  stream: MediaStream
  loadId: string
  driverId: string
  onCapture: (file: File) => void
  onCancel: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [step, setStep] = useState<Step>('align')
  const [capturing, setCapturing] = useState(false)

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream
  }, [stream])

  useEffect(() => {
    const t = setTimeout(() => setStep('hold'), 2000)
    return () => clearTimeout(t)
  }, [])

  const handleCapture = useCallback(() => {
    const video = videoRef.current
    if (!video || video.readyState < 2 || capturing) return
    setStep('capturing')
    setCapturing(true)
    requestAnimationFrame(() => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setCapturing(false)
        setStep('align')
        return
      }
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(video, -video.videoWidth, 0, video.videoWidth, video.videoHeight)
      ctx.restore()
      canvas.toBlob(
        async (blob) => {
          if (blob) {
            const file = new File([blob], `biometric-${Date.now()}.jpg`, { type: 'image/jpeg' })
            onCapture(file)
          }
          setCapturing(false)
          setStep('align')
        },
        'image/jpeg',
        0.92
      )
    })
  }, [onCapture, capturing])

  return (
    <div className="relative aspect-[3/4] max-h-[420px] w-full overflow-hidden rounded-xl bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />
      {/* Neon Lime oval overlay */}
      <div
        className="absolute left-1/2 top-1/2 flex h-48 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-[#C1FF00] bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"
        style={{ borderRadius: '50%' }}
      >
        <span className="sr-only">Face alignment guide</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-8">
        <p className="text-center text-sm font-medium text-white" aria-live="polite">
          {INSTRUCTIONS[step]}
        </p>
        <div className="mt-3 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-iron-500 px-4 py-2 text-sm text-iron-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={capturing}
            className="flex items-center gap-2 rounded-lg bg-[#C1FF00] px-4 py-2 text-sm font-semibold text-iron-950 disabled:opacity-60"
          >
            <Camera className="h-4 w-4" />
            {capturing ? 'Capturing...' : 'Capture'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function BiometricCapture({
  loadId,
  driverId,
  onSuccess,
  onCancel,
}: {
  loadId: string
  driverId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const [verificationImageUrl, setVerificationImageUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleCapture = useCallback(
    async (file: File) => {
      const url = URL.createObjectURL(file)
      setVerificationImageUrl(url)
      setIsUploading(true)
      const supabase = getSupabase()
      if (!supabase) {
        URL.revokeObjectURL(url)
        setVerificationImageUrl(null)
        setIsUploading(false)
        onCancel()
        return
      }
      const compressed = await compressImageUnder1MB(file)
      const { error } = await uploadSecurityDoc(supabase, {
        loadId,
        driverId,
        file: compressed,
        type: 'biometric',
      })
      setIsUploading(false)
      if (error) {
        URL.revokeObjectURL(url)
        setVerificationImageUrl(null)
        onCancel()
      }
    },
    [loadId, driverId, onCancel]
  )

  const handleVerificationComplete = useCallback(() => {
    if (verificationImageUrl) URL.revokeObjectURL(verificationImageUrl)
    setVerificationImageUrl(null)
    onSuccess()
  }, [verificationImageUrl, onSuccess])

  if (verificationImageUrl) {
    return (
      <VerificationLoader
        imageUrl={verificationImageUrl}
        isUploading={isUploading}
        onComplete={handleVerificationComplete}
      />
    )
  }

  return (
    <CameraAccess facingMode="user">
      {({ stream, requestAccess, stopStream }) => {
        if (!stream) {
          return (
            <div className="space-y-3">
              <p className="text-sm text-iron-400">
                Front-facing camera required for identity verification. No selfie is stored on your device.
              </p>
              <button
                type="button"
                onClick={requestAccess}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C1FF00] py-3 font-semibold text-iron-950"
              >
                <Camera className="h-5 w-5" />
                Start biometric capture
              </button>
            </div>
          )
        }
        return (
          <SelfieView
            stream={stream}
            loadId={loadId}
            driverId={driverId}
            onCapture={(file) => {
              stopStream()
              handleCapture(file)
            }}
            onCancel={() => {
              stopStream()
              onCancel()
            }}
          />
        )
      }}
    </CameraAccess>
  )
}
