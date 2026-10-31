import { authScope } from '@/auth/session';
import { useSession } from '@/auth/context';
import { authAPI } from '@/auth/api';
import { beginOAuth, providerID, providerLabel, normalizeOAuthChoices, type OAuthLink, type OAuthProvider } from '@/auth/oauth';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
export function OAuthLinks() {
    const { t } = useTranslation('auth');
    const permissions = useSession()?.principal.permissions ?? [];
    const scope = authScope();
    const admin = permissions.includes('security:read') || permissions.includes('security:write');
    const { data: links, error, mutate } = useSWR([scope, 'auth-oauth-links'], () => authAPI<OAuthLink[]>('GET', '/oauth/links'));
    const { data: providers, error: providerError } = useSWR([scope, 'auth-oauth-providers'], async () => normalizeOAuthChoices(await authAPI<unknown>('GET', '/oauth/providers?details=1')));
    const request = useRef<AbortController | null>(null);
    useEffect(() => () => request.current?.abort(), [scope]);
    const [busy, setBusy] = useState(false); const [failure, setFailure] = useState('');
    const bind = async (provider: OAuthProvider) => {
        const controller = new AbortController(); request.current = controller; setBusy(true); setFailure('');
        try { await beginOAuth(provider, true, controller.signal); if (scope === authScope()) await mutate(); }
        catch { if (!controller.signal.aborted && scope === authScope()) setFailure(t('oauthFailed')); }
        finally { if (scope === authScope()) setBusy(false); }
    };
    const unlink = async (provider: OAuthProvider) => {
        if (!await confirmAction(t('unlinkConfirm', { provider: providerLabel(providers?.find(choice => providerID(choice) === provider) ?? provider) })) || scope !== authScope()) return;
        setBusy(true); setFailure('');
        try { await authAPI('DELETE', `/oauth/links/${provider}`); if (scope === authScope()) await mutate(); }
        catch { if (scope === authScope()) setFailure(t('requestFailed')); } finally { if (scope === authScope()) setBusy(false); }
    };
    const [previousScope,setPreviousScope] = useState(scope);
    if (previousScope !== scope) { setPreviousScope(scope); setBusy(false); setFailure(''); }
    return <Card><CardHeader><h2 className="m-0 font-medium">{t('oauthAccounts')}</h2><div className="flex flex-wrap gap-2">{admin && <a className="inline-flex min-h-11 items-center text-sm text-ui-primary underline" href="#/docs/security/admin">{t('oauthSettings')}</a>}<Button disabled={busy} onClick={() => void mutate()}>{t('refresh')}</Button></div></CardHeader><CardBody className="space-y-4">
        <p className="text-sm text-ui-muted">{t('oauthBindingHint')}</p>
        {(failure || error || providerError) && <p role="alert" className="text-sm text-ui-danger">{failure || t('requestFailed')}</p>}
        {providers?.length === 0 && <p className="text-sm text-ui-muted">{t(admin ? 'oauthConfigureFirst' : 'oauthAskAdmin')}</p>}
        {links?.length === 0 && <p className="text-sm text-ui-muted">{t('noOAuthAccounts')}</p>}
        {links?.map(link => <div key={link.provider} className="flex flex-wrap items-center justify-between gap-3 rounded-ui-md border border-ui-border p-4"><div className="min-w-0"><p>{providerLabel(providers?.find(choice => providerID(choice) === link.provider) ?? link.provider)}</p><p className="break-all text-sm text-ui-muted">{link.displayName || link.subject}</p></div><Button permission="identity:read" variant="outline-danger" disabled={busy} onClick={() => void unlink(link.provider)}>{t('unlink')}</Button></div>)}
        <div className="flex flex-wrap gap-2">{links && providers?.filter(provider => !links.some(link => link.provider === providerID(provider))).map(provider => <Button key={providerID(provider)} disabled={busy} onClick={() => void bind(providerID(provider))}>{t('bindOAuth', { provider: providerLabel(provider) })}</Button>)}</div>
        {busy && <Button onClick={() => request.current?.abort()}>{t('cancelOAuth')}</Button>}
    </CardBody></Card>;
}
