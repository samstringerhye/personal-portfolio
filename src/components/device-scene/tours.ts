// Screens for the device arrangements: published screens stepped through with taps, pushes and
// scrolls, looping while the card is on screen, or a single published screen held still (a tour
// with no steps). Timings live in animations.workCards.tours; reduced motion holds on the first
// screen.
import { animations } from '../../data/tokens'
import { DEVICES, type DeviceName } from './shared'

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
}

// Every screen is one the case study publishes (scripts/motion/device-screens.mjs)
export const TOURS = {
  cvs: {
    shots: { home: 1280 / 798, shop: 1280 / 798, brand: 1280 / 821 },
    steps: [
      { hold: 'home' }, { tap: [0.169, 0.082] }, { drop: 'shop' },
      { hold: 'shop' }, { tap: [0.563, 0.164] }, { push: 'brand' },
      { hold: 'brand' }, { fade: 'home' },
    ],
  },
  samsung: {
    shots: { home: 1100 / 2464, category: 1100 / 1584 },
    steps: [
      { hold: 'home' }, { scroll: 1, over: 'homeScroll' }, { hold: 'appliances' },
      { tap: [0.451, 0.955] }, { push: 'category' },
      { hold: 'category' }, { scroll: 0.62, over: 'categoryScroll' }, { hold: 'bestSellers' },
      { fade: 'home' },
    ],
  },
  amica: {
    shots: { home: 1440 / 900, quote: 1440 / 2159 },
    steps: [
      { hold: 'home' }, { tap: [0.352, 0.54] }, { push: 'quote' },
      { hold: 'quote' }, { scroll: 0.5, over: 'quoteScroll' }, { hold: 'empathy' },
      { fade: 'home' },
    ],
  },
  bespoke: {
    shots: { depth: 1200 / 853, colors: 1200 / 853, summary: 1200 / 853 },
    steps: [
      { hold: 'depth' }, { tap: [0.85, 0.2] }, { fade: 'colors' },
      { hold: 'colors' }, { tap: [0.874, 0.885] }, { fade: 'summary' },
      { hold: 'summary' }, { fade: 'depth' },
    ],
  },
  // The phones beside them, each on one published mobile screen
  'cvs-mobile': { shots: { home: 720 / 1606 }, steps: [] },
  'amica-mobile': { shots: { home: 720 / 1561 }, steps: [] },
  'samsung-mobile': { shots: { menu: 720 / 1543 }, steps: [] },
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

  const shots: Record<string, HTMLDivElement> = {}
  for (const [shot, ar] of Object.entries(tour.shots)) {
    const d = document.createElement('div')
    d.className = 'shot'
    d.dataset.ar = String(ar)
    d.innerHTML = `<img src="/motion/${name}/${shot}.webp" alt="" decoding="async">`
    screen.append(d)
    shots[shot] = d
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
  if (!tour.steps.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => ro.disconnect()

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
      await run[Object.keys(step)[0]](step)
    }
  }
  let on = false, running = false, stopped = false
  const io = new IntersectionObserver(([e]) => { on = e.isIntersecting && !stopped; if (on && !running) start() }, { threshold: 0.4 })
  io.observe(art)
  async function start() { running = true; while (on) await loop(); running = false }
  return () => { stopped = true; on = false; io.disconnect(); ro.disconnect() }
}
