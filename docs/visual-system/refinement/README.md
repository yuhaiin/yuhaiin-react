# PR #473 — component refinement

This is the second pass on the existing PR branch. The five palettes, independent mode preference, APIs, rule logic and directory/detail workflow are retained.

## Findings and fixes

- **Node-picker transparency was a capture timing problem.** The original capture requested a PNG as soon as the dialog became visible. In the minimal Chromium reproduction, computed opacity was 0.629741 at that point and 1 after entry finished; the settled background was opaque `rgb(255, 255, 255)`. The updated capture waits for data/DOM readiness, `document.fonts.ready`, completed finite animations and four stable layout frames. Dialog, overlay, page, detail and popover transitions participate in this check. Animations remain enabled. Reduced-motion dialogs use zero duration.
- **The traffic axis rounded distinct values to identical text.** `[0, .2, .4, .6, .8, 1]` produced only `0 B/s` and `1 B/s`. The live/history charts now share an axis formatter that selects one unit for the axis and precision from tick spacing. Very small values use scientific notation rather than long strings of zeros. Existing sampling, buffers and retention logic stay intact.
- **The previous remote CI failure was a timing-dependent GeoIP test.** Reopening a cached SWR catalog schedules revalidation asynchronously. The test now waits for the second request and the updated Japan option, rather than sleeping 20ms and asserting immediately. Country values and catalog-fetch behavior are unchanged.
- **The refined shared-destination form exposed a grid sizing regression on mobile.** A long selected-node label inflated an implicit grid column. Single-column form sections now explicitly use `minmax(0, 1fr)`, and the mobile linked editor is covered by the existing capture checks.

## Common proportions

| Control | Desktop | Mobile interaction target |
| --- | --- | --- |
| Standard button / input / select | 38px | At least 44px |
| Compact control / icon button | 32px | At least 44px |
| Segmented item | 32px minimum | At least 44px; text may wrap |
| Switch visual track / thumb | 42 × 24px / 18px | 44px standalone target or whole row |

Buttons share padding, 16px icons, spacing, corner radius and press feedback. Ghost buttons are explicit variants. Selected segmented items use a quiet surface on a muted base, with no per-option border or sidebar-token dependency. Routing mode, match scope, AND/OR, action and Overview time ranges use this component.

Switches use one track/thumb style; whole-row switches no longer need a large gray container. The global body scale is 14px, desktop fields 14px, supporting text 12–13px, section headings 16px and page headings 24px. Mobile text inputs remain 16px to avoid focus zoom. Ordinary module icons and protocol/order badges are neutral; semantic statuses and the selected accent keep their roles.

`FormSection` provides one heading/description/fields/divider language, with field spacing owned by the section rather than accumulated field margins. Publish and DNS use it; ordinary Inbound connection, network, transport and protocol configuration no longer nests full cards. Published nodes are ordered rows with compact action buttons. Node usage flags, checks and protocol headings have clearer priorities.

The mobile App Bar is 56px plus safe area, includes the owning navigation title and retains the drawer. Page headings remain accessible but are visually hidden at small widths. Existing editor back actions, draft guards and scrolling remain available.

## Component Gallery

The Gallery is **only** an MSW development entry: `http://127.0.0.1:5175/?gallery=1`. It is not registered as a production route or linked in the product navigation.

It covers buttons (primary, secondary, ghost, danger, icon, disabled, loading), inputs/textarea, select/dropdown/combobox, segments, switches, checkbox/radio, badges/chips, slider, lists, pagination, modal, tooltip and toast. Pointer hover/press, keyboard focus, selected and expanded states are captured from actual interactions. It includes English, Chinese, Japanese and Korean glyph samples.

Gallery and interaction captures are available in the CI `visual-system` artifact. See [capture instructions](../../README.md).

## Verification

- **154 tests / 62 files**, TypeScript, lint, i18n, style audit, production build and diff checks passed locally.
- **104 primary page states**: Overview, Nodes, Shared Destinations, Routing, DNS, Connections, Subscriptions, Inbounds, Publish and WebUI. Olive covers 1440/390/320px in Light/Dark; Terracotta and Graphite cover all pages in both modes; Plum and Brass retain automatic palette coverage. Shared token contrast remains at least 4.538:1 for checked text pairs.
- **14 Gallery captures**, **6 settled node pickers**, **4 mobile node-editor captures**, plus **18 Gallery interaction captures**. Gallery asserts equal standard-control heights, 32px icon buttons, Tab focus trapping, background scroll lock, internal long-content scrolling, nested popup/Escape ordering, overlay dismissal and reduced motion.
- The **18 existing directory/editor snapshots** were refreshed. Readiness waits precede geometry checks as well as screenshots; single-selection segments are queried by their label rather than assuming their former button-group role.
- Additional real-page Japanese/Korean checks passed at 320px, 390px and desktop. Chinese glyph rendering is demonstrated in the Gallery; the product's existing three locale resources are unchanged.
- The new snapshots were visually inspected, including the modal's fully opaque surface, control proportions, compact mobile bar, Publish field spacing and chart labels. CI runs the same visual checks and uploads the full matrix.

## Remaining scope

This is a visual/interaction refinement, not an audit of every legacy protocol form or a new localization project. Some advanced forms and existing untranslated copy can be improved incrementally. Chromium was used for actual rendering; native Safari/Firefox and a physical soft keyboard were not available. No new UI framework, web font or backend endpoint was introduced.
