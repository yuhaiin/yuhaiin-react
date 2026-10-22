import { authAPI, logout, type Issued } from '@/auth/api';
import { useSession } from '@/auth/context';
import { clearSession, setPendingEnrollment } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, MainContainer } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Sessions } from './sessions';
import { OAuthLinks } from './oauth-links';
import { OAuthSettingsPanel } from './oauth-settings';
import { Tokens } from './tokens';
import { Users } from './users';
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
        {session.principal.credentialType === 'session' && <><Sessions /><OAuthLinks />{permissions.includes('users:manage') && <OAuthSettingsPanel />}</>}
        {permissions.includes('users:manage') && <Users />}
        {permissions.includes('tokens:own') && <Tokens />}
        {permissions.includes('security:read') && <SecurityEvents />}
    </MainContainer>;
}
function SecurityEvents() {
    const { t } = useTranslation('auth');
    const { data, error, mutate } = useSWR('auth-events', () => authAPI<Array<{ id: number; occurredAt: number; event: string; actorId: string; subjectId: string }>>('GET', '/events'));
    return <Card><CardHeader><h2 className="font-medium">{t('securityEvents')}</h2><Button onClick={() => void mutate()}>{t('refresh')}</Button></CardHeader><CardBody>
        {error && <p role="alert">{t('requestFailed')}</p>}
        <ul className="space-y-3">{data?.slice(0, 30).map(event => <li key={event.id} className="break-all text-sm"><span>{event.event}</span><span className="ml-3 text-xs text-ui-muted">{new Date(event.occurredAt * 1000).toLocaleString()}</span><p className="text-xs text-ui-muted">{event.actorId} → {event.subjectId}</p></li>)}</ul>
    </CardBody></Card>;
}
