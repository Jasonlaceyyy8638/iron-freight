import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export const LOGO_CONTENT_ID = 'ironfreight-logo'

/** Read logo from public/icons/icon-192.png for inline (CID) attachment so it shows in Outlook and when images are blocked. */
export function readLogoBuffer(): Buffer | null {
  const cwd = process.cwd()
  const candidates = [
    join(cwd, 'public', 'icons', 'icon-192.png'),
    join(cwd, '..', 'public', 'icons', 'icon-192.png'),
  ]
  for (const p of candidates) {
    if (existsSync(p)) {
      try {
        return readFileSync(p)
      } catch {
        break
      }
    }
  }
  return null
}

export type LogoAttachment = {
  content: string
  filename: string
  type: string
  disposition: 'inline'
  content_id: string
}

/** Use this when sending any email that uses buildEmailLayout so the logo shows in all clients. */
export function getLogoAttachment(): { attachment: LogoAttachment; logoSrc: string } | null {
  const buffer = readLogoBuffer()
  if (!buffer) return null
  return {
    attachment: {
      content: buffer.toString('base64'),
      filename: 'icon-192.png',
      type: 'image/png',
      disposition: 'inline',
      content_id: LOGO_CONTENT_ID,
    },
    logoSrc: `cid:${LOGO_CONTENT_ID}`,
  }
}
