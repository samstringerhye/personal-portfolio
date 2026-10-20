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
| `cssEase` | CSS easing | `cubic-bezier(0.23, 1, 0.32, 1)` | The same curve as `ease`, for reveals that run in CSS (the homepage headline) |
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
| `highlightsShowDuration` | seconds | `0.6` | Unused: highlights are always shown |
| `highlightsShowDelay` | seconds | `0.15` | Unused: highlights are always shown |
| `highlightsShowStagger` | seconds | `0.08` | Unused: highlights are always shown |
| `highlightsHideDuration` | seconds | `0.25` | Unused: highlights are always shown |
| `highlightsHideStagger` | seconds | `0.02` | Unused: highlights are always shown |
| `cmyOpacity` | 0–1 | `1` | CMY color opacity for timeline wipe fills |
| `saveCmyOpacity` | 0–1 | `1` | CMY color opacity for the save/download button hover background |

Seven of these durations (all the `0.25` values) reference `sys.motion.duration.quick`. Change that token to adjust all hover timings at once. Token durations are CSS times (`"0.25s"`); `tokens.ts` converts them to seconds for GSAP.

---

## Other sections

| Section.Key | Type | Value | What it controls |
|-------------|------|-------|-----------------|
| `hero.canvas.*` | various | — | WebGL dot grid parameters (spiral geometry, wave motion, sizing) |
| `hero.canvas.cmyStagger` | seconds | `0.03` | Delay between the red, green and blue dot layers in the hero wave (independent from text reveal stagger) |
| `hero.canvas.accentOpacity` | 0–1 | `1` | Opacity of the red, green and blue dot layers (fully saturated) |
| `hero.canvas.pointer.radius` | CSS px | `150` | How far around the pointer the dots react (off under reduced motion) |
| `hero.canvas.pointer.push` / `grow` | ratio | `0.22` / `0.4` | Dots at the pointer are pushed out by this share of the radius and grow by this much |
| `hero.canvas.pointer.split` | ratio | `0.2` | Red is pushed this much further than green, blue this much less, so dots near the pointer split into their subpixels |
| `hero.canvas.pointer.stiffness` / `damping` | 0–1 | `0.06` / `0.8` | A spring, not an ease: the push trails the pointer, overshoots a touch and settles, and swells in and out the same way as the pointer enters and leaves |
| `workCards.flipHold` | seconds | `1.4` | How long each work card flipbook frame holds |
| `workCards.flipFade` | seconds | `0.35` | Crossfade between flipbook frames |
| `workCards.phone.restYaw` | radians | `-0.46` | 3D device's turn at rest (negative shows its left side); devices and arrangements can override it in `workCards.devices` and `workCards.scenes` |
| `workCards.phone.restPitch` | radians | `0.06` | 3D device's tilt at rest; devices and arrangements can override it in `workCards.devices` and `workCards.scenes` |
| `workCards.phone.dragYaw` / `dragPitch` | radians | `3` / `1.2` | Turn and tilt for a drag across the full width and height of the device's box (devices don't follow the pointer; they turn when dragged) |
| `workCards.phone.dragPitchLimit` | radians | `0.6` | Furthest a drag tilts the device from its rest, either way |
| `workCards.phone.dragReturn` | 0–1 | `0.05` | Share of the way back to rest covered each frame after a drag (reduced motion snaps back) |
| `workCards.phone.parallax` | ratio | `0.12` | Scroll parallax: the device sits this share of its row's distance from the viewport's center back toward it, so it drifts against the page (off under reduced motion, and at 64rem and below where the layout stacks) |
| `workCards.phone.scrollPitch` | radians | `0.22` | Tilt as the card scrolls through the viewport (the only motion on touch screens) |
| `workCards.phone.sway` | radians | `0.04` | Idle turn amplitude |
| `workCards.phone.swayPeriod` | seconds | `2.6` | Idle sway period |
| `workCards.phone.follow` | 0–1 | `0.06` | Share of the distance to the target angle covered each frame while scrolling (reduced motion holds the rest angle) |
| `workCards.phone.lensMm` | mm | `100` | Camera focal length, full-frame equivalent. Shorter shows more perspective |
| `workCards.devices.<device>.restYaw` / `restPitch` | radians | see below | Rest angle per device: MacBook Neo `-0.42` / `0.3` (looking down onto the keyboard); MacBook Air 15 `-0.42` / `0.05` (its lid leans back, so standing the display upright already tips the keyboard toward the camera), iPad mini 6 and Galaxy Z Fold8 `-0.42` / `0.08` |
| `workCards.scenes.<scene>.restYaw` / `restPitch` | radians | see below | Rest angle per arrangement, over its lead device's: MyFrontier `0` / `0.06` (the fan faces the camera, even on both sides), Whataburger `-0.2` / `0.06`, Samsung.com `-0.28` / `0.08` |
| `workCards.float.bob` / `period` / `wobble` | m / s / rad | `0.004` / `4.6` / `0.025` | Floating devices in the arrangements bob this high, this slowly, leaning a touch as they go |
| `workCards.float.drift` | m | `0` | A floating device starts this far below its place and drifts up as its card scrolls in; 0 keeps every device in its place, so nothing rises into frame |
| `workCards.float.enterFrom` / `enterTo` | share of viewport | `0.95` / `0.45` | The drift runs while the card's center moves from near the bottom of the viewport to just above its middle (reduced motion: in place, no bob) |
| `workCards.deviceNav.move` | seconds | `0.7` | Device gliding between its homepage card and its case study hero |
| `workCards.deviceNav.fadeOut` / `fadeIn` / `fadeInDelay` | seconds | `0.3` / `0.4` / `0.15` | The rest of the page crossfading around it (the color shutter sits these out) |
| `workCards.tours.*` | seconds | — | CVS.com, Samsung.com and Bespoke card tours; see [their section](#workcardstours-device-scenetoursts) |
| `workCards.myfrontier.*` | seconds | — | MyFrontier card tour; see [its section](#workcardsmyfrontier-device-scenemyfrontierts) |
| `interests.scrollDuration` | seconds | `480` | Total duration of the infinite scrolling interests marquee |
| `smoothScroll.lerp` | 0–1 | `0.5` | Lenis smooth scroll interpolation (lower = smoother, higher = snappier) |
| `smoothScroll.wheelMultiplier` | number | `1` | Mouse wheel scroll speed multiplier |
| `dotGrid.spacing` | px | `30` | Gap between dots in the interests section background grid |
| `dotGrid.radius` | px | `1` | Dot radius in that grid |
| `dotGrid.opacity` | 0–1 | `0.5` | Grid opacity before the reveal multiplier |
| `footerLogo.spinDuration` | seconds | `12` | One full turn of the site mark beside the name in the footer (still under reduced motion) |

---

## nav (Nav.astro)

| Key | Default | What it controls |
|-----|---------|-----------------|
| `petal.fillIn` | `0.2` | Logo petals turning white on hover |
| `petal.anticipate` | `0.15` | Petals pulling toward the center before the burst |
| `petal.burst` | `0.25` | Petals bursting outward |
| `petal.settle` | `0.6` | Elastic settle back to rest |
| `petal.reset` | `0.3` | Color and position reset on mouseleave |
| `entrance.gridDraw` | `1.0` | Grid lines drawing down on the first visit |
| `entrance.navDraw` / `navDrawAt` | `0.8` / `0.1` | Nav bottom line: duration / start time in the entrance timeline |
| `entrance.logoDraw` / `logoDrawAt` | `0.6` / `0.2` | Logo border draw |
| `entrance.logoFade` / `logoFadeAt` | `0.5` / `0.15` | Logo fade-in |
| `entrance.linkDraw` / `linkDrawAt` | `0.5` / `0.25` | Each nav link's border draw |
| `entrance.linkFade` / `linkFadeAt` | `0.4` / `0.3` | Nav links fading in |
| `entrance.linkStagger` | `0.12` | Delay between nav links (borders and text) |
| `entrance.ruleDraw` / `ruleDrawAt` | `0.8` / `0.2` | First section rule drawing from the left |
| `scrollToWork` | `1` | Smooth scroll to the work list from the Work link |

---

## imageReveal and homeReveal (scroll-reveals.ts)

| Key | Default | What it controls |
|-----|---------|-----------------|
| `imageReveal.duration` | `0.9` | Fade-up of images, image grids, zigzags and carousel slides |
| `imageReveal.pairStagger` | `0.15` | Delay between the two images of an image pair |
| `imageReveal.carouselStagger` | `0.1` | Delay between carousel slides |
| `imageReveal.proseDelay` | `0.2` | Zigzag text starting after its image |
| `homeReveal.duration` | `0.9` | Interests rows fading up |
| `homeReveal.timelineDuration` | `0.7` | Timeline job text, highlights, and year labels |
| `homeReveal.jobStagger` | `0.1` | Delay between each timeline job's text and its highlights, then the next job |
| `homeReveal.yearStagger` / `yearDelay` | `0.05` / `0.2` | Year labels: stagger / start delay |
| `homeReveal.dotGridDuration` | `1.2` | Interests dot grid fading in |

---

## carousel, clientLogos, lottie

| Section.Key | Default | What it controls |
|-------------|---------|-----------------|
| `carousel.snapDuration` | `0.5` | Carousel slide snap on arrow, dot or swipe |
| `clientLogos.scrollDuration` | `40` | One loop of the About page logo marquee |
| `lottie.loopDuration` | `2` | One pass of a looping Lottie (it plays back and forth) |
| `lottie.loopRepeatDelay` | `0.5` | Pause at each end of the loop |

---

## about (about.astro)

| Key | Default | What it controls |
|-----|---------|-----------------|
| `icons.float` | `10` | How far, in px, each 3D model around the headshot bobs up and down (about-icons.ts) |
| `icons.tilt` | `6` | How far, in degrees, each icon rocks as it floats |
| `icons.duration` | `3.6` | One float cycle |
| `icons.stagger` | `0.45` | Offset between icons, so they don't move in step |
| `icons.turn` | `0.6` | How far, in radians, each 3D model turns either way, so it reads as an object |
| `icons.turnDuration` | `9` | One full turn back and forth |
| `icons.follow` | `0.35` | How far, in radians, the models lean toward the cursor |
| `icons.followEase` | `0.08` | Share of the way to the cursor lean the models cover each frame |

## caseStudy (Amica and Whataburger diagrams, Bespoke stepper)

| Key | Default | What it controls |
|-----|---------|-----------------|
| `beforeAfter.itemDuration` / `itemStagger` | `0.5` / `0.08` | Before/after list items fading up (BeforeAfterStats) |
| `beforeAfter.countDuration` | `2` | Stats counting up from zero |
| `tokenTiers.duration` / `stagger` | `0.5` / `0.12` | Amica token tiers fading up |
| `diagrams.duration` / `stagger` | `0.5` / `0.08` | Default fade-up for Whataburger diagram items (diagram-animations.ts) |
| `diagrams.tokenTiers` | `0.6` / `0.15` | Token architecture tiers (duration / stagger) |
| `diagrams.tokenArrow` | `0.4` | Token architecture arrows popping in |
| `diagrams.colorStatesStagger` | `0.06` | Color state cards |
| `diagrams.spacingRows` / `radiusItems` | `0.4` / `0.05`, `0.4` / `0.06` | Spacing rows and radius items (duration / stagger) |
| `diagrams.durationItemsStagger` | `0.12` | Motion duration bars |
| `diagrams.easingCard` | `0.6` | Motion easing card |
| `diagrams.elevationCards` | `0.6` / `0.1` | Elevation cards (duration / stagger) |
| `diagrams.libraryCardsStagger` | `0.1` | Component library cards |
| `diagrams.libraryStats` | `0.4` / `0.1` / `0.3` | Component library stats (duration / stagger / delay) |
| `scrubbedMorph.morph` | `1` | Main morph in the scroll-scrubbed ChaosToOrder and TypeHierarchy timelines (scrubbed, so these are proportions of the scroll, not seconds) |
| `scrubbedMorph.labelFade` | `0.3` | Before/after labels crossfading |
| `scrubbedMorph.beforeOutAt` / `afterInAt` | `0.2` / `0.5` | When the before label leaves and the after label arrives |
| `chaosToOrder.stagger` | `0.03` | Delay between rectangles settling into the grid |
| `chaosToOrder.shadowAt` / `shadowDuration` / `shadowStagger` | `0.7` / `0.3` / `0.02` | Shadows landing on the settled grid |
| `typeHierarchy.roleFade` / `roleAt` | `0.3` / `0.5` | Role labels appearing |
| `motionSystem.dotFade` / `dotFadeDelay` | `0.2` / `0.3` | Duration-bar dot fading after its run |
| `motionSystem.easingTrace` | `1.2` | Dot tracing the easing curve |
| `motionSystem.easingFade` / `easingFadeDelay` | `0.3` / `0.5` | Easing dot fading after its trace |
| `heroPhoneScroll.loop` / `loopMobile` | `60` / `40` | One loop of the phone row (desktop / 768px and below) |
| `heroPhoneScroll.speedUp` | `1` | Phone row easing up to full speed |
| `heroPhoneScroll.zoomOut` | `2` | Opening zoom-out |
| `heroPhoneScroll.centerFade` | `0.2` | Center phone fading in |
| `heroPhoneScroll.phonesAt` | `0.25` | When the side phones start |
| `heroPhoneScroll.phoneFade` / `phoneSlide` / `phoneStagger` | `0.08` / `0.7` / `0.18` | Side phones fading and sliding in, one after another |
| `heroPhoneScroll.scrollAt` | `0.4` | When the endless scroll starts |
| `buttonStates.hold` | `1.6` | How long the Amica button card shows each state (Default, Hover, Pressed, Focused, Disabled) before the next, while it plays on its own |
| `buttonStates.transition` | `0.25` | Buttons easing between states |
| `decisionStepper.hold` | `3.5` | How long each step of the Bespoke decision stepper shows before the next, while it plays on its own |
| `decisionStepper.fade` | `0.3` | Step image fading in |

---

## workCards.tours (device-scene/tours.ts)

The CVS.com (MacBook Neo), Amica.com (MacBook Air 15), Samsung.com (Galaxy Z Fold8) and Bespoke (iPad mini 6) card tours, in seconds. Each tour's steps are listed in `tours.ts`; the keys below are the names those steps use. Reduced motion skips the tours and holds on the first screen.

| Key | Default | What it controls |
|-----|---------|-----------------|
| `moves.tap` | `0.65` | Tap ripple |
| `moves.push` | `0.7` | Push to the next screen |
| `moves.fade` | `0.6` | Crossfade to the next screen, and back to the first at the loop seam |
| `moves.drop` | `0.45` | Menu dropping open (CVS Shop menu) |
| `cvs.home` / `shop` / `brand` | `1.8` / `2.2` / `2.8` | Homepage, Shop menu open, Neutrogena brand page |
| `samsung.home` | `1.6` | Homepage at the top, before it scrolls |
| `samsung.homeScroll` | `5` | Homepage scrolling down to Appliances |
| `samsung.appliances` | `1.2` | Appliances section before the tap |
| `samsung.category` / `categoryScroll` / `bestSellers` | `1.4` / `3.5` / `2.2` | Washers & Dryers page: at the top, scrolling, then holding on Best Sellers |
| `amica.home` | `2.2` | Amica.com homepage before the Get a quote tap |
| `amica.quote` / `quoteScroll` / `empathy` | `1.4` / `3.5` / `2.2` | Get a quote page: at the top, scrolling, then holding on Empathy is our best policy |
| `bespoke.depth` / `colors` / `summary` | `2` / `2.2` / `2.8` | Choose Depth, Choose Colors, then Your Design |

---

## workCards.myfrontier (device-scene/myfrontier.ts)

The MyFrontier card's app tour, in seconds. Reduced motion skips the tour and holds on the home screen.

| Key | Default | What it controls |
|-----|---------|-----------------|
| `moves.tap` | `0.65` | Tap ripple |
| `moves.signedIn` | `0.76` | Home screen rising over the receding sign-in screen |
| `moves.push` | `0.7` | Push to the next screen |
| `moves.sheetUp` / `sheetUpDim` | `0.56` / `0.42` | Bottom sheet rising, and the screen dimming behind it |
| `moves.sheetDown` / `sheetDownDim` / `sheetDownDimDelay` | `0.46` / `0.38` / `0.08` | Bottom sheet dropping, and the dim lifting after a short delay |
| `moves.islandOpen` / `islandClose` | `0.52` / `0.38` | Dynamic Island opening into the Face ID glyph and closing |
| `moves.refreshPull` / `refreshSettle` | `0.52` / `0.48` | Pull to refresh: the screen pulling down, then the new state settling up |
| `moves.refreshSpin` | `0.9` | One turn of the refresh spinner |
| `moves.payWash` | `0.7` | Red wash spreading from the Pay button |
| `moves.matchCut` | `0.64` | Red closing down onto the check on the Payment sent screen |
| `moves.relaunch` | `0.6` | Launch screen zooming out of the icon at the loop seam |
| `holds.splash` / `signIn` | `2.5` / `0.9` | Launch animation, then the sign-in screen before the Face ID tap |
| `holds.faceIdScan` | `2.5` | Face ID glyph scanning and checking |
| `holds.home` | `1.3` | Home screen before Make a payment |
| `holds.billPay` | `1.1` | Bill pay screen before the method tap |
| `holds.methodSheet` / `methodPicked` | `1` / `0.5` | Payment method sheet open, then the screen after it closes |
| `holds.dateSheet` / `daySelected` / `datePicked` | `0.7` / `0.35` / `0.6` | Date sheet open, the 14th selected, then the screen after it closes |
| `holds.coin` / `confirmation` | `1.5` / `1.2` | Coin and confirmation Lottie animations |
| `holds.paymentSent` | `1.9` | Payment sent screen |
| `holds.support` / `orderStatus` | `1.2` / `2.2` | Support tab, then the order status screen |
| `holds.refreshing` | `0.9` | Spinner turning before the new status arrives |
| `holds.statusUpdate` / `statusFinal` | `2` / `2.2` | First and second status updates, before the next refresh and the relaunch |

---

## pageTransition (RGBShutter, a fade)

| Key | Type | Default | What it controls |
|-----|------|---------|-----------------|
| `duration` | seconds | `0.25` | How long the page takes to fade out, and the new one to fade in |
| `ease` | GSAP ease | `power2.inOut` | Easing for both phases |
| `exitDelay` | seconds | `0.05` | Pause before the new page fades in |
| `stagger` | seconds | `0.04` | Not read by RGBShutter at the moment |
