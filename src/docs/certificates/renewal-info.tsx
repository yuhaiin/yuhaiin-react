import { useTranslation } from 'react-i18next';
import type { Go } from '@/api/generated-contracts';

const date = (value?: string) => value ? new Date(value).toLocaleString() : '—';
const safeExplanation = (value?: string) => {
  if (!value) return undefined;
  try { const parsed = new URL(value); return parsed.protocol === 'https:' && !parsed.username && !parsed.password ? value : undefined; }
  catch { return undefined; }
};

export function RenewalInfoDetails({ info }: { info?: Go.certificate.RenewalInfoStatus }) {
  const { t } = useTranslation('certificates');
  if (!info) return null;
  const explanation = safeExplanation(info.explanationUrl);
  return <details className="rounded-ui-sm border border-ui-border p-3 text-sm">
    <summary className="cursor-pointer">{t('renewalAdvice')}</summary>
    <p className={`my-3 ${info.state === 'unavailable' ? 'text-ui-danger' : 'text-ui-secondary'}`}>{t(`ari_${info.state}`, { defaultValue: t('ari_unknown') })}</p>
    <dl className="grid min-w-0 gap-3 sm:grid-cols-2">{[
      [t('ariChecked'), date(info.checkedAt)], [t('ariNextCheck'), date(info.nextCheck)],
      [t('ariWindowStart'), date(info.windowStart)], [t('ariWindowEnd'), date(info.windowEnd)],
      [t('ariFailures'), String(info.failures ?? 0)],
    ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-ui-secondary">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl>
    {explanation && <a className="mt-3 inline-block break-all text-ui-primary underline" href={explanation} target="_blank" rel="noopener noreferrer">{t('ariExplanation')}</a>}
  </details>;
}
