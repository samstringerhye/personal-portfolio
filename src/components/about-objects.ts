// The About page's three objects, modeled in code: a Tangerine iBook G3 clamshell (1999), a Diamond
// Rio PMP300 (1998) and a Sega Dreamcast controller with its VMU (1998). Product-render shading:
// every edge bevelled to catch the room's highlights, two or three finishes per object (gloss shell,
// satin metal, translucent plastic), small real details. Each builder returns a group centered on
// the origin, about 1 unit across, its front toward +z.
import {
  CatmullRomCurve3, Color, CylinderGeometry, ExtrudeGeometry, Group, InstancedMesh, LatheGeometry, Matrix4,
  Mesh, MeshPhysicalMaterial, Shape, SphereGeometry, TorusGeometry, TubeGeometry, Vector2, Vector3,
  type BufferGeometry, type Material,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// Finishes
const plastic = (color: string, o: Partial<MeshPhysicalMaterial> = {}) => new MeshPhysicalMaterial({
  color, metalness: 0, roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.15, specularIntensity: 0.5, ...o,
})
const gloss = (color: string) => plastic(color, { roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.04 })
const satinMetal = (color: string) => new MeshPhysicalMaterial({ color, metalness: 0.85, roughness: 0.3, clearcoat: 0.3 })
const screen = (color: string, glow = 0.15) => new MeshPhysicalMaterial({ color, roughness: 0.15, clearcoat: 1, emissive: new Color(color), emissiveIntensity: glow })
// The iBook's 90s plastic: colored, frosted, light passing through to the white core underneath
const translucent = (color: string, deep: string) => new MeshPhysicalMaterial({
  color, metalness: 0, roughness: 0.32, transmission: 0.75, thickness: 0.6, ior: 1.52,
  attenuationColor: new Color(deep), attenuationDistance: 0.35, clearcoat: 1, clearcoatRoughness: 0.05,
})

const mesh = (g: BufferGeometry, m: Material, at: [number, number, number] = [0, 0, 0], rot: [number, number, number] = [0, 0, 0]) => {
  const o = new Mesh(g, m)
  o.position.set(...at)
  o.rotation.set(...rot)
  return o
}
/** A shape extruded and bevelled all round, centered on z = 0 */
const slab = (s: Shape | Shape[], depth: number, bevel: number, segments = 6) => {
  const g = new ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: segments, curveSegments: 32 })
  g.translate(0, 0, -depth / 2)
  return g
}
const roundRect = (cx: number, cy: number, w: number, h: number, r: number) => {
  const s = new Shape(), x = cx - w / 2, y = cy - h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y)
  return s
}
const ellipse = (cx: number, cy: number, rx: number, ry: number) => { const s = new Shape(); s.absellipse(cx, cy, rx, ry, 0, Math.PI * 2, false, 0); return s }

// ─── iBook G3 clamshell ───────────────────────────────────────────────────────────────────────────

const TANGERINE = '#ff7a2a', TANGERINE_DEEP = '#ff5a0a', FROST = '#f3f0e8', KEY = '#efe9da'

/** The clamshell's outline: a rounded rectangle whose front edge bows out (front at -y) */
function clam(w: number, d: number, r: number, bulge: number) {
  const s = new Shape(), x0 = -w / 2, x1 = w / 2, y0 = -d / 2, y1 = d / 2
  s.moveTo(x0 + r, y0)
  s.quadraticCurveTo(0, y0 - bulge, x1 - r, y0)
  s.quadraticCurveTo(x1, y0, x1, y0 + r)
  s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1)
  s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r)
  s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0)
  return s
}

export function ibook(): Group {
  const g = new Group()
  const shell = translucent(TANGERINE, TANGERINE_DEEP)
  const frost = plastic(FROST, { roughness: 0.42, clearcoat: 0.5 })

  // Base, lying flat: the shape's -y front turns toward +z
  const base = new Group()
  base.rotation.x = -Math.PI / 2
  base.add(mesh(slab(clam(1, 0.8, 0.2, 0.06), 0.05, 0.035), shell))
  // The white core the colored band wraps, and the deck on top
  base.add(mesh(slab(clam(0.9, 0.7, 0.16, 0.05), 0.06, 0.03), frost))
  base.add(mesh(slab(clam(0.9, 0.7, 0.16, 0.05), 0.008, 0.012), frost, [0, 0, 0.062]))
  g.add(base)

  // Keyboard: 13 keys by 5 rows in the back half of the deck, the space bar wider
  const keyGeo = new RoundedBoxGeometry(0.052, 0.014, 0.048, 3, 0.008)
  const keys = new InstancedMesh(keyGeo, plastic(KEY, { roughness: 0.5, clearcoat: 0.2 }), 13 * 5)
  const m = new Matrix4()
  let n = 0
  for (let row = 0; row < 5; row++) for (let col = 0; col < 13; col++) {
    m.makeTranslation(-0.354 + col * 0.059, 0.082, -0.3 + row * 0.055)
    keys.setMatrixAt(n++, m)
  }
  g.add(keys)
  g.add(mesh(new RoundedBoxGeometry(0.26, 0.014, 0.048, 3, 0.008), plastic(KEY, { roughness: 0.5, clearcoat: 0.2 }), [0, 0.082, -0.3 + 5 * 0.055]))
  // Trackpad and its colored button
  g.add(mesh(new RoundedBoxGeometry(0.2, 0.008, 0.13, 3, 0.02), plastic('#e6e3da', { roughness: 0.55 }), [0, 0.077, 0.14]))
  const button = mesh(slab(ellipse(0, 0, 0.11, 0.028), 0.008, 0.008), shell, [0, 0.078, 0.27], [-Math.PI / 2, 0, 0])
  g.add(button)

  // Lid at about 100 degrees, hinged at the back edge: standing in xy, its bowed edge on top
  const lid = new Group()
  lid.position.set(0, 0.06, -0.36)
  lid.rotation.x = -0.24
  const outline = clam(1, 0.8, 0.2, 0.06)
  const lidShell = slab(outline, 0.03, 0.03)
  lidShell.rotateZ(Math.PI)
  lidShell.translate(0, 0.4, 0)
  lid.add(mesh(lidShell, shell))
  const lidCore = slab(clam(0.9, 0.7, 0.16, 0.05), 0.04, 0.02)
  lidCore.rotateZ(Math.PI)
  lidCore.translate(0, 0.4, 0)
  lid.add(mesh(lidCore, frost))
  // Bezel and the screen set into it
  const bezel = slab(clam(0.88, 0.7, 0.16, 0.05), 0.006, 0.01)
  bezel.rotateZ(Math.PI)
  bezel.translate(0, 0.4, 0.04)
  lid.add(mesh(bezel, frost))
  lid.add(mesh(slab(roundRect(0, 0.43, 0.64, 0.46, 0.02), 0.004, 0.004), screen('#1a1d24', 0.05), [0, 0, 0.052]))
  g.add(lid)

  // The handle folded flat behind the hinge
  const handle = new TorusGeometry(0.2, 0.022, 16, 48, Math.PI)
  handle.rotateX(Math.PI / 2)
  g.add(mesh(handle, shell, [0, 0.03, -0.42]))
  return g
}

// ─── Diamond Rio PMP300 ───────────────────────────────────────────────────────────────────────────

export function rio(): Group {
  const g = new Group()
  // Charcoal body with a metallic fleck in its finish
  g.add(mesh(slab(roundRect(0, 0, 0.64, 0.9, 0.07), 0.1, 0.03), new MeshPhysicalMaterial({ color: '#45484d', metalness: 0.3, roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.2 })))
  // Glossy black band across the top, the LCD set into it
  g.add(mesh(slab(roundRect(0, 0.27, 0.54, 0.3, 0.035), 0.008, 0.012), gloss('#121315'), [0, 0, 0.088]))
  g.add(mesh(slab(roundRect(0, 0.29, 0.4, 0.11, 0.01), 0.002, 0.004), screen('#a9bfa3', 0.25), [0, 0, 0.104]))
  // Control ring
  const ringProfile = [new Vector2(0.165, -0.012), new Vector2(0.27, -0.012), new Vector2(0.278, 0), new Vector2(0.27, 0.012), new Vector2(0.165, 0.012)]
  const ring = new LatheGeometry(ringProfile, 96)
  ring.rotateX(Math.PI / 2)
  g.add(mesh(ring, satinMetal('#8d8e88'), [0, -0.11, 0.094]))
  // Five dark buttons on the ring: two at the top, one left, two bottom left
  for (const deg of [118, 62, 180, 228, 272]) {
    const a = (deg * Math.PI) / 180
    const b = mesh(new RoundedBoxGeometry(0.1, 0.06, 0.03, 4, 0.02), plastic('#4b4d48', { roughness: 0.5 }), [Math.cos(a) * 0.218, -0.11 + Math.sin(a) * 0.218, 0.112], [0, 0, a - Math.PI / 2])
    g.add(b)
  }
  // The center disc: satin silver, a clear rim, four grooves on the diagonals
  const dome = new LatheGeometry(Array.from({ length: 12 }, (_, i) => {
    const t = i / 11
    return new Vector2(Math.max(0.0001, 0.14 * Math.cos(t * Math.PI / 2)), 0.02 * Math.sin(t * Math.PI / 2))
  }), 96)
  dome.rotateX(Math.PI / 2)
  g.add(mesh(dome, satinMetal('#cdcabd'), [0, -0.11, 0.106]))
  g.add(mesh(new TorusGeometry(0.145, 0.011, 16, 96), gloss('#dfe3e6'), [0, -0.11, 0.106]))
  for (const deg of [45, 135, 225, 315]) {
    const a = (deg * Math.PI) / 180
    g.add(mesh(new RoundedBoxGeometry(0.075, 0.008, 0.006, 2, 0.003), plastic('#6c6a60'), [Math.cos(a) * 0.075, -0.11 + Math.sin(a) * 0.075, 0.124], [0, 0, a]))
  }
  return g
}

// ─── Sega Dreamcast controller ────────────────────────────────────────────────────────────────────

export function dreamcast(): Group {
  const g = new Group()
  const body = plastic('#efefec', { roughness: 0.36, sheen: 0.2, sheenColor: new Color('#ffffff') })
  const grey = plastic('#d6d7d4', { roughness: 0.42 })

  // The shield: a round face over two grips, a notch between them where the cable leaves
  const s = new Shape()
  s.moveTo(-0.17, -0.36)
  s.bezierCurveTo(-0.24, -0.42, -0.3, -0.56, -0.38, -0.58)
  s.bezierCurveTo(-0.47, -0.6, -0.53, -0.5, -0.52, -0.38)
  s.bezierCurveTo(-0.53, -0.1, -0.5, 0.2, -0.38, 0.36)
  s.bezierCurveTo(-0.25, 0.52, 0.25, 0.52, 0.38, 0.36)
  s.bezierCurveTo(0.5, 0.2, 0.53, -0.1, 0.52, -0.38)
  s.bezierCurveTo(0.53, -0.5, 0.47, -0.6, 0.38, -0.58)
  s.bezierCurveTo(0.3, -0.56, 0.24, -0.42, 0.17, -0.36)
  s.bezierCurveTo(0.1, -0.3, -0.1, -0.3, -0.17, -0.36)
  g.add(mesh(slab(s, 0.08, 0.07, 10), body))
  // The domed back
  const back = new SphereGeometry(0.42, 48, 24)
  back.scale(1, 1, 0.32)
  g.add(mesh(back, body, [0, 0.06, -0.05]))
  const z = 0.11

  // VMU: a grey rounded block with its teal screen and the orange swirl
  g.add(mesh(slab(roundRect(0, 0.21, 0.26, 0.34, 0.06), 0.02, 0.02), grey, [0, 0, z]))
  g.add(mesh(slab(roundRect(0, 0.17, 0.17, 0.15, 0.02), 0.004, 0.006), screen('#1a7067', 0.3), [0, 0, z + 0.03]))
  const swirl = new TorusGeometry(0.022, 0.006, 10, 40, Math.PI * 1.6)
  g.add(mesh(swirl, gloss('#e8572a'), [0, 0.32, z + 0.03]))
  g.add(mesh(new TorusGeometry(0.01, 0.005, 10, 30, Math.PI * 1.4), gloss('#e8572a'), [0, 0.32, z + 0.03], [0, 0, 1.2]))

  // Analog stick: a ring and a concave cap, top left
  g.add(mesh(new TorusGeometry(0.068, 0.016, 16, 48), grey, [-0.27, 0.22, z]))
  g.add(mesh(new CylinderGeometry(0.055, 0.058, 0.05, 40), grey, [-0.27, 0.22, z + 0.02], [Math.PI / 2, 0, 0]))
  // D-pad
  const cross = [roundRect(-0.29, -0.01, 0.16, 0.05, 0.012), roundRect(-0.29, -0.01, 0.05, 0.16, 0.012)]
  g.add(mesh(slab(cross, 0.012, 0.01), grey, [0, 0, z + 0.005]))
  // Face buttons in their diamond: Y green on top, X yellow left, B blue right, A red below
  const buttons: [number, number, string][] = [[0.3, 0.1, '#6edcb0'], [0.22, 0.02, '#f5d800'], [0.38, 0.02, '#3f9fe0'], [0.3, -0.06, '#f2554a']]
  for (const [x, y, c] of buttons) {
    const b = new SphereGeometry(0.036, 32, 16)
    b.scale(1, 1, 0.6)
    g.add(mesh(b, gloss(c), [x, y, z + 0.005]))
  }
  // Start: a triangle pointing up, just above the notch
  const tri = new Shape()
  tri.moveTo(-0.045, -0.24); tri.lineTo(0.045, -0.24); tri.lineTo(0, -0.17); tri.lineTo(-0.045, -0.24)
  g.add(mesh(slab(tri, 0.01, 0.01), grey, [0, 0, z - 0.01]))
  // Cable out of the notch
  const cable = new TubeGeometry(new CatmullRomCurve3([new Vector3(0, -0.3, -0.02), new Vector3(0.01, -0.45, -0.04), new Vector3(0.06, -0.62, -0.02), new Vector3(0.1, -0.78, 0.02)]), 40, 0.016, 12)
  g.add(mesh(cable, plastic('#b8bacb', { roughness: 0.55 })))
  return g
}

// Kept as SCULPTS so about-icons.ts stays as it is
export const SCULPTS = { ibook, rio, dreamcast }
export type SculptName = keyof typeof SCULPTS
