# Navigation and history

The Web UI is the main screen of the Android app, so browser Back/Forward, the
Android Back button and gesture, and in-page Back buttons must mean the same
thing. All of them go through one history model.

## Building blocks

| Piece | File | Role |
|---|---|---|
| History store | `src/hooks/navigation.ts` | Owns `window.history` for the hash router. `push`, `replace`, `back`, `forward`, modal layers, Back/Forward guarding. |
| Router hook | `src/hooks/useHashLocation.ts` | Wouter location hook on top of the store. `navigate(to)` asks mounted editors, then pushes (`{ replace: true }` replaces). `useHashSearch()` reads the query. |
| Workspace hook | `src/hooks/use-workspace-navigation.ts` | List/detail state in the URL: `open`, `create`, `saved`, `close`, desktop auto-selection. |
| Resource selection | `useResourceSelection(ids, param)` in `src/component/resource-workspace.tsx` | The workspace hook for `ResourceWorkspace` pages. |
| Modal layer | `src/hooks/use-history-layer.ts` | Used by `Modal` (default on) and the mobile sidebar drawer. |
| Guard | `src/hooks/navigation-guard.ts` | `navigationBlocker()` (synchronous) and `allowNavigation()` over the existing `NAVIGATION_ATTEMPT` event used by `useCloseGuard`. |

Every entry the app creates carries `history.state = { yuhaiin: 1, index, from,
auto?, closed?, layer?, session }`. `index` gives the direction of a traversal,
`from` the location that pushed the entry.

## URL scheme

The existing hash URLs and deep links are unchanged; each list/detail page owns
one query parameter:

| Page | Open record | New draft |
|---|---|---|
| Outbound nodes `#/docs/group` | `?node=<id>` | `?new=node` |
| Routing rules `#/docs/bypass` | `?rule=<id>` (`?match=&value=` prefilled draft) | `?new=rule` |
| Route lists `#/docs/bypass/list` | `?list=<id>` | `?new=list` |
| DNS resolvers `#/docs/bypass/resolver` | `?resolver=<id>` | `?new=resolver` |
| Selectors `#/docs/group/selectors` | `?selector=<id>` | `?new=selector` |
| Subscriptions `#/docs/group/subscribe` | `?subscription=<name>` | `?new=subscription` |
| Publish `#/docs/group/publish` | `?publish=<name>` | `?new=publish` |
| Inbounds `#/docs/inbound` | `?inbound=<id>` | `?new=inbound` |
| Gateway `#/docs/gateway` | `?gateway=<id>` | — |
| Pages with `PageTabs` | `?tab=<value>` | — |

## What adds history

| Action | History |
|---|---|
| Page change (sidebar, links, `navigate`) | push |
| Open a record, open a new draft | push |
| Open another record from a record | push (Back returns to the previous record) |
| Draft saved | replace (`?new=x` → `?x=<id>`) |
| Desktop auto-selection of the first record | replace, marked `auto` |
| Close a record (in-page Back) | Back when the previous entry is the list, otherwise replace with the list (deep link) |
| Change group/filter, search, paging, sort, tab | replace or local state |
| Open a `Modal` or the mobile drawer | a same-URL layer entry; Back closes it, closing it removes the entry |
| Confirmation dialogs (`ConfirmModal`, `confirmAction`) | none |

Closing a record goes *Back* when it can, so the next system Back leaves the
list instead of reopening the record.

## Unsaved changes

`useCloseGuard` registers editors as before. The store asks them on:

- in-app navigation (`navigate`, `open`, `create`, tabs, group change): before the entry is added;
- Back/Forward (browser, Android): the traversal has already happened, so the
  store traverses back (`history.go(-delta)`) to keep URL and draft together,
  asks, and on approval repeats the traversal. No entry is rewritten, so the
  stack and Forward stay intact. A pending save blocks without asking.
- Back while the discard dialog is open dismisses it ("stay").

In-page Back buttons call `useCloseGuard`'s close (which asks) and then
`close()` with the answer, so they never ask twice.

## Phone tab bar and transitions

Below lg a tab bar (`src/docs/nav/BottomNav.tsx`) links Home, Nodes, Routing and
Connections; **More** opens the navigation drawer, which is a history layer like
before. Tabs navigate with `navigate()` (push, guarded by unsaved-change checks);
none of them adds or replaces entries of its own. The bar hides while a record or
draft parameter from the table above is in the URL below md, while a text field has
focus, and on viewports shorter than 500px.

Below md the directory and the detail share the page scroller. Opening a record
stores the list's scroll offset under its history index and starts the detail at
the top; returning to that entry (in-page Back, system Back or Forward) restores
it.

Page transitions read the same history: a traversal to a lower index animates
backwards, moving into a sub-page forwards and back up to its parent backwards;
other moves follow the sidebar order.

## Android WebView

Handled by the Web UI:

- Back/Forward, gesture and in-page Back are the same history.
- Reload restores the open record, tab and draft-free state from the URL.
- Activity recreation (rotation) keeps the WebView history (verified).
- Entries of modals that were left open by a page change or lost by a reload are skipped.

Android side responsibilities:

- `BackHandler` calls `WebView.goBack()` only while `canGoBack()`; at the first
  entry Back leaves the app as usual.
- Chromium skips entries created without a user gesture in Back
  (history manipulation intervention). App navigation always follows a tap,
  so this only affects programmatic redirects (e.g. the 401 → login replace,
  which uses `replace` and adds no entry anyway).
- After the process is killed, the back stack exists only if the Activity
  restores the WebView state (`WebView.saveState`/`restoreState`, as
  `WebView.kt` does through `rememberSaveable`). A cold start begins a new stack
  at the URL saved by the app.

## Tests

- `src/hooks/navigation.integration.test.tsx`: Home → list → detail → Back,
  A → B → Back, Back/Forward, in-page vs browser Back, deep link, reload, guard
  cancel/approve/dismiss, quick traversals, desktop auto-selection, modal Back,
  orphaned modal entries, deleted records, search, top-level moves, tabs, drafts.
- Page tests for Outbound, Routing, Selectors and Gateway cover their own flows.
- Verified in the Android WebView (API 35 emulator) with real taps and the Back
  key, including rotation.
