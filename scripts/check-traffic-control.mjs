// Paired backend/UI integration in disposable data and browser directories.
// Build dist and provide TRAFFIC_BACKEND=/absolute/path/to/yuhaiin first.
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, open, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { waitForPreview } from './preview-ready.mjs';

const binary = process.env.TRAFFIC_BACKEND;
if (!binary)
  throw new Error(
    'Set TRAFFIC_BACKEND to the paired backend binary; build the frontend first.',
  );
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scratch = await mkdtemp(join(tmpdir(), 'yuhaiin-traffic-ui-'));
const artifacts = process.env.ARTIFACT_DIR || join(scratch, 'screenshots');
await mkdir(artifacts, { recursive: true });
async function freePort() {
  const socket = createServer();
  socket.listen(0, '127.0.0.1');
  await once(socket, 'listening');
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  return port;
}
const backendPort = await freePort();
const chromePort = await freePort();
const base = `http://127.0.0.1:${backendPort}`;
const log = await open(join(scratch, 'processes.log'), 'w');
const server = spawn(
  binary,
  [
    'run',
    '-host',
    `127.0.0.1:${backendPort}`,
    '-path',
    join(scratch, 'state'),
    '-eweb',
    join(project, 'dist'),
  ],
  {
    stdio: ['ignore', log.fd, log.fd],
    env: { ...process.env, EXTERNAL_WEB: join(project, 'dist') },
  },
);
let chrome, ws, browserSend, browserEvaluate;
const checks = [];
async function rpc(operation, body = {}) {
  const response = await fetch(`${base}/api/v2/rpc/${operation}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok)
    throw new Error(
      `${operation}: ${response.status} ${await response.text()}`,
    );
  return response.json();
}
async function until(predicate, name, timeout = 10000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await sleep(50);
  }
  throw new Error(`Timed out: ${name}`);
}
async function stop(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([once(child, 'exit'), sleep(3000)]);
  if (child.exitCode === null && child.signalCode === null)
    child.kill('SIGKILL');
}
try {
  await until(async () => {
    if (server.exitCode !== null)
      throw new Error(`Backend exited; see ${scratch}/processes.log`);
    try {
      await rpc('traffic_control.get');
      return true;
    } catch {
      return false;
    }
  }, 'backend startup');
  // All mutations target this script's fresh state directory. Never reuse an
  // existing service or load a user's profile, database, cookies or credentials.
  for (const inbound of (await rpc('inbounds.get')).items)
    await rpc('inbound.put', { ...inbound, enabled: false });
  for (let n = 1; n <= 205; n++) {
    const suffix = String(n).padStart(3, '0');
    await rpc('inbounds.post', {
      id: `tc-e2e-inbound-${suffix}`,
      name: `TC Entry ${suffix}`,
      enabled: false,
      network: {
        type: 'tcp_udp',
        tcp_udp: { host: '127.0.0.1:0', udp: 'tcp_only' },
      },
      protocol: { type: 'mixed', mixed: {} },
      transports: [],
    });
    await rpc('route.rules.post', {
      rule: {
        id: `tc-e2e-rule-${suffix}`,
        name: `TC Rule ${suffix}`,
        disabled: true,
        mode: 'direct',
        target: { type: 'default' },
        rules: [{ type: 'network', network: { network: 'tcp' } }],
      },
      lists: [],
    });
  }
  chrome = spawn(
    process.env.CHROME_PATH || '/opt/google/chrome/chrome',
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check',
      `--remote-debugging-port=${chromePort}`,
      `--user-data-dir=${join(scratch, 'chrome')}`,
      'about:blank',
    ],
    { stdio: ['ignore', log.fd, log.fd] },
  );
  let target;
  await until(async () => {
    try {
      target = (
        await (await fetch(`http://127.0.0.1:${chromePort}/json/list`)).json()
      ).find((item) => item.type === 'page');
      return Boolean(target);
    } catch {
      return false;
    }
  }, 'Chrome startup');
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await once(ws, 'open');
  let nextId = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === 'Runtime.exceptionThrown')
      errors.push(message.params.exceptionDetails.text);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timer);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`Chrome timeout: ${method}`));
      }, 15000);
      pending.set(id, { resolve, reject, timer });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails)
      throw new Error(
        result.exceptionDetails.exception?.description ||
          result.exceptionDetails.text,
      );
    return result.result?.value;
  };
  browserSend = send;
  browserEvaluate = evaluate;
  const visible = (selector) =>
    evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`);
  async function click(expression) {
    const point = await evaluate(
      `(async()=>{const el=${expression};if(!el)throw new Error('Missing click target');el.scrollIntoView({block:'center'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const box=el.getBoundingClientRect();if(!box.width||!box.height)throw new Error('Click target is hidden');return{x:box.x+box.width/2,y:box.y+box.height/2}})()`,
    );
    await send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      button: 'left',
      clickCount: 1,
      ...point,
    });
    await send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      button: 'left',
      clickCount: 1,
      ...point,
    });
  }
  const element = (selector) =>
    `document.querySelector(${JSON.stringify(selector)})`;
  const button = (text) =>
    `[...document.querySelectorAll('button')].find(el=>el.textContent.trim()===${JSON.stringify(text)})`;
  async function fill(selector, text, characterByCharacter = false) {
    await click(element(selector));
    await send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'a',
      code: 'KeyA',
      windowsVirtualKeyCode: 65,
      nativeVirtualKeyCode: 65,
      modifiers: 2,
    });
    await send('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key: 'a',
      code: 'KeyA',
      windowsVirtualKeyCode: 65,
      nativeVirtualKeyCode: 65,
      modifiers: 2,
    });
    for (const part of characterByCharacter ? [...text] : [text])
      await send('Input.insertText', { text: part });
  }
  async function choose(label, value) {
    await click(element(`[role="combobox"][aria-label="${label}"]`));
    await until(() => visible('[role="option"]'), 'profile options');
    await click(
      `[...document.querySelectorAll('[role="option"]')].find(el=>el.textContent.trim()===${JSON.stringify(value)})`,
    );
    await until(
      async () => !(await visible('[role="option"]')),
      'profile menu close',
    );
  }
  async function nextPage(title) {
    const section = `[...document.querySelectorAll('section')].find(el=>el.querySelector('h3')?.textContent===${JSON.stringify(title)})`;
    await click(
      `[...(${section}).querySelectorAll('button[aria-label="Next page"]')].find(el=>el.getBoundingClientRect().width>0)`,
    );
  }
  async function screenshot(name) {
    const result = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: false,
    });
    await writeFile(
      join(artifacts, `${name}.png`),
      Buffer.from(result.data, 'base64'),
    );
  }
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1100,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send('Page.navigate', { url: `${base}/#/docs/traffic-control` });
  await until(
    () => visible('input[aria-label="Profile name"]'),
    'traffic editor',
  );
  await waitForPreview(send, 'input[aria-label="Profile name"]');
  const rate = 'input[type="number"]';
  await fill(rate, '0.000008');
  await fill('input[aria-label="Profile name"]', 'interactive');
  await click(button('Add'));
  await fill('input[aria-label="Profile name"]', '___EMPTY___');
  await click(button('Add'));
  await choose('Default profile', '___EMPTY___');
  assert.equal(
    await evaluate(
      `document.querySelector('[role="combobox"][aria-label="Default profile"]').textContent.trim()`,
    ),
    '___EMPTY___',
  );
  await choose('Default profile', 'interactive');
  await click(element('button[aria-label="Delete profile ___EMPTY___"]'));
  checks.push(
    'Existing Select supports profile IDs that collide with its historical empty sentinel',
  );
  await nextPage('Inbounds');
  await until(
    () => visible('[role="combobox"][aria-label="TC Entry 101"]'),
    'inbound page two',
  );
  await nextPage('Inbounds');
  await until(
    () => visible('[role="combobox"][aria-label="TC Entry 205"]'),
    'inbound page three',
  );
  await choose('TC Entry 205', 'interactive');
  await nextPage('Routing rules');
  await until(
    () => visible('[role="combobox"][aria-label="TC Rule 100"]'),
    'route page two',
  );
  await nextPage('Routing rules');
  await until(
    () => visible('[role="combobox"][aria-label="TC Rule 205"]'),
    'route page three',
  );
  await choose('TC Rule 205', 'interactive');
  await click(element('[role="switch"]'));
  await click(button('Save and activate'));
  await until(
    () =>
      evaluate(
        `[...document.querySelectorAll('[role="status"]')].some(el=>el.textContent.includes('configuration saved and activated'))`,
      ),
    'saved policy',
  );
  let config = await rpc('traffic_control.get');
  assert.equal(config.enabled, true);
  assert.equal(config.global.upload.bytesPerSecond, 1);
  assert.equal(config.defaultProfile, 'interactive');
  assert.equal(config.inboundProfiles['tc-e2e-inbound-205'], 'interactive');
  assert.equal(config.routeProfiles['tc-e2e-rule-205'], 'interactive');
  checks.push(
    'Real backend round-trip preserves a 1-byte/s rate and both bindings beyond item 200',
  );
  const previousDocument = await evaluate('performance.timeOrigin');
  await send('Page.reload', { ignoreCache: true });
  await until(
    async () => (await evaluate('performance.timeOrigin')) !== previousDocument,
    'new document',
  );
  await until(
    () => visible('input[aria-label="Profile name"]'),
    'persisted editor',
  );
  await waitForPreview(send, 'input[aria-label="Profile name"]');
  assert.equal(
    await evaluate(`document.querySelector(${JSON.stringify(rate)}).value`),
    '0.000008',
  );
  await fill(rate, '0.1', true);
  assert.equal(
    await evaluate(`document.querySelector(${JSON.stringify(rate)}).value`),
    '0.1',
  );
  await click(button('Discard'));
  assert.equal(
    await evaluate(`document.querySelector(${JSON.stringify(rate)}).value`),
    '0.000008',
  );
  checks.push(
    'Reload, decimal keyboard editing and discard preserve the saved baseline',
  );
  for (const [name, width, height, mobile] of [
    ['desktop', 1440, 1100, false],
    ['mobile', 390, 844, true],
  ]) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile,
    });
    await evaluate(
      `document.querySelector('[data-ui-transition="page"]').scrollTo(0,0)`,
    );
    await waitForPreview(send, 'input[aria-label="Profile name"]');
    const overflow = await evaluate(
      `(()=>{const scope=document.querySelector('h1').closest('.space-y-5');return [...scope.querySelectorAll('input,button')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&(r.left< -1||r.right>innerWidth+1)}).map(el=>el.getAttribute('aria-label')||el.textContent.trim())})()`,
    );
    assert.deepEqual(overflow, [], `Clipped controls at ${width}px`);
    await screenshot(name);
    await evaluate(
      `document.querySelector('[data-ui-transition="page"]').scrollTo(0,100000)`,
    );
    await waitForPreview(
      send,
      '[role="combobox"][aria-label="Default profile"]',
    );
    await screenshot(`${name}-diagnostics`);
    checks.push(
      `No clipped controls at ${width}px; editor and diagnostics screenshots captured`,
    );
  }
  assert.deepEqual(errors, []);
  config = await rpc('traffic_control.get');
  assert.equal(config.global.upload.bytesPerSecond, 1);
  const result = { passed: checks, consoleErrors: errors, artifacts };
  await writeFile(
    join(artifacts, 'results.json'),
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  if (browserSend && ws?.readyState === 1) {
    const shot = await browserSend('Page.captureScreenshot', {
      format: 'png',
    }).catch(() => undefined);
    if (shot?.data)
      await writeFile(
        join(artifacts, 'failure.png'),
        Buffer.from(shot.data, 'base64'),
      );
    const text = await browserEvaluate('document.body.innerText').catch(
      () => undefined,
    );
    await writeFile(join(artifacts, 'failure.txt'), String(text));
  }
  throw error;
} finally {
  ws?.close();
  await Promise.all([stop(chrome), stop(server)]);
  await log.close();
}
