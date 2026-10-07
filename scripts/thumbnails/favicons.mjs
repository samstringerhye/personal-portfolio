import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
const repo = process.argv[2]
const require = createRequire(`${repo}/package.json`)
const sharp = require('sharp')
const svg = readFileSync(`${repo}/public/favicon.svg`)
const BG = '#EFF4F5' // site background (ref.color.neutral.50)

// Transparent square render of the mark
const mark = (size) => sharp(svg, { density: 1200 }).resize(size, size).png().toBuffer()

// Mark centered on the site background with padding, for home-screen icons
async function padded(size, padRatio) {
  const inner = Math.round(size * (1 - padRatio * 2))
  const art = await mark(inner)
  return sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: art, gravity: 'center' }]).png().toBuffer()
}

// ICO container holding a single PNG image (supported by all current browsers)
function pngToIco(png, size) {
  const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4)
  const entry = Buffer.alloc(16)
  entry.writeUInt8(size >= 256 ? 0 : size, 0); entry.writeUInt8(size >= 256 ? 0 : size, 1)
  entry.writeUInt8(0, 2); entry.writeUInt8(0, 3); entry.writeUInt16LE(1, 4); entry.writeUInt16LE(32, 6)
  entry.writeUInt32LE(png.length, 8); entry.writeUInt32LE(22, 12)
  return Buffer.concat([header, entry, png])
}

writeFileSync(`${repo}/public/favicon.ico`, pngToIco(await mark(32), 32))
writeFileSync(`${repo}/public/apple-touch-icon.png`, await padded(180, 0.16))
writeFileSync(`${repo}/public/icon-192.png`, await padded(192, 0.16))
writeFileSync(`${repo}/public/icon-512.png`, await padded(512, 0.16))
console.log('done')
