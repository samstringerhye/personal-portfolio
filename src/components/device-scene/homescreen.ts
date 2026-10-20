// The Whataburger card: the app's icon on two iPhones, the home screen and the icon's quick actions
// menu. The app itself is under NDA, so the card shows no more than the icon, built from the logo the
// site already publishes. The screens are flattened from Apple's iOS 27 Design Resources kit.
import { DEVICES } from './shared'

const SHOTS = {
  home: '/motion/whataburger/home.webp',
  actions: '/motion/whataburger/actions.webp',
} as const

const TEMPLATE = (view: keyof typeof SHOTS) => `<div class="floor" aria-hidden="true"></div>
  <div class="stage"></div>
  <div class="device home"><div class="screen"><img src="${SHOTS[view]}" alt="" width="720" height="1566" decoding="async"></div></div>`

export function mountHomeScreen(art: HTMLElement, view: keyof typeof SHOTS = 'home'): () => void {
  art.insertAdjacentHTML('beforeend', TEMPLATE(view))
  const device = art.querySelector<HTMLElement>('.device')!
  const spec = DEVICES['iphone-17-pro']
  device.style.setProperty('--aspect', String(spec.aspect))
  device.style.setProperty('--layout-w', `${spec.screenWidth}px`)
  return () => {}
}
