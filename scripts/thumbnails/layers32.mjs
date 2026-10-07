import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
const repo = process.argv[2]
const require = createRequire(`${repo}/package.json`)
const sharp = require('sharp')
const W = 2000, H = Math.round(2000 * 2 / 3)
const A = (p) => `${repo}/src/assets/work/${p}`
// Same zones as the flat 3:2 composites, so the layered card matches at rest
const R = { x0: 0.08 * W, x1: 0.92 * W, y0: 0.20 * H, y1: 0.66 * H }

// Signed distance inside a rounded rect (positive = inside), for a soft 1.5px edge
const rrectDepth = (x, y, r) => {
  const rad = r.r || 0
  const cx = Math.max(r.x0 + rad, Math.min(x, r.x1 - rad)), cy = Math.max(r.y0 + rad, Math.min(y, r.y1 - rad))
  if (x >= r.x0 + rad && x <= r.x1 - rad) return Math.min(y - r.y0, r.y1 - y)
  if (y >= r.y0 + rad && y <= r.y1 - rad) return Math.min(x - r.x0, r.x1 - x)
  return rad - Math.hypot(x - cx, y - cy)
}

// Keep only the device bodies (solid rounded rects, soft 1.5px edge). Shadows are dropped here and
// drawn in CSS instead, so they move with the tilt. `darkKeep` regions keep only dark pixels
// (e.g. a stylus) with alpha from how dark they are.
async function cutout(srcBuf, solids, darkKeep = []) {
  const { data, info } = await sharp(srcBuf).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const out = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, p = [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]]
    let a = 0
    for (const r of solids) a = Math.max(a, Math.min(1, Math.max(0, rrectDepth(x, y, r) / 1.5 + 0.5)))
    for (const r of darkKeep) {
      if (x < r.x0 || x > r.x1 || y < r.y0 || y > r.y1) continue
      const lum = (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) / 255
      a = Math.max(a, Math.min(1, Math.max(0, (r.light - lum) / (r.light - r.dark))))
    }
    out.set([...p, Math.round(a * 255)], i * 4)
  }
  return { buf: await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer(), w, h }
}

// Background model: per row, blend the left and right edge colors across the width
async function edgeModel(srcBuf) {
  const { data, info } = await sharp(srcBuf).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const avg = (y, x0) => { const s = [0, 0, 0]; for (let x = x0; x < x0 + 24; x++) for (let c = 0; c < 3; c++) s[c] += data[(y * w + x) * 3 + c]; return s.map(v => v / 24) }
  const L = Array.from({ length: h }, (_, y) => avg(y, 0)), Rt = Array.from({ length: h }, (_, y) => avg(y, w - 24))
  return (x, y) => { const t = x / (w - 1); return L[y].map((v, c) => v + (Rt[y][c] - v) * t) }
}

// Place a cutout on a transparent 3:2 canvas exactly as the flat composite placed it
async function place(cut, bbox, zone, out, margin = 160) {
  const cx0 = Math.max(0, bbox.x0 - margin), cx1 = Math.min(cut.w, bbox.x1 + margin)
  const cy0 = Math.max(0, bbox.y0 - margin), cy1 = Math.min(cut.h, bbox.y1 + margin)
  const s = Math.min((zone.x1 - zone.x0) / (bbox.x1 - bbox.x0), (zone.y1 - zone.y0) / (bbox.y1 - bbox.y0))
  const piece = await sharp(cut.buf).extract({ left: cx0, top: cy0, width: cx1 - cx0, height: cy1 - cy0 }).resize(Math.round((cx1 - cx0) * s), Math.round((cy1 - cy0) * s)).png().toBuffer()
  const left = Math.round((zone.x0 + zone.x1) / 2 - ((bbox.x0 + bbox.x1) / 2 - cx0) * s)
  const top = Math.round((zone.y0 + zone.y1) / 2 - ((bbox.y0 + bbox.y1) / 2 - cy0) * s)
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: piece, left, top }]).png({ compressionLevel: 9 }).toFile(out)
  console.log(out.split('/').pop(), 'scale', s.toFixed(2))
}

// Bespoke: iPad and iPhone bodies are solid; vignetted blue-grey background modeled from both edges
{
  const buf = readFileSync(A('bespoke-design-studio/bespoke-design-studio-thumbnail.jpeg'))
  const cut = await cutout(buf, [
    { x0: 674, x1: 1685, y0: 234, y1: 1005, r: 37 },
    { x0: 1545, x1: 1830, y0: 426, y1: 1018, r: 42 },
  ])
  await place(cut, { x0: 550, x1: 1825, y0: 238, y1: 1026 }, { ...R, y0: 0.15 * H, y1: 0.60 * H }, A('bespoke-design-studio/bespoke-design-studio-subject-32.png'))
}

// Samsung.com: laptop and phone bodies solid; the S Pen and shadows come through color-to-alpha
{
  const buf = readFileSync(A('samsung-redesign/samsung-redesign-carousel.jpeg'))
  const cut = await cutout(buf, [
    { x0: 732, x1: 1830, y0: 259, y1: 976, r: 14 },
    { x0: 582, x1: 857, y0: 420, y1: 1022, r: 25 },
  ], [{ x0: 1600, x1: 2015, y0: 935, y1: 1020, dark: 0.25, light: 0.55 }]) // S Pen
  await place(cut, { x0: 500, x1: 2025, y0: 250, y1: 1075 }, { ...R, y0: 0.18 * H, y1: 0.69 * H }, A('samsung-redesign/samsung-redesign-subject-32.png'))
}

// CVS: checkmark removed first (as in the flat composite), then keyed against flat CVS blue
{
  const src = A('cvs-redesign/cvs-redesign-thumbnail.jpeg')
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const BLUE = [9, 165, 229]
  const devices = [{ x0: 488, x1: 774, y0: 468, y1: 1038 }, { x0: 899, x1: 1886, y0: 262, y1: 942 }, { x0: 778, x1: 2002, y0: 924, y1: 986 }]
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (devices.some(r => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1)) continue
    const i = (y * info.width + x) * 3
    if (data[i] > BLUE[0] + 8) { data[i] = BLUE[0]; data[i + 1] = BLUE[1]; data[i + 2] = BLUE[2] }
  }
  const clean = await sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toBuffer()
  const cut = await cutout(clean, [
    { x0: 496, x1: 765, y0: 475, y1: 1034, r: 34 },
    { x0: 902, x1: 1883, y0: 265, y1: 939, r: 26 },
    { x0: 789, x1: 1995, y0: 939, y1: 981, r: 10 },
  ])
  await place(cut, { x0: 496, x1: 1994, y0: 262, y1: 1031 }, R, A('cvs-redesign/cvs-redesign-subject-32.png'), 120)
}

// MyFrontier: phones are already transparent
{
  const phones = await sharp(A('myfrontier-app/frontier-dashboard.png')).trim().png().toBuffer()
  const pm = await sharp(phones).metadata()
  const RF = { ...R, y0: 0.17 * H, y1: 0.65 * H }
  const s = Math.min((RF.x1 - RF.x0) / pm.width, (RF.y1 - RF.y0) / pm.height)
  const pw = Math.round(pm.width * s), ph = Math.round(pm.height * s)
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: await sharp(phones).resize(pw, ph).png().toBuffer(), left: Math.round((RF.x0 + RF.x1) / 2 - pw / 2), top: Math.round((RF.y0 + RF.y1) / 2 - ph / 2) }])
    .png({ compressionLevel: 9 }).toFile(A('myfrontier-app/myfrontier-app-subject-32.png'))
  console.log('myfrontier-app-subject-32.png')
}

// Amica: white logo, centered
{
  const LOGO_W = 900
  let svg = readFileSync(`${repo}/public/_protected-embeds/amica-prototype/icons/amica-logo.svg`, 'utf8')
  const vb = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number)
  const logoH = Math.round(LOGO_W * vb[3] / vb[2])
  svg = svg.replace(/<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" width="${LOGO_W}" height="${logoH}" viewBox="${vb.join(' ')}" fill="none">`).replace(/var\(--fill-0,\s*white\)/g, '#FFFFFF')
  const logo = await sharp(Buffer.from(svg), { density: 600 }).resize(LOGO_W, logoH).png().toBuffer()
  await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: logo, gravity: 'center' }]).png({ compressionLevel: 9 }).toFile(A('amica-design-system/amica-design-system-subject-32.png'))
  console.log('amica-design-system-subject-32.png')
}
