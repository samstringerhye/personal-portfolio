/**
 * Card ↔ hero transition between the homepage work list and case study pages, in the spirit of
 * GSAP's "scrubbed bento gallery": the card's image zooms with Flip into the case study hero, and
 * going back to the homepage zooms the hero back into its card.
 *
 * The zooming copy is built with inline styles and attached to <html>, outside <body>: Astro's
 * router replaces <body> and the page's scoped styles on navigation, which would otherwise drop or
 * unstyle the copy mid-transition. Skipped for reduced motion (the color shutter takes over).
 */
import gsap from 'gsap'
// From gsap/all: the gsap/Flip types path differs only in casing from GSAP's flip.d.ts, which
// trips TypeScript on case-insensitive disks. gsap has no side effects, so unused plugins tree-shake.
import { Flip, ExpoScaleEase } from 'gsap/all'

gsap.registerPlugin(Flip, ExpoScaleEase)

const DURATION = 0.6
const FADE = 0.25

type Mode = 'forward' | 'back'
let copy: HTMLElement | null = null
let mode: Mode | null = null
let backSlug: string | null = null
let backText: TextLayout | null = null

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const canHover = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

// Last pointer position, so the zoom-back can tell whether the cursor is over the returning card
let pointer: { x: number; y: number } | null = null

/** Card art sits subjects above center; the hero moves them down by this much of the image height. */
const heroShift = (offset: number, w: number, h: number) => offset * Math.max(h, w / 1.5)

/* ── Text that rides along with the image (year, title, tagline) ── */
type Line = { text: string; cls: string; size: number; leading: number }
type TextLayout = {
  color: string
  metaPad: number
  year: Line
  lock?: string
  blockPad: number
  blockWidth: number
  blockGap: number
  title: Line
  tagline?: Line
}

const px = (v: string) => parseFloat(v) || 0
const line = (el: HTMLElement, cls: string): Line => {
  const cs = getComputedStyle(el)
  return { text: el.textContent?.trim() ?? '', cls, size: px(cs.fontSize), leading: px(cs.lineHeight) || px(cs.fontSize) * 1.2 }
}

/** Reads the overlaid text from a card or hero; null when the text sits below the image instead. */
function readText(root: ParentNode, kind: 'card' | 'hero'): TextLayout | null {
  const q = (sel: string) => root.querySelector<HTMLElement>(sel)
  const k = kind === 'card'
    ? { meta: '.work-list-meta', year: '.work-list-meta > span', block: '.work-list-text', title: '.work-list-title', tagline: '.work-list-tagline', lock: '.work-list-lock' }
    : { meta: '.cs-hero-year', year: '.cs-hero-year', block: '.cs-hero-text', title: '.cs-hero-title', tagline: '.cs-hero-tagline', lock: '' }
  const meta = q(k.meta), year = q(k.year), block = q(k.block), title = q(k.title), tagline = q(k.tagline)
  if (!meta || !year || !block || !title || getComputedStyle(block).position !== 'absolute') return null
  const bcs = getComputedStyle(block)
  return {
    color: bcs.color,
    metaPad: px(getComputedStyle(meta).paddingLeft),
    year: line(year, 'typo-ui-caps'),
    lock: k.lock ? q(k.lock)?.textContent?.trim() || undefined : undefined,
    blockPad: px(bcs.paddingLeft),
    blockWidth: block.getBoundingClientRect().width,
    blockGap: px(bcs.rowGap),
    title: line(title, 'typo-display-md'),
    tagline: tagline ? line(tagline, 'typo-title-lg') : undefined,
  }
}

function textEl(tag: string, l: Line, color: string): HTMLElement {
  const el = document.createElement(tag)
  el.className = l.cls
  el.textContent = l.text
  Object.assign(el.style, { margin: '0', color, fontSize: `${l.size}px`, lineHeight: `${l.leading}px`, textWrap: 'balance' })
  return el
}

/**
 * A self-contained copy of a card or hero: flat background, subject, and (when overlaid) its text.
 * `zoom` matches the card's hover zoom and `shift` the hero's subject offset, so the copy starts
 * pixel-identical to what it replaces.
 */
function buildCopy(media: HTMLElement, background: string, text: TextLayout | null, zoom = 1, shift = 0): HTMLElement {
  const rect = media.getBoundingClientRect()
  const img = media.querySelector<HTMLImageElement>('img')

  const wrap = document.createElement('div')
  wrap.setAttribute('aria-hidden', 'true')
  Object.assign(wrap.style, {
    position: 'fixed', left: `${rect.left}px`, top: `${rect.top}px`,
    width: `${rect.width}px`, height: `${rect.height}px`,
    overflow: 'hidden', zIndex: 'calc(var(--z-nav) - 1)', pointerEvents: 'none', background,
  })
  const inner = document.createElement('div')
  inner.dataset.copyInner = ''
  Object.assign(inner.style, { position: 'absolute', inset: '0' })
  gsap.set(inner, { scale: zoom })
  if (img) {
    const pic = document.createElement('img')
    pic.src = img.currentSrc || img.src
    pic.alt = ''
    pic.dataset.copyPic = ''
    Object.assign(pic.style, {
      position: 'absolute', inset: '0', width: '100%', height: '100%',
      objectFit: 'cover', filter: 'drop-shadow(0 18px 22px rgba(11,13,27,0.22))',
    })
    gsap.set(pic, { y: shift })
    inner.appendChild(pic)
  }
  wrap.appendChild(inner)

  if (text) {
    const meta = document.createElement('div')
    meta.dataset.copyMeta = ''
    Object.assign(meta.style, { position: 'absolute', top: '0', left: '0', padding: `${text.metaPad}px`, display: 'flex', gap: '1.5rem' })
    const year = textEl('span', text.year, text.color)
    year.dataset.copyYear = ''
    meta.appendChild(year)
    if (text.lock) {
      const lock = textEl('span', { ...text.year, text: text.lock }, text.color)
      lock.dataset.copyLock = ''
      meta.appendChild(lock)
    }
    const block = document.createElement('div')
    block.dataset.copyBlock = ''
    Object.assign(block.style, {
      position: 'absolute', left: '0', bottom: '0', padding: `${text.blockPad}px`,
      width: `${text.blockWidth}px`, display: 'flex', flexDirection: 'column', rowGap: `${text.blockGap}px`,
    })
    const title = textEl('div', text.title, text.color)
    title.dataset.copyTitle = ''
    block.appendChild(title)
    if (text.tagline) {
      const tag = textEl('p', text.tagline, text.color)
      tag.dataset.copyTagline = ''
      block.appendChild(tag)
    }
    wrap.append(meta, block)
  }

  document.documentElement.appendChild(wrap)
  return wrap
}

/** Invisible hero laid out exactly like the case study's (global .cs-hero-* styles), for measuring. */
function heroProbe(title: string, tagline: string, year: string, light: boolean): { box: HTMLElement; text: TextLayout | null; remove: () => void } {
  const frame = document.createElement('div')
  frame.setAttribute('aria-hidden', 'true')
  Object.assign(frame.style, {
    position: 'fixed', top: 'var(--nav-height)', left: '0', right: '0',
    maxWidth: 'var(--max-content-width)', marginInline: 'auto', paddingInline: 'var(--page-margin)',
    visibility: 'hidden', pointerEvents: 'none',
  })
  const hero = document.createElement('div')
  hero.className = light ? 'cs-hero cs-hero--light' : 'cs-hero'
  hero.innerHTML = `<div class="cs-hero-size"></div><p class="cs-hero-year typo-ui-caps"></p><div class="cs-hero-text"><div class="cs-hero-title typo-display-md"></div><p class="cs-hero-tagline typo-title-lg"></p></div>`
  hero.querySelector('.cs-hero-year')!.textContent = year
  hero.querySelector('.cs-hero-title')!.textContent = title
  hero.querySelector('.cs-hero-tagline')!.textContent = tagline
  frame.appendChild(hero)
  document.body.appendChild(frame)
  return { box: hero.querySelector<HTMLElement>('.cs-hero-size')!, text: readText(hero, 'hero'), remove: () => frame.remove() }
}

/** Fits the copy into `target`, animating its zoom, subject shift and text to the target's. */
function fit(target: HTMLElement | Flip.FlipState, from: number, to: number, endShift = 0, endText: TextLayout | null = null, endZoom = 1): Promise<void> {
  return new Promise(resolve => {
    if (!copy) return resolve()
    // autoRound off: GSAP rounds px by default, which would land the text up to 1px off the real one
    const tween = { duration: DURATION, ease: 'power2.inOut', autoRound: false }
    const q = (sel: string) => copy!.querySelector<HTMLElement>(sel)
    if (q('[data-copy-inner]')) gsap.to(q('[data-copy-inner]'), { scale: endZoom, ...tween })
    if (q('[data-copy-pic]')) gsap.to(q('[data-copy-pic]'), { y: endShift, ...tween })
    if (endText) {
      const sized = (l: Line) => ({ fontSize: l.size, lineHeight: `${l.leading}px` })
      gsap.to(q('[data-copy-meta]'), { padding: endText.metaPad, ...tween })
      gsap.to(q('[data-copy-year]'), { ...sized(endText.year), ...tween })
      if (q('[data-copy-lock]')) gsap.to(q('[data-copy-lock]'), { opacity: 0, duration: DURATION * 0.4, ease: 'power1.out' })
      gsap.to(q('[data-copy-block]'), { padding: endText.blockPad, width: endText.blockWidth, rowGap: endText.blockGap, ...tween })
      gsap.to(q('[data-copy-title]'), { ...sized(endText.title), ...tween })
      if (endText.tagline && q('[data-copy-tagline]')) gsap.to(q('[data-copy-tagline]'), { ...sized(endText.tagline), ...tween })
    }
    Flip.fit(copy, target, {
      duration: DURATION,
      autoRound: false,
      // ExpoScale keeps the zoom feeling even as the size changes, as in the bento demo
      ease: zoomEase(from, to),
      onComplete: () => resolve(),
    })
  })
}

/**
 * The zooming page spills past the column's side lines, so two panels in the page color cover
 * everything outside them for the length of the zoom: it reads as cropped to the content area.
 * Fixed to the viewport (not clipped on the page), so they hold still however the page is scrolled.
 */
let masks: HTMLElement[] = []

function contentBounds(): { left: number; right: number } | null {
  const overlay = document.querySelector<HTMLElement>('.grid-overlay')
  if (!overlay) return null
  const margin = document.createElement('div')
  margin.style.cssText = 'position:absolute;visibility:hidden;width:var(--page-margin)'
  document.body.appendChild(margin)
  const inset = margin.getBoundingClientRect().width
  margin.remove()
  const r = overlay.getBoundingClientRect()
  return { left: r.left + inset, right: r.right - inset }
}

function maskOutsideLines() {
  clearMasks()
  const bounds = contentBounds()
  if (!bounds) return
  const panel = (edge: Partial<CSSStyleDeclaration>) => {
    const el = document.createElement('div')
    el.setAttribute('aria-hidden', 'true')
    Object.assign(el.style, {
      position: 'fixed', top: '0', bottom: '0', background: 'var(--color-bg-primary)',
      zIndex: 'calc(var(--z-nav) - 1)', pointerEvents: 'none', ...edge,
    })
    document.documentElement.appendChild(el)
    return el
  }
  masks = [panel({ left: '0', width: `${bounds.left}px` }), panel({ left: `${bounds.right}px`, right: '0' })]
}

function clearMasks() {
  masks.forEach(el => el.remove())
  masks = []
}

/**
 * Zoom the rest of the page with the image, like the bento demo's surrounding tiles: everything
 * scales around the card's center by the same factor and moves with it, so neighbours push outward.
 * `forward` zooms in from rest; otherwise the page starts zoomed and settles back to rest.
 */
function zoomSurroundings(card: DOMRect, hero: DOMRect, forward: boolean, ease: string): Promise<void> {
  const s = hero.width / card.width
  const dx = hero.left + hero.width / 2 - (card.left + card.width / 2)
  const dy = hero.top + hero.height / 2 - (card.top + card.height / 2)
  const els = [document.querySelector('main'), document.querySelector('.footer')].filter(Boolean) as HTMLElement[]
  const zoomed = { scale: s, x: dx, y: dy }
  const rest = { scale: 1, x: 0, y: 0 }

  return Promise.all(els.map(el => new Promise<void>(resolve => {
    const r = el.getBoundingClientRect()
    const transformOrigin = `${card.left + card.width / 2 - r.left}px ${card.top + card.height / 2 - r.top}px`
    gsap.fromTo(el, { ...(forward ? rest : zoomed), transformOrigin }, {
      ...(forward ? zoomed : rest),
      duration: DURATION,
      ease,
      // Only set clearProps when needed: GSAP splits the value if the key exists, even if undefined
      ...(forward ? {} : { clearProps: 'transform' }),
      onComplete: () => resolve(),
    })
    // Fade only at the far end of the zoom, so the page change itself never shows a hard cut
    if (forward) gsap.to(el, { opacity: 0, duration: DURATION * 0.35, delay: DURATION * 0.65, ease: 'power1.in' })
    else gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: DURATION * 0.35, ease: 'power1.out', clearProps: 'opacity' })
  }))).then(() => {})
}

/**
 * Back direction, in two steps: put the homepage in its zoomed-in, hidden start state right away
 * (measured unscaled), then play it later. This lets the homepage's startup scripts run while
 * nothing moves, so the zoom doesn't stutter.
 */
function prepareSurroundings(card: DOMRect, hero: DOMRect) {
  const s = hero.width / card.width
  const dx = hero.left + hero.width / 2 - (card.left + card.width / 2)
  const dy = hero.top + hero.height / 2 - (card.top + card.height / 2)
  const els = [document.querySelector('main'), document.querySelector('.footer')].filter(Boolean) as HTMLElement[]
  els.forEach(el => {
    const r = el.getBoundingClientRect()
    gsap.set(el, { scale: s, x: dx, y: dy, opacity: 0, transformOrigin: `${card.left + card.width / 2 - r.left}px ${card.top + card.height / 2 - r.top}px` })
  })
  return (ease: string) => Promise.all(els.map(el => new Promise<void>(resolve => {
    gsap.to(el, { scale: 1, x: 0, y: 0, duration: DURATION, ease, clearProps: 'transform', onComplete: () => resolve() })
    gsap.to(el, { opacity: 1, duration: DURATION * 0.35, ease: 'power1.out', clearProps: 'opacity' })
  }))).then(() => {})
}

/**
 * Resolves once the new page has finished starting up: after astro:page-load, then when the main
 * thread first goes idle (page scripts defer work to idle callbacks), capped so it never waits long.
 */
function afterPageStartup(cap = 400): Promise<void> {
  return new Promise(resolve => {
    let done = false
    const finish = () => { if (done) return; done = true; requestAnimationFrame(() => resolve()) }
    const whenIdle = () => 'requestIdleCallback' in window
      ? requestIdleCallback(finish, { timeout: cap })
      : setTimeout(finish, 120)
    document.addEventListener('astro:page-load', () => requestAnimationFrame(whenIdle), { once: true })
    setTimeout(finish, cap + 100)
  })
}

const zoomEase = (from: number, to: number) =>
  `expoScale(${Math.max(0.05, from).toFixed(2)}, ${Math.max(0.05, to).toFixed(2)}, power2.inOut)`

/** Fades the copy away, then clears the transition state (kept until now so the router's root
    crossfade, which runs right after the swap, stays suppressed). */
function fadeOutCopy() {
  const c = copy
  copy = null
  if (!c) return finish()
  gsap.to(c, { opacity: 0, duration: FADE, ease: 'power1.out', onComplete: () => { c.remove(); finish() } })
}

function finish() {
  clearMasks()
  mode = null
  backSlug = null
  backText = null
  delete document.documentElement.dataset.flipNav
}

async function waitForImage(img: HTMLImageElement | null) {
  if (!img || img.complete) return
  await Promise.race([img.decode().catch(() => {}), new Promise(r => setTimeout(r, 1200))])
}

type NavEvent = Event & { sourceElement?: Element; from: URL; to: URL; loader: () => Promise<void> }

// The last client-side navigation, so the back button can tell whether it can step back to the homepage
let lastNav: { from: string; to: string } | null = null

function onBeforePreparation(e: Event) {
  const event = e as NavEvent
  lastNav = { from: event.from.pathname, to: event.to.pathname }
  if (reducedMotion()) return

  // Forward: a homepage work card → its case study
  const card = event.sourceElement?.closest<HTMLElement>('.work-list-card')
  const cardMedia = card?.querySelector<HTMLElement>('.work-list-media[data-slug]')
  if (cardMedia) {
    mode = 'forward'
    document.documentElement.dataset.flipNav = 'true'
    const original = event.loader
    event.loader = async () => {
      const cardRect = cardMedia.getBoundingClientRect()
      const plane = cardMedia.querySelector<HTMLElement>('.work-list-plane')
      const hoverZoom = plane ? new DOMMatrix(getComputedStyle(plane).transform).a : 1
      const bg = cardMedia.querySelector<HTMLElement>('.work-list-bg')?.style.background ?? ''
      const cardText = readText(card!, 'card')
      const probe = heroProbe(
        card!.querySelector('.work-list-title')?.textContent?.trim() ?? '',
        card!.querySelector('.work-list-tagline')?.textContent?.trim() ?? '',
        card!.querySelector('.work-list-meta > span')?.textContent?.trim() ?? '',
        !!card!.closest('.work-list-item--light'),
      )
      // Text rides along only when it overlays the image on both ends
      const text = cardText && probe.text ? cardText : null
      copy = buildCopy(cardMedia, bg, text, hoverZoom)
      cardMedia.style.visibility = 'hidden'
      if (text) card!.querySelectorAll<HTMLElement>('.work-list-meta, .work-list-text').forEach(el => { el.style.visibility = 'hidden' })
      const heroRect = probe.box.getBoundingClientRect()
      const growth = heroRect.width / cardRect.width
      const offset = Number(cardMedia.dataset.heroOffset ?? 0)
      maskOutsideLines()
      // Load the next page while the zoom plays; the swap waits for both
      await Promise.all([
        fit(probe.box, 1, growth, heroShift(offset, heroRect.width, heroRect.height), text ? probe.text : null),
        zoomSurroundings(cardRect, heroRect, true, zoomEase(1, growth)),
        original(),
      ])
      probe.remove()
    }
    return
  }

  // Back: a case study with a hero → the homepage (back button, Home, Work, or the logo)
  const hero = document.querySelector<HTMLElement>('[data-cs-hero]')
  // event.from, not location: on Back the URL has already changed by the time this runs
  const slug = event.from.pathname.match(/^\/work\/([^/]+)/)?.[1]
  if (hero && slug && event.to.pathname === '/') {
    mode = 'back'
    backSlug = slug
    document.documentElement.dataset.flipNav = 'true'
    const original = event.loader
    event.loader = async () => {
      const hr = hero.getBoundingClientRect()
      const offset = Number(getComputedStyle(hero).getPropertyValue('--hero-offset') || 0)
      const heroRoot = hero.closest('.cs-hero') ?? document
      backText = readText(heroRoot, 'hero')
      copy = buildCopy(hero, hero.style.background, backText, 1, heroShift(offset, hr.width, hr.height))
      hero.style.visibility = 'hidden'
      heroRoot.querySelectorAll<HTMLElement>('.cs-hero-year, .cs-hero-text, .cs-hero-back').forEach(el => { el.style.visibility = 'hidden' })
      gsap.to(['main', '.footer'], { opacity: 0, duration: FADE, ease: 'power2.out' })
      await original()
    }
  }
}

async function onAfterSwap() {
  if (!copy || !mode) return finish()

  if (mode === 'forward') {
    // The incoming page isn't zoomed, so nothing spills any more
    clearMasks()
    await waitForImage(document.querySelector<HTMLImageElement>('[data-cs-hero] img'))
    return fadeOutCopy()
  }

  // Back: shrink the copy into its card, if the card is on screen after the swap
  const cardMedia = backSlug ? document.querySelector<HTMLElement>(`.work-list-media[data-slug="${backSlug}"]`) : null
  const r = cardMedia?.getBoundingClientRect()
  const onScreen = r && r.bottom > 0 && r.top < window.innerHeight
  if (!cardMedia || !r || !onScreen) return fadeOutCopy()
  const cardEl = cardMedia.closest<HTMLElement>('.work-list-card')
  const cardText = cardEl ? readText(cardEl, 'card') : null
  const cardTextEls = cardEl ? [...cardEl.querySelectorAll<HTMLElement>('.work-list-meta, .work-list-text')] : []
  // The cursor is often still over the card it came from. Browsers don't re-apply :hover after a page
  // swap until the mouse moves, so decide from the tracked pointer: land on the hover zoom and hold it
  // inline until the next pointer move, when the real :hover state takes over.
  const plane = cardMedia.querySelector<HTMLElement>('.work-list-plane')
  const hoverZoom = parseFloat(getComputedStyle(cardMedia).getPropertyValue('--work-hover-zoom')) || 1
  const pointerOver = canHover() && !!pointer && pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom
  const cardZoom = pointerOver ? hoverZoom : 1
  if (plane) {
    plane.style.transition = 'none'
    plane.style.transform = `scale(${cardZoom})`
  }
  cardMedia.style.visibility = 'hidden'
  if (backText && cardText) cardTextEls.forEach(el => { el.style.visibility = 'hidden' })
  else copy.querySelectorAll<HTMLElement>('[data-copy-meta], [data-copy-block]').forEach(el => el.remove())
  const heroRect = copy.getBoundingClientRect()
  const shrink = r.width / heroRect.width
  // Hold the copy at hero size while the homepage starts up, then zoom out in one smooth pass.
  // Capture the card's resting position first: preparing scales the page, card included.
  const cardState = Flip.getState(cardMedia)
  maskOutsideLines()
  const playSurroundings = prepareSurroundings(r, heroRect)
  await afterPageStartup()
  await Promise.all([
    fit(cardState, 1, shrink, 0, backText && cardText ? cardText : null, cardZoom),
    playSurroundings(zoomEase(1 / shrink, 1)),
  ])
  cardMedia.style.visibility = ''
  cardTextEls.forEach(el => { el.style.visibility = '' })
  if (plane) {
    requestAnimationFrame(() => { plane.style.transition = '' })
    const release = () => { plane.style.transform = '' }
    if (pointerOver) document.addEventListener('pointermove', release, { once: true })
    else requestAnimationFrame(release)
  }
  copy?.remove()
  copy = null
  finish()
}

// Registered once per full page load; Astro keeps document listeners across client navigations
type TransitionWindow = Window & { __workTransitionBound?: boolean }
const tw = window as TransitionWindow
if (!tw.__workTransitionBound) {
  tw.__workTransitionBound = true
  document.addEventListener('astro:before-preparation', onBeforePreparation)
  document.addEventListener('pointermove', e => { pointer = { x: e.clientX, y: e.clientY } }, { passive: true })
  document.addEventListener('astro:after-swap', onAfterSwap)
  // Back to work: when this case study was opened from the homepage, step back in history so the list
  // returns at the scroll position it was left at and the hero zooms into its card, like the browser's
  // Back. Otherwise (opened directly, or from another case study) the link goes to the work list.
  // Capture phase, before the router's own click handler, which skips clicks already default-prevented.
  window.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (!(e.target as Element | null)?.closest('a.back-to-work')) return
    const index = (history.state as { index?: number } | null)?.index ?? 0
    if (lastNav?.from === '/' && lastNav.to === location.pathname && index > 0) {
      e.preventDefault()
      history.back()
    }
  }, { capture: true })
  // The swap copies the incoming page's <html> attributes over ours, which would drop the flag right as
  // the browser starts its root crossfade; carry it onto the incoming page so global.css can skip it.
  document.addEventListener('astro:before-swap', e => {
    if (mode) (e as Event & { newDocument: Document }).newDocument.documentElement.dataset.flipNav = 'true'
  })
}
