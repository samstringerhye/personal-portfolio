// Shared by the main thread and the renderer, kept apart so importing it doesn't pull in three.js
export const MODEL_URL = '/motion/models/iphone-17-pro.glb'
// The DOM screen is laid out at this width; the model is scaled so its display matches
export const SCREEN_WIDTH = 360

export interface PhoneGeometry {
  /** Display width over height */
  screenAspect: number
  /** World units the stage height spans; the screen's CSS scale is stage height / this */
  viewHeight: number
}
