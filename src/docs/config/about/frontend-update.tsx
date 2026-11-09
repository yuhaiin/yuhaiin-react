import { useState, useContext } from 'react';
import useSWR from 'swr';
import { Download, RefreshCw, RotateCcw, PanelsTopLeft } from 'lucide-react';
import { usePermission } from '@/auth/context';
import { frontendStatus, frontendCheck, frontendApply, frontendRollback, type FrontendCheck } from '@/api/frontend';
import { Card, CardBody, CardHeader, IconBox } from '@/component/v2/card';
import { Button } from '@/component/v2/button';
import { GlobalToastContext } from '@/component/v2/toast';
import { useTranslation } from 'react-i18next';

export function FrontendUpdatePanel() {
  const { t } = useTranslation('ui');
  const notice = useContext(GlobalToastContext);
  const canUpdate = usePermission('update:manage');
  const { data: status, error, mutate } = useSWR('/api/v2/rpc/frontend.status', frontendStatus, {
    shouldRetryOnError: false,
  });
  const [check, setCheck] = useState<FrontendCheck>();
  const [busy, setBusy] = useState(false);

  async function perform(task: () => Promise<unknown>, refresh = false, clearCheck = true) {
    setBusy(true);
    try {
      await task();
      if (clearCheck) setCheck(undefined);
      await mutate();
      notice.Info(t('frontendUpdateComplete'));
      if (refresh) window.location.reload();
    } catch (error) {
      notice.Error(error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  // This page also runs against Core versions from before UI OTA existed.
  if (!status && error) return (
    <Card className="order-2">
      <CardHeader><IconBox icon={PanelsTopLeft} title={t('frontendUpdate')} description={t('frontendRequiresNewCore')} tone="violet" /></CardHeader>
    </Card>
  );

  return <Card className="order-2">
    <CardHeader>
      <IconBox icon={PanelsTopLeft} title={t('frontendUpdate')}
        description={t('frontendUpdateDescription')} tone="violet" />
    </CardHeader>
    <CardBody className="space-y-4">
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <div><span className="text-ui-muted">{t('frontendActiveVersion')}: </span><span className="break-all font-mono">{status?.active.version ?? '…'}</span></div>
        <div><span className="text-ui-muted">{t('frontendSource')}: </span><span>{status?.source ?? '…'}</span></div>
        <div><span className="text-ui-muted">{t('frontendEmbeddedVersion')}: </span><span className="break-all font-mono">{status?.embedded.version ?? '…'}</span></div>
      </div>
      {status?.reason === 'embedded_frontend_newer_or_equal' && (
        <p role="status" className="text-sm text-ui-muted">{t('frontendEmbeddedTakesPriority')}</p>
      )}
      {check && <div className="rounded-ui-md border border-ui-border p-3 text-sm space-y-1">
        <div className="font-medium">{check.release.version}</div>
        <p className="text-ui-muted">{check.available ? t('frontendAvailable') :
          check.reason ? t('frontendUnavailable', { reason: check.reason }) : t('frontendUpToDate')}</p>
        {check.available && <p className="text-ui-muted">{t('frontendUpdateRequiresReload')}</p>}
      </div>}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="default" permission="update:manage"
          disabled={busy || !canUpdate || !status || status.source === 'external'}
          onClick={() => void perform(async () => setCheck(await frontendCheck()), false, false)}>
          <RefreshCw size={16} className="mr-2" />{t('checkForUpdates')}
        </Button>
        {check?.available && <Button variant="default" permission="update:manage"
          disabled={busy || !canUpdate} onClick={() => {
            if (!window.confirm(t('frontendApplyConfirmation'))) return;
            void perform(() => frontendApply(check.release.version, check.release.sha256), true);
          }}>
          <Download size={16} className="mr-2" />{t('frontendApply')}
        </Button>}
        {status?.installed && status.source === 'downloaded' && <Button variant="default"
          permission="update:manage" disabled={busy || !canUpdate}
          onClick={() => {
            if (!window.confirm(t('frontendRollbackConfirmation'))) return;
            void perform(frontendRollback, true);
          }}>
          <RotateCcw size={16} className="mr-2" />{t('frontendRollback')}
        </Button>}
      </div>
      {status?.source === 'external' && <p className="text-sm text-ui-muted">{t('frontendExternalOverride')}</p>}
    </CardBody>
  </Card>;
}
