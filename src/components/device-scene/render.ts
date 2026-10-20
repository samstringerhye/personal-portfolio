// Renders a card's device arrangement (arrangements.ts) in one scene: each model at its real size
// and pose, with a transparent hole where its display is, so the live DOM screens behind the canvas
// show through and the real bezels, frames and glass draw over them. Each frame reports where every
// display sits, so the page lays its screen exactly on it. Runs in model.worker.ts, or on the main
// thread where OffscreenCanvas WebGL is missing.
import {
  Box3, DirectionalLight, DoubleSide, Euler, Group, MeshBasicMaterial, NoBlending, Object3D,
  PerspectiveCamera, PMREMGenerator, Scene, SRGBColorSpace, Vector3, WebGLRenderer,
  type Mesh, type MeshPhysicalMaterial, type Texture,
} from 'three'
import { GLTFLoader, type GLTFParser } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

import { DEVICES, modelUrl, viewHeightAt, type ArrangementGeometry, type Bleed, type DeviceName, type DeviceSpec } from './shared'
import { arrangementOf, type SceneName } from './arrangements'
import { studioScene } from './studio'
import { contactShadow } from './contact-shadow'
import { grade } from './grade'

// How far a held arrangement rises off the floor, as a share of its height
const LIFT = 0.05

// Three-point lighting: a key high on the left, barely warm, a fill low on the right, barely cool,
// at a quarter of its strength, and a rim behind on the right that traces the frames' edges. Near
// white, so the finishes keep their true colors; the environment is turned down to let them read
const LIGHTS: { color: number; power: number; at: [number, number, number] }[] = [
  { color: 0xfff4ea, power: 1.7, at: [-7, 8, 10] },
  { color: 0xe6edff, power: 0.45, at: [9, 1, 7] },
  { color: 0xffffff, power: 2.4, at: [5, 6, -10] },
]
const ENVIRONMENT = 0.75

/** Floating devices: bob height (m) and period (s), the lean that goes with it (rad), and how far
    below its place a device starts before it drifts up as the card scrolls in (m) */
export interface FloatMotion { bob: number; period: number; wobble: number; drift: number }

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

// A display that wraps round the device's edges (the S22 Ultra's) is a hole only where it's flat:
// the flat DOM screen doesn't reach the curves, which would show whatever screen lies behind. The
// curves render as the dark glass they are. Flat within this cosine of the way the display faces
const FLAT = 0.97
/** display's world matrix is its place in the oriented device, where every display faces +z */
function holeFor(display: Mesh, hole: MeshBasicMaterial): MeshBasicMaterial {
  const normal = display.geometry.attributes.normal
  if (!normal) return hole
  // +z in the mesh's own space: normals map out by the inverse transpose, so back by the transpose
  const e = display.matrixWorld.elements
  const facing = new Vector3(e[2], e[6], e[10]).normalize()
  const n = new Vector3()
  let sum = 0
  for (let i = 0; i < normal.count; i++) sum += n.fromBufferAttribute(normal, i).dot(facing)
  // A mesh modeled with its normals inward
  if (sum < 0) facing.negate()
  let curved = false
  for (let i = 0; i < normal.count && !curved; i++) curved = n.fromBufferAttribute(normal, i).normalize().dot(facing) < FLAT
  if (!curved) return hole
  const material = hole.clone()
  material.onBeforeCompile = shader => {
    shader.uniforms.facing = { value: facing }
    shader.vertexShader = `varying vec3 vFacing;\n${shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n\tvFacing = normal;')}`
    shader.fragmentShader = `uniform vec3 facing;\nvarying vec3 vFacing;\n${shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `#include <dithering_fragment>\n\tif ( dot( normalize( vFacing ), facing ) < ${FLAT.toFixed(3)} ) gl_FragColor = vec4( vec3( 0.012 ), 1.0 );`,
    )}`
  }
  material.customProgramCacheKey = () => 'curved-hole'
  return material
}

/** Readies a model's materials for the site and returns its display meshes, now holes. color is the
    placement's own finish, over the device's */
function prepare(model: Object3D, spec: DeviceSpec, device: DeviceName, textures: Set<Texture>, hole: MeshBasicMaterial, color: Record<string, string> = {}): Mesh[] {
  const displays: Mesh[] = []
  model.traverse(o => {
    const mesh = o as Mesh
    if (!mesh.isMesh) return
    let mat = mesh.material as MeshPhysicalMaterial
    // A repeated model shares its materials with the first copy: a copy in its own color gets its own
    if (color[mat.name]) mesh.material = mat = mat.clone()
    if (mat.name === spec.display) displays.push(mesh)
    if (spec.hide?.includes(mat.name) || spec.hide?.includes(mesh.name)) mesh.visible = false
    // Transmission renders the whole scene a second time each frame, and through the cover glass
    // it shows the device's insides; reflections are enough at this size
    if ('transmission' in mat) mat.transmission = 0
    if (spec.glass.includes(mat.name)) { mat.transparent = true; mat.opacity = 0.06; mesh.renderOrder = 2 }
    const paint = color[mat.name] ?? spec.finish?.[mat.name]
    if (paint) { mat.map = null; mat.color.set(paint); mat.needsUpdate = true }
    const satin = spec.matte?.[mat.name]
    if (satin !== undefined) { mat.normalMap = null; mat.roughness = satin; mat.needsUpdate = true }
    // Invert the texture's brightness in the shader, color dropped: light keys with dark legends
    // become dark keys with light legends, like a silver MacBook's
    if (spec.neutral?.includes(mat.name)) {
      mat.onBeforeCompile = shader => {
        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', '#include <map_fragment>\n\tdiffuseColor.rgb = vec3( 0.04 + 0.86 * ( 1.0 - dot( diffuseColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) ) ) );')
      }
      mat.customProgramCacheKey = () => 'neutral'
    }
    Object.values(mat).forEach(v => { if ((v as Texture)?.isTexture) textures.add(v as Texture) })
  })
  if (!displays.length) throw new Error(`${device} has no ${spec.display} mesh`)
  displays.forEach(d => { d.material = hole; d.renderOrder = 1 })
  return displays
}

// Each model is loaded and parsed once per worker (or page) and copied into every scene that shows
// it. Preparing a scene changes the shared materials only in ways that come out the same every time
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).register(p => new WebPTextures(p) as any)
const files = new Map<DeviceName, Promise<Group>>()
const modelOf = (device: DeviceName) => {
  let file = files.get(device)
  if (!file) {
    file = loader.loadAsync(modelUrl(device)).then(g => g.scene)
    // A failed load is tried again next time
    file.catch(() => files.delete(device))
    files.set(device, file)
  }
  return file
}

export async function createArrangementRenderer(
  canvas: HTMLCanvasElement | OffscreenCanvas, width: number, height: number, dpr: number,
  name: SceneName, fov: number, rest: { rx: number; ry: number }, float: FloatMotion, bleed: Bleed = [0, 0, 0, 0],
) {
  const arrangement = arrangementOf(name)
  const placements = arrangement.placements
  const kinds = [...new Set(placements.map(p => p.device))]
  const loaded = new Map(await Promise.all(kinds.map(async d => [d, await modelOf(d)] as const)))
  // Every placement gets its own copy (sharing geometry, materials and textures with the file), so
  // each finds its display by name and a scene can come and go without loading its models again
  const models = placements.map(p => loaded.get(p.device)!.clone(true))

  const gl = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' })
  gl.setPixelRatio(dpr)
  // Khronos PBR Neutral, then the site's color grade (grade.ts)
  grade(gl)
  gl.outputColorSpace = SRGBColorSpace
  gl.setClearColor(0, 0)

  const scene = new Scene()
  const pmrem = new PMREMGenerator(gl)
  // The studio's softboxes (studio.ts) give the reflections; three lights, fixed to the camera,
  // shape the devices as they turn
  scene.environment = pmrem.fromScene(studioScene(), 0.02).texture
  scene.environmentIntensity = ENVIRONMENT
  for (const l of LIGHTS) {
    const light = new DirectionalLight(l.color, l.power)
    light.position.set(...l.at)
    scene.add(light)
  }

  // The arrangement turns in two steps, the same rotation as Euler (rx, ry): it spins (ry) on a
  // floor that tilts toward the camera (rx), so the shadow stays on the floor while it spins
  const tilt = new Group()
  const spin = new Group()
  const content = new Group()
  scene.add(tilt)
  tilt.add(spin)
  spin.add(content)

  const hole = new MeshBasicMaterial({ color: 0, transparent: true, opacity: 0, blending: NoBlending, side: DoubleSide })
  const textures = new Set<Texture>()
  const markers: Object3D[] = []
  const aspects: number[] = []
  const floating: { place: Group; at: Vector3; turn: Euler; phase: number }[] = []
  const places: Group[] = []
  placements.forEach((p, i) => {
    const spec = DEVICES[p.device]
    const displays = prepare(models[i], spec, p.device, textures, hole, p.finish)
    // Face the display to the camera (+z): flip it if the file has it facing away, stand it
    // upright if it leans, then roll
    const flip = new Group()
    flip.rotation.y = spec.front < 0 ? Math.PI : 0
    flip.add(models[i])
    const upright = new Group()
    upright.rotation.x = spec.pitch ?? 0
    upright.add(flip)
    const roll = new Group()
    roll.rotation.z = spec.roll
    roll.add(upright)
    roll.updateMatrixWorld(true)
    displays.forEach(d => { d.material = holeFor(d, hole) })
    const screen = new Box3()
    displays.forEach(d => screen.expandByObject(d))
    const ds = screen.getSize(new Vector3())
    const dc = screen.getCenter(new Vector3())
    // Real size: the display spans its real width in meters, centered on the placement's origin
    const k = spec.realWidth / ds.x
    const holder = new Group()
    holder.scale.setScalar(k)
    holder.position.copy(dc).multiplyScalar(-k)
    holder.add(roll)
    const place = new Group()
    place.position.set(...p.at)
    place.rotation.set(p.turn[0], p.turn[1], p.turn[2], 'YXZ')
    place.scale.setScalar(p.scale ?? 1)
    place.add(holder)
    // The display's own frame: origin at its center, x along its width, y up its height
    const marker = new Object3D()
    place.add(marker)
    content.add(place)
    markers.push(marker)
    places.push(place)
    aspects.push(ds.x / ds.y)
    if (p.float) floating.push({ place, at: place.position.clone(), turn: place.rotation.clone(), phase: i * 1.7 })
  })

  // It turns about the middle of the arrangement, like products on one turntable
  tilt.updateMatrixWorld(true)
  const standing = new Box3().setFromObject(spin, true)
  const pivot = standing.getCenter(new Vector3())
  tilt.position.copy(pivot)
  content.position.copy(pivot).negate()
  const size = standing.getSize(new Vector3())

  // The floor: under the grounded devices, with floating ones hovering over it; under everything,
  // a little below, when they all float. Wide enough for the footprint at any spin, and reaching
  // high enough to catch the floating devices' shadows
  tilt.updateMatrixWorld(true)
  let grounded = Infinity
  let lowest = Infinity
  placements.forEach((p, i) => {
    const b = new Box3().setFromObject(places[i], true)
    lowest = Math.min(lowest, b.min.y)
    if (!p.float) grounded = Math.min(grounded, b.min.y)
  })
  const gap = size.y * 0.06
  const floorY = Math.min(grounded, lowest - gap)
  const shadow = contactShadow(Math.hypot(size.x, size.z) * 1.6, standing.max.y - floorY, floating.length ? 0.6 : 0.25)
  shadow.group.position.y = floorY - pivot.y
  tilt.add(shadow.group)

  // Framed on the whole arrangement as it sits at rest, centered and as large as the stage allows.
  // The camera stands back so the stage spans viewHeightAt(): each DOM screen then matches its
  // display with the same scale and a CSS perspective of the same angle (model.ts)
  tilt.rotation.x = rest.rx
  spin.rotation.y = rest.ry
  tilt.updateMatrixWorld(true)
  const body = new Box3().setFromObject(spin, true)
  const center = body.getCenter(new Vector3())
  const geometry: ArrangementGeometry = {
    viewHeight: (body.max.y - body.min.y) / arrangement.fill,
    viewWidth: (body.max.x - body.min.x) / arrangement.fill,
    center: [center.x, center.y],
    aspects,
  }
  const tan = Math.tan((fov / 2) * Math.PI / 180)
  const camera = new PerspectiveCamera(fov, width / height)
  // w × h is the stage the arrangement is framed in; the canvas runs past it by bleed on each side,
  // so the shadow and a device dragged toward the edge are drawn whole
  const resize = (w: number, h: number, ratio = dpr, [l, t, r, b]: Bleed = [0, 0, 0, 0]) => {
    if (!w || !h) return
    gl.setPixelRatio(ratio)
    gl.setSize(w + l + r, h + t + b, false)
    const vh = viewHeightAt(geometry, w, h)
    const distance = (vh / 2) / tan
    camera.position.z = distance
    camera.near = distance / 20
    camera.far = distance * 10
    camera.aspect = w / h
    // The camera stays on the axis; the picture shifts so the arrangement centers in the stage, and
    // the canvas takes in the bleed around it
    const s = h / vh
    camera.setViewOffset(w, h, geometry.center[0] * s - l, -geometry.center[1] * s - t, w + l + r, h + t + b)
    camera.updateProjectionMatrix()
  }
  resize(width, height, dpr, bleed)

  // Compile and upload before the first visible frame
  await gl.compileAsync(scene, camera)
  textures.forEach(t => gl.initTexture(t))

  // t in seconds; enter (0–1) is how far the card has scrolled in, carrying floating devices up
  // into place. The shadow re-renders only when something it sees has moved
  let shadowAt = ''
  const render = (rx: number, ry: number, lift = 0, t = 0, enter = 1): Float32Array => {
    tilt.rotation.x = rx
    spin.rotation.y = ry
    spin.position.y = lift * size.y * LIFT
    for (const f of floating) {
      const wave = Math.sin((t / float.period) * Math.PI * 2 + f.phase)
      f.place.position.set(f.at.x, f.at.y + wave * float.bob - (1 - enter) * float.drift, f.at.z)
      f.place.rotation.set(f.turn.x, f.turn.y, f.turn.z + wave * float.wobble, 'YXZ')
    }
    const at = floating.length ? `${ry},${lift},${t},${enter}` : `${ry},${lift}`
    if (at !== shadowAt) { shadow.update(gl, scene, lift); shadowAt = at }
    gl.render(scene, camera)
    const out = new Float32Array(16 * markers.length)
    markers.forEach((m, i) => out.set(m.matrixWorld.elements, i * 16))
    return out
  }
  // The models' geometry, materials and textures are shared with the other scenes (modelOf), so they
  // aren't disposed one by one, which would make those scenes upload and compile them again; losing
  // this scene's context below frees everything it put on the GPU
  const dispose = () => {
    scene.environment?.dispose()
    shadow.dispose()
    pmrem.dispose()
    // Give the context back now, not at garbage collection: the browser caps live contexts and
    // drops the oldest, which may be a scene still on screen
    const context = gl.getContext()
    gl.dispose()
    context.getExtension('WEBGL_lose_context')?.loseContext()
  }
  return { geometry, resize, render, dispose }
}
