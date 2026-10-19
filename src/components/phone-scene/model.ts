// Puts a phone scene's screen into the 3D iPhone. The model renders in a worker on an
// OffscreenCanvas where the browser supports it (phone-model.worker.ts), on the main thread
// otherwise (phone-render.ts). This module only turns the phone and keeps the DOM screen on its
// display, so the page never loads three.js here.
import { animations } from '../../data/tokens'
import { MODEL_URL, SCREEN_WIDTH, type PhoneGeometry } from './phone-shared'

interface Backend {
  geometry: PhoneGeometry
  resize: (w: number, h: number) => void
  frame: (rx: number, ry: number) => void
  dispose: () => void
}

const tilt = animations.workCards.phone
// Vertical field of view of a lens of this focal length on a full-frame (24mm tall) sensor
const fov = 2 * Math.atan(12 / tilt.lensMm) * 180 / Math.PI
const perspective = (h: number) => `${(h / 2) / Math.tan((fov / 2) * Math.PI / 180)}px`
// The phone is small on the page; past 1.5x the extra pixels cost more than they show
const dpr = () => Math.min(1.5, window.devicePixelRatio || 1)

// No probe context here: creating one costs a main-thread stall. A worker without WebGL reports
// an error and the main thread takes over
const offscreen = () => typeof HTMLCanvasElement.prototype.transferControlToOffscreen === 'function'

function workerBackend(canvas: HTMLCanvasElement, w: number, h: number): Promise<Backend> {
  const offscreen = canvas.transferControlToOffscreen()
  const worker = new Worker(new URL('./phone-model.worker.ts', import.meta.url), { type: 'module' })
  return new Promise((resolve, reject) => {
    worker.onerror = e => { worker.terminate(); reject(e) }
    worker.onmessage = e => {
      if (e.data.type === 'error') { worker.terminate(); reject(new Error(e.data.message)); return }
      if (e.data.type !== 'ready') return
      resolve({
        geometry: e.data.geometry,
        resize: (width, height) => worker.postMessage({ type: 'resize', width, height }),
        frame: (rx, ry) => worker.postMessage({ type: 'frame', rx, ry }),
        dispose: () => worker.terminate(),
      })
    }
    worker.postMessage({ type: 'init', canvas: offscreen, width: w, height: h, dpr: dpr(), url: MODEL_URL, fov, rx: tilt.restPitch, ry: tilt.restYaw }, [offscreen])
  })
}

async function mainBackend(canvas: HTMLCanvasElement, w: number, h: number): Promise<Backend> {
  const { createPhoneRenderer } = await import('./phone-render')
  const phone = await createPhoneRenderer(canvas, w, h, dpr(), MODEL_URL, fov)
  phone.render(tilt.restPitch, tilt.restYaw)
  return { geometry: phone.geometry, resize: phone.resize, frame: phone.render, dispose: phone.dispose }
}

/** The CSS matrix that lays the 360px-wide screen on the display: the phone's rotation (three.js
    XYZ order, z = 0) applied to the screen plane, at s px per world unit, y flipped for CSS */
function screenMatrix(rx: number, ry: number, s: number, fh: number) {
  const ca = Math.cos(rx), sa = Math.sin(rx), cb = Math.cos(ry), sb = Math.sin(ry)
  const r = [[cb, 0, sb], [sa * sb, ca, -sa * cb], [-ca * sb, sa, ca * cb]]
  const tx = -SCREEN_WIDTH / 2, ty = fh / 2
  const t = [0, 1, 2].map(i => r[i][0] * tx + r[i][1] * ty)
  return `matrix3d(${[
    s * r[0][0], -s * r[1][0], s * r[2][0], 0,
    -s * r[0][1], s * r[1][1], -s * r[2][1], 0,
    s * r[0][2], -s * r[1][2], s * r[2][2], 0,
    s * t[0], -s * t[1], s * t[2], 1,
  ].join(',')})`
}

let px = 0
let py = 0
let tracking = false

// Mounts the model in art around face (the scene's .phone). Returns a stop function
export async function mountPhoneModel(art: HTMLElement, face: HTMLElement, stage: HTMLElement) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!tracking) {
    tracking = true
    window.addEventListener('pointermove', e => { px = e.clientX / window.innerWidth - 0.5; py = e.clientY / window.innerHeight - 0.5 }, { passive: true })
  }

  const w = stage.clientWidth, h = stage.clientHeight
  let canvas = document.createElement('canvas')
  let backend: Backend
  if (offscreen()) {
    try {
      backend = await workerBackend(canvas, w, h)
    } catch {
      // The transfer used up that canvas
      canvas = document.createElement('canvas')
      backend = await mainBackend(canvas, w, h)
    }
  } else {
    backend = await mainBackend(canvas, w, h)
  }
  const { screenAspect, viewHeight } = backend.geometry
  const fh = SCREEN_WIDTH / screenAspect

  // One perspective container and one transformed element, the screen at the display's scale
  const view = document.createElement('div')
  view.className = 'phone-scene-view'
  view.style.perspective = perspective(h)
  view.append(face)
  stage.append(view, canvas)
  face.style.cssText += `;position:absolute;left:50%;top:50%;transform-origin:0 0;aspect-ratio:${screenAspect}`
  art.classList.add('is-3d')

  let scale = h / viewHeight
  const ro = new ResizeObserver(() => {
    const nw = stage.clientWidth, nh = stage.clientHeight
    if (!nw || !nh) return
    scale = nh / viewHeight
    view.style.perspective = perspective(nh)
    backend.resize(nw, nh)
  })
  ro.observe(stage)

  let rx = tilt.restPitch
  let ry = tilt.restYaw
  let on = false
  let raf = 0
  const frame = (t: number) => {
    if (!on) return
    if (!reduced) {
      const r = art.getBoundingClientRect()
      const scroll = Math.max(-1, Math.min(1, ((r.top + r.height / 2) / window.innerHeight - 0.5) * 2))
      const tx = tilt.restPitch - py * tilt.pointerPitch + scroll * tilt.scrollPitch
      const ty = tilt.restYaw + px * tilt.pointerYaw + Math.sin(t / (tilt.swayPeriod * 1000)) * tilt.sway
      rx += (tx - rx) * tilt.follow
      ry += (ty - ry) * tilt.follow
    }
    backend.frame(rx, ry)
    face.style.transform = screenMatrix(rx, ry, scale, fh)
    raf = requestAnimationFrame(frame)
  }
  face.style.transform = screenMatrix(rx, ry, scale, fh)
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
    backend.dispose()
  }
}
