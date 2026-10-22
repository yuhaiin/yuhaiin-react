import { requestJSON } from "@/api/client";
import type { UpdateChannel, UpdateCheck, UpdateStatus, UpdateHistory } from "@/contract/update";

export async function checkUpdate(channel: UpdateChannel): Promise<UpdateCheck> {
  return requestJSON<UpdateCheck>("POST", "/api/v2/update/check", { channel });
}

export async function applyUpdate(channel: UpdateChannel, targetTag: string): Promise<void> {
  await requestJSON<Record<string, never>>("POST", "/api/v2/update/apply", { channel, targetTag });
}

export async function getUpdateStatus(signal?: AbortSignal): Promise<UpdateStatus> {
  return requestJSON<UpdateStatus>("GET", "/api/v2/update/status", undefined, undefined, signal);
}

export async function getUpdateHistory(): Promise<UpdateHistory> {
  return requestJSON<UpdateHistory>("GET", "/api/v2/update/history");
}

export async function rollbackUpdate(id: string): Promise<void> {
  await requestJSON<Record<string, never>>("POST", "/api/v2/update/rollback", { id });
}
