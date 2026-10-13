import type { Connection } from '@/contract/connection';
import { createDefaultRuleDraft, type RuleDraft } from '@/contract/route';

export function resourceLink(path: string, key: string, value: string): string {
    return `#${path}?${new URLSearchParams({ [key]: value })}`;
}

/** Prefer a sniffed/domain identity over the resolved destination IP. */
export function connectionHost(connection: Connection): string {
    const host = connection.tlsServerName || connection.httpHost || connection.domain || connection.addr;
    if (!host) return '';
    const bracketed = host.match(/^\[([^\]]+)\](?::\d+)?$/);
    if (bracketed) return bracketed[1];
    return host.replace(/^([^:]+):\d+$/, '$1');
}

/** A connection seeds matching data only; the user chooses the new action. */
export function connectionRuleDraft(search: string): RuleDraft | undefined {
    const params = new URLSearchParams(search);
    const type = params.get('match');
    const value = params.get('value')?.trim();
    if ((type !== 'host' && type !== 'process') || !value) return;
    const draft = createDefaultRuleDraft();
    draft.rule.name = value;
    const list = draft.lists[0];
    list.type = type;
    list.name = value;
    list.source = { type: 'local', local: { lists: [value] } };
    draft.rule.rules = type === 'host' ? [{ type, host: { list: list.id } }] : [{ type, process: { list: list.id } }];
    return draft;
}

export function connectionDraftLink(type: 'host' | 'process', value: string): string {
    return `#/docs/bypass?${new URLSearchParams({ match: type, value })}`;
}

// Diagnostics probe HTTPS names; literal-IP rules can still be created below.
export function canDiagnoseHost(host: string): boolean {
    const labels = host.toLowerCase().replace(/\.$/, '').split('.');
    return host.length <= 253 && labels.length > 1 && !/^\d+\.\d+\.\d+\.\d+$/.test(host)
        && labels.every(label => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label));
}
