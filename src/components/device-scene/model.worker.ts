/// <reference lib="webworker" />
// The 3D arrangements off the main thread: loading, shader compiles and rendering never block
// scrolling. One worker serves every scene on the page, so three.js loads and parses once, and
// every scene draws on one canvas, so the page holds one WebGL context (render.ts). Each frame goes
// back as a bitmap with the displays' places in it, so the page shows the frame and moves the
// screens onto it in the same step.
import { createArrangementRenderer, forget, isLost, type FloatMotion } from './render'
import type { SceneName } from './arrangements'
import type { Bleed } from './shared'

type Message =
  | { type: 'init'; id: number; width: number; height: number; dpr: number; bleed: Bleed; scene: SceneName; fov: number; rx: number; ry: number; float: FloatMotion }
  | { type: 'resize'; id: number; width: number; height: number; dpr: number; bleed: Bleed }
  | { type: 'frame'; id: number; rx: number; ry: number; lift: number; t: number; enter: number }
  | { type: 'dispose'; id: number }

let canvas = new OffscreenCanvas(1, 1)
const scenes = new Map<number, Awaited<ReturnType<typeof createArrangementRenderer>>>()
// A scene can be disposed while its models are still loading; drop it when the load lands
const disposed = new Set<number>()

// The context was taken back: every scene on it is gone. The page rebuilds them on a fresh canvas
function recover() {
  if (!isLost(canvas)) return false
  scenes.forEach((_, id) => self.postMessage({ type: 'lost', id }))
  scenes.clear()
  forget(canvas)
  canvas = new OffscreenCanvas(1, 1)
  return true
}

const build = (msg: Extract<Message, { type: 'init' }>) =>
  createArrangementRenderer(canvas, msg.width, msg.height, msg.dpr, msg.scene, msg.fov, { rx: msg.rx, ry: msg.ry }, msg.float, msg.bleed)

self.onmessage = async (e: MessageEvent<Message>) => {
  const msg = e.data
  if (msg.type === 'init') {
    try {
      recover()
      let r: Awaited<ReturnType<typeof build>>
      try {
        r = await build(msg)
      } catch (err) {
        // Built on a context that had just been lost: once more on a fresh one
        if (!recover()) throw err
        r = await build(msg)
      }
      if (disposed.delete(msg.id)) { r.dispose(); return }
      scenes.set(msg.id, r)
      // The first frame is the slow one; it lands before the page swaps the model in
      const matrices = r.render(msg.rx, msg.ry)
      const frame = canvas.transferToImageBitmap()
      self.postMessage({ type: 'ready', id: msg.id, geometry: r.geometry, matrices, frame }, [frame])
    } catch (err) {
      self.postMessage({ type: 'error', id: msg.id, message: String(err) })
    }
  } else if (msg.type === 'resize') {
    scenes.get(msg.id)?.resize(msg.width, msg.height, msg.dpr, msg.bleed)
  } else if (msg.type === 'frame') {
    // A lost context draws nothing without throwing, so look before drawing
    if (recover()) { self.postMessage({ type: 'drawn', id: msg.id }); return }
    const r = scenes.get(msg.id)
    if (!r) { self.postMessage({ type: 'drawn', id: msg.id }); return }
    try {
      const matrices = r.render(msg.rx, msg.ry, msg.lift, msg.t, msg.enter)
      const frame = canvas.transferToImageBitmap()
      self.postMessage({ type: 'drawn', id: msg.id, matrices, frame }, [matrices.buffer, frame])
    } catch {
      // The context was lost: no frame, but the page mustn't wait for one; then every scene rebuilds
      self.postMessage({ type: 'drawn', id: msg.id })
      recover()
    }
  } else if (msg.type === 'dispose') {
    const r = scenes.get(msg.id)
    if (r) { r.dispose(); scenes.delete(msg.id) } else disposed.add(msg.id)
  }
}
