import { requestJSON } from "@/api/client";
import type { DiagnosticReport, Interfaces, Licenses } from "@/contract/tools";

export async function getInterfaces(): Promise<Interfaces> {
  const data = await requestJSON<Interfaces>("GET", "/api/v2/tools/interfaces");
  return { interfaces: data.interfaces ?? [] };
}

export async function getLicenses(): Promise<Licenses> {
  const data = await requestJSON<Licenses>("GET", "/api/v2/tools/licenses");
  return { yuhaiin: data.yuhaiin ?? [], android: data.android ?? [] };
}

export function runDiagnostics(host: string, signal?: AbortSignal): Promise<DiagnosticReport> {
  return requestJSON<DiagnosticReport>("POST", "/api/v2/tools/diagnostics", { host }, undefined, signal);
}
