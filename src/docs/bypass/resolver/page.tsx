import { TabContent } from '@/component/v2/tab-content';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { confirmAction } from '@/component/v2/confirmation';
import { Tabs } from 'radix-ui';
import { allowNavigation } from '@/hooks/navigation-guard';
import { ResolverModal } from '@/component/resolver-editor';
import { ResourceWorkspace, useResourceSelection } from '@/component/resource-workspace';
import { useAsyncAction, useCloseGuard } from '@/hooks/use-editor-draft';
import { useServerPageClamp } from '@/hooks/use-pagination';
import { deleteResolver, listResolvers } from '@/api/resolvers';
import { MainContainer } from '@/component/v2/card';
import { GlobalToastContext } from '@/component/v2/toast';
import Loading from '@/component/v2/loading';
import { Globe2, Network } from 'lucide-react';
import { useContext, useEffect, useRef, useState, useId } from 'react';
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
    const [tab, setTab] = useState('resolvers');
    const [direction, setDirection] = useState(1);
    const groupId = useId();
    const reduced = useReducedMotion();
    const tabs = useRef<HTMLDivElement>(null);
    useEffect(() => {
        // Keep the active tab visible without scrolling the settings page.
        const reveal = () => {
            const list = tabs.current;
            const active = list?.querySelector<HTMLElement>('[data-state=active]');
            if (!list || !active || !list.clientWidth) return;
            const parent = list.getBoundingClientRect(), item = active.getBoundingClientRect();
            if (item.left < parent.left) list.scrollLeft += item.left - parent.left;
            else if (item.right > parent.right) list.scrollLeft += item.right - parent.right;
        };
        reveal(); window.addEventListener('resize', reveal);
        return () => window.removeEventListener('resize', reveal);
    }, [tab, t]);
    const entries = [['resolvers', uiT('resolvers')], ['roles', t('dnsRolesTab')], ['server', t('dnsServerTab')], ['hosts', uiT('staticHosts')], ['responses', t('dnsResponsesTab')], ['cache', t('dnsCacheTab')], ['fakeip', t('fakeIPTab')]];
    return <MainContainer className="max-w-[1440px]">
        <header className="mb-5"><h1 className="sr-only text-2xl font-semibold tracking-tight text-ui-heading lg:not-sr-only">{t('dnsTask')}</h1><p className="mt-2 text-sm text-ui-muted">{t('dnsPageHelp')}</p></header>
        <LayoutGroup id={groupId}><Tabs.Root activationMode="manual" value={tab} onValueChange={async next => { if (next !== tab && await allowNavigation()) { setDirection(Math.sign(entries.findIndex(([key]) => key === next) - entries.findIndex(([key]) => key === tab))); setTab(next); } }}>
            <Tabs.List ref={tabs} aria-label={t('dnsSections')} className="mb-6 flex min-w-0 gap-1 overflow-x-auto border-b border-ui-border">
                {entries.map(([value, label]) => <Tabs.Trigger key={value} value={value} className="relative min-h-11 shrink-0 whitespace-nowrap rounded-t-ui-md px-3 py-2 text-sm text-ui-muted transition-colors hover:text-ui-heading focus-visible:bg-ui-selected focus-visible:outline-none data-[state=active]:font-semibold data-[state=active]:text-ui-primary">{label}{value === tab && <motion.span aria-hidden="true" layoutId="dns-active-tab" className="pointer-events-none absolute bottom-0 inset-x-0 h-0.5 bg-ui-primary" transition={{ duration: reduced ? 0 : 0.2, ease: "easeOut" }} />}</Tabs.Trigger>)}
            </Tabs.List>
            <TabContent direction={direction} value="resolvers" className="min-w-0"><ResolverList /></TabContent>
            <TabContent direction={direction} value="roles" className="min-w-0"><DNSRoles /></TabContent>
            <TabContent direction={direction} value="server" className="min-w-0 space-y-6"><Server /><Fakedns /></TabContent>
            <TabContent direction={direction} value="responses" className="min-w-0"><CustomResponses /></TabContent>
            <TabContent direction={direction} value="hosts" className="min-w-0"><Hosts /></TabContent>
            <TabContent direction={direction} value="fakeip" className="min-w-0"><FakeIPList /></TabContent>
            <TabContent direction={direction} value="cache" className="min-w-0"><DNSCache /></TabContent>
        </Tabs.Root></LayoutGroup>
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
    return <ResourceWorkspace embedded createDisabled={selection.creating} title={uiT('resolvers')} description={uiT('upstreamDnsResolvers')} selectedId={selection.id} editing={selection.creating || Boolean(selection.id)}
        onSelect={selection.select} onCreate={() => selection.create()} search={{ value: query, onChange: value => { setQuery(value); setPage(1); } }}
        pagination={{ page: data?.page.page || page, pageSize: PAGE_SIZE, total: data?.page.total ?? 0, onChange: setPage }}
        items={items.map(item => ({ id: item.id, name: item.name, icon: ['doh','doh3'].includes(item.type) ? <Globe2 /> : <Network />, description: `${item.type} · ${item.host || uiT('system')}` }))}>
        <fieldset disabled={pending} className="min-w-0" aria-busy={pending}>
            <ResolverModal presentation="inline" id={selection.id} show isNew={selection.creating} onHide={selection.close} onDelete={remove}
                onSaved={item => { selection.saved(item.id); void mutate(); }} />
        </fieldset>
    </ResourceWorkspace>;
}
