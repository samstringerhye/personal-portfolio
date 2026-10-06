import rawTokens from './tokens.json'
import rawAnimations from './animation.config.json'

// Resolve { $ref: "ref.color.neutral.900" } → actual value
function getPath(obj: any, path: string): any {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

// A $ref leaf becomes whatever value it points at. JSON imports type the path as a
// plain string, so the target's type can't be followed statically: resolved leaves
// are typed `any`, and everything else keeps its JSON shape.
type Resolved<T> =
  T extends { $ref: string } ? any
  : T extends (infer U)[] ? Resolved<U>[]
  : T extends object ? { [K in keyof T]: Resolved<T[K]> }
  : T

function resolveRefs(node: any, root: any): any {
  if (node === null || node === undefined) return node
  if (typeof node !== 'object') return node
  if ('$ref' in node) return getPath(root, node.$ref)
  if (Array.isArray(node)) return node.map(v => resolveRefs(v, root))
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(node)) {
    out[k] = resolveRefs(v, root)
  }
  return out
}

const resolved = resolveRefs(rawTokens, rawTokens) as Resolved<typeof rawTokens>

// New M3-aligned exports
export const ref = resolved.ref
export const sys = resolved.sys
export const elementMap = resolved.elementMap

// Backward-compat aliases
export const semantic = sys
export const hover = sys.hover

export const animations = resolveRefs(rawAnimations, resolved) as Resolved<typeof rawAnimations>

export const colors = sys.color

// Accent color helpers
const accent = sys.color.accent
function hexToRgb(hex: string) {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]
}
const [a1r, a1g, a1b] = hexToRgb(accent['1'])
const [a2r, a2g, a2b] = hexToRgb(accent['2'])
const [a3r, a3g, a3b] = hexToRgb(accent['3'])

export function accentRgba(opacity: number): [string, string, string] {
  return [
    `rgba(${a1r},${a1g},${a1b},${opacity})`,
    `rgba(${a2r},${a2g},${a2b},${opacity})`,
    `rgba(${a3r},${a3g},${a3b},${opacity})`,
  ]
}

/** @deprecated Use accentRgba instead */
export const cmyRgba = accentRgba

export default resolved
