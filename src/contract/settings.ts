import type { Go } from "@/api/generated-contracts";

export type Settings = Go.settings.Settings;
export type Info = Go.settings.Info;

export function createDefaultSettings(value?: Partial<Settings>): Settings {
  return {
    ipv6: value?.ipv6 ?? false,
    useDefaultInterface: value?.useDefaultInterface ?? true,
    netInterface: value?.netInterface ?? "",
	pprof: value?.pprof ?? true,
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
