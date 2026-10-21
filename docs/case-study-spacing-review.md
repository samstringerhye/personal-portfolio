# Case-study spacing review

## Result

The shared case-study template now assigns one owner to each spacing role. The page grid separates the article, contact callout, and project navigation. The article separates hero and content. The content grid separates its sections. Components own the space inside those sections.

The change removes the article's bottom spacer, section-specific top margins, and breakpoint overrides that competed to set the same distance. All existing primitive and semantic token values remain unchanged; the new roles live in `sys.layout.caseStudy`. The existing generator emits fluid CSS properties for them.

The original review list mentioned a kitchen-sink study. This repository contains six case-study MDX files, with no kitchen-sink study. The final source review covers those six files and the 20 shared files below.

## Source review

Each row is one review element. Read the complete file for spacing ownership, references, and compatibility with the new wrappers.

| # | File | Status | Finding |
| --- | --- | --- | --- |
| 1 | `src/data/tokens.json` | Pass | Nine semantic spacing roles; existing token values unchanged. |
| 2 | `src/data/tokens.schema.json` | Pass | Schema defines and requires the nine roles. |
| 3 | `src/data/tokens.ts` | Pass | Existing recursive resolver handles the new group and primitive references. |
| 4 | `src/styles/editorial.css` | Pass | Content selectors target the content wrapper; removed competing outer spacing rules. |
| 5 | `src/styles/custom-media.css` | Pass | Existing breakpoints still control column arrangements. Fluid spacing does not jump at them. |
| 6 | `src/layouts/BaseLayout.astro` | Pass | Emits semantic CSS variables through the existing clamp generator. |
| 7 | `src/layouts/CaseStudyLayout.astro` | Pass | Page, article, and content grids own distinct gaps; callout owns its inset. |
| 8 | `src/components/DeviceHero.astro` | Pass | Internal gaps consume semantic roles. Hero spans the article grid. Existing Samsung artwork overlap remains a composition adjustment, separate from section spacing. |
| 9 | `src/components/CaseStudyHero.astro` | Pass | Framed hero retains its layout; shared heading gap controls the text inset. Protected-route rendering remains unverified. |
| 10 | `src/components/Story.astro` | Pass | Summary grid owns the facts-to-lead gap; summary text and labels use block and label roles. |
| 11 | `src/components/Gallery.astro` | Pass | Heading, copy, and panel grid use heading and block gaps; paragraph arrays retain their spacing. |
| 12 | `src/components/Panel.astro` | Pass | Caption gap uses its role. Artwork framing remains internal to the panel. |
| 13 | `src/components/ProseGroup.astro` | Pass | Paragraphs use the paragraph role; headed groups use the heading role. |
| 14 | `src/components/Metrics.astro` | Pass | Internal inset, row gaps, and label gaps use semantic roles. No current public study exercises a Metrics block at runtime. |
| 15 | `src/components/ScrollCue.astro` | Pass | Fixed cue stays outside document flow and adds no section gap. Reduced-motion handling remains intact. |
| 16 | `src/components/CaseStudyNav.astro` | Pass | Parent owns outer separation; navigation owns internal block/label spacing. |
| 17 | `plugins/remark-case-study-sections.mjs` | Pass | Generated sections remain children of the content grid; nested bodies retain block spacing. |
| 18 | `docs/case-study-template.md` | Pass | Documents token ranges, ownership, and breakpoint behavior. |
| 19 | `src/content/work/amica-design-system.mdx` | Pass | No inline spacing overrides; responsive measurements pass. |
| 20 | `src/content/work/bespoke-design-studio.mdx` | Pass | No inline spacing overrides; responsive measurements pass. |
| 21 | `src/content/work/cvs-redesign.mdx` | Pass | No inline spacing overrides; responsive measurements pass. |
| 22 | `src/content/work/myfrontier-app.mdx` | Pass | No inline spacing overrides; responsive measurements pass, including slot/video panels. |
| 23 | `src/content/work/samsung-redesign.mdx` | Pass | No inline spacing overrides; mixed gallery/closing-prose layout passes responsive measurements. |
| 24 | `src/content/work/wab-2026.mdx` | Pass for source; fail for live verification | No inline spacing overrides. The protected local route returns “Service temporarily unavailable,” so its body cannot receive a live layout check. |
| 25 | `src/components/scroll-reveals.ts` | Pass | Updated direct-child image and heading queries to target the content wrapper; descendant queries still reach the same content. |
| 26 | `src/components/ImageZoom.astro` | Pass | Descendant queries remain compatible. Open/close interaction passes in the Samsung preview. |

## Responsive measurements

Measured five public studies at four widths: 20 rendered page/viewport combinations. All 128 measured section, article-to-callout, and callout-to-navigation boundaries match the shared section-gap value within 1px. None of the 20 combinations shows horizontal overflow, and all device heroes span their article's width.

| Viewport width | Shared section gap | Callout inset | Public studies | Status |
| --- | --- | --- | --- | --- |
| 390px | 80px | 40px | 5 | Pass |
| 705px | 98.3px | 49.15px | 5 | Pass |
| 1024px | 117.4px | 58.72px | 5 | Pass |
| 1440px | 128px | 64px | 5 | Pass |

Additional Samsung checks at 767, 769, and 1025px confirm fluid gap values around the layout breakpoints, without horizontal overflow. A subsequent adjustment aliases `summaryGap` to `sectionGap`, so the space between project facts and the opening statement follows the same value as the other sections.

Visual review covers the Samsung desktop and mobile closing sections and contact callout. Measurements across the other studies confirm structural spacing; they do not constitute a complete visual-design review of every screen or artwork composition.

## Technical checks and limits

- Production build: passed with the final wrapper, hero-span, heading-token, and legacy-section changes.
- Astro check: fails on the existing TS2367 comparison with `pending` in `src/components/device-scene/mount.ts:145`. It reports no new errors in this change's files.
- Protected Whataburger body: live verification unavailable because the local route returns a service-unavailable page. No access workaround attempted.
- Existing public copy and artwork remain as they were before the spacing refactor.
- No dependency changes or global primitive token changes.

audit complete — checked 26 elements across 26 files
