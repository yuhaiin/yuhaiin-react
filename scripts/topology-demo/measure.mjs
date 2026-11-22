// Measures the Network Topology page against the live demo core (run.sh up/traffic/load).
// Raw Chrome DevTools Protocol, like scripts/check-visual-system.mjs; no extra dependency.
//
//   CHROME_PATH=/opt/google/chrome/chrome node measure.mjs <state.json> [seconds]
//
// Prints one JSON object:
//   reactCommitsPerSecond   React commits (a counting DevTools hook) while the page is live
//   rafPerSecond            requestAnimationFrame callbacks per second
//   frameMs                 duration of animation-frame callbacks from a trace (p50/p95/max)
//   cpu                     main-thread task time as a share of wall time
//   heapMB / domNodes       after the window; release: the same after leaving the page
import { spawn } from 'node:child_process';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const [statePath, secondsText] = process.argv.slice(2);
const seconds = Number(secondsText || 15);
const state = JSON.parse(readFileSync(statePath, 'utf8'));
const BASE = 'https://127.0.0.1:50071';
const PORT = 9241;

const chrome = spawn(process.env.CHROME_PATH || 'google-chrome', [
    '--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--no-first-run', '--ignore-certificate-errors',
    `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*', `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'topology-measure-'))}`,
    '--window-size=1440,900', 'about:blank',
], { stdio: 'ignore' });

let ws;
for (let i = 0; i < 100 && !ws; i++) {
    try {
        const pages = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
        const url = pages.find(page => page.type === 'page')?.webSocketDebuggerUrl;
        if (url) { ws = new WebSocket(url); await new Promise(resolve => ws.addEventListener('open', resolve, { once: true })); }
    } catch { /* starting */ }
    if (!ws) await sleep(100);
}
if (!ws) throw new Error('Chrome did not start');
let nextId = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
        const { resolve, reject } = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message)); else resolve(message.result);
    } else if (message.method) for (const listener of listeners) listener(message);
});
const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    return result.result?.value;
};
const waitFor = async (expression, timeout = 30000) => {
    const end = Date.now() + timeout;
    while (Date.now() < end) {
        try { if (await evaluate(expression)) return; } catch { /* navigating */ }
        await sleep(150);
    }
    throw new Error('Timed out: ' + expression);
};

// Counters installed before any page script: React commits and animation-frame callbacks.
await send('Page.enable');
await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__measure = { commits: 0, raf: 0 };
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { supportsFiber: true, renderers: new Map(), inject() { return 1; },
        onCommitFiberRoot() { window.__measure.commits++; }, onCommitFiberUnmount() {}, onPostCommitFiberRoot() {}, checkDCE() {} };
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = callback => raf(time => { window.__measure.raf++; callback(time); });
` });
await send('Performance.enable');
await send('Network.enable');
const streams = new Map();
listeners.push(message => {
    if (message.method === 'Network.requestWillBeSent' && message.params.request.url.includes('/api/v2/connections/events')) streams.set(message.params.requestId, 'open');
    if ((message.method === 'Network.loadingFinished' || message.method === 'Network.loadingFailed') && streams.has(message.params.requestId)) streams.set(message.params.requestId, 'closed');
});

// Log in through the UI.
await send('Page.navigate', { url: `${BASE}/#/login` });
await waitFor(`Boolean(document.querySelector('input[name=password]'))`);
for (const [selector, value] of [['input[name=username]', 'demo-admin'], ['input[name=password]', state.password]]) {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
    await send('Input.insertText', { text: value });
}
await evaluate(`document.querySelector('button[type=submit]').click()`);
await waitFor(`!location.hash.includes('login')`);
await send('Page.navigate', { url: `${BASE}/#/docs/connections/topology` });
await waitFor(`Boolean(document.querySelector('[data-topology-ready] [data-node-id]'))`);
await sleep(8000);

const metrics = async () => Object.fromEntries((await send('Performance.getMetrics')).metrics.map(metric => [metric.name, metric.value]));
const counters = () => evaluate('({ ...window.__measure })');

// Trace animation-frame callbacks during the window.
const events = [];
listeners.push(message => { if (message.method === 'Tracing.dataCollected') events.push(...message.params.value); });
const traceDone = new Promise(resolve => listeners.push(message => { if (message.method === 'Tracing.tracingComplete') resolve(); }));
await send('Tracing.start', { categories: 'devtools.timeline', transferMode: 'ReportEvents' });
const m0 = await metrics(), c0 = await counters(), t0 = Date.now();
await sleep(seconds * 1000);
const m1 = await metrics(), c1 = await counters(), t1 = Date.now();
await send('Tracing.end');
await traceDone;

const wall = (t1 - t0) / 1000;
const frames = events.filter(event => event.name === 'FireAnimationFrame' && event.ph === 'X').map(event => event.dur / 1000).sort((a, b) => a - b);
const pct = p => frames.length ? Number(frames[Math.min(frames.length - 1, Math.floor(p * frames.length))].toFixed(2)) : 0;
const page = await evaluate(`({
    connections: document.querySelector('h1')?.parentElement?.textContent.match(/(\\d+)\\s*(connection|of)/)?.[1],
    cards: document.querySelectorAll('[data-node-id]').length,
    edges: document.querySelectorAll('[class*="hitLayer"] path').length,
    domNodes: document.getElementsByTagName('*').length,
})`);

// Leave the page: the stream must close, animation frames must stop, memory must be released.
await send('Page.navigate', { url: `${BASE}/#/docs/config/about` });
await sleep(4000);
await send('HeapProfiler.enable');
await send('HeapProfiler.collectGarbage');
const r0 = await counters();
await sleep(3000);
const r1 = await counters();
const after = await metrics();

console.log(JSON.stringify({
    window: wall,
    page,
    reactCommitsPerSecond: Number(((c1.commits - c0.commits) / wall).toFixed(2)),
    rafPerSecond: Number(((c1.raf - c0.raf) / wall).toFixed(1)),
    frameMs: { count: frames.length, p50: pct(0.5), p95: pct(0.95), max: pct(1) },
    cpu: {
        task: Number(((m1.TaskDuration - m0.TaskDuration) / wall).toFixed(3)),
        script: Number(((m1.ScriptDuration - m0.ScriptDuration) / wall).toFixed(3)),
        layout: Number(((m1.LayoutDuration - m0.LayoutDuration) / wall).toFixed(3)),
        style: Number(((m1.RecalcStyleDuration - m0.RecalcStyleDuration) / wall).toFixed(3)),
    },
    heapMB: Number((m1.JSHeapUsedSize / 1048576).toFixed(1)),
    release: {
        openEventStreams: [...streams.values()].filter(value => value === 'open').length,
        rafPerSecondAfterLeaving: Number(((r1.raf - r0.raf) / 3).toFixed(1)),
        heapMBAfterGC: Number((after.JSHeapUsedSize / 1048576).toFixed(1)),
        domNodes: after.Nodes,
    },
}, null, 2));
ws.close();
chrome.kill();
