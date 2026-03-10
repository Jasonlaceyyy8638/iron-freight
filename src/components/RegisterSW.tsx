'use client'

import { useEffect } from 'react'

/** Registers the PWA service worker so the app is installable from any page. */
export function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).catch(() => {})
  }, [])
  return null
}
