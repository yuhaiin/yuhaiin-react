import { grantActive, oauthServer, type OAuthGrant } from '@/auth/oauth-server';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

export function GrantStatus({ grant }: { grant: OAuthGrant }) {
    const { t } = useTranslation('auth');
    if (grant.revoked) return <Badge variant="muted">{t('oauthServer.status.revoked')}{grant.revokedReason ? ` · ${t(`oauthServer.reason.${grant.revokedReason}`, { defaultValue: grant.revokedReason })}` : ''}</Badge>;
    if (!grantActive(grant)) return <Badge variant="muted">{t('oauthServer.status.expired')}</Badge>;
    return <Badge variant="success">{t('oauthServer.status.active')}</Badge>;
}

export function ScopeList({ scopes }: { scopes: string[] }) {
    return <ul className="flex flex-wrap gap-1.5">{scopes.map(scope => <li key={scope}><code className="rounded-ui-xs bg-ui-chip px-1.5 py-0.5 text-xs text-ui-chip-fg">{scope}</code></li>)}</ul>;
}

/** Applications the signed-in user has authorized through the Yuhaiin Authorization Server. */
export function AuthorizedApplications() {
    const { t } = useTranslation('auth');
    const { data, error: loadError, mutate } = useSWR('oauth-own-grants', () => oauthServer.grants());
    const [busy, setBusy] = useState(false); const [error, setError] = useState('');
    const [showInactive, setShowInactive] = useState(false);
    const revoke = async (grant: OAuthGrant) => {
        if (!await confirmAction(t('oauthServer.revokeConfirm', { name: grant.clientName }))) return;
        setBusy(true); setError('');
        try { await oauthServer.revokeGrant(grant.id); await mutate(); } catch { setError(t('requestFailed')); } finally { setBusy(false); }
    };
    const date = (value: number) => value ? new Date(value * 1000).toLocaleString() : t('oauthServer.never');
    const items = (data ?? []).filter(grant => showInactive || grantActive(grant));
    const inactive = (data ?? []).filter(grant => !grantActive(grant)).length;
    return <Card><CardHeader><h2 className="m-0 font-medium">{t('oauthServer.authorizedApps')}</h2><Button disabled={busy} onClick={() => void mutate()}>{t('refresh')}</Button></CardHeader><CardBody className="space-y-3">
        <p className="text-sm text-ui-muted">{t('oauthServer.authorizedAppsHint')}</p>
        {(error || loadError) && <p role="alert" className="text-sm text-ui-danger">{error || t('requestFailed')}</p>}
        {data && items.length === 0 && <p className="text-sm text-ui-muted">{t('oauthServer.noAuthorizedApps')}</p>}
        {items.map(grant => <section key={grant.id} className="space-y-2 rounded-ui-md border border-ui-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1"><p className="m-0 break-words font-medium">{grant.clientName}</p><p className="m-0 break-all text-xs text-ui-muted">{grant.resource}</p></div>
                <GrantStatus grant={grant} />
            </div>
            <ScopeList scopes={grant.scopes} />
            <dl className="grid gap-2 text-xs text-ui-muted sm:grid-cols-3"><div><dt>{t('oauthServer.authorizedAt')}</dt><dd>{date(grant.createdAt)}</dd></div><div><dt>{t('lastActive')}</dt><dd>{date(grant.lastUsedAt)}</dd></div><div><dt>{t('expires')}</dt><dd>{date(grant.expiresAt)}</dd></div></dl>
            {grantActive(grant) && <Button permission="identity:read" variant="outline-danger" disabled={busy} onClick={() => void revoke(grant)}>{t('oauthServer.revokeAccess')}</Button>}
        </section>)}
        {inactive > 0 && <Button variant="ghost" onClick={() => setShowInactive(value => !value)}>{t(showInactive ? 'oauthServer.hideInactive' : 'oauthServer.showInactive', { count: inactive })}</Button>}
    </CardBody></Card>;
}
