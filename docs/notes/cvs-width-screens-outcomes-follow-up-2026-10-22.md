# CVS width, screens, and outcomes follow-up

Date: October 22, 2026

## Requested changes

- Product cards now fill the page's content column. The additional field inset from the preceding review is removed at desktop and mobile widths. The transparent surround and complete card artwork remain.
- Added four original Figma screens with three captions: desktop Shop navigation; mobile Beauty navigation; mobile search suggestions; desktop Neutrogena brand page.
- Added sections explaining how the shared typography, color, and product rules carry into these screens. Personal contribution remains limited to the system decisions Sam described, with team context.
- Searched for documented outcomes. No numerical claim was added to the case study because no located source ties an appropriately scoped, measured result to Sam's 2022 design-system work.

## Outcome research

| Source | Finding | Decision |
| --- | --- | --- |
| [Joseph Agresta: CVS Shop Experience](https://portfolio.josephagresta.com/portfolio_page/cvs-shop-experience/) | Describes eight subsequent projects, a relationship lasting over two years, and agency-of-record status. Does not provide a shopper conversion or revenue KPI for the redesign. | Useful relationship context, but not a verified outcome attributable to Sam's contribution. Not added as an outcome bar. |
| [Microplasma: CVS Health](https://microplasma.net/cvs-health/) | Describes an approximately 65% increase in add-to-basket from product listings for work dated 2020–2021. | Earlier project; no established connection to the 2022 case study. Excluded. |
| [Dan Shin: CVS Health global navigation](https://www.danshin.me/cvshealth-ux-global-navigation-strategy) | In a separate 2022 navigation study, 94% versus 75% of participants rated finding items easy or somewhat easy. | Related timeframe, but a different scope and contribution. No established link to Sam's visual-system work. Excluded. |
| [Baymard: CVS benchmark](https://baymard.com/ux-benchmark/case-studies/cvs) | Public page identifies a February 2023 review; performance data requires access. | No accessible attributable before/after metric. Excluded. |

A first-party project readout or a confirmed connection to one of these studies would be needed before using its KPI. The existing closing paragraph remains a description of the design, not a claim of measured business impact.

## Figma provenance

Source: [CVS – Visual Design](https://www.figma.com/design/XR5KKXZStWVF82UDjma63J/CVS---Visual-Design?node-id=553-589), accessed October 22, 2026. Current file state, not a verified historical snapshot. No source nodes modified.

| New asset | Node | Export dimensions |
| --- | --- | --- |
| nav-desktop.webp | 4327:90146, Dsk Nav - Shop | 2880 × 1800 |
| nav-mobile.webp | 4327:90317, Mbl Nav - Department Level (Beauty) | 752 × 1944 |
| search-mobile.webp | 5167:162944, Mbl Search - On Typing | 750 × 1946 |
| brand-desktop.webp | 4327:95678, Dsk Brand page - Level 1 | 2880 × 9860 |

Downloaded the node-configured JPEG exports, then converted to WebP at quality 90 without resizing or retouching. Brand page uses the existing page-panel crop to keep its hero, category shortcuts, and campaign content readable; the complete original export is retained in the asset.

## Verification

- Astro check: 125 files, 0 errors, 0 warnings, 83 hints.
- Production build: passed using a separate output directory under the project's ignored .astro folder.
- Initial standard build failed to find a generated 404 module. A separate output outside the repository then failed to resolve Sharp. The final isolated output inside the repository resolved both without dependency or configuration changes.
- Desktop / annotation / mobile views checked at 1280px, 809 × 988, and 390 × 844.
- At 809px, product artwork and its panel both measured 728.375px wide with matching x coordinates and zero field padding.
- At 390px, all 11 panels measured 334px within the page; no horizontal document overflow.
- All four added images loaded; no visible broken images or dialogs.
- No test script is defined.
- No publish, deployment, commit, or push.

Changed only the CVS MDX, scoped stylesheet, four new assets, and this source note. Shared files and other case studies were left to their existing owners.
