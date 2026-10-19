/**
 * Keeps a case study hero's title clear of its art. Wide heroes overlay the title on the art, as on
 * the work cards, but at some widths and viewport heights (a sideways tablet, a short laptop window)
 * the title wraps or the art crops until the two meet. Then the hero stacks instead: the art framed
 * above, the title on the project's color below (`cs-hero--stacked`, global.css), as on phones.
 *
 * Shared by the hero itself and by work-transition.ts's measuring copy, so the card-to-hero zoom
 * lands on the same layout.
 */
import type { SubjectBox } from './narrow-art'

export const STACKED = 'cs-hero--stacked'

// Clear space kept between the title's lines and the subject's extent, in px
const GAP = 16

/** Where the subject sits in the hero frame, in viewport px. Wide heroes cover the frame with the
    3:2 art and shift it down by --hero-offset of the art's height (CaseStudyHero.astro). */
function subjectRect(frame: DOMRect, bounds: SubjectBox, offset: number) {
  const artH = Math.max(frame.height, frame.width / 1.5)
  const artW = artH * 1.5
  const left = frame.left + (frame.width - artW) / 2
  const top = frame.top + (frame.height - artH) / 2 + offset * artH
  return {
    left: left + bounds.left * artW,
    right: left + bounds.right * artW,
    top: top + bounds.top * artH,
    bottom: top + bounds.bottom * artH,
  }
}

function lineRects(el: Element | null): DOMRect[] {
  if (!el) return []
  const range = document.createRange()
  range.selectNodeContents(el)
  return [...range.getClientRects()]
}

/**
 * Stacks the hero when its overlaid title or tagline would come within GAP of the subject, and
 * unstacks it when they clear. Measures with the text overlaid; narrow heroes always stack (by
 * their own container query), so this leaves them alone.
 */
export function fitHero(hero: HTMLElement, frame: HTMLElement, bounds: SubjectBox, offset: number): boolean {
  // Editorial Kit: text never sits on the art, so every wide hero stacks (narrow ones stack by
  // their own container query, at the same 780px as the work cards)
  if (document.documentElement.classList.contains('ek')) {
    const stacked = hero.getBoundingClientRect().width > 780
    hero.classList.toggle(STACKED, stacked)
    return stacked
  }
  hero.classList.remove(STACKED)
  const text = hero.querySelector<HTMLElement>('.cs-hero-text')
  if (!text || getComputedStyle(text).position !== 'absolute') return false
  const subject = subjectRect(frame.getBoundingClientRect(), bounds, offset)
  const lines = [...lineRects(hero.querySelector('.cs-hero-title')), ...lineRects(hero.querySelector('.cs-hero-tagline'))]
  const meets = lines.some(r =>
    r.right + GAP > subject.left && r.left - GAP < subject.right &&
    r.bottom + GAP > subject.top && r.top - GAP < subject.bottom)
  hero.classList.toggle(STACKED, meets)
  return meets
}

/** The bounds and offset a hero (or a work card) carries in its data attributes. */
export function heroFitData(el: HTMLElement): { bounds: SubjectBox; offset: number } | null {
  const raw = el.dataset.subjectBounds
  if (!raw) return null
  const [top, right, bottom, left] = raw.split(',').map(Number)
  return { bounds: { top, right, bottom, left }, offset: Number(el.dataset.heroOffset ?? 0) }
}
