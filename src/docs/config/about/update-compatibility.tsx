import { useTranslation } from 'react-i18next';
import type { UpdateCompatibility } from '@/contract/update';

type Props = { value: UpdateCompatibility | undefined };

export function UpdateCompatibilityDetails({ value }: Props) {
    const { t } = useTranslation('ui');
    const state = value?.state ?? 'unknown';
    const known = ['compatible', 'migration_required', 'incompatible', 'unknown'].includes(state) ? state : 'unknown';
    return <div className="mt-3 min-w-0 space-y-2 text-sm" data-testid="update-compatibility">
        <p className={known === 'compatible' ? 'text-ui-muted' : 'text-ui-danger'}>{t(`updateSafety.states.${known}`)}</p>
        {value && (value.currentConfiguration > 0 || value.targetConfiguration > 0) && <dl className="grid min-w-0 gap-x-4 gap-y-1 text-xs sm:grid-cols-2">
            <div><dt className="text-ui-muted">{t('updateSafety.configuration')}</dt><dd>{value.currentConfiguration} → {value.targetConfiguration}</dd></div>
            <div><dt className="text-ui-muted">{t('updateSafety.management')}</dt><dd>{value.currentManagement || t('updateSafety.notEnabled')} → {value.targetManagement}</dd></div>
        </dl>}
        <p className="text-xs text-ui-muted">{t(value?.databaseRecoveryRequired ? 'updateSafety.recoveryRequired' : 'updateSafety.binaryOnly')}</p>
    </div>;
}
