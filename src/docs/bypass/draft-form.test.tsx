import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { createDefaultRuleDraft, type RuleDraft } from '@/contract/route';
import { RuleDraftForm } from './draft-form';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/component/route-target-picker', () => ({
    RouteTargetPicker: ({ value }: { value: { type: string; id?: string } }) =>
        <output data-testid="target">{value.type}:{value.id}</output>,
}));
vi.mock('@/component/gateway-picker', () => ({ GatewayPicker: ({value, onChange}: {value:{type:string;id?:string};onChange:(target:{type:string;id:string})=>void}) => <button onClick={() => onChange({type:'gateway',id:'spotify'})}>gateway:{value.id}</button> }));
vi.mock('@/component/resolver-picker', () => ({ ResolverPicker: () => null }));

let host: HTMLDivElement | undefined;
let root: Root | undefined;
afterEach(() => {
    if (root) act(() => root?.unmount());
    host?.remove();
    root = undefined;
    host = undefined;
});

function renderDraft(initial: RuleDraft) {
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
    function Editor() {
        const [draft, setDraft] = useState(initial);
        return <>
            <RuleDraftForm value={draft} onChange={setDraft} options={{ lists: [], inbounds: [], resolvers: [] }} />
            <output data-testid="saved-target">{JSON.stringify(draft.rule.target)}</output>
            <output data-testid="rule-expressions">{JSON.stringify(draft.rule.rules)}</output>
            <output data-testid="owned-lists">{JSON.stringify(draft.lists.map(list => list.id))}</output>
            <output data-testid="disabled">{String(draft.rule.disabled)}</output>
        </>;
    }
    act(() => root?.render(<Editor />));
    return host;
}

function action(host: HTMLElement, label: string) {
    const button = [...host.querySelectorAll('[aria-label="action"] button')].find(item => item.textContent === label);
    if (!button) throw Error(`Missing action: ${label}`);
    act(() => (button as HTMLButtonElement).click());
}

it('keeps a selected proxy destination when changing the action and changing back', () => {
    const draft = createDefaultRuleDraft();
    draft.rule.target = { type: 'node', id: 'existing-node' };
    const host = renderDraft(draft);
    action(host, 'direct');
    expect(host.querySelector('[data-testid="saved-target"]')?.textContent).toContain('existing-node');
    action(host, 'proxy');
    expect(host.querySelector('[data-testid="target"]')?.textContent).toBe('node:existing-node');
});

it('makes settings omitted from the simple task editor discoverable', () => {
    const draft = createDefaultRuleDraft();
    draft.rule.resolver = 'custom-dns';
    const host = renderDraft(draft);
    expect(host.querySelector('[role="status"]')?.textContent).toContain('customOptions');
    const advanced = [...host.querySelectorAll('button')].find(item => item.textContent === 'advancedEditor');
    expect(advanced).toBeTruthy();
    act(() => (advanced as HTMLButtonElement).click());
    expect(host.querySelector('[role="status"]')).toBeNull();
});

function clickButton(host: HTMLElement, text: string) {
    const button = [...host.querySelectorAll('button')].find(item => item.textContent?.trim() === text);
    if (!button) throw Error(`Missing button: ${text}`);
    act(() => button.click());
}

it('edits enabled state in the simple view and retains it across editor changes', () => {
    const draft = createDefaultRuleDraft();
    draft.rule.disabled = true;
    const host = renderDraft(draft);
    const enabled = () => host.querySelector<HTMLButtonElement>('[role="switch"]')!;
    expect(enabled().getAttribute('aria-checked')).toBe('false');
    act(() => enabled().click());
    expect(host.querySelector('[data-testid="disabled"]')?.textContent).toBe('false');
    clickButton(host, 'advancedEditor');
    expect(enabled().getAttribute('aria-checked')).toBe('true');
    act(() => enabled().click());
    clickButton(host, 'simpleEditor');
    expect(enabled().getAttribute('aria-checked')).toBe('false');
    expect(JSON.parse(host.querySelector('[data-testid="rule-expressions"]')!.textContent!)).toEqual(draft.rule.rules);
});

it('adds independent private match conditions and combines them with AND', () => {
    const host = renderDraft(createDefaultRuleDraft());
    clickButton(host, 'addCondition');
    const listIds = JSON.parse(host.querySelector('[data-testid="owned-lists"]')?.textContent ?? '[]') as string[];
    expect(listIds).toHaveLength(2);
    expect(new Set(listIds).size).toBe(2);
    clickButton(host, 'matchEveryCondition');
    expect(JSON.parse(host.querySelector('[data-testid="rule-expressions"]')?.textContent ?? '[]')).toMatchObject([
        { type: 'all', all: [{ type: 'host' }, { type: 'host' }] },
    ]);
});

it('only matches all traffic after the explicit all-traffic action', () => {
    const host = renderDraft(createDefaultRuleDraft());
    clickButton(host, 'condition.always');
    expect(JSON.parse(host.querySelector('[data-testid="rule-expressions"]')?.textContent ?? '[]')).toEqual([{ type: 'always', always: {} }]);
    clickButton(host, 'matchSelectedTraffic');
    const conditions = JSON.parse(host.querySelector('[data-testid="rule-expressions"]')?.textContent ?? '[]') as Array<{ type: string }>;
    expect(conditions).toHaveLength(1);
    expect(conditions[0].type).toBe('host');
});

it('does not simplify nested or negated rules', () => {
    const draft = createDefaultRuleDraft();
    draft.rule.rules = [{ type: 'not', not: draft.rule.rules![0] }];
    const host = renderDraft(draft);
    const simple = [...host.querySelectorAll('button')].find(item => item.textContent === 'simpleEditor');
    expect(simple?.disabled).toBe(true);
    expect(host.textContent).toContain('complexRule');
    expect(JSON.parse(host.querySelector('[data-testid="rule-expressions"]')?.textContent ?? '[]')).toEqual(draft.rule.rules);
});

it('selects a Gateway action separately from proxy destinations', () => {
 const draft=createDefaultRuleDraft();draft.rule.target={type:'node',id:'old-node'};
 const host=renderDraft(draft);
 action(host,'gateway');
 expect(host.querySelector('[data-testid="saved-target"]')?.textContent).toBe('{"type":"gateway","id":""}');
 clickButton(host,'gateway:');
 expect(host.querySelector('[data-testid="saved-target"]')?.textContent).toContain('spotify');
 action(host,'proxy');
 expect(host.querySelector('[data-testid="target"]')?.textContent).toBe('default:');
});
