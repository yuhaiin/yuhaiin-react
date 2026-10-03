import { normalizeNode, protocolTypes, type Node } from '@/contract/node';

function object(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function parseNodeImport(text: string, group: string): Node[] {
    const parsed: unknown = JSON.parse(text);
    const items = Array.isArray(parsed) ? parsed : object(parsed) && Array.isArray(parsed.items) ? parsed.items : [parsed];
    if (!items.length) throw new Error('No nodes found');
    const ids = new Set<string>();
    return items.map((item, index) => {
        const fail = (reason: string): never => { throw new Error(`Node ${index + 1}: ${reason}`); };
        if (!object(item)) return fail('expected a node object');
        for (const field of ['id', 'name', 'group']) {
            if (item[field] !== undefined && typeof item[field] !== 'string') return fail(`${field} must be a string`);
        }
        if (item.enabled !== undefined && typeof item.enabled !== 'boolean') return fail('enabled must be a boolean');
        if (!Array.isArray(item.chain) || !item.chain.length) return fail('chain must contain a protocol');
        for (const protocol of item.chain) {
            if (!object(protocol)) return fail('invalid protocol');
            const type = protocol.type ?? protocolTypes.find(type => type in protocol);
            if (typeof type !== 'string' || !protocolTypes.includes(type as typeof protocolTypes[number])) return fail('unknown protocol type');
        }
        const node = normalizeNode({ ...item, group: item.group || group } as Partial<Node>);
        if (ids.has(node.id)) return fail('duplicate node ID');
        ids.add(node.id);
        return node;
    });
}

export type ImportResult = { status: 'success' } | { status: 'failed'; error: string };

export async function importNodeBatch(
    nodes: Node[], create: (node: Node) => Promise<unknown>, previous: Array<ImportResult | undefined> = [],
    onProgress?: (results: Array<ImportResult | undefined>) => void, concurrency = 4,
): Promise<ImportResult[]> {
    const results = [...previous];
    let cursor = 0;
    async function worker() {
        while (cursor < nodes.length) {
            const index = cursor++;
            if (results[index]?.status === 'success') continue;
            try { await create(nodes[index]); results[index] = { status: 'success' }; }
            catch (error) {
                results[index] = { status: 'failed', error: error instanceof Error ? error.message : String((error as { msg?: string })?.msg ?? error) };
            }
            onProgress?.([...results]);
        }
    }
    await Promise.all(Array.from({ length: Math.min(nodes.length, Math.max(1, concurrency)) }, worker));
    return results as ImportResult[];
}
