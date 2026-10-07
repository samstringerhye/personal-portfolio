# Amica Case Study — Source Research Findings

Consolidated from four research passes over the Obsidian vault (`~/Projects/amica/amica-obsidian`) and the OneDrive project docs (`Amica - Documents/Amica Website Redesign`), run 2026-08-11. Detail files for this session live in the scratchpad under `amica-research/01–04`.

Purpose: fill the gaps five adversarial critics flagged in `src/content/work/amica-design-system.mdx` — buried outcome, no business/user metric, thin design craft, no before/after, unclear contribution.

---

## 1. The metric that changes the "no outcome" verdict

The redesign had **not launched** at time of research (go-live moved from 8/29 to **9/12/2026** after Quote Flow regression defects). So no post-launch conversion, traffic, speed, or SEO number can exist yet. That confirms there is no *shipped* business outcome.

But there is one real, attributable, pre-build outcome:

**Concept testing, April 2026** (`2026_Amica_Concept Testing_Results.pptx`), n=500 mobile, 85% with no prior Amica exposure. New design vs. the current live site:
- **62% more trustworthy**
- **70% more premium** (the 70.28% figure)
- **59% more likely to prompt getting a quote**
- **37% most memorable vs. competitors**
- 100% of trust-preferrers also reported higher quote likelihood

This is preference/concept validation, not task-success/SUS or post-launch conversion. It must be framed as **design-direction validation**, not shipped impact. It is the single strongest number available and replaces node-count vanity metrics as the hook.

Supporting, weaker figures:
- Quote-start baseline ~9.3% site-wide / 10.1% microsites (Feb 2025–Jan 2026), pre-redesign. No live lift measured.
- RFP figures 11% → 15.4% quote start, ~40% projected lift — these are **pitch targets/projections, not actuals**. Label honestly or omit.
- Internal velocity (Sprint 10 = 97 points) — not a business outcome.

**NDA note:** all of the above are internal Razorfish/Amica client figures. Usable only at whatever sensitivity level the engagement is already treated (the case study is already `passwordProtected: true`).

---

## 2. Scope claims — verified, with corrections

| Case-study claim | Source verdict |
|---|---|
| "615 pages" | **CONFIRMED** — CR-01: 615 total migration pages, +115 over the 500 scoped, +53 for YourPlan. |
| "nine template types" | **CONFIRMED** — vault holds exactly 9 (Homepage, Landing, PCP, PDP, Topic Hub, Topic Resource, Standard, Search, Error). |
| "extended the engagement three times" | **CONFIRMED with nuance** — three change orders (CR-01/02/03), but only CR-01 and CR-03 moved the end date (8/21 → 9/4 → 9/25). CR-02 was a funded $113K design-system scope expansion, not a schedule extension. Consider rewording to "three change orders, two of them pushed the timeline." |
| "119-year-old mutual insurer" | **CONFIRMED** — founded 1907. |
| "Associate Design Director / design lead over six designers" | **CONFIRMED role**; joined **2026-05-18** as the first dedicated design lead after four sprints with none. |
| "40-plus person engagement" | **NOT SOURCED** — SOW contracts a 31-seat retained team (17,245 hrs). 40+ only holds as a lifetime count including rotation + client stakeholders. Soften to "30-plus retained" or "40-plus across the life of the engagement." |
| "six designers" | **Approximate** — roster shows ~8 design-titled ICs staggered across sprints. "Six" is directionally fine; "up to eight" is defensible. |

---

## 3. Contribution & team credit (fixes the "solo work" read)

**Important credibility nuance:** the component library **pre-existed Sam**. It was built/owned by **Jaylynn Canales**, documented by **Marta Orias Hidalgo**, co-owned with **Marycruz Yong Tencio**. Sam's clean, defensible contribution is the **foundation re-architecture** (two-tier tokens, naming grammar, governance, indexing/remediation tooling) **plus design leadership** — which is how the case study already frames it. Keep that framing; don't imply he built the components.

The six/eight designers, mapped to owned work (from Sam's own assessment + People/ notes + the 77-component audit). Names captured for accuracy — **anonymize or get consent before publishing**:
- **Marta Orias Hidalgo** — design system + Editorial Hero
- **Marycruz Yong Tencio** — RTE + library cleanup
- **Cristian** — nav + heroes
- **Dana** — Segmentation Nav
- **Andrea** — Callouts + Footer
- **Chris Barrett** — art direction

Corroborated scale numbers independent of Sam's tooling: **77 components**, **19 icon variants**. Numbers that come only from Sam's own tooling and aren't independently corroborated in PM/vault docs: **314,000 nodes**, **54 semantic tokens**, **Icon Button 80→60**. These are almost certainly right; just know they're self-reported if challenged.

---

## 4. Design-craft & brand content (fixes "engineer who designs")

Quotable, sourced material the case study is currently missing:
- **Brand positioning:** "aspirational alternative in a distrusted category"; brand platform **"Empathy is our best policy."** (kickoff + Website Asset POV decks)
- **Color:** brand teal confirmed **`#00A88F`**, paired with `#231F20` (from the wordmark SVG).
- **Typography (real system):** **Amica Rhymes** (custom display) + **Apercu / Apercu Mono** (UI/body), delivered as font packages. Note: the case study should reference these, not the portfolio's own Inter.
- **Dual hero system:** Brand-Led vs. Product-Led hero — the design decision the 70% concept-test preference actually validated.
- **Art direction spec:** photography/motion direction with crop buffers, four aspect ratios, ambient-loop rules, casting diversity, WCAG contrast checked at shoot time. (Strong taste evidence; ties directly to the ambient-hero prototype.)
- **Affordance governance:** "dots = swipe, arrow = link out" carousel rule; quote-flow cognitive-load reasoning.
- **Governance at scale:** 76-icon set, 130-illustration library, 999-asset DAM with provenance manifest, two recorded client walkthroughs (design system + quote flow).

---

## 5. Narrative beats & conflicts (fixes thin leadership + missing tension)

- **Rescue spine:** Sam joined after four leaderless sprints where leadership was "split between two people both leading and executing simultaneously." Every fix is rescuing baked-in debt, not greenfield. This is a stronger opening frame than the current one.
- **Scope-authority conflict:** a Zip-code editor was added post-kickoff with no notice to design; Sam escalated it into a named scope-authority decision.
- **Client walkthrough pause:** Sam paused his own client-facing DS walkthroughs after dev/product pushback, then restructured them.
- **Accessibility watchdog:** a credentialed client-side a11y reviewer (IAAP CPWA-certified) repeatedly forced system-level fixes — real external pressure that justifies the governance work.
- **Line-height story** (already in the case study) is corroborated.

---

## 6. Decision depth — rejected alternatives now sourced

Real decisions with the alternative that was rejected (fills the critics' #4 gap):
- **Token taxonomy:** purpose-based grouping chosen over atomic grouping (scatters decisions).
- **Light/Dark as variable modes** chosen over duplicate Light/Dark components.
- **Inline field editing** chosen over a popup toolbar.
- Hard before/afters: Accordion 10→1, Cards 12+→1, Icon Buttons 80→60, 54 semantic tokens across 2 modes.
- Concrete a11y specs: 3:1 non-text contrast with a documented 1:1 failure caught, WCAG 2.4.3 focus order, text-shadow contrast treatment.

---

## 7. Assets to export for the before/after (fixes the auto-fail)

No ready-made old-vs-new file exists. Best sources (full paths in scratchpad file 03):
1. Homepage **"Page 04 - Design"** PDF (`13 Design/Template Comps`) — hi-fi final.
2. **"PCP Template - Page 01"** PDF (98MB flagship comp).
3. **Legacy-site "Current State" screenshots** inside `Amica.com Final Presentation.pptx` (228+ embedded images) — pair with new comps for the true before/after. Fallback: capture live/Wayback amica.com.
4. Home Page **Wires → Design** PDFs — a genuine low-fi → hi-fi process before/after.

All final UI artifacts are vector PDFs (Homepage, PCP Auto 8-page, Resources) + 10 UX page-template PDFs + quote-flow flyout designs in the Quote Start deck.

---

## 8. Recommended case-study changes, mapped to critique gaps

1. **Hook / outcome-first** → lead with the concept-test validation (62% trust / 70% premium / 59% quote-intent, n=500) framed as design-direction proof. Fixes critics' #1 and #2.
2. **Business metric gap** → resolved: use the concept test, honestly labeled as pre-launch; note the site launches 9/12. Do not use projected RFP numbers as actuals.
3. **Before/after visual** → export homepage/PCP comps + legacy screenshots. Fixes the auto-fail.
4. **Design craft** → add brand rationale ("Empathy is our best policy"), the teal + Amica Rhymes/Apercu system, the dual hero, and the art-direction spec.
5. **Contribution clarity** → credit the pre-existing library and the named designers by role; keep Sam's contribution scoped to re-architecture + leadership.
6. **Scope corrections** → soften "40-plus person," nuance "extended three times," keep 615/nine/119 as confirmed.
7. **Narrative** → optionally reframe the opening around the four-leaderless-sprints rescue.

---

## Open decisions for Sam
- Use the concept-test metric? It reverses the earlier "no metric exists" call. (Real, but pre-launch and internal/NDA.)
- How to handle designer names — anonymize ("the design-system designer") or name with consent.
- How far to correct "40-plus person engagement" given it's not contract-sourced.
