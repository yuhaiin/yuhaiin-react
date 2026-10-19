import { Button } from '@/component/v2/button';
import { SettingLabel, SettingsBox } from '@/component/v2/card';
import { SettingInputVertical, SettingSelectVertical } from '@/component/v2/forms';
import { Input, Textarea } from '@/component/v2/input';
import SwitchComponent from '@/component/v2/switch';
import { GatewayPicker } from '@/component/gateway-picker';
import { RouteTargetPicker } from '@/component/route-target-picker';
import { changeRuleAction, createDefaultRouteList, type RuleDraft } from '@/contract/route';
import { useId, useState } from 'react';
import { createID } from '@/common/id';
import { ToggleGroup, ToggleItem } from '@/component/v2/togglegroup';
import { useTranslation } from 'react-i18next';
import { RouteRuleForm, type RuleEditorOptions } from './rule-form';
import { hasAdvancedRuleOptions, parseSimpleMatcher, referencedLists } from './draft';
import { SimpleConditions, type PrivateChoiceHistory } from './simple-conditions';

export function RuleDraftForm({ value, onChange, options }: { value: RuleDraft; onChange: (value: RuleDraft) => void; options: RuleEditorOptions }) {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    const nameId = useId();
    const matcher = parseSimpleMatcher(value.rule.rules);
    const used = referencedLists(value.rule.rules ?? []);
    const needsAdvanced = !matcher || value.lists.some(list => used.has(list.id) && list.source.type !== 'local');
    const [advanced, setAdvanced] = useState(needsAdvanced);
    const [privateHistory] = useState<PrivateChoiceHistory>(() => new WeakMap());
    const hiddenSettings = hasAdvancedRuleOptions(value.rule);
    const patchRule = (patch: Partial<RuleDraft['rule']>) => onChange({ ...value, rule: { ...value.rule, ...patch } });
    const setListText = (id: string, text: string) => onChange({ ...value, lists: value.lists.map(list => list.id === id ? {
        ...list, source: { type: 'local', local: { lists: text.split('\n') } },
    } : list) });
    const addList = () => {
        const list = { ...createDefaultRouteList(t('privateList')), id: createID(), ownerRuleId: value.rule.id };
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
            <ToggleGroup type="single" value={advanced || needsAdvanced ? 'advanced' : 'simple'} aria-label={t('ruleEditor')}
                onValueChange={mode => { if (mode) setAdvanced(mode === 'advanced'); }}>
                <ToggleItem value="simple" disabled={needsAdvanced}>{t('simpleEditor')}</ToggleItem>
                <ToggleItem value="advanced">{t('advancedEditor')}</ToggleItem>
            </ToggleGroup>
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

        </> : matcher && <>
            <div className="min-w-0">
                <SettingLabel htmlFor={nameId}>{t('name')}</SettingLabel>
                <div className="flex min-w-0 items-center gap-4">
                    <Input id={nameId} className="min-w-0 flex-1" value={value.rule.name}
                        onChange={event => patchRule({ name: event.target.value })} />
                    <div className="shrink-0 text-sm"><SwitchComponent label={uiT('enabled')} checked={!value.rule.disabled}
                        onCheckedChange={enabled => patchRule({ disabled: !enabled })} /></div>
                </div>
            </div>
            {hiddenSettings && <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-ui-md border border-ui-border bg-ui-surface-muted/50 px-3 py-2.5">
                <p className="text-sm text-ui-muted">{t('customOptions')}</p>
                <Button type="button" size="sm" variant="outline-secondary" onClick={() => setAdvanced(true)}>{t('advancedEditor')}</Button>
            </div>}
            <SimpleConditions privateHistory={privateHistory} value={value} matcher={matcher} options={options} onChange={onChange} />
            <section className="space-y-4 border-t border-ui-border/60 pt-5">
                <h3 className="text-sm font-medium text-ui-heading">{t('handlingAndDestination')}</h3>
                <ToggleGroup type="single" value={value.rule.mode} aria-label={t('action')} className="grid grid-cols-2 sm:grid-cols-4"
                    onValueChange={mode => { if (['proxy', 'direct', 'block', 'gateway'].includes(mode)) onChange({ ...value, rule: changeRuleAction(value.rule, mode) }); }}>
                    {(['proxy', 'direct', 'block', 'gateway'] as const).map(mode => <ToggleItem key={mode} value={mode}>{t(mode)}</ToggleItem>)}
                </ToggleGroup>
                {value.rule.mode === 'gateway' && <GatewayPicker value={value.rule.target} onChange={target => patchRule({ target })} />}
                {value.rule.mode === 'proxy' && <div className="space-y-2"><SettingLabel>{t('destination')}</SettingLabel><RouteTargetPicker compact value={value.rule.target} onChange={target => patchRule({ target })} /></div>}
            </section>        </>}
    </div>;
}
