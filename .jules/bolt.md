## 2024-05-23 - Stable Callbacks in Frequent Updates
**Learning:** The `Connections` list updates frequently (every second) due to websocket traffic counters. Inline arrow functions for `onClick` props in `ListItem` were breaking `React.memo` optimization, causing the entire list to re-render on every counter update, even for items whose data didn't change.
**Action:** Always use stable callbacks (via `useCallback`) for event handlers passed to memoized components in high-frequency update lists.
