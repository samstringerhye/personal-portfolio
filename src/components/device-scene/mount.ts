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
import { DEVICES, type DeviceName } from './shared'

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
  if (screen.kind === 'none') {
    // A dark display, seen only if the device is spun round to face the camera
    const spec = DEVICES[device]
    host.insertAdjacentHTML('beforeend', '<div class="device device-off"></div>')
    const face = host.querySelector<HTMLElement>('.device')!
    face.style.setProperty('--aspect', String(spec.aspect))
    face.style.setProperty('--layout-w', `${spec.screenWidth}px`)
    return () => {}
  }
  if (screen.kind === 'home') {
    const { mountHomeScreen } = await import('./homescreen')
    return mountHomeScreen(host, screen.view)
  }
  const { mountTour } = await import('./tours')
  return mountTour(host, screen.name, device)
}

// A browser keeps only so many WebGL contexts, so the 3D arrangements aren't all live at once. Each
// builds once it's within two viewports of the screen, well before it scrolls in, and is torn down
// only past four, so scrolling back and forth never catches one rebuilding; the screens themselves
// keep playing
const near = new IntersectionObserver(entries => entries.forEach(e => {
  const scene = e.target as HTMLElement
  const state = live.get(scene)
  if (!state || !e.isIntersecting) return
  state.wanted = true
  build(scene, state)
}), { rootMargin: '200% 0px' })
const far = new IntersectionObserver(entries => entries.forEach(e => {
  const state = live.get(e.target as HTMLElement)
  if (!state || e.isIntersecting) return
  state.wanted = false
  if (state.stop) { state.stop(); state.stop = null }
}), { rootMargin: '400% 0px' })
const live = new Map<HTMLElement, Live>()

type Live = { faces: HTMLElement[]; wanted: boolean; building: boolean; stop: (() => void) | null; tries: number }
// A failed build tries again after these waits, then the flat screen stays
const RETRIES = [1000, 4000]

async function build(scene: HTMLElement, state: Live) {
  if (state.building || state.stop) return
  state.building = true
  // A lost context (iOS takes them back) tears the arrangement down; build it again
  const lost = () => {
    state.stop = null
    if (state.wanted && scene.isConnected) window.setTimeout(() => build(scene, state), 300)
  }
  try {
    await idle()
    const { mountArrangement } = await import('./model')
    if (scene.isConnected && state.wanted) state.stop = await mountArrangement(scene, state.faces, scene.dataset.deviceScene as SceneName, lost)
    state.tries = 0
    // Scrolled away while the models loaded
    if (!state.wanted && state.stop) { state.stop(); state.stop = null }
  } catch (e) {
    // No WebGL or the models failed to load: the lead device's flat screen stands in, and a couple
    // more tries follow in case the context was only briefly unavailable
    console.warn('3D devices unavailable', e)
    const wait = RETRIES[state.tries++]
    if (wait !== undefined) window.setTimeout(() => { if (state.wanted && scene.isConnected) build(scene, state) }, wait)
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
  const state: Live = { faces: hosts.map(h => h.querySelector<HTMLElement>('.device')!), wanted: true, building: false, stop: null, tries: 0 }
  live.set(scene, state)
  near.observe(scene)
  far.observe(scene)
  own.push(() => {
    near.unobserve(scene)
    far.unobserve(scene)
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
  }), { rootMargin: '250% 0px' })
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
let frozen: HTMLElement | null = null
let pausedAnimations: Animation[] = []
let playingVideos: HTMLVideoElement[] = []

// Hold the exact device and screen frame while the page scrolls into alignment and the shared
// element moves between its card and case-study hero.
function freezeScene(scene: HTMLElement) {
  if (frozen === scene) return
  if (frozen) resumeScene(frozen)
  frozen = scene
  scene.dataset.deviceFreeze = ''
  pausedAnimations = scene.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running' || animation.pending)
  pausedAnimations.forEach(animation => animation.pause())
  playingVideos = [...scene.querySelectorAll('video')].filter(video => !video.paused)
  playingVideos.forEach(video => video.pause())
}

function resumeScene(scene: HTMLElement) {
  if (frozen !== scene) return
  delete scene.dataset.deviceFreeze
  pausedAnimations.forEach(animation => animation.play())
  pausedAnimations = []
  playingVideos.forEach(video => { void video.play().catch(() => {}) })
  playingVideos = []
  scene.dispatchEvent(new Event('device-resume'))
  frozen = null
}

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

// Where the case study hero's stage starts below the top of the viewport (DeviceHero.astro): the nav,
// then the page margin beside the title on desktop, or the back button's clearance above the device
// on phones. Resolved through a probe so the CSS values stay in one place
function heroStageTop(): number {
  const desktop = window.matchMedia('(min-width: 64.0625rem)').matches
  const probe = document.createElement('div')
  probe.style.cssText = `position:absolute;visibility:hidden;height:calc(var(--nav-height) + ${desktop ? 'var(--page-margin)' : 'var(--touch-target) + var(--cs-heading-gap) + var(--cs-caption-gap)'})`
  document.body.append(probe)
  const top = probe.getBoundingClientRect().height
  probe.remove()
  return top
}

// A card's stage and its hero's are the same size, so scrolling the card to the hero's place first
// lets the device stay put and its title line up as the page changes around it
function alignThenGo(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('.work-list-card a[href^="/work/"]')
  const scene = link?.closest('.work-list-card')?.querySelector<HTMLElement>('.device-scene[data-ready]')
  const stage = scene?.parentElement
  if (!link || !stage || !scene) return
  const max = document.documentElement.scrollHeight - window.innerHeight
  const target = Math.min(max, Math.max(0, window.scrollY + stage.getBoundingClientRect().top - heroStageTop()))
  if (Math.abs(target - window.scrollY) < 4) return
  e.preventDefault()
  const go = () => import('astro:transitions/client').then(({ navigate }) => navigate(link.href, { sourceElement: link })).catch(error => {
    resumeScene(scene)
    throw error
  })
  freezeScene(scene)
  const lenis = (window as Window & { __siteLenis?: { scrollTo: (t: number, o: object) => void } | null }).__siteLenis
  const duration = animations.workCards.deviceNav.align
  if (lenis) {
    lenis.scrollTo(target, { duration, easing: (t: number) => 1 - Math.pow(1 - t, 4), lock: true, force: true, onComplete: go })
  } else {
    window.scrollTo({ top: target, behavior: 'smooth' })
    setTimeout(go, duration * 1000)
  }
}

type MountWindow = Window & { __deviceScenesBound?: boolean }
const mw = window as MountWindow
if (!mw.__deviceScenesBound) {
  mw.__deviceScenesBound = true
  // Capture phase, ahead of the router's click handler, which skips clicks already default-prevented
  window.addEventListener('click', alignThenGo, { capture: true })
  document.addEventListener('astro:page-load', init)
  document.addEventListener('astro:before-preparation', e => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const scene = travelling(e as NavEvent)
    if (!scene) return
    moving = scene
    freezeScene(scene)
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
    // The card's text already sits where the hero's does: no entrance to replay
    doc.querySelector('.cs-device-hero')?.setAttribute('data-carried', '')
    const scene = moving
    moving = null
    ;(e as SwapEvent).viewTransition.finished.finally(() => {
      scene.style.viewTransitionName = ''
      delete document.documentElement.dataset.deviceNav
      resumeScene(scene)
    })
  })
}
