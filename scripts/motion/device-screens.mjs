// Screens for the coded device cards (DeviceScene), cut from images the case studies already
// publish. Writes WebP into public/motion/<slug>/. Takes the repo root as its only argument.
// CVS's desktop screens only exist inside laptop mockups, so those are cropped to the display
// (boxes in source pixels, measured inside the bezel).
import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
const repo = process.argv[2]
const require = createRequire(`${repo}/package.json`)
const sharp = require('sharp')

const A = p => `${repo}/src/assets/work/${p}`
const screens = {
  cvs: {
    width: 1280,
    shots: {
      home: ['cvs-redesign/frame-10669.png', { left: 650, top: 181, width: 1605, height: 1000 }],
      shop: ['cvs-redesign/frame-10672.png', { left: 650, top: 181, width: 1605, height: 1000 }],
      brand: ['cvs-redesign/group-10604.png', { left: 1020, top: 360, width: 1372, height: 880 }],
    },
  },
  samsung: {
    // Full-length page captures, kept to the part the tour scrolls through
    width: 1100,
    shots: {
      home: ['samsung-redesign/revamp-hp.jpg', { left: 0, top: 0, width: 2500, height: 5600 }],
      category: ['samsung-redesign/revamp-pcd.jpg', { left: 0, top: 0, width: 2500, height: 3600 }],
    },
  },
  amica: {
    width: 1440,
    shots: {
      home: ['amica-design-system/hero.png'],
      quote: ['amica-design-system/prototype-v2/get-a-quote-desktop.png'],
    },
  },
  bespoke: {
    width: 1200,
    shots: {
      depth: ['bespoke-design-studio/desktop-06.png'],
      colors: ['bespoke-design-studio/new-design.png'],
      summary: ['bespoke-design-studio/desktop-13.png'],
    },
  },
}

for (const [slug, { width, shots }] of Object.entries(screens)) {
  mkdirSync(`${repo}/public/motion/${slug}`, { recursive: true })
  for (const [name, [src, box]] of Object.entries(shots)) {
    let img = sharp(A(src)).removeAlpha()
    if (box) img = img.extract(box)
    const out = `${repo}/public/motion/${slug}/${name}.webp`
    const info = await img.resize({ width }).webp({ quality: 78, effort: 6 }).toFile(out)
    console.log(`${slug}/${name}.webp ${info.width}x${info.height} ${Math.round(info.size / 1024)}K`)
  }
}
