import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { getCertificates } from '@/api/certificates';
import { usePermission } from '@/auth/context';
import Switch from '@/component/v2/switch';

export function CertificatePicker({ ids, change }: { ids: string[]; change: (ids: string[]) => void }) {
  const { t } = useTranslation('certificates');
  const allowed = usePermission('certificates:read');
  const { data, error } = useSWR(allowed ? '/api/v2/certificates' : null, getCertificates);
  return <div className="min-w-0 space-y-2 text-sm"><p className="text-ui-secondary">{t('referenceHelp')}</p>
    {error && <p role="alert" className="text-ui-danger">{t('unavailable')}</p>}
    {(data?.certificates ?? []).map(c => <Switch key={c.config.id} label={`${c.config.name} · ${c.config.domains.join(', ')}`} disabled={!ids.includes(c.config.id) && ids.length >= 32} checked={ids.includes(c.config.id)} onCheckedChange={checked => change(checked ? [...ids, c.config.id] : ids.filter(id => id !== c.config.id))} />)}
    <a href="#/docs/certificates" className="text-ui-primary underline">{t('title')}</a>
  </div>;
}
