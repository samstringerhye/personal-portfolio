// The MyFrontier card: a tour of the app built from the published screens and the project's
// Lottie files. Every move is the shipped iOS behavior, the loop included: it ends by relaunching
// the app. Timings live in animations.workCards.myfrontier
import lottie, { type AnimationItem } from 'lottie-web/build/player/lottie_light'
import { animations } from '../../data/tokens'
import { statusIcons } from './status-icons'

const BASE = '/motion/myfrontier/'
const { moves, holds } = animations.workCards.myfrontier
const ms = (s: number) => s * 1000
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = (s: number) => new Promise(r => setTimeout(r, ms(s)))
const pullDown = 'cubic-bezier(.25,.8,.3,1)', inOut = 'cubic-bezier(.7,0,.2,1)', push = 'cubic-bezier(.32,.72,0,1)'
const spring = 'cubic-bezier(.34,1.56,.64,1)', drop = 'cubic-bezier(.5,0,.75,0)'

type Point = readonly [number, number]

// Published screens: status bar color behind the old notch, and the color of its time and icons
const SCREENS = {
  'intro-1': ['#ff033a', '#fff'], 'intro-2': ['#161a29', '#fff'],
  'dashboard-1': ['#151a28', '#fff'], 'bill-pay-1': ['#ffffff', '#0B0F1A'], 'bill-pay-4': ['#f6f6f7', '#0B0F1A'],
  'support-1': ['#ffffff', '#0B0F1A'], 'support-2': ['#161a29', '#fff'], 'support-3': ['#161a29', '#fff'], 'support-4': ['#161a29', '#fff'],
} as const satisfies Record<string, readonly [string, string]>
// Bottom sheets: the screen that holds the sheet, and where its card starts
const SHEETS = { 'bill-pay-2': 0.312, 'bill-pay-3': 0.266 } as const
// Tap targets as fractions of the screen
const T = {
  faceId: [0.87, 0.56], makePayment: [0.5, 0.623],
  method: [0.5, 0.757], selectMethod: [0.5, 0.776], date: [0.5, 0.675], day14: [0.6, 0.578], selectDate: [0.5, 0.863],
  pay: [0.5, 0.847], supportTab: [0.62, 0.935], order: [0.5, 0.67], pull: [0.5, 0.42],
  // The check on the Payment sent screen
  check: [0.5, 0.245],
} as const satisfies Record<string, Point>
type Screen = keyof typeof SCREENS
type Sheet = keyof typeof SHEETS
const isSheet = (n: string): n is Sheet => n in SHEETS
const icons = (c: string) => statusIcons(c, 'sb r')

const TEMPLATE = `  <div class="floor" aria-hidden="true"></div>
  <div class="stage"></div>
  <div class="device phone">
    
    <div class="band"><div class="bezel"><div class="screen">
      <div class="stack"></div>
      <div class="dim"></div>
      <div class="sheets"></div>
      <div class="wash"></div>
      <div class="lottie intro" data-l="Intro"></div>
      <div class="lottie" data-l="Coin"></div>
      <div class="lottie" data-l="Confirmation"></div>
      <div class="spin" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.25" transform="rotate(0 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.32" transform="rotate(30 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.39" transform="rotate(60 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.45" transform="rotate(90 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.52" transform="rotate(120 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.59" transform="rotate(150 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.66" transform="rotate(180 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.73" transform="rotate(210 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.80" transform="rotate(240 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.86" transform="rotate(270 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="0.93" transform="rotate(300 12 12)"/><rect x="11" y="2" width="2" height="6" rx="1" fill="#9aa0ad" opacity="1.00" transform="rotate(330 12 12)"/></svg></div>
      <div class="tap"></div>
      <div class="sheen" aria-hidden="true"></div>
      <div class="island"><div class="fid" data-l="FaceID"></div></div>
    </div></div></div>
  </div>`

/** One published screen held still, built like the tour's layers: the second phone in the
    MyFrontier arrangement */
export function mountMyFrontierStill(art: HTMLElement, name: Screen): () => void {
  const [bg, fg] = SCREENS[name]
  art.insertAdjacentHTML('beforeend', `<div class="floor" aria-hidden="true"></div>
  <div class="stage"></div>
  <div class="device phone"><div class="band"><div class="bezel"><div class="screen">
    <div class="stack"><div class="layer"><img class="view" src="${BASE}screens/${name}.webp" alt=""><div class="notch" style="background:${bg}"></div><img class="sb l" src="${BASE}screens/${name}-t.png" alt="">${icons(fg)}</div></div>
    <div class="island"></div>
  </div></div></div></div>`)
  return () => {}
}

// Builds the phone screen inside art and loops the tour while it is on screen. Returns a stop function
export function mountMyFrontier(art: HTMLElement): () => void {
  art.insertAdjacentHTML('beforeend', TEMPLATE)
  // Every selector matches an element in TEMPLATE
  const $ = (s: string) => art.querySelector<HTMLElement>(s)!
  const stack = $('.stack'), sheets = $('.sheets')

  const layer = (name: Screen | Sheet, parent: HTMLElement, cls = '') => {
    const d = document.createElement('div'); d.className = 'layer ' + cls; d.style.opacity = '0'
    const [bg, fg]: readonly [string, string] = isSheet(name) ? ['#fff', '#000'] : SCREENS[name]
    d.innerHTML = `<img class="view" src="${BASE}screens/${name}.webp" alt=""><div class="notch" style="background:${bg}"></div><img class="sb l" src="${BASE}screens/${name}-t.png" alt="">${icons(fg)}`
    parent.appendChild(d); return d
  }
  const L = {} as Record<Screen | Sheet, HTMLDivElement>
  for (const n of Object.keys(SCREENS) as Screen[]) L[n] = layer(n, stack)
  for (const [n, top] of Object.entries(SHEETS) as [Sheet, number][]) {
    const s = layer(n, sheets, 'sheet')
    s.style.clipPath = `inset(${top * 100}% 0 0 0)`; s.style.opacity = '1'; s.style.transform = 'translateY(100%)'
    L[n] = s
  }
  L['intro-1'].insertAdjacentHTML('beforeend', '<div class="logo-cover"></div>')
  L['dashboard-1'].querySelector<HTMLImageElement>('img.view')!.alt = 'MyFrontier home: Good afternoon, Nick. Total balance $67.99'
  L['dashboard-1'].style.opacity = '1'

  const load = (container: HTMLElement, name: string) =>
    lottie.loadAnimation({ container, renderer: 'svg', loop: false, autoplay: false, path: `${BASE}lottie/${name}.json` })
  const intro = $('[data-l="Intro"]'), coin = $('[data-l="Coin"]'), conf = $('[data-l="Confirmation"]'), fid = $('.fid')
  const lot = { intro: load(intro, 'Intro'), coin: load(coin, 'Coin'), confirmation: load(conf, 'Confirmation'), faceId: load(fid, 'FaceID') }
  const destroy = () => Object.values(lot).forEach((a: AnimationItem) => a.destroy())
  if (reduced()) return destroy

  const anim = (el: HTMLElement, kf: Keyframe[], s: number, easing = 'ease', delay = 0) =>
    el.animate(kf, { duration: ms(s), easing, delay: ms(delay), fill: 'forwards' }).finished
  const cancel = (el: HTMLElement) => el.getAnimations().forEach(a => a.cancel())
  const tapEl = $('.tap'), dim = $('.dim'), wash = $('.wash'), spin = $('.spin'), isl = $('.island')
  let current: Screen = 'dashboard-1'
  const set = (name: Screen) => {
    for (const n of Object.keys(SCREENS) as Screen[]) {
      const el = L[n]; cancel(el); el.style.opacity = n === name ? '1' : '0'; el.style.transform = ''
    }
    current = name
  }
  const tap = async ([x, y]: Point) => {
    tapEl.style.left = x * 100 + '%'; tapEl.style.top = y * 100 + '%'
    await anim(tapEl, [{ opacity: 0, scale: .4 }, { opacity: .55, scale: 1, offset: .4 }, { opacity: 0, scale: 1.3 }], moves.tap, 'ease-out')
  }
  const top = (name: Screen) => { const to = L[name]; stack.appendChild(to); to.style.opacity = '1'; return to }
  const circle = (r: string, [x, y]: Point) => `circle(${r} at ${x * 100}% ${y * 100}%)`
  // Signed in: the home screen rises over a receding sign-in screen
  const rise = async (name: Screen) => {
    const from = L[current], to = top(name)
    anim(from, [{ transform: 'none', filter: 'none' }, { transform: 'scale(.9)', filter: 'brightness(.5)' }], moves.signedIn, push)
    await anim(to, [{ transform: 'translateY(100%)', borderRadius: '14cqw' }, { transform: 'none', borderRadius: '0' }], moves.signedIn, push); set(name)
  }
  // Status updates the way iOS does them: pull to refresh, spinner, the new state under the content
  const refresh = async (name: Screen) => {
    const from = L[current]
    await tap(T.pull)
    spin.style.opacity = '1'
    const turning = spin.querySelector('svg')!.animate([{ rotate: '0deg' }, { rotate: '360deg' }], { duration: ms(moves.refreshSpin), iterations: Infinity, easing: 'steps(12)' })
    await anim(from, [{ transform: 'none' }, { transform: 'translateY(9%)' }], moves.refreshPull, pullDown)
    await wait(holds.refreshing)
    const to = L[name]; to.style.opacity = '1'; to.style.transform = 'translateY(9%)'; stack.appendChild(to); from.style.opacity = '0'
    cancel(from)
    spin.style.opacity = '0'; turning.cancel()
    await anim(to, [{ transform: 'translateY(9%)' }, { transform: 'none' }], moves.refreshSettle, push); set(name)
  }
  const pushTo = async (name: Screen) => {
    const from = L[current], to = top(name)
    anim(from, [{ transform: 'none', filter: 'none' }, { transform: 'translateX(-28%)', filter: 'brightness(.7)' }], moves.push, push)
    await anim(to, [{ transform: 'translateX(100%)' }, { transform: 'none' }], moves.push, push); set(name)
  }
  const sheetUp = async (name: Sheet) => {
    anim(dim, [{ opacity: 0 }, { opacity: 1 }], moves.sheetUpDim)
    await anim(L[name], [{ transform: 'translateY(100%)' }, { transform: 'none' }], moves.sheetUp, push)
  }
  const sheetDown = async (name: Sheet) => {
    anim(dim, [{ opacity: 1 }, { opacity: 0 }], moves.sheetDownDim, 'ease', moves.sheetDownDimDelay)
    await anim(L[name], [{ transform: 'none' }, { transform: 'translateY(100%)' }], moves.sheetDown, drop)
  }
  // The seam of the loop: the app relaunches, its launch screen zooming up out of the icon the
  // way iOS opens an app
  const relaunch = async (name: Screen) => {
    const from = L[current], to = top(name)
    anim(from, [{ transform: 'none', filter: 'none' }, { transform: 'scale(.9)', filter: 'brightness(.55)' }], moves.relaunch, push)
    await anim(to, [{ transform: 'scale(.16)', borderRadius: '24%' }, { transform: 'none', borderRadius: '0' }], moves.relaunch, push); set(name)
  }
  const island = (w: string, h: string, r: string, s: number, ease: string) => {
    isl.style.transition = ['width', 'height', 'border-radius'].map(p => `${p} ${ms(s)}ms ${ease}`).join(', ')
    isl.style.width = w; isl.style.height = h; isl.style.borderRadius = r
    return wait(s)
  }

  async function loop() {
    // Sign in
    set('intro-1'); lot.coin.goToAndStop(0, true); lot.confirmation.goToAndStop(0, true)
    intro.style.opacity = '1'; lot.intro.goToAndPlay(0, true)
    await wait(holds.splash)
    intro.style.opacity = '0'; set('intro-2')
    await wait(holds.signIn)
    await tap(T.faceId)
    // Face ID on a Dynamic Island phone: the island opens into the Face ID glyph, scans,
    // turns to a check and closes. The old center panel (intro-3, intro-4) belongs to notched phones.
    await island('40cqw', '40cqw', '12cqw', moves.islandOpen, spring)
    fid.style.opacity = '1'; lot.faceId.goToAndPlay(0, true)
    await wait(holds.faceIdScan)
    fid.style.opacity = '0'
    await island('', '', '', moves.islandClose, push)
    isl.style.transition = ''; lot.faceId.goToAndStop(0, true)
    await rise('dashboard-1')
    // Pay a bill
    await wait(holds.home)
    await tap(T.makePayment); await pushTo('bill-pay-1'); await wait(holds.billPay)
    await tap(T.method); await sheetUp('bill-pay-2'); await wait(holds.methodSheet)
    await tap(T.selectMethod); await sheetDown('bill-pay-2'); await wait(holds.methodPicked)
    await tap(T.date); await sheetUp('bill-pay-3'); await wait(holds.dateSheet)
    await tap(T.day14); await wait(holds.daySelected)
    await tap(T.selectDate); await sheetDown('bill-pay-3'); await wait(holds.datePicked)
    await tap(T.pay)
    await anim(wash, [{ clipPath: circle('0%', T.pay) }, { clipPath: circle('130%', T.pay) }], moves.payWash, inOut)
    lot.coin.goToAndPlay(0, true); await wait(holds.coin)
    coin.style.opacity = '0'; lot.confirmation.goToAndPlay(0, true); await wait(holds.confirmation)
    // Match cut: the red closes down onto the check on the real Payment sent screen
    set('bill-pay-4'); stack.appendChild(L['bill-pay-4'])
    anim(conf, [{ top: '50%', width: '52cqw' }, { top: T.check[1] * 100 + '%', width: '24cqw', opacity: 0, offset: 1 }], moves.matchCut, inOut)
    await anim(wash, [{ clipPath: circle('130%', T.check) }, { clipPath: circle('0%', T.check) }], moves.matchCut, inOut)
    cancel(wash); cancel(conf); coin.style.opacity = ''
    lot.coin.goToAndStop(0, true); lot.confirmation.goToAndStop(0, true)
    await wait(holds.paymentSent)
    // Track a visit
    await tap(T.supportTab); set('support-1'); await wait(holds.support)
    await tap(T.order); await pushTo('support-2'); await wait(holds.orderStatus)
    await refresh('support-3'); await wait(holds.statusUpdate)
    await refresh('support-4'); await wait(holds.statusFinal)
    // Relaunch
    await relaunch('intro-1')
  }

  let on = false, running = false, stopped = false
  const io = new IntersectionObserver(([e]) => { on = e.isIntersecting && !stopped; if (on && !running) run() }, { threshold: 0.4 })
  io.observe(art)
  async function run() { running = true; while (on) await loop(); running = false }
  return () => { stopped = true; on = false; io.disconnect(); destroy() }
}
