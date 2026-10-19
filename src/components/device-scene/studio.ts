// A product-photography studio for the device models' reflections: a soft gray room with large
// softboxes, rendered once into an environment map (PMREM). The aluminum and glass pick up long,
// clean highlights from the boxes instead of the generic room three.js ships with.
import { BackSide, BoxGeometry, Color, Float32BufferAttribute, Mesh, MeshBasicMaterial, PlaneGeometry, Scene } from 'three'

// Brightness above 1 makes a panel read as a light source once the environment is tone mapped
interface Softbox { w: number; h: number; at: [number, number, number]; power: number }
const SOFTBOXES: Softbox[] = [
  // Key: a wide box above and in front, to the left, the main highlight on lids and bezels
  { w: 9, h: 5, at: [-5, 7, 7], power: 7 },
  // Overhead: a broad, softer top light, so flat surfaces read as brushed metal, not black
  { w: 14, h: 14, at: [0, 10, 0], power: 3 },
  // Strips to either side: the thin edge highlights that show a device's outline
  { w: 1.6, h: 10, at: [9, 1, 2], power: 3.5 },
  { w: 1.6, h: 10, at: [-9, 1, -3], power: 2.5 },
  // A low bounce in front, the kind a white sweep gives
  { w: 14, h: 3, at: [0, -3, 9], power: 1.4 },
]
// The room the boxes hang in: light gray walls, a little darker below
const WALL = 0.55
const FLOOR = 0.38

export function studioScene(): Scene {
  const scene = new Scene()
  const room = new Mesh(new BoxGeometry(30, 30, 30), new MeshBasicMaterial({ side: BackSide, vertexColors: true }))
  // Shade the room's lower vertices toward the floor value
  const pos = room.geometry.attributes.position
  const colors: number[] = []
  for (let i = 0; i < pos.count; i++) {
    const v = pos.getY(i) < 0 ? FLOOR : WALL
    colors.push(v, v, v)
  }
  room.geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  scene.add(room)

  for (const box of SOFTBOXES) {
    const panel = new Mesh(new PlaneGeometry(box.w, box.h), new MeshBasicMaterial({ color: new Color().setScalar(box.power) }))
    panel.position.set(...box.at)
    // lookAt turns the plane's front (+z) toward the center, where the device sits
    panel.lookAt(0, 0, 0)
    scene.add(panel)
  }
  return scene
}
