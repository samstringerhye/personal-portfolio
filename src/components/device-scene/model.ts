// Puts a card's DOM screens into its 3D device arrangement. The arrangements render in one shared
// worker where the browser supports it (model.worker.ts), on the main thread otherwise (render.ts). This module turns the arrangement and lays each screen on its
// display from the matrices the renderer reports, so the page never loads three.js here.
import { animations } from '../../data/tokens'
import { DEVICES, viewHeightAt, type ArrangementGeometry, type Bleed, type DeviceName } from './shared'
import { arrangementOf, type SceneName } from './arrangements'
import type { FloatMotion } from './render'

interface Backend {
  geometry: ArrangementGeometry
  /** Where each display sits in the first frame */
  first: Float32Array
  /** w × h is the stage; the canvas runs past it by bleed */
  resize: (w: number, h: number, dpr: number, bleed: Bleed) => void
  /** Draws a frame, then hands back where each display sits once it's on the canvas (null when
      no frame could be drawn) */
  frame: (rx: number, ry: number, lift: number, t: number, enter: number, drawn: (matrices: Float32Array | null) => void) => void
  /** Called if the WebGL context is lost and the scene can't draw again */
  onLost: (lost: () => void) => void
  dispose: () => void
}

const tilt = animations.workCards.phone
const float: FloatMotion & { enterFrom: number; enterTo: number } = animations.workCards.float
// Vertical field of view of a lens of this focal length on a full-frame (24mm tall) sensor
const fov = 2 * Math.atan(12 / tilt.lensMm) * 180 / Math.PI
const perspective = (h: number) => `${(h / 2) / Math.tan((fov / 2) * Math.PI / 180)}px`
// Up to 2x on retina screens, within a pixel budget. A full-row canvas at 2x is ~6M pixels a frame;
// at a lower budget it settled near 1.4x and the browser scaled it up, which read as soft edges and
// stair-stepping. Only the cards on screen render, one or two at a time
const MAX_PIXELS = 6.4e6
const dprFor = (w: number, h: number, [l, t, r, b]: Bleed) => Math.min(2, window.devicePixelRatio || 1, Math.sqrt(MAX_PIXELS / Math.max(1, (w + l + r) * (h + t + b))))
// How far the canvas runs past the stage, as shares of its size, so the shadow is never cut off:
// sideways up to the window's edges, and further down than up, where the shadow falls
const BLEED = { side: 0.35, top: 0.05, bottom: 0.25 }

// No probe context here: creating one costs a main-thread stall. A worker without WebGL reports
// an error and the main thread takes over
const offscreen = () => typeof OffscreenCanvas === 'function' && typeof ImageBitmapRenderingContext === 'function'

// One worker for every scene, so three.js loads and parses once. Replies are routed by scene id
let worker: Worker | null = null
let nextId = 0
interface Ready { geometry: ArrangementGeometry; matrices: Float32Array; frame: ImageBitmap }
const pending = new Map<number, { resolve: (r: Ready) => void; reject: (e: Error) => void }>()
const drawnCallbacks = new Map<number, (matrices: Float32Array | null, frame?: ImageBitmap) => void>()
const lostCallbacks = new Map<number, () => void>()
function sharedWorker(): Worker {
  if (worker) return worker
  const w = new Worker(new URL('./model.worker.ts', import.meta.url), { type: 'module' })
  w.onmessage = e => {
    if (e.data.type === 'lost') {
      lostCallbacks.get(e.data.id)?.()
      return
    }
    if (e.data.type === 'drawn') {
      const done = drawnCallbacks.get(e.data.id)
      drawnCallbacks.delete(e.data.id)
      if (done) done(e.data.matrices ?? null, e.data.frame)
      else e.data.frame?.close()
      return
    }
    const waiting = pending.get(e.data.id)
    if (!waiting) { e.data.frame?.close(); return }
    pending.delete(e.data.id)
    if (e.data.type === 'ready') waiting.resolve(e.data)
    else waiting.reject(new Error(e.data.message))
  }
  // The worker itself failed to start: every waiting scene falls back to the main thread
  w.onerror = e => {
    pending.forEach(p => p.reject(new Error(e.message)))
    pending.clear()
    w.terminate()
    if (worker === w) worker = null
  }
  return (worker = w)
}

// The worker draws each frame off screen and sends it back as a bitmap with the displays' places:
// the frame goes up on the canvas and the screens move onto it in the same task, so the browser
// paints them together however fast the page scrolls
async function workerBackend(canvas: HTMLCanvasElement, w: number, h: number, bleed: Bleed, scene: SceneName, rest: Rest): Promise<Backend> {
  const target = sharedWorker()
  const id = nextId++
  const { geometry, matrices, frame } = await new Promise<Ready>((resolve, reject) => {
    pending.set(id, { resolve, reject })
    target.postMessage({ type: 'init', id, width: w, height: h, dpr: dprFor(w, h, bleed), bleed, scene, fov, rx: rest.pitch, ry: rest.yaw, float })
  })
  const context = canvas.getContext('bitmaprenderer')!
  const show = (bitmap: ImageBitmap) => {
    if (canvas.width !== bitmap.width) canvas.width = bitmap.width
    if (canvas.height !== bitmap.height) canvas.height = bitmap.height
    context.transferFromImageBitmap(bitmap)
  }
  show(frame)
  return {
    geometry,
    first: matrices,
    resize: (width, height, dpr, bleed) => target.postMessage({ type: 'resize', id, width, height, dpr, bleed }),
    frame: (rx, ry, lift, t, enter, drawn) => {
      drawnCallbacks.set(id, (m, bitmap) => { if (bitmap) show(bitmap); drawn(m) })
      target.postMessage({ type: 'frame', id, rx, ry, lift, t, enter })
    },
    onLost: lost => { lostCallbacks.set(id, lost) },
    dispose: () => {
      drawnCallbacks.delete(id)
      lostCallbacks.delete(id)
      target.postMessage({ type: 'dispose', id })
    },
  }
}

async function mainBackend(canvas: HTMLCanvasElement, w: number, h: number, bleed: Bleed, scene: SceneName, rest: Rest): Promise<Backend> {
  const { createArrangementRenderer } = await import('./render')
  const r = await createArrangementRenderer(canvas, w, h, dprFor(w, h, bleed), scene, fov, { rx: rest.pitch, ry: rest.yaw }, float, bleed)
  return {
    geometry: r.geometry,
    first: r.render(rest.pitch, rest.yaw),
    resize: r.resize,
    frame: (rx, ry, lift, t, enter, drawn) => {
      try { drawn(r.render(rx, ry, lift, t, enter)) } catch { drawn(null) }
    },
    onLost: lost => canvas.addEventListener('webglcontextlost', lost, { once: true }),
    dispose: r.dispose,
  }
}

/** The CSS matrix3d that lays a screen (fw × fh CSS px, top left origin) on its display. w holds
    the display's world matrix at o (column-major, meters, origin at its center, y up), a is the
    meters per screen pixel, s the stage's CSS px per meter; CSS y runs down */
function screenMatrix(w: ArrayLike<number>, o: number, a: number, s: number, fw: number, fh: number) {
  // A: screen px → display meters; then W; then world → CSS (y flipped)
  const A = [[a, 0, 0, -a * fw / 2], [0, -a, 0, a * fh / 2], [0, 0, 1, 0], [0, 0, 0, 1]]
  const flip = [s, -s, s, 1]
  const m: number[] = new Array(16)
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      let v = 0
      for (let k = 0; k < 4; k++) v += w[o + k * 4 + r] * A[k][c]
      m[c * 4 + r] = v * flip[r]
    }
  }
  return `matrix3d(${m.join(',')})`
}

/** Back to front: the order the screens stack in. By their centers' depth, then corrected wherever
    two overlap on screen, by which display a ray from the camera meets first there: one device
    turned in front of part of another must cover that part of its screen too. Displays never pass
    through each other, so one of two is in front across all of their overlap. m holds each
    display's world matrix, half its width and height in its own units, the camera on the z axis */
function stacking(m: Float32Array, half: number[][], distance: number): number[] {
  const n = half.length
  const col = (i: number, c: number) => [m[i * 16 + c * 4], m[i * 16 + c * 4 + 1], m[i * 16 + c * 4 + 2]]
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  const sub = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
  const eye = [0, 0, distance]
  // Is display j in front of display i, behind it, or not over it at all, seen at points across i
  const ahead = (i: number, j: number) => {
    const [xi, yi, oi] = [col(i, 0), col(i, 1), col(i, 3)]
    const [xj, yj, zj, oj] = [col(j, 0), col(j, 1), col(j, 2), col(j, 3)]
    let votes = 0
    for (const u of [-0.45, 0, 0.45]) for (const v of [-0.45, 0, 0.45]) {
      const lu = u * 2 * half[i][0], lv = v * 2 * half[i][1]
      const p = [0, 1, 2].map(k => oi[k] + xi[k] * lu + yi[k] * lv)
      const ray = sub(p, eye)
      const denom = dot(ray, zj)
      if (Math.abs(denom) < 1e-9) continue
      // Where the ray meets j's plane: t = 1 at p
      const t = dot(sub(oj, eye), zj) / denom
      if (t <= 0) continue
      const hit = sub([0, 1, 2].map(k => eye[k] + ray[k] * t), oj)
      if (Math.abs(dot(hit, xj) / dot(xj, xj)) > half[j][0] || Math.abs(dot(hit, yj) / dot(yj, yj)) > half[j][1]) continue
      votes += t < 1 ? 1 : -1
    }
    return Math.sign(votes)
  }
  const order = Array.from({ length: n }, (_, i) => i).sort((p, q) => m[p * 16 + 14] - m[q * 16 + 14])
  // A few passes of swaps settle three or four screens
  for (let pass = 0; pass < n; pass++) {
    for (let k = 0; k < n - 1; k++) {
      const [back, front] = [order[k], order[k + 1]]
      // The one placed in front is actually behind where they overlap
      if (ahead(front, back) > 0 || ahead(back, front) < 0) [order[k], order[k + 1]] = [front, back]
    }
  }
  return order
}

let tracking = false
// When the page last scrolled or a device was last dragged: while neither happens, only the idle
// motion is moving the devices, and they redraw at half rate
let lastInput = 0

interface Rest { yaw: number; pitch: number }
type Angles = Record<string, { restYaw: number; restPitch: number }>
// The arrangement's own rest angle, else its lead device's; the rest of the motion is shared
const restOf = (scene: SceneName, device: DeviceName): Rest => {
  const own = (animations.workCards.scenes as Angles)[scene] ?? (animations.workCards.devices as Angles)[device]
  return { yaw: own?.restYaw ?? tilt.restYaw, pitch: own?.restPitch ?? tilt.restPitch }
}

// Mounts the scene's arrangement in art, with faces (each placement's DOM screen, in order) laid on
// their displays. Returns a stop function
export async function mountArrangement(art: HTMLElement, faces: HTMLElement[], scene: SceneName, onLost?: () => void) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!tracking) {
    tracking = true
    window.addEventListener('scroll', () => { lastInput = performance.now() }, { passive: true })
  }
  const arrangement = arrangementOf(scene)
  const rest = restOf(scene, arrangement.placements[0].device)
  const floats = !reduced && arrangement.placements.some(p => p.float)

  const stage = document.createElement('div')
  stage.className = 'stage device-scene-stage'
  art.append(stage)
  const w = stage.clientWidth, h = stage.clientHeight
  const bleedOf = (w: number, h: number): Bleed => {
    const r = stage.getBoundingClientRect()
    const right = document.documentElement.clientWidth - r.right
    return [Math.max(0, Math.min(r.left, w * BLEED.side)), h * BLEED.top, Math.max(0, Math.min(right, w * BLEED.side)), h * BLEED.bottom].map(Math.round) as Bleed
  }
  let bleed = bleedOf(w, h)
  const canvas = document.createElement('canvas')
  let backend: Backend
  if (offscreen()) {
    try {
      backend = await workerBackend(canvas, w, h, bleed, scene, rest)
    } catch {
      backend = await mainBackend(canvas, w, h, bleed, scene, rest)
    }
  } else {
    backend = await mainBackend(canvas, w, h, bleed, scene, rest)
  }

  // One perspective container behind the canvas holding every screen, each with one transform.
  // Both run past the stage by the bleed; the perspective and the screens stay centered on the stage
  const view = document.createElement('div')
  view.className = 'device-scene-view'
  const spread = (nw: number, nh: number) => {
    const [l, t, r, b] = bleed
    for (const el of [view, canvas]) Object.assign(el.style, { inset: 'auto', maxWidth: 'none', left: `${-l}px`, top: `${-t}px`, width: `${nw + l + r}px`, height: `${nh + t + b}px` })
    view.style.perspective = perspective(nh)
    view.style.perspectiveOrigin = `${l + nw / 2}px ${t + nh / 2}px`
    view.style.setProperty('--cx', `${l + nw / 2}px`)
    view.style.setProperty('--cy', `${t + nh / 2}px`)
  }
  spread(w, h)
  stage.append(view, canvas)
  // Each screen's own styles and place, restored when the arrangement is torn down
  const homes = faces.map(face => ({ parent: face.parentElement!, css: face.style.cssText }))
  const sizes = arrangement.placements.map((p, i) => {
    const spec = DEVICES[p.device]
    const fw = spec.screenWidth, fh = fw / backend.geometry.aspects[i]
    const face = faces[i]
    view.append(face)
    face.dataset.device = p.device
    face.style.cssText += `;position:absolute;left:var(--cx);top:var(--cy);width:${fw}px;transform-origin:0 0;aspect-ratio:${backend.geometry.aspects[i]}`
    return { fw, fh, a: spec.realWidth / fw }
  })
  art.classList.add('is-3d')

  // The screens' scale and shift follow the renderer's framing (render.ts)
  const [cx, cy] = backend.geometry.center
  let scale = 1
  // The camera's distance from the arrangement (meters), on the z axis, as render.ts places it
  let distance = 1
  const fit = (nw: number, nh: number) => {
    const vh = viewHeightAt(backend.geometry, nw, nh)
    scale = nh / vh
    distance = (vh / 2) / Math.tan((fov / 2) * Math.PI / 180)
    view.style.translate = `${-cx * scale}px ${cy * scale}px`
  }
  fit(w, h)
  // Lays every screen on its display; nearer displays stack over farther ones
  const place = (m: Float32Array) => {
    const order = stacking(m, sizes.map(z => [z.a * z.fw / 2, z.a * z.fh / 2]), distance)
    faces.forEach((face, i) => {
      const { fw, fh, a } = sizes[i]
      face.style.transform = screenMatrix(m, i * 16, a, scale, fw, fh)
      face.style.zIndex = String(order.indexOf(i) + 1)
    })
  }
  place(backend.first)

  // The last state drawn: the arrangement and its screens only redraw when it changes (or on
  // resize). One frame is in flight at a time, and the screens move when the model's frame is
  // drawn, so the two stay together even while the worker runs behind the page
  let drawn: number[] | null = null
  let busy = false
  const ro = new ResizeObserver(() => {
    const nw = stage.clientWidth, nh = stage.clientHeight
    if (!nw || !nh) return
    bleed = bleedOf(nw, nh)
    fit(nw, nh)
    spread(nw, nh)
    backend.resize(nw, nh, dprFor(nw, nh, bleed), bleed)
    drawn = null
  })
  ro.observe(stage)

  let rx = rest.pitch
  let ry = rest.yaw
  // 0 resting on the floor, 1 lifted while held: the shadow softens and lightens under it
  let lift = 0
  let on = false
  let raf = 0
  let tick = 0

  // The devices don't follow the pointer; the arrangement turns as one when dragged. The grab area
  // is the whole scene, and a vertical swipe still scrolls the page
  const grab = document.createElement('div')
  grab.className = 'device-scene-grab'
  art.append(grab)
  let drag: { id: number; x: number; y: number; rx: number; ry: number } | null = null
  let dragTo: [number, number] | null = null
  // After a drag the arrangement eases back to rest at dragReturn, then follows the scroll again
  let returning = false
  const limit = tilt.dragPitchLimit
  grab.addEventListener('pointerdown', e => {
    if (e.button !== 0) return
    // Keep the drag when the pointer leaves the box (throws for a pointer that's already gone)
    try { grab.setPointerCapture(e.pointerId) } catch {}
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, rx, ry }
    dragTo = [rx, ry]
    grab.classList.add('is-dragging')
    lastInput = performance.now()
  })
  grab.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return
    const b = grab.getBoundingClientRect()
    const pitch = drag.rx + (e.clientY - drag.y) / b.height * tilt.dragPitch
    dragTo = [Math.max(rest.pitch - limit, Math.min(rest.pitch + limit, pitch)), drag.ry + (e.clientX - drag.x) / b.width * tilt.dragYaw]
    lastInput = performance.now()
  })
  const release = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return
    drag = null
    dragTo = null
    grab.classList.remove('is-dragging')
    // Spun all the way round: come back the short way
    ry = rest.yaw + Math.atan2(Math.sin(ry - rest.yaw), Math.cos(ry - rest.yaw))
    returning = true
    if (reduced) { rx = rest.pitch; ry = rest.yaw }
  }
  grab.addEventListener('pointerup', release)
  grab.addEventListener('pointercancel', release)

  // Scroll parallax: the arrangement sits a share of its box's distance from the viewport's center
  // back toward it, so it drifts against the page. Read from the box, which the offset doesn't move
  let parallax = 0
  // No parallax where the layout stacks: text and device share one column there
  const stacked = window.matchMedia('(max-width: 64rem)')
  const smooth = (x: number) => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c) }
  const frame = (now: number) => {
    if (!on) return
    raf = requestAnimationFrame(frame)
    const box = (art.parentElement ?? art).getBoundingClientRect()
    const fromCenter = box.top + box.height / 2 - window.innerHeight / 2
    if (!reduced) {
      // Held within a viewport's height of the center: a frame that runs mid-jump, before the card
      // stops, mustn't leave it far out of place
      const near = Math.max(-window.innerHeight, Math.min(window.innerHeight, fromCenter))
      const offset = stacked.matches ? 0 : Math.round(-near * tilt.parallax)
      if (offset !== parallax) art.style.setProperty('--parallax', `${(parallax = offset)}px`)
    }
    // Floating devices drift up into place as the card's center rises through the viewport
    const at = (box.top + box.height / 2) / window.innerHeight
    const enter = floats ? smooth((float.enterFrom - at) / (float.enterFrom - float.enterTo)) : 1
    const t = floats ? now / 1000 : 0
    const liftTo = drag ? 1 : 0
    lift = reduced ? liftTo : lift + (liftTo - lift) * 0.18
    if (Math.abs(lift - liftTo) < 0.002) lift = liftTo
    if (dragTo) {
      rx += (dragTo[0] - rx) * 0.4
      ry += (dragTo[1] - ry) * 0.4
    } else if (!reduced) {
      const scroll = Math.max(-1, Math.min(1, fromCenter / window.innerHeight * 2))
      const tx = rest.pitch + scroll * tilt.scrollPitch
      const ty = rest.yaw + Math.sin(now / (tilt.swayPeriod * 1000)) * tilt.sway
      const rate = returning ? tilt.dragReturn : tilt.follow
      rx += (tx - rx) * rate
      ry += (ty - ry) * rate
      if (returning && Math.abs(tx - rx) + Math.abs(ty - ry) < 0.01) returning = false
    }
    if (busy) return
    const state = [rx, ry, lift, enter]
    if (!floats && drawn && state.every((v, i) => Math.abs(v - drawn![i]) < 1e-5)) return
    if (now - lastInput > 1000 && tick++ % 2) return
    drawn = state
    busy = true
    backend.frame(rx, ry, lift, t, enter, m => { busy = false; if (m) place(m) })
  }
  // Running a little past the card's box, which the parallax and the canvas's bleed reach beyond
  const io = new IntersectionObserver(([e]) => {
    on = e.isIntersecting
    cancelAnimationFrame(raf)
    if (on) raf = requestAnimationFrame(frame)
  }, { rootMargin: '25% 0px' })
  io.observe(art)

  // Tears the 3D down and puts the screens back in their hosts, still playing, ready for the next
  // mount (mount.ts keeps only the arrangements near the viewport live)
  let stopped = false
  const stop = () => {
    if (stopped) return
    stopped = true
    on = false
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    backend.dispose()
    faces.forEach((face, i) => { homes[i].parent.append(face); face.style.cssText = homes[i].css })
    grab.remove()
    stage.remove()
    art.classList.remove('is-3d')
  }
  // The context was taken back (iOS does this): tear down, and the caller builds the scene again
  backend.onLost(() => { stop(); onLost?.() })
  return stop
}
