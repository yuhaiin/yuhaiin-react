import { requestJSON } from '@/api/client';
import type { Selector } from '@/contract/node';
import type { Go } from '@/api/generated-contracts';

export async function listSelectors(): Promise<Go.node.SelectorList> {
    return requestJSON('GET', '/api/v2/outbound/selectors');
}

export async function saveSelector(value: Selector): Promise<Selector> {
    return requestJSON('PUT', '/api/v2/outbound/selectors', value);
}

export async function deleteSelector(id: string): Promise<void> {
    await requestJSON('DELETE', `/api/v2/outbound/selectors/${encodeURIComponent(id)}`);
}

export async function selectorReferences(id: string): Promise<{ items: Go.route.Reference[] }> {
    return requestJSON('GET', `/api/v2/outbound/selectors/${encodeURIComponent(id)}/references`);
}

export async function getSelectorStatus(id: string): Promise<Go.node.SelectorRuntimeStatus> {
    return requestJSON('GET', `/api/v2/outbound/selectors/${encodeURIComponent(id)}/status`);
}
export async function measureNodeSpeed(id: string, options: Go.node.SpeedTestRequest): Promise<Go.node.ThroughputMeasurement> {
    return requestJSON('POST', `/api/v2/nodes/${encodeURIComponent(id)}/speed`, options);
}
