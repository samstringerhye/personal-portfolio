// Each work card's arrangement: the devices in one 3D scene, at their real sizes, posed around the
// lead device the way a product shot groups them. One camera, one floor, one shadow; the whole
// arrangement turns as one when dragged. Shared by the page and the renderer, so no three.js here.
import type { DeviceName } from './shared'
import type { TourName } from './tours'

/** What plays on a device's screen */
export type ScreenSource =
  | { kind: 'tour'; name: TourName }
  | { kind: 'myfrontier' }
  | { kind: 'myfrontier-still'; shot: string }
  /** The Whataburger icon on an iPhone: on the home screen, or the Top Hit in Spotlight search */
  | { kind: 'home'; view: 'home' | 'search' }
  /** Turned away from the camera: no screen, only a dark display if it's spun round */
  | { kind: 'none' }

export interface Placement {
  device: DeviceName
  screen: ScreenSource
  /** Where the display's center sits, in meters from the lead display's (x right, y up, z toward
      the camera) */
  at: [number, number, number]
  /** Its own pose, radians: pitch (top back), yaw (turn right), roll (top to the left) */
  turn: [number, number, number]
  /** Floats: bobs gently, and drifts up into place as the card scrolls in */
  float?: boolean
  /** Larger than life by this much, the way a product shot cheats a phone forward beside a laptop */
  scale?: number
  /** Its color, over the model's own: hex by material name */
  finish?: Record<string, string>
}

export interface Arrangement {
  /** What the card shows, for screen readers */
  label: string
  /** The lead device first: its rest angle (workCards.devices) sets the arrangement's, unless the
      arrangement has its own (workCards.scenes) */
  placements: Placement[]
  /** Share of the stage the arrangement fills, by height or by width in a narrow stage. The stage
      runs 10% past its box on every side (DeviceScene), so 0.75 or so fills the box */
  fill: number
}

// Finishes from the real lineups (Silver and the tablet's Graphite are the devices' own, shared.ts).
// iPhone 17 Pro: the aluminum unibody, its antenna bands and the glass window on the back, which
// runs a shade lighter
const COSMIC_ORANGE = { Anodized_aluminum: '#b4521f', Plastic_antena: '#9c4719', Frosted_glass: '#c2612e' }
// Galaxy S22 Ultra: the polished frame and the frosted back
const BURGUNDY = { Bezel: '#5c2a31', Back_Cover_Glass: '#4a1d25', Rearcase: '#4a1d25' }
const GREEN = { Bezel: '#4f5b52', Back_Cover_Glass: '#3a463d', Rearcase: '#3a463d' }

// Turns: [pitch, yaw, roll]. Every screen faces the camera: the arrangement's rest yaw plus a
// device's own stays within about ±0.3, so no screen is seen edge on
export const ARRANGEMENTS = {
  // Three phones fanned out evenly from the one in the middle, two Silver and one Cosmic Orange: the tour in
  // front, the dashboard and a bill floating either side
  myfrontier: {
    label: 'The MyFrontier app on three iPhones fanned out: the middle one plays a tour of signing in, paying a bill and checking a support order, with the dashboard and a bill floating either side',
    fill: 0.76,
    placements: [
      { device: 'iphone-17-pro', screen: { kind: 'myfrontier' }, at: [0, 0, 0.035], turn: [0, 0, 0] },
      { device: 'iphone-17-pro', screen: { kind: 'myfrontier-still', shot: 'dashboard-1' }, at: [-0.078, -0.008, -0.01], turn: [0.02, 0.26, 0.12], float: true },
      { device: 'iphone-17-pro', screen: { kind: 'myfrontier-still', shot: 'bill-pay-1' }, at: [0.078, -0.008, -0.01], turn: [0.02, -0.26, -0.12], float: true, finish: COSMIC_ORANGE },
    ],
  },
  // An orange phone with the icon floating in front, a silver one standing behind it
  whataburger: {
    label: 'The Whataburger app on two iPhones: its icon on the home screen of an orange one floating in front, and found in Spotlight search on a silver one behind',
    fill: 0.74,
    placements: [
      { device: 'iphone-17-pro', screen: { kind: 'home', view: 'home' }, at: [0.022, 0.012, 0.03], turn: [0.06, 0.04, -0.07], float: true, finish: COSMIC_ORANGE },
      { device: 'iphone-17-pro', screen: { kind: 'home', view: 'search' }, at: [-0.05, -0.006, -0.05], turn: [0.02, 0.3, 0.08] },
    ],
  },
  // The laptop open, the phone standing in the foreground, taller in frame
  amica: {
    label: 'Amica.com on a laptop, playing the homepage and Get a quote, with the mobile homepage on an iPhone standing in front',
    fill: 0.74,
    placements: [
      { device: 'macbook-air-15', screen: { kind: 'tour', name: 'amica' }, at: [0.04, 0, -0.06], turn: [0, 0.12, 0] },
      { device: 'iphone-17-pro', screen: { kind: 'tour', name: 'amica-mobile' }, at: [-0.16, -0.03, 0.12], turn: [-0.04, 0.42, -0.05], scale: 1.45 },
    ],
  },
  // The laptop open, the phone floating in front of it on the right
  cvs: {
    label: 'CVS.com on a laptop, playing the homepage, the Shop menu and the Neutrogena brand page, with the mobile homepage on an iPhone floating in front of it',
    fill: 0.74,
    placements: [
      { device: 'macbook-neo', screen: { kind: 'tour', name: 'cvs' }, at: [0, 0, 0], turn: [0, 0, 0] },
      { device: 'iphone-17-pro', screen: { kind: 'tour', name: 'cvs-mobile' }, at: [0.23, -0.02, 0.15], turn: [0.04, 0.24, -0.08], float: true, scale: 1.45 },
    ],
  },
  // A Galaxy tablet, a Galaxy phone floating in front on the mobile homepage
  samsung: {
    label: 'The redesigned Samsung.com on a Galaxy tablet, scrolling the homepage to Appliances and a category page, with the Galaxy S20 homepage hero on a Galaxy phone floating in front',
    fill: 0.74,
    placements: [
      { device: 'galaxy-tab-s8-ultra', screen: { kind: 'tour', name: 'samsung' }, at: [0, 0, 0], turn: [0, 0, 0] },
      { device: 'galaxy-s22-ultra', screen: { kind: 'tour', name: 'samsung-mobile' }, at: [0.17, -0.045, 0.08], turn: [0.04, 0.2, -0.1], float: true, finish: BURGUNDY },
    ],
  },
  // The Fold open on the configurator, a Galaxy phone floating in front on the mobile version
  bespoke: {
    label: 'The Bespoke configurator on an unfolded Galaxy Z Fold, choosing depth, colors and the finished kitchen, with the mobile depth step on a Galaxy phone floating in front',
    fill: 0.74,
    placements: [
      { device: 'galaxy-z-fold8', screen: { kind: 'tour', name: 'bespoke' }, at: [0, 0, 0], turn: [0, 0, 0] },
      { device: 'galaxy-s22-ultra', screen: { kind: 'tour', name: 'bespoke-mobile' }, at: [-0.088, -0.035, 0.05], turn: [0.03, 0.4, 0.08], float: true, finish: GREEN },
    ],
  },
} satisfies Record<string, Arrangement>

export type SceneName = keyof typeof ARRANGEMENTS
export const arrangementOf = (name: SceneName): Arrangement => ARRANGEMENTS[name]
