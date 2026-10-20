// The About page's four icons as visionOS-style badges: a thick glossy disc with a rounded rim and a
// puffy glyph raised off its face. Every surface carries a top-to-bottom gradient (vertex colors),
// a clearcoat that catches the room's reflections, and each glyph casts a soft shadow onto the face.
// Each builder returns a group centered on the origin, about 1 unit across, its face toward +z.
import {
  Box3, BufferAttribute, Color, ExtrudeGeometry, Group, LatheGeometry, Mesh, MeshBasicMaterial,
  MeshPhysicalMaterial, Path, Shape, ShapeGeometry, Vector2, type BufferGeometry,
} from 'three'

/** Paints a geometry from top to bottom: light at its top, deep at its bottom */
function shade(g: BufferGeometry, top: string, bottom: string): BufferGeometry {
  const box = new Box3().setFromBufferAttribute(g.attributes.position as BufferAttribute)
  const a = new Color(top), b = new Color(bottom), c = new Color()
  const pos = g.attributes.position
  const colors = new Float32Array(pos.count * 3)
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) - box.min.y) / Math.max(1e-6, box.max.y - box.min.y)
    c.copy(b).lerp(a, t * t * (3 - 2 * t))
    colors.set([c.r, c.g, c.b], i * 3)
  }
  g.setAttribute('color', new BufferAttribute(colors, 3))
  return g
}

const glossy = (opts: { roughness?: number; clearcoat?: number } = {}) => new MeshPhysicalMaterial({
  vertexColors: true, roughness: opts.roughness ?? 0.32, metalness: 0,
  clearcoat: opts.clearcoat ?? 1, clearcoatRoughness: 0.06, envMapIntensity: 1.25,
})

// The disc: a lathed profile, flat on the back, a fat rounded rim, the face domed a touch
function disc(top: string, bottom: string): Mesh {
  const R = 0.5, T = 0.17, rim = 0.075
  const pts: Vector2[] = [new Vector2(0.0001, -T / 2)]
  for (let i = 0; i <= 20; i++) {
    const a = -Math.PI / 2 + (i / 20) * Math.PI
    pts.push(new Vector2(R - rim + Math.cos(a) * rim, Math.sin(a) * (T / 2)))
  }
  for (let i = 1; i <= 10; i++) {
    const r = (R - rim) * (1 - i / 10)
    pts.push(new Vector2(Math.max(0.0001, r), T / 2 + 0.022 * Math.sin((i / 10) * Math.PI / 2)))
  }
  const g = new LatheGeometry(pts, 128)
  g.rotateX(Math.PI / 2)
  return new Mesh(shade(g, top, bottom), glossy())
}

const FACE = 0.11
// A glyph raised off the face, its edges rounded by the bevel, painted top to bottom
function raised(shapes: Shape | Shape[], top: string, bottom: string, z = FACE, depth = 0.045, bevel = 0.024): Mesh {
  const g = new ExtrudeGeometry(shapes, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.9, bevelSegments: 8, curveSegments: 40 })
  const m = new Mesh(shade(g, top, bottom), glossy({ roughness: 0.26, clearcoat: 0.8 }))
  m.position.z = z
  return m
}
// The glyph's soft shadow on the face: its outline, dropped and spread, in layers that fade out
function shadow(shapes: Shape | Shape[], strength = 0.2): Group {
  const g = new Group()
  for (let i = 0; i < 5; i++) {
    const m = new Mesh(new ShapeGeometry(shapes, 24), new MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: strength / 5, depthWrite: false }))
    const s = 1 + i * 0.025
    m.scale.set(s, s, 1)
    m.position.set(0, -0.012 - i * 0.006, FACE - 0.008)
    g.add(m)
  }
  return g
}

const roundRect = (x: number, y: number, w: number, h: number, r: number, s = new Shape()) => {
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y)
  return s
}
const circle = (x: number, y: number, r: number) => { const s = new Shape(); s.absarc(x, y, r, 0, Math.PI * 2, false); return s }
const ellipse = (x: number, y: number, rx: number, ry: number) => { const s = new Shape(); s.absellipse(x, y, rx, ry, 0, Math.PI * 2, false, 0); return s }

const WHITE: [string, string] = ['#ffffff', '#dfe4ee']
const top = (dz: number) => FACE + 0.045 + 0.024 + dz

/** Headphones: a white band over two cups, red cushions set into them */
export function headphones(): Group {
  const g = new Group()
  g.add(disc('#ff8a7a', '#d92e3a'))
  const band = new Shape()
  band.absarc(0, -0.02, 0.25, 0, Math.PI, false)
  band.absarc(0, -0.02, 0.195, Math.PI, 0, true)
  const cups = [-1, 1].map(side => roundRect(side * 0.222 - 0.065, -0.25, 0.13, 0.21, 0.055))
  g.add(shadow([band, ...cups]))
  g.add(raised([band, ...cups], ...WHITE))
  // Cushions: inset ovals in the cups, a warm red
  for (const side of [-1, 1]) g.add(raised(roundRect(side * 0.222 - 0.035, -0.22, 0.07, 0.15, 0.035), '#ff6b6b', '#c4283a', top(0), 0.012, 0.01))
  return g
}

/** A gamepad: a white body, a gray d-pad and two sticks, four colored buttons */
export function gamepad(): Group {
  const g = new Group()
  g.add(disc('#6f8cff', '#2a3a9e'))
  const body = new Shape()
  body.moveTo(-0.2, 0.13)
  body.lineTo(0.2, 0.13)
  body.bezierCurveTo(0.34, 0.13, 0.35, -0.02, 0.33, -0.13)
  body.bezierCurveTo(0.31, -0.24, 0.2, -0.22, 0.15, -0.11)
  body.lineTo(-0.15, -0.11)
  body.bezierCurveTo(-0.2, -0.22, -0.31, -0.24, -0.33, -0.13)
  body.bezierCurveTo(-0.35, -0.02, -0.34, 0.13, -0.2, 0.13)
  g.add(shadow(body))
  g.add(raised(body, ...WHITE))
  const z = top(0)
  // D-pad
  const [cx, cy, a, b] = [-0.18, 0.02, 0.026, 0.075]
  g.add(raised([roundRect(cx - b, cy - a, 2 * b, 2 * a, 0.012), roundRect(cx - a, cy - b, 2 * a, 2 * b, 0.012)], '#5a6378', '#2f3646', z, 0.01, 0.01))
  // Sticks
  for (const x of [-0.08, 0.08]) g.add(raised(circle(x, -0.06, 0.04), '#5a6378', '#2f3646', z, 0.012, 0.012))
  // Buttons
  const buttons: [number, number, string, string][] = [[0.18, 0.075, '#ffe066', '#e0a800'], [0.235, 0.02, '#ff7a7a', '#d6303a'], [0.125, 0.02, '#7ab8ff', '#2f6fd6'], [0.18, -0.035, '#6fe0a4', '#1fa864']]
  for (const [x, y, t, bt] of buttons) g.add(raised(circle(x, y, 0.026), t, bt, z, 0.01, 0.012))
  return g
}

/** A ghost: a lavender sheet with a scalloped hem, dark eyes and pink cheeks */
export function ghost(): Group {
  const g = new Group()
  g.add(disc('#f6f3ff', '#c9c0ee'))
  const s = new Shape()
  s.moveTo(-0.21, -0.23)
  s.lineTo(-0.21, 0.05)
  s.absarc(0, 0.05, 0.21, Math.PI, 0, true)
  s.lineTo(0.21, -0.23)
  for (let i = 0; i < 3; i++) {
    const x0 = 0.21 - i * (0.42 / 3), x1 = x0 - 0.42 / 3
    s.quadraticCurveTo((x0 + x1) / 2, -0.15, x1, -0.23)
  }
  g.add(shadow(s, 0.16))
  g.add(raised(s, '#c9b8ff', '#7c63e0'))
  const z = top(0)
  for (const x of [-0.075, 0.075]) g.add(raised(ellipse(x, 0.07, 0.032, 0.042), '#3a3358', '#1a1530', z, 0.008, 0.01))
  for (const x of [-0.12, 0.12]) g.add(raised(ellipse(x, -0.01, 0.03, 0.018), '#ffb3d1', '#f07aa8', z, 0.004, 0.006))
  return g
}

/** A clapperboard: a white slate with two lines, a striped clapper tipped open on a hinge */
export function clapperboard(): Group {
  const g = new Group()
  g.add(disc('#4a5068', '#151926'))
  const slate = roundRect(-0.24, -0.25, 0.48, 0.31, 0.045)
  const [x, y, w, h, tilt] = [-0.24, 0.1, 0.48, 0.095, 0.25]
  const c = Math.cos(tilt), s = Math.sin(tilt)
  const rot = (px: number, py: number): [number, number] => [x + px * c - py * s, y + px * s + py * c]
  const clapper = new Shape()
  clapper.moveTo(...rot(0, 0)); clapper.lineTo(...rot(w, 0)); clapper.lineTo(...rot(w, h)); clapper.lineTo(...rot(0, h)); clapper.lineTo(...rot(0, 0))
  g.add(shadow([slate, clapper]))
  g.add(raised([slate, clapper], ...WHITE))
  const z = top(0)
  const stripes: Shape[] = []
  for (let i = 0; i < 3; i++) {
    const st = new Shape()
    const x0 = 0.07 + i * 0.145
    st.moveTo(...rot(x0, 0.018)); st.lineTo(...rot(x0 + 0.05, h - 0.018)); st.lineTo(...rot(x0 + 0.095, h - 0.018)); st.lineTo(...rot(x0 + 0.045, 0.018)); st.lineTo(...rot(x0, 0.018))
    stripes.push(st)
  }
  g.add(raised(stripes, '#3a4058', '#151926', z, 0.006, 0.008))
  g.add(raised(circle(...rot(0.03, 0.02), 0.022), '#ff8a7a', '#d92e3a', z, 0.006, 0.008))
  for (const ly of [-0.07, -0.15]) g.add(raised(roundRect(-0.18, ly, 0.36, 0.022, 0.011), '#c9cfdc', '#9aa3b6', z, 0.004, 0.006))
  return g
}

export const SCULPTS = { headphones, gamepad, ghost, clapperboard }
export type SculptName = keyof typeof SCULPTS
