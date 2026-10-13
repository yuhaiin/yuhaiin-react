import { describe, expect, it } from 'vitest';
import { createDefaultRuleDraft, type RuleDraft } from '@/contract/route';
import { buildSimpleMatcher, draftForSave, hasAdvancedRuleOptions, parseSimpleMatcher, referencedLists, simpleList } from './draft';

describe('rule editing views', () => {
    it('keeps DNS and destination overrides while editing simple matching data', () => {
        const draft = createDefaultRuleDraft();
        draft.rule.resolver = 'custom-dns';
        draft.rule.resolveStrategy = 'only_ipv4';
        draft.rule.target = { type: 'selector', id: 'work' };
        draft.lists[0].source.local!.lists = ['example.com'];
        const saved = draftForSave(draft);
        expect(saved.rule.resolver).toBe('custom-dns');
        expect(saved.rule.resolveStrategy).toBe('only_ipv4');
        expect(saved.rule.target).toEqual({ type: 'selector', id: 'work' });
        expect(simpleList(saved)?.source.local?.lists).toEqual(['example.com']);
    });

    it('marks active advanced options even when the match is simple', () => {
        const draft = createDefaultRuleDraft();
        expect(hasAdvancedRuleOptions(draft.rule)).toBe(false);
        draft.rule.disabled = true;
        expect(hasAdvancedRuleOptions(draft.rule)).toBe(false);
        draft.rule.disabled = false;
        draft.rule.resolveStrategy = 'only_ipv6';
        expect(hasAdvancedRuleOptions(draft.rule)).toBe(true);
        draft.rule.resolveStrategy = 'default';
        draft.rule.resolver = 'custom-dns';
        expect(hasAdvancedRuleOptions(draft.rule)).toBe(true);
    });

    it('retains private data referenced in recursive and negated conditions', () => {
        const draft = createDefaultRuleDraft();
        const id = draft.lists[0].id;
        draft.rule.rules = [{ type: 'not', not: { type: 'any', any: [{ type: 'host', host: { list: id } }, { type: 'process', process: { list: 'shared-apps' } }] } }];
        expect(referencedLists(draft.rule.rules)).toEqual(new Set([id, 'shared-apps']));
        expect(draftForSave(draft).lists).toHaveLength(1);
        expect(simpleList(draft)).toBeUndefined();
    });

    it('removes detached owned data without turning complex rules into simple rules', () => {
        const draft: RuleDraft = createDefaultRuleDraft();
        draft.rule.rules = [{ type: 'host', host: { list: 'shared-sites' } }];
        expect(draftForSave(draft).lists).toHaveLength(0);
        expect(draftForSave(draft).rule.rules).toEqual(draft.rule.rules);
    });
});

describe('simple multi-condition matching', () => {
    it('round trips a flat OR/AND without changing rule semantics', () => {
        const host = { type: 'host' as const, host: { list: 'sites' } };
        const port = { type: 'port' as const, port: { ports: '443' } };
        const both = { join: 'all' as const, items: [host, port] };
        const either = { join: 'any' as const, items: [host, port] };
        expect(parseSimpleMatcher(buildSimpleMatcher(both))).toEqual(both);
        expect(parseSimpleMatcher(buildSimpleMatcher(either))).toEqual(either);
        expect(buildSimpleMatcher(both)).toEqual([{ type: 'all', all: [host, port] }]);
        expect(buildSimpleMatcher(either)).toEqual([host, port]);
    });

    it('supports explicit match-all but rejects empty/ambiguous matching', () => {
        expect(parseSimpleMatcher([{ type: 'always', always: {} }])).toEqual({ join: 'always', items: [] });
        expect(parseSimpleMatcher([])).toBeUndefined();
        expect(() => buildSimpleMatcher({ join: 'any', items: [] })).toThrow();
    });

    it('does not flatten NOT or nested conditions into the task editor', () => {
        const host = { type: 'host' as const, host: { list: 'sites' } };
        const port = { type: 'port' as const, port: { ports: '443' } };
        const not = { type: 'not' as const, not: host };
        expect(parseSimpleMatcher([not])).toBeUndefined();
        expect(parseSimpleMatcher([{ type: 'all', all: [host, { type: 'any', any: [host, port] }] }])).toBeUndefined();
        expect(parseSimpleMatcher([{ type: 'all', all: [] }])).toBeUndefined();
    });

    it('preserves advanced overrides when rebuilding rule conditions', () => {
        const draft = createDefaultRuleDraft();
        draft.rule.resolver = 'dns-1';
        draft.rule.target = { type: 'node', id: 'proxy-1' };
        const matcher = parseSimpleMatcher(draft.rule.rules)!;
        draft.rule.rules = buildSimpleMatcher({ join: 'all', items: [
            ...matcher.items, { type: 'port', port: { ports: '443' } },
        ] });
        expect(draftForSave(draft).rule).toMatchObject({
            resolver: 'dns-1', target: { type: 'node', id: 'proxy-1' },
        });
        expect(draftForSave(draft).lists).toHaveLength(1);
    });
});
