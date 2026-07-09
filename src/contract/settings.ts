export type Settings = {
  ipv6: boolean;
  useDefaultInterface: boolean;
  netInterface: string;
  systemProxy: {
    http: boolean;
    socks5: boolean;
  };
  logcat: {
    level: "verbose" | "debug" | "info" | "warning" | "error" | "fatal" | string;
    save: boolean;
    ignoreTimeoutError: boolean;
    ignoreDnsError: boolean;
  };
  advanced: {
    udpBufferSize: number;
    relayBufferSize: number;
    udpRingbufferSize: number;
    happyEyeballsSemaphore: number;
  };
  backup: {
    instanceName: string;
    interval: number;
    lastBackupHash: string;
  };
};

export type Info = {
  version: string;
  commit: string;
  buildTime: string;
  goVersion: string;
  arch: string;
  platform: string;
  os: string;
  compiler: string;
  build: string[];
};

export function createDefaultSettings(value?: Partial<Settings>): Settings {
  return {
    ipv6: value?.ipv6 ?? false,
    useDefaultInterface: value?.useDefaultInterface ?? true,
    netInterface: value?.netInterface ?? "",
    systemProxy: {
      http: value?.systemProxy?.http ?? false,
      socks5: value?.systemProxy?.socks5 ?? false,
    },
    logcat: {
      level: value?.logcat?.level ?? "info",
      save: value?.logcat?.save ?? false,
      ignoreTimeoutError: value?.logcat?.ignoreTimeoutError ?? false,
      ignoreDnsError: value?.logcat?.ignoreDnsError ?? false,
    },
    advanced: {
      udpBufferSize: value?.advanced?.udpBufferSize ?? 2048,
      relayBufferSize: value?.advanced?.relayBufferSize ?? 4096,
      udpRingbufferSize: value?.advanced?.udpRingbufferSize ?? 250,
      happyEyeballsSemaphore: value?.advanced?.happyEyeballsSemaphore ?? 250,
    },
    backup: {
      instanceName: value?.backup?.instanceName ?? "",
      interval: value?.backup?.interval ?? 0,
      lastBackupHash: value?.backup?.lastBackupHash ?? "",
    },
  };
}

export function normalizeSettings(value: Partial<Settings>): Settings {
  return createDefaultSettings(value);
}
