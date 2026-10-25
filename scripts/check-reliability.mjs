// Layout and real browser interaction coverage with isolated synthetic MSW data.
// Start: npm run dev:msw -- --port 5187
// Run: CHROME_PATH=google-chrome-stable node scripts/check-reliability.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';
import { waitForPreview } from './preview-ready.mjs';
const base=process.env.RELIABILITY_PREVIEW_URL || 'http://127.0.0.1:5187';
const output=process.env.RELIABILITY_SCREENSHOTS || '/tmp/yuhaiin-reliability-shots';
const profile=await mkdtemp(`${tmpdir()}/yuhaiin-reliability-chrome-`);
const chrome=spawn(process.env.CHROME_PATH || 'google-chrome-stable',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--no-first-run','--remote-allow-origins=*','--remote-debugging-port=9237',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
let ws;
try {
 for(let i=0;i<80;i++){
  try {const pages=await(await fetch('http://127.0.0.1:9237/json/list')).json();ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));break;}catch{await sleep(100);}
 }
 assert(ws,'Chrome did not start');
 let id=0;const pending=new Map();
 ws.addEventListener('message',({data})=>{const m=JSON.parse(data),entry=pending.get(m.id);if(entry){pending.delete(m.id);if(m.error)entry.reject(Error(m.error.message));else entry.resolve(m.result);}});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const key=++id,timer=setTimeout(()=>{pending.delete(key);reject(Error(`CDP timeout ${method}`));},20000);pending.set(key,{resolve:r=>{clearTimeout(timer);resolve(r);},reject:e=>{clearTimeout(timer);reject(e);}});ws.send(JSON.stringify({id:key,method,params}));});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result?.value;};
 async function wait(expression){for(let i=0;i<150;i++){try{if(await evaluate(expression))return;}catch(e){if(!/context|navigat/i.test(String(e)))throw e;}await sleep(100);}throw Error(`Not ready: ${expression}; ${await evaluate('document.body?.innerText')}`);}
 async function clickText(text,selector='button, summary'){
  const point=await evaluate(`(()=>{const e=[...document.querySelectorAll(${JSON.stringify(selector)})].find(e=>e.textContent.trim()===${JSON.stringify(text)}&&e.getBoundingClientRect().width);if(!e)throw Error('Missing '+${JSON.stringify(text)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});await sleep(150);
 }
 async function shot(name){const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(`${output}/${name}.png`,Buffer.from(r.data,'base64'));}
 await mkdir(output,{recursive:true});await send('Page.enable');await send('Runtime.enable');
 const checks=[];
 for(const width of [1440,360,320]){
  const init=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('yuhaiin.theme','light');localStorage.setItem('yuhaiin.accent','olive');`});
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<768});
  await send('Page.navigate',{url:`${base}/?scenario=reliability&viewport=${width}#/docs/group/selectors?selector=selector-work`});
  await wait(`location.href.includes('viewport=${width}') && document.body?.innerText.includes('Circuit breaker and recovery')`);
  await waitForPreview(send,'fieldset');
  await clickText('Circuit breaker and recovery');
  const toggle='[role="switch"][aria-label="Enable circuit breaker"]';
  await wait(`Boolean(document.querySelector(${JSON.stringify(toggle)}))`);
  assert.equal(await evaluate(`document.querySelector(${JSON.stringify(toggle)}).getAttribute('aria-checked')`),'true');
  // Change using the actual accessible switch, then persist with the existing Save flow.
  const point=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(toggle)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
  await wait(`document.querySelector(${JSON.stringify(toggle)}).getAttribute('aria-checked')==='false'`);
  await clickText('Save','button');
  await wait(`!document.body.innerText.includes('Unsaved changes')`);
  await shot(`${width}-circuit-controls`);
  await clickText('UDP','button');
  const card=await evaluate(`(()=>{const e=[...document.querySelectorAll('summary')].find(e=>e.textContent.includes('node-1')&&e.textContent.includes('recovery'));if(!e)return null;e.dataset.reliabilityCandidate='';return e.textContent;})()`);
  assert(card, 'Missing half-open candidate details');
  const candidatePoint=await evaluate(`(()=>{const e=document.querySelector('[data-reliability-candidate]');e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...candidatePoint});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...candidatePoint});
  await wait(`document.body.innerText.includes('Remote UDP reply received')`);
  assert(await evaluate(`document.body.innerText.includes('Half-open')&&document.body.innerText.includes('In flight: 1')`));
  await evaluate(`document.querySelector('[data-reliability-candidate]').parentElement.scrollIntoView({block:'start'})`);await sleep(200);
  const overflow=await evaluate('document.documentElement.scrollWidth-innerWidth');
  assert(overflow<=1,`${width}px horizontal overflow: ${overflow}`);
  await shot(`${width}-recovery-evidence`);
  await clickText('Monitoring defaults','button');
  await wait(`Boolean(document.querySelector('[role="dialog"]'))`);
  await waitForPreview(send,'[role="dialog"]');
  const modalOverflow=await evaluate(`(()=>{const e=document.querySelector('[role="dialog"]');return e.scrollWidth-e.clientWidth;})()`);
  assert(modalOverflow<=1,`${width}px monitoring dialog overflow: ${modalOverflow}`);
  await shot(`${width}-monitoring-defaults`);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  await wait(`!document.querySelector('[role="dialog"]')`);
  checks.push({width,horizontalOverflow:overflow,savedCircuitToggle:true,halfOpenEvidence:true});
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:init.identifier});
 }
 await writeFile(`${output}/checks.json`,JSON.stringify({source:'synthetic MSW visual/interaction data; backend behavior tested separately',checks},null,2));
 process.stdout.write(JSON.stringify(checks)+'\n');
} finally {ws?.close();chrome.kill();await new Promise(resolve=>chrome.once('exit',resolve));await rm(profile,{recursive:true,force:true,maxRetries:10,retryDelay:100});}
