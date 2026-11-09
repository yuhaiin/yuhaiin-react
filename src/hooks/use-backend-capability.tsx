import { frontendStatus } from '@/api/frontend';
import type { ReactNode } from 'react';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';

// Fail closed for newly added features when an old Core cannot report them.
// Keep the basic UI usable even when the feature discovery RPC is unavailable.
export function useBackendCapability(name: string): boolean {
  const { data } = useSWR('/api/v2/rpc/frontend.status', frontendStatus, {
    shouldRetryOnError: false,
  });
  return data?.capabilities.includes(name) ?? false;
}

export function RequireBackendCapability({
  name, children,
}: { name: string; children: ReactNode }) {
  const enabled = useBackendCapability(name);
  const { t } = useTranslation('ui');
  return enabled ? <>{children}</> :
    <p role="note" className="text-sm text-ui-muted">{t('frontendRequiresNewCore')}</p>;
}
