import base from './vite.config.mts';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const bootstrap = '\0virtual:msw-preview';
const fixture = fileURLToPath(new URL('./tests/msw/fixtures.js', import.meta.url));
export default {
  ...base,
  root,
  server: { host: '127.0.0.1', port: 5175, strictPort: true },
  plugins: [...base.plugins, {
    name: 'msw-preview',
    apply: 'serve',
    transformIndexHtml: { order: 'pre', handler(html) {
      return html.replace('src="/src/main.tsx"', 'src="/@id/__x00__virtual:msw-preview"');
    } },
    resolveId(id) { if (id === 'virtual:msw-preview') return bootstrap; },
    load(id) { if (id === bootstrap) { this.addWatchFile(fixture); return fs.readFileSync(fixture, 'utf8'); } },
    handleHotUpdate(context) {
      if (context.file !== fixture) return;
      const module = context.server.moduleGraph.getModuleById(bootstrap);
      if (module) context.server.moduleGraph.invalidateModule(module);
      context.server.ws.send({ type: 'full-reload' });
      return [];
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0] !== '/mockServiceWorker.js') return next();
        res.setHeader('Content-Type', 'application/javascript');
        res.end(fs.readFileSync(new URL('./node_modules/msw/lib/mockServiceWorker.js', import.meta.url)));
      });
    },
  }],
};
