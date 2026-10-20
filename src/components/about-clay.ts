// The About page's four icons, sculpted from rounded primitives so they read as one set: one matte
// clay material, a palette from the site's accents and the photo's red and navy. Each builder
// returns a group centered on the origin, about 1 unit across, front facing +z.
import {
  CapsuleGeometry, CylinderGeometry, Group, LatheGeometry, Mesh, MeshStandardMaterial, SphereGeometry,
  TorusGeometry, Vector2, type BufferGeometry,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export const PALETTE = {
  red: '#ef4b4b',
  navy: '#24346b',
  blue: '#4a86ff',
  green: '#2fc48a',
  yellow: '#ffc94a',
  cream: '#f6f1e7',
  ghost: '#e8e4f6',
  ink: '#1c2233',
} as const

const clay = (color: string) => new MeshStandardMaterial({ color, roughness: 0.62, metalness: 0 })
const part = (geometry: BufferGeometry, color: string, at: [number, number, number] = [0, 0, 0], rot: [number, number, number] = [0, 0, 0]) => {
  const m = new Mesh(geometry, clay(color))
  m.position.set(...at)
  m.rotation.set(...rot)
  return m
}
const box = (w: number, h: number, d: number, r: number) => new RoundedBoxGeometry(w, h, d, 5, r)

/** Over-ear headphones: a rounded band and two padded cups */
export function headphones(): Group {
  const g = new Group()
  // Band: the top half of a torus
  g.add(part(new TorusGeometry(0.38, 0.055, 20, 48, Math.PI), PALETTE.navy, [0, 0.02, 0]))
  for (const side of [-1, 1]) {
    // Cup, its cushion and the arm that holds it
    g.add(part(new CylinderGeometry(0.17, 0.17, 0.14, 40), PALETTE.red, [side * 0.38, -0.12, 0], [0, 0, Math.PI / 2]))
    g.add(part(new TorusGeometry(0.13, 0.05, 16, 40), PALETTE.cream, [side * 0.3, -0.12, 0], [0, Math.PI / 2, 0]))
    g.add(part(new CapsuleGeometry(0.035, 0.12, 8, 16), PALETTE.navy, [side * 0.4, 0.06, 0]))
  }
  return g
}

/** A gamepad: a rounded body with grips, a d-pad, two sticks and four colored buttons */
export function gamepad(): Group {
  const g = new Group()
  g.add(part(box(0.86, 0.42, 0.2, 0.1), PALETTE.navy))
  for (const side of [-1, 1]) {
    g.add(part(new CapsuleGeometry(0.13, 0.16, 10, 24), PALETTE.navy, [side * 0.33, -0.17, 0], [0, 0, side * 0.35]))
    g.add(part(new CylinderGeometry(0.065, 0.075, 0.08, 28), PALETTE.ink, [side * 0.12, -0.09, 0.12], [Math.PI / 2, 0, 0]))
  }
  // D-pad
  g.add(part(box(0.15, 0.05, 0.05, 0.02), PALETTE.cream, [-0.26, 0.06, 0.11]))
  g.add(part(box(0.05, 0.15, 0.05, 0.02), PALETTE.cream, [-0.26, 0.06, 0.11]))
  // Face buttons
  const buttons: [number, number, string][] = [[0.26, 0.13, PALETTE.yellow], [0.33, 0.06, PALETTE.red], [0.19, 0.06, PALETTE.blue], [0.26, -0.01, PALETTE.green]]
  for (const [x, y, c] of buttons) g.add(part(new SphereGeometry(0.035, 20, 14), c, [x, y, 0.1]))
  return g
}

/** A friendly ghost: a lathed sheet with a wavy hem, two eyes and a small mouth */
export function ghost(): Group {
  const g = new Group()
  const profile: Vector2[] = []
  for (let i = 0; i <= 24; i++) {
    const t = i / 24
    const y = 0.5 - t
    // A round dome (a quarter circle), then straight sides that flare a touch toward the hem
    const r = t < 0.45 ? 0.32 * Math.sqrt(1 - (1 - t / 0.45) ** 2) : 0.32 + (t - 0.45) * 0.08
    profile.push(new Vector2(Math.max(0.001, r), y))
  }
  const body = new LatheGeometry(profile, 64)
  // Wavy hem: push the bottom ring up and down around the circumference
  const pos = body.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    if (y < -0.3) {
      const a = Math.atan2(pos.getZ(i), pos.getX(i))
      pos.setY(i, y + Math.sin(a * 6) * 0.05 * ((-0.3 - y) / 0.2))
    }
  }
  body.computeVertexNormals()
  g.add(part(body, PALETTE.ghost))
  for (const side of [-1, 1]) g.add(part(new SphereGeometry(0.045, 20, 14), PALETTE.ink, [side * 0.1, 0.12, 0.29]))
  g.add(part(new SphereGeometry(0.03, 16, 12), PALETTE.red, [0, 0.02, 0.31], [0, 0, 0]).translateY(0))
  for (const side of [-1, 1]) g.add(part(new CapsuleGeometry(0.06, 0.1, 8, 16), PALETTE.ghost, [side * 0.33, -0.02, 0.02], [0, 0, side * 0.9]))
  return g
}

/** A clapperboard: a slate, and a hinged clapper striped in the palette, propped open */
export function clapperboard(): Group {
  const g = new Group()
  g.add(part(box(0.78, 0.52, 0.08, 0.04), PALETTE.ink, [0, -0.09, 0]))
  // Lines on the slate
  for (const y of [-0.04, -0.16]) g.add(part(box(0.62, 0.025, 0.02, 0.01), PALETTE.cream, [0, y, 0.045]))
  // Clapper, hinged at its left end and opened a little
  const clapper = new Group()
  clapper.position.set(-0.39, 0.2, 0)
  clapper.rotation.z = 0.28
  const stripes = [PALETTE.cream, PALETTE.ink, PALETTE.cream, PALETTE.ink, PALETTE.cream, PALETTE.ink]
  stripes.forEach((c, i) => clapper.add(part(box(0.13, 0.11, 0.085, 0.015), c, [0.065 + i * 0.13, 0.055, 0])))
  g.add(clapper)
  // Base strip, same stripes, fixed
  stripes.forEach((c, i) => g.add(part(box(0.13, 0.09, 0.085, 0.015), i % 2 ? PALETTE.cream : PALETTE.ink, [-0.325 + i * 0.13, 0.215, 0])))
  return g
}

export const SCULPTS = { headphones, gamepad, ghost, clapperboard }
export type SculptName = keyof typeof SCULPTS
