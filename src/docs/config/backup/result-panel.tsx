import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { History, RefreshCw } from 'lucide-react';
import { getRecoveryRestoreStatus } from '@/api/backup';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, IconBox } from '@/component/v2/card';

export function RecoveryResultPanel() {
    const { t } = useTranslation('ui');
    const { data, error, isLoading, mutate } = useSWR('/api/v2/backup/recovery/restore', getRecoveryRestoreStatus, { revalidateOnFocus: false });
    const result = error ? undefined : data?.result;
    const fields = result ? [
        [t('recoveryResult.backup'), result.backupId],
        [t('recoveryResult.transaction'), result.transactionId],
        [t('recoveryResult.instance'), result.instanceId],
        [t('recoveryResult.point'), result.recoveryPoint],
    ] : [];
    return <section data-testid="recovery-result-panel" aria-label={t('recoveryResult.title')}><Card>
        <CardHeader><IconBox icon={History} tone="primary" title={t('recoveryResult.title')} description={t('recoveryResult.description')} /></CardHeader>
        <CardBody>
            {error && <p role="alert" className="text-sm text-ui-danger">{t('recoveryResult.error')}</p>}
            {isLoading && <p role="status" className="text-sm text-ui-muted">{t('recoveryResult.loading')}</p>}
            {!error && !isLoading && !result && <p className="text-sm text-ui-muted">{t('recoveryResult.empty')}</p>}
            {result && <div className="min-w-0">
                <Badge variant={result.state === 'committed' ? 'success' : result.state === 'rolled_back' ? 'warning' : 'muted'}>
                    {t(`recoveryResult.states.${result.state}`, { defaultValue: result.state })}
                </Badge>
                <p className="mt-3 text-sm">{t(result.adoptStartup ? 'recoveryResult.adopted' : 'recoveryResult.hostSettings')}</p>
                <dl className="mt-3 grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
                    {fields.map(([label, value]) => <div key={label} className="min-w-0">
                        <dt className="text-xs text-ui-muted">{label}</dt><dd className="mt-1 break-all font-mono text-xs">{value}</dd>
                    </div>)}
                </dl>
            </div>}
            <Button className="mt-4" onClick={() => void mutate()} disabled={isLoading}><RefreshCw size={16} /><span>{t('recoveryBackup.refresh')}</span></Button>
        </CardBody>
    </Card></section>;
}
