# Connections layout and modal motion

Screenshots use local MSW data, including long destination/exit names, a ten-digit ID and independent TB counters. They contain no controller data.

Generated screenshots are stored in the CI `visual-system` artifact. See [capture instructions](../README.md).

`CHROME_PATH=/path/to/chrome node scripts/check-connections.mjs` checks 320, 390, 767, 768, 1440 and 1920px in both themes against the running `npm run dev:msw` preview. It verifies column alignment, aligned grids with scrollbar gutters, top spacing, visible shared exits, touch targets, independent traffic sorting, native keyboard/touch details, long address wrapping, virtual scroll continuity, small/empty lists and the original 0.2-to-1 spring bounce/origin, visible 200ms shrink-back exits via Escape/close button/overlay and reduced motion. CI uploads all twelve screenshots.

Desktop left-aligns text columns (ID, destination, mode, protocol, shared exit) and right-aligns the traffic counters, for both headings and content, so values can be scanned and compared. Below 1280px a shared exit appears below its address; below 768px traffic and mode/protocol occupy a separate line with a 92px virtual row height. Long values truncate in the directory and remain complete in the detail dialog.
