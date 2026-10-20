import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { animations } from '../data/tokens'

gsap.registerPlugin(SplitText)

type TextRevealConfig = typeof animations.textReveal

export interface CmyAutoSplitHandle {
  split: SplitText
  kill(): void
}

/**
 * Per-line or per-word blur/y/opacity reveal using SplitText.create()
 * with autoSplit for responsive re-splitting.
 *
 * - Single line: splits into words, staggers each word
 * - Multi-line: splits into lines, staggers each line
 *
 * autoSplit handles font loading and container resize automatically.
 * The onSplit callback returns the animation so GSAP preserves
 * playback position across re-splits.
 */
export function createCmyAutoSplitReveal(
  el: HTMLElement,
  cfg: TextRevealConfig,
  timelineVars?: gsap.TimelineVars,
  splitMode: 'auto' | 'lines' = 'auto',
): CmyAutoSplitHandle {
  gsap.set(el, { opacity: 1, y: 0, filter: 'none', visibility: 'visible' })

  const split = SplitText.create(el, {
    type: 'words,lines',
    linesClass: 'reveal-line',
    wordsClass: 'reveal-word',
    // The split lines stay readable as they are: an aria-label isn't allowed on a paragraph
    aria: 'none',
    autoSplit: true,
    onSplit(self) {
      const lines = self.lines as HTMLElement[]
      const words = self.words as HTMLElement[]
      const useLines = splitMode === 'lines' || lines.length > 1
      const targets = useLines ? lines : words
      const stagger = useLines ? cfg.blockStagger : cfg.wordStagger

      gsap.set(targets, {
        opacity: 0,
        y: cfg.slideUp,
        filter: `blur(${cfg.initialBlur}px)`,
      })

      const tl = gsap.timeline({ ...timelineVars })

      targets.forEach((target, idx) => {
        tl.to(target, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: cfg.duration,
          ease: cfg.ease,
        }, idx * stagger)
      })

      // Returning the animation lets GSAP preserve playback on re-split
      return tl
    },
  })

  return {
    split,
    kill() { split.revert() },
  }
}

/**
 * Grouped variant — adds the reveal into a parent timeline at a given position.
 * Uses autoSplit for responsive re-splitting.
 */
export function createCmyAutoSplitRevealGrouped(
  el: HTMLElement,
  cfg: TextRevealConfig,
  parentTl: gsap.core.Timeline,
  position: number,
  splitMode: 'auto' | 'lines' = 'auto',
): CmyAutoSplitHandle {
  gsap.set(el, { opacity: 1, y: 0, filter: 'none', visibility: 'visible' })

  const split = SplitText.create(el, {
    type: 'words,lines',
    linesClass: 'reveal-line',
    wordsClass: 'reveal-word',
    // The split lines stay readable as they are: an aria-label isn't allowed on a paragraph
    aria: 'none',
    autoSplit: true,
    onSplit(self) {
      const lines = self.lines as HTMLElement[]
      const words = self.words as HTMLElement[]
      const useLines = splitMode === 'lines' || lines.length > 1
      const targets = useLines ? lines : words
      const stagger = useLines ? cfg.blockStagger : cfg.wordStagger

      gsap.set(targets, {
        opacity: 0,
        y: cfg.slideUp,
        filter: `blur(${cfg.initialBlur}px)`,
      })

      const tl = gsap.timeline()

      targets.forEach((target, idx) => {
        tl.to(target, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: cfg.duration,
          ease: cfg.ease,
        }, idx * stagger)
      })

      parentTl.add(tl, position)

      // Return so GSAP can manage playback across re-splits
      return tl
    },
  })

  return {
    split,
    kill() {
      split.revert()
    },
  }
}
