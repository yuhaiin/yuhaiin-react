import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { activateRecoveryImport } from '@/api/backup-import';
import type { RecoveryImport } from '@/api/backup-import';
import { Button } from '@/component/v2/button';
import Switch from '@/component/v2/switch';
import { Input } from '@/component/v2/input';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { GlobalToastContext } from '@/component/v2/toast';

export function RecoveryActivationDialog({ item, onClose, onAdmitted }: {
    item: RecoveryImport; onClose: () => void; onAdmitted: (uncertain: boolean) => void;
}) {
    const { t } = useTranslation('ui');
    const toast = useContext(GlobalToastContext);
    const [target, setTarget] = useState('');
    const [maintenance, setMaintenance] = useState(false);
    const [startup, setStartup] = useState(false);
    const [sourceStopped, setSourceStopped] = useState(false);
    const [revival, setRevival] = useState(false);
    const [replacement, setReplacement] = useState(false);
    const [enrollment, setEnrollment] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const preview = item.preview;
    if (!preview) return null;
    const original = preview.mode === 'original';
    const replacesIdentity = preview.targetInstanceId !== preview.instanceId;
    const ready = Boolean(item.previewId && target === preview.targetInstanceId && maintenance && startup
        && (original ? sourceStopped && revival : enrollment) && (!replacesIdentity || replacement));
    const activate = async () => {
        if (!ready || pending) return;
        setPending(true); setError('');
        try {
            const admission = await activateRecoveryImport({ id: item.id, confirmPreviewId: item.previewId!, confirmBackupId: preview.manifest.id,
                confirmSourceInstanceId: preview.manifest.instanceId, confirmTargetInstanceId: target, confirmResultInstanceId: preview.instanceId,
                confirmMaintenance: maintenance, confirmStartupChanges: startup, confirmSourceStopped: sourceStopped,
                confirmCredentialRevival: revival, confirmIdentityReplacement: replacement, confirmCloneEnrollment: enrollment });
            const uncertain = admission.errorCode === 'launch_uncertain';
            toast.Info(t(uncertain ? 'recoveryActivation.uncertain' : 'recoveryActivation.admitted'));
            onAdmitted(uncertain); onClose();
        } catch (failure) {
            const code = typeof failure === 'object' && failure !== null && 'code' in failure ? failure.code : undefined;
            if (typeof code === 'number' && code > 0) {
                setError(typeof failure === 'object' && failure !== null && 'msg' in failure ? String(failure.msg) : t('recoveryActivation.error'));
            } else {
                // The server can stop after persisting admission but before its
                // response arrives. Observe that single request; never replay it.
                toast.Info(t('recoveryActivation.uncertain'));
                onAdmitted(true); onClose();
            }
        } finally { setPending(false); }
    };
    return <Modal open onOpenChange={open => { if (!open && !pending) onClose(); }}><ModalContent width={640}>
        <ModalHeader><ModalTitle>{t('recoveryActivation.title')}</ModalTitle></ModalHeader>
        <ModalBody>
            <p className="text-sm text-ui-danger">{t('recoveryActivation.warning')}</p>
            <dl className="my-4 grid min-w-0 gap-3 text-xs">
                {[[t('recoveryResult.backup'), preview.manifest.id], [t('recoveryResult.transaction'), item.previewId ?? ''], [t('recoveryActivation.target'), preview.targetInstanceId],
                    [t('recoveryResult.instance'), preview.instanceId], [t('recoveryActivation.listener'), preview.runtime.listenAddress || t('recoveryActivation.hostListener')],
                    [t('recoveryActivation.tls'), preview.runtime.managementTLS]].map(([label, value]) => <div key={label} className="min-w-0">
                        <dt className="text-ui-muted">{label}</dt><dd className="mt-1 break-all font-mono">{value}</dd>
                    </div>)}
            </dl>
            <fieldset disabled={pending} className="grid min-w-0 gap-3">
                <label className="text-sm" htmlFor="recovery-confirm-target">{t('recoveryActivation.typeTarget')}</label>
                <Input id="recovery-confirm-target" value={target} onChange={event => setTarget(event.target.value)} autoComplete="off" spellCheck={false} />
                <Switch disabled={pending} label={t('recoveryActivation.maintenance')} checked={maintenance} onCheckedChange={setMaintenance} />
                <Switch disabled={pending} label={t('recoveryActivation.startup')} checked={startup} onCheckedChange={setStartup} />
                {original ? <>
                    <Switch disabled={pending} label={t('recoveryActivation.sourceStopped')} checked={sourceStopped} onCheckedChange={setSourceStopped} />
                    <Switch disabled={pending} label={t('recoveryActivation.revival')} checked={revival} onCheckedChange={setRevival} />
                </> : <Switch disabled={pending} label={t('recoveryActivation.enrollment')} checked={enrollment} onCheckedChange={setEnrollment} />}
                {replacesIdentity && <Switch disabled={pending} label={t('recoveryActivation.replacement')} checked={replacement} onCheckedChange={setReplacement} />}
            </fieldset>
            {error && <p role="alert" className="mt-3 break-words text-sm text-ui-danger">{error}</p>}
        </ModalBody>
        <ModalFooter><Button disabled={pending} onClick={onClose}>{t('recoveryActivation.cancel')}</Button>
            <Button variant="outline-danger" disabled={!ready || pending} onClick={() => void activate()}>{t('recoveryActivation.activate')}</Button></ModalFooter>
    </ModalContent></Modal>;
}
