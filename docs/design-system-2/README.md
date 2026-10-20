# Design System 2.0 — retained workspaces, refined controls

The Sidebar, resource directory and detail pane keep their existing structure, width breakpoints, surfaces and navigation. This pass refines neutral colors, control states and the information inside those panes. It starts from merged PR #473 (`510b90c`), with no backend, protocol, matching or data-fetching changes.

## Review and implementation sequence

1. **Gallery / tokens:** the previous light canvas, borders and supporting text all leaned green; selected rows combined a large accent background with accent text. Button disabled/loading states depended on opacity. New neutral surfaces separate the five accent hues from everyday content; disabled actions now keep their variant hierarchy (quiet primary tint, transparent outlined/ghost controls) rather than uniformly filled gray rectangles; pending actions keep visible labels and their original variant.
2. **Nodes / Overview / Publish:** existing columns and meaningful containers are sound. Node metadata and test actions needed quieter emphasis; Overview rates and totals had the same weight; simple Publish fields stretched across the whole detail area. Headings and metadata are now calmer, rate values take priority, and simple field groups cap their reading width inside the same pane.
3. **Other pages / interactions:** shared controls carry the refinements into Routing, DNS, Inbounds, Shared Destinations, subscriptions, Connections and Settings. Directory selection uses a neutral surface plus the existing accent marker. Focus, validation, readonly, disabled and popup behavior are checked through the Gallery and real pages.

The implementation was verified with browser captures using the same synthetic MSW data, accent, mode and viewport. Both sets were captured in this task after fonts, finite animations and layout settled. Existing animations and the mobile App Bar are retained.

## Actual tokens

The implementation is in `src/global.css`, mapped through `tailwind.config.js` and `src/component/v2/styles.ts`. Compatibility aliases remain so existing consumers keep their APIs.

| Role | CSS variables / actual values |
| --- | --- |
| Spacing | `--space-1:4px`, `--space-2:8px`, `--space-3:12px`, `--space-4:16px`, `--space-6:24px`, `--space-8:32px` |
| Role spacing | `--space-control:var(--space-3)`, `--space-field:var(--space-4)`, `--space-group:var(--space-6)`, `--space-section:var(--space-8)`; section-owned `--field-margin` remains supported |
| Radius | `--radius-sm:6px`, `--radius-md:10px`, `--radius-full:999px`; `--radius-ui-xs/sm/md` map to small controls, `--radius-ui-lg` to medium surfaces; existing 12px shell compatibility radius remains |
| Height | `--height-field-xs:28px`, `--height-field-sm:32px`, `--height-field:38px`, `--height-touch:44px`; mobile buttons/inputs/selects have 44px targets; textareas retain automatic sizing and consumer height overrides |
| Type | `--font-page:24px`, `--font-section:16px`, `--font-body:14px`, `--font-label:13px`, `--font-meta:12px`; page headings 600, sections/cards 500, labels/body 400, technical data 400–500 with tabular/mono figures |
| Line height | `--leading-heading:1.3`, `--leading-body:1.55`, `--leading-support:1.5`; mobile inputs remain 16px and system CJK fallbacks are explicit |
| Elevation | `--elevation-0:none`, `--elevation-1` subtle 1px/2px shadow, `--elevation-2` floating-surface shadow. `--shadow-card/control/elevated` are compatibility aliases; ordinary fields have no shadow |
| Motion | `--motion-fast:120ms`, `--motion-normal:160ms`, `--motion-slow:200ms`; Motion's matching seconds are in `motionTiming`; CSS and Motion respect reduced motion |

| Neutral token | Light | Dark |
| --- | --- | --- |
| `--canvas` | `#F7F8FA` | `#17191C` |
| `--surface` | `#FFFFFF` | `#202327` |
| `--surface-muted` | `#F0F2F4` | `#2A2E33` |
| `--surface-raised` | `#FFFFFF` | `#2D3137` |
| `--sidebar-surface` | `#FAFBFC` | `#1C1F23` |
| `--border` | `#DDE2E7` | `#3D444D` |
| `--border-strong` | `#818992` | `#89949F` |
| `--text-primary` | `#22272E` | `#ECEFF3` |
| `--text-secondary` | `#535D68` | `#B9C1CB` |
| `--text-tertiary` | `#626E7B` | `#A4AFBC` |
| `--disabled-bg` | `#EBEEF1` | `#292D32` |
| `--disabled-border` | `#CDD3DA` | `#424A54` |
| `--disabled-fg` | `#5D6774` | `#96A1AF` |

`--surface-selected` mixes 7% primary text into the surface; `--surface-readonly` uses the muted surface. Selection is deliberately neutral while focus and the existing directory marker use accent. The first candidate strong border measured 2.995:1 against the muted surface; the shipped value passes the applicable 3:1 check.

| Accent | `--accent-light` | `--accent-dark` | `--accent-light-soft` |
| --- | --- | --- | --- |
| Olive | `#5B6D4C` | `#B5C99D` | `#E8EFE3` |
| Terracotta | `#9D503B` | `#E6A18C` | `#F7E7E0` |
| Plum | `#79546D` | `#D5AAC7` | `#F2E7EE` |
| Brass | `#846625` | `#DDC282` | `#F5EEDC` |
| Graphite | `#464C50` | `#C6CBCF` | `#E9EBED` |

The five palette values retain their established hues. `--accent-hover` mixes 10% black in Light / white in Dark, `--accent-active` 20%; Dark `--accent-soft` mixes 13% accent with the surface. `--accent-foreground` is white in Light and `#202327` in Dark. `--color-focus` resolves to the current accent. Checked foreground/hover/pressed pairs meet 4.5:1.

Semantic colors remain independent: `--color-success` (`#237546` / `#98CCA9`), `--color-warning` (`#855A12` / `#E4C17D`), `--color-danger` (`#BB3345` / `#F0A3AC`), `--color-info` (`#296C85` / `#9BC9D7`). Their low-saturation soft variants are derived from the semantic hue and surface. Danger foreground is white / `#311B20`.

## Components and reasons

- **Button:** Primary remains solid Accent, Secondary neutral, Ghost transparent, Danger solid and the additive Destructive variant soft danger. Existing variants and sizes remain valid. Disabled defines background/border/text/cursor, rather than opacity. A supplied `loading` prop reserves spinner space from the idle render, preserves the visible label, sets `aria-busy` and blocks duplicate actions. Slotted disabled links receive accessible disabled state and block activation.
- **Fields:** common small radius, calm border, 2px focus ring with offset, distinct readonly and disabled surfaces. Additive `error` support for Input/Textarea/Select provides an icon, live error text and ARIA association; passing an empty error reserves the feedback line. Existing forms keep their native structure when no feedback is requested. Readonly data stays selectable/copyable.
- **Segments / choices:** neutral selected surfaces, consistent heights, Radix keyboard behavior and clear focus. Switches keep 42×24px tracks / 18px thumbs, a neutral OFF border and 44px targets; disabled ON/OFF retain thumb position with disabled colors. Checkbox/radio samples align with labels.
- **Small controls:** neutral badges/chips use readable 12px text and consistent padding, semantic badges support a dot plus label. The slider uses a 4px track, 16px visual thumb, light elevation, numeric value text, keyboard steps/limits and a disabled state. Desktop pagination and arrows are compact; mobile page selectors are 44px tall.
- **Floats:** raised surfaces, 10px radius, one border/elevation language. Tooltip uses the existing Radix stack for collision handling and keeps the old hover/focus/click-to-pin API; labels remain independent of descriptions. Toast keeps semantic color and adds an icon to distinguish errors/information. Modal focus, scrolling, Escape, overlays and nested popup behavior are retained.
- **Pagination correction:** `justify-[inherit]` did not emit the intended inherited content alignment in the current Tailwind setup. A 32px page button had its text center about 5px left of its center. Explicit `[justify-content:inherit]` fixes shared Button content; browser checks assert both horizontal and vertical centering. Mobile page-value text is also centered.

## Browser captures

Generated comparisons and state screenshots are no longer committed. CI stores the current run in the `visual-system` artifact; see [capture instructions](../README.md). Gallery stays an MSW-only development entry, with no production route or navigation item.

## Validation and limits

- 158 tests / 64 files, TypeScript, repository Lint (`oxlint`), 14-namespace i18n check, Style Audit, Production Build and diff checks pass locally. Added regressions cover validation associations, readonly selection, slider keyboard limits, disabled actions/links and existing loading/segment behavior.
- Chromium/MSW: 124 primary page states. Olive covers 1440/768/390/320px in Light/Dark; Terracotta and Graphite cover all ten main pages in both modes; Plum/Brass retain automatic theme coverage. Text, disabled text and primary-button foreground pairs meet 4.5:1 (measured minimum 4.559:1); applicable strong borders/focus states meet 3:1. Results are in `contrast-results.json`.
- Gallery covers all five accents and both modes, including 320/390/768px Olive states. It checks geometry, disabled versus loading styling, readonly/invalid semantics, stable pending width/visible label, field focus, numeric pagination centering, mobile page-value alignment, dropdown keyboard focus, dialog focus trap/scroll lock/internal scrolling, nested Escape order, overlay dismissal and reduced motion.
- Existing 18 directory/editor captures are refreshed. Additional Japanese/Korean real-page captures and English/Chinese/Japanese/Korean Gallery controls exercise CJK line height, long buttons, segments and selected-option truncation.
- Screenshot acceptance uses data readiness, `document.fonts.ready`, completed finite animations and stable frames. Images were opened and compared, not accepted solely from a green automated check.

The real rendering checks use isolated Chromium with synthetic local data. Native Safari/Firefox, an actual mobile soft keyboard and physical assistive technology were unavailable; no claim is made about full cross-browser or screen-reader certification. Advanced protocol forms remain available and may merit later focused visual refinement; this pass does not mechanically rewrite them or add business features.
