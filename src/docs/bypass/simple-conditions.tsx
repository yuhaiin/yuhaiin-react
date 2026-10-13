import { Button } from '@/component/v2/button';
import { SettingLabel } from '@/component/v2/card';
import { DropdownSelect, SettingSelectVertical, SettingInputVertical } from '@/component/v2/forms';
import { Input, Textarea } from '@/component/v2/input';
import { createDefaultRouteList, type RuleDraft, type RuleExpr, type RouteListDetail } from '@/contract/route';
import clsx from 'clsx';
import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { buildSimpleMatcher, type SimpleLeafType, type SimpleMatcher } from './draft';
import type { RuleEditorOptions } from './rule-form';

const conditionTypes: SimpleLeafType[] = ['host', 'process', 'inbound', 'network', 'port', 'geoip'];

function listReference(expr: RuleExpr): string {
    return expr.type === 'host' ? expr.host.list : expr.type === 'process' ? expr.process.list : '';
}

function listExpr(type: 'host' | 'process', list: string): RuleExpr {
    return type === 'host' ? { type: 'host', host: { list } } : { type: 'process', process: { list } };
}

function newPrivateList(type: 'host' | 'process', draft: RuleDraft, name: string): RouteListDetail {
    return {
        ...createDefaultRouteList(name),
        id: crypto.randomUUID(),
        ownerRuleId: draft.rule.id,
        type,
    };
}

function otherCondition(type: SimpleLeafType): RuleExpr {
    switch (type) {
        case 'inbound': return { type, inbound: { names: [] } };
        case 'network': return { type, network: { network: 'tcp' } };
        case 'port': return { type, port: { ports: '' } };
        case 'geoip': return { type, geoip: { countries: '' } };
        default: throw new Error('A list condition requires a list');
    }
}

/** A task-oriented projection of the same rule AST used by the advanced editor. */
export function SimpleConditions({ value, matcher, options, onChange }: {
    value: RuleDraft;
    matcher: SimpleMatcher;
    options: RuleEditorOptions;
    onChange: (draft: RuleDraft) => void;
}) {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');

    const setMatcher = (next: SimpleMatcher, lists: RouteListDetail[] = value.lists) => {
        onChange({ ...value, lists, rule: { ...value.rule, rules: buildSimpleMatcher(next) } });
    };
    const replaceItem = (index: number, expr: RuleExpr, lists = value.lists) => {
        setMatcher({ ...matcher, items: matcher.items.map((item, i) => i === index ? expr : item) }, lists);
    };
    const newListCondition = (index: number, type: 'host' | 'process') => {
        const list = newPrivateList(type, value, t('privateList'));
        replaceItem(index, listExpr(type, list.id), [...value.lists, list]);
    };
    const chooseType = (index: number, type: SimpleLeafType) => {
        if (type === 'host' || type === 'process') newListCondition(index, type);
        else replaceItem(index, otherCondition(type));
    };
    const addCondition = () => {
        const list = newPrivateList('host', value, t('privateList'));
        setMatcher({ join: matcher.join === 'always' ? 'any' : matcher.join, items: [...matcher.items, listExpr('host', list.id)] }, [...value.lists, list]);
    };
    const updateList = (id: string, patch: (list: RouteListDetail) => RouteListDetail) => {
        onChange({ ...value, lists: value.lists.map(list => list.id === id ? patch(list) : list) });
    };
    const setShared = (id: string, checked: boolean) => {
        const share = value.shareLists ?? [];
        onChange({ ...value, shareLists: checked ? [...new Set([...share, id])] : share.filter(item => item !== id) });
    };

    return <section className="space-y-4 border-t border-ui-border/60 pt-5">
        <h3 className="text-sm font-semibold text-ui-heading">{t('matchTraffic')}</h3>
        <div role="group" aria-label={t('matchScope')} className="grid grid-cols-2 gap-2">
            {(['any', 'always'] as const).map(mode => <button type="button" key={mode}
                aria-pressed={mode === 'always' ? matcher.join === 'always' : matcher.join !== 'always'}
                className={clsx('min-h-10 rounded-ui-md border px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus',
                    (mode === 'always' ? matcher.join === 'always' : matcher.join !== 'always')
                        ? 'border-ui-primary bg-ui-primary-soft text-ui-primary'
                        : 'border-ui-border bg-ui-surface text-ui-muted hover:bg-ui-surface-muted')}
                onClick={() => mode === 'always'
                    ? setMatcher({ join: 'always', items: [] })
                    : matcher.join === 'always' && addCondition()}>
                {mode === 'always' ? t('condition.always') : t('matchSelectedTraffic')}
            </button>)}
        </div>
        {matcher.join === 'always' ? <p className="rounded-ui-md border border-ui-warning/30 bg-ui-warning-soft/40 p-3 text-sm text-ui-muted">{t('allTrafficHelp')}</p> : <>
            {matcher.items.length > 1 && <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-ui-muted">{t('combineConditions')}</span>
                <div role="group" aria-label={t('combineConditions')} className="inline-flex gap-1 rounded-ui-md bg-ui-surface-muted p-1">
                    {(['any', 'all'] as const).map(join => <button type="button" key={join} aria-pressed={matcher.join === join}
                        onClick={() => setMatcher({ ...matcher, join })}
                        className={clsx('rounded-ui-sm px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus',
                            matcher.join === join ? 'bg-ui-surface text-ui-heading' : 'text-ui-muted hover:text-ui-heading')}>
                        {t(join === 'all' ? 'matchEveryCondition' : 'matchAnyCondition')}
                    </button>)}
                </div>
            </div>}
            <div className="space-y-3">
                {matcher.items.map((expr, index) => {
                    const listId = listReference(expr);
                    const local = value.lists.find(list => list.id === listId && list.source.type === 'local');
                    const isList = expr.type === 'host' || expr.type === 'process';
                    const listType = expr.type === 'process' ? 'process' : 'host';
                    const listChoices = options.lists.filter(id => listType === 'process'
                        ? options.listTypes?.[id] === 'process'
                        : ['host', 'hosts_as_host'].includes(options.listTypes?.[id] ?? 'host'));
                    if (listId && !local && !listChoices.includes(listId)) listChoices.unshift(listId);
                    return <div key={index} className="min-w-0 space-y-3 rounded-ui-lg border border-ui-border/70 bg-ui-surface-muted/20 p-3 sm:p-4">
                        <div className="flex min-w-0 items-start gap-2">
                            <span className="mt-2 shrink-0 font-mono text-xs text-ui-muted">#{index + 1}</span>
                            <div className="min-w-0 flex-1">
                                <SettingSelectVertical className="mb-0" label={t('conditionOperator')} value={expr.type}
                                    values={conditionTypes.map(type => [t('condition.' + type), type] as [string, string])}
                                    onChange={type => chooseType(index, type as SimpleLeafType)} />
                            </div>
                            <Button type="button" size="icon" variant="outline-secondary" className="mt-6 h-8 w-8 border-transparent"
                                disabled={matcher.items.length === 1} aria-label={t('removeCondition')}
                                title={t('removeCondition')}
                                onClick={() => setMatcher({ ...matcher, items: matcher.items.filter((_, i) => i !== index) })}>
                                <X size={16}/>
                            </Button>
                        </div>
                        {isList && <>
                            <SettingSelectVertical className="mb-0" label={t('matchingSource')} value={local ? 'private' : 'shared'}
                                values={[[t('enterMatchingData'), 'private'], [t('chooseSharedList'), 'shared']]}
                                onChange={source => source === 'private'
                                    ? newListCondition(index, listType)
                                    : replaceItem(index, listExpr(listType, ''))} />
                            {local ? <>
                                <label className="block space-y-2">
                                    <SettingLabel>{t('onePerLine')}</SettingLabel>
                                    <Textarea className="min-h-28 w-full bg-ui-surface font-mono text-sm leading-relaxed"
                                        value={local.source.local?.lists?.join('\n') ?? ''}
                                        onChange={event => updateList(local.id, list => ({
                                            ...list, source: { type: 'local', local: { lists: event.target.value.split('\n') } },
                                        }))}
                                        placeholder={expr.type === 'host' ? 'example.com\n*.example.com\n10.0.0.0/8' : '/usr/bin/firefox'} />
                                </label>
                                <label className="flex items-center gap-2 text-sm text-ui-muted">
                                    <input type="checkbox" checked={value.shareLists?.includes(local.id) ?? false}
                                        onChange={event => setShared(local.id, event.target.checked)} />
                                    {t('shareMatchingData')}
                                </label>
                                {value.shareLists?.includes(local.id) && <>
                                    <SettingInputVertical className="mb-0" label={t('matchingData')} value={local.name}
                                        onChange={name => updateList(local.id, list => ({ ...list, name }))} />
                                    <p className="text-xs text-ui-muted">{t('shareMatchingHelp')}</p>
                                </>}
                            </> : <>
                                <SettingSelectVertical className="mb-0" label={t('chooseSharedList')} value={listId}
                                    emptyChoose emptyChooseName={t('chooseSharedList')}
                                    values={listChoices.map(id => [options.listNames?.[id] ?? id, id] as [string, string])}
                                    onChange={id => replaceItem(index, listExpr(listType, id))} />
                                {!listId && <p role="status" className="text-xs text-ui-warning">{t('selectMatchingData')}</p>}
                            </>}
                        </>}
                        {expr.type === 'network' && <SettingSelectVertical className="mb-0" label={uiT('network')}
                            value={expr.network.network} values={[[uiT('tcp'), 'tcp'], [uiT('udp'), 'udp']]}
                            onChange={network => replaceItem(index, { type: 'network', network: { network } })} />}
                        {expr.type === 'port' && <SettingInputVertical className="mb-0" label={uiT('port')}
                            value={expr.port.ports} placeholder="80,443,1000-2000"
                            onChange={ports => replaceItem(index, { type: 'port', port: { ports } })} />}
                        {expr.type === 'geoip' && <SettingInputVertical className="mb-0" label={t('countryCodes')}
                            value={expr.geoip.countries} placeholder="CN,JP,US"
                            onChange={countries => replaceItem(index, { type: 'geoip', geoip: { countries } })} />}
                        {expr.type === 'inbound' && <div className="space-y-2">
                            <SettingLabel>{t('condition.inbound')}</SettingLabel>
                            <DropdownSelect
                                values={expr.inbound.names ?? (expr.inbound.name ? [expr.inbound.name] : [])}
                                items={[...new Set([...options.inbounds, ...(expr.inbound.names ?? [])])]}
                                format={id => options.inboundNames?.[id] ?? id}
                                onUpdate={names => replaceItem(index, { type: 'inbound', inbound: { names } })} />
                        </div>}
                    </div>;
                })}
            </div>
            <Button type="button" size="sm" variant="outline-secondary" className="gap-2" onClick={addCondition}>
                <Plus size={15}/>{t('addCondition')}
            </Button>
        </>}
    </section>;
}
