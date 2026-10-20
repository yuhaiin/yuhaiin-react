import { ui } from '@/component/v2/styles';
import { formatBytes } from '@/common/format';
import { getTrafficStatus } from '@/api/traffic-control';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import type {
    ResourceCounters,
    QueueCounters,
} from '@/contract/traffic-control';
import { Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

const formatNum = (n: number | undefined) => Number(n ?? 0).toLocaleString();
function StatsCard({
    title,
    counters,
}: {
    title: string;
    counters: ResourceCounters | undefined;
}) {
    const { t } = useTranslation('trafficControl');
    return (
        <div className="rounded-ui-sm border border-ui-border p-4">
            <h3 className="mb-3 text-sm font-medium">{title}</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
                {(
                    [
                        'Sessions',
                        'QueueBytes',
                        'PendingTasks',
                        'DeniedSessions',
                        'DeniedBytes',
                        'DeniedPending',
                        'DeniedRateSessions',
                        'DeniedPackets',
                    ] as const
                ).map((key) => (
                    <div key={key}>
                        <dt className="text-xs text-ui-muted">
                            {t('stat.' + key)}
                        </dt>
                        <dd className="mt-0.5 font-semibold tabular-nums">
                            {key === 'QueueBytes'
                                ? formatBytes(counters?.[key] ?? 0, 2, ' ')
                                : formatNum(counters?.[key])}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

function QueueCard({
    title,
    counters,
}: {
    title: string;
    counters: QueueCounters;
}) {
    const { t } = useTranslation('trafficControl');
    return (
        <div className="rounded-ui-sm border border-ui-border p-4">
            <h3 className="mb-3 text-sm font-medium">{title}</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
                {(
                    [
                        'Packets',
                        'Bytes',
                        'Flows',
                        'Rejected',
                        'DroppedAQM',
                        'DroppedOverload',
                        'MaxSojourn',
                    ] as const
                ).map((key) => (
                    <div key={key}>
                        <dt className="text-xs text-ui-muted">
                            {t('queue.' + key)}
                        </dt>
                        <dd className="mt-0.5 font-semibold tabular-nums">
                            {key === 'Bytes'
                                ? formatBytes(counters[key], 2, ' ')
                                : formatNum(
                                      key === 'MaxSojourn'
                                          ? counters[key] / 1e6
                                          : counters[key],
                                  )}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

export function TrafficControlDiagnostics() {
    const { t } = useTranslation('trafficControl');
    const {
        data: status,
        error: statusError,
        mutate: refreshStatus,
    } = useSWR('/api/v2/traffic-control/status', getTrafficStatus, {
        refreshInterval: 5000,
    });
    return (
        <Card noMargin>
            <CardHeader>
                <h2 className={`${ui.sectionTitle} flex items-center gap-2`}>
                    <Activity size={17} />
                    {t('diagnostics')}
                </h2>
                <Button size="sm" onClick={() => void refreshStatus()}>
                    {t('refresh')}
                </Button>
            </CardHeader>
            <CardBody className="space-y-3">
                {statusError && (
                    <p role="alert" className="text-sm text-ui-danger">
                        {t('statusUnavailable')}
                    </p>
                )}
                {!status && !statusError && (
                    <p className="text-sm text-ui-secondary">{t('loading')}</p>
                )}
                {status && (
                    <>
                        <p className="text-xs text-ui-muted">
                            {t('diagnosticsHint')}
                        </p>
                        <div className="grid gap-3 lg:grid-cols-2">
                            <StatsCard
                                title={t('globalResources')}
                                counters={status.global}
                            />
                            <StatsCard
                                title={t('natResources')}
                                counters={status.nat}
                            />
                        </div>
                        {status.shaping && (
                            <section className="rounded-ui-sm border border-ui-border p-4 space-y-3">
                                <h3 className={ui.sectionTitle}>
                                    {t('shaperUsage')}
                                </h3>
                                <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
                                    {(
                                        [
                                            'admittedUploadBytes',
                                            'admittedDownloadBytes',
                                            'rejectedUploadDatagrams',
                                            'rejectedDownloadDatagrams',
                                            'pacingWaitNanos',
                                        ] as const
                                    ).map((key) => (
                                        <div key={key}>
                                            <dt className="text-xs text-ui-muted">
                                                {t('shaping.' + key)}
                                            </dt>
                                            <dd className="mt-1 font-semibold tabular-nums">
                                                {key ===
                                                    'admittedUploadBytes' ||
                                                key === 'admittedDownloadBytes'
                                                    ? formatBytes(
                                                          status.shaping![key],
                                                          2,
                                                          ' ',
                                                      )
                                                    : formatNum(
                                                          key ===
                                                              'pacingWaitNanos'
                                                              ? status.shaping!
                                                                    .pacingWaitNanos /
                                                                    1e6
                                                              : status.shaping![
                                                                    key
                                                                ],
                                                      )}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                        )}
                        {status.inboundScopes?.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm">
                                    {t('scopeUsage')}
                                </h3>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {status.inboundScopes.map((x) => (
                                        <StatsCard
                                            key={x.id}
                                            title={x.id || t('unknownInbound')}
                                            counters={x.counters}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {Boolean(status.queues?.length) && (
                            <section className="space-y-2">
                                <h3 className="font-semibold text-sm">
                                    {t('outputQueues')}
                                </h3>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {status.queues?.map((queue) => (
                                        <QueueCard
                                            key={queue.id}
                                            title={queue.id}
                                            counters={queue.counters}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                        {status.truncated && (
                            <p className="text-xs text-ui-muted">
                                {t('truncated')}
                            </p>
                        )}
                    </>
                )}
            </CardBody>
        </Card>
    );
}
