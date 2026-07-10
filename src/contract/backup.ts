export type BackupOption = {
  instanceName: string;
  s3: {
    enabled: boolean;
    accessKey: string;
    secretKey: string;
    bucket: string;
    region: string;
    endpointUrl: string;
    usePathStyle: boolean;
    storageClass: string;
  };
  interval: number;
  lastBackupHash: string;
};

export type RestoreOption = {
  all: boolean;
  rules: boolean;
  lists: boolean;
  nodes: boolean;
  tags: boolean;
  dns: boolean;
  inbounds: boolean;
  subscribes: boolean;
  source: "unknown" | "s3" | string;
};

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
