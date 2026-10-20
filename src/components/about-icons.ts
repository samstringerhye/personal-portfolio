// The About page's 3D icons: four clay sculpts (about-clay.ts) in one transparent canvas around the
// headshot, bobbing, turning and leaning toward the cursor. The flat images underneath stay until the
// canvas is up, and stay for good without WebGL. Under reduced motion the sculpts hold one pose.
import {
  Box3, Clock, DirectionalLight, Group, HemisphereLight, OrthographicCamera, PMREMGenerator, Scene, Vector3,
  WebGLRenderer, type Material, type Mesh, type Object3D,
} from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { animations } from '../data/tokens'
import { SCULPTS, type SculptName } from './about-clay'

export interface AboutIcon {
  sculpt: SculptName
  /** Center, in % of the photo's box; size is the sculpt's largest side in % of the box's width */
  x: number
  y: number
  size: number
  /** Resting turn and tilt, radians */
  yaw: number
  pitch: number
}

// The canvas runs this far past the photo's box on every side, in % of the box, so sculpts can sit
// over its edge without clipping
const BLEED = 20

export function mountAboutIcons(orbit: HTMLElement, canvas: HTMLCanvasElement, icons: AboutIcon[]): () => void {
  const cfg = animations.about.icons
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  } catch {
    return () => {}
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)

  // World units are % of the photo's box, y up
  const camera = new OrthographicCamera(-BLEED, 100 + BLEED, BLEED, -100 - BLEED, -500, 500)
  camera.position.z = 100
  const scene = new Scene()
  // Soft studio light for the clay: a room environment for gentle reflections, a sky and ground fill,
  // one key from the upper left
  const pmrem = new PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()
  scene.add(new HemisphereLight(0xffffff, 0xdcd6cc, 0.9))
  const key = new DirectionalLight(0xffffff, 1.6)
  key.position.set(-2, 3, 4)
  scene.add(key)

  const holders: { holder: Group; icon: AboutIcon; phase: number }[] = []
  icons.forEach((icon, i) => {
    const model = SCULPTS[icon.sculpt]()
    // Centered on its own box and scaled so its largest side is icon.size
    const box = new Box3().setFromObject(model)
    const size = box.getSize(new Vector3())
    model.position.sub(box.getCenter(new Vector3()))
    const fit = new Group()
    fit.scale.setScalar(icon.size / Math.max(size.x, size.y, size.z))
    fit.add(model)
    const holder = new Group()
    holder.add(fit)
    holder.position.set(icon.x, -icon.y, 0)
    holder.rotation.set(icon.pitch, icon.yaw, 0)
    scene.add(holder)
    holders.push({ holder, icon, phase: i * cfg.stagger })
  })

  const resize = () => {
    const w = orbit.clientWidth * (1 + (2 * BLEED) / 100)
    renderer.setSize(w, w, false)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(orbit)

  // Lean toward the cursor, eased
  let leanX = 0, leanY = 0, toX = 0, toY = 0
  const onPointer = (e: PointerEvent) => {
    toX = (e.clientX / window.innerWidth - 0.5) * 2 * cfg.follow
    toY = (e.clientY / window.innerHeight - 0.5) * 2 * cfg.follow
  }
  if (!reduced) window.addEventListener('pointermove', onPointer, { passive: true })

  const clock = new Clock()
  const floatUnits = () => (cfg.float / orbit.clientHeight) * 100
  const draw = () => {
    clock.getDelta()
    const t = clock.elapsedTime
    leanX += (toX - leanX) * cfg.followEase
    leanY += (toY - leanY) * cfg.followEase
    for (const { holder, icon, phase } of holders) {
      const bob = Math.sin(((t + phase) / cfg.duration) * Math.PI * 2)
      const turn = Math.sin(((t + phase) / cfg.turnDuration) * Math.PI * 2)
      holder.position.y = -icon.y + (reduced ? 0 : bob * floatUnits())
      holder.rotation.y = icon.yaw + (reduced ? 0 : turn * cfg.turn) + leanX
      holder.rotation.x = icon.pitch + leanY
      holder.rotation.z = reduced ? 0 : bob * (cfg.tilt * Math.PI / 180)
    }
    renderer.render(scene, camera)
  }

  let raf = 0
  const loop = () => { draw(); raf = requestAnimationFrame(loop) }
  const io = new IntersectionObserver(([entry]) => {
    cancelAnimationFrame(raf)
    if (entry.isIntersecting && !reduced) { clock.getDelta(); loop() }
  })
  io.observe(orbit)
  draw()
  orbit.classList.add('is-3d')

  return () => {
    cancelAnimationFrame(raf)
    io.disconnect()
    ro.disconnect()
    window.removeEventListener('pointermove', onPointer)
    scene.traverse((o: Object3D) => {
      const mesh = o as Mesh
      if (!mesh.isMesh) return
      mesh.geometry.dispose()
      ;(mesh.material as Material).dispose()
    })
    scene.environment?.dispose()
    renderer.dispose()
    orbit.classList.remove('is-3d')
  }
}
