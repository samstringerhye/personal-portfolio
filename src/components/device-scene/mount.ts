// Mounts device scenes on any page (homepage cards, case study heroes) and carries a live
// arrangement across the page change between them. Each scene starts as it nears the viewport: the
// screens first, then the 3D arrangement once three.js and the models have loaded and the browser is
// idle. It shows (data-ready) once the models are up, or the lead device's flat screen if WebGL
// isn't available.
//
// A card and its case study hero share a transition:persist id, so the router moves the same live
// element (canvas, worker and tour included) from one page to the other. During that navigation the
// element is the view transition's only named part: the device glides to its new place while the
// rest of the page crossfades (data-device-nav, global.css) and the color shutter stands aside.
import { animations } from '../../data/tokens'
import { arrangementOf, type ScreenSource, type SceneName } from './arrangements'
import type { DeviceName } from './shared'

const stops = new Map<HTMLElement, Array<() => void>>()
const idle = () => new Promise<void>(resolve => ('requestIdleCallback' in window ? requestIdleCallback(() => resolve(), { timeout: 1500 }) : setTimeout(resolve, 200)))

// Builds one device's screen inside host
async function mountScreen(host: HTMLElement, screen: ScreenSource, device: DeviceName): Promise<() => void> {
  if (screen.kind === 'myfrontier') {
    const { mountMyFrontier } = await import('./myfrontier')
    return mountMyFrontier(host)
  }
  if (screen.kind === 'myfrontier-still') {
    const { mountMyFrontierStill } = await import('./myfrontier')
    return mountMyFrontierStill(host, screen.shot as never)
  }
  if (screen.kind === 'home') {
    const { mountHomeScreen } = await import('./homescreen')
    return mountHomeScreen(host)
  }
  const { mountTour } = await import('./tours')
  return mountTour(host, screen.name, device)
}

// A browser keeps only so many WebGL contexts, so the 3D arrangements stay live only within about
// a viewport and a half of the screen; the screens themselves keep playing
const near = new IntersectionObserver(entries => entries.forEach(e => {
  const scene = e.target as HTMLElement
  const state = live.get(scene)
  if (!state) return
  state.wanted = e.isIntersecting
  if (state.wanted) build(scene, state)
  else if (state.stop) { state.stop(); state.stop = null }
}), { rootMargin: '150% 0px' })
const live = new Map<HTMLElement, { faces: HTMLElement[]; wanted: boolean; building: boolean; stop: (() => void) | null }>()

async function build(scene: HTMLElement, state: { faces: HTMLElement[]; wanted: boolean; building: boolean; stop: (() => void) | null }) {
  if (state.building || state.stop) return
  state.building = true
  try {
    await idle()
    const { mountArrangement } = await import('./model')
    if (scene.isConnected && state.wanted) state.stop = await mountArrangement(scene, state.faces, scene.dataset.deviceScene as SceneName)
    // Scrolled away while the models loaded
    if (!state.wanted && state.stop) { state.stop(); state.stop = null }
  } catch (e) {
    // No WebGL or the models failed to load: the lead device's flat screen stands in
    console.warn('3D devices unavailable', e)
  }
  state.building = false
  scene.dataset.ready = ''
}

async function mount(scene: HTMLElement) {
  const own: Array<() => void> = []
  stops.set(scene, own)
  const name = scene.dataset.deviceScene as SceneName
  const { placements } = arrangementOf(name)
  // One host per device, each holding that device's screen. Without WebGL the lead device's host
  // shows its flat screen; in 3D the screens move into the arrangement's view (model.ts)
  const hosts = placements.map((_, i) => scene.querySelector<HTMLElement>(`.device-scene-host[data-index="${i}"]`)!)
  own.push(...await Promise.all(placements.map((p, i) => mountScreen(hosts[i], p.screen, p.device))))
  const state = { faces: hosts.map(h => h.querySelector<HTMLElement>('.device')!), wanted: true, building: false, stop: null as (() => void) | null }
  live.set(scene, state)
  near.observe(scene)
  own.push(() => {
    near.unobserve(scene)
    live.delete(scene)
    state.stop?.()
  })
  build(scene, state)
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
