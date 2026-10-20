// The About page's four icons as visionOS-style badges: a thick glossy disc with a rounded rim and a
// puffy glyph raised off its face. Each builder returns a group centered on the origin, about 1 unit
// across, its face toward +z.
import {
  ExtrudeGeometry, Group, LatheGeometry, Mesh, MeshPhysicalMaterial, Path, Shape, Vector2,
} from 'three'

const glossy = (color: string, clearcoat = 1) =>
  new MeshPhysicalMaterial({ color, roughness: 0.38, metalness: 0, clearcoat, clearcoatRoughness: 0.18 })

// The disc: a lathed profile, flat on the back, a fat rounded rim, the face domed a touch
function disc(color: string): Mesh {
  const R = 0.5, T = 0.16, rim = 0.07
  const pts: Vector2[] = [new Vector2(0.0001, -T / 2)]
  for (let i = 0; i <= 16; i++) {
    const a = -Math.PI / 2 + (i / 16) * Math.PI
    pts.push(new Vector2(R - rim + Math.cos(a) * rim, Math.sin(a) * (T / 2)))
  }
  for (let i = 1; i <= 8; i++) {
    const r = (R - rim) * (1 - i / 8)
    pts.push(new Vector2(Math.max(0.0001, r), T / 2 + 0.018 * Math.sin((i / 8) * Math.PI / 2)))
  }
  const g = new LatheGeometry(pts, 96)
  g.rotateX(Math.PI / 2)
  return new Mesh(g, glossy(color))
}

// A glyph raised off the face, its edges rounded by the bevel
function glyph(shapes: Shape | Shape[], color: string, depth = 0.05): Mesh {
  const g = new ExtrudeGeometry(shapes, { depth, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.022, bevelSegments: 6, curveSegments: 32 })
  const m = new Mesh(g, glossy(color, 0.6))
  m.position.z = 0.1
  return m
}

const roundRect = (x: number, y: number, w: number, h: number, r: number, s = new Shape()) => {
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y)
  return s
}
const circle = (x: number, y: number, r: number, hole = false) => {
  const p = hole ? new Path() : new Shape()
  p.absarc(x, y, r, 0, Math.PI * 2, hole)
  return p
}

const badge = (base: string, mark: Mesh | Mesh[]) => {
  const g = new Group()
  g.add(disc(base))
  ;[mark].flat().forEach(m => g.add(m))
  return g
}

/** Headphones: a band arching over two cups, white on red */
export function headphones(): Group {
  const band = new Shape()
  band.absarc(0, -0.02, 0.24, 0, Math.PI, false)
  band.absarc(0, -0.02, 0.19, Math.PI, 0, true)
  const cups = [-1, 1].map(side => roundRect(side * 0.215 - 0.06, -0.24, 0.12, 0.2, 0.05))
  return badge('#ef4b4b', glyph([band, ...cups], '#ffffff'))
}

/** A gamepad: a rounded body with grips, a d-pad and four buttons cut through it */
export function gamepad(): Group {
  const body = new Shape()
  body.moveTo(-0.2, 0.12)
  body.lineTo(0.2, 0.12)
  body.bezierCurveTo(0.33, 0.12, 0.34, -0.02, 0.32, -0.12)
  body.bezierCurveTo(0.3, -0.22, 0.2, -0.2, 0.15, -0.1)
  body.lineTo(-0.15, -0.1)
  body.bezierCurveTo(-0.2, -0.2, -0.3, -0.22, -0.32, -0.12)
  body.bezierCurveTo(-0.34, -0.02, -0.33, 0.12, -0.2, 0.12)
  // D-pad and buttons as holes
  const pad = new Path()
  const [cx, cy, a, b] = [-0.17, 0.01, 0.03, 0.085]
  pad.moveTo(cx - a, cy + b); pad.lineTo(cx - a, cy + a); pad.lineTo(cx - b, cy + a); pad.lineTo(cx - b, cy - a)
  pad.lineTo(cx - a, cy - a); pad.lineTo(cx - a, cy - b); pad.lineTo(cx + a, cy - b); pad.lineTo(cx + a, cy - a)
  pad.lineTo(cx + b, cy - a); pad.lineTo(cx + b, cy + a); pad.lineTo(cx + a, cy + a); pad.lineTo(cx + a, cy + b)
  pad.lineTo(cx - a, cy + b)
  body.holes.push(pad)
  for (const [x, y] of [[0.17, 0.06], [0.22, 0.01], [0.12, 0.01], [0.17, -0.04]]) body.holes.push(circle(x, y, 0.028, true) as Path)
  return badge('#2b3f8f', glyph(body, '#ffffff'))
}

/** A ghost with a wavy hem and two eyes, lavender on white */
export function ghost(): Group {
  const s = new Shape()
  s.moveTo(-0.2, -0.22)
  s.lineTo(-0.2, 0.04)
  s.absarc(0, 0.04, 0.2, Math.PI, 0, true)
  s.lineTo(0.2, -0.22)
  // Hem: three scallops
  for (let i = 0; i < 3; i++) {
    const x0 = 0.2 - i * (0.4 / 3), x1 = x0 - 0.4 / 3
    s.quadraticCurveTo((x0 + x1) / 2, -0.14, x1, -0.22)
  }
  for (const x of [-0.07, 0.07]) s.holes.push(circle(x, 0.06, 0.035, true) as Path)
  return badge('#ebe7fa', glyph(s, '#8f7ce8'))
}

/** A clapperboard: the slate and a striped clapper tipped open, white on ink */
export function clapperboard(): Group {
  const slate = roundRect(-0.23, -0.24, 0.46, 0.3, 0.04)
  const clapper = new Shape()
  const [x, y, w, h, tilt] = [-0.23, 0.1, 0.46, 0.09, 0.25]
  const c = Math.cos(tilt), s = Math.sin(tilt)
  const rot = (px: number, py: number): [number, number] => [x + px * c - py * s, y + px * s + py * c]
  clapper.moveTo(...rot(0, 0)); clapper.lineTo(...rot(w, 0)); clapper.lineTo(...rot(w, h)); clapper.lineTo(...rot(0, h)); clapper.lineTo(...rot(0, 0))
  // Stripes on the clapper, in the disc's ink, raised a hair past it
  const stripes: Shape[] = []
  for (let i = 0; i < 3; i++) {
    const st = new Shape()
    const x0 = 0.06 + i * 0.14
    st.moveTo(...rot(x0, 0.015)); st.lineTo(...rot(x0 + 0.05, h - 0.015)); st.lineTo(...rot(x0 + 0.09, h - 0.015)); st.lineTo(...rot(x0 + 0.04, 0.015)); st.lineTo(...rot(x0, 0.015))
    stripes.push(st)
  }
  const ink = glyph(stripes, '#1f2433', 0.02)
  ink.position.z = 0.17
  return badge('#1f2433', [glyph([slate, clapper], '#ffffff'), ink])
}

export const SCULPTS = { headphones, gamepad, ghost, clapperboard }
export type SculptName = keyof typeof SCULPTS
