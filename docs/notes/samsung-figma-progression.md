# Samsung page imagery and progression evidence

## Outcome rule correction

Sam clarified that outcomes must contain verified user or business KPIs only. Removed the Samsung Design outcomes bar and the equivalent Amica bar. Design decisions, deliverables, project scope, rollout scale, and milestones do not qualify. If sourced KPIs are unavailable, omit the outcomes section. This correction supersedes earlier notes permitting a Design outcomes fallback; AGENTS.md and the shared case-study template now state the stricter rule.

## 2026-10-22: native font and layout repair completed

The current body now uses six fresh 2× PNGs. Native Figma export copies preserve the installed Samsung Sharp Sans and SamsungOne fonts. Repaired imported clipping and spacing in those copies, including header labels, links, badges, and PDP breadcrumbs. Original project files remain intact. The current asset table, source links, dimensions, and repair boundary are in `src/assets/work/samsung-redesign/figma/PROVENANCE-2X.md`.

The old navigation images' exact Figma source remains unresolved. Inspection corrected an earlier assumption: the October RO3 archive contains account/country-selector states and does not establish the source of the product-navigation images. The page now uses fresh native exports from the supplied February navigation file, clearly captioned as documented variants. They support the imagery-and-labels discussion without claiming a direct sequence or shipped status.

Preserved the original 3D hero and homepage transition. Tightened the ending to connect shared patterns to product and backend constraints. No performance metrics or new authorship claims were added.

Final responsive review also found an image-zoom focus issue: closing the dialog could pan a cropped page image to its bottom. Page-panel fields now use `overflow: clip` so focusing the tall image cannot scroll its container. After zoom close, the PDP retains its configuration crop. Editorial, factual, and technical review results are separated in `samsung-case-study-review-2026-10-22.md`.

## 2026-10-22: 2× PNG export pass

Sam requested 2× PNGs for the case-study body and preservation of the existing 3D hero/homepage transition. The button-family presentation frame now uses a fresh 2400 × 1520 PNG export from `O96VhrVK6xxo1uRRcO9fJM`, node `5:2327`, with PNG delivery through the shared Panel component. Copy and image selections remain unchanged.

Fresh 2× PCD and repaired-PDP exports remain held because Samsung fonts are unavailable to the Figma export environment. A PCD inspection returned 148 text layers with missing fonts, and the new PNGs clip navigation and link labels. The February GNB file also differs from the navigation designs currently on the page. Existing navigation and product-page images remain in use while a matching later GNB source and faithful font rendering are unresolved. Full export details and dimensions are in `src/assets/work/samsung-redesign/figma/PROVENANCE-2X.md`. Do not describe the whole Samsung page as refreshed to 2× PNGs.

## Current page exports

Exported directly from the user-supplied Figma files on 2026-10-21. Full frames remain available through image zoom; the page panels show their upper portions. WebP encoding preserves the exported dimensions without adding device mockups or redrawing content.

| Local asset | Figma source | Frame | Export dimensions |
| --- | --- | --- | --- |
| `src/assets/work/samsung-redesign/figma/pcd-latest-desktop.webp` | [Latest PCD](https://www.figma.com/design/KDZjB3a6JrojWhZMk8UXSO/OPTS-Revamp-PCD-RO2-DA-091120?node-id=0-115) | `[RO2] DA PCD_Main page_Washers & Dryers_Default_v1.6` | 2880 × 9602 |
| `src/assets/work/samsung-redesign/figma/pdp-latest-desktop.webp` | [Latest PDP](https://www.figma.com/design/a86UpyabCWzWkkPHDpnWec/OPTS_PD_Common_RO3_112720?node-id=0-278) | `[RO3] PD_SimplePD_v1.0` | 2880 × 10232 |

These replace the older category JPEG and tablet-composited PDP JPEG. Existing source files remain in place.

### PDP swatch repair

The latest source uses the same blue paint for all four options and 24 × 18px vector artwork for each circle. On 2026-10-21, created a separate [portfolio export copy](https://www.figma.com/design/a86UpyabCWzWkkPHDpnWec/OPTS_PD_Common_RO3_112720?node-id=4-19226). The original frame remains unchanged. Restored black, blue gradient, coral, and white paints from the earlier Galaxy A50 selectors (`9AkssMJDoS6xnjSvnwrZER`, nodes `0:348`, `0:342`, `0:336`, `0:330`). Replaced the distorted swatch artwork with 24 × 24px ellipses in that copy only. Text and page layout remain unchanged. The site now uses `pdp-swatches-restored-desktop.webp`, exported at 2880 × 10232, in place of the initial uncorrected export.

### Hero source still unresolved

The animated devices still use the older homepage/category textures. A fresh export of [Homepage Standard v1.3](https://www.figma.com/design/HdLr2BHYpSjMfJ7SsZEkLv/OPTS-Revamp-Home-RO2-092320?node-id=0-193) omitted text. Figma reports `hasMissingFont: true` on headline/navigation text nodes, including `0:536` and `0:517`. Held the hero replacement rather than publish the incomplete render. Resolve the original fonts or obtain a faithful export before replacing its textures and updating the tour geometry. Do not describe all visible imagery as freshly exported yet.

## Evidence for a stronger iteration narrative

### PDP: separate configuration versus configuration on the product page

**Observed:** [Earlier Galaxy A50 Config 1](https://www.figma.com/design/9AkssMJDoS6xnjSvnwrZER/OPTS-Revamp-MO-PD-v03-020720?node-id=0-292) shows a back control, progress indicator, product summary, carrier/capacity/color selection, and a bottom price bar with a Next action. The [latest mobile SimplePD](https://www.figma.com/design/a86UpyabCWzWkkPHDpnWec/OPTS_PD_Common_RO3_112720?node-id=0-3771) combines product media and the buying options in a long product page. Its desktop counterpart puts product media beside the buying controls.

**Confirmed rationale:** On 2026-10-21, Sam answered the question about moving configuration onto the product page: "it was a technical reason where the developers let us know the back end required it". Attribute the requirement to the backend and its identification to the developers. Do not frame the change as Sam's independent UX recommendation or a research finding.

**Missing evidence:** Sam's exact visual decisions within this change, whether the selected frames directly succeeded one another, and any validation or impact. His broader PDP visual-design contribution is already confirmed. Keep that scope distinct from ownership of the configuration architecture.

### PCD: explorations and later category template

**Observed:** [Earlier PCD landing](https://www.figma.com/design/KVptpGd0QTIme1C0kywu3A/OPTS-Revamp-PCD-020320ssh?node-id=0-762) foregrounds a refrigerator image and Discover action; its surrounding frames include story cards and configurator states. [The other older file](https://www.figma.com/design/KnfWHV1yZ4LqbjFaezu42t/Untitled?node-id=0-1) groups concepts under Type A/Gini, B/Hannah, C/Young, and D/Joo. Type A-01 uses stacked Galaxy-family image cards. The latest washers/dryers template combines campaign imagery, category links, best sellers, quick search, and product picks.

**Limits:** These use different product categories and named contributors. They demonstrate the range of explored treatments, but do not prove a direct chronological progression, Sam's ownership of every concept, or why the team selected the later arrangement. Do not describe one as a rejected version of another without confirmation.

## Editorial use

The user rejected the state table as another text-heavy reading task. Replaced it with `button-family-visual.webp`, exported from a new [Figma presentation frame](https://www.figma.com/design/O96VhrVK6xxo1uRRcO9fJM/DS_Specs?node-id=5-2327). It arranges existing button instances into six enlarged visual tiles. Sources: `0:839`, `0:1098`, `0:1184`, `0:1035`, `0:1247`, `0:1304`. The first button uses the normal-state blue container paint `#2189FF` documented in `Button_VI Spec 13`; the other source styling remains intact. The new arrangement is portfolio presentation, not an original project artifact. Original components and documentation remain unchanged. The on-page caption attributes the variants to the shared library.

The closing section now pairs the component-work paragraph with a fresh export of [filled-button state specifications](https://www.figma.com/design/O96VhrVK6xxo1uRRcO9fJM/DS_Specs?node-id=0-790). Source frame: `Button_VI Spec 13`; exported at 5764 × 2560, encoded at 2882 × 1280 as `filled-button-states.webp`. Caption attributes this to shared project documentation rather than claiming Sam authored the entire specification. The ending follows the user's new rule: visual evidence, three **Design outcomes** callouts, then one final statement. These callouts describe demonstrated design changes, not measured business or usability gains. The later explicit request restores the bar in this qualified form.

Build any new iteration section around a confirmed change and its rationale before selecting the comparison images. The page-template blurb and PDP caption now explain the confirmed backend constraint. The matching Galaxy A50 states can support a focused comparison; do not label them as consecutive revisions without confirmation. Keep alternative concepts, later deliverables, and measured results distinct.

### Role and outcome correction, 2026-10-21

Sam clarified: "we had lots of input into those decisions, we didnt just translate things". Treat the global system as project context, not a ceiling on the team's contribution. Lead with Sam's confirmed design authorship. Additional examples of page/system decisions remain requested; do not invent them from final imagery.

Sam also clarified that the outcome should contain numbers and results if available. Removed the four deliverable/handoff callouts from the Outcome section. The available boss case study refers to an 88+ market rollout; this establishes program scale and does not prove a performance result. No sourced conversion, adoption, or comparable before/after usability measure has emerged. Keep the outcome bar out until supported results exist.

### Expanded contribution confirmed

Sam added: "I was also involved Cart and Offers and my samsung and support". The scope and contribution copy now includes these four areas as contributions, without claiming sole ownership, checkout ownership, or specific decisions that Sam has not described. The existing product-page/navigation examples remain the detailed evidence chapters.

Located corresponding original Sketch files under `/Volumes/projects/Razorfish/Samsung/Revamp/Revamp/`: `06-Cart & Checkout/OPTS_Revamp_Cart+Checkout_RO3_120220.sketch`, `07-My Samsung/OPTS_Revamp_My Samsung_120820_v46.9.sketch`, `08-Offers/OPTS_Revamp_Offers_RO2_120820.sketch`, and `09-Support/OPTS_Revamp_Support_RO2_121020.sketch`. Do not publish their imagery as new Figma exports without obtaining the appropriate Figma sources.

Checked the archive inventory for results: `05_Data Analytics.zip` contains reports dated 2019–2020, including existing-site A/B tests and historical performance reports. `KPIs 2/KPIs.boxnote` lists MDE measurement goals from 2019-03-27, rather than achieved results. `MDE Metrics and KPIs.zip` contains a Connected Living dashboard dated 2019-12-08. These do not establish post-launch impact from the final Revamp handoff in 2021. This is a source-inventory check, not an exhaustive analytics audit.
