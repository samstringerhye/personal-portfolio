// Screens for the device arrangements: published screens stepped through with taps, pushes and
// scrolls, looping while the card is on screen, or a single published screen held still (a tour
// with no steps). Timings live in animations.workCards.tours; reduced motion holds on the first
// screen.
import { animations } from '../../data/tokens'
import { DEVICES, whenUnheld, type DeviceName } from './shared'
import { addBrowser } from './browser'

type Point = readonly [number, number]
type Step =
  | { hold: string }
  /** A tap at a point on the current screen, as fractions of the whole screen image */
  | { tap: Point }
  /** Scroll the current screen to a share of its overflow (0 top, 1 bottom) */
  | { scroll: number; over: string }
  /** Move to another screen: push slides it in from the right, drop reveals it from the top
      (a menu opening), fade crossfades */
  | { push: string } | { drop: string } | { fade: string }

interface Tour {
  /** Screens under /motion/<tour>/, with their width over height */
  shots: Record<string, number>
  steps: Step[]
  /** A website: the domain in its browser's address bar, and the color at the top of its pages,
      under the status bar (browser.ts) */
  site?: { url: string; page: string }
  /** A looping video on a screen, over the part of the image it stands in for: the shot it plays
      on, its box as fractions of that image (x, y, width, height), the file under /motion/<tour>/,
      and an overlay image (the page's UI over the video) cut to the same box */
  video?: { shot: string; box: readonly [number, number, number, number]; src: string; overlay?: string; dim?: readonly [number, number] }
}

// Every screen is one the case study publishes (scripts/motion/device-screens.mjs)
export const TOURS = {
  cvs: {
    site: { url: 'cvs.com', page: '#f8f8f8' },
    shots: { home: 1280 / 798, shop: 1280 / 798, brand: 1280 / 821 },
    steps: [
      { hold: 'home' }, { tap: [0.169, 0.082] }, { drop: 'shop' },
      { hold: 'shop' }, { tap: [0.563, 0.164] }, { push: 'brand' },
      { hold: 'brand' }, { fade: 'home' },
    ],
  },
  samsung: {
    site: { url: 'samsung.com', page: '#ffffff' },
    shots: { home: 1100 / 2464, category: 1100 / 1584 },
    steps: [
      { hold: 'home' }, { scroll: 1, over: 'homeScroll' }, { hold: 'appliances' },
      { tap: [0.451, 0.955] }, { push: 'category' },
      { hold: 'category' }, { scroll: 0.62, over: 'categoryScroll' }, { hold: 'bestSellers' },
      { fade: 'home' },
    ],
  },
  // The relaunched homepage from the Figma templates, its hero playing the brand anthem, scrolled
  // down through the products to the dividend story
  amica: {
    site: { url: 'amica.com', page: '#00a890' },
    shots: { home: 1440 / 2207 },
    video: { shot: 'home', box: [0, 58 / 2207, 1, 793 / 2207], src: 'anthem.mp4', overlay: 'home-overlay.webp', dim: [0, 88 / 793] },
    steps: [
      { hold: 'hero' }, { scroll: 0.55, over: 'homeScroll' }, { hold: 'products' },
      { scroll: 1, over: 'restScroll' }, { hold: 'dividends' }, { scroll: 0, over: 'backScroll' },
    ],
  },
  bespoke: {
    site: { url: 'samsung.com', page: '#f9f9f9' },
    shots: { depth: 1200 / 853, colors: 1200 / 853, summary: 1200 / 853 },
    steps: [
      { hold: 'depth' }, { tap: [0.85, 0.2] }, { fade: 'colors' },
      { hold: 'colors' }, { tap: [0.874, 0.885] }, { fade: 'summary' },
      { hold: 'summary' }, { fade: 'depth' },
    ],
  },
  // The phones beside them, each on one published mobile screen
  'cvs-mobile': { site: { url: 'cvs.com', page: '#f9f9f9' }, shots: { home: 720 / 1525 }, steps: [] },
  'amica-mobile': { site: { url: 'amica.com', page: '#00a890' }, shots: { home: 720 / 1561 }, steps: [] },
  'samsung-mobile': { site: { url: 'samsung.com', page: '#ffffff' }, shots: { home: 540 / 1156 }, steps: [] },
  'bespoke-mobile': { site: { url: 'samsung.com', page: '#f9f9f9' }, shots: { depth: 720 / 1543 }, steps: [] },
} satisfies Record<string, Tour>
export type TourName = keyof typeof TOURS

const push = 'cubic-bezier(.32,.72,0,1)', inOut = 'cubic-bezier(.7,0,.2,1)'
const ms = (s: number) => s * 1000
const wait = (s: number) => new Promise<void>(r => setTimeout(r, ms(s)))

const TEMPLATE = `<div class="floor" aria-hidden="true"></div>
  <div class="stage"></div>
  <div class="device"><div class="screen"></div></div>`

// Builds the screen inside art, sized for device, and loops the tour while it is on screen.
// Returns a stop function
export function mountTour(art: HTMLElement, name: TourName, kind: DeviceName): () => void {
  const tour: Tour = TOURS[name]
  const { moves } = animations.workCards.tours
  const times = ((animations.workCards.tours as Record<string, unknown>)[name] ?? {}) as Record<string, number>
  const spec = DEVICES[kind]
  art.insertAdjacentHTML('beforeend', TEMPLATE)
  const device = art.querySelector<HTMLElement>('.device')!
  const screen = art.querySelector<HTMLElement>('.screen')!
  device.style.setProperty('--aspect', String(spec.aspect))
  device.style.setProperty('--layout-w', `${spec.screenWidth}px`)
  if (tour.site) addBrowser(device, kind, tour.site.url, tour.site.page)

  const shots: Record<string, HTMLDivElement> = {}
  for (const [shot, ar] of Object.entries(tour.shots)) {
    const d = document.createElement('div')
    d.className = 'shot'
    d.dataset.ar = String(ar)
    d.innerHTML = `<img src="/motion/${name}/${shot}.webp" alt="" decoding="async">`
    screen.append(d)
    shots[shot] = d
  }
  // The video plays in its box on its shot, the page's UI cut out over it; it pauses with the tour
  let video: HTMLVideoElement | null = null
  if (tour.video) {
    const [x, y, w, h] = tour.video.box
    const box = document.createElement('div')
    box.className = 'shot-video'
    Object.assign(box.style, { left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` })
    video = document.createElement('video')
    Object.assign(video, { src: `/motion/${name}/${tour.video.src}`, muted: true, loop: true, playsInline: true, preload: 'metadata' })
    video.setAttribute('aria-hidden', 'true')
    box.append(video)
    if (tour.video.dim) {
      const bar = document.createElement('div')
      bar.className = 'shot-video-dim'
      Object.assign(bar.style, { top: `${tour.video.dim[0] * 100}%`, height: `${tour.video.dim[1] * 100}%` })
      box.append(bar)
    }
    if (tour.video.overlay) box.insertAdjacentHTML('beforeend', `<img src="/motion/${name}/${tour.video.overlay}" alt="" decoding="async">`)
    shots[tour.video.shot].append(box)
  }
  const first = Object.keys(tour.shots)[0]
  // Each screen is as tall as its image at the screen's width, and never shorter than the screen
  const fit = () => {
    const w = screen.clientWidth, h = screen.clientHeight
    if (!w || !h) return
    for (const d of Object.values(shots)) d.style.height = `${Math.max(h, w / Number(d.dataset.ar))}px`
  }
  fit()
  const ro = new ResizeObserver(fit)
  ro.observe(screen)

  let current = first
  const show = (shot: string) => {
    for (const [n, d] of Object.entries(shots)) {
      d.getAnimations().forEach(a => a.cancel())
      d.style.opacity = n === shot ? '1' : '0'
      d.style.transform = ''
      d.style.clipPath = ''
    }
    current = shot
  }
  show(first)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // The video plays only while its card is on screen, and not at all under reduced motion
  const vio = video && !reduced ? new IntersectionObserver(([e]) => { if (e.isIntersecting) whenUnheld(art).then(() => video!.play().catch(() => {})); else video!.pause() }, { threshold: 0.2 }) : null
  vio?.observe(art)
  if (!tour.steps.length || reduced) return () => { ro.disconnect(); vio?.disconnect() }

  const anim = (el: HTMLElement, kf: Keyframe[], s: number, easing = 'ease') =>
    el.animate(kf, { duration: ms(s), easing, fill: 'forwards' }).finished
  const top = (shot: string) => { const to = shots[shot]; screen.append(to); to.style.opacity = '1'; return to }
  // Scrolls are a translate, so a screen keeps its scroll until show() resets it
  const scrollOf = (d: HTMLElement) => new DOMMatrix(getComputedStyle(d).transform).m42
  const tap = async ([x, y]: Point) => {
    const d = shots[current]
    const t = document.createElement('div')
    t.className = 'tap'
    t.style.left = `${x * 100}%`; t.style.top = `${y * 100}%`
    d.append(t)
    await anim(t, [{ opacity: 0, scale: .4 }, { opacity: .6, scale: 1, offset: .4 }, { opacity: 0, scale: 1.3 }], moves.tap, 'ease-out')
    t.remove()
  }
  const run: Record<string, (step: any) => Promise<void>> = {
    hold: ({ hold }) => wait(times[hold]),
    tap: ({ tap: p }) => tap(p),
    scroll: async ({ scroll, over }) => {
      const d = shots[current]
      const to = -scroll * (d.offsetHeight - screen.clientHeight)
      await anim(d, [{ transform: `translateY(${scrollOf(d)}px)` }, { transform: `translateY(${to}px)` }], times[over], inOut)
    },
    push: async ({ push: shot }) => {
      const from = shots[current], to = top(shot), y = scrollOf(from)
      anim(from, [{ transform: `translate(0, ${y}px)`, filter: 'none' }, { transform: `translate(-28%, ${y}px)`, filter: 'brightness(.7)' }], moves.push, push)
      await anim(to, [{ transform: 'translateX(100%)' }, { transform: 'none' }], moves.push, push); show(shot)
    },
    drop: async ({ drop: shot }) => {
      const to = top(shot)
      await anim(to, [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], moves.drop, push); show(shot)
    },
    fade: async ({ fade: shot }) => {
      const to = top(shot)
      await anim(to, [{ opacity: 0 }, { opacity: 1 }], moves.fade); show(shot)
    },
  }

  async function loop() {
    for (const step of tour.steps) {
      if (!on) return
      await whenUnheld(art)
      if (!on) return
      await run[Object.keys(step)[0]](step)
    }
  }
  let on = false, running = false, stopped = false
  const io = new IntersectionObserver(([e]) => { on = e.isIntersecting && !stopped; if (on && !running) start() }, { threshold: 0.4 })
  io.observe(art)
  async function start() { running = true; while (on) await loop(); running = false }
  return () => { stopped = true; on = false; io.disconnect(); ro.disconnect(); vio?.disconnect(); video?.pause() }
}
