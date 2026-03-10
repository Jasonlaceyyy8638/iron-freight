'use client'

import { useEffect, useRef, useCallback } from 'react'
import jsQR from 'jsqr'

export type IronFreightQRPayload = {
  token: string
}

const IRONFREIGHT_VERIFY_PREFIX = 'ironfreight://verify?'

function parseVerifyUrl(url: string): IronFreightQRPayload | null {
  if (!url.startsWith(IRONFREIGHT_VERIFY_PREFIX)) return null
  const rest = url.slice(IRONFREIGHT_VERIFY_PREFIX.length)
  const params = new URLSearchParams(rest)
  const token = params.get('token')
  if (!token || !token.trim()) return null
  return { token: token.trim() }
}

/**
 * Continuously scans video stream for IronFreight verify QR codes (ironfreight://verify?token=xxx).
 * When found, calls onScan with parsed payload and stops scanning.
 */
export function useQRScanner(
  stream: MediaStream | null,
  scanning: boolean,
  onScan: (payload: IronFreightQRPayload) => void
) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan

  const setVideoRef = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el
    if (el && stream) {
      el.srcObject = stream
    }
  }, [stream])

  const setCanvasRef = useCallback((el: HTMLCanvasElement | null) => {
    canvasRef.current = el
  }, [])

  useEffect(() => {
    if (!stream || !scanning) return
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let running = true
    function tick() {
      if (!running) return
      const v = videoRef.current
      const c = canvasRef.current
      if (!v || !c || !ctx) return
      if (v.readyState === v.HAVE_ENOUGH_DATA) {
        c.width = v.videoWidth
        c.height = v.videoHeight
        ctx.drawImage(v, 0, 0)
        const imageData = ctx.getImageData(0, 0, c.width, c.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code?.data) {
          const payload = parseVerifyUrl(code.data)
          if (payload) {
            onScanRef.current(payload)
            return
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      running = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [stream, scanning])

  return { setVideoRef, setCanvasRef }
}
