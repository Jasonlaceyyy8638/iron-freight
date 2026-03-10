/**
 * Converts public/icons/icon-192.png to icon-192.ico for the Windows build.
 * Run from desktop/: npm run ico
 */
const path = require('path')
const fs = require('fs')
const pngToIco = require('png-to-ico').default

const projectRoot = path.resolve(__dirname, '../..')
const desktopDir = path.resolve(__dirname, '..')
const pngPath = path.join(projectRoot, 'public', 'icons', 'icon-192.png')
const icoPath = path.join(projectRoot, 'public', 'icons', 'icon-192.ico')
const buildIcoPath = path.join(desktopDir, 'build', 'icon.ico')

async function main() {
  if (!fs.existsSync(pngPath)) {
    console.error('Missing:', pngPath)
    process.exit(1)
  }
  const buf = await pngToIco(pngPath)
  fs.writeFileSync(icoPath, buf)
  console.log('Written:', icoPath)
  fs.mkdirSync(path.dirname(buildIcoPath), { recursive: true })
  fs.writeFileSync(buildIcoPath, buf)
  console.log('Written:', buildIcoPath)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
