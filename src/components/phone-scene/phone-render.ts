// Renders the iPhone 17 Pro model (by Ranguel, CC BY 4.0) with a transparent hole where its
// display is, so the live DOM screen behind the canvas shows through and the real bezel, frame
// and glass draw over it. Runs in phone-model.worker.ts, or on the main thread where
// OffscreenCanvas WebGL is missing.
import {
  ACESFilmicToneMapping, Box3, DirectionalLight, DoubleSide, Group, MeshBasicMaterial, NoBlending,
  PerspectiveCamera, PMREMGenerator, Scene, SRGBColorSpace, Vector3, WebGLRenderer,
  type Mesh, type MeshPhysicalMaterial, type Texture,
} from 'three'
import { GLTFLoader, type GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

import { SCREEN_WIDTH, type PhoneGeometry } from './phone-shared'

// The phone fills this share of the stage height
const FILL = 0.84

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

export async function createPhoneRenderer(canvas: HTMLCanvasElement | OffscreenCanvas, width: number, height: number, dpr: number, url: string, fov: number) {
  const gltf = (await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).register(p => new WebPTextures(p) as any).loadAsync(url)).scene

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

  let oled: Mesh | undefined
  const textures = new Set<Texture>()
  gltf.traverse(o => {
    const mesh = o as Mesh
    if (!mesh.isMesh) return
    const mat = mesh.material as MeshPhysicalMaterial
    if (mat.name === 'OLED') oled = mesh
    // Transmission renders the whole scene a second time each frame, and through the cover glass
    // it shows the phone's insides; reflections are enough at this size
    if ('transmission' in mat) mat.transmission = 0
    if (mat.name === 'Glass') { mat.opacity = 0.06; mesh.renderOrder = 2 }
    Object.values(mat).forEach(v => { if ((v as Texture)?.isTexture) textures.add(v as Texture) })
  })
  if (!oled) throw new Error('phone model has no OLED mesh')
  gltf.updateMatrixWorld(true)
  const os = new Box3().setFromObject(oled).getSize(new Vector3())
  const oc = new Box3().setFromObject(oled).getCenter(new Vector3())
  const body = new Box3().setFromObject(gltf)
  const k = SCREEN_WIDTH / os.x
  oled.material = new MeshBasicMaterial({ color: 0, transparent: true, opacity: 0, blending: NoBlending, side: DoubleSide })
  oled.renderOrder = 1

  // Face the display to the camera, centered on the display (this model's display faces -z)
  const phone = new Group()
  const holder = new Group()
  scene.add(phone)
  phone.add(holder)
  holder.add(gltf)
  holder.scale.setScalar(k)
  const front = oc.z > body.getCenter(new Vector3()).z ? 1 : -1
  holder.rotation.y = front < 0 ? Math.PI : 0
  holder.position.set(-oc.x * k * front, -oc.y * k, -oc.z * k * front)

  // The camera stands back so the display plane spans viewHeight: the DOM screen then matches it
  // with the same scale and a CSS perspective of the same angle (model.ts)
  const geometry: PhoneGeometry = { screenAspect: os.x / os.y, viewHeight: (body.max.y - body.min.y) * k / FILL }
  const camera = new PerspectiveCamera(fov, width / height, 10, 100000)
  camera.position.z = (geometry.viewHeight / 2) / Math.tan((fov / 2) * Math.PI / 180)
  const resize = (w: number, h: number) => {
    if (!w || !h) return
    gl.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize(width, height)

  // Compile and upload before the first visible frame
  await gl.compileAsync(scene, camera)
  textures.forEach(t => gl.initTexture(t))

  const render = (rx: number, ry: number) => {
    phone.rotation.set(rx, ry, 0)
    gl.render(scene, camera)
  }
  const dispose = () => {
    pmrem.dispose()
    gl.dispose()
  }
  return { geometry, resize, render, dispose }
}
