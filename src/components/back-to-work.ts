/**
 * Back to work: when the case study was opened from the homepage, step back in history so the list
 * returns at the scroll position it was left at, like the browser's Back. Otherwise (opened directly,
 * or from another case study) the link goes to the work list.
 *
 * Loaded from the homepage too (WorkList.astro): a page's scripts run after its swap, so a listener
 * first added by the case study would miss the navigation into it.
 */
type NavEvent = Event & { from: URL; to: URL }

// The last client-side navigation, so the button can tell whether it can step back to the homepage
let lastNav: { from: string; to: string } | null = null

// Registered once per full page load; Astro keeps document listeners across client navigations
type BackWindow = Window & { __backToWorkBound?: boolean }
const bw = window as BackWindow
if (!bw.__backToWorkBound) {
  bw.__backToWorkBound = true
  document.addEventListener('astro:before-preparation', e => {
    const { from, to } = e as NavEvent
    lastNav = { from: from.pathname, to: to.pathname }
  })
  // Capture phase, before the router's own click handler, which skips clicks already default-prevented
  window.addEventListener('click', e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (!(e.target as Element | null)?.closest('a.back-to-work')) return
    const index = (history.state as { index?: number } | null)?.index ?? 0
    if (lastNav?.from === '/' && lastNav.to === location.pathname && index > 0) {
      e.preventDefault()
      history.back()
    }
  }, { capture: true })
}
