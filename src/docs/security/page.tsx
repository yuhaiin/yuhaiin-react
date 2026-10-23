import { authAPI, logout, type Issued } from '@/auth/api';
import { useSession } from '@/auth/context';
import { clearSession, setPendingEnrollment } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, MainContainer } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { Input } from '@/component/v2/input';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Sessions } from './sessions';
import { OAuthLinks } from './oauth-links';
import { Tokens } from './tokens';
import { Users } from './users';
import { ProxyCredentials, UpstreamCredentials } from './proxy-credentials';
import { UserUsage } from './usage';
export default function SecurityPage() {
    const { t } = useTranslation('auth'); const session = useSession();
    const [busy, setBusy] = useState(false); const [error, setError] = useState('');
    if (!session) return null;
    const permissions = session.principal.permissions;
    const changePassword = async () => {
        if (!await confirmAction(t('passwordChangeConfirm'))) return;
        setBusy(true); setError('');
        try { const issued = await authAPI<Issued>('POST', '/password/enrollment', {}); setPendingEnrollment(issued.secret); clearSession(); }
        catch { setError(t('requestFailed')); } finally { setBusy(false); }
    };
    return <MainContainer>
        <Card><CardHeader><h1 className="text-lg font-medium">{t('accountSecurity')}</h1></CardHeader><CardBody className="space-y-4">
            <p className="break-all text-sm text-ui-muted">{session.principal.userId}</p>
            <p className="text-sm text-ui-muted">{t('sessionExpires')}: {new Date(session.expiresAt * 1000).toLocaleString()}</p>
            <div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={() => void changePassword()}>{t('changePassword')}</Button><Button disabled={busy} onClick={() => { setBusy(true); void logout().catch(() => { setError(t('requestFailed')); setBusy(false); }); }}>{t('signOut')}</Button></div>
            {error && <p role="alert" className="text-sm text-ui-danger">{error}</p>}
        </CardBody></Card>
        {session.principal.credentialType === 'session' && <><Sessions /><OAuthLinks /></>}
        {permissions.includes('usage:own') && <UserUsage />}
        {permissions.includes('users:manage') && <Users />}
        {permissions.includes('tokens:own') && <Tokens />}
        {permissions.includes('proxy-credentials:own') && <ProxyCredentials />}
        {permissions.includes('upstream-credentials:manage') && <UpstreamCredentials />}
        {permissions.includes('security:read') && <SecurityEvents />}
    </MainContainer>;
}
function SecurityEvents() {
    const { t } = useTranslation('auth');
    const [query, setQuery] = useState(''); const [limit, setLimit] = useState(30);
    const { data, error, mutate } = useSWR('auth-events', () => authAPI<Array<{ id: number; occurredAt: number; event: string; actorId: string; subjectId: string; source?: string; method?: string; path?: string; credentialId?: string; result?: string; changes?: string }>>('GET', '/events'));
    const events = data?.filter(event => [event.event, event.actorId, event.subjectId, event.source].some(value => value?.toLowerCase().includes(query.toLowerCase()))) ?? [];
    return <Card><CardHeader><h2 className="font-medium">{t('securityEvents')}</h2><Button onClick={() => void mutate()}>{t('refresh')}</Button></CardHeader><CardBody>
        {error && <p role="alert">{t('requestFailed')}</p>}
        <Input aria-label={t('usage.auditSearch')} value={query} maxLength={256} onChange={event => { setQuery(event.target.value); setLimit(30); }} />
        <ul className="mt-4 space-y-3">{events.slice(0, limit).map(event => <li key={event.id} className="break-all text-sm"><details><summary className="cursor-pointer"><span>{event.event}</span><span className="ml-3 text-xs text-ui-muted">{new Date(event.occurredAt * 1000).toLocaleString()}</span><p className="text-xs text-ui-muted">{event.actorId} → {event.subjectId}</p></summary><div className="mt-2 space-y-2 text-xs text-ui-muted">{event.source && <p>{t('usage.source')}: {event.source}</p>}{event.method && <p>{event.method} {event.path}</p>}{event.result && <p>{t('usage.result')}: {event.result}</p>}{event.credentialId && <p>{t('usage.credential')}: {event.credentialId}</p>}{event.changes && <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all">{event.changes}</pre>}</div></details></li>)}</ul>
        {events.length > limit && <Button onClick={() => setLimit(limit + 30)}>{t('usage.moreEvents')}</Button>}
    </CardBody></Card>;
}
