import { StageChangeButton } from "@/component/configuration-change";
import { authAPI } from '@/auth/api';
import { useSession } from '@/auth/context';
import { authScope } from '@/auth/session';
import { providerLabel, type OAuthProvider, type OAuthSettings } from '@/auth/oauth';
import { apiURL } from '@/auth/transport';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { Input } from '@/component/v2/input';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { useSWRConfig } from 'swr';

export function OAuthSettingsPanel({ embedded = false, onConfigured }: { embedded?: boolean; onConfigured?: (ready: boolean) => void } = {}) {
    const { t } = useTranslation('auth');
    const session = useSession(); const scope = authScope();
    const writable = session?.principal.permissions.includes('security:write') ?? false;
    const { data, error, mutate } = useSWR([scope, 'auth-oauth-settings'], () => authAPI<OAuthSettings[]>('GET', '/oauth/settings'), { revalidateOnFocus: false, revalidateOnReconnect: false });
    const { mutate: refresh } = useSWRConfig();
    const active = useRef(true);
    useEffect(() => { active.current = true; return () => { active.current = false; }; }, [scope]);
    const [creating, setCreating] = useState<OAuthProvider>();
    const updated = async () => { if (scope !== authScope()) return; await mutate(); await refresh(key => key === 'auth-oauth-providers' || Array.isArray(key) && key.includes('auth-oauth-providers')); };
    const configured = async (ready: boolean, signal?: AbortSignal) => { if (!active.current || signal?.aborted || scope !== authScope()) return; await updated(); if (scope === authScope() && active.current) { setCreating(undefined); onConfigured?.(ready); } };
    const content = <div className="space-y-5">
        <p className="text-sm text-ui-muted">{t('oauthSetupHint')}</p>
        <p className="text-sm text-ui-muted">{t('oidc.localRecovery')}</p>
        {error && <p role="alert" className="text-sm text-ui-danger">{t('requestFailed')}</p>}
        {data && [...new Set<OAuthProvider>(['github', 'google', ...data.map(item => item.provider)])].map(provider => {
            const settings = data.find(item => item.provider === provider);
            return <ProviderSettings key={JSON.stringify([scope, provider, settings])} provider={provider} settings={settings} updated={updated} configured={configured} />;
        })}
        {writable && !creating && <Button onClick={() => setCreating(`oidc-${crypto.randomUUID()}`)}>{t('oidc.add')}</Button>}
        {creating && <ProviderSettings key={JSON.stringify([scope,creating])} provider={creating} creating updated={updated} configured={configured} cancel={() => setCreating(undefined)} />}
    </div>;
    return embedded ? content : <Card><CardHeader><h2 className="font-medium">{t('oauthSettings')}</h2></CardHeader><CardBody>{content}</CardBody></Card>;
}

function ProviderSettings({ provider, settings, creating, updated, configured, cancel }: { provider: OAuthProvider; settings?: OAuthSettings; creating?: boolean; updated: () => Promise<void>; configured: (ready: boolean, signal?: AbortSignal) => Promise<void>; cancel?: () => void }) {
    const { t } = useTranslation('auth'); const scope = authScope();
    const permissions = useSession()?.principal.permissions ?? [];
    const writable = permissions.includes('security:write'); const manageSecret = permissions.includes('secrets:manage');
    const generic = provider.startsWith('oidc-');
    const [name,setName] = useState(settings?.name || '');
    const [issuer,setIssuer] = useState(settings?.issuer || '');
    const [enabled,setEnabled] = useState(settings?.enabled ?? true);
    const [clientId, setClientId] = useState(settings?.clientId || '');
    const [secret, setSecret] = useState(''); const [clearSecret,setClearSecret] = useState(false);
    const [redirectUrl, setRedirectUrl] = useState(settings?.redirectUrl || apiURL(`/api/v2/auth/oauth/${provider}/callback`).href);
    const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [saved, setSaved] = useState(false);
    const [status,setStatus] = useState<{ enabled: boolean; ready: boolean }>();
    const request = useRef<AbortController | undefined>(undefined);
    useEffect(() => () => request.current?.abort(), [scope]);
    const beginRequest = () => { request.current?.abort(); const next = new AbortController(); request.current = next; return next; };
    const label = providerLabel({ provider, name: settings?.name || name });
    const save = async (event: FormEvent) => {
        event.preventDefault(); if (!writable || busy || scope !== authScope() || (secret || clearSecret) && !manageSecret) return;
        const controller = beginRequest();
        setBusy(true); setError(''); setSaved(false);
        try {
            const body = { provider, clientId, clientSecret: clearSecret ? '' : secret, redirectUrl, revision: settings?.revision ?? 0, enabled, ...(generic ? { issuer, name, clearSecret } : {}) };
            await authAPI(creating ? 'POST' : 'PUT', creating ? '/oidc/settings' : `/oauth/settings/${provider}`, body, controller.signal);
            if (scope !== authScope() || controller.signal.aborted) return;
            if (request.current === controller) request.current = undefined;
            setSecret(''); setClearSecret(false); setSaved(true); await configured(enabled, controller.signal);
        } catch (error) { if (scope === authScope() && !controller.signal.aborted) setError(t((error as { code?: number }).code === 409 ? 'oidc.conflict' : 'requestFailed')); }
        finally { if (scope === authScope() && !controller.signal.aborted) setBusy(false); }
    };
    const disable = async () => {
        if (!writable || busy || !await confirmAction(t('disableOAuthConfirm', { provider: label })) || scope !== authScope()) return;
        const controller = beginRequest();
        setBusy(true); setError('');
        try { await authAPI('DELETE', `/oauth/settings/${provider}`, undefined, controller.signal); if (scope !== authScope() || controller.signal.aborted) return; setSecret(''); await updated(); }
        catch { if (scope === authScope() && !controller.signal.aborted) setError(t('requestFailed')); } finally { if (scope === authScope() && !controller.signal.aborted) setBusy(false); }
    };
    const check = async () => {
        if (busy || scope !== authScope()) return; const controller = beginRequest(); setBusy(true); setError('');
        try { const next = await authAPI<{enabled:boolean;ready:boolean}>('GET',`/oauth/settings/${provider}/status`, undefined, controller.signal); if (scope === authScope() && !controller.signal.aborted) setStatus(next); }
        catch { if (scope === authScope() && !controller.signal.aborted) setError(t('requestFailed')); } finally { if (scope === authScope() && !controller.signal.aborted) setBusy(false); }
    };
    return <form onSubmit={event => void save(event)} className="space-y-4 rounded-ui-md border border-ui-border p-4" aria-label={label} autoComplete="off">
        <h3 className="font-medium">{label}</h3>
        {generic && <>
            <label className="block space-y-2"><span>{t('oidc.name')}</span><Input required maxLength={128} disabled={!writable || busy} value={name} onChange={event => setName(event.target.value)} /></label>
            <label className="block space-y-2"><span>{t('oidc.issuer')}</span><Input type="url" required maxLength={2048} readOnly={Boolean(settings)} disabled={!writable || busy} value={issuer} placeholder="https://login.example.com/realms/company" onChange={event => setIssuer(event.target.value)} /></label>
            <p className="text-xs text-ui-muted">{t('oidc.binding')}</p>
        </>}
        <label className="block space-y-2"><span>{t('oauthClientId')}</span><Input required maxLength={512} disabled={!writable || busy} value={clientId} onChange={event => setClientId(event.target.value)} /></label>
        <label className="block space-y-2"><span>{t('oauthClientSecret')}</span><Input type="password" required={!generic && !settings?.secretConfigured} maxLength={2048} autoComplete="off" disabled={!writable || !manageSecret || busy || clearSecret} value={secret} onChange={event => setSecret(event.target.value)} placeholder={settings?.secretConfigured ? t('oauthKeepSecret') : ''} /></label>
        {generic && settings?.secretConfigured && manageSecret && <label className="flex items-center gap-2"><input type="checkbox" disabled={!writable || busy} checked={clearSecret} onChange={event => setClearSecret(event.target.checked)} />{t('oidc.publicClient')}</label>}
        <label className="block space-y-2"><span>{t('oauthRedirectUrl')}</span><Input type="url" required maxLength={2048} disabled={!writable || busy} value={redirectUrl} onChange={event => setRedirectUrl(event.target.value)} /></label>
        {generic && <label className="flex items-center gap-2"><input type="checkbox" disabled={!writable || busy} checked={enabled} onChange={event => setEnabled(event.target.checked)} />{t('oidc.enabled')}</label>}
        <div className="flex flex-wrap gap-2">
            {writable && <><Button type="submit" variant="primary" permission="security:write" loading={busy}>{t('save')}</Button><StageChangeButton disabled={busy} request={{ store: "identity", kind: "oidc-provider", resourceId: provider, payload: { provider, clientId, clientSecret: clearSecret ? "" : secret, redirectUrl, revision: settings?.revision ?? 0, enabled, ...(generic ? { issuer, name, clearSecret } : {}) } }} onCommitted={async () => { setSecret(""); setClearSecret(false); await updated(); }} /></>}
            {settings && <><Button disabled={busy} onClick={() => void check()}>{t('oidc.check')}</Button>{writable && <Button permission="security:write" variant="outline-danger" disabled={busy} onClick={() => void disable()}>{t('disableOAuth')}</Button>}</>}
            {cancel && <Button disabled={busy} onClick={cancel}>{t('cancel')}</Button>}
        </div>
        {status && <p role="status">{t(!status.enabled ? 'oidc.disabled' : status.ready ? 'oidc.available' : 'oidc.unavailable')}</p>}
        {error && <div><p role="alert" className="text-sm text-ui-danger">{error}</p><Button disabled={busy} onClick={async () => { if (await confirmAction(t('common:form.discardChanges')) && scope === authScope()) await updated(); }}>{t('refresh')}</Button></div>}{saved && <p role="status">{t('oauthSaved')}</p>}
    </form>;
}
