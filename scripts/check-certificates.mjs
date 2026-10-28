// Actual paired backend/UI round trips in disposable state; no public CA/DNS calls.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, open, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { waitForPreview } from './preview-ready.mjs';

const binary = process.env.CERTIFICATES_BACKEND;
assert(binary, 'Build the backend and set CERTIFICATES_BACKEND.');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scratch = await mkdtemp(join(tmpdir(), 'yuhaiin-certificates-ui-'));
const artifacts = process.env.ARTIFACT_DIR || join(scratch, 'screenshots');
await mkdir(artifacts, { recursive: true });
const log = await open(join(scratch, 'processes.log'), 'w', 0o600);
async function port() { const server = createServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening'); const value = server.address().port; await new Promise(resolve => server.close(resolve)); return value; }
const backendPort = await port(), chromePort = await port();
const base = `http://127.0.0.1:${backendPort}`;
const backend = spawn(binary, ['run', '-https=false', '-host', `127.0.0.1:${backendPort}`, '-path', join(scratch, 'state'), '-eweb', join(root, 'dist')], { stdio: ['ignore', log.fd, log.fd] });
let chrome, ws, authorization;
const checks = [];
async function until(test, name, timeout = 15000) { const deadline = Date.now() + timeout; while (Date.now() < deadline) { if (await test()) return; await sleep(60); } throw Error(`Timed out: ${name}`); }
async function rpc(operation, body = {}) { const response = await fetch(`${base}/api/v2/rpc/${operation}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(authorization ? { Authorization: authorization } : {}) }, body: JSON.stringify(body) }); assert(response.ok, `${operation}: ${response.status}`); return response.json(); }
async function stop(child) { if (!child || child.exitCode !== null || child.signalCode !== null) return; child.kill('SIGTERM'); await Promise.race([once(child, 'exit'), sleep(3000)]); if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL'); }
try {
  await until(async () => { if (backend.exitCode !== null) throw Error(`Backend exited; see ${scratch}/processes.log`); try { return (await fetch(`${base}/api/v2/auth/setup`)).ok; } catch { return false; } }, 'backend startup');
  chrome = spawn(process.env.CHROME_PATH || '/opt/google/chrome/chrome', ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--no-first-run', `--remote-debugging-port=${chromePort}`, `--user-data-dir=${join(scratch, 'chrome')}`, 'about:blank'], { stdio: ['ignore', log.fd, log.fd] });
  let target;
  await until(async () => { try { target = (await (await fetch(`http://127.0.0.1:${chromePort}/json/list`)).json()).find(page => page.type === 'page'); return Boolean(target); } catch { return false; } }, 'Chrome startup');
  ws = new WebSocket(target.webSocketDebuggerUrl); await once(ws, 'open');
  let sequence = 0; const pending = new Map(); const browserErrors = [];
  ws.addEventListener('message', ({ data }) => { const message = JSON.parse(data); if (message.method === 'Network.requestWillBeSent') { const headers = message.params.request.headers; for (const [name, value] of Object.entries(headers)) if (name.toLowerCase() === 'authorization' && String(value).startsWith('Session ')) authorization = String(value); } if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails.text); const request = pending.get(message.id); if (!request) return; pending.delete(message.id); clearTimeout(request.timer); if (message.error) request.reject(Error(message.error.message)); else request.resolve(message.result); });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; const timer = setTimeout(() => { pending.delete(id); reject(Error(`CDP timeout ${method}`)); }, 15000); pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => { const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text); return result.result?.value; };
  async function wait(expression, name = expression) { await until(async () => { try { return await evaluate(expression); } catch (error) { if (/context|navigat/i.test(String(error))) return false; throw error; } }, name); }
  async function click(expression) { const point = await evaluate(`(async()=>{const e=${expression};if(!e)throw Error('Missing click target');e.scrollIntoView({block:'center'});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const b=e.getBoundingClientRect();return{x:b.x+b.width/2,y:b.y+b.height/2}})()`); await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point }); await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point }); }
  const button = text => `[...document.querySelectorAll('button')].find(e=>e.textContent.trim()===${JSON.stringify(text)})`;
  async function fill(label, text) { const selector = await evaluate(`(()=>{const l=[...document.querySelectorAll('form label')].find(e=>e.textContent.trim()===${JSON.stringify(label)});const e=l?.htmlFor?document.getElementById(l.htmlFor):l?.querySelector('input');if(!e)throw Error('Missing field');e.dataset.certificateField='';return '[data-certificate-field]';})()`); await click(`document.querySelector(${JSON.stringify(selector)})`); await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, modifiers: 2 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA', windowsVirtualKeyCode: 65, modifiers: 2 }); await send('Input.insertText', { text }); await evaluate(`document.querySelector(${JSON.stringify(selector)}).removeAttribute('data-certificate-field')`); }
  async function choose(label, text) { await click(`document.querySelector('[role="combobox"][aria-label=${JSON.stringify(label)}]')`); await wait('Boolean(document.querySelector("[role=option]"))'); await click(`[...document.querySelectorAll('[role=option]')].find(e=>e.textContent.trim()===${JSON.stringify(text)})`); await wait('!document.querySelector("[role=option]")'); }
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source: "localStorage.setItem('yuhaiin.theme','light');localStorage.setItem('yuhaiin.accent','olive');" });
  await send('Page.navigate', { url: `${base}/#/login` });
  await wait('document.body.innerText.includes("Create administrator")');
  const setupCode = (await readFile(join(scratch, 'processes.log'), 'utf8')).match(/Initialization code: ([^\r\n]+)/)?.[1];
  assert(setupCode, 'Disposable instance did not provide an initialization capability.');
  const password = randomUUID();
  await fill('Login name', 'browser-admin'); await fill('Initialization code', setupCode); await fill('New password', password); await fill('Confirm password', password);
  await click(button('Create administrator')); await wait('document.body.innerText.includes("Sign in")');
  await fill('Password', password); await click(button('Sign in'));
  await until(() => Boolean(authorization), 'authenticated test session');
  const provider = await rpc('certificate.provider.save', { provider: { id: randomUUID(), name: 'Browser test zone', type: 'cloudflare', zoneId: 'a'.repeat(32), zoneName: 'example.com', revision: 0, hasCredential: false }, token: 'test-token-not-a-real-credential' });
  await evaluate("window.location.hash='/docs/certificates'");
  await wait('document.body.innerText.includes("New ACME certificate")');
  for (const width of [1440, 360, 320]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 768 });
    await click(button('New ACME certificate'));
    await waitForPreview(send, 'form');
    await fill('Name', `Site ${width}`); await fill('Account email', 'ops@example.com'); await fill('Domains and SANs (comma separated)', `site${width}.example.com`);
    await choose('Certificate authority', 'Custom ACME CA'); await fill('HTTPS directory URL', 'https://127.0.0.1:1/directory');
    await choose('DNS provider', 'Browser test zone · example.com');
    await click(`(()=>{const l=[...document.querySelectorAll('form label')].find(e=>e.textContent==='I accept the selected ACME CA’s terms of service');return document.getElementById(l.htmlFor)})()`);
    assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'), `${width}px certificate form overflow`);
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' });
    const formShot = await send('Page.captureScreenshot', { format: 'png' }); await writeFile(join(artifacts, `${width}-form.png`), Buffer.from(formShot.data, 'base64'));
    await click(button('Save')); await wait('!document.querySelector("form")');
    await until(async () => (await rpc('certificates.list')).certificates.some(c => c.config.name === `Site ${width}` && c.status.state === 'failed'), 'real background failure status');
    const overview = await rpc('certificates.list'); const saved = overview.certificates.find(c => c.config.name === `Site ${width}`);
    assert.deepEqual(saved.config.domains, [`site${width}.example.com`]); assert.equal(saved.config.challenge.dnsProviderId, provider.id); assert.equal(saved.config.termsAccepted, true);
    assert(!JSON.stringify(overview).includes('test-token-not-a-real-credential'), 'provider credential escaped public API');
    await click(button('Refresh')); await wait('document.body.innerText.includes("Issuance / renewal failed")');
    await evaluate('window.scrollTo(0,0)'); await waitForPreview(send, 'article');
    assert(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'), `${width}px certificate list overflow`);
    const shot = await send('Page.captureScreenshot', { format: 'png' }); await writeFile(join(artifacts, `${width}-status.png`), Buffer.from(shot.data, 'base64'));
    checks.push({ width, saved: true, realBackgroundFailure: saved.status.failureCode, credentialRedacted: true, overflow: false });
  }
  assert.deepEqual(browserErrors, []);
  await writeFile(join(artifacts, 'checks.json'), JSON.stringify({ source: 'actual paired backend, private disposable SQLite, native Chrome; local failing CA directory only, no public issuance', checks }, null, 2));
  process.stdout.write(`Certificate browser checks passed: ${artifacts}\n`);
} finally { ws?.close(); await stop(chrome); await stop(backend); await log.close(); }
