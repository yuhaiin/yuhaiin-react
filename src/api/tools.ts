import { requestJSON } from "@/api/client";
import type { Interfaces, Licenses } from "@/contract/tools";

export async function getInterfaces(): Promise<Interfaces> {
  const data = await requestJSON<Interfaces>("GET", "/api/v2/tools/interfaces");
  return { interfaces: data.interfaces ?? [] };
}

export async function getLicenses(): Promise<Licenses> {
  const data = await requestJSON<Licenses>("GET", "/api/v2/tools/licenses");
  return { yuhaiin: data.yuhaiin ?? [], android: data.android ?? [] };
}
