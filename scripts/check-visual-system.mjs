// Uses the same isolated Chrome/MSW setup as capture-ux, with no extra dependency.
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
const chrome = spawn(process.env.CHROME_PATH || 'google-chrome', ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--no-first-run', '--hide-scrollbars', '--remote-allow-origins=*', '--remote-debugging-port=9231', '--user-data-dir=/tmp/yuhaiin-visual-browser', 'about:blank'], { stdio: 'ignore' });
let ws;
async function connect() {
  for (let i = 0; i < 80; i++) {
    try {
      const pages = await (await fetch('http://127.0.0.1:9231/json/list')).json();
      const url = pages.find(page => page.type === 'page')?.webSocketDebuggerUrl;
      if (url) { ws = new WebSocket(url); await new Promise(resolve => ws.addEventListener('open', resolve, { once: true })); break; }
    } catch { /* Chrome is starting. */ }
    await sleep(100);
  }
  if (!ws) throw new Error('Chrome did not start');
  let nextId = 0;
  const pending = new Map();
  ws.addEventListener('message', ({ data }) => { const message = JSON.parse(data); const entry = pending.get(message.id); if (entry) { pending.delete(message.id); if (message.error) entry.reject(new Error(message.error.message)); else entry.resolve(message.result); } });
  return (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 30000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
const accents = ['olive', 'terracotta', 'plum', 'brass', 'graphite'];
const routes = [
  ['overview', '/', 'summary'], ['nodes', '/docs/group', 'section[aria-label="Connection settings"] input'],
  ['routing', '/docs/bypass', 'section[aria-label="Rule editor"]'], ['dns', '/docs/bypass/resolver', 'section[aria-label="Resolvers"]'],
  ['connections', '/docs/connections/v2', '[aria-label="Refresh connections"]'], ['subscriptions', '/docs/group/subscribe', 'section[aria-label="Subscriptions"]'],
  ['inbounds', '/docs/inbound', 'section[aria-label="Entry Points"]'], ['settings', '/docs/webui', '[role="radiogroup"]'],
];
// Resolve CSS colors through the browser, including color-mix and semantic aliases.
function measureContrast() {
  const probe = document.createElement('span'); document.body.append(probe);
  const color = token => { probe.style.color = `var(${token})`; const value = getComputedStyle(probe).color; const numbers = value.match(/[\d.]+/g).map(Number); if (value.startsWith('color(srgb')) return numbers.slice(0, 3); return numbers.slice(0, 3).map(n => n / 255); };
  const luminance = rgb => rgb.map(n => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4).reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (a, b) => { const x = luminance(color(a)), y = luminance(color(b)); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const checks = [];
  for (const background of ['--canvas', '--surface', '--surface-muted', '--surface-raised']) {
    for (const foreground of ['--text-primary', '--text-secondary', '--text-tertiary']) checks.push([foreground, background, 4.5]);
    checks.push(['--accent', background, 4.5], ['--border-strong', background, 3]);
  }
  for (const background of ['--accent', '--accent-hover', '--accent-active']) checks.push(['--accent-foreground', background, 4.5]);
  checks.push(['--accent', '--accent-soft', 4.5], ['--color-danger-foreground', '--color-danger', 4.5]);
  for (const tone of ['success', 'warning', 'danger', 'info']) checks.push([`--color-${tone}`, `--color-${tone}-soft`, 4.5]);
  const result = checks.map(([foreground, background, minimum]) => ({ foreground, background, minimum, ratio: ratio(foreground, background) }));
  probe.remove(); return result;
}
try {
  const send = await connect();
  await send('Page.enable'); await send('Runtime.enable');
  await mkdir('/tmp/visual-system-shots', { recursive: true });
  const results = [];
  for (const theme of ['light', 'dark']) for (const accent of accents) {
    const script = await send('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('yuhaiin.theme', ${JSON.stringify(theme)}); localStorage.setItem('yuhaiin.accent', ${JSON.stringify(accent)});` });
    const pages = accent === 'olive' ? routes : [routes[7]];
    for (const width of accent === 'olive' ? [1440, 390] : [1440]) for (const [name, route, ready] of pages) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: width === 390 ? 844 : 1000, deviceScaleFactor: 1, mobile: width === 390 });
      // Query nonce forces a new document so provider state is initialized from saved settings.
      await send('Page.navigate', { url: `http://127.0.0.1:5175/?scenario=normal&visual=${theme}-${accent}-${name}-${width}#${route}` });
      let loaded = false;
      for (let i = 0; i < 100; i++) {
        try { const state = await send('Runtime.evaluate', { expression: `Boolean(document.querySelector(${JSON.stringify(width === 390 && !['overview', 'connections', 'settings'].includes(name) ? 'aside' : ready)}))`, returnByValue: true }); if (state.result?.value) { loaded = true; break; } } catch { /* New document is loading. */ }
        await sleep(100);
      }
      if (!loaded) throw new Error('Page did not render: ' + name + ' ' + width);
      await sleep(350);
      const evaluation = await send('Runtime.evaluate', { expression: `({theme: document.documentElement.dataset.bsTheme, accent: document.documentElement.dataset.accent, width: innerWidth, overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > innerWidth + 1, clipped: [...document.querySelectorAll('main input,main textarea,main button[role=combobox]')].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.left < -1 || r.right > innerWidth + 1); }).map(el => el.getAttribute('aria-label') || el.tagName), contrast: (${measureContrast.toString()})()})`, returnByValue: true });
      const state = evaluation.result?.value;
      if (!state || state.theme !== theme || state.accent !== accent || state.overflow || state.clipped.length) throw new Error('Invalid theme/layout: ' + JSON.stringify(state));
      const failures = state.contrast.filter(check => check.ratio < check.minimum);
      if (failures.length) throw new Error(`${theme}/${accent} contrast: ${JSON.stringify(failures)}`);
      results.push({ theme, accent, name, width, minimumTextContrast: Math.min(...state.contrast.filter(check => check.minimum === 4.5).map(check => check.ratio)) });
      const image = await send('Page.captureScreenshot', { format: 'png' });
      await writeFile(`/tmp/visual-system-shots/${theme}-${accent}-${name}-${width}.png`, Buffer.from(image.data, 'base64'));
      process.stdout.write(`Verified ${theme}/${accent}/${name}/${width}\n`);
    }
    await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: script.identifier });
  }
  await writeFile('/tmp/visual-system-shots/results.json', JSON.stringify(results, null, 2));
} finally { ws?.close(); chrome.kill('SIGTERM'); }
