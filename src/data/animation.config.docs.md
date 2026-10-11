# animation.config.json

Companion documentation for all animation settings. Values are in seconds unless noted.

---

## textReveal (single config for all text animations)

| Key | Type | Default | What it controls |
|-----|------|---------|-----------------|
| `duration` | seconds | `0.4` | How long each word's reveal animation takes |
| `wordStagger` | seconds | `0.08` | Delay between each word starting its reveal. Total animation time scales automatically — 5 words: ~1.2s, 15 words: ~2s |
| `blockStagger` | seconds | `0.06` | Delay between grouped text blocks (e.g., heading finishes, then body starts). Used by `[data-reveal-group]` containers |
| `slideUp` | px | `20` | Distance the text slides up and CMY shadows offset, in pixels |
| `initialBlur` | px | `6` | Starting blur amount — text sharpens to 0 during reveal |
| `ease` | GSAP ease | `power4.out` | Easing curve for the motion (references semantic token) |
| `scrollStart` | ScrollTrigger | `top 70%` | When the element's top hits this viewport position, animation fires |
| `cmyStagger` | seconds | `0.04` | How far each color channel trails the text: the first follows, the second 0.04s later, the third 0.08s after |
| `cmyOpacity` | 0–1 | `0.4` | How visible the trailing CMY color layers are |

### How derived values work

- **slideDistance** = `slideUp` (px) — used directly for both text slide and CMY shadow offset. All three CMY channels use the same offset; only `cmyStagger` (timing) creates visible separation between them

### Grouped reveals (`[data-reveal-group]`)

Wrap multiple text elements in a `data-reveal-group` container:

```html
<div data-reveal-group>
  <h2 data-reveal>Heading</h2>
  <p data-reveal>Body text</p>
</div>
```

- The group triggers once based on the parent's scroll position
- Child `[data-reveal]` elements animate in DOM order
- Each child starts `blockStagger` seconds after the previous child

---

## Section-specific values (unique behaviors, not overrides)

| Section | Key | Value | Why it exists |
|---------|-----|-------|---------------|
| `hero.text` | `startDelay` | `0.25` | Waits for canvas to initialize — not derivable from content |

---

## timeline.hover

| Key | Type | Default | What it controls |
|-----|------|---------|-----------------|
| `expandDuration` | seconds | `0.5` | How long the hovered card takes to expand |
| `expandEase` | GSAP ease | `back.out(1.4)` | Easing for card expansion (bouncy) |
| `collapseDuration` | seconds | `0.25` | How long cards take to return to normal on mouseleave |
| `collapseEase` | GSAP ease | `back.inOut(1.4)` | Easing for collapse |
| `textShowDuration` | seconds | `0.25` | Fade-in speed for hovered card's text |
| `textHideDuration` | seconds | `0.25` | Fade-out speed for non-hovered card text |
| `collapseTextDuration` | seconds | `0.25` | Text fade-in speed on mouseleave (all cards) |
| `wipeDuration` | seconds | `0.25` | Color wipe fill animation duration |
| `wipeEase` | GSAP ease | `back.out(1.4)` | Easing for the color wipe |
| `wipeOutDuration` | seconds | `0.25` | Color wipe removal duration |
| `wipeOutEase` | GSAP ease | `back.in(1.4)` | Easing for wipe removal |
| `highlightsShowDuration` | seconds | `0.25` | Highlight text fade-in |
| `highlightsShowDelay` | seconds | `0.15` | Delay before highlights appear (after wipe starts) |
| `highlightsHideDuration` | seconds | `0.2` | Highlight text fade-out (slightly faster) |
| `cmyOpacity` | 0–1 | `1` | CMY color opacity for timeline wipe fills |
| `saveCmyOpacity` | 0–1 | `1` | CMY color opacity for the save/download button hover background |

Seven of these durations (all the `0.25` values) reference `sys.motion.duration.quick`. Change that token to adjust all hover timings at once. Token durations are CSS times (`"0.25s"`); `tokens.ts` converts them to seconds for GSAP.

---

## Other sections

| Section.Key | Type | Value | What it controls |
|-------------|------|-------|-----------------|
| `hero.canvas.*` | various | — | WebGL dot grid parameters (spiral geometry, wave motion, sizing) |
| `hero.canvas.cmyStagger` | seconds | `0.03` | Delay between CMY color channels in the hero dot wave (independent from text reveal stagger) |
| `interests.scrollDuration` | seconds | `480` | Total duration of the infinite scrolling interests marquee |
| `smoothScroll.lerp` | 0–1 | `0.5` | Lenis smooth scroll interpolation (lower = smoother, higher = snappier) |
| `smoothScroll.wheelMultiplier` | number | `1` | Mouse wheel scroll speed multiplier |
| `dotGrid.spacing` | px | `30` | Gap between dots in the interests section background grid |
| `dotGrid.radius` | px | `1` | Dot radius in that grid |
| `dotGrid.opacity` | 0–1 | `0.5` | Grid opacity before the reveal multiplier |

---

## pageTransition (RGBShutter)

| Key | Type | Default | What it controls |
|-----|------|---------|-----------------|
| `duration` | seconds | `0.25` | How long the shutter panel takes to cover and to reveal |
| `ease` | GSAP ease | `power2.inOut` | Easing for both phases |
| `exitDelay` | seconds | `0.05` | Pause before the panel reveals the new page |
| `stagger` | seconds | `0.04` | Not read by RGBShutter at the moment |
