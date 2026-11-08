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
}

export interface AndroidSettings {
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

async function request<T>(method: 'GET' | 'POST' | 'PUT', path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    const init: RequestInit = method === 'GET'
        ? { method, headers: { Accept: 'application/json' } }
        : { method, headers: { Accept: 'application/json', 'Content-Type': 'application/json', [requestHeader]: '1' }, body: JSON.stringify(body ?? {}) };
    const response = await fetch(androidAPIPrefix + path, { ...init, signal, credentials: 'same-origin', cache: 'no-store' });
    const text = await response.text();
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
export const getAndroidApps = () => request<{ apps: AndroidApp[] }>('GET', 'apps').then(r => r.apps);

/** Native Android screens and dialogs the app opens for a user gesture. */
export type NativeAction = 'vpn/authorize' | 'settings' | 'apps' | 'routes' | 'logs' | 'backup' | 'update' | 'privacy';
export const nativeActionURL = (action: NativeAction) => `yuhaiin-android://action/${action}`;

/** True while the VPN interface exists, including during make-before-break rebuilds. */
export const vpnActive = (state?: PlatformVpnState) => state === 'running' || state === 'reconfiguring';
