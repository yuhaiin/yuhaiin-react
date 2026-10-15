# UI documentation and browser captures

Keep design decisions, implementation notes and text reports in Git. Browser screenshots are generated verification artifacts and are not committed under the UI documentation directories.

The [Node.js CI workflow](https://github.com/yuhaiin/yuhaiin-react/actions/workflows/node.js.yml) uploads the current run's screenshots and visual results in the **visual-system** artifact, retained for 14 days. Its job summary links directly to that run's artifact. Download it from the run to inspect:

- `ux-shots`: 18 desktop/mobile directory and editor captures.
- `visual-system-shots`: theme/accent matrix, Gallery interaction states and contrast results.
- `connections-shots`: responsive connection list at six widths in both themes.

To reproduce locally, start `npm run dev:msw`, then run:

```sh
node scripts/capture-ux.mjs
npm run visual:check
node scripts/check-connections.mjs
```

Chrome must be available as `google-chrome`; the visual and connection checks also accept `CHROME_PATH=/path/to/chrome`. Outputs remain under `/tmp/ux-shots`, `/tmp/visual-system-shots` and `/tmp/connections-shots`. Captures use synthetic local MSW data and require no controller configuration.
