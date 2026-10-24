// Shared by the main thread and the renderer, kept apart so importing it doesn't pull in three.js

// A scene carried between its card and its case study hero holds its screens still (mount.ts sets
// data-device-hold, then fires device-resume). Screen tours await this before each change they make
export function whenUnheld(el: HTMLElement): Promise<void> {
  const scene = el.closest<HTMLElement>('.device-scene')
  if (!scene?.hasAttribute('data-device-hold')) return Promise.resolve()
  return new Promise(resolve => scene.addEventListener('device-resume', () => resolve(), { once: true }))
}

export type DeviceName = 'iphone-17-pro' | 'macbook-air-m2' | 'macbook-air-15' | 'ipad-mini-6' | 'galaxy-z-fold8' | 'galaxy-s22-ultra' | 'galaxy-tab-s8-ultra'

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
  /** The DOM screen is laid out at this width in CSS px */
  screenWidth: number
  /** The real display's width in meters, so devices in one arrangement sit at their true sizes */
  realWidth: number
  /** Display width over height, for the flat fallback before (or without) the model */
  aspect: number
  /** Body materials repainted (material name to color): the laptops and the iPad in one gray, the
      phones and the tablet in a finish they were sold in */
  finish?: Record<string, string>
  /** Satin finishes, material name to roughness: modeled as a mirror with a fine noise bump, they
      sparkle into grain at this size, so the bump goes and the roughness does its work */
  matte?: Record<string, number>
  /** Materials whose texture keeps its detail (the legends on keycaps) but is shown in inverted gray */
  neutral?: string[]
  /** Parts left out of the scene, by material or mesh name (an S Pen modeled floating beside its
      device) */
  hide?: string[]
}

// Credits for every model are in the colophon (src/pages/colophon.astro)
export const DEVICES: Record<DeviceName, DeviceSpec> = {
  // Ranguel, CC BY 4.0
  'iphone-17-pro': {
    model: 'iphone-17-pro.glb', display: 'OLED', glass: ['Glass'], front: -1, roll: 0, screenWidth: 360, realWidth: 0.0666, aspect: 0.4785,
    // Silver as sold: anodized aluminum and the frosted glass window on the back, both satin
    finish: { Anodized_aluminum: '#d9dbdd', Frosted_glass: '#e3e4e6' },
    matte: { Anodized_aluminum: 0.32, Frosted_glass: 0.45, Plastic_antena: 0.4 },
  },
  // rtql8d, CC BY 4.0. Lid at 90°, display facing the keyboard; Midnight as modeled. The file's
  // display glass covers the whole lid, so scripts/models/air-m2-display.mjs adds a screen-sized
  // Display set into it
  'macbook-air-m2': {
    model: 'macbook-air-m2.glb', display: 'Display', glass: [], front: 1, roll: 0, screenWidth: 1280, realWidth: 0.285, aspect: 1.539,
    // The glass carries a baked wallpaper that showed in the bezel: plain black glass instead
    finish: { 'Glass_-_Heavy_Color': '#050608' },
  },
  // akshatmittal, CC BY 4.0. Material names are scrambled in the file: the display is VNZklasZKSWjWUk,
  // its lid open about 110°. Space gray as modeled
  'macbook-air-15': {
    model: 'macbook-air-15.glb', display: 'VNZklasZKSWjWUk', glass: [], front: 1, roll: 0, pitch: 0.35, screenWidth: 1440, realWidth: 0.3266, aspect: 1.55,
  },
  // DatSketch, CC BY 4.0
  'ipad-mini-6': {
    model: 'ipad-mini-6.glb', display: 'Screen', glass: [], front: -1, roll: Math.PI / 2, screenWidth: 1200, realWidth: 0.1766, aspect: 1.511,
    finish: { BaseColor: '#c4c7cc', BaseColorMatte: '#c4c7cc', BaseColorLogo: '#c4c7cc' },
  },
  // zhe_kan, CC BY-NC-SA 4.0. Unfolded; the display is two panels either side of the hinge
  'galaxy-z-fold8': {
    model: 'galaxy-z-fold8.glb', display: 'Screen', glass: ['Glass_screen'], front: 1, roll: 0, screenWidth: 1100, realWidth: 0.1613, aspect: 1.307,
    finish: { Frame_Lavender: '#b9bcc2', 'Frame_Lavender.001': '#b9bcc2' },
  },
  // DatSketch, CC BY-NC 4.0. Upright in the file, display facing +z; the S Pen floats beside it
  'galaxy-s22-ultra': {
    model: 'galaxy-s22-ultra.glb', display: 'Display_ActiveArea', glass: [], front: 1, roll: 0, screenWidth: 360, realWidth: 0.0731, aspect: 0.4667,
    // Object_28 is the pen's slot cap, a separate mesh sharing the body's material
    hide: ['Pen_Ball', 'Pen_Body', 'Pen_Button', 'Pen_Top', 'Object_28'],
    // The back is frosted glass
    matte: { Back_Cover_Glass: 0.5, Rearcase: 0.5 },
  },
  // DatSketch, CC BY-NC 4.0. Landscape, display facing -z; the S Pen floats beside it
  'galaxy-tab-s8-ultra': {
    model: 'galaxy-tab-s8-ultra.glb', display: 'Wallpaper', glass: [], front: -1, roll: 0, screenWidth: 1440, realWidth: 0.315, aspect: 1.607,
    hide: ['PenBody', 'PenTip'],
    // Graphite, bead-blasted aluminum
    finish: { Body: '#3c3d40' },
    matte: { Body: 0.62 },
  },
}

export const modelUrl = (device: DeviceName) => `/motion/models/${DEVICES[device].model}`

export interface ArrangementGeometry {
  /** Meters the stage must span vertically for the arrangement to fill its share of the height */
  viewHeight: number
  /** The same across, for stages too narrow to fit by height */
  viewWidth: number
  /** The arrangement's center at rest, off the camera's axis, in meters (x right, y up). The
      picture shifts by this so the whole arrangement centers in the stage */
  center: [number, number]
  /** Each display's width over height, in placement order */
  aspects: number[]
}

/** Meters the stage height spans: the arrangement fits by height or, in a narrow stage, by width */
/** How far the canvas runs past the stage the arrangement is framed in: left, top, right, bottom, CSS px */
export type Bleed = [number, number, number, number]

export const viewHeightAt = (g: ArrangementGeometry, w: number, h: number) => Math.max(g.viewHeight, g.viewWidth * h / w)
