import { MainContainer } from '@/component/v2/card';
import { PageHeader } from '@/component/v2/page-header';
import { useTranslation } from 'react-i18next';
import { UserUsage } from '../usage';

export default function UsagePage() {
    const { t } = useTranslation('nav');
    return <MainContainer>
        <PageHeader title={t('usageAudit')} />
        <UserUsage />
    </MainContainer>;
}
