// Mounts device scenes on any page (homepage cards, case study heroes) and carries a live device
// across the page change between them. Each scene starts as it nears the viewport: the tour first,
// then the 3D model once three.js and the model have loaded and the browser is idle. It shows
// (data-ready) once the model is up, or the flat screen if WebGL isn't available.
//
// A card and its case study hero share a transition:persist id, so the router moves the same live
// element (canvas, worker and tour included) from one page to the other. During that navigation the
// element is the view transition's only named part: the device glides to its new place while the
// rest of the page crossfades (data-device-nav, global.css) and the color shutter stands aside.
import { animations } from '../../data/tokens'
import type { SceneName } from '../DeviceScene.astro'
import type { DeviceName } from './shared'

const stops = new Map<HTMLElement, Array<() => void>>()
const idle = () => new Promise<void>(resolve => ('requestIdleCallback' in window ? requestIdleCallback(() => resolve(), { timeout: 1500 }) : setTimeout(resolve, 200)))

async function mount(scene: HTMLElement) {
  const own: Array<() => void> = []
  stops.set(scene, own)
  const name = scene.dataset.deviceScene as SceneName
  if (name === 'myfrontier') {
    const { mountMyFrontier } = await import('./myfrontier')
    own.push(mountMyFrontier(scene))
  } else if (name === 'whataburger') {
    const { mountHomeScreen } = await import('./homescreen')
    own.push(mountHomeScreen(scene))
  } else {
    const { mountTour } = await import('./tours')
    own.push(mountTour(scene, name))
  }
  try {
    await idle()
    const { mountDeviceModel } = await import('./model')
    const face = scene.querySelector<HTMLElement>('.device')
    const stage = scene.querySelector<HTMLElement>('.stage')
    if (face && stage && scene.isConnected) own.push(await mountDeviceModel(scene, face, stage, scene.dataset.device as DeviceName))
  } catch (e) {
    // No WebGL or the model failed to load: the flat screen stands in
    console.warn('3D device unavailable', e)
  }
  scene.dataset.ready = ''
}

let io: IntersectionObserver | null = null
function init() {
  io ??= new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return
    io!.unobserve(e.target)
    mount(e.target as HTMLElement)
  }), { rootMargin: '100% 0px' })
  // Persisted scenes arrive already bound and keep running
  document.querySelectorAll<HTMLElement>('.device-scene[data-device-scene]:not([data-bound])').forEach(scene => {
    scene.dataset.bound = ''
    io!.observe(scene)
  })
}

type NavEvent = Event & { sourceElement?: Element; from: URL; to: URL }
type SwapEvent = Event & { newDocument: Document; viewTransition: ViewTransition }
const persistId = (el: Element) => el.getAttribute('data-astro-transition-persist')
let moving: HTMLElement | null = null

// The scene that will travel: the clicked card's, or the hero's on the way back to the homepage
function travelling(e: NavEvent): HTMLElement | null {
  const card = e.sourceElement?.closest('.work-list-card')
  if (card) return card.querySelector<HTMLElement>('.device-scene[data-ready]')
  if (e.to.pathname !== '/') return null
  return document.querySelector<HTMLElement>('.cs-device-hero .device-scene[data-ready]')
}

// Flags the page for global.css's device crossfade, with its timings
function markNav(root: HTMLElement) {
  root.dataset.deviceNav = 'true'
  for (const [k, v] of Object.entries(animations.workCards.deviceNav)) root.style.setProperty(`--device-nav-${k}`, `${v}s`)
}

type MountWindow = Window & { __deviceScenesBound?: boolean }
const mw = window as MountWindow
if (!mw.__deviceScenesBound) {
  mw.__deviceScenesBound = true
  document.addEventListener('astro:page-load', init)
  document.addEventListener('astro:before-preparation', e => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const scene = travelling(e as NavEvent)
    if (!scene) return
    moving = scene
    scene.style.viewTransitionName = 'device'
    markNav(document.documentElement)
  })
  document.addEventListener('astro:before-swap', e => {
    const doc = (e as SwapEvent).newDocument
    // Only the travelling scene persists; the incoming page gets a fresh one for any other match
    for (const [scene, own] of stops) {
      const id = persistId(scene)
      const keep = scene === moving && id && doc.querySelector(`[data-astro-transition-persist="${id}"]`)
      if (keep) continue
      own.forEach(stop => stop())
      stops.delete(scene)
      if (id) scene.removeAttribute('data-astro-transition-persist')
    }
    // The swap copies the incoming page's <html> attributes over ours; carry the flag across, and
    // clear it once the transition has played (page-load can come sooner)
    if (!moving) return
    markNav(doc.documentElement)
    const scene = moving
    moving = null
    ;(e as SwapEvent).viewTransition.finished.finally(() => {
      scene.style.viewTransitionName = ''
      delete document.documentElement.dataset.deviceNav
    })
  })
}
