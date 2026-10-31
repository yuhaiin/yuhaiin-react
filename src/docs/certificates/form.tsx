import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { Go } from '@/api/generated-contracts';
import { Button } from '@/component/v2/button';
import { Input, Textarea } from '@/component/v2/input';
import { Select } from '@/component/v2/select';
import Switch from '@/component/v2/switch';
import { createID } from '@/common/id';
import { Field, TextField } from '@/docs/gateway/fields';

export const staging = 'https://acme-staging-v02.api.letsencrypt.org/directory';
export const production = 'https://acme-v02.api.letsencrypt.org/directory';
export const newCertificate = (): Go.certificate.Config => ({ id: createID(), name: '', domains: [], directoryUrl: staging, email: '', termsAccepted: false, challenge: { type: 'dns-01', dnsProviderId: '' }, autoRenew: true });
export const newProvider = (): Go.certificate.DNSProvider => ({ id: createID(), name: '', type: 'cloudflare', zoneId: '', zoneName: '', revision: 0, hasCredential: false });

export function CertificateForm({ initial, providers, gateways, pending, save, cancel }: {
  initial: Go.certificate.Config; providers: Go.certificate.DNSProvider[]; gateways: Go.gateway.Gateway[]; pending: boolean;
  save: (certificate: Go.certificate.Config) => void; cancel: () => void;
}) {
  const { t } = useTranslation('certificates');
  const [draft, setDraft] = useState(initial);
  const [domains, setDomains] = useState(initial.domains.join(', '));
  const submit = (event: FormEvent) => { event.preventDefault(); save({ ...draft, domains: domains.split(/[\s,]+/).filter(Boolean) }); };
  const authority = draft.directoryUrl === staging ? 'staging' : draft.directoryUrl === production ? 'production' : 'custom';
  return <form onSubmit={submit} className="space-y-4 rounded-ui border border-ui-border bg-ui-surface p-4 sm:p-6" aria-label={t('certificateForm')}>
    <fieldset disabled={pending} className="min-w-0 space-y-4">
      <h2 className="text-lg font-semibold">{t('certificateForm')}</h2>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <TextField label={t('name')} value={draft.name} onChange={name => setDraft({ ...draft, name })} />
        <TextField label={t('email')} type="email" value={draft.email} onChange={email => setDraft({ ...draft, email })} />
      </div>
      <label className="block space-y-1 text-sm"><span>{t('domains')}</span><Input required value={domains} onChange={e => setDomains(e.target.value)} /></label>
      <Field label={t('authority')}><Select ariaLabel={t('authority')} value={authority} items={['staging', 'production', 'custom'].map(value => ({ value, label: t(value) }))} onValueChange={value => setDraft({ ...draft, directoryUrl: value === 'staging' ? staging : value === 'production' ? production : 'https://' })} /></Field>
      {authority === 'custom' && <TextField label={t('directory')} value={draft.directoryUrl} onChange={directoryUrl => setDraft({ ...draft, directoryUrl })} />}
      <p className="text-sm text-ui-secondary">{t('stagingHelp')}</p>
      <Field label={t('challenge')}><Select ariaLabel={t('challenge')} value={draft.challenge.type} items={[{ value: 'http-01', label: 'HTTP-01' }, { value: 'dns-01', label: 'DNS-01' }]} onValueChange={type => setDraft({ ...draft, challenge: type === 'http-01' ? { type, httpGatewayId: '' } : { type, dnsProviderId: '' } })} /></Field>
      {draft.challenge.type === 'dns-01' ? <>
        <Field label={t('provider')}><Select ariaLabel={t('provider')} value={draft.challenge.dnsProviderId ?? ''} items={[{ value: '', label: t('choose') }, ...providers.map(p => ({ value: p.id, label: `${p.name} · ${p.zoneName}${p.hasCredential ? '' : ` · ${t('credentialMissing')}`}` }))]} onValueChange={dnsProviderId => setDraft({ ...draft, challenge: { type: 'dns-01', dnsProviderId } })} /></Field>
        <p className="text-sm text-ui-secondary">{t('dnsHelp')}</p>
      </> : <>
        <Field label={t('httpGateway')}><Select ariaLabel={t('httpGateway')} value={draft.challenge.httpGatewayId ?? ''} items={[{ value: '', label: t('choose') }, ...gateways.filter(g => g.enabled && g.acmeHttp01 && g.tlsMode !== 'termination' && g.listen.endsWith(':80')).map(g => ({ value: g.id, label: g.name }))]} onValueChange={httpGatewayId => setDraft({ ...draft, challenge: { type: 'http-01', httpGatewayId } })} /></Field>
        <p className="text-sm text-ui-secondary">{t('httpHelp')} <a href="#/docs/gateway" className="text-ui-primary underline">{t('gatewayLink')}</a></p>
      </>}
      <Switch label={t('autoRenew')} checked={draft.autoRenew} onCheckedChange={autoRenew => setDraft({ ...draft, autoRenew })} />
      <Switch label={t('terms')} checked={draft.termsAccepted} onCheckedChange={termsAccepted => setDraft({ ...draft, termsAccepted })} />
      <details className="text-sm"><summary className="cursor-pointer text-ui-secondary">{t('privateTrust')}</summary><p className="my-2 text-ui-secondary">{t('privateTrustHelp')}</p><Textarea aria-label={t('privateTrust')} rows={4} value={draft.trustPem ?? ''} onChange={e => setDraft({ ...draft, trustPem: e.target.value })} /></details>
      <p className="text-sm text-ui-secondary">{t('identityEditHelp')}</p>
      <div className="flex flex-wrap gap-2"><Button type="submit" variant="primary" loading={pending} disabled={!draft.termsAccepted}>{t('save')}</Button><Button type="button" variant="outline-secondary" onClick={cancel}>{t('cancel')}</Button></div>
    </fieldset>
  </form>;
}

export function ProviderForm({ initial, pending, save, cancel }: { initial: Go.certificate.DNSProvider; pending: boolean; save: (request: Go.certificate.ProviderWrite) => void; cancel: () => void }) {
  const { t } = useTranslation('certificates');
  const [provider, setProvider] = useState(initial);
  const [token, setToken] = useState('');
  return <form aria-label={t('providerForm')} onSubmit={event => { event.preventDefault(); save({ provider, token }); }} className="space-y-4 rounded-ui border border-ui-border bg-ui-surface p-4 sm:p-6">
    <fieldset disabled={pending} className="min-w-0 space-y-4">
      <h2 className="text-lg font-semibold">{t('providerForm')}</h2>
      <TextField label={t('name')} value={provider.name} onChange={name => setProvider({ ...provider, name })} />
      <div className="grid gap-4 sm:grid-cols-2"><TextField label={t('zoneName')} value={provider.zoneName} onChange={zoneName => setProvider({ ...provider, zoneName })} /><TextField label={t('zoneId')} value={provider.zoneId} onChange={zoneId => setProvider({ ...provider, zoneId })} /></div>
      <label className="block space-y-1 text-sm"><span>{t('token')}</span><Input type="password" autoComplete="new-password" required={!provider.hasCredential} value={token} onChange={event => setToken(event.target.value)} /></label>
      <p className="text-sm text-ui-secondary">{t('tokenHelp')} {provider.hasCredential && t('keepToken')}</p>
      <div className="flex flex-wrap gap-2"><Button type="submit" variant="primary" loading={pending}>{t('save')}</Button><Button type="button" variant="outline-secondary" onClick={cancel}>{t('cancel')}</Button></div>
    </fieldset>
  </form>;
}
