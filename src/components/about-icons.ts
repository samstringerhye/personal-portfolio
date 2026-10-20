// The About page's 3D icons: four models in one transparent canvas around the headshot, bobbing,
// turning and leaning toward the cursor. The flat images underneath stay until the models are in,
// and stay for good if WebGL or a model fails. Under reduced motion the models hold one pose.
import {
  AmbientLight, AnimationMixer, Box3, Clock, DirectionalLight, Group, Object3D, OrthographicCamera, Scene,
  Vector3, WebGLRenderer, type Material, type Mesh,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { animations } from '../data/tokens'

export interface AboutIcon {
  url: string
  /** Center, in % of the photo's box; size is the model's largest side in % of the box's width */
  x: number
  y: number
  size: number
  /** Resting turn and tilt, radians */
  yaw: number
  pitch: number
  /** An animation clip in the file to loop, if any */
  clip?: string
}

// The canvas runs this far past the photo's box on every side, in % of the box, so models can sit
// over its edge without clipping
const BLEED = 20

export async function mountAboutIcons(orbit: HTMLElement, canvas: HTMLCanvasElement, icons: AboutIcon[]): Promise<() => void> {
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
  scene.add(new AmbientLight(0xffffff, 1.4))
  const key = new DirectionalLight(0xffffff, 2.2)
  key.position.set(-1, 2, 3)
  scene.add(key)
  const rim = new DirectionalLight(0xdfe8ff, 0.8)
  rim.position.set(2, -1, -2)
  scene.add(rim)

  const loader = new GLTFLoader()
  const mixers: AnimationMixer[] = []
  const holders: { holder: Group; icon: AboutIcon; phase: number }[] = []

  try {
    const loaded = await Promise.all(icons.map(icon => loader.loadAsync(icon.url)))
    loaded.forEach((gltf, i) => {
      const icon = icons[i]
      const model = gltf.scene
      // Centered on its own box and scaled so its largest side is icon.size
      const box = new Box3().setFromObject(model)
      const size = box.getSize(new Vector3())
      const center = box.getCenter(new Vector3())
      model.position.sub(center)
      const holder = new Group()
      const fit = new Group()
      fit.scale.setScalar(icon.size / Math.max(size.x, size.y, size.z))
      fit.add(model)
      holder.add(fit)
      holder.position.set(icon.x, -icon.y, 0)
      holder.rotation.set(icon.pitch, icon.yaw, 0)
      scene.add(holder)
      holders.push({ holder, icon, phase: i * cfg.stagger })

      const clip = icon.clip && gltf.animations.find(a => a.name === icon.clip)
      if (clip && !reduced) {
        const mixer = new AnimationMixer(model)
        mixer.clipAction(clip).play()
        mixers.push(mixer)
      }
    })
  } catch {
    renderer.dispose()
    return () => {}
  }

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
    const dt = clock.getDelta()
    const t = clock.elapsedTime
    mixers.forEach(m => m.update(dt))
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
  let visible = false
  const loop = () => { draw(); raf = requestAnimationFrame(loop) }
  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    cancelAnimationFrame(raf)
    if (visible && !reduced) { clock.getDelta(); loop() }
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
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      mats.forEach((m: Material) => {
        Object.values(m).forEach(v => { if (v && typeof v === 'object' && 'isTexture' in v) (v as { dispose(): void }).dispose() })
        m.dispose()
      })
    })
    renderer.dispose()
    orbit.classList.remove('is-3d')
  }
}
