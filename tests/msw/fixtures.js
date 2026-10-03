import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import { createDefaultSettings } from '/src/contract/settings.ts';
const scenario = new URLSearchParams(location.search).get('scenario') || 'normal';
// The preview has its own localhost origin and never connects to a configured controller.
localStorage.setItem('api_url_v2', JSON.stringify(''));
localStorage.setItem('auth_token', 'synthetic-msw-token');
localStorage.setItem('yuhaiin.webui.language','en');
const size = scenario === 'large' ? 2000 : scenario === 'empty' ? 0 : 95;
const nodes = Array.from({length:size},(_,i)=>({id:`node-${i}`,name:i===0?'Mobile test node with a very long name for narrow screens':`Node ${i}`,group:'manual',origin:'manual',enabled:true,chain:[{type:'http_mock',http_mock:{data:'YQ=='}}]}));
const connections = Array.from({length:size},(_,i)=>({id:String(i+1),addr:i===0?'very-long-host-name-for-mobile-layout-testing.example.invalid:443':`host-${i}.example.invalid:443`,network:{connType:i===0?'udp':'tcp',underlyingType:'tcp'},mode:'proxy',tag:'mobile-regression-test-tag-with-long-name',process:'audit-process',nodeId:'node-0',nodeName:'Mobile test node',lists:[],matchHistory:[]}));
const history = connections.map((connection,i)=>({connection,time:new Date(1790992800000-i*1000).toISOString(),count:String(i+1)}));
let settings=createDefaultSettings(); let total=0;
const page = (items, request) => {
  const pageSize = Math.min(100, Math.max(1, Number(request.page_size || 12)));
  const index = Math.max(1, Number(request.page || 1));
  return { items: items.slice((index - 1) * pageSize, index * pageSize), page: { page: index, pageSize, total: items.length } };
};
function stream(event,payload,repeat=false){
  const encoder=new TextEncoder(); let timer;
  return new HttpResponse(new ReadableStream({start(controller){ const send=()=>controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`));send(); if(repeat) timer=setInterval(send,1000); else timer=setInterval(()=>controller.enqueue(encoder.encode(': heartbeat\n\n')),10000); },cancel(){clearInterval(timer);}}),{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache'}});
}
const worker=setupWorker(
  http.get('/api/v2/connections/events',()=>stream('connections_added',{connections})),
  http.get('/api/v2/tools/logs/v2',()=>stream('log',{log:Array.from({length:100},(_,i)=>`time=2026-10-03T10:00:00.000+08:00 level=INFO msg="Synthetic log ${i}" source=audit extra="${'long-field-'.repeat(12)}"`)},true)),
  http.post('/api/v2/rpc/:operation',async({params,request})=>{
    const p=await request.json(); const op=params.operation;
    if(scenario==='error' && ['connections.history','node.get','route.rule.get'].includes(op)) return HttpResponse.json({error:{message:'Synthetic upstream unavailable'}},{status:503});
    let result={};
    if(op==='nodes.get') result=page(nodes,p);
    else if(op==='node.get') result=nodes.find(n=>n.id===p.id)||nodes[0];
    else if(op==='nodes.selected') result={tcp:nodes[0],udp:nodes[1]};
    else if(op==='nodes.active') result={items:nodes.slice(0,3)};
    else if(op==='nodes.post'){ if(p.name==='fail') return HttpResponse.json({error:{message:'Synthetic create failure'}},{status:500}); nodes.push(p); result=p; }
    else if(op==='connections') result={connections};
    else if(op==='connections.history') result={items:history};
    else if(op==='connections.failed_history') result={items:history.map((x,i)=>({host:x.connection.addr,protocol:'tcp',error:'Synthetic timeout',process:'audit',time:x.time,failedCount:String(i+1)}))};
    else if(op==='connections.total'){total+=1024;result={download:String(total),upload:String(total/2),counters:Object.fromEntries(connections.map(c=>[c.id,{download:String(total),upload:String(total/2)}]))};}
    else if(op==='connections.telemetry') result={groups:[{dimension:'protocol',items:[{value:'tcp',download:'2048',upload:'1024',failures:'0'}]}]};
    else if(op==='connections.traffic') result={interval:p.interval,items:[]};
    else if(op==='settings.get') result=settings;
    else if(op==='settings.put') result=(settings=p);
    else if(op==='tools.licenses') result=Object.fromEntries(['yuhaiin','android'].map(platform=>[platform,Array.from({length:platform==='yuhaiin'?60:20},(_,i)=>({name:`${platform} library ${i+1}`,license:'MIT',url:`https://example.invalid/library-${i+1}`,licenseUrl:`https://example.invalid/library-${i+1}/LICENSE`}))]));
    else if(op==='tools.interfaces') result={items:[]};
    else if(op==='route.rules.get') result=page(Array.from({length:35},(_,i)=>({name:`Rule ${i}`,index:i,mode:'proxy',tag:'',resolver:'',ruleCount:1})),p);
    else if(op==='route.rule.get') result={name:p.name,mode:'proxy',rules:[{type:'all',all:[{type:'host',host:{list:'mobile-list'}}]}]};
    else if(op==='route.lists.get') result=page([{name:'mobile-list',type:'host',source:'local',itemCount:2,errorCount:0,preview:'example.invalid'}],p);
    else if(op==='resolvers.get') result=page([{id:'bootstrap',type:'system',host:'system default',system:true}],p);
    else if(op==='resolver.hosts.get') result={hosts:{}};
    else if(op==='route.tags.get') result=page([],p);
    else if(op==='inbounds.get') result=page([],p);
    else if(op==='inbounds.status') result={items:[]};
    else return HttpResponse.json({error:{message:`Unmocked operation: ${op}`}},{status:501});
    return HttpResponse.json(result);
  }),
  http.all(/^https?:\/\/[^/]+\/api\//,()=>HttpResponse.json({error:{message:'Unmocked API blocked by audit harness'}},{status:501}))
);
await worker.start({quiet:true,onUnhandledRequest:'bypass',serviceWorker:{url:'/mockServiceWorker.js'}});
await import('/src/main.tsx');
