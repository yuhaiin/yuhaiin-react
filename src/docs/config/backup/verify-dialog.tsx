import type { Go } from '@/api/generated-contracts';
import { RecoveryRequirements } from './requirements';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { verifyRecoveryBackup } from '@/api/backup';
import type { RecoveryBackup } from '@/api/backup';
import { useAsyncAction } from '@/hooks/use-editor-draft';
import { Button } from '@/component/v2/button';
import { SettingPasswordVertical } from '@/component/v2/forms';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { GlobalToastContext } from '@/component/v2/toast';

type Props = { item: RecoveryBackup | undefined; onClose: () => void; onVerified: () => void };

export function VerifyBackupDialog({ item, onClose, onVerified }: Props) {
    const { t } = useTranslation('ui');
    const toast = useContext(GlobalToastContext);
    const [identity, setIdentity] = useState('');
    const [verified, setVerified] = useState<{ jobId: string; manifest: Go.recovery.Manifest }>();
    const action = useAsyncAction(error => toast.Error(String((error as { msg?: string })?.msg ?? error)));
    const close = () => { setIdentity(''); setVerified(undefined); onClose(); };
    const verify = () => {
        if (!item || !identity) return;
        const secret = identity;
        setIdentity('');
        void action.run(async () => {
            const manifest = await verifyRecoveryBackup(item.id, secret);
            setVerified({ jobId: item.id, manifest });
            toast.Info(t(manifest.requirements?.length ? 'recoveryBackup.verifyWithRequirements' : 'recoveryBackup.verifyPassed'));
            onVerified();
        });
    };
    return <Modal open={item !== undefined} onOpenChange={open => { if (!open) close(); }}>
        <ModalContent><ModalHeader><ModalTitle>{t('recoveryBackup.verify')}</ModalTitle></ModalHeader>
            <ModalBody>
                <p className="mb-3 text-sm text-ui-muted">{t('recoveryBackup.verifyHint')}</p>
                <SettingPasswordVertical label={t('recoveryBackup.privateIdentity')} value={identity} onChange={setIdentity}
                    placeholder="AGE-SECRET-KEY-…" autoComplete="off" />
                {verified && verified.jobId === item?.id && <>
                    <p role="status" className="mt-3 text-sm">{t(verified.manifest.requirements?.length ? 'recoveryBackup.verifyWithRequirements' : 'recoveryBackup.verifyPassed')}</p>
                    {!verified.manifest.completeInventory && <p role="alert" className="mt-2 text-sm text-ui-danger">{t('recoveryBackup.legacyInventory')}</p>}
                    <RecoveryRequirements requirements={verified.manifest.requirements} />
                </>}
            </ModalBody>
            <ModalFooter><Button onClick={close} disabled={action.pending}>{t('recoveryBackup.close')}</Button>
                <Button onClick={verify} disabled={!identity || action.pending}>{t('recoveryBackup.verify')}</Button></ModalFooter>
        </ModalContent>
    </Modal>;
}
