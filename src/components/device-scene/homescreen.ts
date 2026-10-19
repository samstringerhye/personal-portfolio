// The Whataburger card: the app's icon on an iPhone home screen. The app itself is under NDA, so the
// card shows no more than the icon, built from the logo the site already publishes.
import { DEVICES } from './shared'

const TEMPLATE = `<div class="floor" aria-hidden="true"></div>
  <div class="stage"></div>
  <div class="device home"><div class="screen">
    <p class="home-time">9:41</p>
    <div class="home-app"><span class="home-icon"></span><span class="home-label">Whataburger</span></div>
  </div></div>`

export function mountHomeScreen(art: HTMLElement): () => void {
  art.insertAdjacentHTML('beforeend', TEMPLATE)
  const device = art.querySelector<HTMLElement>('.device')!
  const spec = DEVICES['iphone-17-pro']
  device.style.setProperty('--aspect', String(spec.aspect))
  device.style.setProperty('--layout-w', `${spec.screenWidth}px`)
  return () => {}
}
