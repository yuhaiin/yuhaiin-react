import { getMonitoring, saveMonitoring } from '@/api/monitoring';
import type { Go } from '@/api/generated-contracts';
import { Button } from './v2/button';
import { Select, SettingInputVertical } from './v2/forms';
import SwitchComponent from './v2/switch';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from './v2/modal';
import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

type Probe = Go.node.ProbeSchedule;
type Speed = Go.node.SpeedSchedule;
type Policy = Go.node.SelectorPolicy;
const probeDefaults = { intervalMs: 60000, timeoutMs: 5000, concurrency: 4, failureThreshold: 3, recoveryThreshold: 2, cooldownMs: 30000, jitter: 0, maxProbeBandwidth: 65536 };
const emptyMonitoring = (): Go.node.MonitoringConfig => ({ revision: 0, probe: { enabled: false }, speed: { enabled: false, test: { url: '' } } });

function Toggle({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
    return <div className="flex items-center justify-between gap-3 text-sm"><span>{label}</span><SwitchComponent disabled={disabled} ariaLabel={label} checked={checked} onCheckedChange={onChange} /></div>;
}
export function ProbeScheduleFields({ value, onChange, policyTargets = false }: { value: Probe; onChange: (value: Probe) => void; policyTargets?: boolean }) {
    const { t } = useTranslation('routing');
    const kinds = value.kinds ?? ['https', 'dns'];
    return <div className="space-y-4">
        <Toggle label={t('monitor.probeEnabled')} checked={value.enabled} onChange={enabled => onChange({ ...value, enabled })} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{(Object.keys(probeDefaults) as (keyof typeof probeDefaults)[]).map(key => <SettingInputVertical key={key} type="number" min={0} step={key === 'jitter' ? .05 : 1} label={t(`monitor.${key}`)} value={String(value[key] ?? probeDefaults[key])} onChange={text => { const n = Number(text); if (Number.isFinite(n) && n >= 0) onChange({ ...value, [key]: n }); }} />)}</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{['tcp_connect', 'https', 'dns', 'stun', 'native'].map(kind => <Toggle key={kind} label={t(`monitor.kinds.${kind}`)} checked={kinds.includes(kind)} disabled={kinds.length === 1 && kinds.includes(kind)} onChange={enabled => onChange({ ...value, kinds: enabled ? [...kinds, kind] : kinds.filter(k => k !== kind) })} />)}</div>
        {(['latencyTarget', 'tcpAddress', 'dnsAddress', 'dnsDomain', 'stunAddress'] as const).filter(key => !policyTargets || key === 'tcpAddress' || key === 'stunAddress').map(key => <SettingInputVertical key={key} label={t(`monitor.${key}`)} value={value[key] ?? { latencyTarget: 'https://www.gstatic.com/generate_204', tcpAddress: '1.1.1.1:443', dnsAddress: '223.5.5.5:53', dnsDomain: 'www.google.com', stunAddress: 'stun.nextcloud.com:3478' }[key]} onChange={text => onChange({ ...value, [key]: text })} />)}
        <Select ariaLabel={t('monitor.networkCostPolicy')} value={value.networkCostPolicy ?? 'conservative'} items={['conservative', 'cached_only', 'allow_expensive'].map(value => ({ value, label: t(`monitor.costPolicies.${value}`) }))} onValueChange={networkCostPolicy => onChange({ ...value, networkCostPolicy })} />
        <Toggle label={t('monitor.allowMobile')} checked={value.allowMobile ?? false} onChange={allowMobile => onChange({ ...value, allowMobile })} />
        <p className="text-xs text-ui-muted">{t('monitor.probeHint')}</p>
    </div>;
}
export function SpeedScheduleFields({ value, onChange, showTarget = false }: { value: Speed; onChange: (value: Speed) => void; showTarget?: boolean }) {
    const { t } = useTranslation('routing');
    return <div className="space-y-4">
        <Toggle label={t('monitor.speedEnabled')} checked={value.enabled} onChange={enabled => onChange({ ...value, enabled })} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SettingInputVertical type="number" min={300000} label={t('monitor.speedIntervalMs')} value={String(value.intervalMs ?? 3600000)} onChange={text => { const n = Number(text); if (Number.isSafeInteger(n) && n >= 0) onChange({ ...value, intervalMs: n }); }} />
            <SettingInputVertical type="number" min={1} max={2} label={t('monitor.speedConcurrency')} value={String(value.concurrency ?? 1)} onChange={text => { const n = Number(text); if (Number.isSafeInteger(n) && n > 0) onChange({ ...value, concurrency: n }); }} />
        </div>
        {showTarget && <>
            <SettingInputVertical label={t('auto.speedTarget')} value={value.test.url} onChange={url => onChange({ ...value, test: { ...value.test, url } })} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{(['maxBytes', 'durationMs', 'timeoutMs', 'dailyBudgetBytes'] as const).map(key => <SettingInputVertical key={key} type="number" min={0} label={t(`auto.${key}`)} value={String(value.test[key] ?? { maxBytes: 4194304, durationMs: 5000, timeoutMs: 10000, dailyBudgetBytes: 67108864 }[key])} onChange={text => { const n = Number(text); if (Number.isSafeInteger(n) && n >= 0) onChange({ ...value, test: { ...value.test, [key]: n } }); }} />)}</div>
        </>}
        <Toggle label={t('monitor.allowMobile')} checked={value.allowMobile ?? false} onChange={allowMobile => onChange({ ...value, allowMobile })} />
        <Toggle label={t('monitor.allowMetered')} checked={value.allowMetered ?? false} onChange={allowMetered => onChange({ ...value, allowMetered })} />
        <p className="text-xs text-ui-muted">{t('monitor.speedHint')}</p>
        <p className="text-xs text-ui-muted" data-testid="measurement-budget">{t('auto.budgetHint')}</p>
    </div>;
}
export function SelectorMonitoringEditor({ value, onChange }: { value: Policy; onChange: (value: Policy) => void }) {
    const { t } = useTranslation('routing');
    return <details className="space-y-4"><summary className="cursor-pointer text-sm font-medium">{t('monitor.selectorSchedule')}</summary>
        <Toggle label={t('monitor.overrideProbe')} checked={!!value.probe} onChange={enabled => onChange({ ...value, probe: enabled ? { enabled: false } : undefined })} />
        {value.probe ? <ProbeScheduleFields value={value.probe} policyTargets onChange={probe => onChange({ ...value, probe })} /> : <p className="text-xs text-ui-muted">{t('monitor.inherited')}</p>}
        <Toggle label={t('monitor.overrideSpeed')} checked={!!value.periodicSpeed} onChange={enabled => onChange({ ...value, periodicSpeed: enabled ? { enabled: false, test: { url: value.speedTarget ?? '' } } : undefined })} />
        {value.periodicSpeed ? <SpeedScheduleFields value={value.periodicSpeed} onChange={periodicSpeed => onChange({ ...value, periodicSpeed })} /> : <p className="text-xs text-ui-muted">{t('monitor.inherited')}</p>}
    </details>;
}
export function MonitoringSettings() {
    const { t } = useTranslation('routing');
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');
    const { data, error: loadError, mutate } = useSWR(open ? 'node-monitoring' : null, getMonitoring, { revalidateOnFocus: false, refreshInterval: 5000 });
    const { value, setValue, dirty, commit } = useEditorDraft(open ? 'monitoring' : null, data?.config, emptyMonitoring);
    const { pending, run } = useAsyncAction(e => setError(e instanceof Error ? e.message : String((e as { msg?: string }).msg ?? e)));
    const close = useCloseGuard(dirty, pending, () => setOpen(false));
    return <>
        <Button variant="outline-secondary" onClick={() => { setError(''); setOpen(true); }}>{t('monitor.defaults')}</Button>
        <Modal open={open} onOpenChange={next => !next && close()}><ModalContent width={720}>
            <ModalHeader closeButton><ModalTitle>{t('monitor.defaults')}</ModalTitle></ModalHeader>
            <ModalBody>
                {(error || loadError) && <p role="alert" className="text-sm text-ui-danger">{error || t('loadFailed')}</p>}
                {!data ? <p role="status">{t('loading')}</p> : <>
                    <p className="mb-4 text-sm text-ui-muted">{t('monitor.runtime', { jobs: data.jobs, running: data.running, workers: data.workers, failed: data.failed, skipped: data.skipped })}</p>
                    {Number.isInteger(data.activeMeasurements) && Number.isInteger(data.measurementLimit) && <p className="mb-4 text-xs text-ui-muted" data-testid="measurement-slots">{t('monitor.measurementSlots', { active: data.activeMeasurements, limit: data.measurementLimit })}</p>}
                    <p className="mb-4 text-xs text-ui-muted">{t('monitor.network', { platform: data.platform, online: String(data.network.online), metered: String(data.network.metered), foreground: String(data.network.foreground) })}</p>
                    {['waiting', 'enforced', 'standalone'].includes(data.policyState) && <p role={data.policyState === 'waiting' ? 'alert' : undefined} className={`mb-4 text-xs ${data.policyState === 'waiting' ? 'text-ui-warning' : 'text-ui-muted'}`}>{t(`monitor.policyStates.${data.policyState}`)}</p>}
                    <fieldset disabled={pending} className="space-y-5 [--field-margin:0px]">
                        <ProbeScheduleFields value={value.probe} onChange={probe => setValue({ ...value, probe })} />
                        <details className="space-y-4"><summary className="cursor-pointer text-sm font-medium">{t('monitor.periodicSpeed')}</summary><SpeedScheduleFields value={value.speed} showTarget onChange={speed => setValue({ ...value, speed })} /></details>
                    </fieldset>
                </>}
            </ModalBody>
            <ModalFooter><Button disabled={pending} onClick={close}>{t('cancel')}</Button><Button permission="nodes:write" loading={pending} disabled={!data || pending || !dirty} onClick={() => { setError(''); void run(async () => { const status = await saveMonitoring(value); commit(status.config); await mutate(status, false); }); }}>{t('save')}</Button></ModalFooter>
        </ModalContent></Modal>
    </>;
}
