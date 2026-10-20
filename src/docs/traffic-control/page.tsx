import {getTrafficControl,getTrafficStatus,putTrafficControl} from "@/api/traffic-control";
import {listInbounds} from "@/api/inbounds";
import {listRules} from "@/api/route";
import {Button} from "@/component/v2/button";
import {Card,CardBody,CardHeader,MainContainer} from "@/component/v2/card";
import {Input} from "@/component/v2/input";
import Loading from "@/component/v2/loading";
import {SwitchCard} from "@/component/v2/forms";
import {useEditorDraft,useCloseGuard} from "@/hooks/use-editor-draft";
import {
  blankProfile,blankTrafficConfig,fromMbps,toMbps,validateTrafficControl,
  type Profile,type Rate,type ResourceCounters,type TrafficControlConfig,
} from "@/contract/traffic-control";
import {Activity,ArrowDownToLine,ArrowUpFromLine,Plus,Save,ShieldCheck,Trash2} from "lucide-react";
import {useState} from "react";
import {useTranslation} from "react-i18next";
import useSWR from "swr";

const inputClass="w-full h-10 rounded-ui-sm border border-ui-border bg-ui-surface px-3 text-sm text-ui-fg";

function RateControl({title,value,onChange,disabled}:{
  title:string; value:Rate;onChange:(value:Rate)=>void;disabled:boolean;
}) {
  const {t}=useTranslation("trafficControl");
  return <div className="space-y-2">
    <span className="text-xs font-semibold text-ui-secondary">{title}</span>
    <div className="grid grid-cols-2 gap-2">
      <label className="block space-y-1 text-xs text-ui-muted">
        <span>{t("mbps")}</span>
        <Input aria-label={title+" "+t("mbps")} type="number" step="0.1" min={0} max={8_796_093}
          value={toMbps(value.bytesPerSecond)}
          disabled={disabled}
          onChange={e=>{
            const next=Number(e.target.value);
            if(Number.isFinite(next)&&next>=0) onChange({
              ...value,bytesPerSecond:fromMbps(next),
              burstBytes:next===0?0:value.burstBytes,
            });
          }}/>
      </label>
      <label className="block space-y-1 text-xs text-ui-muted">
        <span>{t("burstKiB")}</span>
        <Input aria-label={title+" "+t("burstKiB")} type="number" step="1" min={0} max={1_048_576}
          value={value.burstBytes/1024} disabled={disabled||value.bytesPerSecond===0}
          onChange={e=>{
            const next=Number(e.target.value);
            if(Number.isFinite(next)&&next>=0)onChange({...value,burstBytes:Math.round(next*1024)});
          }}/>
      </label>
    </div>
  </div>;
}

function ProfileEditor({profile,onChange,disabled}:{
 profile:Profile;onChange:(next:Profile)=>void;disabled:boolean;
}) {
 const {t}=useTranslation("trafficControl");
 return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
   <RateControl title={t("upload")} value={profile.upload} onChange={upload=>onChange({...profile,upload})} disabled={disabled}/>
   <RateControl title={t("download")} value={profile.download} onChange={download=>onChange({...profile,download})} disabled={disabled}/>
 </div>;
}

function BindingTable({title,options,values,profiles,onChange,disabled}:{
 title:string;options:{id:string;name:string}[];values:Record<string,string>;
 profiles:string[];onChange:(v:Record<string,string>)=>void;disabled:boolean;
}) {
 const {t}=useTranslation("trafficControl");
 const rows=options.slice(0,120);
 const known=new Set(rows.map(x=>x.id));
 const extra=Object.keys(values).filter(id=>!known.has(id)).map(id=>({id,name:id}));
 return <section className="space-y-2">
   <h3 className="text-sm font-semibold">{title}</h3>
   <div className="max-h-72 overflow-auto rounded-ui-sm border border-ui-border divide-y divide-ui-border">
     {[...rows,...extra].map(item=><label key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 text-sm">
       <span className="min-w-0 break-all">{item.name||item.id}<span className="ml-2 text-xs text-ui-muted">{item.id!==item.name?item.id:""}</span></span>
       <select className={inputClass+" w-auto min-w-32 max-w-48"} aria-label={item.name} disabled={disabled}
        value={values[item.id]??""} onChange={e=>{
         const next={...values};if(e.target.value)next[item.id]=e.target.value;else delete next[item.id];onChange(next);
        }}>
        <option value="">{t("inherit")}</option>
        {profiles.map(name=><option key={name} value={name}>{name}</option>)}
       </select>
     </label>)}
     {!rows.length&&!extra.length&&<p className="p-3 text-xs text-ui-muted">{t("noBindings")}</p>}
   </div>
   {options.length>120&&<p className="text-xs text-ui-muted">{t("bindingLimit")}</p>}
 </section>;
}
const formatNum=(n:number|undefined)=>Number(n??0).toLocaleString();
function StatsCard({title,counters}:{title:string;counters:ResourceCounters|undefined}) {
 const {t}=useTranslation("trafficControl");
 return <div className="rounded-ui-sm border border-ui-border p-4">
   <h3 className="font-medium mb-3">{title}</h3>
   <dl className="grid grid-cols-2 gap-3 text-sm">
    {(["Sessions","QueueBytes","PendingTasks","DeniedSessions","DeniedBytes","DeniedPending","DeniedRateSessions","DeniedPackets"] as const).map(key=>
      <div key={key}><dt className="text-xs text-ui-muted">{t("stat."+key)}</dt><dd className="mt-0.5 font-semibold tabular-nums">{formatNum(counters?.[key])}</dd></div>
    )}
   </dl>
 </div>;
}

export default function TrafficControlPage(){
 const {t}=useTranslation("trafficControl");
 const {data,error,isLoading,mutate}=useSWR("/api/v2/traffic-control",getTrafficControl,{revalidateOnFocus:false});
 const {data:status,error:statusError,mutate:refreshStatus}=useSWR("/api/v2/traffic-control/status",getTrafficStatus,{refreshInterval:5000});
 const {data:inbounds}=useSWR("/api/v2/inbounds?qos-bindings",()=>listInbounds({pageSize:200}),{revalidateOnFocus:false});
 const {data:rules}=useSWR("/api/v2/route/rules?qos-bindings",()=>listRules({pageSize:200}),{revalidateOnFocus:false});
 const {value:draft,setValue:setDraft,commit,dirty}=useEditorDraft("traffic-control",data,blankTrafficConfig);
 const [profileName,setProfileName]=useState("");
 const [saving,setSaving]=useState(false);
 const [failure,setFailure]=useState("");
 const [saved,setSaved]=useState(false);
 useCloseGuard(dirty,saving,()=>undefined);
 const patch=(change:(current:TrafficControlConfig)=>TrafficControlConfig)=>{
  setDraft(prev=>change(prev));setSaved(false);setFailure("");
 };
 const save=async()=>{
  const validation=validateTrafficControl(draft);
  if(validation){setFailure(validation);return}
  setSaving(true);setFailure("");setSaved(false);
  try{
    const next=await putTrafficControl(draft);
    commit(next);await mutate(next,{revalidate:false});
    await refreshStatus();
    setSaved(true);
  }catch(e){setFailure((e as {msg?:string})?.msg??String(e))}
  finally{setSaving(false)}
 };
 if(error&&!data)return <Loading onRetry={()=>void mutate()}>{String((error as {msg?:string})?.msg??error)}</Loading>;
 if(isLoading||!data)return <Loading/>;
 const names=Object.keys(draft.profiles).sort();
 const invalid=validateTrafficControl(draft);
 const updateProfile=(name:string,p:Profile)=>patch(c=>({...c,profiles:{...c.profiles,[name]:p}}));
 const removeProfile=(name:string)=>patch(c=>{
   const profiles={...c.profiles};delete profiles[name];
   const filter=(m:Record<string,string>)=>Object.fromEntries(Object.entries(m).filter(([,value])=>value!==name));
   return {...c,profiles,defaultProfile:c.defaultProfile===name?"":c.defaultProfile,
      inboundProfiles:filter(c.inboundProfiles),routeProfiles:filter(c.routeProfiles)};
 });
 return <MainContainer className="max-w-screen-xl">
  <div className="space-y-5 pb-8">
   <header className="flex flex-wrap items-start justify-between gap-4">
    <div><h1 className="flex items-center gap-2 text-xl font-semibold text-ui-heading"><ShieldCheck size={22}/>{t("title")}</h1>
     <p className="mt-1 text-sm text-ui-secondary">{t("description")}</p></div>
    <div className="flex gap-2">
     <Button variant="outline-secondary" disabled={!dirty||saving}
      onClick={()=>{setDraft(structuredClone(data));setFailure("");setSaved(false)}}>{t("discard")}</Button>
     <Button variant="primary" loading={saving} disabled={!dirty||saving||Boolean(invalid)}
      onClick={()=>void save()}><Save size={16}/>{t("save")}</Button>
    </div>
   </header>
   {(failure||invalid)&&<p role="alert" className="rounded-ui-sm border border-ui-danger/40 p-3 text-sm text-ui-danger">{failure||invalid}</p>}
   {saved&&<p role="status" className="text-sm text-ui-secondary">{t("saved")}</p>}

   <Card noMargin><CardHeader><h2 className="font-semibold">{t("global")}</h2></CardHeader>
    <CardBody className="space-y-4">
     <SwitchCard checked={draft.enabled} disabled={saving} label={t("enabled")}
       description={t("enableHint")} onCheckedChange={enabled=>patch(c=>({...c,enabled}))}/>
     <ProfileEditor profile={draft.global} disabled={saving} onChange={global=>patch(c=>({...c,global}))}/>
     <p className="text-xs text-ui-muted">{t("unitHint")}</p>
    </CardBody>
   </Card>
   <Card noMargin><CardHeader><h2 className="font-semibold">{t("profiles")}</h2></CardHeader>
    <CardBody className="space-y-4">
     <div className="flex gap-2">
      <Input aria-label={t("newProfile")} placeholder={t("newProfile")} maxLength={64} value={profileName}
       disabled={saving} onChange={e=>setProfileName(e.target.value)}/>
      <Button disabled={saving||!profileName.trim()||Boolean(draft.profiles[profileName.trim()])}
       onClick={()=>{const name=profileName.trim();if(!name)return;patch(c=>({...c,profiles:{...c.profiles,[name]:blankProfile()}}));setProfileName("")}}>
       <Plus size={15}/>{t("add")}</Button>
     </div>
     <label className="flex items-center gap-3 text-sm">
      <span className="font-medium">{t("defaultProfile")}</span>
      <select className={inputClass+" max-w-56"} disabled={saving} value={draft.defaultProfile??""}
       onChange={e=>patch(c=>({...c,defaultProfile:e.target.value}))}>
       <option value="">{t("none")}</option>{names.map(name=><option key={name} value={name}>{name}</option>)}
      </select>
     </label>
     {names.map(name=><section key={name} className="rounded-ui-sm border border-ui-border p-4 space-y-3">
       <div className="flex justify-between items-center gap-2"><h3 className="font-semibold break-all">{name}</h3>
        <Button size="sm" variant="outline-danger" disabled={saving} aria-label={t("deleteProfile",{name})}
         onClick={()=>removeProfile(name)}><Trash2 size={14}/>{t("remove")}</Button>
       </div>
       <ProfileEditor profile={draft.profiles[name]} disabled={saving} onChange={next=>updateProfile(name,next)}/>
      </section>)}
     {!names.length&&<p className="text-sm text-ui-muted">{t("noProfiles")}</p>}
    </CardBody>
   </Card>
   <Card noMargin><CardHeader><h2 className="font-semibold">{t("bindings")}</h2></CardHeader>
    <CardBody className="grid gap-5 lg:grid-cols-2">
     <BindingTable title={t("inbounds")} options={(inbounds?.items??[]).map(x=>({id:x.id,name:x.name??x.id}))}
      profiles={names} values={draft.inboundProfiles} disabled={saving}
      onChange={inboundProfiles=>patch(c=>({...c,inboundProfiles}))}/>
     <BindingTable title={t("routes")} options={(rules?.items??[]).map(x=>({id:x.id,name:x.name??x.id}))}
      profiles={names} values={draft.routeProfiles} disabled={saving}
      onChange={routeProfiles=>patch(c=>({...c,routeProfiles}))}/>
    </CardBody>
   </Card>
   <Card noMargin><CardHeader><h2 className="flex items-center gap-2 font-semibold"><Activity size={17}/>{t("diagnostics")}</h2>
     <Button size="sm" onClick={()=>void refreshStatus()}>{t("refresh")}</Button>
    </CardHeader><CardBody className="space-y-3">
     {statusError&&<p role="alert" className="text-sm text-ui-danger">{t("statusUnavailable")}</p>}
     {!status&&!statusError&&<p className="text-sm text-ui-secondary">{t("loading")}</p>}
     {status&&<>
      <p className="text-xs text-ui-muted">{t("diagnosticsHint")}</p>
      <div className="grid gap-3 lg:grid-cols-2"><StatsCard title={t("globalResources")} counters={status.global}/><StatsCard title={t("natResources")} counters={status.nat}/></div>
      {status.inboundScopes?.length>0&&<div className="space-y-2">
        <h3 className="font-semibold text-sm">{t("scopeUsage")}</h3>
        <div className="grid gap-3 md:grid-cols-2">
         {status.inboundScopes.map(x=><StatsCard key={x.id} title={x.id||t("unknownInbound")} counters={x.counters}/>)}
        </div>
      </div>}
      {status.truncated&&<p className="text-xs text-ui-muted">{t("truncated")}</p>}
     </>}
    </CardBody>
   </Card>
   <p className="text-xs text-ui-muted flex items-start gap-2"><ArrowUpFromLine size={14}/><ArrowDownToLine size={14}/>{t("limitations")}</p>
  </div>
 </MainContainer>;
}
