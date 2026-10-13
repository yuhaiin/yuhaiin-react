import { afterEach, expect, it, vi } from 'vitest';
import { createID } from './id';
import { createDefaultRuleDraft } from '@/contract/route';

afterEach(() => vi.unstubAllGlobals());

it('creates RFC 4122 IDs when randomUUID is unavailable', () => {
    let calls = 0;
    vi.stubGlobal('crypto', {
        randomUUID: undefined,
        getRandomValues(bytes: Uint8Array) {
            calls++;
            bytes.forEach((_, index) => { bytes[index] = index + calls; });
            return bytes;
        },
    });
    const draft = createDefaultRuleDraft();
    expect(calls).toBeGreaterThanOrEqual(2);
    expect(draft.rule.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(draft.lists[0].id).not.toBe(draft.rule.id);
    expect(draft.lists[0].ownerRuleId).toBe(draft.rule.id);
});

it('uses native randomUUID where supported', () => {
    const native = vi.fn(() => 'native-id');
    vi.stubGlobal('crypto', { randomUUID: native });
    expect(createID()).toBe('native-id');
    expect(native).toHaveBeenCalledOnce();
});
