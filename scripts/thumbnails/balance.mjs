import { createRequire } from 'node:module'
const repo = process.argv[2]
const require = createRequire(`${repo}/package.json`)
const sharp = require('sharp')
const W = 2000, H = 1333
// Open space at 1440px wide (fractions of card height): year line bottom → headline top
const BAND = { top: 0.103, bottom: 0.739 }
const BAND_TWO_LINE = { top: 0.103, bottom: 0.647 } // Bespoke's title wraps to two lines
const GAP = 0.085      // breathing room above and below each subject, same for every card
const GAP_BELOW = 0.05  // space between the subject and the headline (~30px on a 612px card)

const cards = {
  'amica-design-system/amica-design-system-subject-32.png': { band: BAND, maxH: 0.19, center: 0.5 }, // a mark, not a product shot: centered in the frame
  'bespoke-design-studio/bespoke-design-studio-subject-32.png': { band: BAND_TWO_LINE, gap: 0.07 },
  'myfrontier-app/myfrontier-app-subject-32.png': { band: BAND },
  'samsung-redesign/samsung-redesign-subject-32.png': { band: BAND },
  'cvs-redesign/cvs-redesign-subject-32.png': { band: BAND },
}
const result = {}
for (const [f, cfg] of Object.entries(cards)) {
  const path = `${repo}/src/assets/work/${f}`
  const src = await sharp(path).ensureAlpha().toBuffer()
  const { data } = await sharp(src).raw().toBuffer({ resolveWithObject: true })
  let x0 = W, x1 = 0, y0 = H, y1 = 0
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (data[(y * W + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y }
  const gap = cfg.gap ?? GAP
  const bandH = cfg.band.bottom - cfg.band.top
  const targetH = Math.min(cfg.maxH ?? Infinity, bandH - 2 * gap) * H
  const s = cfg.maxH ? 1 : targetH / (y1 - y0 + 1)
  const piece = await sharp(src).extract({ left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 })
    .resize(Math.round((x1 - x0 + 1) * s), Math.round((y1 - y0 + 1) * s)).png().toBuffer()
  const pm = await sharp(piece).metadata()
  // Anchor to the headline: a fixed gap below the subject, the remaining room above it
  const cy = cfg.center != null ? cfg.center * H : (cfg.band.bottom - GAP_BELOW) * H - pm.height / 2
  const left = Math.round(W / 2 - pm.width / 2), top = Math.round(cy - pm.height / 2)
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: piece, left, top }]).png({ compressionLevel: 9 }).toFile(path)
  // Hero offset: move the subject from this center to the frame's center
  result[f.split('/')[0]] = { scale: +s.toFixed(3), center: +(cy / H).toFixed(3), heroOffset: +(0.5 - cy / H).toFixed(3), width: +(pm.width / W).toFixed(2) }
}
console.log(JSON.stringify(result, null, 1))
