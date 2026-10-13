# Routing and setup refactor

Captured from the local MSW preview using synthetic data, with desktop and 390 px
mobile viewports. These images document the rendered layout; they do not prove
network connectivity or accessibility compliance.

Routing uses a 280–300 px rule directory beside the inline simple/advanced editor
on desktop. Below 768 px, selecting a rule opens the editor with a return control.
The desktop opens the first rule by default and keeps the selection after saving.
Switching rules or returning protects unsaved changes; directory pagination keeps
the open draft mounted. Nodes use a compact directory panel beside connection settings, connectivity
checks and default-destination status. Group selection and filtering live in the
panel toolbar; short rows use a thin selection marker and omit repeated avatars.
The directory remains virtualized for large groups.

Validation: 89 tests in 42 files, TypeScript, i18n, lint (existing React warnings),
style audit and production build. Five workspace regression tests cover switching,
mobile return, create/delete activation retries and retaining drafts during page
loads. Isolated Chrome checks additionally cover save/reopen, simple/advanced
switching, creation, toggling then saving, desktop light/dark, and 390/834 px layouts
without horizontal overflow. Synthetic save/apply requests returned 200; no page
errors were recorded. Node workspace checks cover Node 94 search in a 95-node
group, guarded switching/mobile return, custom groups selected with the keyboard,
inline creation/save, TCP testing and updating default TCP/UDP destinations. Six
node workspace tests cover those transitions, a failed deletion retaining the
editor, and retrying a saved node after default selection fails without recreating
it. Saved nodes remain visible in the directory when default selection fails.

![Routing workspace](routing-desktop.png)
![Mobile rule directory](routing-mobile.png)
![Node workspace](nodes-desktop.png)
![Mobile node directory](nodes-mobile.png)
![Mobile node details](node-details-mobile.png)
![Inline rule editor](rule-editor.png)
![Mobile rule editor](rule-editor-mobile.png)
