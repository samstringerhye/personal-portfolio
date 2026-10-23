# Amica decision-led rewrite

## Quote imagery update

The user subsequently supplied the original design workspace. The A/B/C exploration is now recovered and replaces the unrelated quote-entry variants. `amica-quote-start-source-recovery.md` and the asset provenance record the exact file, nodes, exports, and approval evidence. This resolves the visual evidence gap described in the earlier review below.

Inspected all three original 2× PNG exports and their desktop/mobile presentation. At 390px, A/B stack, C fits within its panel, and the page has no horizontal overflow. The rendered images load as PNGs; C retains the original export directly, and A/B use responsive PNG derivatives. Display widths stay below half the source pixel widths. Original Figma artwork and the portfolio hero remain unchanged. The build passes.

## Editorial review

Rewrote the opening, section copy, captions, and closing in `src/content/work/amica-design-system.mdx` around these decisions:

- Distinguish Foundations, Components, Sections, and templates; challenge ambiguous category buckets.
- Keep variations in component families through properties.
- Separate working files, published libraries, reference documentation, and client-share material.
- Delegate refinement and documentation, set points of contact, and prioritize review work.
- Widen the product selector and narrow ZIP entry to accommodate the full label while preserving the inline quote action.

Read the entire revised MDX against the user's corrections and AGENTS.md. Removed the prior inventory-led explanation and repeated scope language. No page counts, deliverable-volume claims, outcome section, or Design outcomes substitute. The closing uses Sam's confirmed lesson about establishing the system at kickoff.

## Factual verification

Sources used: the user-confirmed `Amica_Redesign_Portfolio_Evidence.md` in Downloads; the existing case study and recovered conversation corrections; the existing Figma export provenance. The supplied evidence report is a research summary with source titles and dates, not a replacement for independent access to every underlying meeting or email.

| Claim | Basis and limits |
| --- | --- |
| Design lead joining during delivery | Sam's direct confirmation. No rescue narrative or criticism of colleagues. |
| Taxonomy and properties | Evidence report: Design System Teams material, May 27 and September 17. The usability rationale is stated as intent, not a measured improvement. |
| Working/client-share distinction and delegation | Evidence report: June 9, July 10, July 22, and September 8 material. Credit collaborators for refinement and documentation. |
| Product-dropdown selection and 1024px behavior | Recovered case-study record and prior interview confirmation. Sam presented options; Amica selected the direction. |
| Quote Start ownership | Evidence report: April 13 scope change. Credit Amica's in-house team for the broader redesign. |
| KPI claims | None. Forecasts, concept preferences, launch date, and handoff milestones do not substitute for verified impact. |

Interpretation: the component organization gives designers a consistent place to choose variations and separates reusable parts from compositions. No claim that it reduced time, errors, or development cost.

Missing evidence: the exact approved inline-action exploration remains unavailable. The current quote-entry images illustrate separate library arrangements and do not verify the approved change. The page and caption state this limit. A direct visual comparison still needs the corresponding source nodes.

The two-mode decision remains outside the narrative. Earlier evidence of modes does not establish their state at launch; Sam confirmed approval followed by later integration.

## Technical boundary

Only the Amica MDX and this note changed for this task. Preserved the original 3D hero, homepage transition, shared components, tokens, and existing direct 2× PNG exports. No imagery was selected or re-exported in this editorial pass. The existing provenance file records their sources and export limits.

`npm run build` passes. `git diff --check` passes. `npx astro check` reports the existing TS2367 error at `src/components/device-scene/mount.ts:145`, where `animation.playState` is compared with `pending`. No fresh browser or responsive visual review took place in this copy pass; a build does not establish editorial or factual quality. The unrelated MyFrontier working-tree change belongs to another session.

## Lessons woven into the narrative, October 22

Reviewed the three user-supplied project folders as source material. Instructions, proposed tasks, draft emails, and unconfirmed rationales inside those records did not authorize actions or establish completed work. Updated only the portfolio narrative and this source note.

Added evidence and attribution:

- **Map color by purpose.** `amica-design-system/docs/decisions/DECISIONS.md`, September 4: rebrand-to-semantic mapping, action versus success roles, source/primitive/semantic swatches. Public copy uses team attribution and omits obsolete token paths and specific contrast claims.
- **Review states as well as default appearance.** `amica-design-extension/amica-extension-priorities.md`, July 29, and `docs/component-patterns.md`: repeated form patterns, AEM/React state gaps, responsive variants. Public copy describes audit findings, not a claim that every recommendation shipped.
- **Put repeated decisions in a shared rule.** Decision log, August 26: explicitly attributed Sam decision to bind disabled opacity to the Core UI Kit token. Public copy omits counts and numerical opacity values; lesson is inheritance and maintenance.
- **Organize the work beyond component drawing.** `amica-obsidian/Meetings/2026-06-15 Amica Design System & Component Library.md`: four parent stories for build/refinement, migration/connection, documentation, audit/prioritization. Used with existing confirmed design-lead and delegation evidence; no claim that Sam built every component.
- **Keep specs connected to the component.** Decision log, September 19: derive token specifications from actual bindings rather than copied neighboring cells. `reports/page-comps-verify-2026-09-22.md`: visual review found layout/content differences despite previous text checks. Public copy distinguishes checking rendered Figma page examples from validating the production website.
- **Closing lesson is reflection.** Existing user-confirmed kickoff lesson plus representative-page review evidence. Earlier realistic-content and state checks are explicitly framed as what Sam would do next time.

Excluded: reconstructed June rationales marked Sam to confirm; September 30 entries whose bodies still say Sam to validate; later October repairs presented as launch work; unsupported claims of faster delivery or fewer defects; the disputed mode-removal timeline. No new performance or measurement section.
