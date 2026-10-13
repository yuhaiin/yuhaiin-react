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
if (scenario === 'vpn') {
  nodes[0] = { ...nodes[0], name:'OpenVPN test node', chain:[{type:'openvpn',openvpn:{gateway:'vpn.example.invalid:1194',network:'udp',username:'alice',tls_crypt_key:'synthetic-static-key',auto_reconnect:true,mtu:1400}}] };
  nodes[1] = { ...nodes[1], name:'GlobalProtect ESP test node', chain:[{type:'globalprotect',globalprotect:{gateway:'gp.example.invalid',username:'alice',use_esp:true}}] };
}
if (scenario === 'l2tp') {
  nodes[0] = { ...nodes[0], name:'L2TP test node', chain:[{type:'l2tp',l2tp:{gateway:'vpn.example.invalid:1701',username:'alice',auth_type:'mschap-v2',ipv6:true,ipv6_address:'fd88::2/64',mtu:1400}}] };
  nodes[1] = { ...nodes[1], name:'L2TPv3 test node', chain:[{type:'l2tpv3',l2tpv3:{gateway:'vpn.example.invalid:1701',static:true,local_session_id:4294967295,peer_session_id:200,local_cookie:'1122334455667788',peer_cookie:'aabbccdd',sublayer:true,address:'10.89.0.2/24',router:'10.89.0.1',ipv6_address:'fd89::2/64',ipv6_router:'fd89::1',mtu:1400}}] };
}
const connections = Array.from({length:size},(_,i)=>({id:String(i+1),addr:i===0?'very-long-host-name-for-mobile-layout-testing.example.invalid:443':`host-${i}.example.invalid:443`,network:{connType:i===0?'udp':'tcp',underlyingType:'tcp'},mode:'proxy',ruleId:'rule-0',ruleName:'Work traffic',selectorId:'selector-work',selectorName:'Work destination',inboundId:'inbound-local',inboundName:'Local proxy',domain:`host-${i}.example.invalid`,process:'audit-process',nodeId:'node-0',nodeName:'Mobile test node',lists:['shared-websites'],listNames:{'shared-websites':'Work websites'},matchHistory:[{ruleId:'rule-0',ruleName:'Work traffic',history:[{kind:'list',id:'shared-websites',listName:'Work websites',matched:true}]}]}));
const history = connections.map((connection,i)=>({connection,time:new Date(1790992800000-i*1000).toISOString(),count:String(i+1)}));
let settings=createDefaultSettings(); let total=0;
let savedRevision=1, appliedRevision=1, applyAttempts=0;
let routeConfig={revision:0,defaultMode:'proxy',defaultTarget:{type:'default'},directResolver:'dns-local',proxyResolver:'dns-proxy',resolveLocally:false,udpProxyFqdnStrategy:'default'};
let runningConfig=structuredClone(routeConfig);
let listConfig={revision:0,refreshInterval:'3600',lastRefreshTime:'0',error:'',hostIndexDisk:false,maxMindDbGeoIp:{downloadUrl:'',error:''}};
let inboundConfig={hijackDns:true,hijackDnsFakeIp:false,sniff:true};
let resolverServer={server:''},fakeDNS={enabled:false,ipv4Range:'198.18.0.0/15',ipv6Range:'fc00::/18'},resolverHosts={hosts:{}};
let selected={tcpId:nodes[0]?.id,udpId:nodes[0]?.id};
const failedImports=new Set();
const selectors=[{id:'selector-work',name:'Work destination',nodeId:nodes[0]?.id||'',revision:1}];
const resolvers=[{id:'bootstrap',name:'Server address lookup',type:'system',host:'system default',system:true},{id:'dns-local',name:'Local network DNS',type:'system',host:'system default',system:true},{id:'dns-proxy',name:'Encrypted DNS',type:'doh',host:'https://dns.example.invalid/dns-query',system:false}];
const inbounds=scenario==='empty'?[]:[{id:'inbound-local',name:'Local proxy',enabled:true,network:{type:'tcp_udp',tcp_udp:{host:'127.0.0.1:9002',udp:'enabled'}},transports:[],protocol:{type:'mixed',mixed:{username:'',password:''}}}];
const lists=[{id:'shared-websites',name:'Work websites',revision:1,type:'host',source:{type:'local',local:{lists:['example.invalid','*.work.example']}}}];
const rules=scenario==='empty'?[]:Array.from({length:35},(_,i)=>({rule:{id:`rule-${i}`,revision:1,name:i===0?'Work traffic':`Rule ${i}`,mode:'proxy',target:{type:'selector',id:'selector-work'},rules:[{type:'host',host:{list:'shared-websites'}}]},lists:[]}));
const bump=()=>{savedRevision++;};
const errorResponse=(message,status=400)=>HttpResponse.json({error:{message}},{status});
const upsert=(items,item)=>{const index=items.findIndex(value=>value.id===item.id);if(index<0)items.push(item);else items[index]=item;return item;};
const remove=(items,id)=>{const index=items.findIndex(value=>value.id===id);if(index>=0)items.splice(index,1);};
const references=(predicate)=>({items:rules.filter(draft=>predicate(draft.rule)).map(draft=>({kind:'rule',id:draft.rule.id,name:draft.rule.name}))});

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
    if(op==='nodes.groups') {
      const byGroup=new Map();
      for(const node of nodes){const name=node.group||'manual';const entry=byGroup.get(name)||{name,count:0,enabled:0};entry.count++;if(node.enabled)entry.enabled++;byGroup.set(name,entry);}
      result={items:[...byGroup.values()].sort((a,b)=>a.name.localeCompare(b.name))};
    }
    else if(op==='nodes.get') result=page(nodes.filter(n=>(!p.group||(n.group||'manual')===p.group)&&(!p.enabled_only||n.enabled)&&(!p.query||`${n.name} ${n.group}`.toLowerCase().includes(p.query.toLowerCase()))),p);
    else if(op==='node.get'){result=nodes.find(n=>n.id===p.id);if(!result)return errorResponse('Node no longer exists',404);}
    else if(op==='node.put'){ const index=nodes.findIndex(n=>n.id===p.id); if(index>=0) nodes[index]=p; result=p; }
    else if(op==='node.extra' && scenario==='l2tp') result={ [p.id==='node-1'?'l2tpv3':'l2tp']: {tunnel_prefixes:['10.89.0.2/24','fd89::2/64'],dns:['10.89.0.1'],auth:p.id==='node-1'?'':'mschap-v2',mtu:1400,local_session_id:4294967295,peer_session_id:200} };
    else if(op==='node.extra') result=p.id==='node-1'
      ? {globalprotect:{tunnel_prefix:'192.0.2.8/32',data_transport:'esp',dns:['192.0.2.1']}}
      : {openvpn:{tunnel_prefixes:['10.88.0.2/24','fd88::2/64'],dns:['10.88.0.1'],routes:['route 10.99.0.0 255.255.0.0'],cipher:'AES-256-GCM',gateway:'10.88.0.1',mtu:1400}};
    else if(op==='nodes.selected') result={tcp:nodes.find(n=>n.id===selected.tcpId),udp:nodes.find(n=>n.id===selected.udpId)};
    else if(op==='nodes.select'){if(!nodes.some(n=>n.id===p.tcpId&&n.enabled)||!nodes.some(n=>n.id===p.udpId&&n.enabled))return errorResponse('Choose enabled nodes');selected=p;}
    else if(op==='node.use'){selected={tcpId:p.id,udpId:p.id};}
    else if(op==='node.delete'){remove(nodes,p.id);}
    else if(op==='node.close'){}
    else if(op==='node.latency')result={ok:true,latencyMs:36};
    else if(op==='nodes.import.preview'){
      try { const raw=JSON.parse(p.text); const items=Array.isArray(raw)?raw:[raw];result={items:items.map(node=>({...node,id:crypto.randomUUID(),name:node.name||'Imported node',enabled:true,origin:'manual',group:p.group||'manual'})),errors:[]}; }
      catch {result={items:[],errors:[{line:1,message:'This preview accepts canonical node JSON. Share-link parsing is covered by backend tests.'}]};}
    }
    else if(op==='nodes.active') result={items:nodes.slice(0,3)};
    else if(op==='nodes.post'){ if(p.name==='fail'&&!failedImports.has(p.id)){failedImports.add(p.id);return HttpResponse.json({error:{message:'Synthetic create failure'}},{status:500});} result=upsert(nodes,p); }
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
    else if(op==='route.rules.get') result=page(rules.filter(draft=>!p.query||draft.rule.name.toLowerCase().includes(p.query.toLowerCase())).map((draft,i)=>({...draft.rule,index:i+1,ruleCount:draft.rule.rules.length})),p);
    else if(op==='route.rule.get'){result=rules.find(draft=>draft.rule.id===p.id);if(!result)return errorResponse('Rule no longer exists',404);}
    else if(op==='route.rules.post'||op==='route.rule.put'){
      const current=rules.find(draft=>draft.rule.id===p.rule.id);
      if((current?.rule.revision||0)!==p.rule.revision)return errorResponse('Configuration changed; reload before saving',409);
      const privateLists=(p.lists||[]).filter(list=>!p.shareLists?.includes(list.id)).map(list=>({...list,ownerRuleId:p.rule.id}));
      for(const list of p.lists||[])if(p.shareLists?.includes(list.id))upsert(lists,{...list,ownerRuleId:'',revision:1});
      result={rule:{...p.rule,revision:(current?.rule.revision||0)+1},lists:privateLists};
      const index=rules.findIndex(draft=>draft.rule.id===result.rule.id);if(index<0)rules.push(result);else rules[index]=result;bump();
    }
    else if(op==='route.rule.delete'){const index=rules.findIndex(draft=>draft.rule.id===p.id);if(index>=0)rules.splice(index,1);bump();}
    else if(op==='route.rules.priority'){
      const source=rules.findIndex(draft=>draft.rule.id===p.source.id),target=rules.findIndex(draft=>draft.rule.id===p.target.id);
      if(p.operate==='exchange')[rules[source],rules[target]]=[rules[target],rules[source]];
      else{const [item]=rules.splice(source,1);const to=rules.findIndex(draft=>draft.rule.id===p.target.id);rules.splice(to+(p.operate==='insert_after'?1:0),0,item);}bump();
    }
    else if(op==='route.config.get')result=routeConfig;
    else if(op==='route.config.put'){if(p.revision!==routeConfig.revision)return errorResponse('Configuration changed; reload before saving',409);result=routeConfig={...p,revision:p.revision+1};bump();}
    else if(op==='route.activation')result={savedRevision,appliedRevision,runningConfig,ruleApplyAt:0,hostIndexRefreshAt:0,error:scenario==='apply-error'&&applyAttempts===1?'Synthetic preparation failure':''};
    else if(op==='route.apply'){if(scenario==='apply-error'&&++applyAttempts===1)return errorResponse('Synthetic preparation failure',500);appliedRevision=savedRevision;runningConfig=structuredClone(routeConfig);}
    else if(op==='route.lists.get')result=page(lists.map(list=>({...list,source:list.source.type,itemCount:list.source.local?.lists.length||0,errorCount:0,preview:list.source.local?.lists[0]||''})),p);
    else if(op==='route.list.get'){result=lists.find(list=>list.id===p.id);if(!result)return errorResponse('Shared matching data no longer exists',404);}
    else if(op==='route.lists.post'||op==='route.list.put'){const old=lists.find(list=>list.id===p.id);if((old?.revision||0)!==p.revision)return errorResponse('Configuration changed; reload before saving',409);result=upsert(lists,{...p,id:p.id||crypto.randomUUID(),revision:(old?.revision||0)+1});bump();}
    else if(op==='route.list.delete'){remove(lists,p.id);bump();}
    else if(op==='route.lists.config.get')result=listConfig;
    else if(op==='route.lists.config.put'){result=listConfig={...p,revision:p.revision+1};bump();}
    else if(op==='route.lists.activation')result={hostIndexRefreshAt:0};
    else if(op==='route.lists.refresh'){}
    else if(op==='route.registries.get'||op==='route.registries.catalogs')result={items:[]};
    else if(op==='route.rules.test')result={mode:'proxy',target:{type:'selector',id:'selector-work'},resolver:'dns-proxy',afterAddr:p.host,lists:['shared-websites'],listNames:{'shared-websites':'Work websites'},ips:['192.0.2.1'],matchResult:connections[0]?.matchHistory||[]};
    else if(op==='route.rules.block_history')result={items:[]};
    else if(op==='outbound.selectors.get')result={items:selectors};
    else if(op==='outbound.selector.put'){const old=selectors.find(item=>item.id===p.id);if((old?.revision||0)!==p.revision)return errorResponse('Configuration changed; reload before saving',409);result=upsert(selectors,{...p,id:p.id||crypto.randomUUID(),revision:p.revision+1});}
    else if(op==='outbound.selector.references')result=references(rule=>rule.target?.type==='selector'&&rule.target.id===p.id);
    else if(op==='outbound.selector.delete'){remove(selectors,p.id);}
    else if(op==='resolvers.get')result=page(resolvers,p);
    else if(op==='resolver.get'){result=resolvers.find(item=>item.id===p.id);if(!result)return errorResponse('Resolver no longer exists',404);}
    else if(op==='resolvers.post'||op==='resolver.put')result=upsert(resolvers,{...p,id:p.id||crypto.randomUUID()});
    else if(op==='resolver.delete'){remove(resolvers,p.id);}
    else if(op==='resolver.hosts.get')result=resolverHosts;
    else if(op==='resolver.hosts.put')result=resolverHosts=p;
    else if(op==='resolver.fakedns.get')result=fakeDNS;
    else if(op==='resolver.fakedns.put')result=fakeDNS=p;
    else if(op==='resolver.server.get')result=resolverServer;
    else if(op==='resolver.server.put')result=resolverServer=p;
    else if(op==='resolver.cache.get')result={items:[]};
    else if(op==='resolver.cache.delete')result={removed:0};
    else if(op==='inbound.capabilities')result={platform:'linux',protocols:['mixed','http','socks5','socks4a','redir','tproxy','tun','yuubinsya','hysteria2']};
    else if(op==='inbounds.get')result=page(inbounds,p);
    else if(op==='inbound.get'){result=inbounds.find(item=>item.id===p.id);if(!result)return errorResponse('Inbound no longer exists',404);}
    else if(op==='inbounds.post'||op==='inbound.put')result=upsert(inbounds,p);
    else if(op==='inbound.delete'){remove(inbounds,p.id);}
    else if(op==='inbounds.status')result={items:inbounds.map(item=>({id:item.id,name:item.name,enabled:item.enabled,status:item.enabled?'running':'disabled',changedAt:Date.now(),listeners:[{kind:item.protocol.type,state:item.enabled?'running':'disabled',listen:item.network.tcp_udp?.host,changedAt:Date.now()}],statistics:{acceptedStreams:'4',receivedPackets:'3',receivedPings:'0'}}))};
    else if(op==='inbound.events')result={items:[]};
    else if(op==='inbound.retry'){}
    else if(op==='inbounds.config.get')result=inboundConfig;
    else if(op==='inbounds.config.put')result=inboundConfig=p;
    else if(op==='subscriptions.get'||op==='publishes')result={items:[]};
    else if(op==='subscriptions.put'||op==='subscriptions.delete'||op==='subscriptions.update'){}
    else if(op==='tools.diagnostics')result={schemaVersion:1,host:p.host,platform:'linux',version:'preview',startedAt:new Date().toISOString(),durationMs:12,ipv6Enabled:true,checks:[],findings:[],report:`Synthetic diagnostics for ${p.host}`};
    else if(op==='info')result={version:'UX preview',platform:'linux',goVersion:'go1.27',arch:'amd64'};
    else return HttpResponse.json({error:{message:`Unmocked operation: ${op}`}},{status:501});
    return HttpResponse.json(result);
  }),
  http.all(/^https?:\/\/[^/]+\/api\//,()=>HttpResponse.json({error:{message:'Unmocked API blocked by audit harness'}},{status:501}))
);
await worker.start({quiet:true,onUnhandledRequest:'bypass',serviceWorker:{url:'/mockServiceWorker.js'}});
await import('/src/main.tsx');
