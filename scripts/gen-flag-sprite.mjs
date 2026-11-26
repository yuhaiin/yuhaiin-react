#!/usr/bin/env node
// Builds src/component/flags/flags.webp and flags.json from the 4:3 SVGs of
// flag-icons (MIT, https://github.com/lipis/flag-icons).
//
//   npm pack flag-icons@7.6.0 && tar xzf flag-icons-7.6.0.tgz
//   CHROME_PATH=/path/to/chrome node scripts/gen-flag-sprite.mjs package/flags/4x3
//
// Flags are shown at 16x12 px, where coats of arms are invisible, so one
// small raster sprite (3x density) replaces ~1.9 MB of SVG.
import { spawn } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const dir = process.argv[2];
if (!dir) {
  console.error('usage: node scripts/gen-flag-sprite.mjs <flag-icons/flags/4x3>');
  process.exit(2);
}
const out = fileURLToPath(new URL('../src/component/flags/', import.meta.url));
const W = 48, H = 36, COLS = 16, QUALITY = 0.9;

// ISO 3166-1 alpha-2 (plus XK) only; regional flags like gb-eng are skipped.
const codes = readdirSync(dir).filter((f) => /^[a-z]{2}\.svg$/.test(f)).map((f) => f.slice(0, 2)).sort();
const sources = codes.map((code) => `data:image/svg+xml;base64,${readFileSync(join(dir, `${code}.svg`)).toString('base64')}`);

const port = 9251;
const chrome = spawn(process.env.CHROME_PATH || 'google-chrome', ['--headless=new', '--no-sandbox', '--disable-gpu', '--remote-allow-origins=*',
  `--remote-debugging-port=${port}`, '--user-data-dir=/tmp/yuhaiin-flag-sprite', 'about:blank'], { stdio: 'ignore' });
try {
  let ws;
  for (let i = 0; i < 80 && !ws; i++) {
    try {
      const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const url = pages.find((p) => p.type === 'page')?.webSocketDebuggerUrl;
      if (url) { ws = new WebSocket(url); await new Promise((r) => ws.addEventListener('open', r, { once: true })); }
    } catch { /* starting */ }
    await sleep(150);
  }
  if (!ws) throw new Error('Chrome did not start');
  const reply = new Promise((resolve, reject) => ws.addEventListener('message', ({ data }) => {
    const m = JSON.parse(data);
    if (m.id !== 1) return;
    if (m.error || m.result.exceptionDetails) reject(new Error(JSON.stringify(m.error ?? m.result.exceptionDetails)));
    else resolve(m.result.result.value);
  }));
  const expression = `(async () => {
    const sources = ${JSON.stringify(sources)};
    const cols = ${COLS}, w = ${W}, h = ${H};
    const canvas = document.createElement('canvas');
    canvas.width = cols * w; canvas.height = Math.ceil(sources.length / cols) * h;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    for (let i = 0; i < sources.length; i++) {
      const img = new Image();
      img.src = sources[i];
      await img.decode();
      ctx.drawImage(img, (i % cols) * w, Math.floor(i / cols) * h, w, h);
    }
    return canvas.toDataURL('image/webp', ${QUALITY});
  })()`;
  ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
  const dataUrl = await reply;
  mkdirSync(out, { recursive: true });
  const image = Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
  writeFileSync(join(out, 'flags.webp'), image);
  writeFileSync(join(out, 'flags.json'), `${JSON.stringify({
    source: 'flag-icons 7.6.0 (MIT, Panayiotis Lipiridis), flags/4x3',
    width: W, height: H, columns: COLS, codes: codes.map((c) => c.toUpperCase()),
  })}\n`);
  console.log(`wrote ${codes.length} flags, ${image.length} bytes`);
} finally {
  chrome.kill();
}
