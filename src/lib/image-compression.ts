/**
 * Client-side image compression for CDL and BOL uploads.
 * Downscales to max 1200px width and 80% quality for fast uploads on 3G/LTE at remote warehouses.
 *
 * Usage before uploading to Supabase Storage:
 *   const file = e.target.files?.[0]
 *   if (file) {
 *     const compressed = await compressImageForUpload(file)
 *     await supabase.storage.from('bucket').upload(path, compressed, { ... })
 *   }
 */
import imageCompression from 'browser-image-compression'

const MAX_WIDTH = 1200
const MAX_QUALITY = 0.8

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

/** Returns true if the file is an image we can compress. */
export function isCompressibleImage(file: File): boolean {
  return IMAGE_TYPES.has(file.type?.toLowerCase() ?? '')
}

/**
 * Compress an image for upload (CDL, BOL, or any document photo).
 * - Max width: 1200px (aspect ratio preserved)
 * - Quality: 80%
 * Non-image files are returned unchanged.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!isCompressibleImage(file)) return file

  const options = {
    maxWidthOrHeight: MAX_WIDTH,
    useWebWorker: true,
    initialQuality: MAX_QUALITY,
    maxIteration: 10,
    fileType: file.type || undefined,
  }

  try {
    const compressed = await imageCompression(file, options)
    return compressed
  } catch {
    return file
  }
}

/** Max size 1MB for security docs (CDL/BOL) before upload to iron-vault. */
const MAX_SIZE_MB = 1

/**
 * Compress image to under 1MB for iron-vault uploads (driver CDL/BOL).
 * Use before uploadSecurityDoc when uploading from DocumentScanner.
 */
export async function compressImageUnder1MB(file: File): Promise<File> {
  if (!isCompressibleImage(file)) return file
  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: MAX_SIZE_MB,
      maxWidthOrHeight: 1200,
      useWebWorker: true,
      initialQuality: 0.8,
      maxIteration: 15,
      fileType: file.type || undefined,
    })
    return compressed
  } catch {
    return file
  }
}
