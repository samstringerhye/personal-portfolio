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

export const ARRANGEMENTS = {
  myfrontier: {
    label: 'The MyFrontier app on two iPhones: one plays a tour of signing in, paying a bill and checking a support order, the other floats beside it on the support screen',
    fill: 0.74,
    placements: [
      { device: 'iphone-17-pro', screen: { kind: 'myfrontier' }, at: [-0.04, 0, 0.02], turn: [0, 0, 0] },
      { device: 'iphone-17-pro', screen: { kind: 'myfrontier-still', shot: 'support-1' }, at: [0.05, 0.02, -0.05], turn: [0.05, -0.3, 0.14], float: true },
    ],
  },
  whataburger: {
    label: 'The Whataburger app icon on an iPhone home screen, floating',
    fill: 0.74,
    placements: [
      { device: 'iphone-17-pro', screen: { kind: 'home' }, at: [0, 0, 0], turn: [0, 0, 0.06], float: true },
    ],
  },
  amica: {
    label: 'Amica.com on a laptop, playing the homepage and Get a quote, with the mobile homepage on an iPhone floating in front',
    fill: 0.74,
    placements: [
      { device: 'macbook-air-15', screen: { kind: 'tour', name: 'amica' }, at: [0, 0, 0], turn: [0, 0, 0] },
      { device: 'iphone-17-pro', screen: { kind: 'tour', name: 'amica-mobile' }, at: [-0.19, -0.03, 0.14], turn: [-0.08, 0.4, -0.14], float: true },
    ],
  },
  cvs: {
    label: 'CVS.com on a laptop, playing the homepage, the Shop menu and the Neutrogena brand page, with the mobile homepage on an iPhone floating beside it',
    fill: 0.74,
    placements: [
      { device: 'macbook-neo', screen: { kind: 'tour', name: 'cvs' }, at: [0, 0, 0], turn: [0, 0, 0] },
      { device: 'iphone-17-pro', screen: { kind: 'tour', name: 'cvs-mobile' }, at: [0.18, -0.03, 0.13], turn: [-0.1, -0.38, 0.16], float: true },
    ],
  },
  samsung: {
    label: 'Samsung.com on an unfolded Galaxy Z Fold, scrolling the homepage to Appliances, with the mobile menu on a folded Fold floating beside it',
    fill: 0.74,
    placements: [
      { device: 'galaxy-z-fold8', screen: { kind: 'tour', name: 'samsung' }, at: [0, 0, 0], turn: [0, 0, 0] },
      { device: 'galaxy-z-fold8-folded', screen: { kind: 'tour', name: 'samsung-mobile' }, at: [0.115, -0.035, 0.02], turn: [0.04, -0.32, 0.18], float: true },
    ],
  },
  bespoke: {
    label: 'The Bespoke configurator on an iPad, choosing depth, colors and the finished kitchen, with the mobile product sheet on a folded Galaxy Z Fold floating beside it',
    fill: 0.74,
    placements: [
      { device: 'ipad-mini-6', screen: { kind: 'tour', name: 'bespoke' }, at: [0, 0, 0], turn: [0, 0, 0] },
      { device: 'galaxy-z-fold8-folded', screen: { kind: 'tour', name: 'bespoke-mobile' }, at: [-0.12, -0.03, 0.07], turn: [0.04, 0.34, -0.16], float: true },
    ],
  },
} satisfies Record<string, Arrangement>

export type SceneName = keyof typeof ARRANGEMENTS
export const arrangementOf = (name: SceneName): Arrangement => ARRANGEMENTS[name]
