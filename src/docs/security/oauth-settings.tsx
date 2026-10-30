import { authAPI } from '@/auth/api';
import { oauthNames, type OAuthProvider, type OAuthSettings } from '@/auth/oauth';
import { apiURL } from '@/auth/transport';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { Input } from '@/component/v2/input';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { useSWRConfig } from 'swr';
export function OAuthSettingsPanel({ embedded = false, onConfigured }: { embedded?: boolean; onConfigured?: () => void } = {}) {
    const { t } = useTranslation('auth');
    const { data, error, mutate } = useSWR('auth-oauth-settings', () => authAPI<OAuthSettings[]>('GET', '/oauth/settings'));
    const { mutate: refresh } = useSWRConfig();
    const updated = async () => { await mutate(); await refresh('auth-oauth-providers'); };
    const configured = async () => { await updated(); onConfigured?.(); };
    const content = <div className="space-y-5">
        <p className="text-sm text-ui-muted">{t('oauthSetupHint')}</p>
        {error && <p role="alert" className="text-sm text-ui-danger">{t('requestFailed')}</p>}
        {data && (['github', 'google'] as const).map(provider => {
            const settings = data.find(item => item.provider === provider);
            return <ProviderSettings key={JSON.stringify([provider, settings])} provider={provider} settings={settings} updated={updated} configured={configured} />;
        })}
    </div>;
    return embedded ? content : <Card><CardHeader><h2 className="m-0 font-medium">{t('oauthSettings')}</h2></CardHeader><CardBody>{content}</CardBody></Card>;
}
function ProviderSettings({ provider, settings, updated, configured }: { provider: OAuthProvider; settings?: OAuthSettings; updated: () => Promise<void>; configured: () => Promise<void> }) {
    const { t } = useTranslation('auth');
    const [clientId, setClientId] = useState(settings?.clientId || '');
    const [secret, setSecret] = useState('');
    const [redirectUrl, setRedirectUrl] = useState(settings?.redirectUrl || apiURL(`/api/v2/auth/oauth/${provider}/callback`).href);
    const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [saved, setSaved] = useState(false);
    const save = async (event: FormEvent) => {
        event.preventDefault(); setBusy(true); setError(''); setSaved(false);
        try { await authAPI('PUT', `/oauth/settings/${provider}`, { clientId, clientSecret: secret, redirectUrl }); setSecret(''); setSaved(true); await configured(); }
        catch { setError(t('requestFailed')); } finally { setBusy(false); }
    };
    const disable = async () => {
        if (!await confirmAction(t('disableOAuthConfirm', { provider: oauthNames[provider] }))) return;
        setBusy(true); setError('');
        try { await authAPI('DELETE', `/oauth/settings/${provider}`); setSecret(''); await updated(); }
        catch { setError(t('requestFailed')); } finally { setBusy(false); }
    };
    return <form onSubmit={event => void save(event)} className="space-y-4 rounded-ui-md border border-ui-border p-4" aria-label={oauthNames[provider]} autoComplete="off">
        <h3 className="m-0 font-medium">{oauthNames[provider]}</h3>
        <label className="block space-y-2"><span>{t('oauthClientId')}</span><Input required maxLength={512} disabled={busy} value={clientId} onChange={event => setClientId(event.target.value)} /></label>
        <label className="block space-y-2"><span>{t('oauthClientSecret')}</span><Input type="password" required={!settings?.secretConfigured} maxLength={2048} autoComplete="off" disabled={busy} value={secret} onChange={event => setSecret(event.target.value)} placeholder={settings?.secretConfigured ? t('oauthKeepSecret') : ''} /></label>
        <label className="block space-y-2"><span>{t('oauthRedirectUrl')}</span><Input type="url" required maxLength={2048} disabled={busy} value={redirectUrl} onChange={event => setRedirectUrl(event.target.value)} /></label>
        <div className="flex flex-wrap gap-2"><Button type="submit" variant="primary" permission="users:manage" loading={busy}>{t('save')}</Button>{settings && <Button permission="users:manage" variant="outline-danger" disabled={busy} onClick={() => void disable()}>{t('disableOAuth')}</Button>}</div>
        {error && <p role="alert" className="text-sm text-ui-danger">{error}</p>}{saved && <p role="status">{t('oauthSaved')}</p>}
    </form>;
}
