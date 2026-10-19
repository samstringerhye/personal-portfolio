// Puts a device scene's screen into its 3D model. The models render in one shared worker, each on
// its own OffscreenCanvas, where the browser supports it (model.worker.ts), on the main thread
// otherwise (render.ts). This module only turns the device and keeps the DOM screen on its display,
// so the page never loads three.js here.
import { animations } from '../../data/tokens'
import { DEVICES, viewHeightAt, type DeviceGeometry, type DeviceName } from './shared'

interface Backend {
  geometry: DeviceGeometry
  resize: (w: number, h: number, dpr: number) => void
  /** Draws the model at this angle and lift, then calls drawn once it's on the canvas */
  frame: (rx: number, ry: number, lift: number, drawn: () => void) => void
  dispose: () => void
}

const tilt = animations.workCards.phone
// Vertical field of view of a lens of this focal length on a full-frame (24mm tall) sensor
const fov = 2 * Math.atan(12 / tilt.lensMm) * 180 / Math.PI
const perspective = (h: number) => `${(h / 2) / Math.tan((fov / 2) * Math.PI / 180)}px`
// Up to 2x on retina screens, within a pixel budget: a full-row canvas at 2x is ~4M pixels a frame,
// so large canvases settle near 1.5x while smaller ones get the full 2x
const MAX_PIXELS = 2.4e6
const dprFor = (w: number, h: number) => Math.min(2, window.devicePixelRatio || 1, Math.sqrt(MAX_PIXELS / Math.max(1, w * h)))

// No probe context here: creating one costs a main-thread stall. A worker without WebGL reports
// an error and the main thread takes over
const offscreen = () => typeof HTMLCanvasElement.prototype.transferControlToOffscreen === 'function'

// One worker for every scene, so three.js loads and parses once. Replies are routed by scene id
let worker: Worker | null = null
let nextId = 0
const pending = new Map<number, { resolve: (geometry: DeviceGeometry) => void; reject: (e: Error) => void }>()
const drawnCallbacks = new Map<number, () => void>()
function sharedWorker(): Worker {
  if (worker) return worker
  const w = new Worker(new URL('./model.worker.ts', import.meta.url), { type: 'module' })
  w.onmessage = e => {
    if (e.data.type === 'drawn') {
      const done = drawnCallbacks.get(e.data.id)
      drawnCallbacks.delete(e.data.id)
      done?.()
      return
    }
    const waiting = pending.get(e.data.id)
    if (!waiting) return
    pending.delete(e.data.id)
    if (e.data.type === 'ready') waiting.resolve(e.data.geometry)
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

async function workerBackend(canvas: HTMLCanvasElement, w: number, h: number, device: DeviceName, rest: Rest): Promise<Backend> {
  const offscreen = canvas.transferControlToOffscreen()
  const target = sharedWorker()
  const id = nextId++
  const geometry = await new Promise<DeviceGeometry>((resolve, reject) => {
    pending.set(id, { resolve, reject })
    target.postMessage({ type: 'init', id, canvas: offscreen, width: w, height: h, dpr: dprFor(w, h), device, fov, rx: rest.pitch, ry: rest.yaw }, [offscreen])
  })
  return {
    geometry,
    resize: (width, height, dpr) => target.postMessage({ type: 'resize', id, width, height, dpr }),
    frame: (rx, ry, lift, drawn) => {
      drawnCallbacks.set(id, drawn)
      target.postMessage({ type: 'frame', id, rx, ry, lift })
    },
    dispose: () => {
      drawnCallbacks.delete(id)
      target.postMessage({ type: 'dispose', id })
    },
  }
}

async function mainBackend(canvas: HTMLCanvasElement, w: number, h: number, device: DeviceName, rest: Rest): Promise<Backend> {
  const { createDeviceRenderer } = await import('./render')
  const r = await createDeviceRenderer(canvas, w, h, dprFor(w, h), device, fov, { rx: rest.pitch, ry: rest.yaw })
  r.render(rest.pitch, rest.yaw)
  return { geometry: r.geometry, resize: r.resize, frame: (rx, ry, lift, drawn) => { r.render(rx, ry, lift); drawn() }, dispose: r.dispose }
}

/** The CSS matrix that lays the screen (fw px wide) on the display: the device's rotation
    (three.js XYZ order, z = 0) applied to the screen plane, at s px per world unit, y flipped.
    World units are the screen's layout pixels (render.ts scales the model so). The device turns
    about pivot, which carries the display to pivot − R·pivot, and rises by lift along its tilted
    floor's up (render.ts) */
function screenMatrix(rx: number, ry: number, s: number, fw: number, fh: number, pivot: [number, number, number], lift: number) {
  const ca = Math.cos(rx), sa = Math.sin(rx), cb = Math.cos(ry), sb = Math.sin(ry)
  const r = [[cb, 0, sb], [sa * sb, ca, -sa * cb], [-ca * sb, sa, ca * cb]]
  const tx = -fw / 2, ty = fh / 2
  const up = [0, ca * lift, sa * lift]
  const t = [0, 1, 2].map(i => r[i][0] * tx + r[i][1] * ty + pivot[i] - (r[i][0] * pivot[0] + r[i][1] * pivot[1] + r[i][2] * pivot[2]) + up[i])
  return `matrix3d(${[
    s * r[0][0], -s * r[1][0], s * r[2][0], 0,
    -s * r[0][1], s * r[1][1], -s * r[2][1], 0,
    s * r[0][2], -s * r[1][2], s * r[2][2], 0,
    s * t[0], -s * t[1], s * t[2], 1,
  ].join(',')})`
}

let tracking = false
// When the page last scrolled or a device was last dragged: while neither happens, only the idle
// sway is moving the devices, and they redraw at half rate
let lastInput = 0

interface Rest { yaw: number; pitch: number }
// Each device can set its own rest angle; the rest of the motion is shared
const restOf = (device: DeviceName): Rest => {
  const own = (animations.workCards.devices as Record<string, { restYaw: number; restPitch: number }>)[device]
  return { yaw: own?.restYaw ?? tilt.restYaw, pitch: own?.restPitch ?? tilt.restPitch }
}

// Mounts the device's model in art around face (the scene's .device). Returns a stop function
export async function mountDeviceModel(art: HTMLElement, face: HTMLElement, stage: HTMLElement, device: DeviceName) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!tracking) {
    tracking = true
    window.addEventListener('scroll', () => { lastInput = performance.now() }, { passive: true })
  }

  const rest = restOf(device)
  const w = stage.clientWidth, h = stage.clientHeight
  let canvas = document.createElement('canvas')
  let backend: Backend
  if (offscreen()) {
    try {
      backend = await workerBackend(canvas, w, h, device, rest)
    } catch {
      // The transfer used up that canvas
      canvas = document.createElement('canvas')
      backend = await mainBackend(canvas, w, h, device, rest)
    }
  } else {
    backend = await mainBackend(canvas, w, h, device, rest)
  }
  const { screenAspect } = backend.geometry
  const fw = DEVICES[device].screenWidth
  const fh = fw / screenAspect

  // One perspective container and one transformed element, the screen at the display's scale
  const view = document.createElement('div')
  view.className = 'device-scene-view'
  view.style.perspective = perspective(h)
  view.append(face)
  stage.append(view, canvas)
  face.style.cssText += `;position:absolute;left:50%;top:50%;width:${fw}px;transform-origin:0 0;aspect-ratio:${screenAspect}`
  art.classList.add('is-3d')

  // The last angle and lift drawn: the model and the screen only redraw when they change (or on
  // resize). One frame is in flight at a time, and the DOM screen moves when the model's frame is
  // drawn, so the two stay together even while the worker runs behind the page
  let drawn: [number, number, number] | null = null
  let busy = false
  // The screen's scale and shift follow the renderer's framing (render.ts)
  const [cx, cy] = backend.geometry.center
  let scale = 1
  const fit = (nw: number, nh: number) => {
    scale = nh / viewHeightAt(backend.geometry, nw, nh)
    view.style.translate = `${-cx * scale}px ${cy * scale}px`
  }
  fit(w, h)
  const ro = new ResizeObserver(() => {
    const nw = stage.clientWidth, nh = stage.clientHeight
    if (!nw || !nh) return
    fit(nw, nh)
    view.style.perspective = perspective(nh)
    backend.resize(nw, nh, dprFor(nw, nh))
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
  const pivot = backend.geometry.pivot
  const liftHeight = backend.geometry.liftHeight
  const place = (a: number, b: number, l: number) => { face.style.transform = screenMatrix(a, b, scale, fw, fh, pivot, l * liftHeight) }

  // Devices don't follow the pointer; they turn when dragged. The grab area is the device's own box
  // (the scene bleeds past it, over the caption's link), and a vertical swipe still scrolls the page
  const grab = document.createElement('div')
  grab.className = 'device-scene-grab'
  art.append(grab)
  let drag: { id: number; x: number; y: number; rx: number; ry: number } | null = null
  let dragTo: [number, number] | null = null
  // After a drag the device eases back to rest at dragReturn, then follows the scroll again
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

  // Scroll parallax: the device sits a share of its box's distance from the viewport's center back
  // toward it, so it drifts against the page. Read from the box, which the offset doesn't move
  let parallax = 0
  const frame = (t: number) => {
    if (!on) return
    raf = requestAnimationFrame(frame)
    const box = (art.parentElement ?? art).getBoundingClientRect()
    const fromCenter = box.top + box.height / 2 - window.innerHeight / 2
    if (!reduced) {
      const offset = Math.round(-fromCenter * tilt.parallax)
      if (offset !== parallax) art.style.setProperty('--parallax', `${(parallax = offset)}px`)
    }
    const liftTo = drag ? 1 : 0
    lift = reduced ? liftTo : lift + (liftTo - lift) * 0.18
    if (Math.abs(lift - liftTo) < 0.002) lift = liftTo
    if (dragTo) {
      rx += (dragTo[0] - rx) * 0.4
      ry += (dragTo[1] - ry) * 0.4
    } else if (!reduced) {
      const scroll = Math.max(-1, Math.min(1, fromCenter / window.innerHeight * 2))
      const tx = rest.pitch + scroll * tilt.scrollPitch
      const ty = rest.yaw + Math.sin(t / (tilt.swayPeriod * 1000)) * tilt.sway
      const rate = returning ? tilt.dragReturn : tilt.follow
      rx += (tx - rx) * rate
      ry += (ty - ry) * rate
      if (returning && Math.abs(tx - rx) + Math.abs(ty - ry) < 0.01) returning = false
    }
    if (busy) return
    if (drawn && Math.abs(rx - drawn[0]) + Math.abs(ry - drawn[1]) + Math.abs(lift - drawn[2]) < 1e-5) return
    if (t - lastInput > 1000 && tick++ % 2) return
    const [a, b, l] = drawn = [rx, ry, lift]
    busy = true
    backend.frame(a, b, l, () => { busy = false; place(a, b, l) })
  }
  place(rx, ry, 0)
  const io = new IntersectionObserver(([e]) => {
    on = e.isIntersecting
    cancelAnimationFrame(raf)
    if (on) raf = requestAnimationFrame(frame)
  })
  io.observe(art)

  return () => {
    on = false
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    grab.remove()
    backend.dispose()
  }
}
