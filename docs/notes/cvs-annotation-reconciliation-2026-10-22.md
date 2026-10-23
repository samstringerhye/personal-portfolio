# CVS annotation reconciliation — 2026-10-22

Reviewed 16 browser annotations and two page-wide directives against the rendered CVS case study.

## Annotation checklist

| # | Request | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Sitemap is too technical | Verified earlier fix | Sitemap removed from the case study. |
| 2 | Essie crop needs more context | Verified earlier fix | Complete four-card product row retained. |
| 3 | Inverse Spark alignment and scale | Superseded | The later request to remove the inverse Spark takes precedence; it is absent. |
| 4 | Grid centering and missing edge guides | Fixed | Re-exported the complete construction grid from Figma. All four dashed edges are visible. |
| 5 | Inverse Spark still off center | Superseded | Inverse Spark removed as subsequently requested. |
| 6 | More card padding; transparent background | Fixed | Moved padding to the panel field so shared image styles cannot cancel it. Surrounding background is transparent. |
| 7 | Fulfillment should be paired or full width | Verified earlier fix | Full-width fulfillment panel retained. |
| 8 | Missing outcomes | Resolved within evidence limit | Closing paragraph describes the design result. No unverified business KPI, research, or launch claim added. |
| 9 | Missing outcome or wrap-up paragraph | Fixed | Added a closing paragraph using the existing prose component. |
| 10 | Remove white inverse Spark | Verified earlier fix | Inverse Spark absent. |
| 11 | Construction grid is blurry | Fixed | Original vector replaces the filtered raster. A fresh 2× PNG is also preserved as source evidence. |
| 12 | Spark family is too small | Fixed | Full-width vector family with reduced internal padding; original geometry preserved. |
| 13 | Nail polish screen has missing images | Verified earlier fix | Complete original screenshot retained and visually checked. |
| 14 | Homepage has missing images | Verified earlier fix | Complete original desktop and mobile screenshots retained and visually checked. |
| 15 | Cards should explain personal decisions | Fixed | Caption connects collaborative decisions about information order to comparison and fulfillment. |
| 16 | Fulfillment needs white background and contribution explanation | Fixed / verified | White background verified; caption explains contribution and visible timing/availability information. |
| 17 | Remove lightboxes throughout | Verified earlier fix | No zoom triggers or lightbox dialogs on the rendered page. |
| 18 | All captions should connect decisions to design, with team context | Fixed | Rewrote all eight captions to name the contribution and the visible design effect. |

## Additional correction

The final visual review found a blank product-photo area in the newer mini-cart export. Restored the complete existing `figma/minicart-mobile.webp` original, including the CeraVe jar, and revised its caption to match the visible screen.

## Figma provenance

Fresh exports were taken on 2026-10-22 from the current version of **CVS - Design System**, file `mGuoZaD48cLibQ6HLidGyB`, Playbook CVS Shop page `1729:5533`. These are current-source exports, not a verified historical 2022 snapshot.

- Spark family: node `2231:72284` (Frame 10558), within board `1742:8232` (57 Design - Icons - Overview). Source size approximately 1715.85 × 937.63. Saved as `spark-family.svg` and `spark-family-2x.png` (3432 × 1876).
- Spark construction: node `2430:176451` (Group 10626), within frame `2430:176453` and board `1742:8700` (59 Design - Icons - How). Source size 756 × 756. Saved as `spark-construction.svg` and `spark-construction-2x.png` (1512 × 1512).
- Export settings: SVG_STRING and PNG at scale 2, contentsOnly true. No Figma nodes were mutated. Rendered page uses the SVG exports.
- The product cards were freshly exported from **CVS Visual Design**, file `XR5KKXZStWVF82UDjma63J`, row `5150:108971`. Four temporary detached copies of its card instances (`4041:183683`, `4041:183684`, `4885:141523`, `4041:183686`) were exported at 305 × 576 with their drop shadows removed. The export’s Figma canvas-background rectangle was omitted to preserve transparent rounded corners; the white or blue card surfaces remain. The original Figma nodes were left unchanged, and the temporary export page was removed. The page now uses one SVG per card instead of crops from the full row.
- Existing complete Home, Beauty, Nails, and mini-cart originals were retained. PDP, fulfillment, and filter exports were retained. Their export dates were not re-established in this pass.

## Verification

- Astro check: 122 files, 0 errors, 0 warnings, 83 existing hints.
- Production build: passed. Existing dependency/chunk warnings remain.
- Git diff whitespace check: passed.
- No npm test script is defined.
- Visual review: 1280px desktop, 955 × 1314 annotation viewport, and 390 × 844 mobile. No horizontal document overflow.
- Eight captions present; product-row surround transparent; fulfillment field white; no visible broken images; no lightbox triggers/dialogs.
- No research, launch, or business-performance result is asserted as independently verified.
- No publish, deploy, commit, or push performed.

## Scope

This pass edits the CVS MDX, adds a CVS-only stylesheet, and adds four Spark source exports. Existing shared-component changes and unrelated work were preserved. A separate chat owns the central Scope-list change in Story.astro.

Audit count: 18 feedback elements across 19 implementation/artwork files (8 implementation files and 11 displayed artwork files). Ancillary source PNGs and this record are excluded from the count.

Implementation files: cvs-redesign.mdx, cvs-case-study.css, Panel.astro, Gallery.astro, Story.astro, ProseGroup.astro, CaseStudyLayout.astro, editorial.css.

Displayed artwork: home-desktop.webp, home-mobile.webp, beauty-mobile.webp, nail-polish-mobile.webp, product-listing-row-transparent.svg, spark-family.svg, spark-construction.svg, pdp-desktop-3x.png, fulfillment-3x.png, minicart-mobile.webp, filters-mobile-3x.png.
