// A soft contact shadow under a device, after three.js's webgl_shadow_contact example: a camera on
// the ground looks up at the device and renders its silhouette, darker the nearer the ground, into
// a texture that's blurred and laid on a transparent ground plane. It takes the device's real
// footprint (a phone's thin edge, a laptop's whole base) and follows it as the device turns.
import {
  Group, Mesh, MeshBasicMaterial, MeshDepthMaterial, OrthographicCamera, PlaneGeometry, ShaderMaterial,
  WebGLRenderTarget, type Scene, type WebGLRenderer,
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
const DARKNESS = 3
const OPACITY = 0.42

export function contactShadow(span: number, height: number, reach = REACH) {
  const group = new Group()
  const target = new WebGLRenderTarget(SIZE, SIZE)
  const blurTarget = new WebGLRenderTarget(SIZE, SIZE)
  target.texture.generateMipmaps = blurTarget.texture.generateMipmaps = false

  // Facing up; the texture's y is flipped
  const geometry = new PlaneGeometry(span, span).rotateX(Math.PI / 2)
  const plane = new Mesh(geometry, new MeshBasicMaterial({ map: target.texture, transparent: true, opacity: OPACITY, depthWrite: false }))
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

  const dispose = () => {
    target.dispose()
    blurTarget.dispose()
    geometry.dispose()
    ;(plane.material as MeshBasicMaterial).dispose()
    depth.dispose()
    hBlur.dispose()
    vBlur.dispose()
  }

  return { group, update, dispose }
}
