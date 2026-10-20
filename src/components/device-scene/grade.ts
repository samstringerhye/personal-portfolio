// A color grade for the device renders, applied in the tone mapping step so it costs no extra pass:
// Khronos PBR Neutral first (true colors), then a light split tone that follows the three-point
// lighting (render.ts), highlights a touch warm and shadows a touch cool, kept small so the finishes
// stay true; then a contrast curve that deepens the falloff between them and a little saturation.
import { CustomToneMapping, ShaderChunk, type WebGLRenderer } from 'three'

const GRADE = /* glsl */ `
vec3 CustomToneMapping( vec3 color ) {
  color = NeutralToneMapping( color );
  const vec3 luma = vec3( 0.2126, 0.7152, 0.0722 );
  float l = dot( color, luma );
  // Split tone: cool shadows, warm highlights
  vec3 shadows = vec3( 0.97, 0.985, 1.03 );
  vec3 highlights = vec3( 1.015, 1.0, 0.985 );
  color *= mix( shadows, highlights, smoothstep( 0.1, 0.8, l ) );
  // Contrast: part of the way to a smoothstep S-curve
  color = clamp( color, 0.0, 1.0 );
  color = mix( color, color * color * ( 3.0 - 2.0 * color ), 0.34 );
  // Saturation
  l = dot( color, luma );
  return mix( vec3( l ), color, 1.06 );
}`

let installed = false

/** Switches gl to the graded tone mapping (the shader chunk is shared, so it's patched once) */
export function grade(gl: WebGLRenderer) {
  if (!installed) {
    installed = true
    ShaderChunk.tonemapping_pars_fragment = ShaderChunk.tonemapping_pars_fragment.replace('vec3 CustomToneMapping( vec3 color ) { return color; }', GRADE)
  }
  gl.toneMapping = CustomToneMapping
}
