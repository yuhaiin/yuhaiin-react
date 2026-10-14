import { waitForPreview } from './preview-ready.mjs';
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
const accents = process.env.VISUAL_ACCENTS?.split(',') || ['olive', 'terracotta', 'plum', 'brass', 'graphite'];
const galleryOnly = process.env.VISUAL_GALLERY_ONLY === '1';
const routes = [
  ['overview', '/', 'section[aria-label="Active Nodes"] li'], ['nodes', '/docs/group', 'section[aria-label="Connection settings"] input'],
  ['selectors', '/docs/group/selectors', 'section[aria-label="Shared destination settings"] input'],
  ['routing', '/docs/bypass', 'section[aria-label="Rule editor"]'], ['dns', '/docs/bypass/resolver', 'section[aria-label="Resolvers"]'],
  ['connections', '/docs/connections/v2', '[aria-label="Refresh connections"]'], ['subscriptions', '/docs/group/subscribe', 'section[aria-label="Subscriptions"]'],
  ['inbounds', '/docs/inbound', 'section[aria-label="Entry Points"]'], ['publish', '/docs/group/publish', 'section[aria-label="Publish Config"]'], ['settings', '/docs/webui', '[role="radiogroup"]'],
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
async function evaluate(send, expression) {
  const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text + ': ' + result.exceptionDetails.exception?.description);
  return result.result?.value;
}
async function pageReady(send, selector) {
  for (let i = 0; i < 100; i++) {
    try { if (await evaluate(send, `Boolean(document.querySelector(${JSON.stringify(selector)}))`)) { await waitForPreview(send, selector); return; } }
    catch (error) { if (!/context|navigat/i.test(String(error))) throw error; }
    await sleep(100);
  }
  throw new Error('No ready state: ' + selector);
}
async function saveShot(send, name) {
  const image = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile(`/tmp/visual-system-shots/${name}.png`, Buffer.from(image.data, 'base64'));
  process.stdout.write('Captured stable ' + name + '\n');
}
async function clickText(send, selector, text, exact = true) {
  const point = await evaluate(send, `(() => { const el = [...document.querySelectorAll(${JSON.stringify(selector)})].find(el => ${exact ? 'el.textContent.trim() ===' : 'el.textContent.includes('} ${JSON.stringify(text)}${exact ? '' : ')'}); if (!el) return null; el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  if (!point) throw new Error('Missing action: ' + text);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
}
async function key(send, value, code) {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: value, code: value, windowsVirtualKeyCode: code });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: value, code: value, windowsVirtualKeyCode: code });
}
async function inspectGallery(send, theme) {
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `http://127.0.0.1:5175/?scenario=normal&gallery=1&inspect=${theme}` });
  await pageReady(send, '[data-gallery-ready]');
  const metrics = await evaluate(send, `(() => { const button = document.querySelector('[data-testid="gallery-primary"]'); const input = document.querySelector('[aria-label="Gallery input"]'); const select = document.querySelector('[aria-label="Gallery select"]'); const icon = document.querySelector('[aria-label="Icon settings"]'); return [button,input,select,icon].map(el => el.getBoundingClientRect().height); })()`);
  if (metrics.join(',') !== '38,38,38,32') throw new Error('Control metrics differ: ' + metrics);
  const point = await evaluate(send, `(() => { const r = document.querySelector('[data-testid="gallery-primary"]').getBoundingClientRect(); return {x: r.x+r.width/2, y:r.y+r.height/2}; })()`);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
  await waitForPreview(send, '[data-gallery-ready]'); await saveShot(send, `${theme}-gallery-hover`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
  await waitForPreview(send, '[data-gallery-ready]'); await saveShot(send, `${theme}-gallery-pressed`);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
  await key(send, 'Tab', 9); await saveShot(send, `${theme}-gallery-focus`);
  await clickText(send, 'button', 'Open dropdown'); await waitForPreview(send, '[role="menu"]'); await saveShot(send, `${theme}-gallery-dropdown`); await key(send, 'Escape', 27);
  await clickText(send, 'button', 'Show toast'); await waitForPreview(send, 'li[data-state="open"]'); await saveShot(send, `${theme}-gallery-toast`);
  await clickText(send, 'button', 'Tooltip trigger'); await waitForPreview(send, '#gallery-tooltip'); await saveShot(send, `${theme}-gallery-tooltip`);
  await clickText(send, 'button', 'Open dialog'); await waitForPreview(send, '[role="dialog"]');
  for (let i = 0; i < 5; i++) { await key(send, 'Tab', 9); if (!await evaluate(send, `document.querySelector('[role="dialog"]').contains(document.activeElement)`)) throw new Error('Focus escaped dialog'); }
  const locked = await evaluate(send, `document.body.hasAttribute('data-scroll-locked')`);
  if (!locked) throw new Error('Dialog did not lock background scrolling');
  await saveShot(send, `${theme}-gallery-dialog`);
  await clickText(send, 'button', 'Open nested dialog'); await waitForPreview(send, '[role="dialog"] [aria-label="Nested select"]');
  await clickText(send, '[aria-label="Nested select"]', 'udp'); await pageReady(send, '[role="listbox"]'); await saveShot(send, `${theme}-gallery-nested-select`);
  await key(send, 'Escape', 27); await pageReady(send, '[data-gallery-ready]'); await key(send, 'Escape', 27);
  await pageReady(send, '[data-gallery-ready]');
  const count = await evaluate(send, `document.querySelectorAll('[role="dialog"]').length`);
  if (count !== 1) throw new Error('Escape did not close only the nested dialog: ' + count);
  await key(send, 'Escape', 27); await pageReady(send, '[data-gallery-ready]');
  if (await evaluate(send, `document.querySelectorAll('[role="dialog"]').length`)) throw new Error('Escape did not close dialog');
  await clickText(send, 'button', 'Open dialog'); await waitForPreview(send, '[role="dialog"]');
  const before = await evaluate(send, `document.scrollingElement.scrollTop`);
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 10, y: 500, deltaX: 0, deltaY: 400 });
  if (await evaluate(send, `document.scrollingElement.scrollTop`) !== before) throw new Error('Background scrolled through dialog');
  await send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 720, y: 600, deltaX: 0, deltaY: 400 });
  await evaluate(send, `new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))`);
  if (!await evaluate(send, `document.querySelector('[role="dialog"] .overflow-y-auto').scrollTop > 0`)) throw new Error('Long dialog content did not scroll');
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 10, y: 10, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 10, y: 10, button: 'left', clickCount: 1 });
  await pageReady(send, '[data-gallery-ready]');
  if (await evaluate(send, `document.querySelector('[role="dialog"]') !== null`)) throw new Error('Overlay click did not close dialog');
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await clickText(send, 'button', 'Open dialog'); await waitForPreview(send, '[role="dialog"]'); await saveShot(send, `${theme}-gallery-dialog-reduced`); await key(send, 'Escape', 27); await pageReady(send, '[data-gallery-ready]');
  await send('Emulation.setEmulatedMedia', { features: [] });
  process.stdout.write('Passed gallery metrics, focus, Escape, overlay, scrolling and reduced motion: ' + theme + '\n');
}
try {
  const send = await connect();
  await send('Page.enable'); await send('Runtime.enable');
  await mkdir('/tmp/visual-system-shots', { recursive: true });
  const results = [];
  for (const theme of ['light', 'dark']) for (const accent of accents) {
    const script = await send('Page.addScriptToEvaluateOnNewDocument', { source: `localStorage.setItem('yuhaiin.theme', ${JSON.stringify(theme)}); localStorage.setItem('yuhaiin.accent', ${JSON.stringify(accent)});` });
    const pages = galleryOnly ? [] : ['olive', 'terracotta', 'graphite'].includes(accent) ? routes : [routes.at(-1)];
    const widths = galleryOnly ? [1440] : accent === 'olive' ? [1440, 390, 320] : [1440];
    for (const width of widths) for (const [name, route, ready] of pages) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: width < 700 ? 844 : 1000, deviceScaleFactor: 1, mobile: width < 700 });
      // Query nonce forces a new document so provider state is initialized from saved settings.
      await send('Page.navigate', { url: `http://127.0.0.1:5175/?scenario=normal&visual=${theme}-${accent}-${name}-${width}#${route}` });
      let loaded = false;
      for (let i = 0; i < 100; i++) {
        try { const state = await send('Runtime.evaluate', { expression: `Boolean(document.querySelector(${JSON.stringify(width < 700 && !['overview', 'connections', 'settings'].includes(name) ? 'aside' : ready)}))`, returnByValue: true }); if (state.result?.value) { loaded = true; break; } } catch { /* New document is loading. */ }
        await sleep(100);
      }
      if (!loaded) throw new Error('Page did not render: ' + name + ' ' + width);
      await waitForPreview(send, width < 700 && !['overview', 'connections', 'settings'].includes(name) ? 'aside' : ready);
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
    // Gallery is an isolated MSW entry, never a production route.
    for (const width of widths) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: width < 700 ? 844 : 1200, deviceScaleFactor: 1, mobile: width < 700 });
      await send('Page.navigate', { url: `http://127.0.0.1:5175/?scenario=normal&gallery=1&visual=${theme}-${accent}-${width}` });
      await pageReady(send, '[data-gallery-ready]');
      await saveShot(send, `${theme}-${accent}-gallery-${width}`);
    }
    if (!galleryOnly && ['olive', 'terracotta', 'graphite'].includes(accent)) {
      await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
      await send('Page.navigate', { url: `http://127.0.0.1:5175/?scenario=normal&visual=picker-${theme}-${accent}#/` });
      await pageReady(send, 'section[aria-label="Active Nodes"] li');
      await clickText(send, 'summary', 'Connection setup', false);
      await clickText(send, 'button', 'Choose node');
      await waitForPreview(send, '[role="dialog"] [role="group"] button[aria-pressed]');
      const dialog = await evaluate(send, `(() => { const el = document.querySelector('[role="dialog"]'); const style = getComputedStyle(el); return {opacity: Number(style.opacity), background: style.backgroundColor}; })()`);
      if (dialog.opacity !== 1 || !dialog.background.startsWith('rgb(')) throw new Error('Nonopaque settled dialog: ' + JSON.stringify(dialog));
      await saveShot(send, `${theme}-${accent}-node-picker`);
    }
    if (accent === 'olive') {
      for (const width of galleryOnly ? [] : [390, 320]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: true });
        await send('Page.navigate', { url: `http://127.0.0.1:5175/?scenario=normal&visual=editor-${theme}-${width}#/docs/group?node=node-0` });
        await pageReady(send, 'section[aria-label="Connection settings"] input');
        await saveShot(send, `${theme}-olive-node-editor-${width}`);
      }
      await inspectGallery(send, theme);
    }
    await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: script.identifier });
  }
  await writeFile('/tmp/visual-system-shots/results.json', JSON.stringify(results, null, 2));
} finally { ws?.close(); chrome.kill('SIGTERM'); }
