/// <reference lib="webworker" />
// The 3D device off the main thread: loading, shader compiles and rendering never block scrolling
import { createDeviceRenderer } from './render'
import type { DeviceName } from './shared'

type Message =
  | { type: 'init'; canvas: OffscreenCanvas; width: number; height: number; dpr: number; device: DeviceName; fov: number; rx: number; ry: number }
  | { type: 'resize'; width: number; height: number }
  | { type: 'frame'; rx: number; ry: number }

let renderer: Awaited<ReturnType<typeof createDeviceRenderer>> | null = null

self.onmessage = async (e: MessageEvent<Message>) => {
  const msg = e.data
  if (msg.type === 'init') {
    try {
      renderer = await createDeviceRenderer(msg.canvas, msg.width, msg.height, msg.dpr, msg.device, msg.fov, { rx: msg.rx, ry: msg.ry })
      // The first frame is the slow one; it lands before the page swaps the model in
      renderer.render(msg.rx, msg.ry)
      self.postMessage({ type: 'ready', geometry: renderer.geometry })
    } catch (err) {
      self.postMessage({ type: 'error', message: String(err) })
    }
  } else if (msg.type === 'resize') {
    renderer?.resize(msg.width, msg.height)
  } else if (msg.type === 'frame') {
    renderer?.render(msg.rx, msg.ry)
  }
}
