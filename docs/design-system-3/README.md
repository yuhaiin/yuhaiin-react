# Design System 3 — one system, phone and desktop layouts

This pass builds on [Design System 2.0](../design-system-2/README.md). The Web UI
is now the main screen of the Android v2 app, so phones get an app-like shell
(tab bar, full-bleed lists, bottom sheets, sticky editor actions) while desktop
keeps the sidebar, side-by-side workspaces and dense tables. Both are driven by
the same tokens and shared components; no page carries its own copy of a pattern.

No API, settings format, permission or history contract changed.

## Tokens

All values live in `src/global.css` and are mapped by `tailwind.config.js` and
`src/component/v2/styles.ts`. Accent palettes (Olive default, Terracotta, Plum,
Brass, Graphite) are unchanged.

### Neutrals (warm, low chroma)

| Token | Light | Dark |
| --- | --- | --- |
| `--canvas` | `#F4F5F1` | `#151A17` |
| `--surface` | `#FEFEFC` | `#202722` |
| `--surface-muted` | `#ECEFE9` | `#28302A` |
| `--surface-raised` | `#FEFEFC` | `#2B332D` |
| `--sidebar-surface` | `#F9FAF6` | `#1A201C` |
| `--border` | `#DCE0D6` | `#3A443C` |
| `--border-strong` | `#7B8475` | `#88948A` |
| `--text-primary` | `#20251F` | `#ECEFEA` |
| `--text-secondary` | `#4D5549` | `#BAC3B8` |
| `--text-tertiary` | `#5B6457` | `#A5B0A3` |
| `--disabled-fg` | `#5A6356` | `#97A296` |

Light semantic colors were darkened slightly so they keep 4.5:1 on the warmer
surfaces: danger `#B33244`, success `#21703F`, warning `#7F5610`, info `#276680`
(Dark values unchanged).

Checked pairs (WCAG relative luminance): every text token and semantic color on
canvas, surface, muted, raised, sidebar and selected surfaces ≥ 4.5:1; semantic
colors on their soft backgrounds ≥ 4.5:1; `--border-strong` on canvas, surface
and muted ≥ 3:1; every accent against its foreground, the surface and the
canvas ≥ 4.5:1 in both modes. The repository's `npm run visual:check` contrast
matrix also passes.

### Layout

| Token | Value | Use |
| --- | --- | --- |
| `--page-gutter` | 12px < 360px, 16px < 640px, 20px | Page side padding below lg; full-bleed strips cancel it |
| `--bottom-nav-height` | 64px | Phone tab bar, excluding the gesture inset |
| `--bottom-nav-space` | tab bar + `env(safe-area-inset-bottom)` while the bar shows, else the inset | Page bottom padding |
| `--bottom-sticky-under` | inset while the bar is hidden, else 0 | Sticky editor actions |
| `--content-max` | 1680px | Past this the page centers beside the sidebar |

### Motion

| Token | CSS | Motion (`motionTiming`) | Use |
| --- | --- | --- | --- |
| fast | 120ms | 0.12 | press feedback, exits |
| normal | 180ms | 0.18 | tabs, selection markers, dialogs |
| slow | 220ms | 0.22 | page and detail transitions |
| sheet | 280ms | 0.28 | bottom sheet entrance |
| `--ease-standard` / `motionEase.standard` | `cubic-bezier(0.2,0,0,1)` | | most movement |
| `--ease-sheet` / `motionEase.sheet` | `cubic-bezier(0.32,0.72,0,1)` | | sheets |

`prefers-reduced-motion` disables all of them (CSS and `MotionConfig reducedMotion="user"`).

### Typography

12px (`text-xs`) is the floor for any visible text. Remaining 10/11px and
`0.6–0.7rem` labels (sidebar section titles, badges, log/match-trace metadata,
About labels, combobox hints) were raised to it. Phone search fields use 16px
text so mobile browsers do not zoom on focus.

## Shell

| Viewport | Navigation | Page |
| --- | --- | --- |
| < 1024px | App bar (menu, title, Android reload) + **tab bar** (Home, Nodes, Routing, Connections, More) | Single column, `--page-gutter` |
| ≥ 1024px | Fixed sidebar | Workspace columns, `--content-max` |

The tab bar (`src/docs/nav/BottomNav.tsx`):

- Each tab owns its section's sub-pages (e.g. Selectors and Subscribe under Nodes; Block history under Connections). Everything else is **More**, which opens the existing navigation drawer — no page is hidden.
- Tabs the session cannot read are not shown (same `canReadRoute` as the sidebar).
- It steps aside (slides down, `inert`) while a record or draft is open on a phone (`?node=`, `?rule=`, `?new=` …; from md the detail sits beside its list), while a text field has focus (soft keyboard), and on viewports shorter than 500px (landscape phones).
- Tapping the current tab scrolls the page to the top.
- Visibility is published as `html[data-bottom-nav]`, so fixed UI outside the page tree and the page padding stack above it.

Android draws edge to edge and consumes only the horizontal (cutout) insets; the
top and bottom insets are applied once, in CSS, by the app bar and the tab bar.

## Shared components

| Component | Change |
| --- | --- |
| `WorkspaceLayout` / `WorkspaceDirectory` / `WorkspaceDetail` | Below md: full-bleed directory and detail, list scroll saved per history entry and restored on Back, detail opens at the top and slides in from the right, the directory slides back from the left. The 72vh list cap applies from md up only. The detail pane is a `@container` and caps its content at 1120px. |
| `ResourceEditorFrame`, rule, selector and node editors, Gateway save bar | Footer uses `.ui-sticky-actions`: on phones Save/Cancel stay pinned at the bottom of long forms. |
| `Modal` | Desktop dialogs settle from 0.96 → 1 (was a spring from 0.2). Below md every dialog is a bottom sheet by default (`mobileSheet={false}` opts out); drag the handle or header down to close. `ModalBody` is a `@container`. |
| `Card` | Carries `.ui-card`; its default bottom margin is dropped when a flex/grid `gap` already spaces it or when it is the last child. |
| Toasts | Phones show notices full width just below the App Bar, so they never cover the tab bar, sticky Save bars or actions at the end of a page; desktop keeps the top-right stack. |
| `PageHeader` sticky actions | Use `--page-gutter`. |
| `FilterSearch`, workspace search, pagination | 44px on phones. |
| Android VPN card | Status-first hero: state, desired state, one Connect/Disconnect action (full width on phones), then core details and diagnostics. Shown first on Home. |
| Node protocol forms, node runtime metrics | Container queries (`@xl:grid-cols-2`, `@2xl/@3xl:grid-cols-3`) instead of viewport breakpoints, so the 768–1023px side-by-side pane does not split into cramped columns; phones show runtime metrics two-up. |

## Page transitions

`useSmartAnimation` now takes the history index. Direction is:

1. Back/Forward traversal (lower index) → backwards.
2. Into a sub-page (`/docs/group` → `/docs/group/selectors`) → forwards; up to its parent → backwards.
3. Otherwise the sidebar order.

Phones move pages 16px horizontally; desktop keeps a 6px vertical settle. The next
page mounts immediately; nothing waits for an exit, and query-only changes do not remount the page.

## Verification

See the PR for the full matrix. Captures use `npm run dev:msw` with:

- `?scenario=android` — synthetic Android platform API (VPN state, settings, apps, routes, update, privacy); `?scenario=android-off` starts disconnected.
- `?lang=ja|ko` — translated layouts.
