import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';
import { createDefaultSettings } from '/src/contract/settings.ts';
import { establishSession } from '/src/auth/session.ts';
import { operationPermissions } from '/src/auth/operations.ts';
const scenario = new URLSearchParams(location.search).get('scenario') || 'normal';
// The preview has its own localhost origin and never connects to a configured controller.
localStorage.setItem('api_url_v2', JSON.stringify(''));
const principal = { userId: 'preview-admin', credentialType: 'session', permissions: [...new Set([...Object.values(operationPermissions), 'identity:read', 'tokens:own', 'users:manage', 'tokens:manage', 'security:read', 'metrics:read'])] };
establishSession('synthetic-msw-session', principal, Math.floor(Date.now() / 1000) + 28800, '');
localStorage.setItem('yuhaiin.webui.language','en');
const size = scenario === 'lazy' ? 10000 : scenario === 'large' ? 2000 : scenario === 'empty' ? 0 : scenario === 'connections-small' ? 3 : 95;
const nodes = Array.from({length:size},(_,i)=>({id:`node-${i}`,name:i===0?'Mobile test node with a very long name for narrow screens':`Node ${i}`,group:'manual',origin:'manual',enabled:true,chain:[{type:'http_mock',http_mock:{data:'YQ=='}}]}));
if (scenario === 'lazy') {
  for (let index = 0; index < nodes.length; index++) nodes[index].group = index < 5000 ? 'manual' : index < 8000 ? 'work' : 'travel';
}
if (scenario === 'vpn') {
  nodes[0] = { ...nodes[0], name:'OpenVPN test node', chain:[{type:'openvpn',openvpn:{gateway:'vpn.example.invalid:1194',network:'udp',username:'alice',tls_crypt_key:'synthetic-static-key',auto_reconnect:true,mtu:1400}}] };
  nodes[1] = { ...nodes[1], name:'GlobalProtect ESP test node', chain:[{type:'globalprotect',globalprotect:{gateway:'gp.example.invalid',username:'alice',use_esp:true}}] };
}
if (scenario === 'l2tp') {
  nodes[0] = { ...nodes[0], name:'L2TP test node', chain:[{type:'l2tp',l2tp:{gateway:'vpn.example.invalid:1701',username:'alice',auth_type:'mschap-v2',ipv6:true,ipv6_address:'fd88::2/64',mtu:1400}}] };
  nodes[1] = { ...nodes[1], name:'L2TPv3 test node', chain:[{type:'l2tpv3',l2tpv3:{gateway:'vpn.example.invalid:1701',static:true,local_session_id:4294967295,peer_session_id:200,local_cookie:'1122334455667788',peer_cookie:'aabbccdd',sublayer:true,address:'10.89.0.2/24',router:'10.89.0.1',ipv6_address:'fd89::2/64',ipv6_router:'fd89::1',mtu:1400}}] };
}
const activeIds = new Set(nodes.slice(0, 3).map(node => node.id));
const subscriptions = scenario === 'empty' ? [] : [
  { name: 'Work network', type: 'reserve', url: 'https://work.example.invalid/subscription?token=synthetic-token' },
  { name: 'Travel routes', type: 'reserve', url: 'yuhaiin://synthetic-long-encoded-configuration' },
];
const connections = Array.from({length:size},(_,i)=>({id:String(i+1),addr:i===0?'very-long-host-name-for-mobile-layout-testing.example.invalid:443':`host-${i}.example.invalid:443`,network:{connType:i===0?'udp':'tcp',underlyingType:'tcp'},mode:'proxy',ruleId:'rule-0',ruleName:'Work traffic',selectorId:'selector-work',selectorName:'Work destination',inboundId:'inbound-local',inboundName:'Local proxy',domain:`host-${i}.example.invalid`,process:'audit-process',nodeId:'node-0',nodeName:'Mobile test node',lists:['shared-websites'],listNames:{'shared-websites':'Work websites'},matchHistory:[{ruleId:'rule-0',ruleName:'Work traffic',history:[{kind:'list',id:'shared-websites',listName:'Work websites',matched:true}]}]}));
// Stress the connection table without changing the other preview scenarios.
if (scenario.startsWith('connections') && connections.length) {
  Object.assign(connections.at(-1), {id:'9999999999',addr:'very-long-destination-for-mobile-layout-testing.example.invalid:443',selectorName:'Work destination with a very long shared exit name'});
  connections.forEach((connection,index) => { if (index % 2) connection.mode='direct'; });
}
const history = connections.map((connection,i)=>({connection,time:new Date(1790992800000-i*1000).toISOString(),count:String(i+1)}));
let settings=createDefaultSettings(); let total=0; let updateStartedAt=scenario==='update'?Number(sessionStorage.getItem('preview:updateStartedAt')||0):0;
let savedRevision=1, appliedRevision=1, applyAttempts=0;
let routeConfig={revision:0,defaultMode:'proxy',defaultTarget:{type:'default'},directResolver:'dns-local',proxyResolver:'dns-proxy',resolveLocally:false,udpProxyFqdnStrategy:'default'};
let runningConfig=structuredClone(routeConfig);
let listConfig={revision:0,refreshInterval:'3600',lastRefreshTime:'0',error:'',hostIndexDisk:false,maxMindDbGeoIp:{downloadUrl:'',error:''}};
let inboundConfig={hijackDns:true,hijackDnsFakeIp:false,sniff:true};
let resolverServer={server:''},fakeDNS={enabled:false,ipv4Range:'198.18.0.0/15',ipv6Range:'fc00::/18'},resolverHosts={hosts:{'local.example':'127.0.0.1','service.example':'alias.example','router.example':'192.0.2.1','vpn.example:443':'192.0.2.2:8443'}};
let selected={tcpId:nodes[0]?.id,udpId:nodes[0]?.id};
const failedImports=new Set();
const selectors=scenario==='empty'?[]:[
  {id:'selector-work',name:'Work destination',nodeId:nodes[0]?.id||'',revision:1},
  {id:'selector-cloud',name:'Cloud services',nodeId:nodes[1]?.id||'',revision:1},
  {id:'selector-travel',name:'Travel destination',nodeId:nodes[2]?.id||'',revision:1},
  {id:'selector-local',name:'Local network',nodeId:nodes[3]?.id||'',revision:1},
];
// Synthetic reliability data is scoped to browser layout/interaction checks.
if (scenario === 'reliability') selectors[0].policy = {
  mode:'balanced', latencyTarget:'https://probe.example.invalid/health', speedTarget:'https://speed.example.invalid/sample',
  candidates:[{nodeId:'node-0',enabled:true,priority:0,weight:2},{nodeId:'node-1',enabled:true,priority:1,weight:1}],
  weights:{rtt:2,download:1,stability:2}, circuit:{halfOpenConcurrency:2,halfOpenMaxRequests:6},
};
let monitoringConfig={revision:1,probe:{enabled:false},speed:{enabled:false,test:{url:''}}};
const monitoringStatus=()=>({config:monitoringConfig,network:{online:true,metered:false,foreground:true,generation:1},platform:'linux',jobs:0,workers:0,running:0,completed:0,failed:0,skipped:0});
function selectorStatus(id) {
  const candidate=(nodeId,trial,udp=false)=>({nodeId,state:trial?'degraded':'healthy',eligible:true,reason:trial?'recovery_trial':'eligible',samples:4,rttMs:trial?58:42,jitterMs:3,downloadMbps:trial?35:80,uploadMbps:0,failureRate:trial?.2:0,activeConnections:3,score:trial?.65:.83,components:{rtt:.7,download:.6,upload:0,stability:trial?.8:1,jitter:.9,load:.75},evidence:trial?(udp?'reply':'tcp_connect'):'https',circuit:{state:trial?'half_open':'closed',reason:trial?'cooldown_elapsed':'recovered',inFlight:trial?1:0,issued:trial?2:0,recovered:trial?1:0}});
  return {id,revision:selectors.find(s=>s.id===id)?.revision||1,tcp:{nodeId:'node-0',reason:'balanced',since:Date.now()-60000,candidates:[candidate('node-0',false),candidate('node-1',true)]},udp:{nodeId:'node-1',reason:'failover',since:Date.now()-30000,candidates:[candidate('node-1',true,true)]},switches:2,suppressed:3,events:[{at:Date.now()-30000,network:'tcp',from:'node-1',to:'node-0',reason:'balanced'}]};
}
const publishes=scenario==='empty'?[]:[{name:'Work devices',address:'example.invalid:443',path:'work',password:'',insecure:false,points:['node-0','node-1']},{name:'Travel devices',address:'example.invalid:443',path:'travel',password:'',insecure:false,points:['node-2']}];
const resolvers=[{id:'bootstrap',name:'Server address lookup',type:'system',host:'system default',system:true},{id:'dns-local',name:'Local network DNS',type:'system',host:'system default',system:true},{id:'dns-proxy',name:'Encrypted DNS',type:'doh',host:'https://dns.example.invalid/dns-query',system:false}];
const inbounds=scenario==='empty'?[]:[{id:'inbound-local',name:'Local proxy',enabled:true,network:{type:'tcp_udp',tcp_udp:{host:'127.0.0.1:9002',udp:'enabled'}},transports:[],protocol:{type:'mixed',mixed:{username:'',password:''}}}];
if (scenario === 'utun') inbounds[0] = {id:'inbound-local',name:'macOS TUN',enabled:true,network:{type:'empty',empty:{}},transports:[],protocol:{type:'tun',tun:{name:'tun://utun8',mtu:1500,forceFakeIp:false,skipMulticast:true,autoFakeIpRoute:true,driver:'channel',portal:'172.19.0.1/30',portalV6:'fdfe:dcba:9876::1/126',routes:['0.0.0.0/0'],excludes:[],postUp:[],postDown:[],darwin:{experimentalBatch:false,batchSize:32,pendingPackets:32}}}};

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
if (scenario === 'lazy') resolverHosts = {hosts: Object.fromEntries(Array.from({length:10000}, (_, i) => [`host-${String(i).padStart(5,'0')}.example.invalid`, `192.0.2.${i%254+1}`]))};
const worker=setupWorker(
  http.get('/api/v2/management',()=>HttpResponse.json({authentication:'local-users'})),
  http.get('/api/v2/auth/setup',()=>HttpResponse.json({required:false,expiresAt:0})),
  http.get('/api/v2/auth/me',()=>HttpResponse.json(principal)),
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
    else if(op==='node.close'){activeIds.delete(p.id);}
    else if(op==='node.latency')result={ok:true,latencyMs:36};
    else if(op==='nodes.import.preview'){
      try { const raw=JSON.parse(p.text); const items=Array.isArray(raw)?raw:[raw];result={items:items.map(node=>({...node,id:crypto.randomUUID(),name:node.name||'Imported node',enabled:true,origin:'manual',group:p.group||'manual'})),errors:[]}; }
      catch {result={items:[],errors:[{line:1,message:'This preview accepts canonical node JSON. Share-link parsing is covered by backend tests.'}]};}
    }
    else if(op==='nodes.active') result={items:nodes.filter(node=>activeIds.has(node.id))};
    else if(op==='nodes.post'){ if(p.name==='fail'&&!failedImports.has(p.id)){failedImports.add(p.id);return HttpResponse.json({error:{message:'Synthetic create failure'}},{status:500});} result=upsert(nodes,p); }
    else if(op==='connections') result={connections};
    else if(op==='connections.history') result={items:history};
    else if(op==='connections.failed_history') result={items:history.map((x,i)=>({host:x.connection.addr,protocol:'tcp',error:'Synthetic timeout',process:'audit',time:x.time,failedCount:String(i+1)}))};
    else if(op==='connections.total'){total+=1024;result={download:String(total),upload:String(total/2),counters:Object.fromEntries(connections.map((c,i)=>[c.id,{download:String(scenario.startsWith('connections')?(i+1)*1234567890123+total:total),upload:String(scenario.startsWith('connections')?(connections.length-i)*987654321123+total:total/2)}]))};}
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
    else if(op==='route.geoip.countries')result={codes:['CN','JP','US','LAN'],loaded:true};
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
    else if(scenario==='reliability' && op==='node.monitoring.get')result=monitoringStatus();
    else if(scenario==='reliability' && op==='node.monitoring.put'){monitoringConfig={...p,revision:p.revision+1};result=monitoringStatus();}
    else if(scenario==='reliability' && op==='outbound.selector.status')result=selectorStatus(p.id);
    else if(op==='outbound.selectors.get')result={items:selectors};
    else if(op==='outbound.selector.put'){const old=selectors.find(item=>item.id===p.id);if((old?.revision||0)!==p.revision)return errorResponse('Configuration changed; reload before saving',409);result=upsert(selectors,{...p,id:p.id||crypto.randomUUID(),revision:p.revision+1});}
    else if(op==='outbound.selector.references')result=references(rule=>rule.target?.type==='selector'&&rule.target.id===p.id);
    else if(op==='outbound.selector.delete'){remove(selectors,p.id);}
    else if(op==='resolver.query_types')result={types:['A','AAAA','CNAME','HTTPS','MX','NS','PTR','SOA','SRV','SVCB','TXT']};
    else if(op==='resolver.test')result={domain:p.domain.endsWith('.')?p.domain:p.domain+'.',queryType:p.queryType,elapsedMs:12.4,rcode:'NOERROR',truncated:false,records:p.domain==='fail.example'?[]:[{section:'answer',type:p.queryType,value:`${p.domain}. 300 IN ${p.queryType} ${({A:'192.0.2.1',AAAA:'2001:db8::1',TXT:'"synthetic record"',HTTPS:'1 . alpn="h2"',MX:'10 mail.example.invalid.'})[p.queryType]||'example.invalid.'}`}],error:p.domain==='fail.example'?'Synthetic DNS timeout':''};
    else if(op==='resolvers.get')result=page(resolvers,p);
    else if(op==='resolver.get'){result=resolvers.find(item=>item.id===p.id);if(!result)return errorResponse('Resolver no longer exists',404);}
    else if(op==='resolvers.post'||op==='resolver.put')result=upsert(resolvers,{...p,id:p.id||crypto.randomUUID()});
    else if(op==='resolver.delete'){remove(resolvers,p.id);}
    else if(op==='resolver.hosts.entries')result=page(Object.entries(resolverHosts.hosts).map(([host,target])=>({host,target})).filter(item=>!p.query||`${item.host} ${item.target}`.toLowerCase().includes(p.query.toLowerCase())).sort((a,b)=>a.host.localeCompare(b.host)),p);
    else if(op==='resolver.hosts.entry.get'){if(!(p.host in resolverHosts.hosts))return errorResponse('Host no longer exists',404);result={host:p.host,target:resolverHosts.hosts[p.host]};}
    else if(op==='resolver.hosts.entry.post'||op==='resolver.hosts.entry.put'){if(op.endsWith('post')&&p.host in resolverHosts.hosts)return errorResponse('Host already exists',409);if(op.endsWith('put')&&!(p.host in resolverHosts.hosts))return errorResponse('Host no longer exists',404);resolverHosts.hosts[p.host]=p.target;result=p;}
    else if(op==='resolver.hosts.entry.delete'){delete resolverHosts.hosts[p.host];}
    else if(op==='resolver.hosts.get')result=resolverHosts;
    else if(op==='resolver.hosts.put')result=resolverHosts=p;
    else if(op==='resolver.fakedns.get')result=fakeDNS;
    else if(op==='resolver.fakedns.put')result=fakeDNS=p;
    else if(op==='resolver.server.get')result=resolverServer;
    else if(op==='resolver.server.put')result=resolverServer=p;
    else if(op==='resolver.cache.get')result={items:[]};
    else if(op==='resolver.cache.delete')result={removed:0};
    else if(op==='inbound.capabilities')result={platform:scenario==='utun'?'darwin':'linux',protocols:['mixed','http','socks5','socks4a','redir','tproxy','tun','yuubinsya','hysteria2']};
    else if(op==='inbounds.get')result=page(inbounds,p);
    else if(op==='inbound.get'){result=inbounds.find(item=>item.id===p.id);if(!result)return errorResponse('Inbound no longer exists',404);}
    else if(op==='inbounds.post'||op==='inbound.put')result=upsert(inbounds,p);
    else if(op==='inbound.delete'){remove(inbounds,p.id);}
    else if(op==='inbounds.status')result={items:inbounds.map(item=>({id:item.id,name:item.name,enabled:item.enabled,status:item.enabled?'running':'disabled',changedAt:Date.now(),listeners:[{kind:item.protocol.type,state:item.enabled?'running':'disabled',listen:item.network.tcp_udp?.host,changedAt:Date.now()}],statistics:{acceptedStreams:'4',receivedPackets:'3',receivedPings:'0'}}))};
    else if(op==='inbound.events')result={items:[]};
    else if(op==='inbound.retry'){}
    else if(op==='inbounds.config.get')result=inboundConfig;
    else if(op==='inbounds.config.put')result=inboundConfig=p;
    else if(op==='subscriptions.get')result={items:subscriptions};
    else if(op==='publishes')result={items:publishes};
    else if(op==='publish.put'){const index=publishes.findIndex(item=>item.name===p.name);if(index<0)publishes.push(p);else publishes[index]=p;}
    else if(op==='publish.delete'){const index=publishes.findIndex(item=>item.name===p.name);if(index>=0)publishes.splice(index,1);}
    else if(op==='subscriptions.put'){for(const item of p.items){const index=subscriptions.findIndex(value=>value.name===item.name);if(index<0)subscriptions.push(item);else subscriptions[index]=item;}}
    else if(op==='subscriptions.delete'){for(const name of p.names){const index=subscriptions.findIndex(value=>value.name===name);if(index>=0)subscriptions.splice(index,1);}}
    else if(op==='subscriptions.update'){}
    else if(op==='tools.diagnostics')result={schemaVersion:1,host:p.host,platform:'linux',version:'preview',startedAt:new Date().toISOString(),durationMs:12,ipv6Enabled:true,checks:[],findings:[],report:`Synthetic diagnostics for ${p.host}`};
    else if(op==='update.check')result={channel:p.channel,supported:true,currentVersion:'v1.0.0',targetVersion:'v2.0.0',targetTag:'v2.0.0',prerelease:false,releaseUrl:'',releaseNotes:'Synthetic update',publishedAt:'',assetName:'preview',assetUrl:'',assetSha256:'',updateAvailable:true,reason:''};
    else if(op==='update.apply'){updateStartedAt=Date.now();if(scenario==='update')sessionStorage.setItem('preview:updateStartedAt',String(updateStartedAt));}
    else if(op==='update.status'){
      const elapsed=updateStartedAt?Date.now()-updateStartedAt:0;
      if(updateStartedAt&&elapsed>=3000&&elapsed<4500)return HttpResponse.error();
      result={running:Boolean(updateStartedAt&&elapsed<1500),stage:elapsed>=1500&&elapsed<3000?'completed':updateStartedAt&&elapsed<1500?'downloading':'',progress:updateStartedAt&&elapsed<3000?100:0,bytesDownloaded:0,totalBytes:0,error:''};
    }
    else if(op==='info'){
      const elapsed=updateStartedAt?Date.now()-updateStartedAt:0;
      if(updateStartedAt&&elapsed>=3000&&elapsed<4500)return HttpResponse.error();
      result={version:scenario==='update'?(elapsed>=4500?'v2.0.0':'v1.0.0'):scenario==='ui-long'?'main-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa':'UX preview',commit:elapsed>=4500?'bbbbbbbccccccccccccccccccccccccccccccccc':'aaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',buildTime:'2026-10-15T03:29:44Z',platform:'linux/amd64',os:'linux',goVersion:'go1.27',arch:'amd64',compiler:'gc',build:[]};
    }
    else return HttpResponse.json({error:{message:`Unmocked operation: ${op}`}},{status:501});
    return HttpResponse.json(result);
  }),
  http.all(/^https?:\/\/[^/]+\/api\//,()=>HttpResponse.json({error:{message:'Unmocked API blocked by audit harness'}},{status:501}))
);
await worker.start({quiet:true,onUnhandledRequest:'bypass',serviceWorker:{url:'/mockServiceWorker.js'}});
if (new URL(location.href).searchParams.has('gallery')) await import('/tests/msw/gallery.tsx');
else await import('/src/main.tsx');
