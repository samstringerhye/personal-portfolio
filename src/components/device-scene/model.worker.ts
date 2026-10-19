/// <reference lib="webworker" />
// The 3D devices off the main thread: loading, shader compiles and rendering never block scrolling.
// One worker serves every scene on the page, so three.js loads and parses once; each scene has its
// own canvas and renderer, addressed by id.
import { createDeviceRenderer } from './render'
import type { DeviceName } from './shared'

type Message =
  | { type: 'init'; id: number; canvas: OffscreenCanvas; width: number; height: number; dpr: number; device: DeviceName; fov: number; rx: number; ry: number }
  | { type: 'resize'; id: number; width: number; height: number; dpr: number }
  | { type: 'frame'; id: number; rx: number; ry: number; lift: number }
  | { type: 'dispose'; id: number }

const renderers = new Map<number, Awaited<ReturnType<typeof createDeviceRenderer>>>()
// A scene can be disposed while its model is still loading; drop it when the load lands
const disposed = new Set<number>()

self.onmessage = async (e: MessageEvent<Message>) => {
  const msg = e.data
  if (msg.type === 'init') {
    try {
      const r = await createDeviceRenderer(msg.canvas, msg.width, msg.height, msg.dpr, msg.device, msg.fov, { rx: msg.rx, ry: msg.ry })
      if (disposed.delete(msg.id)) { r.dispose(); return }
      renderers.set(msg.id, r)
      // The first frame is the slow one; it lands before the page swaps the model in
      r.render(msg.rx, msg.ry)
      self.postMessage({ type: 'ready', id: msg.id, geometry: r.geometry })
    } catch (err) {
      self.postMessage({ type: 'error', id: msg.id, message: String(err) })
    }
  } else if (msg.type === 'resize') {
    renderers.get(msg.id)?.resize(msg.width, msg.height, msg.dpr)
  } else if (msg.type === 'frame') {
    renderers.get(msg.id)?.render(msg.rx, msg.ry, msg.lift)
    // The page moves the DOM screen to this frame's angle once it's drawn, so the two stay together
    self.postMessage({ type: 'drawn', id: msg.id })
  } else if (msg.type === 'dispose') {
    const r = renderers.get(msg.id)
    if (r) { r.dispose(); renderers.delete(msg.id) } else disposed.add(msg.id)
  }
}
