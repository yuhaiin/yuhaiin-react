// Real browser coverage for table breakpoints, sorting, virtual rows and modal motion.
// Uses Chrome's built-in CDP; no browser test dependency or personal profile.
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';
import { waitForPreview } from './preview-ready.mjs';
const profile = await mkdtemp(`${tmpdir()}/yuhaiin-connections-`);
const chrome = spawn(process.env.CHROME_PATH || 'google-chrome', ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--no-first-run', '--remote-allow-origins=*', '--remote-debugging-port=9232', `--user-data-dir=${profile}`, 'about:blank'], {stdio:'ignore'});
let ws;
try {
  for (let i=0; i<80; i++) {
    try {
      const pages=await (await fetch('http://127.0.0.1:9232/json/list')).json();
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
    throw new Error(`Not ready: ${selector}`);
  }
  async function click(selector,touch=false) {
    const point=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    if(touch){await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
    else {await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});}
    return point;
  }
  async function key(key,code){await send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:code,...(key==='Enter'?{text:'\r'}:{})});await send('Input.dispatchKeyEvent',{type:'keyUp',key,windowsVirtualKeyCode:code});}
  async function assertDialogBounce() {
  const scales=await evaluate(`new Promise(resolve=>{const values=[];let i=0;function frame(){const e=document.querySelector('[role="dialog"]');if(e)values.push(new DOMMatrix(getComputedStyle(e).transform).a);if(++i<30)requestAnimationFrame(frame);else resolve(values);}frame();})`);
  assert(scales.some(value=>value<0.5)&&scales.some(value=>value>1.01),'Dialog lost its original expanding spring bounce');
  }
  const firstId=()=>evaluate(`document.querySelector('[data-connection-id]')?.dataset.connectionId`);
  const table='[role="table"]', row='[data-connection-id]';
  await send('Page.enable'); await send('Runtime.enable');
  await mkdir('/tmp/connections-shots',{recursive:true});
  for(const theme of ['light','dark']) for(const [width,height] of [[320,844],[390,844],[767,844],[320,568],[640,360],[844,390],[768,1000],[1440,1000],[1920,1000]]) {
    const mobile=width<768;
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile});
    await send('Emulation.setTouchEmulationEnabled',{enabled:mobile});
    const init=await send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem('yuhaiin.theme',${JSON.stringify(theme)});localStorage.setItem('yuhaiin.accent','olive');`});
    await send('Page.navigate',{url:`http://127.0.0.1:5175/?scenario=connections&check=${theme}-${width}#/docs/connections/v2`});
    await ready(row);
    // Use real translated resources, including long labels on the mobile toolbar.
    if(width===390||width===768) {await evaluate(`import('/src/i18n/index.ts').then(m=>m.default.changeLanguage(${JSON.stringify(width===390?'ja':'ko')}))`);await waitForPreview(send,row);}
    const metrics=await evaluate(`(()=>{const visible=e=>e.getBoundingClientRect().width>0, r=document.querySelector('${row}'),cells=[...r.querySelectorAll('[role="cell"]')].filter(visible),headers=[...document.querySelectorAll('[role="columnheader"]')].filter(visible),box=r.getBoundingClientRect();return {listHeight:[...document.querySelectorAll('${table} [role=rowgroup]')].find(group=>group.querySelector('${row}'))?.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth+1,height:box.height,count:document.querySelectorAll('${row}').length,headerCount:headers.length,bodyAligned:cells.every((cell,i)=>{const content=cell.querySelector('button')||cell,style=getComputedStyle(content),numeric=i>=cells.length-2;return style.display==='flex'?style.justifyContent===(numeric?'flex-end':'normal'):style.textAlign==='left'||style.textAlign==='start';}),headersAligned:headers.every((h,i)=>{const label=h.querySelector('button .truncate')||h,range=document.createRange();range.selectNodeContents(label);const text=range.getBoundingClientRect(),box=h.getBoundingClientRect();return i>=headers.length-2?Math.abs(text.right-box.right)<1:Math.abs(text.x-box.x)<1;}),topGap:[...document.querySelectorAll('main button[aria-label]')].find(visible).getBoundingClientRect().top-(document.querySelector('header.fixed')?.getBoundingClientRect().bottom||0),positions:[headers.map(h=>h.getBoundingClientRect().x),cells.map(c=>c.getBoundingClientRect().x)],aligned:headers.every((h,i)=>Math.abs(h.getBoundingClientRect().x-cells[i].getBoundingClientRect().x)<=5),clipped:cells.some(e=>{const b=e.getBoundingClientRect();return b.x<box.x-1||b.right>box.right+1;}),buttons:[...document.querySelectorAll('main button')].filter(e=>visible(e)&&!e.closest('${table}')).map(e=>({h:e.getBoundingClientRect().height,w:e.getBoundingClientRect().width})),metadataBelowTarget:cells[1].getBoundingClientRect().bottom<=cells[2].getBoundingClientRect().top+1};})()`);
    assert(!metrics.overflow&&!metrics.clipped,`Overflow at ${width}: ${JSON.stringify(metrics)}`);
    assert(metrics.height===(mobile?92:52),`Virtual row height at ${width}: ${metrics.height}`);
    assert(metrics.count<95,`Virtualization missing at ${width}`);
    if(mobile&&height>=800) assert(metrics.listHeight>=height*.62,`Mobile list is squeezed at ${width}x${height}: ${metrics.listHeight}px`);
    if(height<=500) assert(metrics.listHeight>=(mobile?92:104),`Short viewport cannot show full connection rows at ${width}x${height}: ${metrics.listHeight}px`);
    if(width<1024) assert(metrics.topGap>=12,`Missing top spacing at ${width}`);
    assert(await evaluate(`(()=>{const r=document.querySelector('${row}'),exit=r.querySelector('[role=cell] > span[title]');return innerWidth>=1280||Boolean(exit&&exit.getBoundingClientRect().height);})()`),'Shared exit hidden on narrow screens');
    if(mobile) assert(metrics.headerCount===0&&metrics.metadataBelowTarget&&metrics.buttons.every(b=>b.h>=44&&b.w>=44),`Mobile layout at ${width}: ${JSON.stringify(metrics)}`);
    else assert(metrics.aligned&&metrics.headersAligned&&metrics.bodyAligned&&metrics.headerCount===(width>=1280?7:6),`Column alignment at ${width}: ${JSON.stringify(metrics)}`);
    const shot=await send('Page.captureScreenshot',{format:'png'});await writeFile(`/tmp/connections-shots/${theme}-${width}-${height}.png`,Buffer.from(shot.data,'base64'));
    if(width===320||width===1440) {
      if(mobile) await click('main button[title="Asc"]',true);
      else await click('[role="columnheader"]:first-child button');
      await waitForPreview(send,row);assert(await firstId()==='1','Ascending ID order failed');
      if(mobile) {
        await click('main button[role="combobox"]',true);await ready('[role="listbox"]');await click('[role="option"][data-state="unchecked"]:last-child',true);
        await waitForPreview(send,table);
        // The last option is upload; descending upload puts ID 1 first.
        await click('main button[title="Desc"]',true);
      } else {
        await click('[role="columnheader"]:last-child button'); // upload ascending
        await waitForPreview(send,row);assert(await firstId()==='9999999999','Ascending upload order failed');
        await click('[role="columnheader"]:last-child button');
      }
      await waitForPreview(send,row);assert(await firstId()==='1','Descending upload order failed: '+await evaluate(`JSON.stringify({id:document.querySelector('[data-connection-id]')?.dataset.connectionId,sort:document.querySelector('main button[role=combobox]')?.textContent,direction:document.querySelector('main button[title]')?.title,row:document.querySelector('[data-connection-id]')?.textContent})`));
      // Native keyboard activation and touch both retain the detail dialog.
      const fullAddress=await evaluate(`document.querySelector('${row} button').title`);
      if(mobile) await click(`${row} button`,true);
      else {await evaluate(`document.querySelector('${row} button').focus()`);await key('Enter',13);}
      await assertDialogBounce();
      await ready('[role="dialog"]');
      assert(await evaluate(`(()=>{const d=document.querySelector('[role="dialog"]');return d.textContent.includes(${JSON.stringify(fullAddress)})&&[d,...d.querySelectorAll('li')].every(e=>e.scrollWidth<=e.clientWidth+1);})()`),'Long host is missing or overflows in details');
      assert(await evaluate(`document.querySelector('[role="dialog"]').contains(document.activeElement)`),'Dialog did not receive focus');
      for(let i=0;i<8;i++)await key('Tab',9);
      assert(await evaluate(`document.querySelector('[role="dialog"]').contains(document.activeElement)`),'Focus escaped dialog');
      await closeWithMotion('escape',table);
      assert(!await evaluate(`Boolean(document.querySelector('[role="dialog"]'))`),'Escape failed');
      if(mobile) {await click('main button[title="Asc"]',true);}
      else {await click('[role="columnheader"]:first-child button');}
      await waitForPreview(send,row);
    }
    // Scroll the virtual list to ensure measured row heights do not accumulate gaps.
    await evaluate(`(()=>{let e=document.querySelector('${row}').parentElement;while(e&&e.scrollHeight<=e.clientHeight+1)e=e.parentElement;if(!e)throw Error('Missing list scroller');e.scrollTop=e.scrollHeight;})()`);
    await waitForPreview(send,row);
    assert(await evaluate(`(()=>{const rows=[...document.querySelectorAll('${row}')].map(e=>e.getBoundingClientRect()).sort((a,b)=>a.y-b.y);return rows.every((r,i)=>!i||Math.abs(r.y-rows[i-1].bottom)<1);})()`),`Virtual row gaps at ${width}`);
    await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:init.identifier});
    console.log(`Verified ${theme}/${width}x${height}: list ${metrics.listHeight}px, layout, touch targets, columns and virtual scrolling`);
  }
  // Below the virtualization threshold the same component and keyboard action apply.
  await send('Page.navigate',{url:'http://127.0.0.1:5175/?scenario=connections-small#/docs/connections/v2'});await ready(row);
  assert(await evaluate(`document.querySelectorAll('${row}').length`)===3,'Small list did not render');
  await send('Page.navigate',{url:'http://127.0.0.1:5175/?scenario=empty#/docs/connections/v2'});await ready(table);
  assert(await evaluate(`document.querySelectorAll('${row}').length`)===0,'Empty list did not render');
  // Verify opening scale and viewport-to-dialog origin conversion, plus reduced motion.
  await send('Page.navigate',{url:'http://127.0.0.1:5175/?gallery=1&motion=connections'});await ready('[data-gallery-ready]');
  await evaluate(`(()=>{const e=[...document.querySelectorAll('button')].find(e=>e.textContent.trim()==='Open dialog');e.dataset.motionTrigger='';e.scrollIntoView({block:'center'});})()`);
  const point=await click('[data-motion-trigger]');
  await assertDialogBounce();
  await ready('[role="dialog"]');
  const origin=await evaluate(`(()=>{const e=document.querySelector('[role="dialog"]'),r=e.getBoundingClientRect(),o=getComputedStyle(e).transformOrigin.split(' ').map(parseFloat);return {ok:Math.abs(o[0]+r.x-${point.x})<1&&Math.abs(o[1]+r.y-${point.y})<1,origin:o,rect:[r.x,r.y,r.width,r.height],click:${JSON.stringify(point)}};})()`);
  assert(origin.ok,'Dialog origin differs from clicked viewport position: '+JSON.stringify(origin));
  // Observe the actual close event, rather than starting a timer before CDP dispatch.
  async function closeWithMotion(action, readySelector='[data-gallery-ready]') {
    const event=action==='escape'?'keydown':'click';
    await evaluate(`window.modalExitFrames=new Promise(resolve=>{document.addEventListener('${event}',()=>{const start=performance.now(),frames=[],content=document.querySelector('[role="dialog"]').textContent;function sample(){const d=document.querySelector('[role="dialog"]');if(!d){resolve(frames);return;}frames.push({time:performance.now()-start,opacity:Number(getComputedStyle(d).opacity),scale:new DOMMatrix(getComputedStyle(d).transform).a,sameContent:d.textContent===content});if(performance.now()-start>700){resolve(frames);return;}requestAnimationFrame(sample);}requestAnimationFrame(sample);},{once:true,capture:true});});true`);
    if(action==='escape') await key('Escape',27);
    else if(action==='button') await click('[role="dialog"] button[aria-label="Close"]');
    else {await send('Input.dispatchMouseEvent',{type:'mousePressed',x:10,y:10,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:10,y:10,button:'left',clickCount:1});}
    const frames=await evaluate('window.modalExitFrames');
    assert(frames.some(f=>f.time>=140&&f.time<200&&f.opacity>.01&&f.scale<.99),`Closing motion too brief or absent (${action}): ${JSON.stringify(frames)}`);
    assert(frames.some(f=>f.opacity>.01&&f.scale<.5),`Closing dialog did not shrink back toward its trigger (${action})`);
    assert(frames.every(f=>f.sameContent),`Closing content changed before exit finished (${action})`);
    await waitForPreview(send,readySelector);
    assert(!await evaluate(`Boolean(document.querySelector('[role="dialog"]'))`),`Dialog remained after closing (${action})`);
  }
  for(const action of ['escape','button','overlay']) {
    if(action!=='escape'){await click('[data-motion-trigger]');await ready('[role="dialog"]');}
    await closeWithMotion(action);
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await click('[data-motion-trigger]');await ready('[role="dialog"]');
  assert(await evaluate(`new DOMMatrix(getComputedStyle(document.querySelector('[role="dialog"]')).transform).a`)===1,'Reduced motion still scales');
  await key('Escape',27);await waitForPreview(send,'[data-gallery-ready]');
  assert(!await evaluate(`Boolean(document.querySelector('[data-ui-transition=overlay]'))`),'Reduced-motion overlay lingered after closing');
  console.log('Verified small/empty lists, dialog origin/scale, original spring bounce and shrink-back via Escape/button/overlay and reduced motion');
} finally {
  ws?.close();
  const exited=new Promise(resolve=>chrome.once('exit',resolve));chrome.kill('SIGTERM');await exited;
  await rm(profile,{recursive:true,force:true,maxRetries:3});
}
