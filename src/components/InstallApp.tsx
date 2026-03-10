'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

type InstallPrompt = { prompt: () => Promise<{ outcome: string }> }

/** Hook: capture beforeinstallprompt and whether app is already installed. */
export function useInstallApp() {
  const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt({ prompt: () => (e as unknown as InstallPrompt).prompt() })
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    if (isStandalone) setInstalled(true)

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  return { installPrompt, installed }
}

/** Button that shows when the app is installable; triggers the browser install flow (like Cursor/Chrome). */
export function InstallAppButton({
  variant = 'default',
  className = '',
}: {
  variant?: 'default' | 'outline'
  className?: string
}) {
  const { installPrompt, installed } = useInstallApp()
  const [loading, setLoading] = useState(false)

  const handleInstall = async () => {
    if (!installPrompt) return
    setLoading(true)
    try {
      await installPrompt.prompt()
    } finally {
      setLoading(false)
    }
  }

  if (installed || !installPrompt) return null

  const base = 'inline-flex items-center gap-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background'
  const styles =
    variant === 'outline'
      ? 'border border-primary/50 bg-primary/10 px-4 py-2 text-sm text-primary hover:bg-primary/20'
      : 'bg-primary px-4 py-2 text-sm text-black hover:bg-primary/90'

  return (
    <button
      type="button"
      onClick={handleInstall}
      disabled={loading}
      className={`${base} ${styles} ${className}`}
      aria-label="Download IronFreight for desktop"
    >
      <Download className="h-4 w-4 shrink-0" />
      {loading ? 'Opening…' : 'Download for desktop'}
    </button>
  )
}
