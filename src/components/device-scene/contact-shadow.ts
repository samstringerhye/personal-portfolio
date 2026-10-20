// A soft contact shadow under a device, after three.js's webgl_shadow_contact example: a camera on
// the ground looks up at the device and renders its silhouette, darker the nearer the ground, into
// a texture that's blurred and laid on a transparent ground plane. It takes the device's real
// footprint (a phone's thin edge, a laptop's whole base) and follows it as the device turns.
import {
  Group, Mesh, MeshBasicMaterial, MeshDepthMaterial, OrthographicCamera, PlaneGeometry, ShaderMaterial,
  Vector4, WebGLRenderTarget, type Scene, type WebGLRenderer,
} from 'three'
import { HorizontalBlurShader } from 'three/examples/jsm/shaders/HorizontalBlurShader.js'
import { VerticalBlurShader } from 'three/examples/jsm/shaders/VerticalBlurShader.js'

const SIZE = 512
// How far up the devices the shadow reaches, as a share of their height: low, so the shadow is
// darkest where a device meets the ground and fades within a short distance. Arrangements with
// floating devices reach higher, so those cast a softer shadow from above the floor
const REACH = 0.25
// Blur in texels of the 512px texture, and how dark the silhouette starts
const BLUR = 5
const DARKNESS = 4
const OPACITY = 0.7

export function contactShadow(span: number, height: number, reach = REACH) {
  const group = new Group()
  const target = new WebGLRenderTarget(SIZE, SIZE)
  const blurTarget = new WebGLRenderTarget(SIZE, SIZE)
  target.texture.generateMipmaps = blurTarget.texture.generateMipmaps = false

  // Facing up; the texture's y is flipped
  const geometry = new PlaneGeometry(span, span).rotateX(Math.PI / 2)
  const material = new MeshBasicMaterial({ map: target.texture, transparent: true, opacity: OPACITY, depthWrite: false })
  // Fades out toward the canvas's edges (drawing buffer px), so the canvas never cuts it off
  const clipRect = { value: new Vector4(0, 0, 1e5, 1e5) }
  const clipFade = { value: 1 }
  material.onBeforeCompile = shader => {
    shader.uniforms.clipRect = clipRect
    shader.uniforms.clipFade = clipFade
    shader.fragmentShader = `uniform vec4 clipRect;\nuniform float clipFade;\n${shader.fragmentShader.replace(
      '#include <alphamap_fragment>',
      `#include <alphamap_fragment>
\tvec2 edge = min( gl_FragCoord.xy - clipRect.xy, clipRect.zw - gl_FragCoord.xy );
\tdiffuseColor.a *= smoothstep( 0.0, clipFade, edge.x ) * smoothstep( 0.0, clipFade, edge.y );`,
    )}`
  }
  const plane = new Mesh(geometry, material)
  plane.scale.y = -1
  plane.renderOrder = -1
  group.add(plane)
  const blurPlane = new Mesh(geometry)
  blurPlane.visible = false
  group.add(blurPlane)

  const camera = new OrthographicCamera(-span / 2, span / 2, span / 2, -span / 2, 0, height * reach)
  camera.rotation.x = Math.PI / 2
  group.add(camera)

  // Like MeshDepthMaterial, but black, from opaque at the ground to transparent at the reach
  const depth = new MeshDepthMaterial()
  const darkness = { value: DARKNESS }
  depth.onBeforeCompile = shader => {
    shader.uniforms.darkness = darkness
    shader.fragmentShader = `uniform float darkness;\n${shader.fragmentShader.replace(
      'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
      'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );',
    )}`
  }
  depth.depthTest = depth.depthWrite = false
  const hBlur = new ShaderMaterial(HorizontalBlurShader)
  const vBlur = new ShaderMaterial(VerticalBlurShader)
  hBlur.depthTest = vBlur.depthTest = false

  const blur = (gl: WebGLRenderer, amount: number) => {
    blurPlane.visible = true
    blurPlane.material = hBlur
    hBlur.uniforms.tDiffuse.value = target.texture
    hBlur.uniforms.h.value = amount / 256
    gl.setRenderTarget(blurTarget)
    gl.render(blurPlane, camera)
    blurPlane.material = vBlur
    vBlur.uniforms.tDiffuse.value = blurTarget.texture
    vBlur.uniforms.v.value = amount / 256
    gl.setRenderTarget(target)
    gl.render(blurPlane, camera)
    blurPlane.visible = false
  }

  // Renders the shadow of scene (the device) into the plane's texture. spread (0–1) softens it as
  // the device is lifted off the floor
  const update = (gl: WebGLRenderer, scene: Scene, spread = 0) => {
    // The shadow camera rides the device's tilt; place it for this frame before rendering from it
    scene.updateMatrixWorld()
    const alpha = gl.getClearAlpha()
    plane.visible = false
    scene.overrideMaterial = depth
    gl.setClearAlpha(0)
    gl.setRenderTarget(target)
    gl.clear()
    gl.render(scene, camera)
    scene.overrideMaterial = null
    const amount = BLUR * (1 + spread * 1.5)
    blur(gl, amount)
    // A second, lighter pass hides the first's banding
    blur(gl, amount * 0.4)
    gl.setRenderTarget(null)
    gl.setClearAlpha(alpha)
    plane.visible = true
  }

  /** The canvas's edges the shadow fades out before, and over how far (drawing buffer px, y up) */
  const clip = (x0: number, y0: number, x1: number, y1: number, fade: number) => {
    clipRect.value.set(x0, y0, x1, y1)
    clipFade.value = Math.max(1, fade)
  }

  const dispose = () => {
    target.dispose()
    blurTarget.dispose()
    geometry.dispose()
    material.dispose()
    depth.dispose()
    hBlur.dispose()
    vBlur.dispose()
  }

  return { group, update, clip, dispose }
}
