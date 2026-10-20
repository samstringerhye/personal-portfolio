// MacBook Air M2 (rtql8d, CC BY 4.0): its display glass covers the whole inside of the lid, bezel
// and all, so a DOM screen laid on it would cover the bezel. This adds a screen-sized "Display" quad
// just in front of the glass, inset by the real 13.6" Air's bezels (2560x1664 panel, about 8.5mm at
// the sides, 7mm at the top, 12mm at the chin), then compresses: the keyboard's texture stays at its
// 1024px source so the legends hold, the rest goes to 512px.
// Needs @gltf-transform/{core,extensions,functions}, meshoptimizer and sharp (a scratch install).
// Usage: node scripts/models/air-m2-display.mjs "3d models/macbook_air_m2.glb" public/motion/models/macbook-air-m2.glb
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions'
import { meshopt, prune, dedup } from '@gltf-transform/functions'
import { MeshoptEncoder } from 'meshoptimizer'
import sharp from 'sharp'

const [, , input, output] = process.argv
await MeshoptEncoder.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder })
const doc = await io.read(input)
const root = doc.getRoot()
const buffer = root.listBuffers()[0]

// The lid stands at 90°: in the file's own (z-up) space its glass lies in the plane y ≈ 1.082,
// facing -y toward the keyboard, x ±1.512, z 0.01 to 2.054 (1 unit = 100mm)
const glassNode = root.listNodes().find(n => n.getMesh()?.listPrimitives().some(p => p.getMaterial()?.getName() === 'Glass_-_Heavy_Color'))
const [x0, x1, z0, z1, y] = [-1.427, 1.427, 0.13, 1.984, 1.0805]
const positions = new Float32Array([x0, y, z0, x1, y, z0, x1, y, z1, x0, y, z1])
const normals = new Float32Array([0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0])
const uvs = new Float32Array([0, 1, 1, 1, 1, 0, 0, 0])
// Wound so the face points -y
const indices = new Uint16Array([0, 2, 1, 0, 3, 2])
const display = doc.createMaterial('Display').setBaseColorFactor([0.02, 0.02, 0.03, 1]).setRoughnessFactor(0.2)
const prim = doc.createPrimitive()
  .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(positions).setBuffer(buffer))
  .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(normals).setBuffer(buffer))
  .setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(uvs).setBuffer(buffer))
  .setIndices(doc.createAccessor().setType('SCALAR').setArray(indices).setBuffer(buffer))
  .setMaterial(display)
glassNode.getParentNode().addChild(doc.createNode('Display').setMesh(doc.createMesh('Display').addPrimitive(prim)))

// Textures: the keyboard keeps its source size, the rest 512px, all WebP
const keyboard = root.listMaterials().find(m => m.getName() === 'Aluminum_-_Anodized_Glossy_Grey_keyboard.jpg')?.getBaseColorTexture()
for (const t of root.listTextures()) {
  const [w, h] = t.getSize()
  const keep = t === keyboard
  const scale = keep ? 1 : Math.min(1, 512 / Math.max(w, h))
  const img = sharp(Buffer.from(t.getImage())).resize(Math.round(w * scale), Math.round(h * scale))
  t.setImage(new Uint8Array(await img.webp({ quality: keep ? 90 : 80 }).toBuffer())).setMimeType('image/webp')
}
doc.createExtension(EXTTextureWebP).setRequired(true)
await doc.transform(dedup(), prune(), meshopt({ encoder: MeshoptEncoder }))
await io.write(output, doc)
console.log('display added; textures:', root.listTextures().map(t => t.getSize().join('x')).join(', '))
