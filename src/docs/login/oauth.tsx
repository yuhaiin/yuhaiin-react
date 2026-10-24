import { beginOAuth, providerID, providerLabel, oauthProviders, type OAuthProvider, type OAuthChoice } from '@/auth/oauth';
import { setApiUrl } from '@/common/apiurl';
import { getSession } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
export function OAuthLogin({ controller }: { controller: string }) {
    const { t } = useTranslation('auth');
    const [providers, setProviders] = useState<OAuthChoice[]>([]);
    const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
    const request = useRef<AbortController | null>(null);
    useEffect(() => {
        const load = new AbortController();
        void oauthProviders(controller, load.signal).then(providers => { if (!load.signal.aborted) setProviders(providers); }).catch(() => { if (!load.signal.aborted) setError(t('oauthUnavailable')); });
        return () => { load.abort(); request.current?.abort(); };
    }, [controller, t]);
    const signIn = async (provider: OAuthProvider) => {
        request.current = new AbortController(); setApiUrl(controller); setBusy(true); setError('');
        try { await beginOAuth(provider, false, request.current.signal); window.location.assign(getSession()?.principal.permissions.includes('connections:read') ? '#/' : '#/docs/security'); }
        catch { if (!request.current.signal.aborted) setError(t('oauthFailed')); } finally { setBusy(false); }
    };
    return <div className="space-y-3">
        {providers.map(provider => <Button key={providerID(provider)} className="w-full" disabled={busy} onClick={() => void signIn(providerID(provider))}>{t('signInOAuth', { provider: providerLabel(provider) })}</Button>)}
        {busy && <Button className="w-full" onClick={() => request.current?.abort()}>{t('cancelOAuth')}</Button>}
        {error && <p role="alert" className="text-sm text-ui-danger">{error}</p>}
    </div>;
}
