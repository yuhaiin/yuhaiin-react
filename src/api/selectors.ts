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
