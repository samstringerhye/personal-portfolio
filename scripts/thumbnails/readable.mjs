import { createRequire } from 'node:module'
const repo = process.argv[2]
const require = createRequire(`${repo}/package.json`)
const sharp = require('sharp')

// Readable card art: tight crops of screens the case studies already publish, sized so UI text reads
// at card size, in place of the device mockups. Writes the rest frame as <slug>-subject-32.png (also the
// case study hero) and the hover flipbook as <slug>-frame-N.png, all on balance.mjs's 2000x1333 canvas.
// Run after balance.mjs, which would otherwise rescale these four. Prints the frontmatter numbers.
const W = 2000, H = 1333
const BAND = { top: 0.103, bottom: 0.739 }
const BAND_TWO_LINE = { top: 0.103, bottom: 0.647 }
const BAND_THREE_LINE_TAGLINE = { top: 0.103, bottom: 0.601 }
const GAP = 0.085
const GAP_BELOW = 0.05
const RADIUS = 22  // px on the canvas
const TILE_GAP = 56

// Each frame is a row of tiles; a tile is a crop of a published image as fractions of it [left, top, right, bottom],
// with an optional fill behind transparent sources.
// The first frame is the rest frame. Frames in a card share one height so the flipbook doesn't jump.
const cards = {
  'bespoke-design-studio': {
    band: BAND_THREE_LINE_TAGLINE, gap: 0.0468,
    // Rest on the type step; the frontmatter plays them in the tool's order: product, type, colors
    frames: [
      [['frame-37443.webp', [0.178, 0, 0.818, 0.48]]],
      [['frame-37444.webp', [0.178, 0.043, 0.818, 0.523]]],
      [['frame-37445.webp', [0.19, 0.27, 0.81, 0.75]]],
    ],
  },
  'cvs-redesign': {
    band: BAND_TWO_LINE,
    frames: [
      [['frame-10558.png', [0, 0, 1, 1], '#0B0D1B']], // transparent icons: on ink so the thin red lines hold up on the card's blue
      [['group-10624.jpg', [0, 0, 1, 0.6]]],
    ],
  },
  'samsung-redesign': {
    band: BAND_TWO_LINE,
    frames: [
      [['samsung-section-3-gnb-desktop-full.jpg', [0.075, 0.232, 0.48, 0.45]]],
      [['revamp-ui-mosaic.jpg', [0, 0, 0.476, 0.515]]],
    ],
  },
  'myfrontier-app': {
    band: BAND,
    frames: [
      [['screens/dashboard-1.png', [0.09, 0.06, 0.91, 0.34]], ['screens/dashboard-1.png', [0.09, 0.405, 0.91, 0.72]]],
      [['screens/bill-pay-1.png', [0.08, 0.09, 0.92, 0.55]], ['screens/support-1.png', [0.08, 0.12, 0.92, 0.48]]],
    ],
  },
}

async function tile(path, [l, t, r, b], height, fill) {
  const meta = await sharp(path).metadata()
  const left = Math.round(l * meta.width), top = Math.round(t * meta.height)
  const width = Math.round((r - l) * meta.width), cropH = Math.round((b - t) * meta.height)
  const w = Math.round(width * (height / cropH))
  const mask = Buffer.from(`<svg width="${w}" height="${height}"><rect width="${w}" height="${height}" rx="${RADIUS}" ry="${RADIUS}"/></svg>`)
  let img = sharp(path).extract({ left, top, width, height: cropH })
  if (fill) img = sharp(await img.flatten({ background: fill }).toBuffer())
  const input = await img.resize(w, height)
    .composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()
  return { input, w }
}

const result = {}
for (const [slug, cfg] of Object.entries(cards)) {
  const dir = `${repo}/src/assets/work/${slug}`
  const height = Math.round((cfg.band.bottom - cfg.band.top - 2 * (cfg.gap ?? GAP)) * H)
  // Anchor to the headline like balance.mjs: a fixed gap below, the remaining room above
  const cy = (cfg.band.bottom - GAP_BELOW) * H - height / 2
  const top = Math.round(cy - height / 2)
  let box = null
  for (const [n, frame] of cfg.frames.entries()) {
    const tiles = await Promise.all(frame.map(([file, crop, fill]) => tile(`${dir}/${file}`, crop, height, fill)))
    const rowW = tiles.reduce((s, t) => s + t.w, 0) + TILE_GAP * (tiles.length - 1)
    let x = Math.round(W / 2 - rowW / 2)
    const composites = tiles.map(t => { const c = { input: t.input, left: x, top }; x += t.w + TILE_GAP; return c })
    const png = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite(composites).png({ compressionLevel: 9 })
    const out = n === 0 ? `${dir}/${slug}-subject-32.png` : `${dir}/${slug}-frame-${n}.png`
    await png.toFile(out)
    const l = Math.round(W / 2 - rowW / 2) / W, r = (Math.round(W / 2 - rowW / 2) + rowW) / W
    box = box ? { top: box.top, right: Math.max(box.right, r), bottom: box.bottom, left: Math.min(box.left, l) }
      : { top: top / H, right: r, bottom: (top + height) / H, left: l }
  }
  const f = v => +v.toFixed(3)
  result[slug] = { heroOffset: f(0.5 - cy / H), subjectBox: { top: f(box.top), right: f(box.right), bottom: f(box.bottom), left: f(box.left) }, frames: cfg.frames.length - 1 }
}
console.log(JSON.stringify(result, null, 1))
