// Unlinks every mesh whose world-space center sits behind z = 0, then writes the GLB back out.
// The Galaxy Z Fold8 source file shows an unfolded phone in front (z > 0) and a folded one behind
// it; this keeps the unfolded one. gltf-transform optimize then prunes the orphaned data.
// Usage: node scripts/models/drop-behind.mjs in.glb out.glb
import { readFileSync, writeFileSync } from 'node:fs'

const [, , input, output] = process.argv
const glb = readFileSync(input)
const jsonLen = glb.readUInt32LE(12)
const json = JSON.parse(glb.subarray(20, 20 + jsonLen).toString('utf8'))
const bin = glb.subarray(20 + jsonLen)

// Column-major 4x4 helpers
const mul = (a, b) => {
  const o = new Array(16).fill(0)
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k]
  return o
}
const trs = ({ matrix, translation: t = [0, 0, 0], rotation: q = [0, 0, 0, 1], scale: s = [1, 1, 1] }) => {
  if (matrix) return matrix
  const [x, y, z, w] = q
  return [
    (1 - 2 * (y * y + z * z)) * s[0], 2 * (x * y + z * w) * s[0], 2 * (x * z - y * w) * s[0], 0,
    2 * (x * y - z * w) * s[1], (1 - 2 * (x * x + z * z)) * s[1], 2 * (y * z + x * w) * s[1], 0,
    2 * (x * z + y * w) * s[2], 2 * (y * z - x * w) * s[2], (1 - 2 * (x * x + y * y)) * s[2], 0,
    t[0], t[1], t[2], 1,
  ]
}
const apply = (m, [x, y, z]) => [0, 1, 2].map(r => m[r] * x + m[4 + r] * y + m[8 + r] * z + m[12 + r])

let dropped = 0, kept = 0
const walk = (i, parent) => {
  const node = json.nodes[i]
  const world = mul(parent, trs(node))
  if (node.mesh !== undefined) {
    // Center of the mesh's bounds (POSITION min/max are required by the spec), in world space
    const corners = json.meshes[node.mesh].primitives.flatMap(p => {
      const { min, max } = json.accessors[p.attributes.POSITION]
      return [0, 1, 2, 3, 4, 5, 6, 7].map(k => apply(world, [k & 1 ? max[0] : min[0], k & 2 ? max[1] : min[1], k & 4 ? max[2] : min[2]]))
    })
    const zs = corners.map(c => c[2])
    if ((Math.min(...zs) + Math.max(...zs)) / 2 < 0) { delete node.mesh; dropped++ } else kept++
  }
  for (const c of node.children ?? []) walk(c, world)
}
const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
for (const n of json.scenes[json.scene ?? 0].nodes) walk(n, identity)

// Rebuild the GLB: JSON chunk padded with spaces to 4 bytes, then the original BIN chunk as is
let text = Buffer.from(JSON.stringify(json), 'utf8')
text = Buffer.concat([text, Buffer.alloc((4 - (text.length % 4)) % 4, 0x20)])
const header = Buffer.alloc(20)
header.writeUInt32LE(0x46546c67, 0)
header.writeUInt32LE(2, 4)
header.writeUInt32LE(20 + text.length + bin.length, 8)
header.writeUInt32LE(text.length, 12)
header.writeUInt32LE(0x4e4f534a, 16)
writeFileSync(output, Buffer.concat([header, text, bin]))
console.log(`kept ${kept} meshes, dropped ${dropped}`)
