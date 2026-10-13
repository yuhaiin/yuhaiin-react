import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { createDefaultRuleDraft, type RuleDraft } from '@/contract/route';
import { SimpleConditions } from './simple-conditions';
import { buildSimpleMatcher, draftForSave, parseSimpleMatcher } from './draft';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/component/v2/forms', () => ({
    SettingSelectVertical: ({ label, value, values, onChange }: { label: string; value: string; values: [string, string][]; onChange: (value: string) => void }) => <select aria-label={label} value={value} onChange={event => onChange(event.target.value)}>{values.map(([label, value]) => <option key={value} value={value}>{label}</option>)}</select>,
    SettingInputVertical: () => null, DropdownSelect: () => null,
}));
it('restores independent private sources without mixing their text or IDs', () => {
    const initial = createDefaultRuleDraft();
    initial.lists[0].source.local!.lists = ['first.example'];
    const second = { ...initial.lists[0], id: 'second', source: { type: 'local', local: { lists: ['second.example'] } } };
    initial.lists.push(second); initial.rule.rules = [...initial.rule.rules!, { type: 'host', host: { list: second.id } }];
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    function Editor() { const [value, setValue] = useState(initial); return <><SimpleConditions value={value} matcher={parseSimpleMatcher(value.rule.rules)!} options={{ lists: [], inbounds: [], resolvers: [] }} onChange={setValue} /><output data-testid="draft">{JSON.stringify(value)}</output></>; }
    try {
        act(() => root.render(<Editor />));
        const source = (index: number, value: string) => act(() => { const select = host.querySelectorAll<HTMLSelectElement>('[aria-label="matchingSource"]')[index]; select.value = value; select.dispatchEvent(new Event('change', { bubbles: true })); });
        source(0, 'shared'); source(1, 'shared'); source(1, 'private'); source(0, 'private');
        const saved: RuleDraft = JSON.parse(host.querySelector('[data-testid="draft"]')!.textContent!);
        expect(draftForSave(saved).lists).toEqual(initial.lists);
        expect(saved.rule.rules).toEqual(initial.rule.rules);
    } finally { act(() => root.unmount()); host.remove(); }
});
it('retains AND intent when removing down to one condition and adding another', () => {
    const host = { type: 'host' as const, host: { list: 'sites' } };
    const port = { type: 'port' as const, port: { ports: '443' } };
    const one = parseSimpleMatcher(buildSimpleMatcher({ join: 'all', items: [host] }))!;
    expect(buildSimpleMatcher({ ...one, items: [...one.items, port] })).toEqual([{ type: 'all', all: [host, port] }]);
});
