import { useSession } from '@/auth/context';
import { Card, CardBody, MainContainer } from '@/component/v2/card';
import { PageHeader } from '@/component/v2/page-header';
import { PageTabs } from '@/component/v2/page-tabs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigurationChanges } from '../configuration-changes';
import { Groups } from '../groups';
import { OAuthSettingsPanel } from '../oauth-settings';
import { ManagementRoles } from '../roles';
import { SecurityEvents } from '../security-events';
import { TrafficAccess } from '../traffic-access';
import { UsageRetention } from '../usage-retention';
import { Users } from '../users';

const stacked = 'min-w-0 space-y-6';

export default function AdministrationPage() {
    const { t } = useTranslation('auth'); const { t: navT } = useTranslation('nav');
    const session = useSession();
    if (!session) return null;
    const permissions = session.principal.permissions;
    const manageUsers = permissions.includes('users:manage');
    const canRoles = permissions.includes('roles:read');
    const canAccess = permissions.includes('traffic-access:read');
    const canOAuth = session.principal.credentialType === 'session' && (permissions.includes('security:read') || permissions.includes('security:write'));
    const canEvents = permissions.includes('security:read');
    const canChanges = permissions.includes('configuration:read');
    const items = [
        ...(manageUsers || canRoles || canAccess ? [{ value: 'access', label: t('securityTabs.access'), className: stacked, content: <>
            {manageUsers && <><Users /><Groups /></>}
            <ManagementRoles />
            {canAccess && <TrafficAccess writable={permissions.includes('traffic-access:write')} />}
        </> }] : []),
        ...(canOAuth || manageUsers ? [{ value: 'settings', label: t('securityTabs.settings'), className: stacked, content: <>
            {canOAuth && <OAuthSetup />}
            {manageUsers && <Card><CardBody><UsageRetention /></CardBody></Card>}
        </> }] : []),
        ...(canEvents || canChanges ? [{ value: 'audit', label: t('securityTabs.audit'), className: stacked, content: <>
            <ConfigurationChanges />
            {canEvents && <SecurityEvents />}
        </> }] : []),
    ];
    return <MainContainer>
        <PageHeader title={navT('administration')} />
        <PageTabs label={navT('administration')} items={items} />
    </MainContainer>;
}

function OAuthSetup() {
    const { t } = useTranslation('auth'); const { t: navT } = useTranslation('nav');
    const [ready, setReady] = useState(false);
    return <div className="space-y-3">
        {ready && <p role="status" className="text-sm text-ui-muted">{t('oauthReadyToBind')} <a className="text-ui-primary underline" href="#/docs/security">{navT('account')}</a></p>}
        <OAuthSettingsPanel onConfigured={setReady} />
    </div>;
}
