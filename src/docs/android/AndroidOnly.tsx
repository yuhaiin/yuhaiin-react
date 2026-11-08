import { Card, CardBody, MainContainer } from '@/component/v2/card';
import { PageHeader } from '@/component/v2/page-header';
import { useAndroidPlatform } from '@/hooks/use-android-platform';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/** Wraps an Android page; outside the app's WebView it explains why it is empty. */
export function AndroidOnly({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
    const { t } = useTranslation('android');
    const platform = useAndroidPlatform();
    return <MainContainer>
        <PageHeader title={title} description={platform ? description : undefined} />
        {platform ? <div className="flex flex-col gap-4">{children}</div>
            : <Card><CardBody><p className="m-0 text-sm text-ui-muted">{t('unavailable')}</p></CardBody></Card>}
    </MainContainer>;
}

export const errorText = (e: unknown) => e instanceof Error ? e.message : String(e);
