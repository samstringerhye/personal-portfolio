**Comparison Target**

- Source visual truth: a local CleanShot capture of the reference component (not committed)
- Implementation: `src/components/amica/HeroMosaic.astro`, row 1 / item 3
- Implementation screenshots: `output/playwright/amica-editorial-tile-desktop.png` and `output/playwright/amica-editorial-tile-responsive.png`
- Combined comparison: `output/playwright/amica-editorial-tile-comparison.png`
- Viewports: 1440 × 1100 and 800 × 1000 CSS px, device scale factor 1
- Source pixels: 622 × 1148. Implementation pixels: 229 × 229 desktop and 380 × 380 responsive.
- State: default, with the outlined CTA hover state also tested.
- Normalization: the source is a portrait mobile component. The implementation intentionally adapts its structure to the required square bento frame, so the comparison aligns width and content order rather than overall aspect ratio.

**Full-view Comparison Evidence**

- The square adaptation preserves the source hierarchy: centered eyebrow, serif headline, supporting copy, three stacked image-and-copy rows, hairline dividers, underlined text links, and an outlined footer CTA.
- The portrait content keeps its natural density inside the fixed square frame. The lower rows crop intentionally at the frame edge, with no content spilling outside the tile.

**Focused Region Evidence**

- Focused element captures were used because the target occupies only one tile in a larger mosaic.
- Typography uses the existing Amica Rhymes and Apercu Pro font files.
- Padding remains even on all four edges, thumbnail masks keep equal square sizing, and the stacked rows continue naturally below the square crop.
- The palette maps to existing Amica green, ink, white, and divider tokens.
- All three photographs are existing Amica campaign assets with `object-fit: cover`; no screenshot slice or placeholder image is used.
- Copy was replaced with concise Amica-specific content while keeping the source hierarchy and line lengths.

**Findings**

- No actionable P0, P1, or P2 differences remain.

**Open Questions**

- The portrait source is taller than the square bento slot. Cropping the lower content is intentional and preserves readable type and image sizing.

**Implementation Checklist**

- [x] Rebuilt the section as semantic HTML and responsive CSS.
- [x] Used three independent image assets.
- [x] Preserved centered intro, stacked rows, dividers, rounded thumbnails, links, and outlined CTA.
- [x] Verified the square crop, frame containment, and responsive layout.
- [x] Tested CTA hover behavior and checked the browser console.
- [x] Ran the Astro production build.

**Comparison History**

- Initial implementation: no P0/P1/P2 issues found in the focused desktop and responsive captures. No visual correction loop was required.

**Follow-up Polish**

- P3: If the tile becomes wider later, restore more of the source's vertical breathing room rather than increasing type size further.

final result: passed
