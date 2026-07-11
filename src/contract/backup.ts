import type { Go } from "@/api/generated-contracts";

export type BackupOption = Go.backup.Option;
export type RestoreOption = Go.backup.RestoreOption;

export function normalizeBackupOption(value: Partial<BackupOption>): BackupOption {
  return {
    instanceName: value.instanceName ?? "",
    interval: value.interval ?? 0,
    lastBackupHash: value.lastBackupHash ?? "",
    s3: {
      enabled: value.s3?.enabled ?? false,
      accessKey: value.s3?.accessKey ?? "",
      secretKey: value.s3?.secretKey ?? "",
      bucket: value.s3?.bucket ?? "",
      region: value.s3?.region ?? "",
      endpointUrl: value.s3?.endpointUrl ?? "",
      usePathStyle: value.s3?.usePathStyle ?? false,
      storageClass: value.s3?.storageClass ?? "",
    },
  };
}

export function createRestoreAll(): RestoreOption {
  return {
    all: true,
    rules: false,
    lists: false,
    nodes: false,
    tags: false,
    dns: false,
    inbounds: false,
    subscribes: false,
    source: "s3",
  };
}
