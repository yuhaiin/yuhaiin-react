import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';

const port = 9229;
const browser = spawn('google-chrome', [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
  '--remote-allow-origins=*', '--remote-debugging-port=' + port,
  '--user-data-dir=/tmp/yuhaiin-ux-browser',
  'about:blank',
], { stdio: 'ignore' });

const base = 'http://127.0.0.1:5175/?scenario=normal#';
const cases = [
  { name: 'routing-desktop', path: '/docs/bypass', width: 1440, height: 1100, match: 'section[aria-label="Rule editor"] [role="group"][aria-label="Rule editor"]' },
  { name: 'rule-editor', path: '/docs/bypass?rule=rule-0', width: 1440, height: 1100, match: 'section[aria-label="Rule editor"] [role="group"][aria-label="Rule editor"]' },
  { name: 'nodes-desktop', path: '/docs/group', width: 1440, height: 1100, match: 'section[aria-label="Connection settings"] input' },
  { name: 'selectors-desktop', path: '/docs/group/selectors', width: 1440, height: 1100, match: 'section[aria-label="Shared destination settings"] input' },
  { name: 'routing-mobile', path: '/docs/bypass', width: 390, height: 844, match: 'aside[aria-label="Rule directory"]' },
  { name: 'rule-editor-mobile', path: '/docs/bypass?rule=rule-0', width: 390, height: 844, match: 'section[aria-label="Rule editor"] [role="group"][aria-label="Rule editor"]' },
  { name: 'nodes-mobile', path: '/docs/group', width: 390, height: 844, match: 'aside[aria-label="Node directory"]' },
  { name: 'node-details-mobile', path: '/docs/group?node=node-0', width: 390, height: 844, match: 'section[aria-label="Connection settings"] input' },
  { name: 'selectors-mobile', path: '/docs/group/selectors', width: 390, height: 844, match: 'aside[aria-label="Shared destinations"]' },
  { name: 'selector-details-mobile', path: '/docs/group/selectors?selector=selector-work', width: 390, height: 844, match: 'section[aria-label="Shared destination settings"] input' },
  { name: 'inbounds-desktop', path: '/docs/inbound', width: 1440, height: 1100, match: 'section[aria-label="Entry Points"] input' },
  { name: 'inbounds-mobile', path: '/docs/inbound', width: 390, height: 844, match: 'aside[aria-label="Entry Points"]' },
  { name: 'lists-desktop', path: '/docs/bypass/list', width: 1440, height: 1100, match: 'section[aria-label="Defined Lists"] input' },
  { name: 'lists-mobile', path: '/docs/bypass/list', width: 390, height: 844, match: 'aside[aria-label="Defined Lists"]' },
  { name: 'publishes-desktop', path: '/docs/group/publish', width: 1440, height: 1100, match: 'section[aria-label="Publish Config"] input' },
  { name: 'publishes-mobile', path: '/docs/group/publish', width: 390, height: 844, match: 'aside[aria-label="Publish"]' },
  { name: 'resolvers-desktop', path: '/docs/bypass/resolver', width: 1440, height: 1100, match: 'section[aria-label="Resolvers"] input' },
  { name: 'resolvers-mobile', path: '/docs/bypass/resolver', width: 390, height: 844, match: 'aside[aria-label="Resolvers"]' },
];

async function readyWebSocket() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch('http://127.0.0.1:' + port + '/json/list');
      const pages = await response.json();
      const page = pages.find(item => item.type === 'page' && item.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* Chrome is still booting. */ }
    await sleep(250);
  }
  throw new Error('Chrome DevTools did not become available');
}

async function main() {
  const url = await readyWebSocket();
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', event => {
    const msg = JSON.parse(event.data);
    if (!pending.has(msg.id)) return;
    const entry = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) entry.reject(new Error(msg.error.message));
    else entry.resolve(msg.result);
  });
  function send(method, params = {}) {
    const messageId = ++id;
    return Promise.race([
      new Promise((resolve, reject) => {
        pending.set(messageId, { resolve, reject });
        ws.send(JSON.stringify({ id: messageId, method, params }));
      }),
      sleep(30000).then(() => { throw new Error('CDP timeout: ' + method); }),
    ]);
  }
  await send('Page.enable');
  await send('Runtime.enable');
  await mkdir('/tmp/ux-shots', { recursive: true });
  for (const shot of cases) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: shot.width, height: shot.height,
      deviceScaleFactor: 1, mobile: shot.width < 700,
      screenWidth: shot.width, screenHeight: shot.height,
    });
    await send('Page.navigate', { url: base + shot.path });
    let loaded = false;
    let detail = '';
    for (let attempt = 0; attempt < 120; attempt++) {
      let result;
      try {
        result = await send('Runtime.evaluate', {
          expression: '({ready: document.readyState, found: Boolean(document.querySelector(' + JSON.stringify(shot.match) + ')), text: document.body?.innerText?.slice(0,200) || ""})',
          returnByValue: true,
        });
      } catch (error) {
        // The JavaScript execution context can disappear while the page is
        // navigating. Retry until the new document is ready.
        if (/navigat|context|target/i.test(String(error))) { await sleep(250); continue; }
        throw error;
      }
      const state = result.result?.value ?? {};
      detail = JSON.stringify(state);
      if (state.found) { loaded = true; break; }
      await sleep(250);
    }
    if (!loaded) throw new Error('Preview did not render ' + shot.name + ': ' + detail);
    const layout = await send('Runtime.evaluate', {
      expression: '({viewport: document.documentElement.clientWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth})',
      returnByValue: true,
    });
    const size = layout.result?.value;
    if (!size || Math.max(size.document, size.body) > size.viewport + 1) {
      throw new Error('Horizontal page overflow in ' + shot.name + ': ' + JSON.stringify(size));
    }
    const fields = await send('Runtime.evaluate', {
      expression: '(() => { const match = document.querySelector(' + JSON.stringify(shot.match) + '); const scope = match.closest("section") || match; return [...scope.querySelectorAll("input,button[role=combobox],button[aria-haspopup=dialog]")].filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.left < -1 || r.right > innerWidth + 1); }).map(el => el.getAttribute("aria-label") || el.tagName); })()',
      returnByValue: true,
    });
    if (fields.result?.value?.length) {
      throw new Error('Clipped form controls in ' + shot.name + ': ' + JSON.stringify(fields.result.value));
    }
    if (shot.name === 'rule-editor') {
      const action = await send('Runtime.evaluate', {
        expression: "(() => { const b = [...document.querySelectorAll('button')].find(el => el.textContent?.trim() === 'Advanced editor'); if (!b) return false; b.click(); return true; })()",
        returnByValue: true,
      });
      if (action.result?.value !== true) throw new Error('Could not open advanced rule editor');
    }
    await sleep(1000);
    const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    if (!result.data) throw new Error('Chrome returned no image for ' + shot.name);
    await writeFile('/tmp/ux-shots/' + shot.name + '.png', Buffer.from(result.data, 'base64'));
    process.stdout.write('Captured ' + shot.name + ' (' + shot.width + 'x' + shot.height + ')\n');
  }
  ws.close();
}

try {
  await main();
} finally {
  browser.kill('SIGTERM');
}
