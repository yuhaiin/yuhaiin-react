import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { normalizeConnection } from '@/contract/connection';
import { draftForSave } from '@/docs/bypass/draft';
import { connectionDraftLink, connectionHost, connectionRuleDraft } from './actions';
import { ConnectionActions } from './connection-actions';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it('uses the original host and seeds an independent private list without inheriting an action', () => {
    const connection = normalizeConnection({ addr: '192.0.2.1:443', tlsServerName: 'work.example' });
    const target = connectionHost(connection);
    expect(target).toBe('work.example');
    const link = connectionDraftLink('host', target);
    const first = connectionRuleDraft(link.split('?')[1])!;
    const second = connectionRuleDraft(link.split('?')[1])!;
    expect(first.rule.id).not.toBe(second.rule.id);
    expect(first.rule.target).toEqual({ type: 'default' });
    expect(first.lists[0].ownerRuleId).toBe(first.rule.id);
    expect(first.lists[0].source.local?.lists).toEqual(['work.example']);
    expect(draftForSave(first).lists).toHaveLength(1);
    expect(connectionHost(normalizeConnection({ addr: '[2001:db8::1]:443' }))).toBe('2001:db8::1');
});

it('preserves application paths through encoded navigation and rejects incomplete drafts', () => {
    const process = '/opt/My App/run?mode=a&b';
    const draft = connectionRuleDraft(connectionDraftLink('process', process).split('?')[1])!;
    expect(draft.rule.rules).toEqual([{ type: 'process', process: { list: draft.lists[0].id } }]);
    expect(draft.lists[0].source.local?.lists).toEqual([process]);
    expect(connectionRuleDraft('match=other&value=a')).toBeUndefined();
    expect(connectionRuleDraft('match=host&value=')).toBeUndefined();
});

it('links routing decisions by stable identities and offers explicit draft and diagnostics actions', () => {
    const host = document.createElement('div');
    const root = createRoot(host);
    const connection = normalizeConnection({ ruleId: 'rule-1', ruleName: 'Work', selectorId: 'shared-1', selectorName: 'Office', nodeId: 'node-1', nodeName: 'Server', mode: 'proxy', domain: 'work.example' });
    act(() => root.render(<ConnectionActions connection={connection} />));
    const hrefs = [...host.querySelectorAll('a')].map(link => link.getAttribute('href'));
    expect(hrefs).toContain('#/docs/bypass?rule=rule-1');
    expect(hrefs).toContain('#/docs/group/selectors?selector=shared-1');
    expect(hrefs).toContain('#/docs/group?node=node-1');
    expect(hrefs).toContain('#/docs/diagnostics?host=work.example');
    expect(hrefs).toContain('#/docs/bypass?match=host&value=work.example');
    act(() => root.render(<ConnectionActions connection={{ ...connection, ruleId: '', nodeId: '', selectorId: '', mode: 'block' }} />));
    expect(host.textContent).toContain('usedDefaultRoute');
    expect(host.querySelector('a[href*="node="]')).toBeNull();
    act(() => root.unmount());
});
