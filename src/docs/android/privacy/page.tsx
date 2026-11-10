import { confirmAction } from '@/component/v2/confirmation';
import { getAndroidPrivacy, withdrawAndroidConsent } from '@/api/android';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader } from '@/component/v2/card';
import Loading from '@/component/v2/loading';
import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { AndroidOnly, errorText } from '../AndroidOnly';

/** The policy text comes from the app's translated resources, the same text as its disclosures. */
export default function AndroidPrivacyPage() {
    const { t } = useTranslation('android');
    return <AndroidOnly title={t('privacy.title')}><Privacy /></AndroidOnly>;
}

const Privacy: FC = () => {
    const { t } = useTranslation('android');
    const { data, error, mutate } = useSWR('android/privacy', getAndroidPrivacy);
    const [withdrawError, setWithdrawError] = useState<string>();
    const [withdrawn, setWithdrawn] = useState(false);
    if (error) return <p className="text-sm text-ui-danger">{errorText(error)}</p>;
    if (!data) return <Loading />;
    const withdraw = async () => {
        if (!await confirmAction(data.withdrawBody)) return;
        setWithdrawError(undefined);
        try { await mutate(await withdrawAndroidConsent(), { revalidate: false }); setWithdrawn(true); }
        catch (e) { setWithdrawError(errorText(e)); }
    };
    const consent = (granted: boolean) => <Badge variant={granted ? 'success' : 'secondary'} pill>{t(granted ? 'privacy.granted' : 'privacy.notGranted')}</Badge>;
    return <>
        <Card>
            <CardHeader><span className="font-medium text-ui-heading">{t('privacy.consents')}</span></CardHeader>
            <CardBody className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between gap-2"><span>{t('privacy.vpn')}</span>{consent(data.consents.vpn)}</div>
                <div className="flex items-center justify-between gap-2"><span>{t('privacy.installedApps')}</span>{consent(data.consents.installedApps)}</div>
                <p className="m-0 text-xs text-ui-muted">{t('privacy.grantHint')}</p>
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline-danger" disabled={!data.consents.vpn && !data.consents.installedApps} onClick={withdraw}>{t('privacy.withdraw')}</Button>
                    <Button asChild size="sm" variant="outline-secondary"><a href={data.contactUrl} target="_blank" rel="noreferrer">{t('privacy.contact')}</a></Button>
                </div>
                {withdrawn && <p className="m-0 text-ui-success">{t('privacy.withdrawn')}</p>}
                {withdrawError && <p className="m-0 text-ui-danger">{withdrawError}</p>}
            </CardBody>
        </Card>
        <Card>
            <CardHeader><span className="font-medium text-ui-heading">{data.title}</span></CardHeader>
            <CardBody className="flex flex-col gap-4 text-sm">
                <p className="m-0 text-xs text-ui-muted">{data.effectiveDate}</p>
                {data.sections.map(section => <section key={section.title}>
                    <h2 className="m-0 mb-1 text-base font-medium text-ui-heading">{section.title}</h2>
                    <p className="m-0 whitespace-pre-line text-ui-fg">{section.body}</p>
                </section>)}
            </CardBody>
        </Card>
    </>;
};
