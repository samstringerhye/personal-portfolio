import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
const repo = process.argv[2]
const require = createRequire(`${repo}/package.json`)
const sharp = require('sharp')
const W = 2000, H = Math.round(2000 * 2 / 3) // 3:2
const A = (p) => `${repo}/src/assets/work/${p}`
// Shared subject zone: clear of the year (top-left) and the title/tagline (bottom-left)
const R = { x0: 0.08 * W, x1: 0.92 * W, y0: 0.20 * H, y1: 0.66 * H }

function toRgba(rgb, w, h, alphaAt) {
  const out = Buffer.alloc(w * h * 4)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x
    out[i * 4] = rgb[i * 3]; out[i * 4 + 1] = rgb[i * 3 + 1]; out[i * 4 + 2] = rgb[i * 3 + 2]; out[i * 4 + 3] = alphaAt(x, y)
  }
  return out
}

// Fit the subject bbox (source px) into R, feather the crop edges into a background stretched
// from the strip just left of the crop.
async function fitSubject(srcBuf, bbox, out, padPx = 60, zone = R) {
  const Z = zone
  const meta = await sharp(srcBuf).metadata(), sw = meta.width, sh = meta.height
  const cx0 = Math.max(0, bbox.x0 - padPx), cx1 = Math.min(sw, bbox.x1 + padPx)
  const cy0 = Math.max(0, bbox.y0 - padPx), cy1 = Math.min(sh, bbox.y1 + padPx)
  const bw = bbox.x1 - bbox.x0, bh = bbox.y1 - bbox.y0
  const s = Math.min((Z.x1 - Z.x0) / bw, (Z.y1 - Z.y0) / bh)
  const cw = Math.round((cx1 - cx0) * s), ch = Math.round((cy1 - cy0) * s)
  const crop = await sharp(srcBuf).removeAlpha().extract({ left: cx0, top: cy0, width: cx1 - cx0, height: cy1 - cy0 }).resize(cw, ch).raw().toBuffer()
  const f = Math.max(4, Math.round(padPx * s * 0.9))
  const cut = await sharp(toRgba(crop, cw, ch, (x, y) => Math.round(255 * Math.min(1, x / f, y / f, (cw - 1 - x) / f, (ch - 1 - y) / f))), { raw: { width: cw, height: ch, channels: 4 } }).png().toBuffer()
  // Sample the background a little inside the crop margin so it matches what the fade blends into
  const bg = await sharp(srcBuf).removeAlpha().extract({ left: Math.max(0, cx0 + Math.round(padPx / 4)), top: 0, width: 16, height: sh }).resize(W, H, { fit: 'fill' }).blur(30).toBuffer()
  const left = Math.round((Z.x0 + Z.x1) / 2 - ((bbox.x0 + bbox.x1) / 2 - cx0) * s)
  const top = Math.round((Z.y0 + Z.y1) / 2 - ((bbox.y0 + bbox.y1) / 2 - cy0) * s)
  await sharp(bg).composite([{ input: cut, left, top }]).jpeg({ quality: 90 }).toFile(out)
  console.log(out.split('/').pop(), 'scale', s.toFixed(2))
}

// Bespoke and Samsung.com: subject bounds detected earlier (as fractions of the 2500x1250 source)
// Bespoke's title wraps to two lines, so its zone ends higher; its vignetted background needs a
// wide crop margin so the fade blends the brightness shift gradually.
for (const [src, f, out, pad, zone] of [
  ['bespoke-design-studio/bespoke-design-studio-thumbnail.jpeg', { x0: 0.22, x1: 0.73, y0: 0.19, y1: 0.82 }, 'bespoke-design-studio/bespoke-design-studio-thumbnail-32.jpeg', 180, { ...R, y0: 0.15 * H, y1: 0.60 * H }],
  ['samsung-redesign/samsung-redesign-carousel.jpeg', { x0: 0.20, x1: 0.81, y0: 0.20, y1: 0.86 }, 'samsung-redesign/samsung-redesign-thumbnail-32.jpeg', 60, R],
]) {
  const buf = readFileSync(A(src)); const m = await sharp(buf).metadata()
  await fitSubject(buf, { x0: Math.round(f.x0 * m.width), x1: Math.round(f.x1 * m.width), y0: Math.round(f.y0 * m.height), y1: Math.round(f.y1 * m.height) }, A(out), pad, zone)
}

// CVS: remove the white checkmark (pixels that are a blend of the background blue and white),
// leaving the phone and laptop screens untouched, then fit the devices like the others.
{
  const src = A('cvs-redesign/cvs-redesign-thumbnail.jpeg')
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const BLUE = [9, 165, 229]
  // Whole devices (frame, bezel, base). Outside them the image is only background, device shadow,
  // and checkmark, so anything lighter than the background is checkmark.
  const devices = [
    { x0: 488, x1: 774, y0: 468, y1: 1038 },   // phone
    { x0: 899, x1: 1886, y0: 262, y1: 942 },   // laptop screen and bezel (rounded top corners below)
    { x0: 778, x1: 2002, y0: 924, y1: 986 },   // laptop base
  ]
  const CORNER = 26
  const inLaptopCorner = (x, y) => {
    // Outside the rounded top corners of the bezel counts as background
    const cy = 262 + CORNER
    if (y >= cy) return true
    if (x < 899 + CORNER) return Math.hypot(x - (899 + CORNER), y - cy) <= CORNER
    if (x > 1886 - CORNER) return Math.hypot(x - (1886 - CORNER), y - cy) <= CORNER
    return true
  }
  const inDevice = (x, y) => devices.some((r, k) => x >= r.x0 && x <= r.x1 && y >= r.y0 && y <= r.y1 && (k !== 1 || inLaptopCorner(x, y)))
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (inDevice(x, y)) continue
    const i = (y * info.width + x) * 3
    if (data[i] > BLUE[0] + 8) { data[i] = BLUE[0]; data[i + 1] = BLUE[1]; data[i + 2] = BLUE[2] }
  }
  const clean = await sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toBuffer()
  await fitSubject(clean, { x0: 496, x1: 1994, y0: 262, y1: 1031 }, A('cvs-redesign/cvs-redesign-thumbnail-32.jpeg'), 40)
}

// MyFrontier: the two dashboard phones on Frontier red, fitted to the same zone
{
  const phones = await sharp(A('myfrontier-app/frontier-dashboard.png')).trim().png().toBuffer()
  const pm = await sharp(phones).metadata()
  const RF = { ...R, y0: 0.17 * H, y1: 0.65 * H }
  const s = Math.min((RF.x1 - RF.x0) / pm.width, (RF.y1 - RF.y0) / pm.height)
  const pw = Math.round(pm.width * s), ph = Math.round(pm.height * s)
  await sharp({ create: { width: W, height: H, channels: 3, background: '#FF033A' } })
    .composite([{ input: await sharp(phones).resize(pw, ph).png().toBuffer(), left: Math.round((RF.x0 + RF.x1) / 2 - pw / 2), top: Math.round((RF.y0 + RF.y1) / 2 - ph / 2) }])
    .png({ compressionLevel: 9 }).toFile(A('myfrontier-app/myfrontier-app-thumbnail-32.png'))
  console.log('myfrontier-app-thumbnail-32.png scale', s.toFixed(2))
}

// Amica: logo centered on teal
{
  const LOGO_W = 900
  let svg = readFileSync(`${repo}/public/_protected-embeds/amica-prototype/icons/amica-logo.svg`, 'utf8')
  const vb = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number)
  const logoH = Math.round(LOGO_W * vb[3] / vb[2])
  svg = svg.replace(/<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" width="${LOGO_W}" height="${logoH}" viewBox="${vb.join(' ')}" fill="none">`).replace(/var\(--fill-0,\s*white\)/g, '#FFFFFF')
  const logo = await sharp(Buffer.from(svg), { density: 600 }).resize(LOGO_W, logoH).png().toBuffer()
  await sharp({ create: { width: W, height: H, channels: 3, background: '#00A88F' } })
    .composite([{ input: logo, gravity: 'center' }]).png({ compressionLevel: 9 }).toFile(A('amica-design-system/amica-design-system-thumbnail-32.png'))
  console.log('amica-design-system-thumbnail-32.png')
}

// Whataburger: the phone close-up bleeds off its edges, so take a 3:2 crop of the 16:9 source from the
// left edge (keeps the title clear of the phone)
{
  const src = A('wab-2026/wab-thumbnail.jpeg'); const m = await sharp(src).metadata()
  const cw = Math.round(m.height * 3 / 2)
  await sharp(src).extract({ left: 0, top: 0, width: cw, height: m.height }).resize(W, H).jpeg({ quality: 90 }).toFile(A('wab-2026/wab-thumbnail-32.jpeg'))
  console.log('wab-thumbnail-32.jpeg')
}
