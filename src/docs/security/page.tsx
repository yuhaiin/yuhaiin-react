import { authAPI, logout, type Issued } from '@/auth/api';
import { useSession } from '@/auth/context';
import { clearSession, setPendingEnrollment } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, MainContainer } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SecurityEvents } from './security-events';
import { Sessions } from './sessions';
import { OAuthLinks } from './oauth-links';
import { Tokens } from './tokens';
import { Users } from './users';
import { Groups } from './groups';
import { EffectivePermissions, ManagementRoles } from './roles';
import { TrafficAccess } from './traffic-access';
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
        <EffectivePermissions /><ManagementRoles />
        {permissions.includes('usage:own') && <UserUsage />}
        {permissions.includes('users:manage') && <><Users /><Groups /></>}
        {permissions.includes('traffic-access:read') && <TrafficAccess writable={permissions.includes('traffic-access:write')} />}
        {permissions.includes('tokens:own') && <Tokens />}
        {permissions.includes('proxy-credentials:own') && <ProxyCredentials />}
        {permissions.includes('upstream-credentials:manage') && <UpstreamCredentials />}
        {permissions.includes('security:read') && <SecurityEvents />}
    </MainContainer>;
}