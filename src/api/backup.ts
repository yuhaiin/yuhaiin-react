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
