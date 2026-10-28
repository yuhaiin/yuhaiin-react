import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import type { Go } from '@/api/generated-contracts';
import { getCertificates, saveCertificate, renewCertificate, deleteCertificate, saveCertificateProvider, deleteCertificateProvider } from '@/api/certificates';
import { getGatewayConfig } from '@/api/gateway';
import { usePermission } from '@/auth/context';
import { Button } from '@/component/v2/button';
import { MainContainer } from '@/component/v2/card';
import Loading from '@/component/v2/loading';
import { errorMessage } from '@/contract/gateway';
import { CertificateForm, ProviderForm, newCertificate, newProvider } from './form';

type Confirmation = { kind: 'certificate' | 'provider'; id: string; revision: number; name: string };
const date = (value?: string) => value ? new Date(value).toLocaleString() : '—';

export default function CertificatesPage() {
  const { t } = useTranslation('certificates');
  const allowed = usePermission('certificates:read');
  const manage = usePermission('certificates:manage');
  const gatewayRead = usePermission('gateway:read');
  const { data, error, mutate, isLoading } = useSWR(allowed ? '/api/v2/certificates' : null, getCertificates, { refreshInterval: 5000 });
  const { data: gatewayConfig } = useSWR(gatewayRead ? '/api/v2/gateway/config' : null, getGatewayConfig, { revalidateOnFocus: false });
  const [editor, setEditor] = useState<{ config: Go.certificate.Config; revision: number }>();
  const [provider, setProvider] = useState<Go.certificate.DNSProvider>();
  const [confirm, setConfirm] = useState<Confirmation>();
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState('');
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 60000); return () => window.clearInterval(timer); }, []);
  const run = async (operation: () => Promise<unknown>, done?: () => void) => {
    if (pending) return;
    setPending(true); setFailure('');
    try { await operation(); done?.(); await mutate(); } catch (error) { setFailure(errorMessage(error)); } finally { setPending(false); }
  };
  if (!allowed) return <MainContainer><p role="alert">{t('permission')}</p></MainContainer>;
  if (isLoading && !data) return <Loading />;
  if (error && !data) return <Loading onRetry={() => void mutate()}>{errorMessage(error)}</Loading>;
  return <MainContainer className="max-w-screen-xl"><div className="space-y-6">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-xl font-semibold">{t('title')}</h1><p className="mt-1 text-sm text-ui-secondary">{t('description')}</p></div>
      <div className="flex flex-wrap gap-2">{manage && <Button disabled={pending} variant="primary" onClick={() => { setEditor({ config: newCertificate(), revision: 0 }); setProvider(undefined); }}>{t('create')}</Button>}<Button permission="certificates:read" variant="outline-secondary" disabled={pending} onClick={() => void mutate()}>{t('refresh')}</Button></div>
    </div>
    <p className="text-sm text-ui-secondary">{t('caSeparation')}</p>
    {(failure || error) && <p role="alert" className="break-words rounded-ui-sm border border-ui-border p-3 text-sm text-ui-danger">{failure || errorMessage(error)}</p>}
    {manage && editor && <CertificateForm key={editor.config.id} initial={editor.config} providers={data?.providers ?? []} gateways={gatewayConfig?.gateways ?? []} pending={pending} save={certificate => void run(() => saveCertificate({ certificate, revision: editor.revision }), () => setEditor(undefined))} cancel={() => setEditor(undefined)} />}
    {manage && provider && <ProviderForm key={provider.id} initial={provider} pending={pending} save={request => void run(() => saveCertificateProvider(request), () => setProvider(undefined))} cancel={() => setProvider(undefined)} />}
    {confirm && <div role="group" aria-label={t('confirmDelete')} className="space-y-3 rounded-ui border border-ui-border p-4"><p className="break-words">{t('deleteWarning', { name: confirm.name })}</p><div className="flex flex-wrap gap-2"><Button variant="primary" loading={pending} onClick={() => void run(() => confirm.kind === 'certificate' ? deleteCertificate(confirm.id, confirm.revision) : deleteCertificateProvider(confirm.id, confirm.revision), () => setConfirm(undefined))}>{t('confirmDelete')}</Button><Button variant="outline-secondary" disabled={pending} onClick={() => setConfirm(undefined)}>{t('cancel')}</Button></div></div>}
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">{(data?.certificates ?? []).map(resource => {
      const status = resource.status;
      const expiring = Boolean(status.notAfter && new Date(status.notAfter).getTime() - now < 14 * 86400000);
      return <article key={resource.config.id} className="min-w-0 space-y-4 rounded-ui border border-ui-border bg-ui-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><h2 className="break-words font-semibold">{resource.config.name}</h2><p className="break-all text-sm text-ui-secondary">{resource.config.domains.join(', ')}</p></div><span className={status.failureCode || expiring ? 'text-sm text-ui-danger' : 'text-sm text-ui-secondary'}>{t(`status_${status.state}`, { defaultValue: status.state })}</span></div>
        {(status.failureCode || expiring) && <p role="alert" className="break-words text-sm text-ui-danger">{status.failureCode ? `${t('renewalFailure')}: ${t(`failure_${status.failureCode}`, { defaultValue: status.failureCode })}` : t('expiryWarning')}</p>}
        <dl className="grid min-w-0 grid-cols-1 gap-3 text-sm sm:grid-cols-2">{[
          [t('source'), 'ACME'], [t('issuer'), status.issuer || '—'], [t('expires'), date(status.notAfter)], [t('nextAttempt'), date(status.nextAttempt)], [t('lastSuccess'), date(status.lastSuccess)], [t('autoRenew'), resource.config.autoRenew ? t('on') : t('off')],
        ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-ui-secondary">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl>
        <div className="text-sm"><h3 className="text-ui-secondary">{t('references')}</h3>{resource.references.length ? <ul className="space-y-1">{resource.references.map(ref => <li className="break-words" key={`${ref.kind}:${ref.id}`}>{t(`reference_${ref.kind}`, { defaultValue: ref.kind })} · {ref.name}</li>)}</ul> : <p>{t('unreferenced')}</p>}</div>
        {manage && <details className="rounded-ui-sm border border-ui-border p-3 text-sm"><summary className="cursor-pointer">{t('managementBinding')}</summary><p className="my-3">{t('managementBindingHelp')}</p><code className="block break-all">-https-certificate-id {resource.config.id}</code><p className="mt-3 text-ui-secondary">{t('managementBindingSafety')}</p><p className="mt-2 text-ui-secondary">{t('managementRestoredHelp')}</p></details>}
        {manage && <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline-secondary" disabled={pending} onClick={() => { setEditor({ config: structuredClone(resource.config), revision: resource.revision }); setProvider(undefined); }}>{t('edit')}</Button><Button size="sm" variant="outline-secondary" disabled={pending || status.state === 'issuing'} onClick={() => void run(() => renewCertificate(resource.config.id, resource.revision))}>{t('renew')}</Button><Button size="sm" variant="outline-secondary" disabled={pending || resource.references.length > 0} onClick={() => setConfirm({ kind: 'certificate', id: resource.config.id, revision: resource.revision, name: resource.config.name })}>{t('delete')}</Button></div>}
      </article>;
    })}</div>
    {data?.certificates.length === 0 && <p className="text-sm text-ui-secondary">{t('empty')}</p>}
    <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-semibold">{t('providers')}</h2>{manage && <Button variant="outline-secondary" disabled={pending} onClick={() => { setProvider(newProvider()); setEditor(undefined); }}>{t('addProvider')}</Button>}</div>
      {(data?.providers ?? []).map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-ui border border-ui-border p-4"><div className="min-w-0 text-sm"><h3 className="break-words font-medium">{item.name} · Cloudflare</h3><p className="break-all text-ui-secondary">{item.zoneName} · {item.hasCredential ? t('credentialConfigured') : t('credentialMissing')}</p></div>{manage && <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline-secondary" disabled={pending} onClick={() => { setProvider(item); setEditor(undefined); }}>{t('edit')}</Button><Button size="sm" variant="outline-secondary" disabled={pending} onClick={() => setConfirm({ kind: 'provider', id: item.id, revision: item.revision, name: item.name })}>{t('delete')}</Button></div>}</div>)}
    </section>
    <details className="rounded-ui border border-ui-border p-4 text-sm"><summary className="cursor-pointer">{t('events')}</summary><ul className="mt-3 space-y-2">{[...(data?.events ?? [])].reverse().map(event => <li key={event.sequence} className="break-words">{date(event.at)} · {event.code}</li>)}</ul></details>
  </div></MainContainer>;
}
