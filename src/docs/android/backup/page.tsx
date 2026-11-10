import { confirmAction } from '@/component/v2/confirmation';
import { exportAndroidBackup, previewAndroidBackup, restoreAndroidBackup, startDownload, type BackupPreview } from '@/api/android';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { useRef, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { AndroidOnly, errorText } from '../AndroidOnly';

/** Android configuration backup: the core's configuration plus Android preferences. */
export default function AndroidBackupPage() {
    const { t } = useTranslation('android');
    return <AndroidOnly title={t('backup.title')} description={t('backup.description')}>
        <ExportCard />
        <RestoreCard />
    </AndroidOnly>;
}

const ExportCard: FC = () => {
    const { t } = useTranslation('android');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string>();
    return <Card>
        <CardHeader><span className="font-medium text-ui-heading">{t('backup.export')}</span></CardHeader>
        <CardBody className="flex flex-col gap-3">
            <p className="m-0 text-sm text-ui-muted">{t('backup.exportHint')}</p>
            <div><Button variant="primary" size="sm" loading={busy} onClick={async () => {
                setBusy(true); setError(undefined);
                try { startDownload(await exportAndroidBackup()); }
                catch (e) { setError(errorText(e)); }
                finally { setBusy(false); }
            }}>{t('backup.download')}</Button></div>
            {error && <p className="m-0 text-sm text-ui-danger">{error}</p>}
        </CardBody>
    </Card>;
};

const RestoreCard: FC = () => {
    const { t } = useTranslation('android');
    const file = useRef<HTMLInputElement>(null);
    const [backup, setBackup] = useState<string>();
    const [preview, setPreview] = useState<BackupPreview>();
    const [state, setState] = useState<'idle' | 'checking' | 'restoring' | 'done'>('idle');
    const [error, setError] = useState<string>();
    const choose = async (selected?: File) => {
        setPreview(undefined); setBackup(undefined); setError(undefined);
        if (!selected) return;
        setState('checking');
        try {
            const text = await selected.text();
            setPreview(await previewAndroidBackup(text));
            setBackup(text);
        } catch (e) { setError(errorText(e)); }
        finally { setState('idle'); }
    };
    const restore = async () => {
        if (!backup || !await confirmAction(t('backup.restoreConfirm'))) return;
        setState('restoring'); setError(undefined);
        try { await restoreAndroidBackup(backup); setState('done'); }
        catch (e) { setError(errorText(e)); setState('idle'); }
    };
    return <Card>
        <CardHeader><span className="font-medium text-ui-heading">{t('backup.restore')}</span></CardHeader>
        <CardBody className="flex flex-col gap-3">
            <p className="m-0 text-sm text-ui-muted">{t('backup.restoreHint')}</p>
            <input ref={file} type="file" accept="application/json,.json" className="hidden" onChange={e => void choose(e.target.files?.[0])} />
            <div><Button size="sm" variant="outline-primary" loading={state === 'checking'} onClick={() => file.current?.click()}>{t('backup.choose')}</Button></div>
            {preview && <dl className="m-0 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <dt className="text-ui-muted">{t('backup.createdAt')}</dt><dd className="m-0">{preview.createdAt}</dd>
                <dt className="text-ui-muted">{t('backup.nodes')}</dt><dd className="m-0">{preview.nodes}</dd>
                <dt className="text-ui-muted">{t('backup.rules')}</dt><dd className="m-0">{preview.routes}</dd>
                <dt className="text-ui-muted">{t('backup.preferences')}</dt><dd className="m-0">{preview.preferences}</dd>
            </dl>}
            {preview && <div><Button size="sm" variant="danger" loading={state === 'restoring'} onClick={restore}>{t('backup.restoreNow')}</Button></div>}
            {state === 'done' && <p className="m-0 text-sm text-ui-success">{t('backup.restarting')}</p>}
            {error && <p className="m-0 text-sm text-ui-danger">{error}</p>}
        </CardBody>
    </Card>;
};
