import { describe, expect, it } from 'vitest';
import { createDefaultRuleDraft, type RuleDraft } from '@/contract/route';
import { draftForSave, hasAdvancedRuleOptions, referencedLists, simpleList } from './draft';

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
        expect(hasAdvancedRuleOptions(draft.rule)).toBe(true);
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
