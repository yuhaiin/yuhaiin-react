import { androidUpdateAction, getAndroidApp, getAndroidUpdate, type AndroidUpdate } from '@/api/android';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, IconBox } from '@/component/v2/card';
import Loading from '@/component/v2/loading';
import { Select } from '@/component/v2/select';
import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Smartphone } from 'lucide-react';
import { errorText } from '../AndroidOnly';

const busyStages = new Set(['CHECKING', 'DOWNLOADING', 'VERIFYING', 'INSTALLING']);
export const updateBusy = (u: AndroidUpdate) => u.checking || busyStages.has(u.stage);

/** App update for the Android app, shown on About in place of the desktop self-update. */
export const AndroidAppUpdate: FC<{ className?: string }> = ({ className }) => {
    const { t } = useTranslation('android');
    const { data: app } = useSWR('android/app', getAndroidApp);
    const { data, error, mutate } = useSWR('android/update', getAndroidUpdate, {
        refreshInterval: current => current && updateBusy(current) ? 1000 : 0,
    });
    const [actionError, setActionError] = useState<string>();
    if (error) return <Card className={className}><CardBody><p className="m-0 text-sm text-ui-danger">{errorText(error)}</p></CardBody></Card>;
    if (!data) return <Card className={className}><CardBody><Loading /></CardBody></Card>;
    const act = async (action: 'check' | 'apply' | 'permission' | 'channel', channel?: string) => {
        setActionError(undefined);
        try { await mutate(await androidUpdateAction(action, channel), { revalidate: false }); }
        catch (e) { setActionError(errorText(e)); }
    };
    const busy = updateBusy(data);
    const percent = data.totalBytes > 0 ? Math.round(data.downloadedBytes * 100 / data.totalBytes) : data.progress;
    return <Card className={className}>
        <CardHeader className="py-3">
            <IconBox icon={Smartphone} tone="success" title={t('update.software')} description={t('update.description')} />
            <Select ariaLabel={t('update.channel')} size="sm" value={data.channel} disabled={busy}
                onValueChange={channel => act('channel', channel)}
                items={data.channels.map(value => ({ value, label: t(`update.channels.${value}`, { defaultValue: value }) }))} />
        </CardHeader>
        <CardBody className="flex flex-col gap-3 text-sm">
            {app && <dl className="m-0 flex flex-col gap-3 border-b border-ui-border pb-3 sm:grid sm:grid-cols-3 sm:gap-x-6">
                {([
                    [t('update.app'), app.app ? `${app.app.versionName} (${app.app.versionCode})` : '—'],
                    [t('update.package'), app.app?.applicationId ?? '—'],
                    [t('update.core'), `${app.core.version} ${app.core.commit}`],
                ] as const).map(([label, value]) => <div key={label} className="min-w-0">
                    <dt className="text-xs text-ui-muted">{label}</dt>
                    <dd className="m-0 break-all font-medium text-ui-heading">{value}</dd>
                </div>)}
            </dl>}
            <p className="m-0 break-all text-ui-muted">{t('update.current', { version: data.currentVersion })}</p>
            {data.release
                ? <div className="flex flex-col gap-1">
                    <span className="break-all font-medium text-ui-heading">{t('update.available', { version: data.release.version })}</span>
                    {data.release.notes && <pre className="m-0 max-h-60 overflow-auto whitespace-pre-wrap rounded-ui-md bg-ui-surface-muted p-2 text-xs">{data.release.notes}</pre>}
                </div>
                : data.stage === 'IDLE' && !data.checking && <span>{t('update.none')}</span>}
            {busy && <p className="m-0 text-ui-info">{t(`update.stages.${data.stage}`)}{data.stage === 'DOWNLOADING' ? ` ${percent}%` : ''}</p>}
            {data.stage === 'WAITING_PERMISSION' && <p className="m-0 text-ui-warning">{data.reason ?? t('update.permission')}</p>}
            {data.stage === 'COMPLETED' && <p className="m-0 text-ui-success">{data.reason ?? t('update.stages.COMPLETED')}</p>}
            {(data.error || actionError) && <p className="m-0 break-all text-ui-danger">{actionError ?? data.error}</p>}
            <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline-primary" disabled={busy} onClick={() => act('check')}>{t('update.check')}</Button>
                {data.release && <Button size="sm" variant="primary" disabled={busy} onClick={() => act('apply')}>{t('update.install')}</Button>}
                {data.stage === 'WAITING_PERMISSION' && <Button size="sm" variant="outline-secondary" onClick={() => act('permission')}>{t('update.grant')}</Button>}
            </div>
        </CardBody>
    </Card>;
};
