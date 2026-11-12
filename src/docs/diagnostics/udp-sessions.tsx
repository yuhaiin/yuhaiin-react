import type { Connection, TotalFlow } from '@/contract/connection';
import { useTranslation } from 'react-i18next';
import { DetailSection } from './detail-section';
import { formatBytes } from './network-overview';

export function UDPSessions({ sessions, counters }: { sessions?: Connection[]; counters?: TotalFlow['counters'] }) {
    const { t } = useTranslation('diagnostics');
    if (!sessions) return <p className="text-xs text-ui-muted">{t('tcp.unavailableConnections')}</p>;
    if (sessions.length === 0) return <p className="text-xs text-ui-muted">{t('tcp.noUdpSessions')}</p>;
    const shown = sessions.slice(0, 32);
    const cell = 'px-3 py-2 align-top';
    const total = (direction: 'upload' | 'download') => String(shown.reduce((sum, session) => {
        try { return sum + BigInt(counters?.[session.id]?.[direction] ?? 0); } catch { return sum; }
    }, 0n));
    return <DetailSection testId="udp-sessions" title={t('tcp.udpSessions', { shown: shown.length, total: sessions.length })}
        meta={t('tcp.udpSources', { count: new Set(sessions.map(session => session.source)).size })}
        status={counters ? `↑${formatBytes(total('upload'))} ↓${formatBytes(total('download'))}` : undefined}>
        <p className="text-xs text-ui-muted">{t('tcp.udpSessionHelp')}</p>
        <div className="max-h-[28rem] min-w-0 max-w-full overflow-auto rounded-ui-md border border-ui-border">
            <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="sticky top-0 z-10 bg-ui-surface text-ui-muted"><tr>
                    <th className={cell}>{t('tcp.udpSource')}</th>
                    <th className={cell}>{t('tcp.udpInbound')}</th>
                    <th className={cell}>{t('tcp.udpTarget')}</th>
                    <th className={`${cell} text-right`}>{t('tcp.udpUpload')}</th>
                    <th className={`${cell} text-right`}>{t('tcp.udpDownload')}</th>
                </tr></thead>
                <tbody>{shown.map(session => <tr key={session.id} className="border-t border-ui-border/50 hover:bg-ui-surface-muted/60">
                    <td className={`${cell} break-all font-mono`}>
                        <div>{session.source || '—'}</div>
                        <div className="mt-1 text-ui-muted">ID: {session.id}</div>
                        {session.localAddr && <div className="mt-1 text-ui-muted">{t('tcp.udpLocal')}: {session.localAddr}</div>}
                    </td>
                    <td className={`${cell} break-all`}>{session.inboundName || session.inboundId || '—'}</td>
                    <td className={`${cell} break-all font-mono`}>{session.addr || '—'}</td>
                    <td className={`${cell} text-right font-mono tabular-nums`}>{formatBytes(counters?.[session.id]?.upload)}</td>
                    <td className={`${cell} text-right font-mono tabular-nums`}>{formatBytes(counters?.[session.id]?.download)}</td>
                </tr>)}</tbody>
            </table>
        </div>
    </DetailSection>;
}
