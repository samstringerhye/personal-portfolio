## 2026-10-06 to 2026-10-07

**Branch:** main
**Commits:** 5a68b05 Redesign homepage around work and leadership, tighten case studies; 9e454ed Layered work cards, card-to-hero zoom, and case study heroes

### Summary

- Compared the site with a peer's portfolio (jinhee-park.com) and acted on it: hero bio with name, title, and company highlighted; work list replaces the carousel; "How I lead" section; trimmed trait marquee; Resume in nav; contact page replaced by a mailto in the footer; /work index removed (redirects to /#work); Writing hidden (noindex, out of sitemap).
- Case study content: Bespoke results anonymized from Copilot findings ("6 to 10 times", "nine figures"); Amica updated for the Oct 2 relaunch; years corrected (Samsung.com 2020, MyFrontier and CVS 2022); AI advocate wording replaces the craft-group claim.
- Type: DM Sans replaces Inter; all text wraps balanced; `title-lg` on the regular weight token; `astro check` taken from 39 errors to 0.
- Work cards rebuilt as 3:2 layered art (flat brand color plus a transparent subject cutout), subjects anchored above the headline, year top-left and title/tagline bottom-left over the image, slight hover zoom. A 3D tilt, gradients, scrims, and text panels were all tried and rejected.
- Card-to-hero transition with GSAP Flip (`src/components/work-transition.ts`): the image and its text zoom into the case study hero and back; surrounding page zooms along; root view-transition crossfade suppressed to stop ghosting.
- Case study pages: hero reuses the card art with the title as h1; old heroes and duplicate titles removed; info bar under the hero, then a larger intro on tokens.
- Favicon is the four-color mark (`public/favicon.svg`, `.ico`, touch and Android icons).
- Card art generators saved to `scripts/thumbnails/` (see its README).

### Open

- Hero subject spacing is tight (~30px above the headline; Bespoke ~9px); offered scaling subjects down in the hero.
- Bespoke's title goes to one line around 1920px, leaving its image high there.
- Whataburger's removed headline "Redesigning How 900 Locations Order" not yet reused.
- White text on Whataburger, Amica, and MyFrontier cards is below AA contrast (Sam's call).
- Unused `WorkCarousel.astro` and `BioSection.astro` still in the repo.

## 2026-08-17

**Branch:** main
**Commit:** d4296bf Rebuild Amica case study: real design-system evidence, dropped fabricated diagrams

### Summary

- Tuned the Amica case study hero mosaic (`HeroMosaic.astro`): replaced placeholder "reasons to believe" stat copy, stacked and centered the stat numbers, fixed a clipped "Get A Quote" macro tile, bumped every sub-10px text element for legibility, and fixed a stats-card overflow bug on mobile.
- Audited the case study against portfolio best practices: content was uneven across sections and over-reliant on fabricated data-viz diagrams instead of real artifacts.
- Pulled real visual proof via Figma MCP (Buttons/Icon Buttons design-system documentation) and a live amica.com screenshot (legacy pre-redesign site), and used them to replace `ButtonSystem.astro`, `IconVariantMorph.astro`, `CanvasInkSpecimen.astro`, `TeamOwnership.astro`, and `MigrationPipeline.astro` — all deleted.
- Created `src/styles/amica-tokens.css` as a single source of truth for Amica's real brand colors/fonts; repointed `TokenTiers.astro` and `BeforeAfterStats.astro` to import it instead of locally redefining the same hex values.
- Rebalanced case study prose: thickened the thin "Leading Six Designers" and "Outcomes" sections with real sourced material from `notes/amica-case-study-research.md` (leadership rescue framing, scope-authority conflict, a11y watchdog, governance-at-scale numbers).
- Ran the `no-ai-slop` skill against the case study copy and fixed all findings: removed 3 em dashes (hard AGENTS.md rule), cut stacked "not X, Y" binary contrasts and a fake-profound kicker ending, replaced "highest-leverage" (banned word family) with "biggest-impact".
- Found and deleted duplicate/orphaned assets: `prototype/home-desktop.png` (byte-identical dupe of `hero.png`), `hero/auto.svg` (dupe of `bento/product-auto.svg`), and the orphaned `HeroConfigurations.astro` component that only that svg was used by.
- Fixed a real CSS specificity bug in `CaseStudyLayout.astro`: a broad `:not()`-chain default-image rule was unintentionally outranking the `.image-grid img` containment rule sitewide; wrapped the `:not()` clauses in `:where()` to fix it, and added a caption/image divider rule so figure captions no longer render inside the same bordered box as the image (verified other case studies unaffected).
