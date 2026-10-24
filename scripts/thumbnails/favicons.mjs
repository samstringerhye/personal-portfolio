// Builds the subpixel favicon set: three primaries offset on the diagonal, like the hero's dots.
// Dark: red, green and blue light on navy (screen). Light: cyan, magenta and yellow ink on paper (multiply).
// Overlaps are drawn as their own shapes instead of blend modes, so sharp renders them the way browsers do.
import { createRequire } from 'node:module'
import { writeFileSync } from 'node:fs'

const repo = process.argv[2]
const require = createRequire(`${repo}/package.json`)
const sharp = require('sharp')

const NAVY = '#0B1220'
const PAPER = '#FEFDFC'
// Single, pairs (0+1, 0+2, 1+2), then all three
const DARK = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF']
const LIGHT = ['#00FFFF', '#FF00FF', '#FFFF00', '#0000FF', '#00FF00', '#FF0000', '#000000']

// 32 and up. The 16px cut runs 25% larger with centers on whole pixels so the edges stay crisp.
const FULL = { r: 6.2, step: 4.4, rx: 7 }
const SMALL = { r: 8, step: 5.66, rx: 4, snap: true }

function centers({ step, snap }) {
  const d = step / Math.SQRT2
  // Red (cyan) leads up and right; blue (yellow) trails, matching the hero's delay order
  const pos = [[16 + d, 16 - d], [16, 16], [16 - d, 16 + d]]
  return snap ? pos.map(([x, y]) => [Math.round(x / 2) * 2, Math.round(y / 2) * 2]) : pos
}

const num = (n) => +n.toFixed(2)

function svg(cut, { rx = cut.rx, scheme = true } = {}) {
  const pos = centers(cut)
  const circle = (i, cls) => `<circle class="${cls} p${i}" cx="${num(pos[i][0])}" cy="${num(pos[i][1])}" r="${cut.r}" fill="${DARK[+cls.slice(1)]}"/>`
  const clip = (i) => `<clipPath id="k${i}"><circle class="p${i}" cx="${num(pos[i][0])}" cy="${num(pos[i][1])}" r="${cut.r}"/></clipPath>`
  // In a browser tab the SVG is drawn at 16px, so it swaps to the 16px cut there too
  const small = centers(SMALL)
  const style = scheme
    ? `<style>@media (prefers-color-scheme: light){.t{fill:${PAPER}}${LIGHT.map((c, i) => `.c${i}{fill:${c}}`).join('')}}` +
      `@media (max-width: 24px){.t{rx:${SMALL.rx}px}${small.map(([x, y], i) => `.p${i}{cx:${num(x)}px;cy:${num(y)}px;r:${SMALL.r}px}`).join('')}}</style>`
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${style}` +
    `<defs>${clip(0)}${clip(1)}</defs>` +
    `<rect class="t" width="32" height="32" rx="${rx}" fill="${NAVY}"/>` +
    circle(0, 'c0') + circle(1, 'c1') + circle(2, 'c2') +
    `<g clip-path="url(#k0)">${circle(1, 'c3')}${circle(2, 'c4')}</g>` +
    `<g clip-path="url(#k1)">${circle(2, 'c5')}</g>` +
    `<g clip-path="url(#k0)"><g clip-path="url(#k1)">${circle(2, 'c6')}</g></g>` +
    `</svg>\n`
}

const png = (source, size) =>
  sharp(Buffer.from(source), { density: Math.max(72, size * 72 / 32 * 4) }).resize(size, size).png().toBuffer()

function ico(entries) {
  const header = Buffer.alloc(6 + entries.length * 16)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(entries.length, 4)
  let offset = header.length
  entries.forEach(({ size, data }, i) => {
    const at = 6 + i * 16
    header.writeUInt8(size, at)
    header.writeUInt8(size, at + 1)
    header.writeUInt16LE(1, at + 4)
    header.writeUInt16LE(32, at + 6)
    header.writeUInt32LE(data.length, at + 8)
    header.writeUInt32LE(offset, at + 12)
    offset += data.length
  })
  return Buffer.concat([header, ...entries.map((e) => e.data)])
}

// Browsers draw the SVG at every size, so it carries the full cut and switches with the color scheme
writeFileSync(`${repo}/public/favicon.svg`, svg(FULL))

const ink = { scheme: false }
writeFileSync(`${repo}/public/favicon.ico`, ico([
  { size: 16, data: await png(svg(SMALL, ink), 16) },
  { size: 32, data: await png(svg(FULL, ink), 32) },
]))
// iOS rounds the corners itself
writeFileSync(`${repo}/public/apple-touch-icon.png`, await png(svg(FULL, { ...ink, rx: 0 }), 180))
writeFileSync(`${repo}/public/icon-192.png`, await png(svg(FULL, ink), 192))
writeFileSync(`${repo}/public/icon-512.png`, await png(svg(FULL, ink), 512))
