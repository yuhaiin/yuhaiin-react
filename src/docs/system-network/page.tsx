import { Button } from '@/component/v2/button';
import { MainContainer } from '@/component/v2/card';
import Loading from '@/component/v2/loading';
import { PageHeader } from '@/component/v2/page-header';
import { PageTabs } from '@/component/v2/page-tabs';
import { useLocaleFormat } from '@/i18n/useLocaleFormat';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ForwardingTab } from './forwarding';
import { InterfacesTab } from './interfaces';
import { RoutingTab } from './routing';
import { StateBadge } from './shared';
import { useSystemNetwork } from './use-system-network';

export default function SystemNetworkPage() {
    const { t } = useTranslation('systemNetwork');
    const format = useLocaleFormat();
    const editor = useSystemNetwork();
    const { config, status, interfaces, draft, dirty, saving, saved, failure, invalid, patch, save, discard, preview } = editor;
    if (config.error && !config.data) return <Loading onRetry={() => void config.mutate()}>{String((config.error as { msg?: string })?.msg ?? config.error)}</Loading>;
    if (!config.data) return <Loading />;
    const capabilities = status.data?.capabilities ?? { platform: '', routeManagement: false, multipleTargets: false, externalInterfaces: false, gateways: false,
        policyRouting: false, ipv4Forwarding: false, ipv6Forwarding: false, nat: false, tproxy: false, routeTargets: [], forwardTargets: [] };
    const actions = <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline-secondary" disabled={!dirty || saving} onClick={discard}>{t('discard')}</Button>
        <Button variant="primary" permission="settings:write" loading={saving} disabled={!dirty || saving || invalid} onClick={() => void save()}><Save size={16} />{t('save')}</Button>
    </div>;
    return <MainContainer className="max-w-[1440px]">
        <div className="@container pb-8">
            <PageHeader title={t('title')} description={t('description')} actions={actions} stickyActions />
            <div className="mb-5 grid gap-2" aria-live="polite">
                {status.data && <p className="flex flex-wrap items-center gap-2 text-sm text-ui-fg">
                    <StateBadge state={status.data.state} />
                    <span>{t('applied', { count: status.data.routes })}</span>
                    {status.data.appliedAt ? <span className="text-xs text-ui-muted">{t('lastApplied', { time: format.time(new Date(status.data.appliedAt * 1000)) })}</span> : null}
                    {status.data.error && <span className="text-ui-danger">{status.data.error}</span>}
                </p>}
                {dirty && <p role="status" className="text-sm text-ui-warning">{t('unsaved')}</p>}
                {dirty && invalid && <p role="alert" className="text-sm text-ui-danger">{t('invalid')}</p>}
                {saved && <p role="status" className={saved === 'ok' ? 'text-sm text-ui-success' : 'text-sm text-ui-warning'}>{t(saved === 'ok' ? 'saved' : 'savedWithProblems')}</p>}
                {failure && <p role="alert" className="rounded-ui-sm border border-ui-danger/40 p-3 text-sm text-ui-danger">{failure}</p>}
            </div>
            <PageTabs label={t('sections')} items={[
                { value: 'routing', label: t('tabs.routing'), content: <RoutingTab rules={draft.routes} onChange={routes => patch(c => ({ ...c, routes }))}
                    capabilities={capabilities} interfaces={interfaces.data} status={status.data} preview={preview} dirty={dirty} /> },
                ...(capabilities.platform === 'android' ? [] : [{ value: 'forwarding', label: t('tabs.forwarding'), content: <ForwardingTab value={draft.forwarding}
                    onChange={forwarding => patch(c => ({ ...c, forwarding }))} capabilities={capabilities} interfaces={interfaces.data} status={status.data} dirty={dirty} /> }]),
                { value: 'interfaces', label: t('tabs.interfaces'), content: <InterfacesTab interfaces={interfaces.data} rules={[...draft.routes, ...draft.forwarding.rules]}
                    onRefresh={() => void interfaces.mutate()} error={interfaces.error ? String((interfaces.error as { msg?: string })?.msg ?? interfaces.error) : undefined} /> },
            ]} />
        </div>
    </MainContainer>;
}
