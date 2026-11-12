import { useTranslation } from 'react-i18next';
import type { Go } from '@/api/generated-contracts';

export function RecoveryRequirements({ requirements }: { requirements?: Go.recovery.Requirement[] }) {
    const { t } = useTranslation('ui');
    if (!requirements?.length) return null;
    return <div role="status" className="my-3 min-w-0 rounded-ui border border-ui-border p-3">
        <p className="text-sm font-medium">{t('recoveryBackup.requirementsTitle')}</p>
        <p className="mt-1 text-sm text-ui-muted">{t('recoveryBackup.requirementsHint')}</p>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">{requirements.map((item, index) => <li key={`${item.kind}:${item.nodeId ?? ''}:${item.path ?? ''}:${index}`}>
            <span>{t(`recoveryBackup.requirements.${item.kind}`, { defaultValue: t('recoveryBackup.requirements.unknown') })}</span>
            {item.nodeId && <code className="mt-1 block break-all text-xs">{item.nodeId}</code>}
            {item.path && <code className="mt-1 block break-all text-xs">{item.path}</code>}
        </li>)}</ul>
    </div>;
}

export function RecoveryFailure({ item }: { item: Go.recovery.Backup }) {
    const { t } = useTranslation('ui');
    if (!item.errorCode) return null;
    return <div role="alert" className="mt-1 text-sm text-ui-danger">
        <p>{t(`recoveryBackup.errors.${item.errorCode}`, { defaultValue: t('recoveryBackup.errors.capture_failed') })}</p>
        {item.failureStage && <p>{t('recoveryBackup.failureStage', { stage: t(`recoveryBackup.stages.${item.failureStage}`, { defaultValue: t('recoveryBackup.stages.capture') }) })}</p>}
        {item.failureCode && <p>{t(`recoveryBackup.failureCodes.${item.failureCode}`, { defaultValue: t('recoveryBackup.failureCodes.unknown') })}</p>}
    </div>;
}
