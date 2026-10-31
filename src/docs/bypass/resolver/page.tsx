import { PageHeader } from '@/component/v2/page-header';
import { PageTabs } from '@/component/v2/page-tabs';
import { confirmAction } from '@/component/v2/confirmation';
import { ResolverModal } from '@/component/resolver-editor';
import { ResourceWorkspace, useResourceSelection } from '@/component/resource-workspace';
import { useAsyncAction, useCloseGuard } from '@/hooks/use-editor-draft';
import { useServerPageClamp } from '@/hooks/use-pagination';
import { deleteResolver, listResolvers } from '@/api/resolvers';
import { MainContainer } from '@/component/v2/card';
import { GlobalToastContext } from '@/component/v2/toast';
import Loading from '@/component/v2/loading';
import { Globe2, Network } from 'lucide-react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { Fakedns } from './fakedns';
import { Hosts } from './hosts';
import { Server } from './server';
import { DNSCache } from './cache';
import { FakeIPList } from './fakeip';
import { DNSRoles } from './roles';
import { CustomResponses } from './responses';

const PAGE_SIZE = 12;

export default function ResolverComponent() {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    return <MainContainer className="max-w-[1440px]">
        <PageHeader title={t('dnsTask')} description={t('dnsPageHelp')} className="mb-5" />
        <PageTabs label={t('dnsSections')} items={[
            { value: 'resolvers', label: uiT('resolvers'), content: <ResolverList /> },
            { value: 'roles', label: t('dnsRolesTab'), content: <DNSRoles /> },
            { value: 'server', label: t('dnsServerTab'), className: 'min-w-0 space-y-6', content: <><Server /><Fakedns /></> },
            { value: 'hosts', label: uiT('staticHosts'), content: <Hosts /> },
            { value: 'responses', label: t('dnsResponsesTab'), content: <CustomResponses /> },
            { value: 'cache', label: t('dnsCacheTab'), content: <DNSCache /> },
            { value: 'fakeip', label: t('fakeIPTab'), content: <FakeIPList /> },
        ]} />
    </MainContainer>;
}

function ResolverList() {
    const { t: uiT } = useTranslation('ui');
    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const { data, error, isLoading, mutate } = useSWR(['/api/v2/resolvers/directory', page, query], () => listResolvers({ page, pageSize: PAGE_SIZE, query }), { keepPreviousData: true });
    useServerPageClamp(data?.page, page, setPage);
    const items = data?.items ?? [];
    const selection = useResourceSelection(items.map(item => item.id));
    const { pending, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    useCloseGuard(false, pending, () => undefined);
    if (error && !data) return <Loading onRetry={() => void mutate()}>{error.msg}</Loading>;
    if (isLoading && !data) return <Loading />;
    const remove = async (id: string) => {
        if (!await confirmAction(uiT('deleteResolver'))) return;
        void run(async () => { await deleteResolver(id); selection.close(); await mutate(); });
    };
    return <ResourceWorkspace embedded createDisabled={selection.creating} title={uiT('resolvers')} selectedId={selection.id} editing={selection.creating || Boolean(selection.id)}
        onSelect={selection.select} onCreate={() => selection.create()} search={{ value: query, onChange: value => { setQuery(value); setPage(1); } }}
        pagination={{ page: data?.page.page || page, pageSize: PAGE_SIZE, total: data?.page.total ?? 0, onChange: setPage }}
        items={items.map(item => ({ id: item.id, name: item.name, icon: ['doh','doh3'].includes(item.type) ? <Globe2 /> : <Network />, description: `${item.type} · ${item.host || uiT('system')}` }))}>
        <fieldset disabled={pending} className="min-w-0" aria-busy={pending}>
            <ResolverModal presentation="inline" id={selection.id} show isNew={selection.creating} onHide={selection.close} onDelete={remove}
                onSaved={item => { selection.saved(item.id); void mutate(); }} />
        </fieldset>
    </ResourceWorkspace>;
}
