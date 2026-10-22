# Amica case study image provenance

All body images currently displayed on the page are direct Figma exports at **2× scale in PNG format**, downloaded on 2026-10-22. The connector did not expose a version ID; the table records the latest accessible snapshot on that date. Original Figma nodes remain unchanged.

| Current asset | Figma source file | Node | Export dimensions |
| --- | --- | --- | --- |
| `aem-bundle-card-default-2x.png` | [02. Amica AEM Component Library](https://www.figma.com/design/PYGX8KZjQyDuEfx8MWpqXO/02.-Amica-AEM-Component-Library) (`PYGX8KZjQyDuEfx8MWpqXO`) | `4999:7746` | 434 × 503 |
| `aem-bundle-card-active-2x.png` | 02. Amica AEM Component Library (`PYGX8KZjQyDuEfx8MWpqXO`) | `4998:15299` | 434 × 503 |
| `aem-bundle-card-disabled-2x.png` | 02. Amica AEM Component Library (`PYGX8KZjQyDuEfx8MWpqXO`) | `4998:15305` | 434 × 503 |
| `aem-bundle-card-error-2x.png` | 02. Amica AEM Component Library (`PYGX8KZjQyDuEfx8MWpqXO`) | `4998:15311` | 438 × 507 |
| `product-bundle-hero-desktop-2x.png` | [03. Amica AEM System Documentation](https://www.figma.com/design/g245YvCHKdVVcpQFRi8jy7/03.-Amica-AEM-System-Documentation) (`g245YvCHKdVVcpQFRi8jy7`) | `10060:120695` | 2880 × 1687 |
| `product-bundle-hero-mobile-2x.png` | 03. Amica AEM System Documentation (`g245YvCHKdVVcpQFRi8jy7`) | `10060:121686` | 786 × 1815 |
| `aem-quote-dropdown-desktop-library-2x.png` | 02. Amica AEM Component Library (`PYGX8KZjQyDuEfx8MWpqXO`) | `8314:9260` | 992 × 384 |
| `aem-quote-dropdown-mobile-library-2x.png` | 02. Amica AEM Component Library (`PYGX8KZjQyDuEfx8MWpqXO`) | `8314:9280` | 992 × 528 |

The component boards are new portfolio presentation arrangements in `ComponentExamples.astro`. They group unmodified exports, with captions outside the artwork. Cards wrap from four columns to two; paired layouts stack on narrow screens. Their display widths remain at or below half the exported pixel widths. Body assets remain PNGs in the rendered page.

The original 3D hero and homepage transition remain in use at the user's explicit request. The unused `homepage-masthead-2x.png` is a fresh export from AEM System Documentation node `9502:10330`, at 2880 × 1701. It does not replace the 3D scene. Earlier 1× PNGs, WebPs, and the React button-library crop remain in the folder as superseded drafts; none supply the current body imagery.

## Inspection and interpretation limits

- Individual card exports preserve the original disabled opacity, error outline, and shadows. Whole-set attempts included a purple Figma component-set border; exporting individual variants resolved this without cropping.
- Placeholder text such as Label, Message, and Placeholder remains in documentation views. These show component structure rather than final page copy.
- Quote block source names are `Breakpoint=Desktop, Type=Dropdown (Old)` and `Breakpoint=Mobile, Type=Dropdown (Updated)`. They are separate library variants, not the selected inline-CTA A/B/C exploration. Their labels do not establish a before/after sequence.
- The inspected Quote Hero dropdown variant (`6480:28926`) places its main action below the inputs and does not prove the separate inline-action decision.
- Access to the AEM Component Library succeeded on retry. The cause of the earlier connector access failure remains unknown.
- The full homepage export was excluded because its media module contains a checkerboard placeholder.
