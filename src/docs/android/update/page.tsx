import { androidUpdateAction, getAndroidApp, getAndroidUpdate, type AndroidUpdate } from '@/api/android';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import Loading from '@/component/v2/loading';
import { Select } from '@/component/v2/select';
import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { AndroidOnly, errorText } from '../AndroidOnly';

export default function AndroidUpdatePage() {
    const { t } = useTranslation('android');
    return <AndroidOnly title={t('update.title')} description={t('update.description')}>
        <VersionCard />
        <UpdateCard />
    </AndroidOnly>;
}

const VersionCard: FC = () => {
    const { t } = useTranslation('android');
    const { data } = useSWR('android/app', getAndroidApp);
    if (!data) return null;
    return <Card><CardBody>
        <dl className="m-0 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
            <dt className="text-ui-muted">{t('update.app')}</dt><dd className="m-0 break-all">{data.app ? `${data.app.versionName} (${data.app.versionCode})` : '—'}</dd>
            <dt className="text-ui-muted">{t('update.package')}</dt><dd className="m-0 break-all">{data.app?.applicationId ?? '—'}</dd>
            <dt className="text-ui-muted">{t('update.core')}</dt><dd className="m-0 break-all">{data.core.version} {data.core.commit}</dd>
        </dl>
    </CardBody></Card>;
};

const busyStages = new Set(['CHECKING', 'DOWNLOADING', 'VERIFYING', 'INSTALLING']);
export const updateBusy = (u: AndroidUpdate) => u.checking || busyStages.has(u.stage);

const UpdateCard: FC = () => {
    const { t } = useTranslation('android');
    const { data, error, mutate } = useSWR('android/update', getAndroidUpdate, {
        refreshInterval: current => current && updateBusy(current) ? 1000 : 0,
    });
    const [actionError, setActionError] = useState<string>();
    if (error) return <p className="text-sm text-ui-danger">{errorText(error)}</p>;
    if (!data) return <Loading />;
    const act = async (action: 'check' | 'apply' | 'permission' | 'channel', channel?: string) => {
        setActionError(undefined);
        try { await mutate(await androidUpdateAction(action, channel), { revalidate: false }); }
        catch (e) { setActionError(errorText(e)); }
    };
    const busy = updateBusy(data);
    const percent = data.totalBytes > 0 ? Math.round(data.downloadedBytes * 100 / data.totalBytes) : data.progress;
    return <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-medium text-ui-heading">{t('update.software')}</span>
            <Select ariaLabel={t('update.channel')} size="sm" value={data.channel} disabled={busy}
                onValueChange={channel => act('channel', channel)}
                items={data.channels.map(value => ({ value, label: t(`update.channels.${value}`, { defaultValue: value }) }))} />
        </CardHeader>
        <CardBody className="flex flex-col gap-3 text-sm">
            <p className="m-0 text-ui-muted">{t('update.current', { version: data.currentVersion })}</p>
            {data.release
                ? <div className="flex flex-col gap-1">
                    <span className="font-medium text-ui-heading">{t('update.available', { version: data.release.version })}</span>
                    {data.release.notes && <pre className="m-0 max-h-60 overflow-auto whitespace-pre-wrap rounded-ui-md bg-ui-surface-muted p-2 text-xs">{data.release.notes}</pre>}
                </div>
                : data.stage === 'IDLE' && !data.checking && <span>{t('update.none')}</span>}
            {busy && <p className="m-0 text-ui-info">{t(`update.stages.${data.stage}`)}{data.stage === 'DOWNLOADING' ? ` ${percent}%` : ''}</p>}
            {data.stage === 'WAITING_PERMISSION' && <p className="m-0 text-ui-warning">{data.reason ?? t('update.permission')}</p>}
            {data.stage === 'COMPLETED' && <p className="m-0 text-ui-success">{data.reason ?? t('update.stages.COMPLETED')}</p>}
            {(data.error || actionError) && <p className="m-0 text-ui-danger">{actionError ?? data.error}</p>}
            <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline-primary" disabled={busy} onClick={() => act('check')}>{t('update.check')}</Button>
                {data.release && <Button size="sm" variant="primary" disabled={busy} onClick={() => act('apply')}>{t('update.install')}</Button>}
                {data.stage === 'WAITING_PERMISSION' && <Button size="sm" variant="outline-secondary" onClick={() => act('permission')}>{t('update.grant')}</Button>}
            </div>
        </CardBody>
    </Card>;
};
