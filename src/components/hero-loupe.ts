import { animations } from '../data/tokens'
import type { LensInput } from './hero-canvas-shared'

const cfg = animations.hero.lens

/**
 * The pixel-peeper loupe's pointer side: eases the loupe after a mouse or pen, opens and closes it,
 * moves the ring, and hands each frame's loupe to the renderer. Touch screens don't get one.
 * Reduced motion keeps the loupe locked to the pointer with no opening animation.
 */
export function createLoupe(container: HTMLElement, send: (lens: LensInput | null) => void, reduced: boolean): () => void {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {}
  const hero = container.closest<HTMLElement>('.hero') ?? container
  const ring = hero.querySelector<HTMLElement>('[data-hero-loupe]')
  const hint = hero.querySelector<HTMLElement>('[data-hero-hint]')
  if (hint) hint.hidden = false

  let tx = 0, ty = 0, x = 0, y = 0
  let on = false
  let placed = false
  let strength = 0
  let frame = 0
  let last = 0

  function draw() {
    if (ring) {
      ring.style.transform = `translate(${x}px, ${y}px) scale(${strength})`
      ring.style.opacity = String(strength)
    }
    send(strength > 0 ? { x, y, strength } : null)
  }

  function loop(now: number) {
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60
    last = now
    const k = 1 - Math.pow(1 - cfg.follow, dt * 60)
    x += (tx - x) * k
    y += (ty - y) * k
    strength = Math.min(1, Math.max(0, strength + (on ? dt : -dt) / cfg.open))
    draw()
    if (on || strength > 0) {
      frame = requestAnimationFrame(loop)
    } else {
      frame = 0
      last = 0
    }
  }

  function move(e: PointerEvent) {
    if (e.pointerType === 'touch') return
    const r = container.getBoundingClientRect()
    tx = e.clientX - r.left
    ty = e.clientY - r.top
    if (!placed || reduced) {
      x = tx
      y = ty
      placed = true
    }
    on = true
    if (reduced) {
      strength = 1
      draw()
    } else if (!frame) {
      frame = requestAnimationFrame(loop)
    }
  }

  function leave() {
    on = false
    placed = false
    if (reduced) {
      strength = 0
      draw()
    } else if (!frame) {
      frame = requestAnimationFrame(loop)
    }
  }

  hero.addEventListener('pointermove', move)
  hero.addEventListener('pointerleave', leave)

  return () => {
    cancelAnimationFrame(frame)
    hero.removeEventListener('pointermove', move)
    hero.removeEventListener('pointerleave', leave)
    if (hint) hint.hidden = true
    if (ring) ring.style.opacity = '0'
  }
}
