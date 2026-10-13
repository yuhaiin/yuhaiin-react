import { Button } from '@/component/v2/button';
import { SettingLabel, SettingsBox } from '@/component/v2/card';
import { SettingInputVertical, SettingSelectVertical } from '@/component/v2/forms';
import { Textarea } from '@/component/v2/input';
import { RouteTargetPicker } from '@/component/route-target-picker';
import { createDefaultRouteList, type RuleDraft } from '@/contract/route';
import { useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { RouteRuleForm, type RuleEditorOptions } from './rule-form';
import { hasAdvancedRuleOptions, simpleCondition, simpleList } from './draft';

export function RuleDraftForm({ value, onChange, options }: { value: RuleDraft; onChange: (value: RuleDraft) => void; options: RuleEditorOptions }) {
    const { t } = useTranslation('routing');
    const local = simpleList(value);
    const condition = simpleCondition(value);
    const needsAdvanced = !condition || value.lists.some(list => list.id === condition.list && list.source.type !== 'local');
    const [advanced, setAdvanced] = useState(needsAdvanced);
    const hiddenSettings = hasAdvancedRuleOptions(value.rule);
    const setCondition = (type: 'host' | 'process', list: string) => onChange({
        ...value, rule: { ...value.rule, rules: [type === 'host' ? { type, host: { list } } : { type, process: { list } }] },
    });
    const usePrivate = (type: 'host' | 'process') => {
        const list = value.lists.find(item => item.type === type && item.source.type === 'local') ?? {
            ...createDefaultRouteList(t('privateList')), id: crypto.randomUUID(), ownerRuleId: value.rule.id, type,
        };
        onChange({ ...value,
            rule: { ...value.rule, rules: [type === 'host' ? { type, host: { list: list.id } } : { type, process: { list: list.id } }] },
            lists: value.lists.some(item => item.id === list.id) ? value.lists : [...value.lists, list],
        });
    };
    const patchRule = (patch: Partial<RuleDraft['rule']>) => onChange({ ...value, rule: { ...value.rule, ...patch } });
    const setListText = (id: string, text: string) => onChange({ ...value, lists: value.lists.map(list => list.id === id ? {
        ...list, source: { type: 'local', local: { lists: text.split('\n') } },
    } : list) });
    const addList = () => {
        const list = { ...createDefaultRouteList(t('privateList')), id: crypto.randomUUID(), ownerRuleId: value.rule.id };
        onChange({ ...value, lists: [...value.lists, list] });
    };
    const shareControl = (id: string) => <div className="mt-3 mb-4 space-y-2">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.shareLists?.includes(id) ?? false}
            onChange={event => onChange({ ...value, shareLists: event.target.checked ? [...(value.shareLists ?? []), id] : value.shareLists?.filter(item => item !== id) })} />{t('shareMatchingData')}</label>
        {value.shareLists?.includes(id) && <p className="text-xs text-ui-muted">{t('shareMatchingHelp')}</p>}
    </div>;
    return <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ui-border/60 pb-4">
            <p className="max-w-lg text-sm text-ui-muted">{t('ruleTask')}</p>
            <div role="group" aria-label={t('ruleEditor')} className="inline-flex shrink-0 gap-1 rounded-ui-md bg-ui-surface-muted p-1">
                <Button type="button" size="sm" variant="outline-secondary" disabled={needsAdvanced} aria-pressed={!advanced && !needsAdvanced}
                    className={clsx('h-8 border-transparent shadow-none', !advanced && !needsAdvanced ? 'bg-ui-surface text-ui-heading' : 'bg-transparent text-ui-muted')}
                    onClick={() => setAdvanced(false)}>{t('simpleEditor')}</Button>
                <Button type="button" size="sm" variant="outline-secondary" aria-pressed={advanced || needsAdvanced}
                    className={clsx('h-8 border-transparent shadow-none', advanced || needsAdvanced ? 'bg-ui-surface text-ui-heading' : 'bg-transparent text-ui-muted')}
                    onClick={() => setAdvanced(true)}>{t('advancedEditor')}</Button>
            </div>
        </div>
        {advanced || needsAdvanced ? <>
            {needsAdvanced && <p className="text-sm text-ui-muted">{t('complexRule')}</p>}
            <RouteRuleForm value={value.rule} onChange={rule => onChange({ ...value, rule })} options={{ ...options, lists: [...options.lists, ...value.lists.map(list => list.id)], listTypes: { ...options.listTypes, ...Object.fromEntries(value.lists.map(list => [list.id, list.type])) }, listNames: { ...options.listNames, ...Object.fromEntries(value.lists.map(list => [list.id, list.name])) } }} />
            {value.lists.map(list => <SettingsBox key={list.id}>
                <SettingInputVertical label={t('matchingData')} value={list.name} onChange={name => onChange({ ...value, lists: value.lists.map(item => item.id === list.id ? { ...item, name } : item) })} />
                <SettingSelectVertical label={t('conditionType')} value={list.type} values={[[t('websites'), 'host'], [t('applications'), 'process']]} onChange={type => onChange({ ...value, lists: value.lists.map(item => item.id === list.id ? { ...item, type } : item) })} />
                <label className="block space-y-2"><SettingLabel>{t('onePerLine')}</SettingLabel>
                    <Textarea value={list.source.local?.lists?.join('\n') ?? ''} onChange={event => setListText(list.id, event.target.value)} />
                </label>
                {shareControl(list.id)}
            </SettingsBox>)}
            <Button size="sm" onClick={addList}>{t('addMatchingData')}</Button>
        </> : condition && <>
            <SettingInputVertical className="mb-0" label={t('name')} value={value.rule.name} onChange={name => patchRule({ name })} />
            {hiddenSettings && <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-ui-md border border-ui-border bg-ui-surface-muted/50 px-3 py-2.5">
                <p className="text-sm text-ui-muted">{t('customOptions')}</p>
                <Button type="button" size="sm" variant="outline-secondary" onClick={() => setAdvanced(true)}>{t('advancedEditor')}</Button>
            </div>}
            <section className="border-t border-ui-border/60 pt-5">
                <h3 className="mb-4 text-sm font-semibold text-ui-heading">{t('matchTraffic')}</h3>
                <div className="grid gap-x-4 sm:grid-cols-2">
            <SettingSelectVertical label={t('traffic')} value={condition.type} values={[[t('websites'), 'host'], [t('applications'), 'process']]}
                onChange={type => local ? usePrivate(type as 'host' | 'process') : setCondition(type as 'host' | 'process', '')} />
            <SettingSelectVertical label={t('matchingSource')} value={local ? 'private' : 'shared'}
                values={[[t('enterMatchingData'), 'private'], [t('chooseSharedList'), 'shared']]}
                onChange={source => source === 'private' ? usePrivate(condition.type) : setCondition(condition.type, '')} />
                </div>
            {local ? <>
                {value.shareLists?.includes(local.id) && <SettingInputVertical label={t('matchingData')} value={local.name} onChange={name => onChange({ ...value, lists: value.lists.map(item => item.id === local.id ? { ...item, name } : item) })} />}
                <label className="block space-y-2">
                    <SettingLabel>{t('onePerLine')}</SettingLabel>
                    <Textarea className="min-h-32 bg-ui-surface-muted/40 font-mono text-sm leading-relaxed" value={local.source.local?.lists?.join('\n') ?? ''}
                        onChange={event => setListText(local.id, event.target.value)} placeholder={local.type === 'host' ? 'example.com\n*.example.com\n10.0.0.0/8' : '/usr/bin/firefox'} />
                </label>
                <p className="mt-2 mb-4 text-sm text-ui-muted">{local.type === 'host' ? t('domainHelp') : t('processHelp')}</p>
                {shareControl(local.id)}
            </> : <>
                <SettingSelectVertical label={t('chooseSharedList')} value={condition.list} emptyChoose emptyChooseName={t('chooseSharedList')}
                    values={options.lists.filter(id => condition.type === 'process' ? options.listTypes?.[id] === 'process' : ['host', 'hosts_as_host'].includes(options.listTypes?.[id] ?? 'host')).map(id => [options.listNames?.[id] ?? id, id] as [string, string])}
                    onChange={id => setCondition(condition.type, id)} />
                <p className="mb-4 text-sm text-ui-muted">{t('sharedListHelp')}</p>
            </>}
            </section>
            <section className="space-y-4 border-t border-ui-border/60 pt-5">
                <h3 className="text-sm font-semibold text-ui-heading">{t('handlingAndDestination')}</h3>
                <div role="group" aria-label={t('action')} className="grid grid-cols-3 gap-2">
                    {(['proxy', 'direct', 'block'] as const).map(mode => <button key={mode} type="button"
                        aria-pressed={value.rule.mode === mode}
                        className={clsx('min-h-10 rounded-ui-md border px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus',
                            value.rule.mode === mode ? 'border-ui-primary bg-ui-primary-soft text-ui-primary' : 'border-ui-border bg-ui-surface text-ui-muted hover:bg-ui-surface-muted')}
                        onClick={() => patchRule({ mode })}>{t(mode)}</button>)}
                </div>
                {value.rule.mode === 'proxy' && <div className="space-y-2"><SettingLabel>{t('destination')}</SettingLabel><RouteTargetPicker compact value={value.rule.target} onChange={target => patchRule({ target })} /></div>}
            </section>
        </>}
    </div>;
}
