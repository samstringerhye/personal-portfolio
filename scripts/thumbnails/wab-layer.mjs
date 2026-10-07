import { createRequire } from 'node:module'
const repo = process.argv[2]
const require = createRequire(`${repo}/package.json`)
const sharp = require('sharp')
const src = `${repo}/src/assets/work/wab-2026/wab-thumbnail-32.jpeg`
const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h } = info
const px = (x, y) => { const i = (y * w + x) * 3; return [data[i], data[i + 1], data[i + 2]] }

// Per row: reference orange from the left edge, then the first pixel that departs from it
const edge = new Array(h).fill(w)
for (let y = 0; y < h; y++) {
  const ref = [0, 0, 0]; for (let x = 0; x < 40; x++) { const p = px(x, y); for (let c = 0; c < 3; c++) ref[c] += p[c] / 40 }
  for (let x = 40; x < w; x++) {
    const p = px(x, y)
    if (Math.hypot(p[0] - ref[0], p[1] - ref[1], p[2] - ref[2]) > 34) {
      // Require a few consecutive departing pixels so stray noise doesn't trigger
      let ok = true
      for (let k = 1; k <= 4 && x + k < w; k++) { const q = px(x + k, y); if (Math.hypot(q[0] - ref[0], q[1] - ref[1], q[2] - ref[2]) <= 34) { ok = false; break } }
      if (ok) { edge[y] = x; break }
    }
  }
}
// Smooth the edge with a running median so the silhouette stays clean
const med = edge.map((_, y) => { const win = edge.slice(Math.max(0, y - 6), Math.min(h, y + 7)).sort((a, b) => a - b); return win[Math.floor(win.length / 2)] })

const out = Buffer.alloc(w * h * 4)
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  const i = y * w + x, p = px(x, y)
  const a = Math.max(0, Math.min(1, (x - med[y]) / 1.5 + 0.5)) // 1.5px soft edge
  out.set([...p, Math.round(a * 255)], i * 4)
}
await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toFile(`${repo}/src/assets/work/wab-2026/wab-subject-32.png`)
console.log('edge at rows 0/300/600/900/1300:', [0, 300, 600, 900, 1300].map(y => med[Math.min(h - 1, y)]).join(', '))
