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
  | { kind: 'home' }
  /** Turned away from the camera: no screen, only a dark display if it's spun round */
  | { kind: 'none' }

export interface Placement {
  device: DeviceName
  screen: ScreenSource
  /** Where the display's center sits, in meters from the lead display's (x right, y up, z toward
      the camera) */
  at: [number, number, number]
  /** Its own pose, radians: pitch (top back), yaw (turn right), roll (lean right) */
  turn: [number, number, number]
  /** Floats: bobs gently, and drifts up into place as the card scrolls in */
  float?: boolean
}

export interface Arrangement {
  /** What the card shows, for screen readers */
  label: string
  /** The lead device first: its rest angle (workCards.devices) sets the arrangement's */
  placements: Placement[]
  /** Share of the stage the arrangement fills, by height or by width in a narrow stage. The stage
      runs 10% past its box on every side (DeviceScene), so 0.75 or so fills the box */
  fill: number
}

// Turns: [pitch, yaw, roll]. A yaw near π shows a device's back; a pitch near −π/2 lays it on the
// floor, screen up
export const ARRANGEMENTS = {
  // Three phones fanned out: one turned to show its back, the tour in front, a support screen
  // floating on the right
  myfrontier: {
    label: 'The MyFrontier app on three iPhones: one plays a tour of signing in, paying a bill and checking a support order, one floats beside it on the support screen, one shows its back',
    fill: 0.76,
    placements: [
      { device: 'iphone-17-pro', screen: { kind: 'myfrontier' }, at: [0, 0, 0.03], turn: [0, 0, 0] },
      { device: 'iphone-17-pro', screen: { kind: 'none' }, at: [-0.075, -0.004, -0.04], turn: [0.04, Math.PI - 0.5, -0.1] },
      { device: 'iphone-17-pro', screen: { kind: 'myfrontier-still', shot: 'support-1' }, at: [0.078, 0.022, -0.03], turn: [0.06, -0.34, 0.16], float: true },
    ],
  },
  // The icon phone floating over a second one face down on the floor
  whataburger: {
    label: 'The Whataburger app icon on an iPhone home screen, floating above a second iPhone lying face down',
    fill: 0.74,
    placements: [
      { device: 'iphone-17-pro', screen: { kind: 'home' }, at: [0, 0, 0], turn: [0.08, 0.1, 0.08], float: true },
      { device: 'iphone-17-pro', screen: { kind: 'none' }, at: [0.03, -0.1, -0.05], turn: [Math.PI / 2, 0.5, 0] },
    ],
  },
  // The laptop open, the phone standing in the foreground, taller in frame
  amica: {
    label: 'Amica.com on a laptop, playing the homepage and Get a quote, with the mobile homepage on an iPhone standing in front',
    fill: 0.74,
    placements: [
      { device: 'macbook-air-15', screen: { kind: 'tour', name: 'amica' }, at: [0.04, 0, -0.06], turn: [0, 0.12, 0] },
      { device: 'iphone-17-pro', screen: { kind: 'tour', name: 'amica-mobile' }, at: [-0.15, -0.035, 0.12], turn: [-0.04, 0.42, -0.05] },
    ],
  },
  // The laptop open, the phone lying on the desk in front of it, screen up
  cvs: {
    label: 'CVS.com on a laptop, playing the homepage, the Shop menu and the Neutrogena brand page, with the mobile homepage on an iPhone lying in front of it',
    fill: 0.74,
    placements: [
      { device: 'macbook-neo', screen: { kind: 'tour', name: 'cvs' }, at: [0, 0, 0], turn: [0, 0, 0] },
      { device: 'iphone-17-pro', screen: { kind: 'tour', name: 'cvs-mobile' }, at: [0.2, -0.1, 0.1], turn: [-Math.PI / 2 + 0.02, -0.5, 0] },
    ],
  },
  // A Galaxy tablet, a Galaxy phone floating in front on the mobile menu
  samsung: {
    label: 'Samsung.com on a Galaxy tablet, scrolling the homepage to Appliances, with the mobile menu on a Galaxy phone floating in front',
    fill: 0.74,
    placements: [
      { device: 'galaxy-tab-s8-ultra', screen: { kind: 'tour', name: 'samsung' }, at: [0, 0, 0], turn: [0, 0, 0] },
      { device: 'galaxy-s22-ultra', screen: { kind: 'tour', name: 'samsung-mobile' }, at: [0.15, -0.04, 0.09], turn: [0.05, -0.38, 0.14], float: true },
    ],
  },
  // The Fold open on the configurator, a Galaxy phone floating behind it, back turned
  bespoke: {
    label: 'The Bespoke configurator on an unfolded Galaxy Z Fold, choosing depth, colors and the finished kitchen, with a Galaxy phone floating behind it, back turned',
    fill: 0.74,
    placements: [
      { device: 'galaxy-z-fold8', screen: { kind: 'tour', name: 'bespoke' }, at: [0, 0, 0.02], turn: [0, 0, 0] },
      { device: 'galaxy-s22-ultra', screen: { kind: 'none' }, at: [-0.1, 0.03, -0.06], turn: [0.1, Math.PI + 0.55, 0.2], float: true },
    ],
  },
} satisfies Record<string, Arrangement>

export type SceneName = keyof typeof ARRANGEMENTS
export const arrangementOf = (name: SceneName): Arrangement => ARRANGEMENTS[name]
