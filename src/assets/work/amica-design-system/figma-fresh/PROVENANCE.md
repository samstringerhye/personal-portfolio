# Amica case study image provenance

All body images currently displayed on the page are direct Figma exports at **2× scale in PNG format**, downloaded on 2026-10-22. The connector did not expose a version ID; the table records the latest accessible snapshot on that date. Original Figma nodes remain unchanged.

| Initial export inventory (see later revisions below) | Figma source file | Node | Export dimensions |
| --- | --- | --- | --- |
| `aem-auto-card-default-transparent-2x.png` | [02. Amica AEM Component Library](https://www.figma.com/design/PYGX8KZjQyDuEfx8MWpqXO/02.-Amica-AEM-Component-Library) (`PYGX8KZjQyDuEfx8MWpqXO`) | `13914:26` | 434 × 503 |
| `aem-auto-card-active-transparent-2x.png` | 02. Amica AEM Component Library (`PYGX8KZjQyDuEfx8MWpqXO`) | `13914:69` | 434 × 503 |
| `aem-auto-card-disabled-transparent-2x.png` | 02. Amica AEM Component Library (`PYGX8KZjQyDuEfx8MWpqXO`) | `13915:39` | 434 × 503 |
| `aem-auto-card-error-transparent-2x.png` | 02. Amica AEM Component Library (`PYGX8KZjQyDuEfx8MWpqXO`) | `13914:147` | 438 × 507 |
| `product-bundle-hero-refined-desktop-2x.png` | [03. Amica AEM System Documentation](https://www.figma.com/design/g245YvCHKdVVcpQFRi8jy7/03.-Amica-AEM-System-Documentation) (`g245YvCHKdVVcpQFRi8jy7`) | `13920:4509` | 2880 × 1543 |
| `product-bundle-hero-refined-mobile-2x.png` | 03. Amica AEM System Documentation (`g245YvCHKdVVcpQFRi8jy7`) | `13920:4958` | 786 × 1719 |
| `system-hierarchy-transparent-2x.png` | 03. Amica AEM System Documentation (`g245YvCHKdVVcpQFRi8jy7`) | `13926:3` | 2640 × 1080 |
| `system-hierarchy-transparent-mobile-2x.png` | 03. Amica AEM System Documentation (`g245YvCHKdVVcpQFRi8jy7`) | `13926:86` | 944 × 3048 |
| `quote-option-a-baseline-2x.png` | [XX - Archive - Design Workspace](https://www.figma.com/design/W9mUp4s257ZL5l445iPxLp/XX---Archive---Design-Workspace?node-id=8321-21103) (`W9mUp4s257ZL5l445iPxLp`) | `8321:21103` | 1102 × 834 |
| `quote-option-b-stacked-2x.png` | XX - Archive - Design Workspace (`W9mUp4s257ZL5l445iPxLp`) | `8321:21133` | 1100 × 910 |
| `quote-option-c-approved-2x.png` | XX - Archive - Design Workspace (`W9mUp4s257ZL5l445iPxLp`) | `8321:21157` | 1100 × 786 |
| `quote-option-c-page-context-2x.png` | XX - Archive - Design Workspace (`W9mUp4s257ZL5l445iPxLp`) | `8321:21153` | 2882 × 1528 |

The component boards are new portfolio presentation arrangements in `ComponentExamples.astro`. They group direct exports of explicitly labeled presentation copies, with captions outside the artwork. Cards wrap from four columns to two; paired layouts stack on narrow screens. Their display widths remain at or below half the exported pixel widths. Body assets remain PNGs in the rendered page.

The original 3D hero and homepage transition remain in use at the user's explicit request. The unused `homepage-masthead-2x.png` is a fresh export from AEM System Documentation node `9502:10330`, at 2880 × 1701. It does not replace the 3D scene. Earlier 1× PNGs, WebPs, and the React button-library crop remain in the folder as superseded drafts; none supply the current body imagery.

## Inspection and interpretation limits

- Individual card exports preserve the original disabled opacity, error outline, and shadows. Whole-set attempts included a purple Figma component-set border; exporting individual variants resolved this without cropping.
- State-card presentation instances replace Label with Auto and Message with Insurance. Original masters remain unchanged; the default, active, disabled, and error treatments remain intact.
- The previous quote-block assets (`aem-quote-dropdown-desktop-library-2x.png`, node `8314:9260`, and `aem-quote-dropdown-mobile-library-2x.png`, node `8314:9280`) are superseded and no longer used on the page. They showed separate library variants, not the A/B/C exploration.
- The inspected Quote Hero dropdown variant (`6480:28926`) places its main action below the inputs and does not prove the separate inline-action decision.
- Access to the AEM Component Library succeeded on retry. The cause of the earlier connector access failure remains unknown.
- The full homepage export was excluded because its media module contains a checkerboard placeholder.

## Original quote-start alternatives recovered

On October 22, the user opened the original work file in the browser. Its **Product Dropdown Hero [Approved]** page (`6967:32111`) contains the named **Design Explorations to Fix Wedding & Event Truncation** section (`8321:8694`) and a parallel Content frame (`8321:21097`) containing the baseline and alternatives together. The exports above come from that Content frame:

- A: `Existing button layout with runcated text` label, artwork `8321:21103` (529 × 395 design bounds).
- B: `Larger Dropdown and ZIP Entry, Button Underneath` label, artwork `8321:21133` (528 × 433).
- C: `Larger Dropdown, Smaller ZIP Entry, Button Inline` label, artwork `8321:21157` (528 × 371).

Exported directly through Figma MCP with `defaultFormat: png` and `defaultScale: 2`. Render bounds include the original card shadows, so output dimensions exceed twice the frame dimensions by 44 pixels on each axis. No cropping, font replacement, geometry repair, or resampling occurred. Figma returned no version ID; these are the current accessible archive snapshot on October 22, 2026. Original Figma designs remain unchanged.

Inspected all three downloaded PNGs. No source text layers reported missing fonts. Exports show the original serif/display and UI text, teal and green treatments, card geometry, and complete controls. A's label truncation is the original problem and must remain visible. B and C show the full label. The headline's italic styling differs between A and the alternatives in the source; it remains intact and is not part of the claimed field-layout decision.

The June 5 archived exploration email describes A/B/C in exactly these terms. Its meeting summary records subsequent Amica approval of C, and the June 15 decision record confirms maintaining the direction through 1024px. Approval comes from those records and Sam's confirmation, not from the screen appearance. The cards show original explorations, not production captures. Other responsive experiments on the page do not establish every launch breakpoint.

The A/B pairing and separate C panel are new portfolio presentation arrangements of these unmodified exports. Display widths cap at half each export's pixel width. The approved C panel loads its original PNG directly; the A/B component board preserves PNG through Astro's Image component.

## Populated bundle examples and additional context

Sam requested distinct insurance icons and new copy in each card. Created explicitly named **Portfolio presentation** copies from the original desktop `10060:120695` and mobile `10060:121686` documentation instances. The originals remain unchanged. Populated the copies with Auto, Home, Renters, Condo, and Life labels, removed placeholder Message tags and breadcrumbs, and replaced ZIP placeholder/value text with ZIP code. Existing headline and supporting copy remain intact.

Used the existing Amica illustrations on the Illustration page: `9693:115428` (lob/auto), `9693:115441` (lob/home), `9693:115466` (lob/renters), `9693:115434` (lob/condo), and `9693:115448` (lob/life). Remote-library swaps were unavailable, so the presentation copies contain cloned original illustration artwork in detached card frames. Preserved aspect ratios and centered the square illustrations in the original illustration slots. No original component definitions changed. Card labels use the existing Apercu font; Amica Rhymes display copy remains unchanged. The source grid treatment remains visible.

Created a new portfolio hierarchy overview from the populated cards and assembled section, with an Amica Rhymes type sample and illustrative brand color swatches. This explains Sam's confirmed Foundations/Components/Sections organization. It is a new explanatory composition, not evidence of an original project diagram or authorship of the brand foundations. The mobile export stacks the same content vertically for readability. Both arrangements load the original 2× PNGs directly through a responsive picture element.

Added the original Option C full-page exploration as context, including its navigation, photography, and quote card. This is an unchanged archived design, distinct from the populated portfolio bundle examples. It does not replace the portfolio's existing 3D hero.

All new assets were exported directly from Figma as PNG at scale 2 on October 22, 2026. Version IDs were unavailable. Inspected desktop/mobile populated examples, the hierarchy overview, and the page-context export for complete text, distinct artwork, clipping, proportions, and resolution. None of these presentation examples establishes conversion, adoption, savings, or another performance KPI.

## Placeholder copy and mobile ZIP refinement

On October 22, 2026, replaced remaining placeholder text in the labeled presentation copies. The mobile ZIP field was 385 px wide at x=-16 inside a 353 px container. It now fills that container at 353 px and x=0, aligned with the quote button. Its label reads Enter your ZIP code. Replaced hidden Emphasis line text in both bundle copies and hierarchy compositions. Created four populated Auto state instances in the AEM Component Library without editing the original masters. Re-exported both bundle examples and all four state specimens directly as 2× PNGs. No historical quote-start exploration changed. Version IDs remain unavailable.

## Transparent quote-card presentation exports

Replaced the standalone A/B/C images with `quote-option-a-transparent-2x.png` (1102 × 834), `quote-option-b-transparent-2x.png` (1100 × 910), and `quote-option-c-transparent-2x.png` (1100 × 786). Figma source: W9mUp4s257ZL5l445iPxLp, presentation nodes 10023:8227, 10023:8252, and 10023:8271, cloned respectively from original nodes 8321:21103, 8321:21133, and 8321:21157. The originals remain untouched. Copies sit on explicitly labeled export-only page 10024:8365 with a zero-opacity page background. This avoids the original page's dark green backing being composited into the export. Card fills, typography, shadows, geometry, and content remain intact. Exported October 22, 2026 at scale 2 in PNG format; version ID unavailable. Confirmed RGBA alpha=0 at all three outer corners and inspected all three images. The shared portfolio surface remains gray.

## Shared presentation surface and transparent boards

On October 22, replaced baked mint/gray presentation backings with transparency in fresh copies. Existing presentation boards and source masters remain intact. Hierarchy copies: documentation file nodes 13926:3 (2640 × 1080 PNG), 13926:86 (944 × 3048 PNG), on new transparent page 13926:2. State copies: AEM library nodes 13914:26 (Default), 13914:69 (Active), 13914:109 (Disabled), 13914:147 (Error), on transparent page 13914:2. Disabled uses export wrapper 13915:39 with copied child 13915:40 to preserve its 0.4 opacity, which Figma otherwise normalizes at the export root. PNG dimensions remain 434 × 503, except Error at 438 × 507. All exports use scale 2, latest accessible snapshot; version ID unavailable. Verified zero corner alpha and disabled artwork alpha 102/255.

Shared CSS now supplies warm stone #F1EFEA for case-study panel surfaces. Colors inside original UI screenshots remain unchanged. Removed transparency-detector padding within panels, which had shrunk the A/B/C cards. Captions use 14 px with 21 px line height.

## Larger approved Option C

User requested a larger standalone approved card. Created new transparent presentation copy 10032:234 in W9mUp4s257ZL5l445iPxLp from 10023:8271, uniformly rescaled 1.5× in Figma. Original exploration and earlier presentation copy remain unchanged. Exported `quote-option-c-enlarged-transparent-2x.png` directly at 2× PNG on October 22, 2026, 1650 × 1178 px. Version ID unavailable. Display cap is 825 CSS px, with responsive 16–32 px surrounding padding. Inspected typography, full Wedding & Event label, inline controls, geometry, shadow, and transparency.

## Aligned hierarchy and broader component examples

Created new hierarchy copies, preserving previous presentation compositions and original source designs. Each desktop column uses a 246 px figure area, equal 32 px column gaps, 40 px outer padding, and a caption baseline at y=337 within its column. Reduced board height from 540 to 440 px. Mobile arrangement stacks the same aligned columns.

| New current asset | File key | Node | Export dimensions |
| --- | --- | --- | --- |
| `system-hierarchy-aligned-2x.png` | `g245YvCHKdVVcpQFRi8jy7` | `13928:2` | 2640 × 880 |
| `system-hierarchy-aligned-mobile-2x.png` | `g245YvCHKdVVcpQFRi8jy7` | `13928:87` | 944 × 2512 |
| `button-input-properties-2x.png` | `PYGX8KZjQyDuEfx8MWpqXO` | `13917:3` | 1936 × 1056 |
| `button-input-properties-mobile-2x.png` | `PYGX8KZjQyDuEfx8MWpqXO` | `13918:2` | 720 × 2348 |
| `accordion-properties-2x.png` | `PYGX8KZjQyDuEfx8MWpqXO` | `13917:64` | 1494 × 962 |
| `accordion-properties-mobile-2x.png` | `PYGX8KZjQyDuEfx8MWpqXO` | `13918:28` | 786 × 1070 |

All six assets: direct Figma exports, PNG at scale 2, October 22, 2026 latest accessible snapshot; version IDs unavailable. Transparent page backgrounds allow the shared stone surface to show through.

Controls source masters: primary large button default 4855:8167, focused 4855:8182, disabled 4855:11957; secondary large default 178:33322, focused 178:33354, disabled 4855:11987. Input atoms: default 4901:5351, active-filled 4901:5371, error 6786:6206. Presentation instances replace Label with Get a quote / View all products, and input text with ZIP code, 19129, and 1912. Input widths adapt to the 280 px presentation columns. This is illustrative copy, not evidence of shipped validation behavior. Disabled button opacity remains 0.4; inspected PNG alpha confirms 102/255.

Accordion source masters: collapsed 6898:4620 and expanded 6895:3809. Original coverage question and content remain intact. Mobile presentation copies resize the instances to 345 px within a 393 px board, allowing text to reflow. No master definitions changed. Source text inspection reports no missing fonts. Inspected all exports for clipping, proportions, copy, background transparency, and desktop/mobile arrangement.


## Final browser review and focus-outline correction

On October 22, 2026, the rendered desktop review found that nested presentation frames clipped the focused buttons' outside strokes. Traced the board, row, and state-column containers: the component instances had clipping off, but their presentation ancestors had clipping on. Created new portfolio copies from desktop `13917:3` and mobile `13918:2`, disabling clipping only on their nested presentation frames. Original boards, library components, and source artwork remain unchanged.

| Current replacement | File key | Node | Export dimensions |
| --- | --- | --- | --- |
| `button-input-properties-unclipped-2x.png` | `PYGX8KZjQyDuEfx8MWpqXO` | `13920:184` | 1936 × 1056 |
| `button-input-properties-unclipped-mobile-2x.png` | `PYGX8KZjQyDuEfx8MWpqXO` | `13920:244` | 720 × 2348 |

Both assets are direct PNG exports at scale 2 from the latest accessible snapshot; version IDs remain unavailable. Verified complete focused-button outlines in the rendered desktop and mobile page. The desktop controls board now caps at 968 CSS px. Input caption and alt describe its filled state without implying that every control has identical state properties.

Removed the repeated `quote-option-c-page-context-2x.png` panel and its import. The asset remains available as a historical export. A/B and the enlarged approved C remain on the page. Public captions retain presentation-copy labels and focus on the design decisions; this file retains export details. Component-example labels now join the outer captions at 14 px / 21 px.

## Separate hierarchy frames, October 22

Direct 2x PNG exports from AEM documentation file `g245YvCHKdVVcpQFRi8jy7`:
- `hierarchy-foundations-art-2x.png`: `13931:374`, named presentation copy of `13928:85`; centered type and swatches with the swatch container sized to its content. Original source unchanged.
- `hierarchy-components-art-2x.png`: existing presentation artwork `13928:13`.
- `hierarchy-sections-art-2x.png`: existing presentation artwork `13928:86`.

All exports are 784 by 492 pixels. `SystemHierarchy.astro` renders the three frames with native portfolio-font labels and captions; no labels are baked into these exports. The artwork retains Amica's own typography. Presentation arrangement illustrates the system hierarchy rather than documenting an original project slide.

## Token and spec evidence

Exported October 24, 2026 through Figma MCP at 2x from [03. Amica AEM System Documentation](https://www.figma.com/design/g245YvCHKdVVcpQFRi8jy7/03.-Amica-AEM-System-Documentation), then cropped and encoded as WebP at quality 90. No Figma canvas edits.

| Asset | Source node | Crop (2x pixels) |
| --- | --- | --- |
| token-action-2x.webp | 9341:8320, Documentation / Color / Content | x 1696, y 1674, 1080 × 582 |
| token-feedback-2x.webp | 9341:8320 | x 396, y 2314, 1124 × 726 |
| button-spec-2x.webp | 9963:115072, Documentation / Button | x 780, y 3180, 1730 × 870 |
