'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Camera, RefreshCw, AlertCircle } from 'lucide-react'

export type CameraFacingMode = 'user' | 'environment'

type CameraStatus = 'idle' | 'checking' | 'granted' | 'denied' | 'unsupported'

const MODAL_MESSAGE =
  'IronFreight requires camera access for Biometric Identity Verification and QR Scanning. Without this, the driver cannot start the load.'

const CAMERA_INSTRUCTIONS = (
  <div className="space-y-4 text-left text-sm text-[#A3A3A3]">
    <p className="font-medium text-[#F9FAFB]">Allow camera for getironfreight.com</p>
    <p>Without camera access, the driver cannot start the load. Follow the steps below for your browser.</p>
    <div>
      <p className="mb-1 font-semibold text-[#C1FF00]">Safari (iPhone/iPad)</p>
      <ol className="list-decimal list-inside space-y-1">
        <li>Open <strong className="text-[#F9FAFB]">Settings</strong></li>
        <li>Scroll to <strong className="text-[#F9FAFB]">Safari</strong> → tap it</li>
        <li>Under &quot;Settings for Websites,&quot; tap <strong className="text-[#F9FAFB]">Camera</strong></li>
        <li>Find <strong className="text-[#F9FAFB]">getironfreight.com</strong> and set to <strong className="text-[#F9FAFB]">Allow</strong></li>
        <li>Return to Safari and reload the page</li>
      </ol>
    </div>
    <div>
      <p className="mb-1 font-semibold text-[#C1FF00]">Chrome (Android)</p>
      <ol className="list-decimal list-inside space-y-1">
        <li>Tap the <strong className="text-[#F9FAFB]">lock</strong> or <strong className="text-[#F9FAFB]">info</strong> icon in the address bar</li>
        <li>Tap <strong className="text-[#F9FAFB]">Site settings</strong> or <strong className="text-[#F9FAFB]">Permissions</strong></li>
        <li>Set <strong className="text-[#F9FAFB]">Camera</strong> to <strong className="text-[#F9FAFB]">Allow</strong></li>
        <li>Reload the page</li>
      </ol>
    </div>
    <div>
      <p className="mb-1 font-semibold text-[#C1FF00]">Chrome (Desktop)</p>
      <ol className="list-decimal list-inside space-y-1">
        <li>Click the <strong className="text-[#F9FAFB]">lock</strong> icon left of the URL</li>
        <li>Click <strong className="text-[#F9FAFB]">Site settings</strong></li>
        <li>Set <strong className="text-[#F9FAFB]">Camera</strong> to <strong className="text-[#F9FAFB]">Allow</strong></li>
        <li>Reload the page</li>
      </ol>
    </div>
  </div>
)

function isMediaDevicesAvailable(): boolean {
  if (typeof navigator === 'undefined') return false
  return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function')
}

interface CameraAccessProps {
  /** 'environment' = back camera (QR scanning); 'user' = front camera (biometric selfie) */
  facingMode: CameraFacingMode
  /** Called when permission is granted with the video stream. Caller must stop the stream when done. */
  onReady?: (stream: MediaStream) => void
  /** Called when permission is denied or camera unsupported */
  onDenied?: () => void
  /** If true, request camera as soon as component mounts (e.g. for scanner view). If false, caller triggers via requestAccess(). */
  requestOnMount?: boolean
  children: (props: {
    stream: MediaStream | null
    status: CameraStatus
    requestAccess: () => Promise<void>
    stopStream: () => void
  }) => React.ReactNode
}

export function CameraAccess({
  facingMode,
  onReady,
  onDenied,
  requestOnMount = false,
  children,
}: CameraAccessProps) {
  const [status, setStatus] = useState<CameraStatus>('idle')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      setStream(null)
    }
  }, [])

  const requestAccess = useCallback(async () => {
    if (!isMediaDevicesAvailable()) {
      setStatus('unsupported')
      onDenied?.()
      return
    }
    setStatus('checking')
    stopStream()
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode === 'user' ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      streamRef.current = mediaStream
      setStream(mediaStream)
      setStatus('granted')
      onReady?.(mediaStream)
    } catch (err) {
      const isDenied =
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')
      setStatus(isDenied ? 'denied' : 'unsupported')
      onDenied?.()
    }
  }, [facingMode, onReady, onDenied, stopStream])

  useEffect(() => {
    if (requestOnMount) requestAccess()
    return () => stopStream()
  }, [requestOnMount]) // eslint-disable-line react-hooks/exhaustive-deps

  const [showInstructions, setShowInstructions] = useState(false)
  const showModal = status === 'denied' || status === 'unsupported'

  return (
    <>
      {children({ stream, status, requestAccess, stopStream })}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: '#0A0A0B' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="camera-access-title"
        >
          <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-y-auto rounded-2xl border-2 border-[#C1FF00] bg-[#0A0A0B] p-6 shadow-[0_0_40px_rgba(193,255,0,0.15)]">
            {showInstructions ? (
              <>
                <h2 id="camera-access-title" className="font-display text-lg font-bold text-[#F9FAFB]">
                  How to allow camera
                </h2>
                <div className="mt-4 flex-1 overflow-y-auto">{CAMERA_INSTRUCTIONS}</div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowInstructions(false)}
                    className="rounded-xl bg-[#C1FF00] px-4 py-2.5 font-semibold text-[#0A0A0B] hover:bg-[#a8e600]"
                  >
                    Back
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#C1FF00]/20">
                    {status === 'unsupported' ? (
                      <AlertCircle className="h-6 w-6 text-[#C1FF00]" aria-hidden />
                    ) : (
                      <Camera className="h-6 w-6 text-[#C1FF00]" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2
                      id="camera-access-title"
                      className="font-display text-lg font-bold text-[#F9FAFB]"
                    >
                      {status === 'unsupported'
                        ? 'Camera not available'
                        : 'Camera access required'}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[#A3A3A3]">
                      {status === 'unsupported'
                        ? 'This device or browser does not support camera access. Use a device with a camera and ensure you are on HTTPS.'
                        : MODAL_MESSAGE}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setShowInstructions(true)}
                        className="inline-flex rounded-xl border-2 border-[#C1FF00] bg-[#C1FF00]/10 px-4 py-2.5 text-sm font-semibold text-[#C1FF00] hover:bg-[#C1FF00]/20"
                      >
                        Instructions
                      </button>
                      {status === 'denied' && (
                        <button
                          type="button"
                          onClick={() => {
                            setStatus('idle')
                            requestAccess()
                          }}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#C1FF00] px-4 py-2.5 font-semibold text-[#0A0A0B] hover:bg-[#a8e600] focus:outline-none focus:ring-2 focus:ring-[#C1FF00] focus:ring-offset-2 focus:ring-offset-[#0A0A0B]"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Retry
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setStatus('idle')
                          onDenied?.()
                        }}
                        className="rounded-xl border border-iron-600 px-4 py-2.5 text-sm font-medium text-iron-200 hover:bg-iron-800"
                      >
                        {status === 'denied' ? 'Cancel' : 'Close'}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
