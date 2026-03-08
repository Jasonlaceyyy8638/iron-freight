/**
 * IronFreight email design system – Security-First, Zero-Trust.
 */

export const EMAIL = {
  /** Neon lime – primary CTA and accents */
  BRAND: '#C1FF00',
  /** Dark slate – main background */
  BG_DARK: '#0f1419',
  /** Slightly lighter slate for cards/sections */
  BG_CARD: '#1a1f26',
  /** Primary text */
  TEXT: '#F9FAFB',
  /** Secondary / muted text */
  TEXT_MUTED: '#94a3b8',
  /** Borders and dividers */
  BORDER: '#334155',
  /** CTA button text (on lime) */
  CTA_TEXT: '#0f1419',
} as const

/** Inline SVG shield icon for email (no external assets) */
export const SHIELD_ICON_SVG =
  '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="' +
  EMAIL.BRAND +
  '"/><path d="M9 12l2 2 4-4" stroke="' +
  EMAIL.CTA_TEXT +
  '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
