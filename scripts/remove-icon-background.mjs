/**
 * Removes the rounded-square background from public/icons/icon-192.png
 * and writes public/icons/logo-shield.png (shield + I only, transparent).
 * Run: node scripts/remove-icon-background.mjs
 */
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const inputPath = join(root, 'public', 'icons', 'icon-192.png')
const outputPath = join(root, 'public', 'icons', 'logo-shield.png')

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const { width, height, channels } = info
const radius = 24 // corner sample position for box color

// Sample box color from corners (the dark grey rounded square)
function sampleCorner(buf, w, h, ch, cx, cy, size = 12) {
  let r = 0, g = 0, b = 0, n = 0
  for (let dy = -size; dy <= size; dy++) {
    for (let dx = -size; dx <= size; dx++) {
      const x = cx + dx
      const y = cy + dy
      if (x >= 0 && x < w && y >= 0 && y < h) {
        const i = (y * w + x) * ch
        r += buf[i]
        g += buf[i + 1]
        b += buf[i + 2]
        n++
      }
    }
  }
  return n ? { r: r / n, g: g / n, b: b / n } : null
}

const cornerSamples = [
  sampleCorner(data, width, height, channels, radius, radius),
  sampleCorner(data, width, height, channels, width - 1 - radius, radius),
  sampleCorner(data, width, height, channels, radius, height - 1 - radius),
  sampleCorner(data, width, height, channels, width - 1 - radius, height - 1 - radius),
].filter(Boolean)

const bgR = cornerSamples.reduce((a, s) => a + s.r, 0) / cornerSamples.length
const bgG = cornerSamples.reduce((a, s) => a + s.g, 0) / cornerSamples.length
const bgB = cornerSamples.reduce((a, s) => a + s.b, 0) / cornerSamples.length

// Color distance: pixels within this of the box grey get removed (box has grid, slight gradient)
const colorTolerance = 42
function matchesBox(r, g, b) {
  const dr = r - bgR, dg = g - bgG, db = b - bgB
  return Math.sqrt(dr * dr + dg * dg + db * db) <= colorTolerance
}

// Neon green (shield outline and I) – always keep
function isGreenish(r, g, b) {
  return g > 160 && g > r * 1.1 && g > b * 1.1
}

// Bright (silver border, highlights) – keep
function isBright(r, g, b) {
  return (r + g + b) / 3 > 185
}

// Very dark (shield body charcoal / matte black) – keep
function isShieldBody(r, g, b) {
  const L = (r + g + b) / 3
  return L < 42
}

// Definitely part of the shield (keep no matter what)
function isShield(r, g, b) {
  return isGreenish(r, g, b) || isBright(r, g, b) || isShieldBody(r, g, b)
}

// "Box" = matches the rounded square panel and is not part of the shield
function isBoxPixel(r, g, b) {
  return matchesBox(r, g, b) && !isShield(r, g, b)
}

// Build a mask: true = this pixel is box and connected to the image edge (remove it)
const w = width
const h = height
const ch = channels
const toRemove = new Uint8Array(w * h)
for (let i = 0; i < w * h; i++) toRemove[i] = 0

function idx(x, y) {
  return y * w + x
}
function getPixel(x, y) {
  if (x < 0 || x >= w || y < 0 || y >= h) return null
  const i = idx(x, y) * ch
  return { r: data[i], g: data[i + 1], b: data[i + 2] }
}

// Flood fill from all edge pixels: mark every box pixel reachable from the edge
const stack = []
for (let x = 0; x < w; x++) {
  for (const y of [0, h - 1]) {
    const p = getPixel(x, y)
    if (p && isBoxPixel(p.r, p.g, p.b)) {
      toRemove[idx(x, y)] = 1
      stack.push([x, y])
    }
  }
}
for (let y = 0; y < h; y++) {
  for (const x of [0, w - 1]) {
    const p = getPixel(x, y)
    if (p && isBoxPixel(p.r, p.g, p.b)) {
      if (!toRemove[idx(x, y)]) {
        toRemove[idx(x, y)] = 1
        stack.push([x, y])
      }
    }
  }
}
while (stack.length > 0) {
  const [x, y] = stack.pop()
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nx = x + dx
    const ny = y + dy
    if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue
    const k = idx(nx, ny)
    if (toRemove[k]) continue
    const p = getPixel(nx, ny)
    if (p && isBoxPixel(p.r, p.g, p.b)) {
      toRemove[k] = 1
      stack.push([nx, ny])
    }
  }
}

const out = Buffer.from(data)
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * channels
    if (toRemove[idx(x, y)]) {
      out[i + 3] = 0
    }
  }
}

await sharp(out, { raw: { width, height, channels } })
  .png()
  .toFile(outputPath)

console.log('Written:', outputPath)
