/**
 * IronFreight email design system – Security-First, Zero-Trust.
 * Colors aligned with site (tailwind: background #0A0A0B, surface #1A1A1A, primary #C1FF00).
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const _dir = dirname(fileURLToPath(import.meta.url))

export const EMAIL = {
  /** Neon lime – primary CTA and accents (site primary) */
  BRAND: '#C1FF00',
  /** Matte black – main background (site background) */
  BG_DARK: '#0A0A0B',
  /** Surface – cards/sections (site surface) */
  BG_CARD: '#1A1A1A',
  /** Primary text */
  TEXT: '#F9FAFB',
  /** Secondary / muted text */
  TEXT_MUTED: '#A3A3A3',
  /** Borders and dividers (site divider) */
  BORDER: '#333333',
  /** CTA button text (on lime) */
  CTA_TEXT: '#0A0A0B',
} as const

/** Production domain for emails (logo, links). Never use localhost in sent emails. */
const PRODUCTION_SITE = 'https://getironfreight.com'

/** Base URL for absolute links (logo, etc.). Prefer NEXT_PUBLIC_SITE_URL, then VERCEL_URL; in production never use localhost. */
export function getLogoUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    (typeof process !== 'undefined' && process.env.NODE_ENV === 'production' ? PRODUCTION_SITE : 'http://localhost:3000')
  return `${base.replace(/\/$/, '')}/icons/icon-192.png`
}

/** Inline logo as base64 data URL so it displays in email without external fetch (avoids broken image in Outlook). */
export function getLogoDataUrl(): string {
  const cwd = typeof process !== 'undefined' ? process.cwd() : ''
  const candidates = cwd
    ? [
        join(cwd, 'public', 'icons', 'icon-192.png'),
        join(_dir, '..', '..', '..', 'public', 'icons', 'icon-192.png'),
      ]
    : []
  for (const logoPath of candidates) {
    if (existsSync(logoPath)) {
      try {
        const buffer = readFileSync(logoPath)
        return `data:image/png;base64,${buffer.toString('base64')}`
      } catch {
        break
      }
    }
  }
  return getLogoUrl()
}

/** Inline SVG shield icon for email (fallback when image is blocked) */
export const SHIELD_ICON_SVG =
  '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="' +
  EMAIL.BRAND +
  '"/><path d="M9 12l2 2 4-4" stroke="' +
  EMAIL.CTA_TEXT +
  '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
