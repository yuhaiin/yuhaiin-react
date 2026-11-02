import { getTCPStackDiagnostics } from '@/api/tools';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody } from '@/component/v2/card';
import type { TCPFlowDiagnostic, TCPStackDiagnostic } from '@/contract/tools';
import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const number = (value: number) => value.toLocaleString();
const ms = (value: number) => value > 0 ? `${value.toFixed(1)} ms` : '—';
const bytes = (value: number) => `${(value / 1024).toFixed(1)} KiB`;

function FlowRow({ flow }: { flow: TCPFlowDiagnostic }) {
    const { t } = useTranslation('diagnostics');
    return <tr className="border-t border-ui-border/50 text-xs">
        <td className="min-w-52 py-2 pr-4 align-top">
            <div className="font-mono break-all">{flow.remote}</div>
            <div className="font-mono break-all text-ui-muted">{flow.local}</div>
            <div className="text-ui-muted">{flow.state}{flow.bbrMode ? ` · ${flow.bbrMode}${flow.bbrPhase ? ` / ${flow.bbrPhase}` : ''}` : ''}</div>
        </td>
        <td className="py-2 pr-4 align-top tabular-nums">{ms(flow.srttMs)}<div className="text-ui-muted">RTO {ms(flow.rtoMs)}</div></td>
        <td className="py-2 pr-4 align-top tabular-nums">{bytes(flow.cwndBytes)}<div className="text-ui-muted">{t('tcp.inFlight')}: {bytes(flow.bytesInFlight)}</div></td>
        <td className="py-2 pr-4 align-top tabular-nums">{number(flow.retransmissions)}<div className="text-ui-muted">{t('tcp.lost')}: {bytes(flow.lostBytes)}</div></td>
        <td className="py-2 align-top tabular-nums">{flow.pathMss}<div className="text-ui-muted">{t('tcp.pacing')}: {bytes(flow.pacingBytesPerSecond)}/s</div></td>
    </tr>;
}

function Stat({ label, value }: { label: string; value: number }) {
    return <div className="rounded-ui-md bg-ui-hover/45 px-3 py-2">
        <div className="text-xs text-ui-muted">{label}</div>
        <div className="mt-1 font-mono text-sm font-semibold tabular-nums text-ui-heading">{number(value)}</div>
    </div>;
}

function TCPStack({ stack }: { stack: TCPStackDiagnostic }) {
    const { t } = useTranslation('diagnostics');
    const s = stack.statistics;
    return <Card noMargin><CardBody>
        <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-all text-sm font-semibold text-ui-heading">{stack.inboundId}</h3>
            <Badge variant="muted">MTU {stack.mtu}</Badge>
            <span className="ml-auto text-xs text-ui-muted">{t('tcp.activeFlows', { count: s.connections })}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            <Stat label={t('tcp.packetsIn')} value={s.packetsIn} />
            <Stat label={t('tcp.packetsOut')} value={s.packetsOut} />
            <Stat label={t('tcp.retransmissions')} value={s.retransmissions} />
            <Stat label={t('tcp.drops')} value={s.drops} />
            <Stat label={t('tcp.rstSent')} value={s.rstSent} />
            <Stat label={t('tcp.rstReceived')} value={s.rstReceived} />
            <Stat label={t('tcp.invalidInput')} value={s.invalidInputDrops} />
            <Stat label={t('tcp.rateLimited')} value={s.rateLimitedDrops} />
            <Stat label={t('tcp.aqmDrops')} value={s.outputAqmDrops} />
            <Stat label={t('tcp.overloadDrops')} value={s.outputOverloadDrops} />
            <Stat label={t('tcp.queueRejected')} value={s.outputRejected} />
            <Stat label={t('tcp.queueDepth')} value={s.outputQueuedPackets} />
        </div>
        {stack.flows.length > 0 && <div className="mt-4">
            <div className="mb-2 text-xs font-medium text-ui-heading">{t('tcp.flowSamples', { shown: stack.flows.length, total: s.connections })}</div>
            <div className="max-w-full overflow-x-auto rounded-ui-md border border-ui-border">
                <table className="w-full min-w-[700px] text-left">
                    <thead className="text-xs text-ui-muted"><tr>
                        <th className="px-3 py-2 font-medium">{t('tcp.endpoints')}</th>
                        <th className="pr-4 font-medium">RTT / RTO</th>
                        <th className="pr-4 font-medium">CWND</th>
                        <th className="pr-4 font-medium">{t('tcp.retransmissions')}</th>
                        <th className="font-medium">MSS</th>
                    </tr></thead>
                    <tbody>{stack.flows.map((flow, i) => <FlowRow key={`${flow.local}:${flow.remote}:${i}`} flow={flow} />)}</tbody>
                </table>
            </div>
        </div>}
    </CardBody></Card>;
}

export function TCPStackPanel() {
    const { t } = useTranslation('diagnostics');
    const [stacks, setStacks] = useState<TCPStackDiagnostic[]>();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [takenAt, setTakenAt] = useState('');
    const pending = useRef<AbortController | null>(null);

    useEffect(() => () => { pending.current?.abort(); }, []);

    const refresh = async () => {
        if (pending.current) return;
        const current = new AbortController();
        pending.current = current;
        setBusy(true);
        setError('');
        try {
            const report = await getTCPStackDiagnostics(current.signal);
            if (pending.current === current) {
                setStacks(report.tcpStacks ?? []);
                setTakenAt(report.startedAt);
            }
        } catch {
            if (pending.current === current && !current.signal.aborted) setError(t('tcp.failed'));
        } finally {
            if (pending.current === current) {
                pending.current = null;
                setBusy(false);
            }
        }
    };

    return <section className="space-y-3">
        <Card noMargin><CardBody>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-ui-heading">{t('tcp.title')}</h2>
                    <p className="mt-1 text-xs text-ui-muted">{t('tcp.description')}</p>
                </div>
                <Button type="button" variant="outline-secondary" disabled={busy} permission="diagnostics:run" onClick={() => void refresh()}>
                    <RefreshCw size={15} className={busy ? 'animate-spin' : ''} />{busy ? t('running') : t('tcp.snapshot')}
                </Button>
            </div>
            {takenAt && <p className="mt-2 text-xs text-ui-muted">{t('tcp.takenAt', { date: new Date(takenAt).toLocaleString() })}</p>}
            {error && <p role="alert" className="mt-2 text-sm text-ui-danger">{error}</p>}
            {stacks?.length === 0 && <p className="mt-3 text-sm text-ui-muted">{t('tcp.empty')}</p>}
        </CardBody></Card>
        {stacks?.map(stack => <TCPStack key={stack.inboundId} stack={stack} />)}
        {stacks && stacks.length > 0 && <p className="text-xs text-ui-muted">{t('tcp.privacy')}</p>}
    </section>;
}
