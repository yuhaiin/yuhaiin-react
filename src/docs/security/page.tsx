import { PageHeader } from '@/component/v2/page-header';
import { authAPI, logout, type Issued } from '@/auth/api';
import { useSession } from '@/auth/context';
import { clearSession, setPendingEnrollment } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { Card, CardBody, MainContainer } from '@/component/v2/card';
import { confirmAction } from '@/component/v2/confirmation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sessions } from './sessions';
import { Passkeys } from './passkeys';
import { OAuthLinks } from './oauth-links';
import { EffectivePermissions } from './roles';
export default function SecurityPage() {
    const { t } = useTranslation('auth'); const { t: navT } = useTranslation('nav'); const session = useSession();
    const [busy, setBusy] = useState(false); const [error, setError] = useState('');
    if (!session) return null;
    const changePassword = async () => {
        if (!await confirmAction(t('passwordChangeConfirm'))) return;
        setBusy(true); setError('');
        try { const issued = await authAPI<Issued>('POST', '/password/enrollment', {}); setPendingEnrollment(issued.secret); clearSession(); }
        catch { setError(t('requestFailed')); } finally { setBusy(false); }
    };
    return <MainContainer>
        <PageHeader title={navT('account')} />
        <Card><CardBody className="space-y-4">
            <p className="break-all text-sm text-ui-muted">{session.principal.userId}</p>
            <p className="text-sm text-ui-muted">{t('sessionExpires')}: {new Date(session.expiresAt * 1000).toLocaleString()}</p>
            <div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={() => void changePassword()}>{t('changePassword')}</Button><Button disabled={busy} onClick={() => { setBusy(true); void logout().catch(() => { setError(t('requestFailed')); setBusy(false); }); }}>{t('signOut')}</Button></div>
            {error && <p role="alert" className="text-sm text-ui-danger">{error}</p>}
        </CardBody></Card>
        {session.principal.credentialType === 'session' && <><Sessions /><Passkeys /><OAuthLinks /></>}
        <EffectivePermissions />
    </MainContainer>;
}
