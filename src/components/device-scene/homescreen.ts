// The Whataburger card: the app's icon on two iPhones, on a light home screen and a dark one laid out
// differently. The iOS screens come from Apple's iOS 27 Design Resources kit. Opening the icon
// reveals the supplied Pele home frame with its own fixed order action and navigation.
import { DEVICES } from './shared'

const SHOTS = {
  home: '/motion/whataburger/home.webp',
  dark: '/motion/whataburger/home-dark.webp',
} as const

const TEMPLATE = (view: keyof typeof SHOTS) => `<div class="floor" aria-hidden="true"></div>
  <div class="stage"></div>
  <div class="device home"><div class="screen">
    <img class="home-screen-image" src="${SHOTS[view]}" alt="" width="720" height="1566" decoding="async">
    ${view === 'home' ? `<button class="app-launch" type="button" data-app-launch aria-label="Open Whataburger" aria-pressed="false"></button>
      <div class="home-app-image" aria-hidden="true">
        <img class="home-app-content" src="/motion/whataburger/home-pele-current.webp" alt="" width="390" height="2640" decoding="async">
        <img class="home-app-nav" src="/motion/whataburger/home-pele-nav.webp" alt="" width="390" height="116" decoding="async">
        <img class="home-app-order" src="/motion/whataburger/home-pele-order.webp" alt="" width="366" height="64" decoding="async">
      </div>` : ''}
  </div></div>`

export function mountHomeScreen(art: HTMLElement, view: keyof typeof SHOTS = 'home'): () => void {
  art.insertAdjacentHTML('beforeend', TEMPLATE(view))
  const device = art.querySelector<HTMLElement>('.device')!
  const spec = DEVICES['iphone-17-pro']
  device.style.setProperty('--aspect', String(spec.aspect))
  device.style.setProperty('--layout-w', `${spec.screenWidth}px`)
  const launch = device.querySelector<HTMLButtonElement>('[data-app-launch]')
  const scene = art.closest<HTMLElement>('.device-scene') ?? art
  launch?.addEventListener('click', () => {
    const open = !scene.hasAttribute('data-app-open')
    scene.toggleAttribute('data-app-open', open)
    launch.setAttribute('aria-pressed', String(open))
    launch.setAttribute('aria-label', open ? 'Return to iPhone home screen' : 'Open Whataburger')
  })
  scene.addEventListener('keydown', e => {
    if (e.key === 'Escape' && scene.hasAttribute('data-app-open')) {
      scene.removeAttribute('data-app-open')
      launch?.setAttribute('aria-pressed', 'false')
      launch?.setAttribute('aria-label', 'Open Whataburger')
    }
  })
  return () => {}
}
