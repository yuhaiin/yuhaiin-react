# Routing and setup refactor

Captured from the local MSW preview using synthetic data, with desktop and 390 px
mobile viewports. These images document the rendered layout; they do not prove
network connectivity or accessibility compliance.

Routing uses a 280–300 px rule directory beside the inline simple/advanced editor
on desktop. Below 768 px, selecting a rule opens the editor with a return control.
The desktop opens the first rule by default and keeps the selection after saving.
Switching rules or returning protects unsaved changes; directory pagination keeps
the open draft mounted. Nodes continue to use compact expandable rows.

Validation: 83 tests in 41 files, TypeScript, i18n, lint (existing React warnings),
style audit and production build. Five workspace regression tests cover switching,
mobile return, create/delete activation retries and retaining drafts during page
loads. Isolated Chrome checks additionally cover save/reopen, simple/advanced
switching, creation, toggling then saving, desktop light/dark, and 390/834 px layouts
without horizontal overflow. Synthetic save/apply requests returned 200; no page
errors were recorded.

![Routing workspace](routing-desktop.png)
![Mobile rule directory](routing-mobile.png)
![Nodes](nodes-desktop.png)
![Inline rule editor](rule-editor.png)
![Mobile rule editor](rule-editor-mobile.png)
