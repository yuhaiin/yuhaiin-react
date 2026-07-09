import { requestJSON } from "@/api/client";
import type { Info, Settings } from "@/contract/settings";
import { normalizeSettings } from "@/contract/settings";

export async function getInfo(): Promise<Info> {
  return requestJSON<Info>("GET", "/api/v2/info");
}

export async function loadSettings(): Promise<Settings> {
  return normalizeSettings(await requestJSON<Settings>("GET", "/api/v2/settings"));
}

export async function saveSettings(settings: Settings): Promise<Settings> {
  return normalizeSettings(await requestJSON<Settings>("PUT", "/api/v2/settings", normalizeSettings(settings)));
}
