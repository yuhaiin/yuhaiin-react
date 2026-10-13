# Routing and nodes UX refactor

Screenshots were captured from the PR's actual React UI in headless Chrome
with the isolated MSW fixture server. They use synthetic configuration and test
responses, not a running yuhaiin backend. Both desktop (1440 x 1100) and
mobile (390 x 844) were captured after their respective editors appeared in
the DOM. Screenshots do not constitute connectivity or accessibility certification.

## Editing flows

- Routing, Nodes and Shared destinations use the same 280–300 px directory/detail workspace shell.
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

## Validation

Pull-request CI now runs TypeScript checks, Vitest, localization completeness,
the style audit, lint, and the production build. It also captures browser
screenshots from the MSW preview and fails when the expected UI does not
appear, if the page overflows horizontally, or if form controls are clipped.

The follow-up passed 123 tests in 50 files, TypeScript, localization checks,
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
