/// <reference lib="webworker" />

// Static import so Three.js downloads as soon as the worker script loads,
// not waiting for the first 'init' message.
import {
  Scene, OrthographicCamera, Color, SRGBColorSpace, WebGLRenderer,
  InstancedMesh, CircleGeometry, MeshBasicMaterial,
} from 'three'
import {
  generateConcentric,
  generateHexagonal,
  generateRose,
  generateSpiral,
  sizeTaper,
  updateDots,
  type ArrangementGenerator,
} from './hero-canvas-shared'

const generators: Record<string, ArrangementGenerator> = {
  spiral: generateSpiral,
  concentric: generateConcentric,
  hexagonal: generateHexagonal,
  rose: generateRose,
}

/* -- Worker message types -- */
interface InitMessage {
  type: 'init'
  canvas: OffscreenCanvas
  width: number
  height: number
  dpr: number
  bgColor: string
  isMobile: boolean
  prefersReduced: boolean
  config: {
    arrangement: string
    numRays: number
    dotsPerRay: number
    spacing: number
    innerRadius: number
    dotRadius: number
    sizeStart: number
    sizeMid: number
    sizeEnd: number
    waveSpeed: number
    waveFrequency: number
    waveAmplitude: number
    waveSharpness: number
    propagation: number
    baseScale: number
    twistAmount: number
    zoom: number
    accentOpacity: number
    cmyStagger: number
    wavePaused?: boolean
  }
  colors: {
    accent1: string
    accent2: string
    accent3: string
    dot: string
  }
}

interface ResizeMessage {
  type: 'resize'
  width: number
  height: number
}

interface VisibilityMessage {
  type: 'visibility'
  visible: boolean
}

type WorkerMessage = InitMessage | ResizeMessage | VisibilityMessage

let frameId: number | null = null

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data

  if (msg.type === 'init') {
    try {
      await initScene(msg)
    } catch (err) {
      self.postMessage({ type: 'error', message: String(err) })
      return
    }
  } else if (msg.type === 'resize') {
    handleResize(msg.width, msg.height)
  } else if (msg.type === 'visibility') {
    handleVisibility(msg.visible)
  }
}

// Scene state (set during init)
let renderer: any
let camera: any
let scene: any
let meshes: any[] = []
let delays: number[] = []
let posX: Float32Array
let posY: Float32Array
let dist: Float32Array
let dotScales: Float32Array
let total: number
let cfg: InitMessage['config']
let isVisible = true
let hiddenAt = 0
let pauseAccum = 0
let startTime = 0
let prefersReduced = false

async function initScene(msg: InitMessage) {
  cfg = msg.config
  prefersReduced = msg.prefersReduced

  const gen = generators[cfg.arrangement] || generators.concentric
  const mobileFactor = 0.5
  const numRays = msg.isMobile ? Math.round(cfg.numRays * mobileFactor) : cfg.numRays
  const dotsPerRay = msg.isMobile ? Math.round(cfg.dotsPerRay * mobileFactor) : cfg.dotsPerRay
  const result = gen(numRays, dotsPerRay, cfg.spacing, cfg.innerRadius)
  posX = result.posX
  posY = result.posY
  dist = result.dist
  total = result.total

  let maxDist = 0
  for (let i = 0; i < total; i++) {
    if (dist[i] > maxDist) maxDist = dist[i]
  }
  if (maxDist === 0) maxDist = 1

  dotScales = new Float32Array(total)
  for (let i = 0; i < total; i++) {
    dotScales[i] = sizeTaper(dist[i] / maxDist, cfg.sizeStart, cfg.sizeMid, cfg.sizeEnd)
  }

  scene = new Scene()
  const geometry = new CircleGeometry(cfg.dotRadius, 6)

  const accentOpacity = cfg.accentOpacity ?? 1
  const layers = [
    { color: msg.colors.accent1, delay: 1, opacity: accentOpacity },
    { color: msg.colors.accent2, delay: 2, opacity: accentOpacity },
    { color: msg.colors.accent3, delay: 3, opacity: accentOpacity },
    { color: msg.colors.dot, delay: 0, opacity: 1 },
  ]

  meshes = []
  delays = []
  for (const layer of layers) {
    const mat = new MeshBasicMaterial({
      color: layer.color,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      opacity: layer.opacity,
    })
    const mesh = new InstancedMesh(geometry, mat, total)
    scene.add(mesh)
    meshes.push(mesh)
    delays.push(layer.delay)
  }

  renderer = new WebGLRenderer({
    canvas: msg.canvas,
    antialias: false,
    alpha: false,
    powerPreference: 'low-power',
  })
  renderer.sortObjects = false
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setPixelRatio(msg.dpr)
  const bgColor = new Color(msg.bgColor)
  renderer.setClearColor(bgColor, 1)

  camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 1000)
  camera.position.set(0, 0, 100)
  camera.zoom = cfg.zoom

  applySize(msg.width, msg.height)

  startTime = performance.now()
  tick()

  // Signal ready to main thread
  self.postMessage({ type: 'ready' })
}

function applySize(w: number, h: number) {
  if (!renderer || w === 0 || h === 0) return
  renderer.setSize(w, h, false) // false = don't set style (no DOM in worker)
  camera.left = -w / 2
  camera.right = w / 2
  camera.top = h / 2
  camera.bottom = -h / 2
  camera.zoom = cfg.zoom
  camera.position.set(0, 0, 100)
  camera.updateProjectionMatrix()
}

function handleResize(width: number, height: number) {
  applySize(width, height)
}

function handleVisibility(visible: boolean) {
  const wasVisible = isVisible
  isVisible = visible
  if (!isVisible && wasVisible) {
    if (frameId != null) cancelAnimationFrame(frameId)
    frameId = null
    hiddenAt = performance.now()
  } else if (isVisible && !wasVisible && !prefersReduced) {
    pauseAccum += performance.now() - hiddenAt
    tick()
  }
}

function tick() {
  if (!prefersReduced) {
    frameId = requestAnimationFrame(tick)
  }

  const elapsed = (performance.now() - startTime - pauseAccum) / 1000
  const time = (cfg.wavePaused || prefersReduced) ? 0 : elapsed
  const cmyDelay = cfg.cmyStagger

  for (let i = 0; i < meshes.length; i++) {
    const mesh = meshes[i]
    updateDots(
      mesh.instanceMatrix.array as Float32Array, total,
      posX, posY, dist, dotScales, time - delays[i] * cmyDelay,
      cfg.waveSpeed, cfg.propagation, cfg.waveSharpness,
      cfg.waveAmplitude, cfg.waveFrequency, cfg.baseScale, cfg.twistAmount,
    )
    mesh.instanceMatrix.needsUpdate = true
  }

  renderer.render(scene, camera)
}
