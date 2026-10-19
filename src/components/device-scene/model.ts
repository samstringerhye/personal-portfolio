// Puts a device scene's screen into its 3D model. The model renders in a worker on an
// OffscreenCanvas where the browser supports it (model.worker.ts), on the main thread otherwise
// (render.ts). This module only turns the device and keeps the DOM screen on its display, so the
// page never loads three.js here.
import { animations } from '../../data/tokens'
import { DEVICES, viewHeightAt, type DeviceGeometry, type DeviceName } from './shared'

interface Backend {
  geometry: DeviceGeometry
  resize: (w: number, h: number) => void
  frame: (rx: number, ry: number) => void
  dispose: () => void
}

const tilt = animations.workCards.phone
// Vertical field of view of a lens of this focal length on a full-frame (24mm tall) sensor
const fov = 2 * Math.atan(12 / tilt.lensMm) * 180 / Math.PI
const perspective = (h: number) => `${(h / 2) / Math.tan((fov / 2) * Math.PI / 180)}px`
// The device is small on the page; past 1.5x the extra pixels cost more than they show
const dpr = () => Math.min(1.5, window.devicePixelRatio || 1)

// No probe context here: creating one costs a main-thread stall. A worker without WebGL reports
// an error and the main thread takes over
const offscreen = () => typeof HTMLCanvasElement.prototype.transferControlToOffscreen === 'function'

function workerBackend(canvas: HTMLCanvasElement, w: number, h: number, device: DeviceName, rest: Rest): Promise<Backend> {
  const offscreen = canvas.transferControlToOffscreen()
  const worker = new Worker(new URL('./model.worker.ts', import.meta.url), { type: 'module' })
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
    worker.postMessage({ type: 'init', canvas: offscreen, width: w, height: h, dpr: dpr(), device, fov, rx: rest.pitch, ry: rest.yaw }, [offscreen])
  })
}

async function mainBackend(canvas: HTMLCanvasElement, w: number, h: number, device: DeviceName, rest: Rest): Promise<Backend> {
  const { createDeviceRenderer } = await import('./render')
  const r = await createDeviceRenderer(canvas, w, h, dpr(), device, fov, { rx: rest.pitch, ry: rest.yaw })
  r.render(rest.pitch, rest.yaw)
  return { geometry: r.geometry, resize: r.resize, frame: r.render, dispose: r.dispose }
}

/** The CSS matrix that lays the screen (fw px wide) on the display: the device's rotation
    (three.js XYZ order, z = 0) applied to the screen plane, at s px per world unit, y flipped */
function screenMatrix(rx: number, ry: number, s: number, fw: number, fh: number) {
  const ca = Math.cos(rx), sa = Math.sin(rx), cb = Math.cos(ry), sb = Math.sin(ry)
  const r = [[cb, 0, sb], [sa * sb, ca, -sa * cb], [-ca * sb, sa, ca * cb]]
  const tx = -fw / 2, ty = fh / 2
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
    window.addEventListener('pointermove', e => { px = e.clientX / window.innerWidth - 0.5; py = e.clientY / window.innerHeight - 0.5 }, { passive: true })
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

  // The screen's scale and shift follow the renderer's framing (render.ts)
  const [cx, cy] = backend.geometry.center
  let scale = 1
  // The floor shadow sits under the body and spans most of its width, whichever way it fits
  const floor = art.querySelector<HTMLElement>('.floor')
  const { fill } = DEVICES[device]
  const fit = (nw: number, nh: number) => {
    scale = nh / viewHeightAt(backend.geometry, nw, nh)
    view.style.translate = `${-cx * scale}px ${cy * scale}px`
    if (floor) {
      floor.style.top = `${nh / 2 + backend.geometry.viewHeight * fill * scale / 2}px`
      const span = backend.geometry.viewWidth * fill * scale * 0.8
      floor.style.width = `${span}px`
      floor.style.height = `${span * 0.14}px`
    }
  }
  fit(w, h)
  const ro = new ResizeObserver(() => {
    const nw = stage.clientWidth, nh = stage.clientHeight
    if (!nw || !nh) return
    fit(nw, nh)
    view.style.perspective = perspective(nh)
    backend.resize(nw, nh)
  })
  ro.observe(stage)

  let rx = rest.pitch
  let ry = rest.yaw
  let on = false
  let raf = 0
  const frame = (t: number) => {
    if (!on) return
    if (!reduced) {
      const r = art.getBoundingClientRect()
      const scroll = Math.max(-1, Math.min(1, ((r.top + r.height / 2) / window.innerHeight - 0.5) * 2))
      const tx = rest.pitch - py * tilt.pointerPitch + scroll * tilt.scrollPitch
      const ty = rest.yaw + px * tilt.pointerYaw + Math.sin(t / (tilt.swayPeriod * 1000)) * tilt.sway
      rx += (tx - rx) * tilt.follow
      ry += (ty - ry) * tilt.follow
    }
    backend.frame(rx, ry)
    face.style.transform = screenMatrix(rx, ry, scale, fw, fh)
    raf = requestAnimationFrame(frame)
  }
  face.style.transform = screenMatrix(rx, ry, scale, fw, fh)
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
