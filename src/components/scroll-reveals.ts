import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { animations } from '../data/tokens'
import {
  createCmyAutoSplitReveal,
  createCmyAutoSplitRevealGrouped,
} from './cmy-animate'

gsap.registerPlugin(ScrollTrigger, SplitText)

const cfg = animations.textReveal
const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let revealCtx: gsap.Context | null = null

/**
 * Returns ScrollTrigger tween vars when the trigger element is below
 * the viewport, or an empty object when it's already visible.
 * Spreading the result into a gsap.to() call means visible elements
 * animate immediately while off-screen ones wait for scroll.
 */
function stVars(trigger: Element | null, start: string = cfg.scrollStart): Pick<gsap.AnimationVars, 'scrollTrigger'> {
  if (!trigger) return {}
  if ((trigger as HTMLElement).getBoundingClientRect().top < window.innerHeight) return {}
  return {
    scrollTrigger: {
      trigger,
      start,
      toggleActions: 'play none none none',
    },
  }
}

export async function initScrollReveals() {
  // Revert all tweens, timelines, ScrollTriggers, and SplitText splits
  // that were created in the previous call's context.
  revealCtx?.revert()
  revealCtx = null

  if (prefersReduced()) {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
      gsap.set(el, { opacity: 1, y: 0, filter: 'none', textShadow: 'none' })
    })
    return
  }

  await document.fonts.ready

  revealCtx = gsap.context(() => {
    // Track grouped elements so we don't double-animate them
    const grouped = new Set<HTMLElement>()

    // ── Helpers: determine reveal type from data-reveal attribute ──
    const isFade = (el: HTMLElement) => el.dataset.reveal === 'fade'
    const splitMode = (el: HTMLElement): 'auto' | 'lines' =>
      el.dataset.reveal === 'line' ? 'lines' : 'auto'

    function createFadeReveal(el: HTMLElement, vars: gsap.TweenVars = {}) {
      gsap.set(el, { opacity: 0, y: cfg.slideUp, filter: `blur(${cfg.initialBlur}px)` })
      gsap.to(el, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: cfg.duration, ease: cfg.ease,
        ...vars,
      })
    }

    function createFadeRevealGrouped(el: HTMLElement, parentTl: gsap.core.Timeline, offset: number) {
      gsap.set(el, { opacity: 0, y: cfg.slideUp, filter: `blur(${cfg.initialBlur}px)` })
      parentTl.to(el, {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: cfg.duration, ease: cfg.ease,
      }, offset)
    }

    // ── Grouped reveals: [data-reveal-group] containers ──
    document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach(group => {
      if (group.closest('[data-no-reveal]')) return
      const children = Array.from(group.querySelectorAll<HTMLElement>('[data-reveal]'))
      if (!children.length) return

      children.forEach(el => grouped.add(el))

      const parentTl = gsap.timeline(stVars(group))

      children.forEach((el, idx) => {
        if (isFade(el)) {
          createFadeRevealGrouped(el, parentTl, idx * cfg.blockStagger)
        } else {
          createCmyAutoSplitRevealGrouped(el, cfg, parentTl, idx * cfg.blockStagger, splitMode(el))
        }
      })
    })

    // ── Standalone reveals: [data-reveal] not inside a group or no-reveal zone ──
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => {
      if (grouped.has(el)) return
      if (el.closest('[data-no-reveal]')) return

      const sv = stVars(el)

      if (isFade(el)) {
        createFadeReveal(el, sv)
      } else {
        createCmyAutoSplitReveal(el, cfg, sv, splitMode(el))
      }
    })

    // ── Image reveals: all pages ──
    initImageReveals()

    // ── Home page reveals ──
    initHomeReveals()
  })
}

/* ── Image reveal animations — site-wide ── */

function initImageReveals() {
  const main = document.querySelector('main')
  if (!main) return

  const imgStart = 'top 70%'
  const imgDuration = 0.9
  const imgEase = 'power3.out'

  const blurUp = { opacity: 0, y: 30 }
  const blurUpTo = { opacity: 1, y: 0, duration: imgDuration, ease: imgEase }

  // Case study body gets richer image reveals
  const body = document.querySelector('.case-study-body')

  if (body) {
    // ── Standalone images: fade up with blur ──
    body.querySelectorAll<HTMLElement>(':scope > p:has(> img), :scope > .cs-figure').forEach(el => {
      gsap.set(el, blurUp)
      gsap.to(el, {
        ...blurUpTo,
        ...stVars(el, imgStart),
        onComplete() { gsap.set(el, { clearProps: 'transform,translate,rotate,scale' }) },
      })
    })

    // ── Image pairs: stagger images up with blur ──
    body.querySelectorAll<HTMLElement>('.image-pair').forEach(pair => {
      const imgs = pair.querySelectorAll<HTMLElement>('.image-pair-cell img')
      if (!imgs.length) return
      gsap.set(imgs, blurUp)
      gsap.to(imgs, {
        ...blurUpTo,
        stagger: 0.15,
        ...stVars(pair, imgStart),
        onComplete() { gsap.set(imgs, { clearProps: 'transform,translate,rotate,scale' }) },
      })
    })

    // ── Carousels: slides animate in from right ──
    body.querySelectorAll<HTMLElement>('.carousel').forEach(el => {
      const slides = el.querySelectorAll<HTMLElement>('.carousel-track > img, .carousel-track > .cs-figure')
      if (!slides.length) return
      gsap.set(slides, { opacity: 0, x: 60 })
      gsap.to(slides, {
        opacity: 1, x: 0,
        duration: imgDuration, ease: imgEase,
        stagger: 0.1,
        ...stVars(el, imgStart),
      })
    })

    // ── Image grids: fade up with blur ──
    body.querySelectorAll<HTMLElement>('.image-grid').forEach(el => {
      gsap.set(el, blurUp)
      gsap.to(el, {
        ...blurUpTo,
        ...stVars(el, imgStart),
        onComplete() { gsap.set(el, { clearProps: 'transform,translate,rotate,scale' }) },
      })
    })

    // ── Zigzag sections: both media and prose fade up with blur ──
    body.querySelectorAll<HTMLElement>('.zigzag-section').forEach(section => {
      const media = section.querySelector<HTMLElement>('.zigzag-media')
      const prose = section.querySelector<HTMLElement>('.zigzag-prose')

      if (media) {
        gsap.set(media, blurUp)
        gsap.to(media, {
          ...blurUpTo,
          ...stVars(section, imgStart),
          onComplete() { gsap.set(media, { clearProps: 'transform,translate,rotate,scale' }) },
        })
      }

      if (prose) {
        gsap.set(prose, { opacity: 0, y: 20 })
        gsap.to(prose, {
          opacity: 1, y: 0,
          duration: imgDuration, ease: imgEase, delay: 0.2,
          ...stVars(section, imgStart),
        })
      }
    })

    // ── Text reveals: CMY SplitText on prose-group children ──
    body.querySelectorAll<HTMLElement>('.prose-group').forEach(group => {
      const children = Array.from(group.querySelectorAll<HTMLElement>(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > p, :scope > blockquote'))
      if (!children.length) return

      const parentTl = gsap.timeline(stVars(group))

      children.forEach((el, idx) => {
        createCmyAutoSplitRevealGrouped(el, cfg, parentTl, idx * cfg.blockStagger, 'lines')
      })
    })

    // ── Standalone headings outside prose-group ──
    body.querySelectorAll<HTMLElement>(
      ':scope > h1, :scope > h2, :scope > h3'
    ).forEach(el => {
      createCmyAutoSplitReveal(el, cfg, stVars(el), 'lines')
    })
  }

  // ── General images: any img in main not inside carousel/already-animated containers ──
  main.querySelectorAll<HTMLElement>('img').forEach(el => {
    // Skip images handled by other animation systems
    if (el.closest('.case-study-body')) return
    if (el.closest('.carousel-track')) return
    if (el.closest('.work-track')) return
    if (el.closest('[data-no-reveal]')) return
    if (el.classList.contains('nav-logo-icon')) return
    gsap.set(el, blurUp)
    gsap.to(el, {
      ...blurUpTo,
      ...stVars(el, imgStart),
      onComplete() { gsap.set(el, { clearProps: 'transform,translate,rotate,scale' }) },
    })
  })
}

/* ── Home page reveal animations ── */

function initHomeReveals() {
  const start = 'top 70%'
  const duration = 0.9
  const ease = 'power3.out'

  // ── Timeline: job card text staggers in (borders stay visible) ──
  const timelineJobTexts = document.querySelectorAll<HTMLElement>('.tl-job-info')
  const timelineTrigger = document.querySelector<HTMLElement>('.experience-timeline')
  if (timelineJobTexts.length) {
    gsap.set(timelineJobTexts, { opacity: 0, y: 20 })
    gsap.to(timelineJobTexts, {
      opacity: 1, y: 0,
      duration: 0.7, ease,
      stagger: 0.1,
      ...stVars(timelineTrigger, start),
    })
  }

  // ── Timeline: year labels stagger in (borders stay visible) ──
  const yearLabels = document.querySelectorAll<HTMLElement>('.tl-year p')
  if (yearLabels.length) {
    gsap.set(yearLabels, { opacity: 0 })
    gsap.to(yearLabels, {
      opacity: 1,
      duration: 0.7, ease,
      stagger: 0.05,
      delay: 0.2,
      ...stVars(timelineTrigger, start),
    })
  }

  // ── Scrolling interests: each row triggers independently ──
  document.querySelectorAll<HTMLElement>('.interests-row').forEach((row) => {
    gsap.set(row, { opacity: 0, y: 30 })
    gsap.to(row, {
      opacity: 1, y: 0,
      duration, ease,
      ...stVars(row, start),
    })
  })

  // ── Dot grid: fade in via CSS custom property ──
  const interestsSection = document.querySelector<HTMLElement>('.interests-section')
  if (interestsSection) {
    gsap.fromTo(interestsSection, { '--dot-grid-reveal': 0 } as any, {
      '--dot-grid-reveal': 1,
      duration: 1.2,
      ease: 'power2.out',
      ...stVars(interestsSection, start),
    } as any)
  }

}
