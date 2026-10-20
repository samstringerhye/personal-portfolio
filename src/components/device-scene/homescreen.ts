// The Whataburger card: the app's icon on an iPhone home screen. The app itself is under NDA, so the
// card shows no more than the icon, built from the logo the site already publishes. The apps around
// it are generic (a color and a simple glyph each, no real brands), there to make it a home screen.
import { DEVICES } from './shared'
import { statusIcons } from './status-icons'

// Glyphs in a 24-unit box, drawn in white
const G = {
  sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  cal: '<rect x="4" y="5.5" width="16" height="14" rx="2.5" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  cam: '<rect x="3.5" y="7" width="17" height="12" rx="3" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="13" r="3.2" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M9 7l1.2-2h3.6L15 7" fill="none" stroke="#fff" stroke-width="1.8"/>',
  pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11Z" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="10" r="2.3" fill="#fff"/>',
  note: '<rect x="5" y="3.5" width="14" height="17" rx="2.5" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M8.5 9h7M8.5 12.5h7M8.5 16h4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  clock: '<circle cx="12" cy="12" r="8" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M12 7.5V12l3 2" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  music: '<path d="M9 18V6l10-2v12" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7" cy="18" r="2.4" fill="#fff"/><circle cx="17" cy="16" r="2.4" fill="#fff"/>',
  card: '<rect x="3.5" y="6" width="17" height="12" rx="2.5" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M3.5 10h17" stroke="#fff" stroke-width="2.4"/>',
  gear: '<circle cx="12" cy="12" r="3" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.8 1.8M16.2 16.2 18 18M6 18l1.8-1.8M16.2 7.8 18 6" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  phone: '<path d="M7 4h2.5l1.5 4-2 1.2a10 10 0 0 0 5.8 5.8L16 13l4 1.5V17a2 2 0 0 1-2 2A14 14 0 0 1 5 6a2 2 0 0 1 2-2Z" fill="#fff"/>',
  chat: '<path d="M12 4.5c4.7 0 8 2.9 8 6.6s-3.3 6.6-8 6.6c-.9 0-1.7-.1-2.5-.3L5.5 19l1.1-3.2C5 14.6 4 13 4 11.1 4 7.4 7.3 4.5 12 4.5Z" fill="#fff"/>',
  globe: '<circle cx="12" cy="12" r="8" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M4 12h16M12 4c2.4 2.4 2.4 13.6 0 16M12 4c-2.4 2.4-2.4 13.6 0 16" fill="none" stroke="#fff" stroke-width="1.6"/>',
  photo: '<circle cx="12" cy="7.5" r="3" fill="#fff" opacity=".9"/><circle cx="16.5" cy="12" r="3" fill="#fff" opacity=".7"/><circle cx="12" cy="16.5" r="3" fill="#fff" opacity=".9"/><circle cx="7.5" cy="12" r="3" fill="#fff" opacity=".7"/>',
} as const
type Glyph = keyof typeof G

// Each app's own color, toned down to frosted glass on the screen (DeviceScene.astro) so the orange
// icon is the one the eye lands on
const APPS: ([string, Glyph, string] | 'whataburger')[] = [
  ['Weather', 'sun', 'linear-gradient(#5aa7e6, #2f6fbf)'], ['Calendar', 'cal', 'linear-gradient(#ef6b5e, #d9443b)'], ['Photos', 'photo', 'linear-gradient(#b9a3e3, #8b74c9)'], ['Camera', 'cam', 'linear-gradient(#8c939d, #5f6670)'],
  ['Maps', 'pin', 'linear-gradient(#6cc58a, #3f9e62)'], 'whataburger', ['Notes', 'note', 'linear-gradient(#f2c94c, #dba826)'], ['Clock', 'clock', 'linear-gradient(#3b3f47, #1d2026)'],
  ['Music', 'music', 'linear-gradient(#f2778f, #d94a6a)'], ['Wallet', 'card', 'linear-gradient(#3b3f47, #1d2026)'], ['Settings', 'gear', 'linear-gradient(#a3a9b2, #737a84)'], ['Browser', 'globe', 'linear-gradient(#64b5f6, #2f80d6)'],
]
const DOCK: [Glyph, string][] = [
  ['phone', 'linear-gradient(#6fd17e, #3fae55)'], ['chat', 'linear-gradient(#6fd17e, #3fae55)'], ['globe', 'linear-gradient(#64b5f6, #2f80d6)'], ['music', 'linear-gradient(#f2778f, #d94a6a)'],
]

const icon = (glyph: Glyph, bg: string) => `<span class="home-icon" style="background:${bg}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="#fff">${G[glyph]}</svg></span>`
const app = (a: (typeof APPS)[number]) => a === 'whataburger'
  ? '<span class="home-app"><span class="home-icon home-wab"></span><span class="home-label">Whataburger</span></span>'
  : `<span class="home-app">${icon(a[1], a[2])}<span class="home-label">${a[0]}</span></span>`

const TEMPLATE = `<div class="floor" aria-hidden="true"></div>
  <div class="stage"></div>
  <div class="device home"><div class="screen">
    <div class="home-status"><span>9:41</span>${statusIcons('#fff', 'home-status-icons')}</div>
    <div class="home-grid">${APPS.map(app).join('')}</div>
    <div class="home-search">Search</div>
    <div class="home-dock">${DOCK.map(([g, bg]) => icon(g, bg)).join('')}</div>
  </div></div>`

export function mountHomeScreen(art: HTMLElement): () => void {
  art.insertAdjacentHTML('beforeend', TEMPLATE)
  const device = art.querySelector<HTMLElement>('.device')!
  const spec = DEVICES['iphone-17-pro']
  device.style.setProperty('--aspect', String(spec.aspect))
  device.style.setProperty('--layout-w', `${spec.screenWidth}px`)
  return () => {}
}
