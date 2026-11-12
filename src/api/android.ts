// Client for the Android platform API served by the Android core under
// /android/v1/. It is same-origin only: the platform session is an HttpOnly,
// SameSite=Strict cookie that only the in-app WebView receives, so browsers on
// the LAN (and every non-Android core) see no session and hide device controls.
// Platform detection uses the capability endpoint, never the User-Agent.

export const androidAPIPrefix = '/android/v1/';
const requestHeader = 'X-Yuhaiin-Platform-Request';

export interface AndroidCapabilities {
    platform: 'android';
    version: number;
    features: string[];
    session: boolean;
}

export interface PlatformVpnConfig {
    mtu: number;
    ipv4?: string;
    ipv4Prefix?: number;
    ipv6?: string;
    ipv6Prefix?: number;
    dns: string[];
    routes: string[];
    excludes: string[];
    fakeIpRoutes: string[];
    platformRevision: number;
}

export type PlatformVpnState = 'stopped' | 'establishing' | 'running' | 'reconfiguring' | 'stopping' | 'failed' | 'revoked';

export interface PlatformVpnRuntime {
    state: PlatformVpnState;
    inboundId?: string;
    generation: number;
    applied?: PlatformVpnConfig;
    pending?: PlatformVpnConfig;
    lastError?: string;
    errorCode?: string;
    reconfigurations: number;
    reconfigureFailures: number;
    lastReconfigureAt?: number;
    lastSwitchMillis?: number;
    startedAt?: number;
    changedAt: number;
}

export interface AndroidStatus {
    platform: 'android';
    core: { running: boolean; startedAt: number; port: number; https: boolean; lanAccess: boolean };
    vpn: {
        enabled: boolean;
        inboundId: string;
        inboundStatus?: string;
        inboundError?: string;
        runtime: PlatformVpnRuntime;
        authorization?: { prepared: boolean; consent: boolean; alwaysOn: boolean; lockdown: boolean };
    };
}

export interface AndroidSettingValues {
    perApp: boolean;
    appBypass: boolean;
    appList: string[];
    routeProfile: string;
    mtuProfile: string;
    meteredMode: string;
    appendHTTPProxy: boolean;
    autoConnect: boolean;
    bootConnectPolicy: string;
    notificationSpeed: boolean;
    coreBackgroundPolicy: string;
    trackUnderlyingNetwork: boolean;
    allowLan: boolean;
    processLookupMode: string;
    httpProxyPort: number;
}

export interface AndroidSettings {
    /** Settings the core reads only when it starts. */
    restartRequired?: (keyof AndroidSettingValues)[];
    values: AndroidSettingValues;
    routeProfiles: string[];
    options: Partial<Record<keyof AndroidSettingValues, string[]>>;
}

export interface AndroidApp { name: string; packageName: string; system: boolean }

export class AndroidAPIError extends Error {
    constructor(readonly status: number, readonly code: string, message: string) {
        super(message);
        this.name = 'AndroidAPIError';
    }
}

/** Codes that need a user decision in the app rather than a retry. */
export const userActionCodes = new Set(['permission_required', 'consent_required']);

async function send(method: 'GET' | 'POST' | 'PUT', path: string, body?: unknown, signal?: AbortSignal, raw?: string): Promise<{ response: Response; text: string }> {
    const init: RequestInit = method === 'GET'
        ? { method, headers: { Accept: 'application/json' } }
        : { method, headers: { Accept: 'application/json', 'Content-Type': 'application/json', [requestHeader]: '1' }, body: raw ?? JSON.stringify(body ?? {}) };
    const response = await fetch(androidAPIPrefix + path, { ...init, signal, credentials: 'same-origin', cache: 'no-store' });
    return { response, text: await response.text() };
}

async function request<T>(method: 'GET' | 'POST' | 'PUT', path: string, body?: unknown, signal?: AbortSignal, raw?: string): Promise<T> {
    const { response, text } = await send(method, path, body, signal, raw);
    let data: unknown = undefined;
    try { data = text ? JSON.parse(text) : undefined; } catch { /* plain-text errors */ }
    if (!response.ok) {
        const error = (data as { error?: { code?: string; message?: string } } | undefined)?.error;
        throw new AndroidAPIError(response.status, error?.code ?? 'http_error', error?.message ?? (text || `HTTP ${response.status}`));
    }
    return data as T;
}

/** Returns null on cores without the Android platform API. */
export async function getAndroidCapabilities(signal?: AbortSignal): Promise<AndroidCapabilities | null> {
    try {
        const caps = await request<AndroidCapabilities>('GET', 'capabilities', undefined, signal);
        return caps?.platform === 'android' ? caps : null;
    } catch (error) {
        if (signal?.aborted) throw error;
        return null;
    }
}

export const getAndroidStatus = () => request<AndroidStatus>('GET', 'status');
export const setAndroidVpn = (enabled: boolean) => request<AndroidStatus>('POST', 'vpn', { enabled });
export const reconfigureAndroidVpn = () => request<AndroidStatus>('POST', 'vpn/reconfigure', {});
export const getAndroidSettings = () => request<AndroidSettings>('GET', 'settings');
export const saveAndroidSettings = (values: Partial<AndroidSettingValues>) => request<AndroidSettings>('PUT', 'settings', values);
/** Same-origin PNG; the platform cookie authorizes it like the app list. */
export const androidAppIconURL = (packageName: string) => `${androidAPIPrefix}apps/icon?package=${encodeURIComponent(packageName)}`;
export const getAndroidApps = () => request<{ apps: AndroidApp[] }>('GET', 'apps').then(r => r.apps);

/** OS dialogs the app opens for a user gesture; consent is never granted by the page. */
export type NativeAction = 'vpn/authorize' | 'consent/apps';
export const nativeActionURL = (action: NativeAction) => `yuhaiin-android://action/${action}`;

/** True while the VPN interface exists, including during make-before-break rebuilds. */
export const vpnActive = (state?: PlatformVpnState) => state === 'running' || state === 'reconfiguring';

// ---- app and core ----

export interface AndroidAppInfo {
    core: { version: string; commit: string };
    app?: { applicationId: string; versionName: string; versionCode: number; commit: string; updateTrack: string };
}
export const getAndroidApp = () => request<AndroidAppInfo>('GET', 'app');
export const restartCore = () => request<{ restarting: boolean }>('POST', 'core/restart', {});

// ---- route profiles ----

export interface RouteProfile { name: string; preset: boolean; active: boolean; content: string }
export const getRouteProfiles = () => request<{ active: string; profiles: RouteProfile[] }>('GET', 'routes');
export const createRouteProfile = (name: string) => request<RouteProfile>('POST', 'routes', { name });
export const saveRouteProfile = (name: string, content: string) => request<RouteProfile>('PUT', 'routes', { name, content });
export const deleteRouteProfile = (name: string) => request<{ deleted: boolean }>('POST', 'routes/delete', { name });

// ---- logs ----

export async function getAndroidLogs(lines: number, signal?: AbortSignal): Promise<string> {
    const { response, text } = await send('GET', `logs?lines=${lines}`, undefined, signal);
    if (!response.ok) {
        let error: { code?: string; message?: string } | undefined;
        try { error = (JSON.parse(text) as { error?: typeof error }).error; } catch { /* plain text */ }
        throw new AndroidAPIError(response.status, error?.code ?? 'logs_failed', error?.message ?? (text || `HTTP ${response.status}`));
    }
    return text;
}

export interface DownloadLink { url: string; name: string }
export const exportAndroidLogs = () => request<DownloadLink>('POST', 'logs/export', {});

/**
 * Starts a download of a one-time link. The app's WebView hands it to Android's download
 * manager (script-made blobs cannot be saved there).
 */
export function startDownload(link: DownloadLink) {
    const anchor = document.createElement('a');
    anchor.href = link.url;
    anchor.download = link.name;
    anchor.rel = 'noopener';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
}

// ---- backup ----

export interface BackupPreview { createdAt: string; nodes: number; routes: number; preferences: number }
export const exportAndroidBackup = () => request<DownloadLink>('POST', 'backup/export', {});
export const previewAndroidBackup = (backup: string) => request<BackupPreview>('POST', 'backup/preview', undefined, undefined, backup);
/** Accepted asynchronously: the core restarts and the page reconnects. */
export const restoreAndroidBackup = (backup: string) => request<{ restoring: boolean }>('POST', 'backup/restore', undefined, undefined, backup);

// ---- privacy ----

export interface AndroidPrivacy {
    title: string;
    effectiveDate: string;
    sections: { title: string; body: string }[];
    contactUrl: string;
    withdrawBody: string;
    consents: { vpn: boolean; installedApps: boolean };
}
export const getAndroidPrivacy = () => request<AndroidPrivacy>('GET', 'privacy');
export const withdrawAndroidConsent = () => request<AndroidPrivacy>('POST', 'privacy/withdraw', {});

// ---- software update ----

export type UpdateStage = 'IDLE' | 'CHECKING' | 'DOWNLOADING' | 'VERIFYING' | 'INSTALLING' | 'WAITING_PERMISSION' | 'COMPLETED' | 'ERROR';
export interface AndroidUpdate {
    channel: string;
    channels: string[];
    checking: boolean;
    stage: UpdateStage;
    progress: number;
    downloadedBytes: number;
    totalBytes: number;
    error?: string | null;
    reason?: string | null;
    release?: { version: string; tag: string; notes: string; publishedAt: string; assetSize: number } | null;
    currentVersion: string;
}
export const getAndroidUpdate = () => request<AndroidUpdate>('GET', 'update');
export const androidUpdateAction = (action: 'check' | 'apply' | 'permission' | 'channel', channel?: string) =>
    request<AndroidUpdate>('POST', 'update', { action, channel });
