// The browser around a website tour, so a site reads as a site: the menu bar and Safari's toolbar on
// the Macs, the status bar and Safari's floating address bar on the iPhone, the status bar and
// Chrome's address bar on the Galaxy devices. Sized in cqw of the device, so it scales with the
// screen (DeviceScene.astro styles it).
import type { DeviceName } from './shared'
import { statusIcons } from './status-icons'

const lock = `<svg class="lock" viewBox="0 0 10 13" aria-hidden="true"><rect x="0.5" y="5.5" width="9" height="7" rx="1.6" fill="currentColor"/><path d="M2.6 5.6V3.9a2.4 2.4 0 0 1 4.8 0v1.7" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`
const chevrons = `<svg class="nav" viewBox="0 0 34 14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 2 2 7l5 5"/><path d="M27 2l5 5-5 5" opacity=".35"/></svg>`
const dots = `<svg class="dots" viewBox="0 0 4 16" aria-hidden="true" fill="currentColor"><circle cx="2" cy="2" r="1.6"/><circle cx="2" cy="8" r="1.6"/><circle cx="2" cy="14" r="1.6"/></svg>`
const share = `<svg class="share" viewBox="0 0 14 17" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 1v10M3.5 4.5 7 1l3.5 3.5"/><path d="M4.5 7H2.5v9h9V7h-2"/></svg>`

/** Whether a color is light enough for dark text on it */
const light = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return ((n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) > 150
}

/** Wraps a tour's device (.device > .screen) in its browser. site is the domain in the address bar;
    page is the color at the top of the page, which the status bar sits on */
export function addBrowser(device: HTMLElement, kind: DeviceName, site: string, page: string) {
  const screen = device.querySelector<HTMLElement>('.screen')!
  const ink = light(page) ? '#111' : '#fff'
  const status = (time: string) =>
    `<div class="web-status" aria-hidden="true" style="background:${page};color:${ink}"><span class="time">${time}</span>${statusIcons(ink, 'icons')}</div>`
  device.classList.add('web')
  if (kind.startsWith('macbook')) {
    device.dataset.browser = 'mac'
    // The menu bar first, around the notch, then Safari's toolbar
    const menu = ['File', 'Edit', 'View', 'History', 'Bookmarks', 'Window', 'Help'].map(m => `<span>${m}</span>`).join('')
    screen.insertAdjacentHTML('beforebegin', `<div class="web-menu" aria-hidden="true"><b>Safari</b>${menu}<span class="clock">${statusIcons('#111', 'icons')}Mon 9:41</span></div><div class="web-bar" aria-hidden="true"><i class="lights"><b></b><b></b><b></b></i>${chevrons}<span class="url">${lock}${site}</span>${share}</div>`)
  } else if (kind === 'iphone-17-pro') {
    device.dataset.browser = 'ios'
    screen.insertAdjacentHTML('beforebegin', status('9:41'))
    screen.insertAdjacentHTML('afterend', `<div class="web-bar" aria-hidden="true"><span class="url">${lock}${site}</span>${dots}</div>`)
  } else {
    device.dataset.browser = kind === 'galaxy-s22-ultra' ? 'android phone' : 'android'
    screen.insertAdjacentHTML('beforebegin', `${status('12:45')}<div class="web-bar" aria-hidden="true"><span class="url">${lock}${site}</span><span class="tabs">2</span>${dots}</div>`)
  }
}
