// Loads the card ↔ hero zoom (gsap + Flip) off the critical path: at the first idle moment, or as
// soon as a pointer goes down, so a tap on a card still zooms. A navigation that starts before it
// loads is a plain page change.
let loading: Promise<unknown> | null = null
const load = () => (loading ??= import('./work-transition'))

if ('requestIdleCallback' in window) requestIdleCallback(load, { timeout: 2000 })
else setTimeout(load, 1000)
document.addEventListener('pointerdown', load, { once: true, capture: true })
document.addEventListener('focusin', load, { once: true })
