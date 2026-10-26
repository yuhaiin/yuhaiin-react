import { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { ArchiveRestore, RefreshCw, Trash2, Upload } from 'lucide-react';
import { discardRecoveryImport, getRecoveryImports, previewRecoveryImport, uploadRecoveryImport } from '@/api/backup-import';
import type { RecoveryImport } from '@/api/backup-import';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, IconBox, SettingLabel } from '@/component/v2/card';
import { ConfirmModal } from '@/component/v2/confirm';
import { Select, SettingPasswordVertical } from '@/component/v2/forms';
import { Input } from '@/component/v2/input';
import { GlobalToastContext } from '@/component/v2/toast';
import { useAsyncAction } from '@/hooks/use-editor-draft';

export function RecoveryImportPanel() {
    const { t } = useTranslation('ui');
    const toast = useContext(GlobalToastContext);
    const { data = [], error, mutate } = useSWR('/api/v2/backup/recovery/imports', getRecoveryImports, { revalidateOnFocus: false });
    const [discard, setDiscard] = useState<RecoveryImport>();
    const [selected, setSelected] = useState('');
    const [mode, setMode] = useState<'original' | 'clone'>('original');
    const [keyType, setKeyType] = useState('identity');
    const [secret, setSecret] = useState('');
    const [file, setFile] = useState<File>();
    const [uploading, setUploading] = useState(false);
    const input = useRef<HTMLInputElement>(null);
    const transfer = useRef<AbortController | undefined>(undefined);
    useEffect(() => () => transfer.current?.abort(), []);
    const action = useAsyncAction(failure => {
        if (failure instanceof DOMException && failure.name === 'AbortError') return;
        const message = failure instanceof Error ? failure.message : String((failure as { msg?: string })?.msg ?? failure);
        toast.Error(message === 'recovery_import_size' ? t('recoveryImport.sizeLimit') : message);
    });
    const upload = () => {
        if (!file) return;
        const archive = file;
        setFile(undefined);
        if (input.current) input.current.value = '';
        void action.run(async () => {
            const controller = new AbortController();
            transfer.current = controller;
            setUploading(true);
            try {
                const item = await uploadRecoveryImport(archive, controller.signal);
                setSelected(item.id);
                await mutate();
            } finally { transfer.current = undefined; setUploading(false); }
        });
    };
    const preview = () => {
        if (!selected || !secret) return;
        const value = secret;
        setSecret('');
        void action.run(async () => {
            await previewRecoveryImport(selected, mode, keyType === 'identity' ? value : '', keyType === 'passphrase' ? value : '');
            await mutate();
        });
    };
    return <section data-testid="recovery-import-panel" aria-label={t('recoveryImport.title')}><Card>
        <CardHeader><IconBox icon={ArchiveRestore} tone="primary" title={t('recoveryImport.title')} description={t('recoveryImport.description')} /></CardHeader>
        <CardBody>
            <ConfirmModal show={discard !== undefined} title={t('recoveryImport.discard')} content={<p>{t('recoveryImport.discardWarning')}</p>}
                disabled={action.pending} onHide={() => setDiscard(undefined)} onOk={() => {
                    if (!discard) return;
                    const id = discard.id;
                    void action.run(async () => { await discardRecoveryImport(id); if (selected === id) { setSelected(''); setSecret(''); } await mutate(); });
                }} />
            <fieldset disabled={action.pending} className="min-w-0">
                <SettingLabel htmlFor="recovery-import-file">{t('recoveryImport.archive')}</SettingLabel>
                <Input id="recovery-import-file" ref={input} type="file" accept=".yhb,application/octet-stream" className="mt-2 w-full min-w-0"
                    onChange={event => setFile(event.target.files?.[0])} />
                <p className="mt-2 text-sm text-ui-muted">{t('recoveryImport.limits')}</p>
                <div className="my-4 flex flex-wrap gap-2">
                    <Button onClick={upload} disabled={!file}><Upload size={16} /><span>{t('recoveryImport.upload')}</span></Button>
                    <Button onClick={() => void mutate()}><RefreshCw size={16} /><span>{t('recoveryBackup.refresh')}</span></Button>
                </div>
                {data.length > 0 && <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
                    <div><SettingLabel>{t('recoveryImport.selected')}</SettingLabel>
                        <Select ariaLabel={t('recoveryImport.selected')} value={selected} onValueChange={id => { setSelected(id); setSecret(''); }}
                            items={data.filter(item => item.state !== 'uploading').map(item => ({ value: item.id, label: `${item.id.slice(0, 8)} · ${(item.size / 1048576).toFixed(1)} MiB` }))} /></div>
                    <div><SettingLabel>{t('recoveryImport.mode')}</SettingLabel>
                        <Select ariaLabel={t('recoveryImport.mode')} value={mode} onValueChange={value => { if (value === 'original' || value === 'clone') setMode(value); }}
                            items={[{ value: 'original', label: t('recoveryImport.original') }, { value: 'clone', label: t('recoveryImport.clone') }]} /></div>
                    <div><SettingLabel>{t('recoveryImport.keyType')}</SettingLabel>
                        <Select ariaLabel={t('recoveryImport.keyType')} value={keyType} onValueChange={value => { setKeyType(value); setSecret(''); }}
                            items={[{ value: 'identity', label: t('recoveryBackup.privateIdentity') }, { value: 'passphrase', label: t('recoveryImport.passphrase') }]} /></div>
                    <SettingPasswordVertical label={keyType === 'identity' ? t('recoveryBackup.privateIdentity') : t('recoveryImport.passphrase')}
                        value={secret} onChange={setSecret} autoComplete="off" />
                    <div className="md:col-span-2"><p className="text-sm text-ui-muted">{t('recoveryImport.keyHint')}</p>
                        <Button className="mt-3" onClick={preview} disabled={!selected || !secret}>{t('recoveryImport.preview')}</Button></div>
                </div>}
            </fieldset>
            {uploading && <Button className="mt-3" onClick={() => transfer.current?.abort()}>{t('recoveryImport.cancel')}</Button>}
            {error && <p role="alert" className="mt-3 text-sm text-ui-danger">{t('recoveryBackup.statusError')}</p>}
            <div className="mt-4 grid min-w-0 gap-4">
                {data.map(item => <article key={item.id} className="min-w-0 rounded-ui-md border border-ui-border p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0"><p className="break-all font-mono text-xs">{item.id}</p>
                            <p className="mt-1 text-sm text-ui-muted">{t('recoveryImport.expires', { time: new Date(item.expiresAt).toLocaleString() })}</p></div>
                        <Button aria-label={t('recoveryImport.discard')} disabled={action.pending} onClick={() => setDiscard(item)}><Trash2 size={16} /></Button>
                    </div>
                    {item.preview && <div className="mt-3 min-w-0">
                        <p className="text-sm">{t('recoveryImport.version', { version: item.preview.manifest.build.version })}</p>
                        <p className="mt-1 break-all text-xs">{t('recoveryImport.source', { id: item.preview.manifest.instanceId })}</p>
                        <p className="mt-1 break-all text-xs">{t('recoveryImport.target', { id: item.preview.targetInstanceId })}</p>
                        <p className="mt-1 break-all text-xs">{t('recoveryImport.resultInstance', { id: item.preview.instanceId })}</p>
                        <p className="mt-1 text-sm">{t(item.preview.mode === 'clone' ? 'recoveryImport.clone' : 'recoveryImport.original')}</p>
                        <ul className="my-3 list-disc space-y-1 pl-5 text-sm">{item.preview.warnings.map(warning => <li key={warning}>{t(`recoveryImport.warnings.${warning}`, { defaultValue: warning })}</li>)}</ul>
                        <details><summary className="cursor-pointer text-sm">{t('recoveryImport.files', { count: item.preview.files.length })}</summary>
                            <ul className="mt-2 space-y-2">{item.preview.files.map(entry => <li key={entry.path} className="break-all font-mono text-xs">
                                {t(entry.install ? entry.replace ? 'recoveryImport.replace' : 'recoveryImport.install' : 'recoveryImport.remove')} · {entry.path}
                            </li>)}</ul></details>
                    </div>}
                </article>)}
            </div>
            <p className="mt-4 text-sm text-ui-muted">{t('recoveryImport.activationHint')}</p>
        </CardBody>
    </Card></section>;
}
