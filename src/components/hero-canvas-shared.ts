export interface GeneratedGeometry {
  posX: Float32Array
  posY: Float32Array
  dist: Float32Array
  total: number
}

export type ArrangementGenerator = (
  numRays: number,
  dotsPerRay: number,
  spacing: number,
  innerRadius: number,
) => GeneratedGeometry

const TWO_PI = Math.PI * 2
const PHI = (1 + Math.sqrt(5)) / 2

export function roundedSquareWave(t: number, delta: number, amplitude: number, frequency: number): number {
  return ((2 * amplitude) / Math.PI) * Math.atan(Math.sin(TWO_PI * t * frequency) / delta)
}

export function generateSpiral(numRays: number, dotsPerRay: number, spacing: number, _innerRadius: number): GeneratedGeometry {
  const total = numRays * dotsPerRay
  const posX = new Float32Array(total)
  const posY = new Float32Array(total)
  const dist = new Float32Array(total)
  const goldenAngle = TWO_PI / (PHI * PHI)
  for (let i = 0; i < total; i++) {
    const angle = i * goldenAngle
    const r = spacing * Math.sqrt(i)
    const x = Math.cos(angle) * r
    const y = Math.sin(angle) * r
    posX[i] = x
    posY[i] = y
    dist[i] = Math.sqrt(x * x + y * y)
  }
  return { posX, posY, dist, total }
}

export function generateConcentric(numRays: number, dotsPerRay: number, spacing: number, innerRadius: number): GeneratedGeometry {
  const total = numRays * dotsPerRay
  const posX = new Float32Array(total)
  const posY = new Float32Array(total)
  const dist = new Float32Array(total)
  let idx = 0
  for (let ring = 0; ring < dotsPerRay; ring++) {
    const r = innerRadius + ring * spacing
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * TWO_PI
      posX[idx] = Math.cos(angle) * r
      posY[idx] = Math.sin(angle) * r
      dist[idx] = r
      idx++
    }
  }
  return { posX, posY, dist, total }
}

export function generateHexagonal(_numRays: number, dotsPerRay: number, spacing: number, _innerRadius: number): GeneratedGeometry {
  const maxR = dotsPerRay * spacing
  const rowH = spacing * Math.sqrt(3) / 2
  const rows = Math.ceil(maxR * 2 / rowH)
  const tmpX: number[] = [], tmpY: number[] = [], tmpD: number[] = []
  for (let row = -rows; row <= rows; row++) {
    const y = row * rowH
    const offset = (row % 2) * spacing * 0.5
    const cols = Math.ceil(maxR * 2 / spacing)
    for (let col = -cols; col <= cols; col++) {
      const x = col * spacing + offset
      const d2 = x * x + y * y
      if (d2 > maxR * maxR) continue
      tmpX.push(x)
      tmpY.push(y)
      tmpD.push(Math.sqrt(d2))
    }
  }
  return {
    posX: new Float32Array(tmpX),
    posY: new Float32Array(tmpY),
    dist: new Float32Array(tmpD),
    total: tmpX.length,
  }
}

export function generateRose(numRays: number, dotsPerRay: number, spacing: number, _innerRadius: number): GeneratedGeometry {
  const total = numRays * dotsPerRay
  const posX = new Float32Array(total)
  const posY = new Float32Array(total)
  const dist = new Float32Array(total)
  const k = Math.max(2, Math.round(numRays / 20))
  for (let i = 0; i < total; i++) {
    const theta = (i / total) * TWO_PI * k
    const r = Math.cos(k * theta) * dotsPerRay * spacing * 0.3
    const absR = Math.abs(r)
    const sign = r >= 0 ? 1 : -1
    const x = Math.cos(theta) * absR * sign
    const y = Math.sin(theta) * absR * sign
    posX[i] = x
    posY[i] = y
    dist[i] = Math.sqrt(x * x + y * y)
  }
  return { posX, posY, dist, total }
}

export function sizeTaper(n: number, sizeStart: number, sizeMid: number, sizeEnd: number): number {
  const inv = 1 - n
  return inv * inv * sizeStart + 2 * inv * n * sizeMid + n * n * sizeEnd
}

/**
 * The pixel-peeper loupe, in world units. Dots under it are drawn `mag` times larger from a smaller
 * patch around its center, and each dot's red, green and blue layers line up side by side.
 */
export interface Lens {
  x: number
  y: number
  r: number
  mag: number
  /** Shared wave time under the glass, so a dot's layers sit together instead of trailing */
  t0: number
  /** This layer's place in the triad: -1 red, 0 green, 1 blue */
  sign: number
  /** 1 hides this layer under the glass (the ink dot) */
  fade: number
  /** Gap between subpixels, in magnified dot widths */
  split: number
  dotRadius: number
}

/** The loupe as the main thread tracks it, in CSS px over the canvas; strength 0–1 opens it */
export interface LensInput {
  x: number
  y: number
  strength: number
}

export interface LensConfig {
  radius: number
  magnification: number
  subpixelSplit: number
}

/** Fills `lens` (layer fields untouched) from CSS-px input; false when the loupe is closed */
export function lensToWorld(lens: Lens, input: LensInput | null, w: number, h: number, zoom: number, cfg: LensConfig, dotRadius: number): boolean {
  if (!input || input.strength <= 0) return false
  const e = input.strength * input.strength * (3 - 2 * input.strength)
  lens.x = (input.x - w / 2) / zoom
  lens.y = (h / 2 - input.y) / zoom
  lens.r = (cfg.radius * e) / zoom
  lens.mag = 1 + (cfg.magnification - 1) * e
  lens.split = cfg.subpixelSplit * e
  lens.dotRadius = dotRadius
  return true
}

/** Each layer's place in the loupe, in the order both renderers build them: red, green, blue, ink */
export const LAYER_TRIAD = [
  { sign: -1, fade: 0 },
  { sign: 0, fade: 0 },
  { sign: 1, fade: 0 },
  { sign: 0, fade: 1 },
]

export function emptyLens(): Lens {
  return { x: 0, y: 0, r: 0, mag: 1, t0: 0, sign: 0, fade: 0, split: 0, dotRadius: 0 }
}

/** The pointer's push on the dots, in world units: dots within r of (x, y) move out and grow,
    eased by strength (0–1). amount is this layer's share of the push (the RGB split) */
export interface Push {
  x: number
  y: number
  r: number
  strength: number
  push: number
  grow: number
  amount: number
}

let placedX = 0
let placedY = 0

function placeDot(
  x0: number, y0: number, d: number, time: number,
  waveSpeed: number, propagation: number, waveSharpness: number,
  waveAmplitude: number, waveFrequency: number, baseScale: number, twistAmount: number,
): void {
  const t = time * waveSpeed - d / propagation
  const wave = roundedSquareWave(t, waveSharpness + (0.2 * d) / 50, waveAmplitude, waveFrequency)
  const scale = wave + baseScale
  const tw = wave * twistAmount
  const px = x0 * scale
  const py = y0 * scale
  const cosT = Math.cos(tw)
  const sinT = Math.sin(tw)
  placedX = px * cosT - py * sinT
  placedY = px * sinT + py * cosT
}

export function updateDots(
  matArr: Float32Array, total: number,
  posX: Float32Array, posY: Float32Array, dist: Float32Array,
  dotScales: Float32Array, time: number,
  waveSpeed: number, propagation: number, waveSharpness: number,
  waveAmplitude: number, waveFrequency: number, baseScale: number, twistAmount: number,
  lens: Lens | null = null,
  push: Push | null = null,
): void {
  const r2 = lens ? lens.r * lens.r : 0
  const pr2 = push && push.strength > 0 ? push.r * push.r : 0
  for (let i = 0; i < total; i++) {
    placeDot(posX[i], posY[i], dist[i], time, waveSpeed, propagation, waveSharpness, waveAmplitude, waveFrequency, baseScale, twistAmount)
    let x = placedX
    let y = placedY
    let s = dotScales[i]
    if (pr2) {
      const dx = x - push!.x
      const dy = y - push!.y
      const d2 = dx * dx + dy * dy
      if (d2 < pr2 && d2 > 1e-9) {
        const d = Math.sqrt(d2)
        // Smoothstep falloff to the rim
        let f = 1 - d / push!.r
        f = f * f * (3 - 2 * f) * push!.strength
        const out = f * push!.push * push!.r * push!.amount / d
        x += dx * out
        y += dy * out
        s *= 1 + f * push!.grow
      }
    }
    if (lens) {
      const dx = x - lens.x
      const dy = y - lens.y
      if (dx * dx + dy * dy < r2) {
        placeDot(posX[i], posY[i], dist[i], lens.t0, waveSpeed, propagation, waveSharpness, waveAmplitude, waveFrequency, baseScale, twistAmount)
        const mx = lens.x + (placedX - lens.x) * lens.mag
        const my = lens.y + (placedY - lens.y) * lens.mag
        const ex = mx - lens.x
        const ey = my - lens.y
        // Dots magnified past the rim are covered by the glass
        if (ex * ex + ey * ey < r2) {
          x = mx + lens.sign * lens.split * 2 * lens.dotRadius * s * lens.mag
          y = my
          s *= lens.mag * (1 - lens.fade)
        } else {
          s = 0
        }
      }
    }
    const o = i * 16
    matArr[o] = s
    matArr[o + 5] = s
    matArr[o + 10] = s
    matArr[o + 12] = x
    matArr[o + 13] = y
  }
}
