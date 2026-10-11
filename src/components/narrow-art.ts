export type SubjectBox = { top: number; right: number; bottom: number; left: number }

/**
 * CSS custom properties that frame a 3:2 subject image to its subject box at narrow widths (see
 * "Narrow work cards and case study heroes" in global.css): the frame's aspect ratio, and the
 * image's offset and size as multiples of the frame. Without a box the whole image is framed.
 */
export function narrowArtStyle(box?: SubjectBox): string {
  const b = box ?? { top: 0, right: 1, bottom: 1, left: 0 }
  const w = b.right - b.left
  const h = b.bottom - b.top
  const n = (v: number) => v.toFixed(4)
  return `--art-ratio: ${n((w * 1.5) / h)}; --art-l: ${n(-b.left / w)}; --art-t: ${n(-b.top / h)}; --art-w: ${n(1 / w)}; --art-h: ${n(1 / h)}`
}
