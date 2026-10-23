# Whataburger: Figma evidence and case-study story
Reviewed October 22, 2026. Research and draft only; website copy unchanged.

## Recommended story
**Give the brand character without making every element compete for attention.**

The strongest evidence concerns UI judgment: controlling the amount of orange, separating selected states from decoration, using type size and weight for hierarchy, and simplifying icons at small sizes. The ordering requirements give these choices a practical purpose. Customers needed to recognize what they could tap, what they had selected, and what would happen next through customization, reordering, checkout, and rewards.

This interpretation connects the visual explorations to the production system. It does not establish a measured improvement in speed, conversion, or usability.

## Sources and coverage
- [Project Pele RZF Copy](https://www.figma.com/design/D8XlndxehP6lc8BSrGQBY1/Project-Pele-RZF-Copy?node-id=4301-8207): inventoried 27 pages; extracted relevant text from seven core epic pages and Presentations. Included Account, Locations, Menu, Cart, Tracking, Rewards, and Landing. Did not exhaustively review sandboxes, every prototype, or every screen.
- The copy's discussion panel showed no threads with resolved comments included, search cleared, and both user-only and current-page-only filters off.
- [Whataburger UX + Creative](https://www.figma.com/design/HpEkOIc93gioRRzop5luw0/Whataburger-UX---Creative): found the discussion history. Read recent threads, searched orange, test, legib, and font with resolved comments included across the whole file; opened the replies for #231, #233, and #279. This was a targeted story scan, not a complete export of every comment.
- Dates below preserve Figma's relative labels as observed on October 22. Exact timestamps were not retrieved.
- Thread numbers identify comments within the original creative file. Links below open the relevant page, not a verified permalink to the comment. Figma's Copy Link action did not return usable clipboard text.
- The companion JSON retains 423 unique candidate text entries across eight pages, deduplicated by text within each page. These are canvas notes and long text, not 423 discussion comments. Some entries are UI copy or open questions.

## Discussion evidence
| Thread | Author / displayed age | Evidence, paraphrased | What it supports and its limit |
| --- | --- | --- | --- |
| #117, Round 1 | Tiffeny Wilbourn / 9 months | Asked for a CTA color that could stand apart from the rest of the orange design. | Action visibility was an explicit review concern. This is feedback, not a measured accessibility finding. |
| #136, Round 1 | Jair Oballe / 9 months | Felt the buttons looked flat beside the expressive fonts and images; suggested exploring a harder shadow. | Visual hierarchy extended beyond color into depth. Proposed exploration, not proof of the final treatment. |
| #155, Rounds 2 & 3 | Ricardo Latorre / 9 months | Said orange headlines and CTAs competed for attention; proposed darker brown for selected text or controls. | A concrete tension between brand expression and action hierarchy. |
| #231, Round 4 | Sam Stringer-Hye / 8 months | Reported removing orange card fills, using an orange stroke and shadow for selection, and moving the order button to the lower right to give it room. | Direct evidence of Sam's intervention and rationale. Ricardo's reply favored retaining more orange, perhaps through a glow. Preserve this as an iteration, not unanimous endorsement of a finished answer. |
| #230, Round 4 | Sam Stringer-Hye / 8 months | Explored pill tabs and outlined alternatives, preferring dark brown to reduce orange on screen. | Direct evidence of Sam's exploration. Reply not inspected. |
| #233, Round 4 | Sam Stringer-Hye / 8 months | Replaced light-brown type differentiation with font weight and size to establish hierarchy. | Direct evidence of a typography decision. Ricardo liked the earlier option better and still questioned day-color dots, so do not describe the exchange as an unqualified approval. |
| #279, Menu + Customization | Sam Stringer-Hye / 8 months | Explored a filled bag and proposed a simplified icon for legibility. | Direct evidence of the reason for simplifying an icon. Ricardo explicitly supported its simplicity, especially the brown bag with an orange dot. No usability metric. |
| #266, Menu + Customization | Ricardo Latorre / 8 months | Said the peach background won in user testing and asked the team to apply peach to menu screens. | Contemporaneous evidence connecting a menu background choice to testing. Does not establish the full ranking of visual directions, sample size, protocol, or performance improvement. |
| #479, Landing | Ricardo Latorre / 6 months | Questioned putting a carousel of cards inside another card; proposed full-width rewards treatment. | Layout review focused on nesting and competing containers. Proposed change; final frame correspondence not checked in this scan. |
| #502, Landing | Ricardo Latorre / 6 months | Said the screens had the final updates and asked Sam to clean up naming/components and transfer them into the delivery file. | Evidence of system cleanup and handoff responsibility, not evidence that all UI decisions belonged to one person. |
| #506, Animations | Ricardo Latorre / 5 months | Found part of the animation too fast and suggested an interactive prototype that could be scrolled and recorded at a controlled pace. | Prototype legibility and presentation pace mattered. Does not prove a shipped motion behavior. |

Source pages:
- [Round 4: card, tab, and typography discussions #230, #231, #233](https://www.figma.com/design/HpEkOIc93gioRRzop5luw0/Whataburger-UX---Creative?node-id=1705-1727)
- [Menu + Customization: bag icon #279 and testing note #266](https://www.figma.com/design/HpEkOIc93gioRRzop5luw0/Whataburger-UX---Creative?node-id=3545-12385)
- Other threads are searchable by their distinctive text in the original creative file's Comments panel.

## Canvas evidence that gives the UI decisions a purpose
1. **Reordering needs recognizable actions.** The Two Touch Ordering notes explicitly warn that simplification could add friction unless users recognize orange as action and elevation as tappable. Saved location, timing, and payment selections reduce repeated choices, but food availability and payment errors still require handling. [Two Touch Ordering](https://www.figma.com/design/D8XlndxehP6lc8BSrGQBY1/Project-Pele-RZF-Copy?node-id=40197-251911), note instance 40197:253726.
2. **Customization needs a visible record of the meal.** Sticky ingredient navigation reflects selected modifiers. The notes specify default recipe choices, quantity badges, extra/lite labels, additional price, and changing nutrition. They also retain an anchor when a category has no selections. These are interaction requirements documented by the team; Sam's contribution is the UI implementation within the previously confirmed lead role. [Menu](https://www.figma.com/design/D8XlndxehP6lc8BSrGQBY1/Project-Pele-RZF-Copy?node-id=2567-9156), note instances 13302:30356, 13302:30369, 11760:13062.
3. **Error handling is part of the flow.** Cart notes call for centering and expanding the first affected item, disabling unavailable options, and resolving an error when the item changes. Some rules remain complicated, including a CTA that can reopen an error modal. Avoid claiming the flow removes all friction. [Cart + Checkout](https://www.figma.com/design/D8XlndxehP6lc8BSrGQBY1/Project-Pele-RZF-Copy?node-id=2682-21344), note instances 28795:64554, 28795:64502, 28795:64511.
4. **Rewards and scan need different priorities within the same system.** Notes keep the scan frame visible while content scrolls underneath, distinguish selected rewards from unredeemed offers, and call for confirmation when points return after removal. [Rewards + Offers](https://www.figma.com/design/D8XlndxehP6lc8BSrGQBY1/Project-Pele-RZF-Copy?node-id=4595-14700), note instances 27709:15142, 27709:15144, 27709:15146.
5. **Shared patterns still need platform-specific behavior.** Web notes adapt app bottom sheets into modals with a close control and Escape behavior; they explicitly exclude card scanning on desktop. These support a possible cross-platform story, but the current portfolio emphasizes the app. Keep them as secondary evidence unless the portfolio scope changes. [Account](https://www.figma.com/design/D8XlndxehP6lc8BSrGQBY1/Project-Pele-RZF-Copy?node-id=2567-9149), note instances 38698:69032, 36505:47148.

## Suggested case-study copy
### Make the brand expressive and the next action clear
I led the UI design for Whataburger's app, partnering with an experience director to develop the visual direction and carry it into the app screens and Project Pele design system.

The challenge was giving Whataburger's personality room without letting every headline, card, and control compete for attention. Early reviews repeatedly questioned whether actions stood apart from the surrounding orange, expressive type, and imagery.

### Give color a specific job
I explored lighter cards that used an orange outline and shadow to show selection, and moved the order action to give it more space. I also explored dark-brown tabs to reduce the amount of orange on screen.

These revisions involved tradeoffs. Ricardo wanted to retain more of the orange in selected cards, while I was testing how much could come from the outline and shadow. The discussion helped focus the work on what each treatment needed to communicate: selection, an available action, or brand expression.

### Use type and icons to clarify the interface
I revised the type hierarchy to rely on size and weight instead of light-brown text. For the bag icon, I explored a filled version, then proposed simplifying it for legibility. Ricardo supported the simpler brown bag with an orange dot.

Those decisions gave the system more than a consistent appearance. They defined how to distinguish controls and information within a visually expressive app.

### Carry those rules into ordering
The team's ordering requirements made those distinctions necessary. Customization needed to show what came with the recipe, what the customer changed, and which additions affected price. Reordering needed to reuse familiar choices while still handling unavailable food and payment issues.

I carried the UI system through those flows, using the shared type, card, icon, and navigation rules while keeping each screen's task clear. Rewards emphasized points and offers; scan kept the code central; account organized settings and saved information.

### Closing
The work made me more precise about the role of brand elements in a product interface. Color, type, illustration, and depth each needed to help customers recognize an action, understand a selection, or move through the order.

## Recommended changes to the current page
- Preserve the user's previously supplied testing story, but label its provenance internally. The Figma comment about peach does not replace or fully verify the reported dark-brown / orange-and-cream / light-neutral ranking. Do not collapse those into one test result without the study.
- Add the card and tab decision beside the direction boards. This explains the refinement beyond selecting a palette.
- Replace the generic typography/icon paragraph with the specific type-weight decision and bag-icon tradeoff.
- Show the bag variants and card-selection comparison if exact matching frames can be recovered. The current board alone cannot demonstrate the iteration.
- Give customization its own sequence, ideally default recipe, changed modifiers, and summary. The current top-of-screen crop supports visual styling but not the full behavioral claim.
- Treat Two Touch Ordering as a possible focused follow-up, not a measured speed improvement or proof of two taps across every case.
- Omit an outcomes bar. This scan found design rationale and testing references, not attributable business or user KPIs.

## Open questions and claim limits
- No exact study date, sample, full report, or measured task performance was recovered.
- The current three-direction ranking and Halloween-like reaction come from the user's earlier account, not from the inspected comment threads.
- A resolved Figma thread is not proof that its proposed change shipped.
- Canvas notes mix decisions, requirements, placeholders, future considerations, and unresolved questions. Do not present all notes as final behavior.
- Scheduling notes disagree: one future-considerations note says a simple sheet was chosen, while a Designs note calls for a native OS time picker. Exclude that decision until reconciled.
- Do not claim WCAG conformance from comments requesting contrast checks. They document a concern, not completed validation.
- The source does not establish that Sam alone authored the UX requirements or every final decision. Keep the role as UI lead in collaboration with the experience team.
