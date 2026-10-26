import { requestJSON } from "@/api/client";
import type { BackupOption, RestoreOption } from "@/contract/backup";
import { normalizeBackupOption } from "@/contract/backup";

export async function getBackupConfig(): Promise<BackupOption> {
  return normalizeBackupOption(await requestJSON<BackupOption>("GET", "/api/v2/backup/config"));
}

export async function saveBackupConfig(option: BackupOption): Promise<BackupOption> {
  return normalizeBackupOption(await requestJSON<BackupOption>("PUT", "/api/v2/backup/config", normalizeBackupOption(option)));
}

export async function runBackup(): Promise<void> {
  await requestJSON<void>("POST", "/api/v2/backup/run");
}

export async function restoreBackup(option: RestoreOption): Promise<void> {
  await requestJSON<void>("POST", "/api/v2/backup/restore", option);
}

export type RecoveryBackup = import('@/api/generated-contracts').Go.backup.RecoveryBackup;
export type RecoveryPolicy = import('@/api/generated-contracts').Go.backup.RecoveryPolicy;
export type RecoveryBackupStatus = import('@/api/generated-contracts').Go.backup.RecoveryBackupStatus;

export function getRecoveryBackups(): Promise<RecoveryBackupStatus> {
  return requestJSON('GET', '/api/v2/backup/recovery');
}

export function createRecoveryBackup(): Promise<RecoveryBackup> {
  return requestJSON('POST', '/api/v2/backup/recovery', { confirmMaintenance: true });
}

export function deleteRecoveryBackup(id: string): Promise<void> {
  return requestJSON('DELETE', `/api/v2/backup/recovery/${encodeURIComponent(id)}`, { confirm: true });
}

export function retryRecoveryBackup(id: string): Promise<void> {
  return requestJSON('POST', `/api/v2/backup/recovery/${encodeURIComponent(id)}/retry`);
}

export function verifyRecoveryBackup(id: string, identity: string): Promise<import('@/api/generated-contracts').Go.backup.RecoveryManifest> {
  return requestJSON('POST', `/api/v2/backup/recovery/${encodeURIComponent(id)}/verify`, { identity });
}
