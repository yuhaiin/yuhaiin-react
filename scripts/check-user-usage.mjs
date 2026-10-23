// Real paired backend, authenticated proxy traffic and Chrome UI in disposable
// state. No existing user database, browser profile or credentials are used.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, open, readFile, writeFile } from 'node:fs/promises';
import { createServer as httpServer, request as httpRequest } from 'node:http';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const binary = process.env.USAGE_BACKEND;
assert(binary, 'Build the paired backend and set USAGE_BACKEND.');
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scratch = await mkdtemp(join(tmpdir(), 'yuhaiin-usage-ui-'));
const artifacts = process.env.ARTIFACT_DIR || join(scratch, 'screenshots');
await mkdir(artifacts, { recursive: true });
async function freePort() { const server = createServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening'); const port = server.address().port; await new Promise(resolve => server.close(resolve)); return port; }
async function until(fn, label, timeout = 15000) { const end = Date.now() + timeout; while (Date.now() < end) { if (await fn()) return; await sleep(50); } throw new Error(`Timed out: ${label}`); }
async function stop(child) { if (!child || child.exitCode !== null || child.signalCode !== null) return; child.kill('SIGTERM'); await Promise.race([once(child, 'exit'), sleep(3000)]); if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL'); }
const logPath = join(scratch, 'processes.log');
const log = await open(logPath, 'w', 0o600);
const backendPort = await freePort();
const proxyPort = await freePort();
const base = `http://127.0.0.1:${backendPort}`;
const backend = spawn(binary, ['run', '-host', `127.0.0.1:${backendPort}`, '-path', join(scratch, 'state'), '-eweb', join(project, 'dist')], { stdio: ['ignore', log.fd, log.fd], env: { ...process.env, EXTERNAL_WEB: join(project, 'dist') } });
let chrome, socket, sequence = 0;
const pending = new Map();
const exceptions = [];
const payload = Buffer.alloc(65536, 'u');
const echo = httpServer((request, response) => { assert.equal(request.headers['proxy-authorization'], undefined); response.writeHead(200, { 'Content-Length': payload.length }); response.end(payload); });
echo.listen(0, '127.0.0.1'); await once(echo, 'listening');
const target = `127.0.0.1:${echo.address().port}`;
const password = 'Disposable-usage-test-password';
let administrator = '';
async function call(method, path, body, authorization = administrator) {
    const response = await fetch(`${base}/api/v2${path}`, { method, headers: { 'Content-Type': 'application/json', ...(authorization ? { Authorization: authorization } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    assert(response.ok, `${method} ${path}: HTTP ${response.status}`);
    return response.json();
}
async function derive(password, p) { const salt = Buffer.from(p.salt, 'base64url'); const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password.normalize('NFC')), 'PBKDF2', false, ['deriveBits']); return Buffer.from(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: p.digest, iterations: p.iterations, salt }, key, p.bytes * 8)).toString('base64url'); }
async function enroll(capability) { const authorization = `Enrollment ${capability}`; const parameters = await call('POST', '/auth/enrollment/parameters', {}, authorization); await call('POST', '/auth/enrollment', { clientCredential: await derive(password, parameters) }, authorization); }
async function proxyRequest(login, secret, number) {
    await new Promise((resolve, reject) => {
        const request = httpRequest({ host: '127.0.0.1', port: proxyPort, method: 'GET', path: `http://${target}/request-${number}`, headers: { Host: target, 'Proxy-Authorization': `Basic ${Buffer.from(`${login}:${secret}`).toString('base64')}` }, agent: false }, response => {
            let bytes = 0; response.on('data', chunk => bytes += chunk.length); response.on('end', () => { try { assert.equal(response.statusCode, 200); assert.equal(bytes, payload.length); resolve(); } catch (error) { reject(error); } }); response.on('error', reject);
        }); request.on('error', reject); request.end();
    });
}
function send(method, params = {}) { return new Promise((resolve, reject) => { const id = ++sequence; const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Chrome timeout: ${method}`)); }, 15000); pending.set(id, { resolve, reject, timer }); socket.send(JSON.stringify({ id, method, params })); }); }
async function evaluate(expression) { const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; }
async function key(key, code = key, windowsVirtualKeyCode) {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode });
}
async function click(expression) {
    await until(() => evaluate(`Boolean((${expression}) && !(${expression}).disabled)`), 'enabled control');
    assert(await evaluate(`(() => { const element = (${expression}); if (!element) return false; element.scrollIntoView({block:'center',behavior:'instant'}); element.focus(); element.click(); return true; })()`), `Missing clickable element: ${expression}`);
}
async function fill(selector, value) { await evaluate(`(() => { const input=document.querySelector(${JSON.stringify(selector)}); if (!input) throw new Error('Input missing'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,${JSON.stringify(value)}); input.dispatchEvent(new Event('input',{bubbles:true})); input.dispatchEvent(new Event('change',{bubbles:true})); })()`); }
async function loginUI(name) {
    await send('Page.navigate', { url: base });
    await until(() => evaluate(`Boolean(document.querySelector('input[name="username"]') && document.querySelector('input[type="password"]') && [...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Sign in' && !b.disabled))`), 'sign-in form');
    await fill('input[name="username"]', name); await fill('input[type="password"]', password);
    await evaluate(`document.querySelector('input[type="password"]').closest('form').requestSubmit()`);
    await until(() => evaluate(`!document.querySelector('input[type="password"]')`), 'successful sign in');
    await send('Page.navigate', { url: `${base}/#/docs/security` });
    await until(() => evaluate(`document.body.innerText.includes('User traffic and audit')`), 'usage panel');
}
async function screenshot(name) { await evaluate(`new Promise(resolve=>setTimeout(resolve,250))`); const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); await writeFile(join(artifacts, name), Buffer.from(shot.data, 'base64')); }
try {
    await until(async () => { if (backend.exitCode !== null) throw new Error(`Backend exited; inspect ${logPath}`); try { return (await fetch(`${base}/api/v2/auth/setup`)).ok; } catch { return false; } }, 'backend startup');
    let setup;
    await until(async () => { setup = (await readFile(logPath, 'utf8')).match(/Initialization code: (\S+)/)?.[1]; return Boolean(setup); }, 'local initialization code');
    const parameters = await call('POST', '/auth/setup/parameters', {}, `Setup ${setup}`);
    await call('POST', '/auth/setup', { login: 'admin', clientCredential: await derive(password, parameters) }, `Setup ${setup}`);
    const loginParameters = await call('POST', '/auth/parameters', { login: 'admin' }, '');
    const issued = await call('POST', '/auth/login', { login: 'admin', clientCredential: await derive(password, loginParameters) }, '');
    administrator = `Session ${issued.secret}`;
    const alice = await call('POST', '/auth/users', { login: 'alice', role: 'none' }); await enroll(alice.enrollment.secret);
    const bob = await call('POST', '/auth/users', { login: 'bob', role: 'none' }); await enroll(bob.enrollment.secret);
    const phone = await call('POST', '/auth/proxy-credentials', { owner: alice.user.id, name: 'Phone' });
    const laptop = await call('POST', '/auth/proxy-credentials', { owner: bob.user.id, name: 'Laptop' });
    await call('POST', '/rpc/inbounds.post', { id: 'usage-test', name: 'Usage test', enabled: true, authentication: { users: [alice.user.id, bob.user.id] }, network: { type: 'tcp_udp', tcp_udp: { host: `127.0.0.1:${proxyPort}`, udp: 'tcp_only' } }, protocol: { type: 'http', http: {} }, transports: [] });
    for (let n = 0; n < 55; n++) await proxyRequest('alice', phone.secret, n);
    for (let n = 0; n < 3; n++) await proxyRequest('bob', laptop.secret, n);
    let report;
    await until(async () => { report = await call('GET', `/auth/usage?owner=${alice.user.id}`); return report.summary.lifetime.opened === '55' && BigInt(report.summary.lifetime.download) >= 55n * BigInt(payload.length); }, 'persisted user traffic');
    assert.equal(report.credentials[0].name, 'Phone');
    const first = await call('GET', `/auth/usage/audit?owner=${alice.user.id}&limit=50`); assert.equal(first.items.length, 50); assert(first.next);
    const second = await call('GET', `/auth/usage/audit?owner=${alice.user.id}&limit=50&before=${encodeURIComponent(first.next)}`); assert.equal(second.items.length, 5);
    const other = await call('GET', `/auth/usage?owner=${bob.user.id}`); assert.equal(other.summary.lifetime.opened, '3');
    const chromePort = Number(process.env.CHROME_DEBUG_PORT) || await freePort();
    if (!process.env.CHROME_DEBUG_PORT) chrome = spawn(process.env.CHROME_PATH || '/opt/google/chrome/chrome', ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--no-first-run', '--no-default-browser-check', '--lang=en-US', `--remote-debugging-port=${chromePort}`, `--user-data-dir=${join(scratch, 'chrome')}`, 'about:blank'], { stdio: ['ignore', log.fd, log.fd] });
    let tab;
    await until(async () => { try { tab = (await (await fetch(`http://127.0.0.1:${chromePort}/json/list`)).json()).find(tab => tab.type === 'page'); return Boolean(tab); } catch { return false; } }, 'Chrome startup');
    socket = new WebSocket(tab.webSocketDebuggerUrl); await once(socket, 'open');
    socket.addEventListener('message', ({ data }) => { const message = JSON.parse(data); if (message.method === 'Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text); const request = pending.get(message.id); if (request) { clearTimeout(request.timer); pending.delete(message.id); if (message.error) request.reject(new Error(message.error.message)); else request.resolve(message.result); } });
    await send('Runtime.enable'); await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1, mobile: false });
    await loginUI('admin');
    const panel = `[...document.querySelectorAll('h2')].find(h=>h.textContent==='User traffic and audit').parentElement.parentElement`;
    await evaluate(`(${panel}).querySelector('[role="combobox"][aria-label="Owner"]').focus()`);
    await send('Input.dispatchKeyEvent', {type:'keyDown',key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40});
    await send('Input.dispatchKeyEvent', {type:'keyUp',key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40});
    await until(() => evaluate(`Boolean([...document.querySelectorAll('[role="option"]')].find(o=>o.textContent==='alice'))`), 'owner options');
    const aliceIndex = await evaluate(`[...document.querySelectorAll('[role="option"]')].findIndex(o=>o.textContent==='alice')`);
    await sleep(300);
    await key('Home', 'Home', 36);
    await sleep(100);
    for (let n = 0; n < aliceIndex; n++) { await key('ArrowDown', 'ArrowDown', 40); await sleep(100); }
    await key('Enter', 'Enter', 13);
    console.log('Selected owner:', await evaluate(`(${panel}).querySelector('[role="combobox"][aria-label="Owner"]').textContent`));
    await until(() => evaluate(`Boolean((${panel}).querySelector('dd[title="${report.summary.lifetime.download}"]'))`), 'selected user totals');
    await until(() => evaluate(`Boolean([...(${panel}).querySelectorAll('button')].find(b=>b.textContent==='Next' && !b.disabled))`), 'audit first page');
    await evaluate(`(${panel}).scrollIntoView({block:'start',behavior:'instant'}); for (let p=(${panel}).parentElement;p;p=p.parentElement) { if (p.scrollHeight>p.clientHeight && ['auto','scroll'].includes(getComputedStyle(p).overflowY)) {p.scrollTop-=72;break;} }`); await screenshot('usage-desktop.png');
    await click(`[...(${panel}).querySelectorAll('button')].find(b=>b.textContent==='Next')`);
    await until(() => evaluate(`(${panel}).innerText.includes('Page 2')`), 'audit cursor page');
    await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 900, deviceScaleFactor: 1, mobile: true });
    await evaluate(`(${panel}).scrollIntoView({block:'start',behavior:'instant'}); for (let p=(${panel}).parentElement;p;p=p.parentElement) { if (p.scrollHeight>p.clientHeight && ['auto','scroll'].includes(getComputedStyle(p).overflowY)) {p.scrollTop-=72;break;} }`); await screenshot('usage-mobile.png');
    assert(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), 'mobile viewport overflow');
    await click(`[...document.querySelectorAll('button')].find(b=>b.textContent==='Sign out')`);
    await loginUI('bob');
    await until(() => evaluate(`(${panel}).innerText.includes('3')`), 'self usage');
    assert.equal(await evaluate(`Boolean((${panel}).querySelector('[role="combobox"][aria-label="Owner"]'))`), false);
    assert.equal(await evaluate(`(${panel}).innerText.includes('History retention')`), false);
    await evaluate(`(${panel}).scrollIntoView({block:'start',behavior:'instant'}); for (let p=(${panel}).parentElement;p;p=p.parentElement) { if (p.scrollHeight>p.clientHeight && ['auto','scroll'].includes(getComputedStyle(p).overflowY)) {p.scrollTop-=72;break;} }`); await screenshot('usage-self-mobile.png');
    assert.deepEqual(exceptions, []);
    await writeFile(join(artifacts, 'checks.json'), JSON.stringify({ checks: ['real HTTP proxy payload', 'separate users and device labels', '55 independent audit sessions', 'cursor pagination', 'admin owner selection', '360px layout', 'proxy-only self-service'], aliceOpened: report.summary.lifetime.opened, aliceDownload: report.summary.lifetime.download, bobOpened: other.summary.lifetime.opened }, null, 2));
    console.log(`User usage integration passed. Artifacts: ${artifacts}`);
} finally {
    socket?.close(); for (const request of pending.values()) clearTimeout(request.timer);
    await stop(chrome); await stop(backend); await new Promise(resolve => echo.close(resolve)); await log.close();
}
