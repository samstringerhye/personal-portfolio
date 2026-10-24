# Samsung case study 2× PNG export record

## Current page assets after native repair and review

All six body images now use fresh 2× PNG exports. The original 3D hero and homepage transition remain unchanged. Native exports below use the latest accessible state of each labeled repair copy on 2026-10-22; Figma version IDs are unavailable.

| Asset | Figma file | Node | Pixel dimensions | Treatment |
| --- | --- | --- | --- | --- |
| `button-family-visual-2x.png` | `O96VhrVK6xxo1uRRcO9fJM` | `5:2327` | 2400 × 1520 | Existing labeled portfolio composition, fresh connector export. |
| `pcd-portfolio-final-2x.png` | [PCD repair copy](https://www.figma.com/design/vy2SYoHnqt6PkAR9dce82F/Portfolio-export---Samsung-PCD---Sharp-Sans-repair?node-id=0-115) | `0:115` | 2880 × 9602 | Native export after font and container repairs. |
| `pdp-portfolio-2x.png` | [PDP repair copy](https://www.figma.com/design/qKkzK3KWJk4xFaAB4Zd7DC/Portfolio-export---Samsung-PDP---Sharp-Sans-repair?node-id=4-19226) | `4:19226` | 2880 × 10232 | Native export after font, header, and breadcrumb repairs; retains earlier swatch restoration. |
| `nav-portfolio-desktop-2x.png` | [Navigation variant export copy](https://www.figma.com/design/edTHAXWR9m4mVP1v6c7xSI/Portfolio-export---Samsung-navigation-variant?node-id=0-616) | `0:616` | 2880 × 2048 | Native export after header spacing repair. On-page panel crops to the navigation area; zoom retains the complete frame. |
| `nav-variant-appliances-2x.png` | Navigation variant export copy `edTHAXWR9m4mVP1v6c7xSI` | `0:507` | 720 × 2474 | Native export, original artwork retained. |
| `nav-variant-fridges-2x.png` | Navigation variant export copy `edTHAXWR9m4mVP1v6c7xSI` | `0:478` | 720 × 3064 | Native export, original artwork retained. |

### Repair boundary

- Replaced the missing `SamsungSharpSans` family with installed **Samsung Sharp Sans** in the PCD and PDP copies through native Figma. Existing SamsungOne text retains its font.
- Disabled erroneous clipping around overflowing labels in the copies. Detached only the affected export-copy instances where Figma prevented spacing overrides.
- PCD: separated the Washing Machines menu item from Washer Dryers; enlarged two BEST SELLER badge backgrounds; separated the quick-search text link from Find. Export-copy detached nodes include `2004:1877`, `2006:1841`, `2006:1852`, and `2006:1872`.
- PDP: restored header label widths and gaps to fit the existing text; spaced footer breadcrumb items without changing their source wording. Export-copy detached nodes include `2005:20026`, `2005:20833`, and `2005:21111`.
- Navigation: duplicated the supplied February file, then repaired the desktop header's imported label widths and spacing. Detached header: `2002:5360`. No new product imagery or navigation architecture was composed.
- Inspected complete PCD/PDP exports in overlapping crops and both mobile navigation frames in full. Inspected the desktop navigation export after its final spacing repair. Native export preserves fonts unavailable in the connector's rendering environment.
- PNG delivery uses responsive derivatives capped at each source's native pixel width.

### Navigation source limitation

The old `nav-desktop.webp`, `nav-appliances.webp`, and `nav-fridges.webp` have no recovered exact Figma mapping. The October RO3 archive inspected during this pass contains account and country-selector states, not those product-navigation screens. The supplied February Figma file shows a different design. Current captions explicitly identify the replacement as a **documented navigation variant** and do not claim a confirmed revision sequence or launch status. The source behind the old images remains unresolved.

## Superseded export attempts

Exported directly from Figma on 2026-10-22 with `defaultFormat: png` and `defaultScale: 2`. The connector does not expose a version ID; these are the latest accessible snapshots on the export date. The 3D hero and its homepage transition remain unchanged at the user's request.

| Asset | Source file | Node | Pixel dimensions | Page status |
| --- | --- | --- | --- | --- |
| `button-family-visual-2x.png` | [DS Specs](https://www.figma.com/design/O96VhrVK6xxo1uRRcO9fJM/DS_Specs) (`O96VhrVK6xxo1uRRcO9fJM`) | `5:2327` | 2400 × 1520 | In use. Existing portfolio presentation frame, exported fresh at 2×. |
| `pcd-latest-desktop-2x.png` | [Latest PCD](https://www.figma.com/design/KDZjB3a6JrojWhZMk8UXSO/OPTS-Revamp-PCD-RO2-DA-091120) (`KDZjB3a6JrojWhZMk8UXSO`) | `0:115` | 2880 × 9602 | Held. Missing fonts produce clipped labels; previous page image remains in use. |
| `pdp-swatches-restored-desktop-2x.png` | [PDP portfolio export copy](https://www.figma.com/design/a86UpyabCWzWkkPHDpnWec/OPTS_PD_Common_RO3_112720) (`a86UpyabCWzWkkPHDpnWec`) | `4:19226` | 2880 × 10232 | Held. Header and link labels clip. Existing repaired swatch colors and circular geometry remain intact. |
| `nav-desktop-2x.png` | [GNB February source](https://www.figma.com/design/JnRZZGttRZwoxVewqR1r9v/OPTS-Revamp-GNB-0219220-SSH2) (`JnRZZGttRZwoxVewqR1r9v`) | `0:616` | 2880 × 2048 | Excluded. Different design from current page; header labels overlap in export. |
| `nav-appliances-2x.png` | GNB February source (`JnRZZGttRZwoxVewqR1r9v`) | `0:507` | 720 × 2474 | Excluded. Different design from the current navigation example. |
| `nav-fridges-2x.png` | GNB February source (`JnRZZGttRZwoxVewqR1r9v`) | `0:478` | 720 × 3064 | Excluded. Different design from the current navigation example. |

The current three navigation images entered the repository with commit `799b81c`, which records material from both Figma and the project archive. Their precise Figma node mapping has not been recovered. The supplied February GNB file does not match them; the later original archive includes `00-GNB/OPTS-Revamp-GNB-RO3-100520.sketch`. A matching later Figma source has been requested.

The connector's PCD font check found 148 text layers with `hasMissingFont: true` and no Samsung font families in the export environment's available-font list. Inspection of the fresh PNGs found clipping in Home Appliances, Washing Machines, and Sample label text. The existing page images are also historical exports, so retaining them does not establish that their typography is correct.

## Native desktop font repair

At the user's request, duplicated both files through the native Figma UI on 2026-10-22. In each copy, replaced the missing `SamsungSharpSans` family with the locally installed **Samsung Sharp Sans** through Figma's missing-font dialog. The PDP page listed 38 affected items; the PCD page listed 12. Figma's missing-font indicator cleared on each repaired page. Existing SamsungOne text retains its source font.

Exported the selected desktop frames through native Figma at **2× PNG**. These are labeled repair copies, not untouched project originals. Version IDs are unavailable; the links identify the copies and nodes as exported on the date above.

| Asset | Repair copy | Node | Pixel dimensions | Inspection and page status |
| --- | --- | --- | --- | --- |
| `pdp-sharp-sans-repaired-2x.png` | [Portfolio export - Samsung PDP - Sharp Sans repair](https://www.figma.com/design/qKkzK3KWJk4xFaAB4Zd7DC/Portfolio-export---Samsung-PDP---Sharp-Sans-repair?node-id=4-19226) | `4:19226` | 2880 × 10232 | Sharp Sans headings render. Corrected swatch colors and circular geometry remain intact. Some navigation and Sample label text still clip; held from page replacement. |
| `pcd-sharp-sans-repaired-2x.png` | [Portfolio export - Samsung PCD - Sharp Sans repair](https://www.figma.com/design/vy2SYoHnqt6PkAR9dce82F/Portfolio-export---Samsung-PCD---Sharp-Sans-repair?node-id=0-115) | `0:115` | 2880 × 9602 | Sharp Sans headings render. Some Home Appliances, Washing Machines, and Sample label text still clip; held from page replacement. |

The native app offers Samsung Sharp Sans and SamsungOne, unlike the connector's rendering environment. Font replacement alone did not resolve clipping. The later container repairs and final current assets appear above. These intermediate files remain superseded and unused.

The button board remains the previously labeled portfolio composition, not an original project screen. Sources and the earlier PDP swatch repair are documented in `docs/notes/samsung-figma-progression.md`. The Figma originals remain unchanged.

## Earlier mobile configuration step

`config-step-mobile-2x.png`: exported October 24, 2026 through Figma MCP at 2x (720 × 2042) from [OPTS-Revamp-MO-PD-v03-020720](https://www.figma.com/design/9AkssMJDoS6xnjSvnwrZER/OPTS-Revamp-MO-PD-v03-020720?node-id=0-292), node `0:292`. Paired on the page with the later desktop product page. The later mobile SimplePD (`a86UpyabCWzWkkPHDpnWec`, `0:3771`) was not used: its source swatches all render blue and a label clips.
