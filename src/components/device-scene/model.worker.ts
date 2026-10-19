/// <reference lib="webworker" />
// The 3D arrangements off the main thread: loading, shader compiles and rendering never block
// scrolling. One worker serves every scene on the page, so three.js loads and parses once; each
// scene has its own canvas and renderer, addressed by id.
import { createArrangementRenderer, type FloatMotion } from './render'
import type { SceneName } from './arrangements'

type Message =
  | { type: 'init'; id: number; canvas: OffscreenCanvas; width: number; height: number; dpr: number; scene: SceneName; fov: number; rx: number; ry: number; float: FloatMotion }
  | { type: 'resize'; id: number; width: number; height: number; dpr: number }
  | { type: 'frame'; id: number; rx: number; ry: number; lift: number; t: number; enter: number }
  | { type: 'dispose'; id: number }

const renderers = new Map<number, Awaited<ReturnType<typeof createArrangementRenderer>>>()
// A scene can be disposed while its models are still loading; drop it when the load lands
const disposed = new Set<number>()

self.onmessage = async (e: MessageEvent<Message>) => {
  const msg = e.data
  if (msg.type === 'init') {
    try {
      const r = await createArrangementRenderer(msg.canvas, msg.width, msg.height, msg.dpr, msg.scene, msg.fov, { rx: msg.rx, ry: msg.ry }, msg.float)
      if (disposed.delete(msg.id)) { r.dispose(); return }
      renderers.set(msg.id, r)
      // The first frame is the slow one; it lands before the page swaps the model in
      const matrices = r.render(msg.rx, msg.ry)
      self.postMessage({ type: 'ready', id: msg.id, geometry: r.geometry, matrices })
    } catch (err) {
      self.postMessage({ type: 'error', id: msg.id, message: String(err) })
    }
  } else if (msg.type === 'resize') {
    renderers.get(msg.id)?.resize(msg.width, msg.height, msg.dpr)
  } else if (msg.type === 'frame') {
    // Each display's place in this frame goes back with it: the page lays the DOM screens on them
    // once the frame is drawn, so the two stay together
    const matrices = renderers.get(msg.id)?.render(msg.rx, msg.ry, msg.lift, msg.t, msg.enter)
    self.postMessage({ type: 'drawn', id: msg.id, matrices }, matrices ? [matrices.buffer] : [])
  } else if (msg.type === 'dispose') {
    const r = renderers.get(msg.id)
    if (r) { r.dispose(); renderers.delete(msg.id) } else disposed.add(msg.id)
  }
}
