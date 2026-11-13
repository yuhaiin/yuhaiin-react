import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { SettingInputVertical, SettingSelectVertical, SwitchCard } from '@/component/v2/forms';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import Switch from '@/component/v2/switch';
import { cn, ui } from '@/component/v2/styles';
import { forwardRuleError, newID, type ForwardRule, type SystemNetworkCapabilities, type SystemNetworkConfig, type SystemNetworkInterfaces, type SystemNetworkStatus } from '@/contract/system-network';
import { ArrowRight, CircleAlert, Info, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CidrListEditor } from './match-editor';
import { describeTarget, StateBadge } from './shared';
import { TargetPicker } from './target-picker';

type Forwarding = SystemNetworkConfig['forwarding'];

export function ForwardingTab({ value, onChange, capabilities, interfaces, status, dirty }: {
    value: Forwarding;
    onChange: (value: Forwarding) => void;
    capabilities: SystemNetworkCapabilities;
    interfaces?: SystemNetworkInterfaces;
    status?: SystemNetworkStatus;
    dirty: boolean;
}) {
    const { t } = useTranslation('systemNetwork');
    const [editing, setEditing] = useState<{ rule: ForwardRule; isNew: boolean } | null>(null);
    if (!capabilities.ipv4Forwarding && !capabilities.ipv6Forwarding)
        return <p role="note" className={cn(ui.softPanel, 'p-4 text-sm leading-relaxed text-ui-fg')}>{t('forwarding.unsupported')}</p>;
    const add = () => setEditing({ isNew: true, rule: {
        id: newID('forward'), name: '', enabled: true, ingressInterface: '', sourceCidrs: [],
        egress: capabilities.forwardTargets.includes('tun_inbound')
            ? { type: 'tun_inbound', inboundId: interfaces?.tunInbounds.length === 1 ? interfaces.tunInbounds[0].id : undefined }
            : { type: capabilities.forwardTargets[0] ?? 'routes' },
    } });
    const save = (rule: ForwardRule) => {
        onChange({ ...value, rules: value.rules.some(r => r.id === rule.id) ? value.rules.map(r => r.id === rule.id ? rule : r) : [...value.rules, rule] });
        setEditing(null);
    };
    const runtime = (id: string) => dirty ? undefined : status?.forwarding.rules.find(r => r.id === id);
    return <div className="grid min-w-0 gap-5">
        {['darwin', 'windows'].includes(capabilities.platform) && <p className="flex gap-2 text-xs leading-relaxed text-ui-muted">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{t(`forwarding.platform.${capabilities.platform}`)}</p>}
        <section className={cn(ui.softPanel, 'grid gap-2 p-4')}>
            <h2 className={ui.sectionTitle}>{t('forwarding.introTitle')}</h2>
            <p className="text-sm leading-relaxed text-ui-fg">{t('forwarding.introHelp')}</p>
            <ol className="ml-5 list-decimal space-y-1 text-sm leading-relaxed text-ui-fg">
                <li>{t('forwarding.step1')}</li><li>{t('forwarding.step2')}</li><li>{t('forwarding.step3')}</li>
            </ol>
        </section>
        <Card noMargin>
            <CardBody className="grid gap-3">
                {capabilities.ipv4Forwarding && <SwitchCard label={t('forwarding.ipv4')} description={t('forwarding.ipv4Help')} checked={value.ipv4}
                    onCheckedChange={ipv4 => onChange({ ...value, ipv4 })} />}
                {capabilities.ipv6Forwarding && <SwitchCard label={t('forwarding.ipv6')} description={t('forwarding.ipv6Help')} checked={value.ipv6}
                    onCheckedChange={ipv6 => onChange({ ...value, ipv6 })} />}
                {!dirty && status && (value.ipv4 || value.ipv6) && <div className="flex flex-wrap items-center gap-2 text-sm">
                    <StateBadge state={status.forwarding.state} />{status.forwarding.error && <span className="text-ui-danger">{status.forwarding.error}</span>}
                </div>}
            </CardBody>
        </Card>
        <Card noMargin>
            <CardHeader>
                <h2 className={ui.sectionTitle}>{t('forwarding.rulesTitle')}<span className="ml-2 text-sm font-normal text-ui-muted">{value.rules.length}</span></h2>
                <Button size="sm" variant="outline-secondary" onClick={add}><Plus size={15} />{t('forwarding.add')}</Button>
            </CardHeader>
            <CardBody className="grid gap-3">
                {!value.rules.length && <p className="text-sm leading-relaxed text-ui-muted">{t('forwarding.empty')}</p>}
                {value.rules.length > 0 && !value.ipv4 && !value.ipv6 && <p className="text-xs text-ui-warning">{t('forwarding.offNote')}</p>}
                <ul className="grid gap-3">
                    {value.rules.map(rule => {
                        const r = runtime(rule.id);
                        const problem = forwardRuleError(rule);
                        const name = rule.name || t('routing.unnamed');
                        return <li key={rule.id} className={cn('grid min-w-0 gap-2 rounded-ui-lg border border-ui-border p-3 sm:p-4', problem && 'border-ui-danger/60', !rule.enabled && 'opacity-70')}>
                            <div className="flex min-w-0 flex-wrap items-start gap-3">
                                <div className="grid min-w-0 flex-1 gap-1">
                                    <span className="flex flex-wrap items-center gap-2"><span className="font-medium text-ui-heading">{name}</span>
                                        <StateBadge state={rule.enabled ? (dirty ? 'pending' : r?.state) : 'disabled'} />
                                        {rule.masquerade && <span className={ui.chip}>NAT</span>}</span>
                                    <span className="flex min-w-0 flex-wrap items-center gap-x-2 text-sm text-ui-fg">
                                        <span className="min-w-0 break-words font-mono text-xs">{rule.sourceCidrs.join(', ') || t('forwarding.allDevices')}</span>
                                        <span className="text-ui-muted">@ {rule.ingressInterface || '—'}</span>
                                        <ArrowRight size={14} className="shrink-0 text-ui-muted" aria-hidden="true" />
                                        <span className="font-medium">{describeTarget(t, rule.egress, interfaces)}</span>
                                    </span>
                                </div>
                                <Switch checked={rule.enabled} ariaLabel={t('routing.enable', { name })}
                                    onCheckedChange={enabled => onChange({ ...value, rules: value.rules.map(x => x.id === rule.id ? { ...x, enabled } : x) })} />
                            </div>
                            {(problem || r?.error) && <p className="flex items-start gap-1.5 text-xs text-ui-danger"><CircleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                                {problem ? t(`forwarding.error.${problem}`) : r?.error}</p>}
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline-secondary" aria-label={t('routing.edit', { name })} onClick={() => setEditing({ rule, isNew: false })}><Pencil size={15} /></Button>
                                <Button size="sm" variant="outline-danger" aria-label={t('routing.remove', { name })}
                                    onClick={async () => { if (await confirmAction(t('routing.removeConfirm', { name }))) onChange({ ...value, rules: value.rules.filter(x => x.id !== rule.id) }); }}><Trash2 size={15} /></Button>
                            </div>
                        </li>;
                    })}
                </ul>
            </CardBody>
        </Card>
        {editing && <ForwardRuleEditor rule={editing.rule} isNew={editing.isNew} capabilities={capabilities} interfaces={interfaces} onSave={save} onClose={() => setEditing(null)} />}
    </div>;
}

function ForwardRuleEditor({ rule, isNew, capabilities, interfaces, onSave, onClose }: {
    rule: ForwardRule; isNew: boolean; capabilities: SystemNetworkCapabilities; interfaces?: SystemNetworkInterfaces;
    onSave: (rule: ForwardRule) => void; onClose: () => void;
}) {
    const { t } = useTranslation('systemNetwork');
    const [draft, setDraft] = useState(rule);
    const problem = forwardRuleError(draft);
    const ingress = (interfaces?.items ?? []).filter(i => i.type !== 'loopback' && i.ownership !== 'yuhaiin');
    return <Modal open onOpenChange={open => !open && onClose()}>
        <ModalContent width={720}>
            <ModalHeader closeButton><ModalTitle>{t(isNew ? 'forwarding.titleNew' : 'forwarding.titleEdit')}</ModalTitle></ModalHeader>
            <ModalBody className="@container grid min-w-0 gap-5">
                <SettingInputVertical label={t('editor.name')} value={draft.name} placeholder={t('editor.namePlaceholder')} onChange={name => setDraft({ ...draft, name })} />
                <div className="grid gap-1">
                    <SettingSelectVertical label={t('forwarding.ingress')} value={draft.ingressInterface} emptyChoose emptyChooseName={t('forwarding.ingress')}
                        values={ingress.map(i => [`${i.name}${i.addresses[0] ? ' · ' + i.addresses[0] : ''}`, i.name] as [string, string])}
                        onChange={ingressInterface => setDraft({ ...draft, ingressInterface })} />
                    <p className="text-xs text-ui-muted">{t('forwarding.ingressHelp')}</p>
                </div>
                {capabilities.forwardSourceFilter
                    ? <CidrListEditor id="sources" label={t('forwarding.sources')} help={t('forwarding.sourcesHelp')} placeholder={'192.168.20.0/24\n192.168.20.50'}
                        value={draft.sourceCidrs} onChange={sourceCidrs => setDraft({ ...draft, sourceCidrs })} />
                    : <p className="text-xs leading-relaxed text-ui-muted">{t('forwarding.noSourceFilter')}</p>}
                <section className="grid gap-2">
                    <h3 className={ui.cardTitle}>{t('forwarding.egress')}</h3>
                    <TargetPicker value={draft.egress} types={capabilities.forwardTargets} interfaces={interfaces} tproxy
                        onChange={egress => setDraft({ ...draft, egress, masquerade: ['tproxy', 'routes'].includes(egress.type) ? false : draft.masquerade })} />
                </section>
                {!['tproxy', 'routes'].includes(draft.egress.type) && capabilities.nat && <SwitchCard label={t('forwarding.masquerade')} description={t('forwarding.masqueradeHelp')}
                    checked={draft.masquerade ?? false} onCheckedChange={masquerade => setDraft({ ...draft, masquerade })} />}
                <details>
                    <summary className="cursor-pointer text-sm text-ui-muted">{t('editor.advanced')}</summary>
                    <div className="mt-3">
                        <CidrListEditor id="destinations" label={t('forwarding.destinations')} help={t('forwarding.destinationsHelp')} placeholder={'198.51.100.0/24'}
                            value={draft.destinationCidrs} onChange={destinationCidrs => setDraft({ ...draft, destinationCidrs })} />
                    </div>
                </details>
                {problem && <p role="alert" className="text-sm text-ui-danger">{t(`forwarding.error.${problem}`)}</p>}
            </ModalBody>
            <ModalFooter className="flex flex-wrap justify-end gap-2">
                <Button variant="outline-secondary" onClick={onClose}>{t('editor.cancel')}</Button>
                <Button variant="primary" disabled={Boolean(problem)} onClick={() => onSave(draft)}>{t('editor.apply')}</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>;
}
