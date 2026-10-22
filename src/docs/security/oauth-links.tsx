import { authAPI } from '@/auth/api';
import { beginOAuth, oauthNames, type OAuthLink, type OAuthProvider } from '@/auth/oauth';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
export function OAuthLinks() {
    const { t } = useTranslation('auth');
    const { data: links, error, mutate } = useSWR('auth-oauth-links', () => authAPI<OAuthLink[]>('GET', '/oauth/links'));
    const { data: providers, error: providerError } = useSWR('auth-oauth-providers', () => authAPI<OAuthProvider[]>('GET', '/oauth/providers'));
    const request = useRef<AbortController | null>(null);
    useEffect(() => () => request.current?.abort(), []);
    const [busy, setBusy] = useState(false); const [failure, setFailure] = useState('');
    const bind = async (provider: OAuthProvider) => {
        request.current = new AbortController(); setBusy(true); setFailure('');
        try { await beginOAuth(provider, true, request.current.signal); await mutate(); }
        catch { if (!request.current.signal.aborted) setFailure(t('oauthFailed')); } finally { setBusy(false); }
    };
    const unlink = async (provider: OAuthProvider) => {
        if (!await confirmAction(t('unlinkConfirm', { provider: oauthNames[provider] }))) return;
        setBusy(true); setFailure('');
        try { await authAPI('DELETE', `/oauth/links/${provider}`); await mutate(); }
        catch { setFailure(t('requestFailed')); } finally { setBusy(false); }
    };
    return <Card><CardHeader><h2 className="font-medium">{t('oauthAccounts')}</h2><Button disabled={busy} onClick={() => void mutate()}>{t('refresh')}</Button></CardHeader><CardBody className="space-y-4">
        <p className="text-sm text-ui-muted">{t('oauthBindingHint')}</p>
        {(failure || error || providerError) && <p role="alert" className="text-sm text-ui-danger">{failure || t('requestFailed')}</p>}
        {links?.length === 0 && <p className="text-sm text-ui-muted">{t('noOAuthAccounts')}</p>}
        {links?.map(link => <div key={link.provider} className="flex flex-wrap items-center justify-between gap-3 rounded-ui-md border border-ui-border p-4"><div className="min-w-0"><p>{oauthNames[link.provider]}</p><p className="break-all text-sm text-ui-muted">{link.displayName || link.subject}</p></div><Button permission="identity:read" variant="outline-danger" disabled={busy} onClick={() => void unlink(link.provider)}>{t('unlink')}</Button></div>)}
        <div className="flex flex-wrap gap-2">{links && providers?.filter(provider => !links.some(link => link.provider === provider)).map(provider => <Button key={provider} disabled={busy} onClick={() => void bind(provider)}>{t('bindOAuth', { provider: oauthNames[provider] })}</Button>)}</div>
        {busy && <Button onClick={() => request.current?.abort()}>{t('cancelOAuth')}</Button>}
    </CardBody></Card>;
}
