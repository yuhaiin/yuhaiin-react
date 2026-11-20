import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ProtectionRules } from '@/contract/system-network';
import { ProtectionRulesCard } from './protection-rules';

const api = vi.hoisted(() => ({ getNetworkProtectionRules: vi.fn(), systemNetworkKeys: { protectionRules: 'sn/protection/rules' } }));
vi.mock('@/api/system-network', () => api);
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string, o?: Record<string, unknown>) => o && !('defaultValue' in o) ? `${key}:${JSON.stringify(o)}` : key, i18n: { language: 'en', resolvedLanguage: 'en' } }),
}));

const rules: ProtectionRules = {
    backend: 'pf', available: true, readAt: 1700000000, raw: '### pfctl -s rules\nanchor "io.github.yuhaiin/*" all\n',
    main: [
        { kind: 'translation', text: 'nat-anchor "com.apple/*" all', yuhaiin: false },
        { kind: 'translation', text: 'nat-anchor "io.github.yuhaiin/*" all', yuhaiin: true },
        { kind: 'filter', text: 'anchor "io.github.yuhaiin/*" all', yuhaiin: true },
        { kind: 'filter', text: 'anchor "com.apple/*" all', yuhaiin: false },
    ],
    rulesets: [
        { name: 'io.github.yuhaiin/protection', purpose: 'protection', rules: [
            { text: 'pass out from any to <yuhaiin_private> flags any keep state label "yuhaiin-private" tag io.github.yuhaiin.pass', label: 'yuhaiin-private', category: 'private', counters: true, evaluations: 9, packets: 40, bytes: 3000, states: 2 },
            { text: 'block return out quick all label "yuhaiin-block-abc" ! tagged io.github.yuhaiin.pass', label: 'yuhaiin-block-abc', category: 'block', counters: true, evaluations: 9, packets: 12, bytes: 840, states: 0 },
        ], tables: [{ name: 'yuhaiin_private', count: 3, entries: ['10.0.0.0/8', '192.168.0.0/16'], truncated: true }] },
        { name: 'io.github.yuhaiin/forward', purpose: 'forward', rules: [] },
    ],
    config: { path: '/etc/pf.conf', registered: true, lines: [{ number: 25, text: 'anchor "io.github.yuhaiin/*" # managed by Yuhaiin (io.github.yuhaiin)', managed: true }] },
};

let host: HTMLDivElement, root: Root;
beforeEach(() => { vi.clearAllMocks(); host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); document.body.innerHTML = ''; });

async function render(data: ProtectionRules) {
    api.getNetworkProtectionRules.mockResolvedValue(structuredClone(data));
    await act(async () => { root.render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><ProtectionRulesCard /></SWRConfig>); });
}
async function openCard() {
    const trigger = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('protection.rules.title'))!;
    await act(async () => trigger.click());
    await act(async () => { await new Promise(r => setTimeout(r, 30)); });
}

it('loads only when opened and shows the whole main ruleset with Yuhaiin marked', async () => {
    await render(rules);
    expect(api.getNetworkProtectionRules).not.toHaveBeenCalled();
    await openCard();
    expect(api.getNetworkProtectionRules).toHaveBeenCalledTimes(1);
    const items = [...document.querySelectorAll('ol li')];
    expect(items).toHaveLength(4);
    expect(items.filter(li => li.hasAttribute('data-yuhaiin'))).toHaveLength(2);
    expect(items[3].textContent).toContain('com.apple/*');
    const text = host.textContent ?? '';
    expect(text).not.toContain('protection.rules.notFirst');
    expect(text).toContain('protection.rules.categories.block');
    expect(text).toContain('yuhaiin_private');
    expect(text).toContain('protection.rules.truncated');
    expect(text).toContain('protection.rules.noRules');
    expect(text).toContain('protection.rules.managed');
});

it('does not count normalization (scrub) as a filter rule before Yuhaiin', async () => {
    await render({ ...rules, main: [{ kind: 'normalization', text: 'scrub-anchor "com.apple/*" all fragment reassemble', yuhaiin: false }, { kind: 'filter', text: 'anchor "io.github.yuhaiin/*" all', yuhaiin: true }] });
    await openCard();
    expect(host.textContent).not.toContain('protection.rules.notFirst');
});

it('warns when another filter rule comes before Yuhaiin', async () => {
    await render({ ...rules, main: [{ kind: 'filter', text: 'pass quick all', yuhaiin: false }, { kind: 'filter', text: 'anchor "io.github.yuhaiin/*" all', yuhaiin: true }] });
    await openCard();
    expect(host.textContent).toContain('protection.rules.notFirst');
});

it('explains an unreadable packet filter', async () => {
    await render({ ...rules, available: false, reason: 'The packet filter could not be read; Yuhaiin is not running as root', main: [], rulesets: [], errors: ['pfctl: Permission denied'] });
    await openCard();
    expect(host.textContent).toContain('not running as root');
    expect(host.textContent).toContain('Permission denied');
});
