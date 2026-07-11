import { requestJSON } from "@/api/client";
import type { UpdateChannel, UpdateCheck, UpdateStatus } from "@/contract/update";

export async function checkUpdate(channel: UpdateChannel): Promise<UpdateCheck> {
  return requestJSON<UpdateCheck>("POST", "/api/v2/update/check", { channel });
}

export async function applyUpdate(channel: UpdateChannel, targetTag: string): Promise<void> {
  await requestJSON<Record<string, never>>("POST", "/api/v2/update/apply", { channel, targetTag });
}

export async function getUpdateStatus(): Promise<UpdateStatus> {
  return requestJSON<UpdateStatus>("GET", "/api/v2/update/status");
}
