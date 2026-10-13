# Routing and nodes UX refactor

Screenshots were captured from the PR's actual React UI in headless Chrome
with the isolated MSW fixture server. They use synthetic configuration and test
responses, not a running yuhaiin backend. Both desktop (1440 x 1100) and
mobile (390 x 844) were captured after their respective editors appeared in
the DOM. Screenshots do not constitute connectivity or accessibility certification.

## Editing flows

- Routing and Nodes use the same 280–300 px directory/detail workspace shell.
  Desktop opens an item inline; mobile navigates from directory to editor.
- The simple route editor can represent flat AND/OR combinations of host,
  process, inbound, network, port and GeoIP conditions, plus explicit
  match-all. The advanced editor handles nested expressions and NOT without
  flattening or modifying them. Existing DNS, target and disabled settings
  remain in the canonical draft and are signposted when hidden.
- Shared lists are referenced by stable ID. Private lists belong to the rule,
  and detached owned lists are omitted during save. Action changes preserve
  the previously configured proxy target.
- Rule priority is visible in the directory and can be adjusted by neighboring
  moves without opening a dialog. The dialog remains available for larger
  changes; direct moves are disabled while searching or holding an unsaved draft.
- Node lists keep virtualization and remember drafts while the directory
  filters or switches groups. The node editor uses the same form behavior in
  the modal and inline shells without duplicating the default-destination control.

## Validation

Pull-request CI now runs TypeScript checks, Vitest, localization completeness,
the style audit, lint, and the production build. It also captures browser
screenshots from the MSW preview and fails when the expected UI does not
appear or if the page overflows horizontally.

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
