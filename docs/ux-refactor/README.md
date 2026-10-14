# Routing and nodes UX refactor

Screenshots were captured from the PR's actual React UI in headless Chrome
with the isolated MSW fixture server. They use synthetic configuration and test
responses, not a running yuhaiin backend. Both desktop (1440 x 1100) and
mobile (390 x 844) were captured after their respective editors appeared in
the DOM. Screenshots do not constitute connectivity or accessibility certification.

## Editing flows

- Routing, Nodes, Shared destinations, Traffic entry, Shared matching data, Node publishing and DNS resolvers use the same 280–300 px directory/detail workspace shell.
  Desktop opens an item inline; mobile navigates from directory to editor.
- The simple route editor can represent flat AND/OR combinations of host,
  process, inbound, network, port and GeoIP conditions, plus explicit
  match-all. The advanced editor handles nested expressions and NOT without
  flattening or modifying them. Existing DNS, target and disabled settings
  remain in the canonical draft and are signposted when hidden.
- Shared lists are referenced by stable ID. Private lists belong to the rule,
  and detached owned lists are omitted during save. Action changes preserve
  the previously configured proxy target. Switching a condition between private
  and shared lists preserves its private input until the draft is saved.
  Removing an AND condition retains AND when more conditions are added later.
- Rule priority is visible in the directory. Drag its leading handle to insert
  a rule before or after another rule on the current page. On touch screens,
  hold the handle for 400 ms before dragging; ordinary swipes still scroll.
  Dragging near the directory edges scrolls it, and Escape cancels the drag.
  Arrow keys on a focused handle move to adjacent positions, including across
  page boundaries. Direct moves are disabled while searching or holding an
  unsaved draft. Enabling or disabling a rule is edited with its other settings
  in the simple or advanced editor; the directory only displays its status.
- Node lists keep virtualization and remember drafts while the directory
  filters or pages; changing groups guards unsaved edits. Nodes load group
  summaries first, then the selected group in pages of 80 with server search.
  The node editor uses the same form behavior in
  the modal and inline shells without duplicating the default-destination control.
- Destination, selector, node-set and publish pickers no longer fetch all nodes.
  Opening a picker loads group summaries and one page of up to 40 candidates.
  Names outside the current page are resolved by ID. A selected node is retained
  when paging or searching. Shared destinations use compact rows beside their
  inline editor, with the same guarded mobile directory/editor flow.
- The backend node listing reads SQL pages directly, including requests without
  a group. An omitted page size defaults to 100 and every page is capped at 100.
  Group summaries do not decode node contracts. Internal runtime loading is
  unaffected by these API bounds.
- Generated route resolution prefers literal paths over placeholders. This fixes
  block history being sent to `route.rule.get` with ID `block-history`.

## Navigation and shared editors

The sidebar groups Overview/Connections, traffic configuration, and system
management in that order. Connection records include blocked traffic; publishing
and active nodes belong to Destinations; logs and performance analysis belong to
Diagnostics. Settings and Help have separate groups. Navigation expands the active
group and collapses other groups; manual expansion remains possible until the next
navigation. All 24 existing routes remain available.

`ResourceWorkspace` owns directory rows, search, paging, empty selection, and mobile
visibility. `useResourceSelection` keeps selection independent of the current page
or filter and uses the existing draft/pending guards before switching. The shared
`ResourceEditorFrame` presents the existing forms inline or in quick-create dialogs;
forms continue to own their validation, save/delete APIs, and route activation.
Traffic entry, Shared matching data, Node publishing, DNS resolvers and Shared
destinations use this directory controller. Inbound runtime status and traffic
statistics are shown beside the entry's configuration.

Detail switches use a local animation context, a 180 ms fade with a 4 px movement,
and a shared selection marker. This context prevents the outer page animation's
initial setting from suppressing item transitions. Reduced-motion preferences
are observed live. Selecting a loaded node supplies its contract directly to the
editor, eliminating the redundant detail request and intermediate spinner.

Browser checks exercised editing, draft protection, save retention, creation,
deletion, mobile return, the publish node picker's 40-item page, and five consecutive
node switches with no detail RPCs. Normal-motion sampling progressed from opacity
0.68 to 0.89 to 1; reduced-motion sampling remained at opacity 1 with no transform.
CI captures 20 desktop/mobile states and checks page and form-control bounds.

## GeoIP countries and DNS diagnostics

Both simple and advanced route editors use the same searchable country picker.
It lists codes from the currently applied MMDB, with localized country names,
multiple selection, and manual code entry. Existing custom or removed codes remain
editable. The catalog loads when the picker opens and revalidates on reopening.
The backend enumerates unique records once per database instance and returns an
owned copy of the cached codes. A successful snapshot replacement replaces that
cache; a failed application continues to expose the previous database.

DNS opens directly to the resolver workspace. Separate tabs contain query policy,
listening/overrides, and cache, so the directory/editor no longer interrupts one
long settings page. Leaving a tab observes the existing unsaved/pending guards;
arrow keys move tab focus, and Enter/Space activate it.

Each resolver editor includes a test panel with an editable domain (default
`example.com`) and record type (default `A`). Choices come from the backend DNS
library registry, with A/AAAA/HTTPS/TXT/MX first. Message metadata and zone transfers
are excluded. The test uses the displayed draft without saving it, creates a fresh
client, and shows response records, RCODE, truncation, elapsed time, or a diagnostic
error. It supports cancellation and a 10-second backend query timeout. Bootstrap
uses its normal direct routing behavior; other resolvers use the existing DNS
routing dialer. Testing does not replace active resolver configuration.

Isolated Chrome checks verified country selection in both editor depths and the
saved `CN,JP` value, Japanese country search, unsaved DNS draft queries, TXT and
HTTPS type selection, error display, guarded tab changes, and 390/320 px form
bounds. A loopback UDP server separately verified real wire queries and cache
bypass. That test uncovered an existing UDP response notification race; the
response is now published before waiting queries are notified.

## Navigation, subscriptions, active nodes and Hosts

The sidebar and page slide transitions now use one navigation definition. The
route matching registry no longer determines animation direction. A regression
checks the rendered 24-link sidebar order against the animation order and every
registered route; Chrome checks verify downward/upward transitions and reduced
motion on the actual pages.

Active nodes use compact two-line connection tiles, grouping name, source group,
protocol chain, details and termination in the same area. The full ID remains in
the details tooltip. Columns adapt to container width instead of stretching a
fixed three-column layout across wide screens. The same cards
are used on the overview without a second page heading. Termination still
requires confirmation and closes only the selected running instance.

Subscriptions use the shared directory/editor workspace, including guarded mobile
return and unsaved edits. The directory shows the source hostname or import scheme
instead of a full URL. Copy is an explicit action in the editor. Existing names
remain stable; URL and format can be edited, and duplicate new names are rejected.
Fetching subscription nodes uses saved settings and is disabled until draft edits
have been saved. A save sends just the edited subscription, preserving the others.

Hosts have their own DNS tab with searchable, paginated rows and a single-mapping
editor. The UI requests 20 entries per page. SQL performs counting, filtering and
LIMIT/OFFSET; the API defaults to 25 entries and caps pages at 100. Creating,
updating and deleting affect only the selected SQL row, preserve other pages,
and refresh the runtime matching snapshot after persistence. The full snapshot
remains an internal activation/startup operation and a legacy configuration API;
the new browser view never fetches it. Mutations invalidate cached directory pages,
including when deleting the last record on a page requires moving back a page.
On narrow screens the active DNS tab stays visible without scrolling the page.

Browser checks use 10,000 synthetic Hosts to verify 20-entry pages, search and a
single-entry update, with no full Hosts RPC. They also check subscription editing,
confirmation on switching, saved-link fetching, active instance termination, and
390/320 px page/control bounds. SQL/store/runtime and RPC tests run with both
modernc and mattn/FTS5; concurrent entries, alias targets, port-specific mappings,
duplicate creation and pagination bounds are covered.

## Validation

Pull-request CI now runs TypeScript checks, Vitest, localization completeness,
the style audit, lint, and the production build. It also captures browser
screenshots from the MSW preview and fails when the expected UI does not
appear, if the page overflows horizontally, or if form controls are clipped.

The current follow-up passed 140 tests in 57 files, TypeScript, localization checks,
strict lint with no warnings, the style audit and the production build. Isolated
Chrome interaction checks covered mouse insertion, native touch scrolling,
long-press touch insertion, edge scrolling and cancellation without a save.
The 10,000-node fixture confirmed one 80-node directory page on initial load,
no candidate prefetch on Shared destinations, and 40-node picker pages with
server-side group search. Japanese search buttons retain one line on mobile.
Go API/storage tests pass with both SQLite backends; a malformed contract on an
unrequested page proves node listing does not eagerly decode every record.

Run `npm run dev:msw` and then `node scripts/capture-ux.mjs` to create
screenshots at `/tmp/ux-shots` on a Linux environment with Chrome available
on the path. CI shows the committed reference screenshots inline in the GitHub Actions
job summary. The current run's captured PNGs are used for validation only and
are not uploaded as a separate screenshot artifact. When the UI changes, refresh
the screenshots committed under `docs/ux-refactor/` so the summary stays current.

## Screenshots

**Routing directory and simple editor**

![Routing workspace](routing-desktop.png)

**Advanced rule editor**

![Advanced editor](rule-editor.png)

**Node directory and details**

![Node workspace](nodes-desktop.png)

**Mobile routing directory**

![Mobile rule directory](routing-mobile.png)

**Mobile rule editor**

![Mobile rule editor](rule-editor-mobile.png)

**Mobile node directory and details**

![Mobile node directory](nodes-mobile.png)

![Mobile node details](node-details-mobile.png)

**Shared destinations on desktop and mobile**

![Shared destinations](selectors-desktop.png)

![Japanese dark shared destinations](selectors-ja-dark-desktop.png)

![Mobile shared destinations](selectors-mobile.png)

![Mobile shared destination editor](selector-details-mobile.png)

**Japanese mobile node browser**

![Lazy node browser](node-picker-ja-mobile.png)

**Shared configuration workspaces**

| Page | Desktop | Mobile directory |
| --- | --- | --- |
| Traffic entry | ![Entry workspace](inbounds-desktop.png) | ![Entry directory](inbounds-mobile.png) |
| Matching data | ![List workspace](lists-desktop.png) | ![List directory](lists-mobile.png) |
| Publishing | ![Publish workspace](publishes-desktop.png) | ![Publish directory](publishes-mobile.png) |
| DNS resolvers | ![Resolver workspace](resolvers-desktop.png) | ![Resolver directory](resolvers-mobile.png) |

![Japanese dark publishing workspace](publishes-ja-dark.png)

**GeoIP country selection**

![Country picker](country-picker-desktop.png)

![Japanese mobile country picker](country-picker-ja-mobile.png)

**Resolver queries**

![Unsaved resolver test](resolver-test-desktop.png)

![Japanese mobile resolver test](resolver-test-ja-mobile.png)

**Active nodes and subscriptions**

![Active nodes](active-nodes-desktop.png)

![Japanese mobile active nodes](active-nodes-ja-mobile.png)

![Subscription workspace](subscriptions-desktop.png)

![Japanese mobile subscription editor](subscription-ja-mobile.png)

**SQL-paged Hosts**

![Hosts directory](hosts-desktop.png)

![Japanese mobile Hosts](hosts-ja-mobile.png)

## Home spacing and compact connection tiles

The homepage uses content height rather than a fixed-height flex column. This
keeps its contents inside the route scroller's existing bottom padding. Browser
checks measured approximately 20 px of trailing space at 1440, 2560, 390 and
320 px widths. CI now checks home desktop/mobile bottom spacing as part of its
20 captures.

Active tiles are 70 px tall in these fixtures. Names and group/protocol metadata
share two lines beside a node icon and running indicator. Details and confirmed
termination remain available; touch controls retain a 44 px target.

![Home connection section](home-active-section.png)

![Home bottom spacing](home-desktop.png)

![Mobile home bottom spacing](home-mobile.png)
