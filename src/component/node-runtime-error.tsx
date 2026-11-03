import type { OutboundRuntimeStatus } from '@/api/node-observability';
import { useTranslation } from 'react-i18next';

// lastError is persisted history; only degraded passive health makes it current.
// Native protocol errors are independent of successful ordinary connections.
export function NodeRuntimeError({ status }: { status?: OutboundRuntimeStatus }) {
    const { t } = useTranslation('routing');
    if (!status) return null;
    const currentError = status.protocol?.lastError || (status.state === 'degraded' ? status.lastError : undefined);
    const historicalError = status.state !== 'degraded' ? status.lastError : undefined;
    return <>
        {currentError && <div className="rounded-ui-md border border-ui-danger/30 bg-ui-danger-soft p-3 text-sm text-ui-danger" role="alert">
            <div className="text-xs font-medium">{t('outboundLastError')}</div>
            <div className="mt-1 break-all">{currentError}</div>
        </div>}
        {historicalError && <details className="rounded-ui-md border border-ui-border/70 p-3 text-xs text-ui-muted" data-testid="outbound-error-history">
            <summary className="cursor-pointer">{t('outboundErrorHistory')}</summary>
            {status.lastFailureAt > 0 && <p className="mt-2">{t('outboundLastFailure')}: {new Date(status.lastFailureAt * 1000).toLocaleString()}</p>}
            <p className="mt-2 break-all">{historicalError}</p>
        </details>}
    </>;
}
