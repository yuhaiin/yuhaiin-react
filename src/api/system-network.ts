import { requestJSON } from './client';
import { normalizeSystemNetworkConfig, type SystemNetworkConfig, type SystemNetworkInterfaces, type SystemNetworkPreview, type SystemNetworkSaveResult, type SystemNetworkStatus, type SystemRoutes, type OutboundRouting } from '@/contract/system-network';

export const systemNetworkKeys = {
    config: '/api/v2/system-network/config',
    status: '/api/v2/system-network/status',
    interfaces: '/api/v2/system-network/interfaces',
    routes: '/api/v2/system-network/routes',
    outbound: '/api/v2/system-network/outbound',
};

export async function getSystemNetworkConfig(): Promise<SystemNetworkConfig> {
    return normalizeSystemNetworkConfig(await requestJSON<SystemNetworkConfig>('GET', systemNetworkKeys.config));
}

/** Saving returns the saved configuration and the status after applying it; a save can succeed while applying fails. */
export async function putSystemNetworkConfig(config: SystemNetworkConfig): Promise<SystemNetworkSaveResult> {
    const result = await requestJSON<SystemNetworkSaveResult>('PUT', systemNetworkKeys.config, config);
    return { ...result, config: normalizeSystemNetworkConfig(result.config) };
}

export function getSystemNetworkStatus(): Promise<SystemNetworkStatus> {
    return requestJSON<SystemNetworkStatus>('GET', systemNetworkKeys.status);
}

export function getSystemNetworkInterfaces(): Promise<SystemNetworkInterfaces> {
    return requestJSON<SystemNetworkInterfaces>('GET', systemNetworkKeys.interfaces);
}

export function previewSystemNetwork(config: SystemNetworkConfig): Promise<SystemNetworkPreview> {
    return requestJSON<SystemNetworkPreview>('POST', '/api/v2/system-network/preview', config);
}

/** The operating system's routing table, with the routes Yuhaiin owns marked. */
export function getSystemNetworkRoutes(): Promise<SystemRoutes> {
    return requestJSON<SystemRoutes>('GET', systemNetworkKeys.routes);
}

/** How Yuhaiin's own outbound sockets stay out of its TUN and which interfaces they use. Read-only. */
export function getSystemNetworkOutbound(): Promise<OutboundRouting> {
    return requestJSON<OutboundRouting>('GET', systemNetworkKeys.outbound);
}
