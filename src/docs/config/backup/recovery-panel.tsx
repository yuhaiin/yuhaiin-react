import { VerifyBackupDialog } from './verify-dialog';
import { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Archive, Download, RefreshCw, Save, Trash2 } from 'lucide-react';
import { createRecoveryBackup, deleteRecoveryBackup, getRecoveryBackups, retryRecoveryBackup, retrieveRecoveryBackup } from '@/api/backup';
import type { RecoveryBackup, RecoveryPolicy } from '@/api/backup';
import { downloadRecoveryBackup, saveRecoveryMetadata } from '@/api/backup-download';
import { useAsyncAction } from '@/hooks/use-editor-draft';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, IconBox, SettingLabel } from '@/component/v2/card';
import { ConfirmModal } from '@/component/v2/confirm';
import { Select, SettingInputVertical, SwitchCard } from '@/component/v2/forms';
import { GlobalToastContext } from '@/component/v2/toast';

export const defaultRecoveryPolicy: RecoveryPolicy = {
    enabled: false, target: 'local', recipient: '', intervalMinutes: 1440,
    timeoutMinutes: 30, keepCount: 10, keepDays: 30, includeHistory: false, allowMaintenance: false, localPoints: { enabled: false, keepCount: 3, keepDays: 30 },
};
const active = (item: RecoveryBackup) => item.retrieval === 'running' || ['queued', 'capturing', 'uploading', 'deleting'].includes(item.state)
    || (item.state === 'local_ready' && item.target === 's3');

type Props = {
    policy: RecoveryPolicy | undefined;
    onChange: (policy: RecoveryPolicy) => void;
    dirty: boolean;
    saving: boolean;
    onSave: () => void;
};

export function RecoveryBackupPanel({ policy, onChange, dirty, saving, onSave }: Props) {
    const { t } = useTranslation('ui');
    const toast = useContext(GlobalToastContext);
    const [waiting, setWaiting] = useState(false);
    const [confirm, setConfirm] = useState<'create' | RecoveryBackup>();
    const [verifyPoint, setVerifyPoint] = useState<RecoveryBackup>();
    const [retrievePoint, setRetrievePoint] = useState<RecoveryBackup>();
    const [retrieving, setRetrieving] = useState<string>();
    const defaultedUpdateProtection = useRef(false);
    const retrieval = useRef<AbortController | undefined>(undefined);
    useEffect(() => () => retrieval.current?.abort(), []);
    const action = useAsyncAction(error => {
        const text = error instanceof Error ? error.message : String((error as { msg?: string })?.msg ?? error);
        toast.Error(text === 'large_download_requires_streaming' ? t('recoveryBackup.largeDownload') : text);
    });
    const { data, error, mutate } = useSWR('/api/v2/backup/recovery', getRecoveryBackups, {
        refreshInterval: current => waiting || current?.items.some(active) ? 3000 : 0,
        revalidateOnFocus: false,
        onSuccess: current => { if (!current.items.some(active)) setWaiting(false); },
    });
    const value: RecoveryPolicy = {
        ...defaultRecoveryPolicy,
        ...policy,
        protectUpdates: policy?.protectUpdates ?? (data?.supported !== false),
    };
    const points = value.localPoints ?? { enabled: false, keepCount: 3, keepDays: 30 };
    const update = (change: Partial<RecoveryPolicy>) => onChange({ ...value, ...change });
    const disabled = saving || action.pending;
    useEffect(() => {
        if (data?.supported !== false || policy?.protectUpdates !== undefined || defaultedUpdateProtection.current) return;
        defaultedUpdateProtection.current = true;
        onChange({ ...defaultRecoveryPolicy, ...policy, protectUpdates: false });
    }, [data?.supported, onChange, policy]);
    const runCreate = () => void action.run(async () => {
        setWaiting(true);
        try {
            const item = await createRecoveryBackup();
            await mutate(current => ({ supported: true, ...current, items: [item, ...(current?.items ?? []).filter(old => old.id !== item.id)] }), { revalidate: false });
        } catch (failure) {
            if ((failure as { code?: number })?.code === 0) return;
            setWaiting(false);
            throw failure;
        }
    });
    const runRetrieve = (item: RecoveryBackup) => void action.run(async () => {
        const controller = new AbortController();
        retrieval.current = controller;
        setRetrieving(item.id);
        try { await retrieveRecoveryBackup(item.id, controller.signal); }
        catch (failure) {
            if (controller.signal.aborted) toast.Info(t('recoveryBackup.retrievalCancelled'));
            else throw failure;
        } finally {
            retrieval.current = undefined;
            setRetrieving(undefined);
            await mutate();
        }
    });
    const runDelete = (item: RecoveryBackup) => void action.run(async () => {
        await deleteRecoveryBackup(item.id);
        await mutate();
    });

    return <Card>
        <CardHeader><IconBox icon={Archive} tone="primary" title={t('recoveryBackup.title')} description={t('recoveryBackup.description')} /></CardHeader>
        <CardBody>
            <VerifyBackupDialog item={verifyPoint} onClose={() => setVerifyPoint(undefined)} onVerified={() => void mutate()} />
            <ConfirmModal show={retrievePoint !== undefined} title={t('recoveryBackup.retrieve')}
                content={<p>{t('recoveryBackup.retrieveWarning', { size: ((retrievePoint?.size ?? 0) / 1048576).toFixed(1) })}</p>}
                onHide={() => setRetrievePoint(undefined)} disabled={disabled}
                onOk={() => { if (retrievePoint) runRetrieve(retrievePoint); }} />
            <ConfirmModal show={confirm !== undefined} title={t(confirm === 'create' ? 'recoveryBackup.create' : 'recoveryBackup.delete')}
                content={<p>{t(confirm === 'create' ? 'recoveryBackup.maintenanceWarning' : 'recoveryBackup.deleteWarning')}</p>}
                onHide={() => setConfirm(undefined)} disabled={disabled}
                onOk={() => { if (confirm === 'create') runCreate(); else if (confirm) runDelete(confirm); }} />
            <fieldset disabled={disabled} className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
                <div className="min-w-0 md:col-span-2">
                    <SettingInputVertical label={t('recoveryBackup.recipient')} value={value.recipient}
                        placeholder="age1…" onChange={recipient => update({ recipient })} />
                    <p className="text-sm text-ui-muted">{t('recoveryBackup.keyHint')}</p>
                    <code className="mt-2 block break-all text-xs">yuhaiin recovery keygen -identity-file /private/recovery.key</code>
                </div>
                <div><SettingLabel>{t('recoveryBackup.target')}</SettingLabel>
                    <Select ariaLabel={t('recoveryBackup.target')} value={value.target} onValueChange={target => update({ target })}
                        items={[{ value: 'local', label: t('recoveryBackup.local') }, { value: 's3', label: 'S3' }]} /></div>
                <SettingInputVertical label={t('recoveryBackup.timeout')} type="number" min={1} max={1440}
                    value={String(value.timeoutMinutes)} onChange={input => update({ timeoutMinutes: Number(input) })} />
                <SwitchCard label={t('recoveryBackup.consent')} description={t('recoveryBackup.maintenanceWarning')}
                    checked={value.allowMaintenance} onCheckedChange={allowMaintenance => update({ allowMaintenance })} />
                <SwitchCard label={t('protectedUpdate.protection')} description={t('protectedUpdate.protectionHint')}
                    checked={value.protectUpdates !== false} onCheckedChange={protectUpdates => update({ protectUpdates })} />
                {data?.supported === false && <p className="text-sm text-ui-muted">{t('protectedUpdate.unsupportedPlatformHint')}</p>}
                <SwitchCard label={t('recoveryBackup.schedule')} description={t('recoveryBackup.scheduleHint')}
                    checked={value.enabled} onCheckedChange={enabled => update({ enabled })} />
                <SettingInputVertical label={t('recoveryBackup.interval')} type="number" min={60} max={525600}
                    value={String(value.intervalMinutes)} onChange={input => update({ intervalMinutes: Number(input) })} />
                <SwitchCard label={t('recoveryBackup.history')} description={t('recoveryBackup.historyHint')}
                    checked={value.includeHistory} onCheckedChange={includeHistory => update({ includeHistory })} />
                <SettingInputVertical label={t('recoveryBackup.keepCount')} type="number" min={1} max={1000}
                    value={String(value.keepCount)} onChange={input => update({ keepCount: Number(input) })} />
                <SettingInputVertical label={t('recoveryBackup.keepDays')} type="number" min={1} max={3650}
                    value={String(value.keepDays)} onChange={input => update({ keepDays: Number(input) })} />
                <details className="min-w-0 rounded-ui border border-ui-border p-4 md:col-span-2">
                    <summary className="cursor-pointer text-sm font-medium">{t('recoveryBackup.localPointsTitle')}</summary>
                    <p className="my-3 text-sm text-ui-muted">{t('recoveryBackup.localPointsHint')}</p>
                    <div className="grid min-w-0 gap-4 md:grid-cols-2">
                        <SwitchCard label={t('recoveryBackup.localPointsConsent')} description={t('recoveryBackup.localPointsWarning')}
                            checked={points.enabled} onCheckedChange={enabled => update({ localPoints: { ...points, enabled } })} />
                        <SettingInputVertical label={t('recoveryBackup.localPointsCount')} type="number" min={1} max={1000}
                            value={String(points.keepCount)} onChange={input => update({ localPoints: { ...points, keepCount: Number(input) } })} />
                        <SettingInputVertical label={t('recoveryBackup.localPointsDays')} type="number" min={1} max={3650}
                            value={String(points.keepDays)} onChange={input => update({ localPoints: { ...points, keepDays: Number(input) } })} />
                    </div>
                </details>
            </fieldset>
            <p className="mt-3 text-sm text-ui-muted">{t('recoveryBackup.retentionHint')}</p>
            {!data?.supported && <p className="mt-3 text-sm text-ui-muted">{t('recoveryBackup.unsupported')}</p>}
            {retrieving && <p role="status" className="mt-3 text-sm">{t('recoveryBackup.retrieving')} <Button onClick={() => retrieval.current?.abort()}>{t('recoveryBackup.cancelRetrieval')}</Button></p>}
            {(waiting || data?.items.some(active)) && <p role="status" className="mt-3 text-sm">{t('recoveryBackup.waiting')}</p>}
            {error && !waiting && <p role="alert" className="mt-3 text-sm text-ui-danger">{t('recoveryBackup.statusError')}</p>}
            <div className="my-4 flex flex-wrap gap-2">
                <Button onClick={onSave} disabled={!dirty || disabled}><Save size={16} /><span>{t('saveConfig')}</span></Button>
                <Button onClick={() => setConfirm('create')} disabled={disabled || dirty || !data?.supported || !value.recipient || !value.allowMaintenance}>
                    <Archive size={16} /><span>{t('recoveryBackup.create')}</span></Button>
                <Button onClick={() => void mutate()} disabled={disabled}><RefreshCw size={16} /><span>{t('recoveryBackup.refresh')}</span></Button>
            </div>
            <div className="grid min-w-0 gap-3">
                {data?.items.map(item => <article key={item.id} className="min-w-0 rounded-ui-md border border-ui-border p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                            {item.updatePoint && <p className="text-xs text-ui-primary">{t('protectedUpdate.point')}</p>}
                            <p className="text-sm font-medium">{new Date(item.createdAt).toLocaleString()} · {item.target === 'local' ? t('recoveryBackup.local') : 'S3'}</p>
                            <p className="text-sm">{t(`recoveryBackup.states.${item.state}`, { defaultValue: item.state })} · {(item.size / 1048576).toFixed(1)} MiB</p>
                            <p className="mt-1 break-all font-mono text-xs text-ui-muted">{item.id}</p>
                            {item.verification && <p className="mt-1 text-xs text-ui-muted">{t(`recoveryBackup.verification.${item.verification}`, { defaultValue: item.verification })}</p>}
                            {item.localState && <p className="mt-1 text-xs text-ui-muted">{t(`recoveryBackup.localState.${item.localState}`, { defaultValue: item.localState })}</p>}
                            {item.retrieval && <p className="mt-1 text-xs" role={['failed', 'cancelled', 'interrupted'].includes(item.retrieval) ? 'alert' : undefined}>{t(`recoveryBackup.retrieval.${item.retrieval}`, { defaultValue: item.retrieval })}</p>}
                            {item.archiveCheck && <p className="mt-1 text-xs">{t(`recoveryBackup.archiveCheck.${item.archiveCheck}`, { defaultValue: item.archiveCheck })}</p>}
                            {item.errorCode && <p role="alert" className="mt-1 text-sm text-ui-danger">{t(`recoveryBackup.errors.${item.errorCode}`, { defaultValue: item.errorCode })}</p>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['local_ready', 'verified'].includes(item.state) && (!item.localState || item.localState === 'present') && <Button aria-label={t('recoveryBackup.download')} disabled={disabled}
                                onClick={() => void action.run(() => downloadRecoveryBackup(item.id))}><Download size={16} /></Button>}
                            {['local_ready', 'verified'].includes(item.state) && (!item.localState || item.localState === 'present') && <Button disabled={disabled} onClick={() => setVerifyPoint(item)}>{t('recoveryBackup.verify')}</Button>}
                            {item.state === 'verified' && item.target === 's3' && <>
                                <Button disabled={disabled || item.retrieval === 'running'} onClick={() => setRetrievePoint(item)}>{t('recoveryBackup.retrieve')}</Button>
                                <Button disabled={disabled} onClick={() => saveRecoveryMetadata(item)}>{t('recoveryBackup.saveMetadata')}</Button>
                            </>}
                            {item.state === 'failed' && item.backupId && item.target === 's3' && <Button disabled={disabled}
                                onClick={() => void action.run(async () => { await retryRecoveryBackup(item.id); await mutate(); })}>{t('recoveryBackup.retry')}</Button>}
                            {!active(item) && <Button aria-label={t('recoveryBackup.delete')} disabled={disabled} onClick={() => setConfirm(item)}><Trash2 size={16} /></Button>}
                        </div>
                    </div>
                </article>)}
                {data?.items.length === 0 && <p className="text-sm text-ui-muted">{t('recoveryBackup.empty')}</p>}
            </div>
            <p className="mt-4 text-sm text-ui-muted">{t('recoveryBackup.restoreHint')}</p>
        </CardBody>
    </Card>;
}
