'use client'

import { useState, useEffect, useRef } from 'react'
import { Check } from 'lucide-react'

const STATUS_MESSAGES = [
  'Initializing IronGate Protocol...',
  'Analyzing Biometric Geometry...',
  'Cross-Referencing FMCSA Database...',
  'Verifying GPS Chain of Custody...',
  'Finalizing Secure Audit Log...',
]

function triggerHaptic() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(100)
  }
}

export function VerificationLoader({
  imageUrl,
  isUploading,
  onComplete,
}: {
  imageUrl: string
  isUploading: boolean
  onComplete: () => void
}) {
  const [statusIndex, setStatusIndex] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [slideUp, setSlideUp] = useState(false)
  const hasTriggeredSuccess = useRef(false)

  useEffect(() => {
    if (!isUploading) return
    const t = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length)
    }, 1500)
    return () => clearInterval(t)
  }, [isUploading])

  useEffect(() => {
    if (!isUploading && !hasTriggeredSuccess.current) {
      hasTriggeredSuccess.current = true
      setShowSuccess(true)
      triggerHaptic()
      const t = setTimeout(() => {
        setSlideUp(true)
      }, 1200)
      const t2 = setTimeout(() => {
        onComplete()
      }, 1800)
      return () => {
        clearTimeout(t)
        clearTimeout(t2)
      }
    }
  }, [isUploading, onComplete])

  return (
    <div className="relative aspect-[3/4] max-h-[420px] w-full overflow-hidden rounded-xl bg-black">
      {/* Captured selfie */}
      <img
        src={imageUrl}
        alt="Captured verification"
        className="h-full w-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Semi-transparent black overlay */}
      <div className="absolute inset-0 bg-black/60" aria-hidden />

      {/* Scanning line - horizontal neon lime bar (keyframe: scan) */}
      {isUploading && (
        <div
          className="absolute left-0 right-0 h-1 bg-[#C1FF00] opacity-90"
          style={{
            boxShadow: '0 0 20px #C1FF00, inset 0 0 10px #C1FF00',
            animation: 'verification-scan 2s ease-in-out infinite',
          }}
        />
      )}

      {/* Central pulse ring or success checkmark */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        {isUploading ? (
          <div
            className="h-24 w-24 rounded-full border-4 border-[#C1FF00] bg-transparent"
            style={{
              boxShadow: '0 0 20px #C1FF00, inset 0 0 10px #C1FF00',
              animation: 'verification-pulse 1.5s ease-in-out infinite',
            }}
          />
        ) : showSuccess ? (
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-[#C1FF00] bg-[#C1FF00]/20"
            style={{
              boxShadow: '0 0 20px #C1FF00, inset 0 0 10px #C1FF00',
              animation: 'verification-success-check 0.5s ease-out forwards',
            }}
          >
            <Check className="h-12 w-12 text-[#C1FF00]" strokeWidth={3} />
          </div>
        ) : null}
      </div>

      {/* Dynamic status text */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-8">
        <p className="min-h-[2rem] text-center text-sm font-medium text-[#C1FF00]" aria-live="polite">
          {isUploading ? STATUS_MESSAGES[statusIndex] : showSuccess ? 'Verification complete' : ''}
        </p>
      </div>

      {/* Slide-up full-screen transition before redirect */}
      {slideUp && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0A0A0B] text-[#C1FF00]"
          style={{ animation: 'verification-slide-up 0.6s ease-in forwards' }}
        >
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#C1FF00] bg-[#C1FF00]/10"
            style={{ boxShadow: '0 0 20px #C1FF00, inset 0 0 10px #C1FF00' }}
          >
            <Check className="h-10 w-10" strokeWidth={3} />
          </div>
          <p className="mt-4 font-semibold">Redirecting to Load Dashboard...</p>
        </div>
      )}
    </div>
  )
}
