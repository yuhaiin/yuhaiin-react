// Real browser coverage for app confirmations, UI motion, control geometry and update recovery.
// Uses Chrome's built-in CDP; no browser test dependency or personal profile.
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';
import { waitForPreview } from './preview-ready.mjs';
const profile = await mkdtemp(`${tmpdir()}/yuhaiin-ui-`);
const chrome = spawn(process.env.CHROME_PATH || 'google-chrome', ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--no-first-run', '--remote-allow-origins=*', '--remote-debugging-port=9233', `--user-data-dir=${profile}`, 'about:blank'], {stdio:'ignore'});
let ws;
try {
  for (let i=0; i<80; i++) {
    try {
      const pages=await (await fetch('http://127.0.0.1:9233/json/list')).json();
      ws=new WebSocket(pages.find(page=>page.type==='page').webSocketDebuggerUrl);
      await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true})); break;
    } catch { await sleep(100); }
  }
  if (!ws) throw new Error('Chrome did not start');
  let id=0; const pending=new Map();
  ws.addEventListener('message',({data})=>{const message=JSON.parse(data), entry=pending.get(message.id); if(entry){pending.delete(message.id);if(message.error)entry.reject(new Error(message.error.message));else entry.resolve(message.result);}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{
    const key=++id, timer=setTimeout(()=>{pending.delete(key);reject(new Error(`CDP timeout: ${method}`));},30000);
    pending.set(key,{resolve:value=>{clearTimeout(timer);resolve(value);},reject:error=>{clearTimeout(timer);reject(error);}});ws.send(JSON.stringify({id:key,method,params}));
  });
  const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result?.value;};
  const assert=(condition,message)=>{if(!condition)throw new Error(message);};
  async function ready(selector) {
    for(let i=0;i<120;i++) {
      try {if(await evaluate(`Boolean(document.querySelector(${JSON.stringify(selector)}))`)){await waitForPreview(send,selector);return;}}
      catch(error){if(!/context|navigat/i.test(String(error)))throw error;}
      await sleep(100);
    }
    throw new Error(`Not ready: ${selector}; ${await evaluate('JSON.stringify({url:location.href,storage:{...sessionStorage},text:document.body.innerText})')}`);
  }
  async function click(selector,touch=false) {
    const point=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    if(touch){await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
    else {await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});}
    return point;
  }
  async function key(key,code){await send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:code,...(key==='Enter'?{text:'\r'}:{})});await send('Input.dispatchKeyEvent',{type:'keyUp',key,windowsVirtualKeyCode:code});}

  await send('Page.enable'); await send('Runtime.enable');
  let nativeDialogs=0;
  ws.addEventListener('message',({data})=>{if(JSON.parse(data).method==='Page.javascriptDialogOpening'){nativeDialogs++;void send('Page.handleJavaScriptDialog',{accept:false});}});
  await mkdir('/tmp/ui-interactions-shots',{recursive:true});
  async function navigate(route, selector, scenario='normal') {
    await send('Page.navigate',{url:`http://127.0.0.1:5175/?scenario=${scenario}#${route}`});await ready(selector);
  }
  async function textClick(text,selector='button') {
    let target;
    for(let attempt=0;attempt<100;attempt++) {
      target=await evaluate(`(()=>{const e=[...document.querySelectorAll(${JSON.stringify(selector)})].find(e=>e.getBoundingClientRect().width&&e.textContent.includes(${JSON.stringify(text)}));if(!e)return null;e.dataset.checkAction='';return '[data-check-action]';})()`);
      if(target)break;
      await sleep(100);
    }
    if(!target)throw new Error('Missing action: '+text);
    await click(target);await evaluate(`document.querySelector('[data-check-action]')?.removeAttribute('data-check-action')`);
  }
  async function fill(selector,value) {
    await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  }
  async function shot(name) {const result=await send('Page.captureScreenshot',{format:'png'});await writeFile(`/tmp/ui-interactions-shots/${name}.png`,Buffer.from(result.data,'base64'));}
  async function checkButtons() {
    const failures=await evaluate(`(()=>{
      const failures=[];
      for(const button of document.querySelectorAll('button.ui-button')){
        const box=button.getBoundingClientRect(),style=getComputedStyle(button),content=button.querySelector(':scope>span');
        if(!content||!box.width||box.bottom<0||box.top>innerHeight||style.justifyContent!=='center')continue;
        if([...content.querySelectorAll('.truncate')].some(e=>e.scrollWidth>e.clientWidth+1))continue;
        const rects=[...content.querySelectorAll('svg')].map(e=>e.getBoundingClientRect());
        const walker=document.createTreeWalker(content,NodeFilter.SHOW_TEXT);let node;
        while(node=walker.nextNode()){if(!node.textContent.trim()||node.parentElement.closest('svg'))continue;const range=document.createRange();range.selectNodeContents(node);rects.push(range.getBoundingClientRect());}
        const visible=rects.filter(r=>r.width>0&&r.height>0);if(!visible.length)continue;
        const x=Math.min(...visible.map(r=>r.x)),right=Math.max(...visible.map(r=>r.right)),top=Math.min(...visible.map(r=>r.top)),bottom=Math.max(...visible.map(r=>r.bottom));
        if(Math.abs((x+right)/2-box.x-box.width/2)>1.5||Math.abs((top+bottom)/2-box.y-box.height/2)>1.5)failures.push({label:button.textContent.trim(),dx:(x+right)/2-box.x-box.width/2,dy:(top+bottom)/2-box.y-box.height/2});
      }return failures;
    })()`);
    assert(!failures.length,'Off-center buttons: '+JSON.stringify(failures));
  }
  for(const theme of ['light','dark']) for(const width of [320,768,1440]) {
    const mobile=width<768;
    const init=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('yuhaiin.theme','${theme}');localStorage.setItem('yuhaiin.accent','olive');`});
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile});
    await navigate('/docs/bypass/resolver','[role=tab]');
    await textClick('Encrypted DNS','aside button');await ready('input[value="Encrypted DNS"]');
    await fill('input[value="Encrypted DNS"]','Draft DNS');
    await waitForPreview(send,'input[value="Draft DNS"]');await checkButtons();await shot(`${theme}-${width}-dns-editor`);
    await click('[role=tab]:nth-child(4)');await ready('[role=dialog]');
    await key('Escape',27);await ready('input[value="Draft DNS"]');
    assert(await evaluate(`document.querySelector('[role=tab][data-state=active]').textContent.includes('Resolvers')`),'Cancel changed the DNS tab');
    await click('[role=tab]:nth-child(4)');await ready('[role=dialog]');await textClick('OK','[role=dialog] button');
    const tabFrames=await evaluate(`new Promise(resolve=>{const values=[];let n=0;function frame(){const e=document.querySelector('[data-ui-transition=tab]');if(e)values.push(Number(getComputedStyle(e).opacity));if(++n<16)requestAnimationFrame(frame);else resolve(values);}frame();})`);
    assert(tabFrames.some(v=>v>.01&&v<.99),'Tab content has no entrance animation');
    await ready('[role=tabpanel]');await checkButtons();
    assert(nativeDialogs===0,'Native confirmation appeared');
    await shot(`${theme}-${width}-dns`);

    await navigate('/docs/config/log','[data-log-id]');
    const controls=await evaluate(`['Clear logs','Pause collection'].map(label=>{const e=document.querySelector('button[aria-label="'+label+'"]');return e?.getBoundingClientRect().height;})`);
    assert(controls.every(h=>h===(mobile?44:32)),'Log control heights: '+JSON.stringify(controls));
    await checkButtons();await shot(`${theme}-${width}-logs`);

    await navigate('/docs/config/about','a[href*="/commit/"]','ui-long');
    assert(await evaluate(`(()=>{return [...document.querySelectorAll('a[href*="github.com/yuhaiin/yuhaiin"]')].filter(e=>e.querySelector('svg')).every(e=>{const text=e.querySelector('span').getBoundingClientRect(),icon=e.querySelector('svg').getBoundingClientRect();return Math.abs(text.y+text.height/2-icon.y-icon.height/2)<1&&Math.abs(icon.x-text.right)<=12;});})()`),'External icon is detached from its label');
    assert(!await evaluate('document.documentElement.scrollWidth>innerWidth+1'),'About page overflows');
    await checkButtons();await shot(`${theme}-${width}-about`);

    await navigate('/docs/inbound?inbound=inbound-local','input[value="Local proxy"]');
    await textClick('Advanced editor');await ready('input[value="Local proxy"]');
    const gap=await evaluate(`(()=>{const input=document.querySelector('input[value="Local proxy"]'),heading=[...document.querySelectorAll('h3')].find(e=>e.textContent==='Network'),section=heading.closest('section');return {gap:section.getBoundingClientRect().top-input.getBoundingClientRect().bottom,padding:parseFloat(getComputedStyle(section).paddingTop)};})()`);
    assert(gap.gap>=12&&gap.padding>=16,'Advanced input touches its divider: '+JSON.stringify(gap));
    await checkButtons();await shot(`${theme}-${width}-inbound`);
    await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:init.identifier});
    console.log(`Verified ${theme}/${width}: async discard/cancel, animated tabs, button centering, log sizing, external links and form spacing`);
  }
  // Audit the other shared-button consumers as well, including Japanese narrow layouts.
  for(const width of [320,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<768});
    for(const [name,route,selector] of [
      ['nodes','/docs/group','aside button'],['selectors','/docs/group/selectors','aside button'],
      ['publish','/docs/group/publish','aside button'],['subscriptions','/docs/group/subscribe','aside button'],
      ['routing','/docs/bypass','aside button'],['config','/docs/config','[role=slider]'],
    ]) {
      await navigate(route,selector);
      if(width===320){await evaluate(`import('/src/i18n/index.ts').then(m=>m.default.changeLanguage('ja'))`);await waitForPreview(send,selector);}
      await checkButtons();
      assert(!await evaluate('document.documentElement.scrollWidth>innerWidth+1'),`Page overflows: ${name}/${width}`);
      await shot(`${name}-${width}`);
    }
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:'http://127.0.0.1:5175/?gallery=1'});await ready('[data-gallery-ready]');
  await evaluate(`document.querySelector('[aria-label=Limit]').focus()`);await key('Home',36);await waitForPreview(send,'[data-gallery-ready]');
  await key('End',35);
  const sliderFrames=await evaluate(`new Promise(resolve=>{const positions=[];let n=0;function frame(){positions.push(document.querySelector('[aria-label=Limit]').getBoundingClientRect().x);if(++n<25)requestAnimationFrame(frame);else resolve(positions);}frame();})`);
  assert(new Set(sliderFrames.map(x=>Math.round(x))).size>5,'Slider jumps directly to its new value');
  await waitForPreview(send,'[data-gallery-ready]');await checkButtons();await shot('gallery-slider');
  await textClick('Test load');await waitForPreview(send,'[data-gallery-ready]');await checkButtons();

  await navigate('/docs/config/about','a[href*="/commit/"]','update');
  await textClick('Check for Updates');await ready('button');await textClick('Update to v2.0.0');
  await ready('[data-update-phase=restarting]');
  assert(!await evaluate(`Boolean(document.querySelector('[data-update-phase=complete]'))`),'Installer completion falsely reported update success');
  await ready('[data-update-phase=complete]');
  assert(await evaluate(`document.body.textContent.includes('v2.0.0')`),'Recovered version did not refresh');
  await shot('verified-update');
  await evaluate('sessionStorage.clear()');
  await send('Page.navigate',{url:'about:blank'});await ready('body');
  await navigate('/docs/config/about','a[href*="/commit/"]','update');
  await textClick('Check for Updates');await textClick('Update to v2.0.0');
  // Reload during the synthetic backend outage; the real pending target must survive.
  await evaluate(`new Promise(resolve=>setTimeout(resolve,Math.max(0,Number(sessionStorage.getItem('preview:updateStartedAt'))+3100-Date.now())))`);
  await send('Page.reload');await ready('[data-update-phase=complete]');
  assert(await evaluate(`document.body.textContent.includes('v2.0.0')`),'Reload lost the pending update verification');
  await shot('verified-update-after-reload');
  assert(nativeDialogs===0,'Unexpected native browser dialog');
  console.log('Verified animated slider, centered loading labels and restart/version verification; no browser dialogs');
} finally {
  ws?.close();
  const exited=new Promise(resolve=>chrome.once('exit',resolve));chrome.kill('SIGTERM');await exited;
  await rm(profile,{recursive:true,force:true,maxRetries:3});
}
