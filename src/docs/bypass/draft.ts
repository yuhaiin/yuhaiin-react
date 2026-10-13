import type { RuleDraft, RuleExpr, RouteListDetail } from '@/contract/route';

export function referencedLists(rules: RuleExpr[]): Set<string> {
    const ids = new Set<string>();
    const visit = (expr: RuleExpr) => {
        if (expr.type === 'host') ids.add(expr.host.list);
        if (expr.type === 'process') ids.add(expr.process.list);
        if (expr.type === 'all') for (const child of expr.all) visit(child);
        if (expr.type === 'any') for (const child of expr.any) visit(child);
        if (expr.type === 'not') visit(expr.not);
    };
    for (const rule of rules) visit(rule);
    return ids;
}

export function draftForSave(draft: RuleDraft): RuleDraft {
    const used = referencedLists(draft.rule.rules ?? []);
    return { ...draft, lists: draft.lists.filter(list => used.has(list.id)), shareLists: draft.shareLists?.filter(id => used.has(id)) };
}

export function simpleCondition(draft: RuleDraft): { type: 'host' | 'process'; list: string } | undefined {
    if (draft.rule.rules?.length !== 1) return;
    let expr = draft.rule.rules[0];
    if (expr.type === 'all' && expr.all?.length === 1) expr = expr.all[0];
    if (expr.type === 'host') return { type: 'host', list: expr.host.list };
    if (expr.type === 'process') return { type: 'process', list: expr.process.list };
}

export function simpleList(draft: RuleDraft): RouteListDetail | undefined {
    const condition = simpleCondition(draft);
    return draft.lists.find(list => list.id === condition?.list && list.source.type === 'local');
}
