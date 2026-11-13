import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import Switch from '@/component/v2/switch';
import { cn, ui } from '@/component/v2/styles';
import { moveRule, newRouteRule, orderedRules, matchError, targetError, type RouteRule, type SystemNetworkCapabilities, type SystemNetworkInterfaces, type SystemNetworkPreview, type SystemNetworkStatus } from '@/contract/system-network';
import { ArrowDown, ArrowRight, ArrowUp, CircleAlert, Info, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RouteRuleEditor } from './rule-editor';
import { describeMatch, describeTarget, StateBadge } from './shared';

export function RoutingTab({ rules, onChange, capabilities, interfaces, status, preview, dirty }: {
    rules: RouteRule[];
    onChange: (rules: RouteRule[]) => void;
    capabilities: SystemNetworkCapabilities;
    interfaces?: SystemNetworkInterfaces;
    status?: SystemNetworkStatus;
    preview?: SystemNetworkPreview;
    dirty: boolean;
}) {
    const { t } = useTranslation('systemNetwork');
    const [editing, setEditing] = useState<{ rule: RouteRule; isNew: boolean } | null>(null);
    const order = orderedRules(rules);
    const add = () => {
        const target = capabilities.routeTargets.includes('tun_inbound')
            ? { type: 'tun_inbound', inboundId: interfaces?.tunInbounds.length === 1 ? interfaces.tunInbounds[0].id : undefined }
            : { type: capabilities.routeTargets[0] ?? 'interface' };
        setEditing({ rule: newRouteRule(rules, target), isNew: true });
    };
    const save = (rule: RouteRule) => {
        onChange(rules.some(r => r.id === rule.id) ? rules.map(r => r.id === rule.id ? rule : r) : [...rules, rule]);
        setEditing(null);
    };
    const name = (rule: RouteRule) => rule.name || t('routing.unnamed');
    const nameOf = (id: string) => name(rules.find(r => r.id === id) ?? { name: id } as RouteRule);
    if (!capabilities.routeManagement) return <p role="note" className={cn(ui.softPanel, 'p-4 text-sm text-ui-fg')}>{t('platform.none')}</p>;
    return <div className="grid min-w-0 gap-5">
        <p className="flex gap-2 text-xs leading-relaxed text-ui-muted"><Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{t(`platform.${['linux', 'darwin', 'windows', 'android'].includes(capabilities.platform) ? capabilities.platform : 'none'}`)}</p>
        {status?.migrations && status.migrations.length > 0 && <div role="note" className="grid gap-2 rounded-ui-md bg-ui-info-soft p-3 text-sm text-ui-fg">
            <p className="font-medium">{t('routing.migration')}</p>
            <p className="text-xs text-ui-muted">{t('routing.migrationHelp')}</p>
            <ul className="grid gap-1 text-xs">{status.migrations.map(m => <li key={`${m.inboundId}:${m.ruleId}:${m.source}`}>
                {t('routing.migrationItem', { inbound: m.inboundName || m.inboundId, source: m.ruleId ? nameOf(m.ruleId) : m.source })}
                {m.warnings?.map(w => <span key={w} className="block text-ui-warning">{w}</span>)}
            </li>)}</ul>
        </div>}
        <Card noMargin>
            <CardHeader>
                <div className="min-w-0">
                    <h2 className={ui.sectionTitle}>{t('routing.title')}<span className="ml-2 text-sm font-normal text-ui-muted">{rules.length}</span></h2>
                    <p className="mt-1 text-xs leading-relaxed text-ui-muted">{t('routing.help')}</p>
                </div>
                <Button size="sm" variant="outline-secondary" onClick={add}><Plus size={15} />{t('routing.add')}</Button>
            </CardHeader>
            <CardBody className="grid gap-3">
                {order.length === 0 && <div className="grid gap-2 py-4 text-center">
                    <p className="font-medium text-ui-heading">{t('routing.emptyTitle')}</p>
                    <p className="mx-auto max-w-prose text-sm leading-relaxed text-ui-muted">{t('routing.emptyHelp')}</p>
                    <div><Button variant="primary" onClick={add}><Plus size={15} />{t('routing.add')}</Button></div>
                </div>}
                <ol className="grid gap-3" aria-label={t('routing.title')}>
                    {order.map((rule, index) => {
                        const runtime = status?.rules.find(r => r.id === rule.id);
                        const planned = preview?.rules.find(r => r.id === rule.id);
                        const problem = targetError(rule.target) ?? matchError(rule.match);
                        const showPreview = dirty && planned && rule.enabled;
                        return <li key={rule.id} className={cn('grid min-w-0 gap-3 rounded-ui-lg border border-ui-border bg-ui-surface p-3 sm:p-4', !rule.enabled && 'opacity-70', problem && 'border-ui-danger/60')}>
                            <div className="flex min-w-0 flex-wrap items-start gap-3">
                                <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ui-surface-muted text-xs font-medium text-ui-muted">{index + 1}</span>
                                <div className="grid min-w-0 flex-1 gap-1">
                                    <span className="flex min-w-0 flex-wrap items-center gap-2">
                                        <span className="truncate font-medium text-ui-heading">{name(rule)}</span>
                                        {rule.enabled ? <StateBadge state={dirty ? 'pending' : runtime?.state} /> : <StateBadge state="disabled" />}
                                    </span>
                                    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ui-fg">
                                        <span className="min-w-0 break-words">{describeMatch(t, rule.match)}</span>
                                        <ArrowRight size={14} className="shrink-0 text-ui-muted" aria-label={t('routing.to')} />
                                        <span className="min-w-0 break-words font-medium">{describeTarget(t, rule.target, interfaces)}</span>
                                    </span>
                                    <span className="text-xs text-ui-muted">
                                        {showPreview ? t('routing.previewRoutes', { v4: planned.ipv4Routes, v6: planned.ipv6Routes })
                                            : runtime && rule.enabled ? t('routing.routes', { v4: runtime.ipv4Routes, v6: runtime.ipv6Routes }) : null}
                                    </span>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                    <Switch checked={rule.enabled} ariaLabel={t('routing.enable', { name: name(rule) })}
                                        onCheckedChange={enabled => onChange(rules.map(r => r.id === rule.id ? { ...r, enabled } : r))} />
                                </div>
                            </div>
                            <RuleMessages rule={rule} runtime={dirty ? undefined : runtime} planned={planned} nameOf={nameOf} problem={problem} />
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline-secondary" aria-label={t('routing.moveUp', { name: name(rule) })} disabled={index === 0}
                                    onClick={() => onChange(moveRule(rules, rule.id, -1))}><ArrowUp size={15} /></Button>
                                <Button size="sm" variant="outline-secondary" aria-label={t('routing.moveDown', { name: name(rule) })} disabled={index === order.length - 1}
                                    onClick={() => onChange(moveRule(rules, rule.id, 1))}><ArrowDown size={15} /></Button>
                                <Button size="sm" variant="outline-secondary" aria-label={t('routing.edit', { name: name(rule) })} onClick={() => setEditing({ rule, isNew: false })}><Pencil size={15} /></Button>
                                <Button size="sm" variant="outline-danger" aria-label={t('routing.remove', { name: name(rule) })}
                                    onClick={async () => { if (await confirmAction(t('routing.removeConfirm', { name: name(rule) }))) onChange(rules.filter(r => r.id !== rule.id)); }}><Trash2 size={15} /></Button>
                            </div>
                        </li>;
                    })}
                </ol>
            </CardBody>
        </Card>
        {status?.required && status.required.length > 0 && <div className="grid gap-1 text-xs text-ui-muted">
            <p className="font-medium text-ui-fg">{t('routing.required')}</p>
            <p>{t('routing.requiredHelp')}</p>
            <ul>{status.required.map(r => <li key={r.inboundId} className="font-mono">{r.interface}: {r.prefixes.join(', ')}</li>)}</ul>
        </div>}
        {editing && <RouteRuleEditor rule={editing.rule} isNew={editing.isNew} capabilities={capabilities} interfaces={interfaces}
            preview={preview?.rules.find(r => r.id === editing.rule.id)} onSave={save} onClose={() => setEditing(null)} />}
    </div>;
}

function RuleMessages({ rule, runtime, planned, nameOf, problem }: {
    rule: RouteRule;
    runtime?: SystemNetworkStatus['rules'][number];
    planned?: SystemNetworkPreview['rules'][number];
    nameOf: (id: string) => string;
    problem?: string;
}) {
    const { t } = useTranslation('systemNetwork');
    const messages: { tone: 'danger' | 'warning' | 'muted'; text: string }[] = [];
    if (problem) messages.push({ tone: 'danger', text: t(`editor.error.${problem}`) });
    if (rule.enabled) {
        const overridden = (planned?.overriddenBy ?? runtime?.overriddenBy ?? []).map(nameOf).join(', ');
        if (planned?.shadowed ?? runtime?.shadowed) messages.push({ tone: 'warning', text: t('routing.shadowed', { names: overridden }) });
        else if (overridden) messages.push({ tone: 'muted', text: t('routing.overriddenBy', { names: overridden }) });
        if (planned?.error) messages.push({ tone: 'danger', text: planned.error });
        if (runtime?.error) messages.push({ tone: runtime.state === 'failed' ? 'danger' : 'warning', text: runtime.error });
        if (runtime?.conflicts?.length) messages.push({ tone: 'warning', text: t('routing.conflicts', { prefixes: runtime.conflicts.slice(0, 5).join(', ') }) });
        if (runtime?.stale) messages.push({ tone: 'warning', text: t('routing.stale') });
    }
    if (!messages.length) return null;
    const tone = { danger: 'text-ui-danger', warning: 'text-ui-warning', muted: 'text-ui-muted' };
    return <ul className="grid gap-1 text-xs leading-relaxed">
        {messages.map(m => <li key={m.text} className={cn('flex min-w-0 items-start gap-1.5', tone[m.tone])}>
            <CircleAlert size={14} aria-hidden="true" className="mt-0.5 shrink-0" /><span className="min-w-0 break-words">{m.text}</span>
        </li>)}
    </ul>;
}
