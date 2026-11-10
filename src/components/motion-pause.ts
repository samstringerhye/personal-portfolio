// A site-wide pause for motion that runs on its own: the marquees, the device screen tours and the
// Lottie loops. The footer's control sets it (WCAG 2.2.2); each animation checks it and listens for
// changes. It lasts for the visit, and is separate from prefers-reduced-motion, which those
// animations already follow.
const KEY = 'motion-paused'
const EVENT = 'motion:change'

export const motionPaused = () => document.documentElement.dataset.motion === 'paused'

export function setMotionPaused(paused: boolean) {
  if (paused) document.documentElement.dataset.motion = 'paused'
  else delete document.documentElement.dataset.motion
  try {
    if (paused) sessionStorage.setItem(KEY, '1')
    else sessionStorage.removeItem(KEY)
  } catch {}
  document.dispatchEvent(new CustomEvent(EVENT))
}

// A page change replaces the root element's attributes, so the choice is read back from storage
export function restoreMotionPaused() {
  let stored = false
  try { stored = sessionStorage.getItem(KEY) === '1' } catch {}
  if (stored !== motionPaused()) setMotionPaused(stored)
}

/** Calls fn whenever the pause is switched; returns the function that stops listening. */
export function onMotionChange(fn: () => void): () => void {
  document.addEventListener(EVENT, fn)
  return () => document.removeEventListener(EVENT, fn)
}
