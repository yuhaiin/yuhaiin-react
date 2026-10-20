export interface Rate {
  bytesPerSecond: number;
  burstBytes: number;
}
export interface Profile {
  upload: Rate;
  download: Rate;
}
export interface TrafficControlConfig {
  enabled: boolean;
  global: Profile;
  defaultProfile?: string;
  profiles: Record<string, Profile>;
  inboundProfiles: Record<string, string>;
  routeProfiles: Record<string, string>;
}
export interface ResourceCounters {
  Sessions: number;
  QueueBytes: number;
  PendingTasks: number;
  DeniedSessions: number;
  DeniedBytes: number;
  DeniedPending: number;
  DeniedRateSessions: number;
  DeniedPackets: number;
}
export interface ShapingUsage {
  admittedUploadBytes: number;
  admittedDownloadBytes: number;
  rejectedUploadDatagrams: number;
  rejectedDownloadDatagrams: number;
  pacingWaitNanos: number;
}
export interface TrafficStatus {
  shaping?: ShapingUsage;
  global: ResourceCounters;
  nat: ResourceCounters;
  inboundScopes: {id: string; counters: ResourceCounters}[];
  truncated: boolean;
}
export const blankRate = (): Rate => ({bytesPerSecond:0,burstBytes:0});
export const blankProfile = (): Profile => ({upload:blankRate(),download:blankRate()});
export const blankTrafficConfig = ():TrafficControlConfig=>({
  enabled:false,global:blankProfile(),defaultProfile:"",
  profiles:{},inboundProfiles:{},routeProfiles:{},
});
export function normalizeTrafficControl(c:Partial<TrafficControlConfig>|undefined):TrafficControlConfig {
  const defaults=blankTrafficConfig();
  return {...defaults,...c,
    global:{upload:{...blankRate(),...c?.global?.upload},download:{...blankRate(),...c?.global?.download}},
    profiles:Object.fromEntries(Object.entries(c?.profiles??{}).map(([k,v])=>[
      k,{upload:{...blankRate(),...v.upload},download:{...blankRate(),...v.download}}
    ])),
    inboundProfiles:{...c?.inboundProfiles},routeProfiles:{...c?.routeProfiles},
  };
}
// Display rates in decimal megabits per second, exactly as network providers do.
export const toMbps = (bytesPerSecond:number) => Number((bytesPerSecond*8/1_000_000).toFixed(3));
export const fromMbps = (value:number) => Math.round(value*1_000_000/8);
export function validateTrafficControl(config:TrafficControlConfig):string|null {
  const profiles=config.profiles??{};
  const references=[config.defaultProfile,...Object.values(config.inboundProfiles??{}),...Object.values(config.routeProfiles??{})].filter((name):name is string=>typeof name==="string"&&name.length>0);
  for(const name of references) {
    if(!(name in profiles)) return "Unknown profile: "+name;
  }
  for(const [key,profile] of Object.entries({global:config.global,...profiles})) {
    if(!key.trim())return "A profile name cannot be empty.";
    for(const direction of [profile.upload,profile.download]) {
      if(!Number.isSafeInteger(direction.bytesPerSecond)||direction.bytesPerSecond<0||direction.bytesPerSecond>2**40)
        return "Invalid rate in "+key;
      if(!Number.isSafeInteger(direction.burstBytes)||direction.burstBytes<0||direction.burstBytes>2**30)
        return "Invalid burst in "+key;
      if(!direction.bytesPerSecond && direction.burstBytes)return "Unlimited directions cannot have a burst: "+key;
    }
  }
  return null;
}
