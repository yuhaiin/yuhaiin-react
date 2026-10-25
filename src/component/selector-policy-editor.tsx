import { getSelectorStatus, measureNodeSpeed } from '@/api/selectors';
import { requestJSON } from '@/api/client';
import type { Go } from '@/api/generated-contracts';
import type { Selector } from '@/contract/node';
import { NodeSelect } from './node-select';
import { Button } from './v2/button';
import { Select, SettingInputVertical } from './v2/forms';
import SwitchComponent from './v2/switch';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

type Policy = Go.node.SelectorPolicy;
const modes = ['manual', 'failover', 'lowest_latency', 'highest_throughput', 'balanced', 'weighted'];
const reasons = ['manual', 'manual_lock', 'no_healthy_candidate', 'fallback_selected', 'fallback_unknown', 'hold_or_cooldown', 'latency_hysteresis', 'score_hysteresis', 'throughput_hysteresis', 'sticky_failover', 'disabled', 'no_recent_remote_evidence', 'failure_threshold', 'no_successful_remote_evidence', 'recovering', 'insufficient_comparable_rtt', 'rtt_limit', 'no_fresh_speed_measurement', 'throughput_limit', 'no_upload_measurement', 'zero_weight', 'eligible', 'selected_node_unavailable'];
const defaultWeights: Partial<Go.node.SelectorWeights> = { rtt: .5, download: .3, stability: .2, rttReferenceMs: 100, downloadReferenceMbps: 100, uploadReferenceMbps: 30, loadReference: 100 };
const emptyPolicy = (): Policy => ({ mode: 'manual', weights: {} });

export function SelectorPolicyEditor({ value, onChange }: { value: Selector; onChange: (value: Selector) => void }) {
    const { t } = useTranslation('routing');
    const policy = value.policy ?? emptyPolicy();
    const automatic = (policy.mode ?? 'manual') !== 'manual';
    const update = (changes: Partial<Policy>) => onChange({ ...value, policy: { ...policy, ...changes } });
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
                    <div className="col-span-2 flex min-w-0 items-center gap-2 sm:col-span-4"><SwitchComponent ariaLabel={`${t('auto.enabled')} ${candidate.nodeId}`} checked={candidate.enabled} onCheckedChange={enabled => update({ candidates: candidates.map((c, i) => i === index ? { ...c, enabled } : c) })} /><div className="min-w-0 flex-1"><NodeSelect label={t('auto.candidate')} value={candidate.nodeId} onChange={node => { if (!candidates.some(c => c.nodeId === node.id)) update({ candidates: candidates.map((c, i) => i === index ? { ...c, nodeId: node.id } : c) }); }} /></div></div>
                    {(['priority', 'weight'] as const).map(key => <SettingInputVertical key={key} label={t(`auto.${key}`)} type="number" min={0} max={key === 'weight' ? 1000000 : undefined} value={String(candidate[key])} onChange={text => { const n = Number(text); if (Number.isSafeInteger(n) && n >= 0) update({ candidates: candidates.map((c, i) => i === index ? { ...c, [key]: n } : c) }); }} />)}
                    <Button size="sm" variant="outline-secondary" onClick={() => update({ preferredId: candidate.nodeId })}>{policy.preferredId === candidate.nodeId ? t('auto.preferred') : t('auto.prefer')}</Button>
                    <Button size="sm" variant="outline-danger" onClick={() => update({ candidates: candidates.filter((_, i) => i !== index), preferredId: policy.preferredId === candidate.nodeId ? undefined : policy.preferredId })}>{t('auto.remove')}</Button>
                </div>)}
                <NodeSelect label={t('auto.addCandidate')} value="" onChange={node => { if (!candidates.some(c => c.nodeId === node.id)) update({ candidates: [...candidates, { nodeId: node.id, enabled: true, priority: candidates.length, weight: 1 }] }); }} />
            </div>
            <label className="block space-y-2 text-sm"><span>{t('auto.fallback')}</span><Select ariaLabel={t('auto.fallback')} value={policy.fallback ?? 'reject'} items={['reject', 'selected', 'priority_unknown'].map(v => ({ value: v, label: t(`auto.fallbacks.${v}`) }))} onValueChange={fallback => update({ fallback })} /></label>
            <div className="flex items-center justify-between gap-3 text-sm"><span>{t('auto.returnToPreferred')}</span><SwitchComponent ariaLabel={t('auto.returnToPreferred')} checked={policy.returnToPreferred ?? false} onCheckedChange={returnToPreferred => update({ returnToPreferred })} /></div>
            <details className="space-y-3"><summary className="cursor-pointer text-sm font-medium">{t('auto.thresholds')}</summary><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {numeric('minSamples', 3)}{numeric('maxAgeMs', 120000)}{numeric('maxRttMs', 5000)}{numeric('maxFailureRate', .5, .01)}
                {numeric('minImprovementMs', 10)}{numeric('minImprovementPercent', 10)}{numeric('minScoreImprovement', .05, .01)}
                {numeric('minHoldMs', 30000)}{numeric('cooldownMs', 15000)}{numeric('failureThreshold', 3)}{numeric('recoveryThreshold', 2)}
                {numeric('minDownloadMbps', 0, .1)}{numeric('minUploadMbps', 0, .1)}
            </div></details>
            <details className="space-y-3"><summary className="cursor-pointer text-sm font-medium">{t('auto.weights')}</summary><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(['rtt', 'download', 'upload', 'stability', 'jitter', 'load', 'rttReferenceMs', 'downloadReferenceMbps', 'uploadReferenceMbps', 'loadReference'] as const).map(key => <SettingInputVertical key={key} label={t(`auto.weightLabels.${key}`)} type="number" min={0} step={.1} value={String(shownWeights[key] ?? (key.endsWith('ReferenceMs') || key.endsWith('ReferenceMbps') || key === 'loadReference' ? defaultWeights[key] ?? 0 : 0))} onChange={text => { const n = Number(text); if (Number.isFinite(n) && n >= 0) update({ weights: { ...shownWeights, [key]: n } }); }} />)}
            </div></details>
            <SettingInputVertical label={t('auto.latencyTarget')} value={policy.latencyTarget ?? 'https://www.gstatic.com/generate_204'} onChange={latencyTarget => update({ latencyTarget })} />
            <SettingInputVertical label={t('auto.udpLatencyTarget')} value={policy.udpLatencyTarget ?? '223.5.5.5:53/www.google.com'} onChange={udpLatencyTarget => update({ udpLatencyTarget })} />
            <SettingInputVertical label={t('auto.speedTarget')} value={policy.speedTarget ?? ''} onChange={speedTarget => update({ speedTarget })} placeholder="https://example.com/test.bin" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(['maxBytes', 'durationMs', 'timeoutMs', 'dailyBudgetBytes'] as const).map(key => <SettingInputVertical key={key} label={t(`auto.${key}`)} type="number" min={0} value={String(policy.speedTest?.[key] ?? { maxBytes: 4194304, durationMs: 5000, timeoutMs: 10000, dailyBudgetBytes: 67108864 }[key])} onChange={text => { const n = Number(text); if (Number.isSafeInteger(n) && n >= 0) update({ speedTest: { ...policy.speedTest, url: '', [key]: n } }); }} />)}
            </div>
            <p className="text-xs text-ui-muted">{t('auto.measurementHint')}</p>
        </>}
    </section>;
}

export function SelectorLiveStatus({ value }: { value: Selector }) {
    const { t } = useTranslation('routing');
    const [network, setNetwork] = useState<'tcp' | 'udp'>('tcp');
    const [pending, setPending] = useState('');
    const [error, setError] = useState('');
    const { data, error: loadError, mutate } = useSWR(value.id ? ['selector-status', value.id] : null, () => getSelectorStatus(value.id), { refreshInterval: 2500, revalidateOnFocus: false });
    const describe = (reason: string) => reasons.includes(reason) ? t(`auto.reasons.${reason}`) : modes.includes(reason) ? t(`auto.modes.${reason}`) : reason;
    const test = async (nodeId: string, speed: boolean) => {
        setPending(nodeId); setError('');
        try {
            const p = value.policy;
            if (speed) await measureNodeSpeed(nodeId, { ...p?.speedTest, url: p?.speedTarget ?? '' });
            else if (network === 'tcp') await requestJSON('POST', `/api/v2/nodes/${encodeURIComponent(nodeId)}/latency`, { type: 'http', url: p?.latencyTarget ?? '' });
            else {
                const target = (p?.udpLatencyTarget ?? '223.5.5.5:53/www.google.com').split('/');
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
                    {[[t('auto.rtt'), c.samples ? `${c.rttMs.toFixed(1)} ms (${c.samples})` : t('auto.unmeasured')], [t('auto.measuredDownload'), c.downloadMbps ? `${c.downloadMbps.toFixed(2)} Mbps` : t('auto.unmeasured')], [t('auto.measuredUpload'), c.uploadMbps ? `${c.uploadMbps.toFixed(2)} Mbps` : t('auto.unmeasured')], [t('auto.failureRate'), `${(c.failureRate * 100).toFixed(1)}%`], [t('auto.active'), String(c.activeConnections)], [t('auto.score'), c.components ? c.score.toFixed(3) : '—']].map(([label, content]) => <div key={label}><dt className="text-xs text-ui-muted">{label}</dt><dd>{content}</dd></div>)}
                </dl>
                {c.components && <ul className="mt-2 space-y-1 text-xs text-ui-muted">{Object.entries(c.components).map(([key, component]) => <li key={key}>{t(`auto.weightLabels.${key}`)}: {component.toFixed(3)}</li>)}</ul>}
                <div className="mt-3 flex flex-wrap gap-2"><Button permission="nodes:write" size="sm" disabled={!!pending} onClick={() => void test(c.nodeId, false)}>{t('auto.probeNow')}</Button><Button permission="nodes:write" size="sm" disabled={!!pending || !value.policy?.speedTarget} onClick={() => void test(c.nodeId, true)}>{t('auto.measureNow')}</Button></div>
            </details>)}</div>
            <details><summary className="cursor-pointer text-sm">{t('auto.history')}</summary><ol className="mt-2 space-y-2 text-xs text-ui-muted">{[...data.events].reverse().map((event, index) => <li key={`${event.at}:${event.network}:${index}`} className="break-words">{new Date(event.at).toLocaleString()} · {event.network.toUpperCase()} · {event.from || '—'} → {event.to || '—'} · {describe(event.reason)}</li>)}</ol></details>
        </>}
    </section>;
}
