import { getSelectorStatus, measureNodeSpeed } from '@/api/selectors';
import { getNodeStatuses } from '@/api/node-observability';
import { getMonitoring } from '@/api/monitoring';
import { requestJSON } from '@/api/client';
import type { Go } from '@/api/generated-contracts';
import type { Selector } from '@/contract/node';
import { NodeSelect } from './node-select';
import { Button } from './v2/button';
import { Select, SettingInputVertical } from './v2/forms';
import SwitchComponent from './v2/switch';
import { SelectorCircuitEditor, CircuitEvidence } from './selector-circuit';
import { SpeedTestFields } from './speed-test-fields';
import { SelectorMonitoringEditor } from './selector-monitoring';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

type Policy = Go.node.SelectorPolicy;
const modes = ['manual', 'failover', 'lowest_latency', 'highest_throughput', 'balanced', 'weighted'];
const reasons = ['manual', 'manual_lock', 'no_healthy_candidate', 'fallback_selected', 'fallback_unknown', 'hold_or_cooldown', 'latency_hysteresis', 'score_hysteresis', 'throughput_hysteresis', 'sticky_failover', 'preferred_return_disabled', 'disabled', 'no_recent_remote_evidence', 'failure_threshold', 'no_successful_remote_evidence', 'recovering', 'insufficient_comparable_rtt', 'insufficient_comparable_jitter', 'rtt_limit', 'no_fresh_speed_measurement', 'throughput_limit', 'no_upload_measurement', 'no_fresh_upload_measurement', 'zero_weight', 'eligible', 'selected_node_unavailable', 'circuit_open', 'recovery_trial'];
const defaultWeights: Partial<Go.node.SelectorWeights> = { rtt: .5, download: .3, stability: .2, rttReferenceMs: 100, downloadReferenceMbps: 100, uploadReferenceMbps: 30, loadReference: 100 };
const emptyPolicy = (): Policy => ({ mode: 'manual', weights: {} });

export function SelectorPolicyEditor({ value, onChange }: { value: Selector; onChange: (value: Selector) => void }) {
    const { t } = useTranslation('routing');
    const policy = value.policy ?? emptyPolicy();
    const automatic = (policy.mode ?? 'manual') !== 'manual';
    const weighted = policy.mode === 'weighted';
    const update = (changes: Partial<Policy>) => onChange({ ...value, policy: { ...policy, ...changes } });
    const { data: monitoring } = useSWR(automatic ? 'node-monitoring' : null, getMonitoring, { revalidateOnFocus: false });
    const defaults = monitoring?.config;
    const probe = policy.probe ?? defaults?.probe;
    const candidates = policy.candidates ?? [];
    const hasWeights = (['rtt', 'download', 'upload', 'stability', 'jitter', 'load'] as const).some(key => (policy.weights[key] ?? 0) > 0);
    const shownWeights = hasWeights ? policy.weights : { ...defaultWeights, ...policy.weights };
    const numeric = (key: keyof Policy, fallback: number, step = 1) => <SettingInputVertical key={key} label={t(`auto.${key}`)} type="number" min={0} step={step}
        value={String(policy[key] ?? fallback)} onChange={text => { const n = Number(text); if (Number.isFinite(n) && n >= 0) update({ [key]: n }); }} />;
    return <section className="min-w-0 space-y-4 border-t border-ui-border/60 pt-4" aria-label={t('auto.configuration')}>
        <label className="block space-y-2 text-sm"><span>{t('auto.mode')}</span><Select ariaLabel={t('auto.mode')} value={policy.mode ?? 'manual'} items={modes.map(mode => ({ value: mode, label: t(`auto.modes.${mode}`) }))} onValueChange={mode => update({ mode, candidates: mode !== 'manual' && candidates.length === 0 && value.nodeId ? [{ nodeId: value.nodeId, enabled: true, priority: 0, weight: 1 }] : candidates })} /></label>
        {automatic && <>
            <div className="flex items-center justify-between gap-3 text-sm"><span>{t('auto.locked')}</span><SwitchComponent ariaLabel={t('auto.locked')} checked={policy.locked ?? false} onCheckedChange={locked => update({ locked })} /></div>
            <p className="text-xs text-ui-muted">{t('auto.lockHint')}</p>
            <div className="space-y-3">
                <h3 className="text-sm font-medium">{t('auto.candidates')}</h3>
                {candidates.map((candidate, index) => <div className="grid min-w-0 grid-cols-2 gap-3 rounded-ui-sm border border-ui-border p-3 sm:grid-cols-4" key={candidate.nodeId}>
                    <div className="col-span-2 flex min-w-0 items-center gap-2 sm:col-span-4"><SwitchComponent ariaLabel={`${t('auto.enabled')} ${candidate.nodeId}`} checked={candidate.enabled} onCheckedChange={enabled => update({ candidates: candidates.map((c, i) => i === index ? { ...c, enabled } : c) })} /><div className="min-w-0 flex-1"><NodeSelect label={t('auto.candidate')} value={candidate.nodeId} onChange={node => { if (!candidates.some(c => c.nodeId === node.id)) update({ candidates: candidates.map((c, i) => i === index ? { ...c, nodeId: node.id } : c), preferredId: policy.preferredId === candidate.nodeId ? node.id : policy.preferredId }); }} /></div></div>
                    {(['priority', 'weight'] as const).map(key => <SettingInputVertical key={key} label={t(`auto.${key}`)} type="number" min={0} max={key === 'weight' ? 1000000 : undefined} value={String(candidate[key])} onChange={text => { const n = Number(text); if (Number.isSafeInteger(n) && n >= 0) update({ candidates: candidates.map((c, i) => i === index ? { ...c, [key]: n } : c) }); }} />)}
                    {!weighted && <Button size="sm" variant="outline-secondary" className="h-auto min-h-9 min-w-0 whitespace-normal" aria-pressed={policy.preferredId === candidate.nodeId} onClick={() => update({ preferredId: policy.preferredId === candidate.nodeId ? undefined : candidate.nodeId })}>{policy.preferredId === candidate.nodeId ? t('auto.preferred') : t('auto.prefer')}</Button>}
                    <Button size="sm" variant="outline-danger" className="h-auto min-h-9 min-w-0 whitespace-normal" onClick={() => update({ candidates: candidates.filter((_, i) => i !== index), preferredId: policy.preferredId === candidate.nodeId ? undefined : policy.preferredId })}>{t('auto.remove')}</Button>
                </div>)}
                <NodeSelect label={t('auto.addCandidate')} value="" onChange={node => { if (!candidates.some(c => c.nodeId === node.id)) update({ candidates: [...candidates, { nodeId: node.id, enabled: true, priority: candidates.length, weight: 1 }] }); }} />
            </div>
            <label className="block space-y-2 text-sm"><span>{t('auto.fallback')}</span><Select ariaLabel={t('auto.fallback')} value={policy.fallback ?? 'reject'} items={['reject', 'selected', 'priority_unknown'].map(v => ({ value: v, label: t(`auto.fallbacks.${v}`) }))} onValueChange={fallback => update({ fallback })} /></label>
            {!weighted && <div className="flex items-center justify-between gap-3 text-sm"><span>{t('auto.returnToPreferred')}</span><SwitchComponent ariaLabel={t('auto.returnToPreferred')} checked={policy.returnToPreferred ?? false} onCheckedChange={returnToPreferred => update({ returnToPreferred })} /></div>}
            <p className="text-xs text-ui-muted">{t(weighted ? 'auto.weightedRecoveryHint' : policy.mode === 'failover' ? 'auto.failoverRecoveryHint' : 'auto.metricRecoveryHint')}</p>
            <details className="space-y-3"><summary className="cursor-pointer text-sm font-medium">{t('auto.thresholds')}</summary><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {numeric('minSamples', 3)}{numeric('maxAgeMs', 120000)}{numeric('maxRttMs', 5000)}{numeric('maxFailureRate', .5, .01)}
                {numeric('minImprovementMs', 10)}{numeric('minImprovementPercent', 10)}{numeric('minScoreImprovement', .05, .01)}
                {numeric('minHoldMs', 30000)}{numeric('cooldownMs', 15000)}{numeric('failureThreshold', probe?.failureThreshold || 3)}{numeric('recoveryThreshold', probe?.recoveryThreshold || 2)}
                {numeric('minDownloadMbps', 0, .1)}{numeric('minUploadMbps', 0, .1)}
            </div></details>
            <details className="space-y-3"><summary className="cursor-pointer text-sm font-medium">{t('auto.weights')}</summary><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(['rtt', 'download', 'upload', 'stability', 'jitter', 'load', 'rttReferenceMs', 'downloadReferenceMbps', 'uploadReferenceMbps', 'loadReference'] as const).map(key => <SettingInputVertical key={key} label={t(`auto.weightLabels.${key}`)} type="number" min={0} step={.1} value={String(shownWeights[key] ?? (key.endsWith('ReferenceMs') || key.endsWith('ReferenceMbps') || key === 'loadReference' ? defaultWeights[key] ?? 0 : 0))} onChange={text => { const n = Number(text); if (Number.isFinite(n) && n >= 0) update({ weights: { ...shownWeights, [key]: n } }); }} />)}
            </div></details>
            <SettingInputVertical label={t('auto.latencyTarget')} value={policy.latencyTarget ?? probe?.latencyTarget ?? 'https://www.gstatic.com/generate_204'} onChange={latencyTarget => update({ latencyTarget })} />
            <SettingInputVertical label={t('auto.udpLatencyTarget')} value={policy.udpLatencyTarget ?? `${probe?.dnsAddress ?? '223.5.5.5:53'}/${probe?.dnsDomain ?? 'www.google.com'}`} onChange={udpLatencyTarget => update({ udpLatencyTarget })} />
            <SpeedTestFields value={{ ...policy.speedTest, url: policy.speedTarget || policy.speedTest?.url || (policy.periodicSpeed ?? defaults?.speed)?.test.url || '' }} onChange={speedTest => update({ speedTarget: speedTest.url, speedTest })} />
            <details className="space-y-3"><summary className="cursor-pointer text-sm font-medium">{t('auto.uploadConfiguration')}</summary>
                <SpeedTestFields direction="upload" value={{ ...(policy.uploadTest ?? policy.periodicUpload?.test ?? defaults?.uploadSpeed?.test), url: policy.uploadTarget || policy.uploadTest?.url || (policy.periodicUpload ?? defaults?.uploadSpeed)?.test.url || '' }} onChange={uploadTest => update({ uploadTarget: uploadTest.url, uploadTest })} />
            </details>
            <p className="text-xs text-ui-muted">{t('auto.measurementHint')}</p>
            <p className="text-xs text-ui-muted">{t('auto.budgetHint')}</p>
            <SelectorCircuitEditor value={policy.circuit} recovery={policy.recoveryThreshold || probe?.recoveryThreshold || 2} cooldown={probe?.cooldownMs || 30000} onChange={circuit => update({ circuit })} />
            <SelectorMonitoringEditor value={policy} onChange={policy => onChange({ ...value, policy })} />
        </>}
    </section>;
}

export function SelectorLiveStatus({ value }: { value: Selector }) {
    const { t } = useTranslation('routing');
    const [network, setNetwork] = useState<'tcp' | 'udp'>('tcp');
    const [pending, setPending] = useState('');
    const [error, setError] = useState('');
    const { data, error: loadError, mutate } = useSWR(value.id ? ['selector-status', value.id] : null, () => getSelectorStatus(value.id), { refreshInterval: 2500, revalidateOnFocus: false });
    const { data: monitoring } = useSWR(value.policy && value.policy.mode !== 'manual' ? 'node-monitoring' : null, getMonitoring, { revalidateOnFocus: false });
    const savedProbe = value.policy?.probe ?? monitoring?.config?.probe;
    const speedTarget = value.policy?.speedTarget || value.policy?.speedTest?.url || (value.policy?.periodicSpeed ?? monitoring?.config?.speed)?.test.url || '';
    const uploadTarget = value.policy?.uploadTarget || value.policy?.uploadTest?.url || (value.policy?.periodicUpload ?? monitoring?.config?.uploadSpeed)?.test.url || '';
    const uploadTest = value.policy?.uploadTest ?? value.policy?.periodicUpload?.test ?? monitoring?.config?.uploadSpeed?.test;
    const describe = (reason: string) => reasons.includes(reason) ? t(`auto.reasons.${reason}`) : modes.includes(reason) ? t(`auto.modes.${reason}`) : reason;
    const test = async (nodeId: string, kind: 'probe' | 'download' | 'upload') => {
        setPending(nodeId); setError('');
        try {
            const p = value.policy;
            if (kind === 'upload') await measureNodeSpeed(nodeId, { ...uploadTest, direction: 'upload', url: uploadTarget });
            else if (kind === 'download') await measureNodeSpeed(nodeId, { ...(p?.speedTest ?? p?.periodicSpeed?.test ?? monitoring?.config?.speed?.test), url: speedTarget });
            else if (network === 'tcp') await requestJSON('POST', `/api/v2/nodes/${encodeURIComponent(nodeId)}/latency`, { type: 'https', url: p?.latencyTarget ?? savedProbe?.latencyTarget ?? 'https://www.gstatic.com/generate_204' });
            else {
                const target = (p?.udpLatencyTarget ?? `${savedProbe?.dnsAddress ?? '223.5.5.5:53'}/${savedProbe?.dnsDomain ?? 'www.google.com'}`).split('/');
                await requestJSON('POST', `/api/v2/nodes/${encodeURIComponent(nodeId)}/latency`, { type: 'dns', host: target[0], targetDomain: target[1] });
            }
            await mutate();
        } catch (e) { setError(e instanceof Error ? e.message : String((e as { msg?: string }).msg ?? e)); }
        finally { setPending(''); }
    };
    if (!value.id) return null;
    return <section className="min-w-0 space-y-3 border-t border-ui-border/60 pt-4" aria-label={t('auto.liveStatus')}>
        <h3 className="text-sm font-medium">{t('auto.liveStatus')}</h3>
        <div className="flex gap-2">{(['tcp', 'udp'] as const).map(n => <Button key={n} size="sm" aria-pressed={network === n} onClick={() => setNetwork(n)}>{n.toUpperCase()}</Button>)}</div>
        {(error || loadError) && <p role="alert" className="text-sm text-ui-danger">{error || t('loadFailed')}</p>}
        {data && <>
            <p className="break-words text-sm">{t('auto.current')}: {data[network].nodeId || t('auto.none')} · {describe(data[network].reason)}</p>
            <p className="text-xs text-ui-muted">{t('auto.counters', { switches: data.switches, suppressed: data.suppressed })}</p>
            <div className="space-y-2">{data[network].candidates.map(c => <details key={c.nodeId} className="rounded-ui-sm border border-ui-border p-3 text-sm">
                <summary className="cursor-pointer break-words">{c.nodeId} · {t(`auto.states.${c.state}`)} · {describe(c.reason)}</summary>
                <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {[[t('auto.rtt'), c.samples ? `${c.rttMs.toFixed(1)} ms (${c.samples})` : t('auto.unmeasured')], [t('auto.weightLabels.jitter'), c.samples >= 2 && typeof c.jitterMs === 'number' ? `${c.jitterMs.toFixed(1)} ms` : t('auto.unmeasured')], [t('auto.measuredDownload'), c.downloadMbps ? `${c.downloadMbps.toFixed(2)} Mbps` : t('auto.unmeasured')], [t('auto.measuredUpload'), c.uploadMbps ? `${c.uploadMbps.toFixed(2)} Mbps` : t('auto.unmeasured')], [t('auto.failureRate'), `${(c.failureRate * 100).toFixed(1)}%`], [t('auto.timeoutRate'), c.healthSamples ? `${((c.timeoutRate ?? 0) * 100).toFixed(1)}% (${c.healthSamples})` : t('auto.unmeasured')], [t('auto.active'), String(c.activeConnections)], [t('auto.score'), c.components ? c.score.toFixed(3) : '—']].map(([label, content]) => <div key={label}><dt className="text-xs text-ui-muted">{label}</dt><dd>{content}</dd></div>)}
                </dl>
                <p className="mt-2 text-xs text-ui-muted">{t('auto.timeoutRateHint')}</p>
                {(c.downloadAt || c.uploadAt) && <p className="mt-2 break-words text-xs text-ui-muted">{c.downloadAt ? `${t('auto.measuredDownload')}: ${new Date(c.downloadAt).toLocaleString()} (${c.downloadSamples ?? 0})` : ''}{c.downloadAt && c.uploadAt ? ' · ' : ''}{c.uploadAt ? `${t('auto.measuredUpload')}: ${new Date(c.uploadAt).toLocaleString()} (${c.uploadSamples ?? 0})` : ''}</p>}
                {c.components && <ul className="mt-2 space-y-1 text-xs text-ui-muted">{Object.entries(c.components).map(([key, component]) => <li key={key}>{t(`auto.weightLabels.${key}`)}: {component.toFixed(3)}</li>)}</ul>}
                <CircuitEvidence value={c} />
                <NodeMeasurementHistory nodeId={c.nodeId} />
                <div className="mt-3 flex flex-wrap gap-2"><Button permission="nodes:write" size="sm" disabled={!!pending} onClick={() => void test(c.nodeId, 'probe')}>{t('auto.probeNow')}</Button><Button permission="nodes:write" size="sm" disabled={!!pending || !speedTarget} onClick={() => void test(c.nodeId, 'download')}>{t('auto.measureNow')}</Button><Button permission="nodes:write" size="sm" disabled={!!pending || !uploadTarget || !uploadTest?.allowUpload} onClick={() => void test(c.nodeId, 'upload')}>{t('auto.measureUploadNow')}</Button></div>
            </details>)}</div>
            <details><summary className="cursor-pointer text-sm">{t('auto.history')}</summary><ol className="mt-2 space-y-2 text-xs text-ui-muted">{[...data.events].reverse().map((event, index) => <li key={`${event.at}:${event.network}:${index}`} className="break-words">{new Date(event.at).toLocaleString()} · {event.network.toUpperCase()} · {event.from || '—'} → {event.to || '—'} · {describe(event.reason)}</li>)}</ol></details>
        </>}
    </section>;
}

function NodeMeasurementHistory({ nodeId }: { nodeId: string }) {
    const { t } = useTranslation('routing');
    const [open, setOpen] = useState(false);
    return <details className="mt-3 text-xs" onToggle={e => setOpen(e.currentTarget.open)}><summary className="cursor-pointer">{t('monitor.measurementHistory')}</summary>{open && <MeasurementHistoryData nodeId={nodeId} />}</details>;
}
function MeasurementHistoryData({ nodeId }: { nodeId: string }) {
    const { t } = useTranslation('routing');
    const { data, error } = useSWR(['node-measurement-history', nodeId], () => getNodeStatuses([nodeId]), { revalidateOnFocus: false, refreshInterval: 5000 });
    if (error) return <p role="alert" className="mt-2 text-ui-danger">{t('loadFailed')}</p>;
    if (!data) return <p role="status" className="mt-2 text-ui-muted">{t('loading')}</p>;
    const samples = data[nodeId]?.throughputHistory ?? [];
    return <ol className="mt-2 space-y-2 text-ui-muted">{samples.length === 0 ? <li>{t('auto.unmeasured')}</li> : [...samples].reverse().map((sample, index) => <li className="break-words" key={`${sample.at}:${index}`}>
        {new Date(sample.at).toLocaleString()} · {t(sample.direction === 'upload' ? 'auto.measuredUpload' : 'auto.measuredDownload')} · {sample.ok ? `${(sample.direction === 'upload' ? sample.uploadMbps ?? 0 : sample.downloadMbps).toFixed(2)} Mbps` : t('loadFailed')} · {sample.bytes} B / {sample.durationMs} ms
        <p>{sample.target}</p>
    </li>)}</ol>;
}
