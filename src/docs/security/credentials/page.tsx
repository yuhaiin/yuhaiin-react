import { useSession } from '@/auth/context';
import { MainContainer } from '@/component/v2/card';
import { PageHeader } from '@/component/v2/page-header';
import { PageTabs } from '@/component/v2/page-tabs';
import { useTranslation } from 'react-i18next';
import { ProxyCredentials, UpstreamCredentials } from '../proxy-credentials';
import { Tokens } from '../tokens';

export default function CredentialsPage() {
    const { t } = useTranslation('auth'); const { t: navT } = useTranslation('nav');
    const permissions = useSession()?.principal.permissions ?? [];
    const items = [
        { value: 'tokens', label: t('tokens'), permission: 'tokens:own', content: <Tokens /> },
        { value: 'proxy', label: t('proxyCredentials'), permission: 'proxy-credentials:own', content: <ProxyCredentials /> },
        { value: 'upstream', label: t('upstreamCredentials'), permission: 'upstream-credentials:manage', content: <UpstreamCredentials /> },
    ].filter(item => permissions.includes(item.permission));
    return <MainContainer>
        <PageHeader title={navT('credentials')} />
        <PageTabs label={navT('credentials')} items={items} />
    </MainContainer>;
}
