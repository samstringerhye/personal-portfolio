// Renders a device model (shared.ts) with a transparent hole where its display is, so the live
// DOM screen behind the canvas shows through and the real bezel, frame and glass draw over it.
// Runs in model.worker.ts, or on the main thread where OffscreenCanvas WebGL is missing.
import {
  ACESFilmicToneMapping, Box3, DirectionalLight, DoubleSide, Group, MeshBasicMaterial, NoBlending,
  PerspectiveCamera, PMREMGenerator, Scene, SRGBColorSpace, Vector3, WebGLRenderer,
  type Mesh, type MeshPhysicalMaterial, type Texture,
} from 'three'
import { GLTFLoader, type GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

import { DEVICES, modelUrl, viewHeightAt, type DeviceGeometry, type DeviceName } from './shared'

// three.js probes WebP support with new Image(), which a worker doesn't have. Every browser this
// site supports decodes WebP, so this takes the extension's texture as is
class WebPTextures {
  name = 'EXT_texture_webp'
  constructor(private parser: GLTFParser) {}
  loadTexture(index: number) {
    const ext = this.parser.json.textures[index].extensions?.[this.name]
    if (!ext) return null
    return this.parser.loadTextureImage(index, ext.source, this.parser.textureLoader)
  }
}

export async function createDeviceRenderer(canvas: HTMLCanvasElement | OffscreenCanvas, width: number, height: number, dpr: number, device: DeviceName, fov: number, rest: { rx: number; ry: number }) {
  const spec = DEVICES[device]
  const gltf = (await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).register(p => new WebPTextures(p) as any).loadAsync(modelUrl(device))).scene

  const gl = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
  gl.setPixelRatio(dpr)
  gl.toneMapping = ACESFilmicToneMapping
  gl.outputColorSpace = SRGBColorSpace
  gl.setClearColor(0, 0)

  const scene = new Scene()
  const pmrem = new PMREMGenerator(gl)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.9
  const key = new DirectionalLight(0xffffff, 1.4)
  key.position.set(-600, 900, 1200)
  scene.add(key)

  const displays: Mesh[] = []
  const textures = new Set<Texture>()
  gltf.traverse(o => {
    const mesh = o as Mesh
    if (!mesh.isMesh) return
    const mat = mesh.material as MeshPhysicalMaterial
    if (mat.name === spec.display) displays.push(mesh)
    // Transmission renders the whole scene a second time each frame, and through the cover glass
    // it shows the device's insides; reflections are enough at this size
    if ('transmission' in mat) mat.transmission = 0
    if (spec.glass.includes(mat.name)) { mat.transparent = true; mat.opacity = 0.06; mesh.renderOrder = 2 }
    const paint = spec.finish?.[mat.name]
    if (paint) { mat.map = null; mat.color.set(paint); mat.needsUpdate = true }
    Object.values(mat).forEach(v => { if ((v as Texture)?.isTexture) textures.add(v as Texture) })
  })
  if (!displays.length) throw new Error(`${device} has no ${spec.display} mesh`)
  const hole = new MeshBasicMaterial({ color: 0, transparent: true, opacity: 0, blending: NoBlending, side: DoubleSide })
  displays.forEach(d => { d.material = hole; d.renderOrder = 1 })

  // Face the display to the camera (+z): flip it if the file has it facing away, then roll
  const flip = new Group()
  flip.rotation.y = spec.front < 0 ? Math.PI : 0
  flip.add(gltf)
  const roll = new Group()
  roll.rotation.z = spec.roll
  roll.add(flip)
  roll.updateMatrixWorld(true)
  const screen = new Box3()
  displays.forEach(d => screen.expandByObject(d))
  const ds = screen.getSize(new Vector3())
  const dc = screen.getCenter(new Vector3())
  const k = spec.screenWidth / ds.x

  // Centered on the display, at the DOM screen's scale
  const device3d = new Group()
  const holder = new Group()
  scene.add(device3d)
  device3d.add(holder)
  holder.add(roll)
  holder.scale.setScalar(k)
  holder.position.copy(dc).multiplyScalar(-k)

  // Framed on the whole device as it sits at rest, centered and as large as the stage allows. The
  // camera stands back so the stage spans viewHeightAt(): the DOM screen then matches the display
  // with the same scale and a CSS perspective of the same angle (model.ts)
  device3d.rotation.set(rest.rx, rest.ry, 0)
  device3d.updateMatrixWorld(true)
  const body = new Box3().setFromObject(device3d, true)
  const center = body.getCenter(new Vector3())
  const geometry: DeviceGeometry = {
    screenAspect: ds.x / ds.y,
    viewHeight: (body.max.y - body.min.y) / spec.fill,
    viewWidth: (body.max.x - body.min.x) / spec.fill,
    center: [center.x, center.y],
  }
  const tan = Math.tan((fov / 2) * Math.PI / 180)
  const camera = new PerspectiveCamera(fov, width / height)
  const resize = (w: number, h: number) => {
    if (!w || !h) return
    gl.setSize(w, h, false)
    const vh = viewHeightAt(geometry, w, h)
    const distance = (vh / 2) / tan
    camera.position.z = distance
    camera.near = distance / 10
    camera.far = distance * 10
    camera.aspect = w / h
    // The camera stays on the display; the picture shifts so the body centers in the stage
    const s = h / vh
    camera.setViewOffset(w, h, geometry.center[0] * s, -geometry.center[1] * s, w, h)
    camera.updateProjectionMatrix()
  }
  resize(width, height)

  // Compile and upload before the first visible frame
  await gl.compileAsync(scene, camera)
  textures.forEach(t => gl.initTexture(t))

  const render = (rx: number, ry: number) => {
    device3d.rotation.set(rx, ry, 0)
    gl.render(scene, camera)
  }
  const dispose = () => {
    pmrem.dispose()
    gl.dispose()
  }
  return { geometry, resize, render, dispose }
}
