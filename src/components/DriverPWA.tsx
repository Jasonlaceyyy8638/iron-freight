'use client'

import { useEffect, useState } from 'react'

/** Injects PWA meta/link for driver app and registers service worker. */
export function DriverPWA() {
  const [installPrompt, setInstallPrompt] = useState<{ prompt: () => Promise<void> } | null>(null)
  const [installed, setInstalled] = useState(false)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    // Theme for driver area (root layout already has site manifest)
    let themeMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
    if (!themeMeta) {
      themeMeta = document.createElement('meta')
      themeMeta.name = 'theme-color'
      document.head.appendChild(themeMeta)
    }
    themeMeta.content = '#C1FF00'

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then(() => {})
        .catch(() => {})
    }

    // Capture install prompt (beforeinstallprompt)
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt({ prompt: () => (e as unknown as { prompt: () => Promise<void> }).prompt() })
      setShowInstallBanner(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    // Detect if already installed (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as { standalone?: boolean }).standalone === true
    if (isStandalone) setInstalled(true)

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    setShowInstallBanner(false)
    setInstallPrompt(null)
  }

  if (!showInstallBanner || installed || !installPrompt) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-iron-700 bg-iron-900 p-4 shadow-lg">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
        <p className="text-sm text-iron-200">
          Install <strong>IronFreight Driver</strong> for quick access from your home screen.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setShowInstallBanner(false)}
            className="rounded-lg px-3 py-1.5 text-sm text-iron-400 hover:bg-iron-800"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-lg bg-[#C1FF00] px-3 py-1.5 text-sm font-medium text-iron-950 hover:bg-[#a8e600]"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}
