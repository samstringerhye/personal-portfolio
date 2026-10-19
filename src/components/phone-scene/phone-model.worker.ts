/// <reference lib="webworker" />
// The 3D phone off the main thread: loading, shader compiles and rendering never block scrolling
import { createPhoneRenderer } from './phone-render'

type Message =
  | { type: 'init'; canvas: OffscreenCanvas; width: number; height: number; dpr: number; url: string; rx: number; ry: number }
  | { type: 'resize'; width: number; height: number }
  | { type: 'frame'; rx: number; ry: number }

let phone: Awaited<ReturnType<typeof createPhoneRenderer>> | null = null

self.onmessage = async (e: MessageEvent<Message>) => {
  const msg = e.data
  if (msg.type === 'init') {
    try {
      phone = await createPhoneRenderer(msg.canvas, msg.width, msg.height, msg.dpr, msg.url)
      // The first frame is the slow one; it lands before the page swaps the phone in
      phone.render(msg.rx, msg.ry)
      self.postMessage({ type: 'ready', geometry: phone.geometry })
    } catch (err) {
      self.postMessage({ type: 'error', message: String(err) })
    }
  } else if (msg.type === 'resize') {
    phone?.resize(msg.width, msg.height)
  } else if (msg.type === 'frame') {
    phone?.render(msg.rx, msg.ry)
  }
}
