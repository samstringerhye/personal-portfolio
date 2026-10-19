// Shared by the main thread and the renderer, kept apart so importing it doesn't pull in three.js

export type DeviceName = 'iphone-17-pro' | 'macbook-neo' | 'macbook-air-15' | 'ipad-mini-6' | 'galaxy-z-fold8'

export interface DeviceSpec {
  /** GLB under /motion/models/ */
  model: string
  /** Material on the display mesh (or meshes): it becomes a hole the DOM screen shows through */
  display: string
  /** Cover glass materials, kept nearly clear so the screen reads through their reflections */
  glass: string[]
  /** Which way the display faces in the file: 1 for +z, -1 for -z */
  front: 1 | -1
  /** Turn about the view axis, radians: a quarter turn stands a tablet in landscape */
  roll: number
  /** Tilt about the horizontal axis, radians, so a display modeled leaning back faces the camera
      (the laptop's base tilts instead) */
  pitch?: number
  /** The DOM screen is laid out at this width in CSS px; the model scales so its display matches */
  screenWidth: number
  /** Display width over height, for the flat fallback before (or without) the model */
  aspect: number
  /** Share of the stage the whole device fills, by height or by width in a narrow stage. The stage
      runs 10% past its box on every side (DeviceScene), so 0.75 or so fills the box */
  fill: number
  /** Body materials repainted neutral (material name to color) so every card reads as one gray system */
  finish?: Record<string, string>
}

// Credits for every model are in the colophon (src/pages/colophon.astro)
export const DEVICES: Record<DeviceName, DeviceSpec> = {
  // Ranguel, CC BY 4.0
  'iphone-17-pro': { model: 'iphone-17-pro.glb', display: 'OLED', glass: ['Glass'], front: -1, roll: 0, screenWidth: 360, aspect: 0.4785, fill: 0.76 },
  // Ranguel, CC BY 4.0. Lid at 90°, display facing the keyboard
  'macbook-neo': {
    model: 'macbook-neo.glb', display: 'material', glass: ['Display_glass'], front: 1, roll: 0, screenWidth: 1280, aspect: 1.6, fill: 0.74,
    finish: { Anodized_aluminum: '#c4c7cc', Touchpad_tint: '#c4c7cc', Touchpad_glass: '#c4c7cc', Keycap: '#2a2c30' },
  },
  // akshatmittal, CC BY 4.0. Material names are scrambled in the file: the display is VNZklasZKSWjWUk,
  // its lid open about 110°. Space gray as modeled
  'macbook-air-15': {
    model: 'macbook-air-15.glb', display: 'VNZklasZKSWjWUk', glass: [], front: 1, roll: 0, pitch: 0.35, screenWidth: 1440, aspect: 1.55, fill: 0.74,
  },
  // DatSketch, CC BY 4.0
  'ipad-mini-6': {
    model: 'ipad-mini-6.glb', display: 'Screen', glass: [], front: -1, roll: Math.PI / 2, screenWidth: 1200, aspect: 1.511, fill: 0.74,
    finish: { BaseColor: '#c4c7cc', BaseColorMatte: '#c4c7cc', BaseColorLogo: '#c4c7cc' },
  },
  // zhe_kan, CC BY-NC-SA 4.0. Unfolded; the display is two panels either side of the hinge
  'galaxy-z-fold8': {
    model: 'galaxy-z-fold8.glb', display: 'Screen', glass: ['Glass_screen'], front: 1, roll: 0, screenWidth: 1100, aspect: 1.307, fill: 0.74,
    finish: { Frame_Lavender: '#b9bcc2', 'Frame_Lavender.001': '#b9bcc2' },
  },
}

export const modelUrl = (device: DeviceName) => `/motion/models/${DEVICES[device].model}`

export interface DeviceGeometry {
  /** Display width over height */
  screenAspect: number
  /** World units the stage must span vertically for the device to fill its share of the height */
  viewHeight: number
  /** The same across, for stages too narrow to fit by height */
  viewWidth: number
  /** The body's center at rest relative to the display's, in world units (x right, y up). The
      picture shifts by this so the whole device centers, not just its display */
  center: [number, number]
}

/** World units the stage height spans: the device fits by height or, in a narrow stage, by width */
export const viewHeightAt = (g: DeviceGeometry, w: number, h: number) => Math.max(g.viewHeight, g.viewWidth * h / w)
