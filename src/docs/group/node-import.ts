import type { Node } from '@/contract/node';

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
