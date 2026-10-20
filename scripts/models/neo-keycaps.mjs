// MacBook Neo: the keycap color texture kept at its 1024x256 source size so the key legends stay
// sharp; every other texture 512px. Needs @gltf-transform/{core,extensions,functions}, meshoptimizer
// and sharp (npx or a scratch install).
// Usage: node scripts/models/neo-keycaps.mjs "3d models/macbook_neo.glb" public/motion/models/macbook-neo.glb
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { meshopt, prune, dedup } from '@gltf-transform/functions'
import { MeshoptEncoder } from 'meshoptimizer'
import sharp from 'sharp'
const [, , input, output] = process.argv
await MeshoptEncoder.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder })
const doc = await io.read(input)
const keycap = doc.getRoot().listMaterials().find(m => m.getName() === 'Keycap')?.getBaseColorTexture()
for (const t of doc.getRoot().listTextures()) {
  const [w, h] = t.getSize()
  const keep = t === keycap
  const scale = keep ? 1 : Math.min(1, 512 / Math.max(w, h))
  const img = sharp(Buffer.from(t.getImage())).resize(Math.round(w * scale), Math.round(h * scale))
  t.setImage(new Uint8Array(await img.webp({ quality: keep ? 92 : 80 }).toBuffer())).setMimeType('image/webp')
  t.setURI(t.getURI().replace(/\.(png|jpe?g)$/, '.webp'))
}
doc.createExtension((await import('@gltf-transform/extensions')).EXTTextureWebP).setRequired(true)
await doc.transform(dedup(), prune(), meshopt({ encoder: MeshoptEncoder }))
await io.write(output, doc)
for (const t of doc.getRoot().listTextures()) console.log(t.getSize().join('x'), t === keycap ? '(keycap)' : '')
