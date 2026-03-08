'use client'

import { useState, useCallback } from 'react'
import { Copy } from 'lucide-react'
import { SUPABASE_MIGRATIONS } from '@/content/supabaseMigrations'

export function SchemaSidebar() {
  const [copied, setCopied] = useState(false)

  const copyAll = useCallback(() => {
    navigator.clipboard.writeText(SUPABASE_MIGRATIONS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <aside className="flex h-full w-full max-w-md flex-shrink-0 flex-col border-r border-divider bg-surface">
      <div className="flex items-center justify-between border-b border-divider px-3 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
          Supabase migrations
        </span>
        <button
          type="button"
          onClick={copyAll}
          className="inline-flex items-center gap-1.5 rounded bg-primary/20 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/15"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? 'Copied' : 'Copy all'}
        </button>
      </div>
      <pre className="flex-1 overflow-auto p-3 text-[11px] leading-relaxed text-white/80 whitespace-pre font-mono">
        {SUPABASE_MIGRATIONS}
      </pre>
      <p className="border-t border-divider px-3 py-2 text-xs text-white/50">
        Paste into Supabase Dashboard → SQL Editor → Run
      </p>
    </aside>
  )
}
