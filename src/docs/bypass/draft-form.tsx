import { Button } from '@/component/v2/button';
import { SettingLabel, SettingsBox } from '@/component/v2/card';
import { SettingInputVertical, SettingSelectVertical } from '@/component/v2/forms';
import { Textarea } from '@/component/v2/input';
import { RouteTargetPicker } from '@/component/route-target-picker';
import { createDefaultRouteList, type RuleDraft } from '@/contract/route';
import { useState } from 'react';
import { ArrowRight, ListFilter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RouteRuleForm, type RuleEditorOptions } from './rule-form';
import { simpleCondition, simpleList } from './draft';

export function RuleDraftForm({ value, onChange, options }: { value: RuleDraft; onChange: (value: RuleDraft) => void; options: RuleEditorOptions }) {
    const { t } = useTranslation('routing');
    const local = simpleList(value);
    const condition = simpleCondition(value);
    const needsAdvanced = !condition || value.lists.some(list => list.id === condition.list && list.source.type !== 'local');
    const [advanced, setAdvanced] = useState(needsAdvanced);
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
    return <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ui-muted">{t('ruleTask')}</p>
            <Button size="sm" variant="outline-secondary" className="shrink-0" disabled={needsAdvanced} onClick={() => setAdvanced(!advanced)}>
                {advanced ? t('simpleEditor') : t('advancedEditor')}
            </Button>
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
            <section className="border-t border-ui-border/70 pt-5">
                <h3 className="mb-4 flex items-center gap-2.5 text-sm font-semibold text-ui-heading"><span className="rounded-ui-sm bg-ui-surface-muted p-1.5 text-ui-muted"><ListFilter size={16} aria-hidden="true" /></span>{t('matchTraffic')}</h3>
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
            <section className="rounded-ui-lg border border-ui-primary/15 bg-ui-primary-soft/30 p-4 sm:p-5">
                <h3 className="mb-4 flex items-center gap-2.5 text-sm font-semibold text-ui-heading"><span className="rounded-ui-sm bg-ui-primary-soft p-1.5 text-ui-primary"><ArrowRight size={16} aria-hidden="true" /></span>{t('handlingAndDestination')}</h3>
            <SettingSelectVertical label={t('action')} value={value.rule.mode} values={[[t('proxy'), 'proxy'], [t('direct'), 'direct'], [t('block'), 'block']]} onChange={mode => patchRule({ mode, target: mode === 'proxy' ? value.rule.target : { type: 'default' } })} />
            {value.rule.mode === 'proxy' && <div className="space-y-2"><SettingLabel>{t('destination')}</SettingLabel><RouteTargetPicker compact value={value.rule.target} onChange={target => patchRule({ target })} /></div>}
            </section>
            {Boolean(value.rule.resolver || value.rule.resolveStrategy && value.rule.resolveStrategy !== 'default' || value.rule.udpProxyFqdnStrategy && value.rule.udpProxyFqdnStrategy !== 'udp_proxy_fqdn_strategy_default') && <p className="mt-3 text-sm text-ui-muted">{t('customOptions')}</p>}
        </>}
    </div>;
}
