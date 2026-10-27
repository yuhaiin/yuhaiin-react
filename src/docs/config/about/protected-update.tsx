import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import type { UpdateCompatibility, UpdateConsent, UpdateOperation, UpdateRecoveryReadiness as Readiness } from '@/contract/update';
import { Button } from '@/component/v2/button';
import Switch from '@/component/v2/switch';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';

export function canInstallUpdate(compatibility?: UpdateCompatibility, recovery?: Readiness): boolean {
    if (recovery && !recovery.ready) return false;
    return compatibility?.state === 'compatible' || (compatibility?.state === 'migration_required' && Boolean(recovery?.enabled && recovery.supported && recovery.ready));
}

export function UpdateRecoveryReadiness({ value }: { value?: Readiness }) {
    const { t } = useTranslation('ui');
    const state = !value ? 'legacy' : !value.ready ? (value.supported ? 'configure' : 'unsupported') : value.enabled ? 'ready' : 'unprotected';
    return <div className="mt-3 min-w-0 space-y-2 text-sm" data-testid="update-recovery-readiness">
        <p className={value?.ready && value.enabled ? 'text-ui-muted' : 'text-ui-danger'}>{t(`protectedUpdate.readiness.${state}`)}</p>
        <Link href="/docs/config/backup" className="text-ui-primary underline">{t('protectedUpdate.configure')}</Link>
    </div>;
}

export function ProtectedUpdateDialog({ target, recovery, pending, onClose, onConfirm }: {
    target: string; recovery?: Readiness; pending: boolean; onClose: () => void; onConfirm: (consent: UpdateConsent) => void;
}) {
    const { t } = useTranslation('ui');
    const [maintenance, setMaintenance] = useState(false);
    const [manual, setManual] = useState(false);
    const [noPoint, setNoPoint] = useState(false);
    const unprotected = !recovery?.enabled;
    const ready = maintenance && manual && (!unprotected || noPoint) && (!recovery || recovery.ready);
    return <Modal open onOpenChange={open => { if (!open && !pending) onClose(); }}><ModalContent width={600}>
        <ModalHeader><ModalTitle>{t('protectedUpdate.confirmTitle')}</ModalTitle></ModalHeader>
        <ModalBody>
            <p className="break-all text-sm font-medium">{target}</p>
            <UpdateRecoveryReadiness value={recovery} />
            <p className="my-3 text-sm text-ui-muted">{t('protectedUpdate.flow')}</p>
            <fieldset disabled={pending} className="grid min-w-0 gap-3">
                <Switch label={t('protectedUpdate.maintenance')} checked={maintenance} onCheckedChange={setMaintenance} />
                <Switch label={t(unprotected ? 'protectedUpdate.manualUnprotected' : 'protectedUpdate.manual')} checked={manual} onCheckedChange={setManual} />
                {unprotected && <Switch label={t('protectedUpdate.noPoint')} checked={noPoint} onCheckedChange={setNoPoint} />}
            </fieldset>
        </ModalBody>
        <ModalFooter><Button disabled={pending} onClick={onClose}>{t('cancel')}</Button>
            <Button permission="update:manage" disabled={!ready || pending} onClick={() => onConfirm({ confirmMaintenance: maintenance, confirmManualRecovery: manual, confirmNoRecoveryPoint: noPoint })}>{t('protectedUpdate.confirm')}</Button>
        </ModalFooter>
    </ModalContent></Modal>;
}

const phases = ['prepared', 'capturing', 'backup_ready', 'swapping', 'starting', 'healthy', 'completed', 'failed', 'manual_recovery', 'recovered'];
export function UpdateOperationPanel({ operation, pending, onCancel }: { operation?: UpdateOperation; pending: boolean; onCancel: () => void }) {
    const { t } = useTranslation('ui');
    if (!operation) return null;
    const phase = phases.includes(operation.phase) ? operation.phase : 'unknown';
    return <section className="min-w-0 space-y-3 rounded-ui-md border border-ui-border p-3 text-sm" data-testid="update-operation">
        <p role="status" className="font-medium">{t(`protectedUpdate.phases.${phase}`)}</p>
        <dl className="grid min-w-0 gap-3 text-xs sm:grid-cols-2">
            {[[t('protectedUpdate.operation'), operation.id], [t('protectedUpdate.point'), operation.backupId || operation.backupJobId],
                [t('protectedUpdate.source'), operation.sourceSha256], [t('protectedUpdate.target'), operation.targetSha256]].map(([label, value]) => <div className="min-w-0" key={label}><dt className="text-ui-muted">{label}</dt><dd className="mt-1 break-all font-mono">{value || t('protectedUpdate.noPointShort')}</dd></div>)}
        </dl>
        {operation.errorCode && <p className="break-all text-xs text-ui-danger">{operation.errorCode}</p>}
        <p className="text-xs text-ui-muted">{t('protectedUpdate.offlineHint')}</p>
        <code className="block break-all text-xs">yuhaiin update-status -path /deployment/data</code>
        {phase === 'prepared' && <Button permission="update:manage" size="sm" disabled={pending} onClick={onCancel}>{t('protectedUpdate.cancelPrepared')}</Button>}
    </section>;
}
