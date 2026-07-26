# Design QA

## Scope

- Reference: `/Users/asutorufa/.codex/generated_images/019f98bd-2443-78b2-b72a-4a8d5aca11a2/exec-afdd6b5a-9905-481e-99ae-f3d5fdd42557.png`
- Implementation: `http://localhost:4177/?api=http%3A%2F%2F127.0.0.1%3A50051`
- Viewport: 1440 x 1024
- Real data: `http://127.0.0.1:50051`; preview data: MSW, enabled only by the `mock=1` development query parameter

## Visual comparison

The implementation was reviewed against the reference capture at the same desktop viewport. The primary visual relationships are preserved:

- white content canvas with a quiet gray-blue surface system;
- compact left navigation with a clear Home entry;
- protected-status hero card as the first content block;
- network map as the main interaction surface;
- recent activity as a low-density, scannable list;
- blue, mint, and lilac accents used for action, health, and traffic direction.

The implementation intentionally uses the existing icon and component system instead of introducing new bitmap assets. The map is rendered as responsive HTML/CSS cards and connectors so it remains interactive and accessible.

## Interaction checks

- Add connection opens a choice dialog.
- “Connect a device” changes the selected state.
- “Start setup” advances to the guided setup state.
- The setup dialog can be closed.
- “View full map” expands the map detail panel and exposes Manage.
- Home “Manage network”, “All activity”, and “View all activity” navigate to their corresponding controller pages.
- Home activity rows are populated from `/api/v2/connections`; controller upload/download totals are populated from the flow endpoint.
- Home Live traffic keeps a rolling sample buffer from flow polling, so the mini chart and Traffic overview are no longer rendered from an empty placeholder series.
- Traffic range buttons switch between live polling and stored controller history; the stored ranges call `/api/v2/connections/traffic`.
- Traffic breakdown restores the controller telemetry view and shows the highest-traffic destinations, source addresses, inbound entries, and outbound nodes.
- The home traffic breakdown now promotes a ranked Top addresses / Top destinations panel, with per-row download/upload totals and proportional bars, instead of burying the old traffic ranking inside generic dimension cards.
- Dark-theme search fields no longer use the white inset top highlight; focus state is represented by a restrained blue ring only.
- Text fields, textareas, Select triggers, grouped inputs, password fields, and range fields now share the same flat surface, border, radius, and focus-ring treatment; the previous bright inset highlight is removed from the shared field layer.
- The home traffic breakdown now keeps both ranked views visible: Top addresses and Top destinations are separate panels, followed by the remaining controller dimensions.
- Network resources, traffic history, rule resources, diagnostics, backups, logs, documents, licenses, About, and Web UI now expose their context through a compact, dismissible page-guide popover, keeping the main content in a spacious single-column workspace.
- Node editing now has a clearer identity block, protocol path preview, and visually separated add-step area so “Add node” is a guided flow rather than a long undifferentiated form.
- Loading, error, toast, iframe, and login states use the same surface language as the application shell instead of falling back to legacy Bootstrap-like treatments.
- The login layout stacks before tablet widths so the product message cannot be covered by the form card.
- US West can be selected as a route and receives the selected state.
- 24h changes the traffic range and receives the selected state.
- Sidebar Network map navigation uses the hash-route query and scrolls toward the map.
- Home setup continues to the outbound or inbound editor route based on the selected mode.
- Outbound “New” opens a connection-template picker, and the SOCKS5 template opens the node editor with a visible protocol path.
- Inbound “Add” opens an entry-point-template picker, and the SOCKS5 template opens the inbound editor with a prefilled listen/protocol setup.
- Browser console errors: none observed.

## Real API checks

The historical checks below document an earlier controller session. The latest local probe did not find a listener at `127.0.0.1:50051`, so current screenshots were taken with `?mock=1` and are not presented as real-controller evidence.

- The earlier real-controller session returned 49 outbound nodes, 4 inbounds, 5 resolvers, live connection telemetry, history, routing rules, lists, tags, logs, settings, and system information.
- Switching from `?mock=1` to `?api=http%3A%2F%2F127.0.0.1%3A50051` was checked in the same browser session; the node list changed from mock data to the controller’s 49 nodes, confirming MSW no longer intercepts real mode.
- Mock live connections now use a visible fixed-height virtual list with three sample sessions and polling fallback; the live chart records a rolling sample of the flow poll instead of rendering an intentional empty series.
- The Network map labels its source as `Preview data` or `Live API data` and explains that it is a logical path assembled from the selected inbound and outbound, not a packet-level topology graph.
- The earlier Home route was checked against `127.0.0.1:50051`: the inbound, selected outbound nodes, active connections, controller totals, and source badge changed to controller data; the zero-rate state was preserved when the controller had no live delta.
- Home telemetry calls `/api/v2/connections/telemetry`; mock telemetry includes destination and address rankings so the breakdown is testable without inventing data in the component.
- History, failed connections, and live connections expose their live counts, stream state, observed protocols, latest activity, and sorting context in page-level summary strips.
- MSW mutations for nodes, inbounds, route lists, settings, inbound settings, routing settings, list settings, and resolver settings now persist within the preview session so save/toggle flows can be verified end-to-end.
- Route-list preview data now uses the controller's seconds-based timestamp and interval shape; the list settings card no longer renders `Invalid Date` or `NaN` in preview mode.
- The running controller reports a July 18 build. Its user endpoint returns `405`, so User management now shows an explicit controller-capability error instead of an ambiguous empty state. The repository backend at commit `80677e39` contains the newer user RPC and should be rebuilt/restarted when that page is needed.

## Extended route matrix

With `?mock=1`, the following routes rendered with a main surface, no loading state after data settled, and no browser console errors: Outbound, Subscriptions, Publish, Active connections, Inbound, Users, Routing, Lists, Tags, DNS resolver, Route test, Block history, Connections, Connection History, Failed Connections, Config, Backup, Logs, Pprof, Documents, Licenses, About, and Web UI.

## Verification

- `npm run build`: passed
- `npm run test`: passed (2 tests)
- `git diff --check`: passed
- `npm run style:audit`: completed; the report still includes legacy inline/arbitrary/hardcoded style counts across the repository.
- Targeted ESLint on changed TypeScript files: 0 errors, existing React effect/fast-refresh warnings only
- Full ESLint: existing generated-contract namespace errors remain outside this design work; the only new issue in the Home page was an unused import and it was removed.
- Mock route matrix: 24 primary routes rendered with a main surface (or the standalone login surface), without settled runtime error copy; representative screenshots covered Home, Outbound, Subscriptions, History, Route lists, Settings, and Live connections.
- Real API: not re-run in the latest pass because `127.0.0.1:50051` was not listening; the historical Home, Live connections, and Inbound checks remain documented above.

## Findings

- The sidebar retains every route from the original route table and groups them by network building, traffic decisions, and workspace tools.
- Outbound, subscriptions, publish configs, active connections, live connections, users, and shared connection detail surfaces now use the same page-header, surface, spacing, and empty/error-state language.
- Some legacy navigation labels still pass through the app’s existing locale/translation behavior; this is an existing i18n behavior, not a missing route.

## Latest pass note

The latest pass rechecked the in-app browser at 1280 x 720 against the mock routes. Home now shows separate Top addresses and Top destinations rankings; Outbound, Subscriptions, History, Route lists, Settings, and Live connections all use the light consumer-facing visual system; the focused node search field is flat with a restrained accent ring instead of the bright inset highlight from the supplied screenshot. The resource pages now keep their guidance in a compact, manually dismissible page-guide popover that still links to adjacent tasks.

The shell probe on July 25, 2026 found no listener at `127.0.0.1:50051`, so real-backend behavior was not claimed as part of this pass; the mock route matrix and interaction checks are current, while the real API checks above remain historical evidence.
