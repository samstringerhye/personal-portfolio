// Puts a phone scene's screen into the iPhone 17 Pro model (by Ranguel, CC BY 4.0).
// The model renders in WebGL; the live DOM screen sits behind the canvas and shows through a
// hole cut where the display is, so the real bezel, frame and glass draw over it.
import {
  ACESFilmicToneMapping, Box3, DirectionalLight, DoubleSide, MathUtils, Matrix4, MeshBasicMaterial,
  NoBlending, OrthographicCamera, PMREMGenerator, Scene, SRGBColorSpace, Vector3, WebGLRenderer, Group,
  type Mesh, type MeshPhysicalMaterial,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { animations } from '../../data/tokens'

const MODEL = '/motion/models/iphone-17-pro.glb'
// The DOM screen is laid out at this width; the model is scaled so its display matches
const SCREEN_WIDTH = 360

let model: ReturnType<GLTFLoader['loadAsync']> | null = null
const load = () => (model ??= new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(MODEL))

let px = 0
let py = 0
let tracking = false

// Mounts the model in art around face (the scene's .phone). Returns a stop function
export async function mountPhoneModel(art: HTMLElement, face: HTMLElement, stage: HTMLElement) {
  const gltf = (await load()).scene.clone(true)
  const tilt = animations.workCards.phone
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!tracking) {
    tracking = true
    window.addEventListener('pointermove', e => { px = e.clientX / window.innerWidth - 0.5; py = e.clientY / window.innerHeight - 0.5 }, { passive: true })
  }

  const gl = new WebGLRenderer({ antialias: true, alpha: true })
  gl.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
  gl.toneMapping = ACESFilmicToneMapping
  gl.outputColorSpace = SRGBColorSpace
  gl.setClearColor(0, 0)
  // The camera is orthographic, so the screen needs only an affine transform: Safari renders
  // CSS perspective differently from WebGL, and the screen would drift off the display
  const view = document.createElement('div')
  view.className = 'phone-scene-view'
  view.append(face)
  stage.append(view, gl.domElement)
  face.style.cssText += ';position:absolute;left:50%;top:50%;transform-origin:0 0'
  art.classList.add('is-3d')

  const scene = new Scene()
  const pmrem = new PMREMGenerator(gl)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.9
  const key = new DirectionalLight(0xffffff, 1.4)
  key.position.set(-600, 900, 1200)
  scene.add(key)

  let oled: Mesh | undefined
  gltf.traverse(o => {
    const mesh = o as Mesh
    if (!mesh.isMesh) return
    const mat = mesh.material as MeshPhysicalMaterial
    if (mat.name === 'OLED') oled = mesh
    // Transmission would show the phone's insides through the cover glass; keep only its reflections
    if (mat.name === 'Glass') { mat.transmission = 0; mat.opacity = 0.06; mesh.renderOrder = 2 }
  })
  if (!oled) throw new Error('phone model has no OLED mesh')
  gltf.updateMatrixWorld(true)
  const ob = new Box3().setFromObject(oled)
  const os = ob.getSize(new Vector3())
  const oc = ob.getCenter(new Vector3())
  const body = new Box3().setFromObject(gltf)
  const k = SCREEN_WIDTH / os.x
  oled.material = new MeshBasicMaterial({ color: 0, transparent: true, opacity: 0, blending: NoBlending, side: DoubleSide })
  oled.renderOrder = 1

  // The display faces -z in this model: turn it to face the camera, centered on the display
  const phone = new Group()
  const holder = new Group()
  scene.add(phone)
  phone.add(holder)
  holder.add(gltf)
  holder.scale.setScalar(k)
  const front = oc.z > body.getCenter(new Vector3()).z ? 1 : -1
  holder.rotation.y = front < 0 ? Math.PI : 0
  holder.position.set(-oc.x * k * front, -oc.y * k, -oc.z * k * front)

  face.style.aspectRatio = String(os.x / os.y)
  const fh = SCREEN_WIDTH * os.y / os.x
  const local = new Matrix4().makeTranslation(-SCREEN_WIDTH / 2, fh / 2, 0).multiply(new Matrix4().makeScale(1, -1, 1))
  const m = new Matrix4()

  // The phone fills this share of the stage height
  const viewHeight = (body.max.y - body.min.y) * k / 0.84
  const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 20000)
  camera.position.z = 5000
  let px2world = 1

  const place = () => {
    phone.updateMatrixWorld()
    const s = 1 / px2world
    m.makeScale(s, -s, s).multiply(phone.matrixWorld).multiply(local)
    face.style.transform = `matrix3d(${m.elements.join(',')})`
  }
  const size = () => {
    const w = stage.clientWidth, h = stage.clientHeight
    if (!w || !h) return
    gl.setSize(w, h, false)
    px2world = viewHeight / h
    camera.left = -w / 2 * px2world
    camera.right = w / 2 * px2world
    camera.top = h / 2 * px2world
    camera.bottom = -h / 2 * px2world
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(size)
  ro.observe(stage)
  size()

  let rx = tilt.restPitch
  let ry = tilt.restYaw
  let on = false
  let raf = 0
  const frame = (t: number) => {
    if (!on) return
    if (!reduced) {
      const r = art.getBoundingClientRect()
      const scroll = MathUtils.clamp(((r.top + r.height / 2) / window.innerHeight - 0.5) * 2, -1, 1)
      const tx = tilt.restPitch - py * tilt.pointerPitch + scroll * tilt.scrollPitch
      const ty = tilt.restYaw + px * tilt.pointerYaw + Math.sin(t / (tilt.swayPeriod * 1000)) * tilt.sway
      rx += (tx - rx) * tilt.follow
      ry += (ty - ry) * tilt.follow
    }
    phone.rotation.set(rx, ry, 0)
    gl.render(scene, camera)
    place()
    raf = requestAnimationFrame(frame)
  }
  const io = new IntersectionObserver(([e]) => {
    on = e.isIntersecting
    cancelAnimationFrame(raf)
    if (on) raf = requestAnimationFrame(frame)
  })
  io.observe(art)

  return () => {
    on = false
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    pmrem.dispose()
    gl.dispose()
  }
}
