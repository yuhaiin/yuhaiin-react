import { StageChangeButton } from "@/component/configuration-change";
import { clearHashSearch, useHashSearch } from "@/hooks/useHashLocation";
import { connectionRuleDraft } from "@/docs/connections/actions";
import { getNode } from "@/api/nodes";
import { getGatewayConfig } from "@/api/gateway";
import { listSelectors } from "@/api/selectors";
import { RuleEditor } from "./rule-editor";
import { allowNavigation } from "@/hooks/navigation-guard";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ResolverPicker } from "@/component/resolver-picker";
import { RouteTargetPicker } from "@/component/route-target-picker";
import { type RuleEditorOptions } from "./rule-form";
import { useServerPageClamp } from "@/hooks/use-pagination";
import { collectPages } from "@/api/paging";
import { useTranslation } from 'react-i18next';
import { useAsyncAction, useCloseGuard, useEditorDraft } from "@/hooks/use-editor-draft";

import { listInbounds } from "@/api/inbounds";
import { listResolvers } from "@/api/resolvers";
import { applyRouteChanges, changeRulePriority, getRouteActivationStatus, getRouteConfig, listRouteLists, listRules, saveRouteConfig } from "@/api/route";
import { Button } from "@/component/v2/button";
import { FilterSearch, MainContainer, SettingLabel } from "@/component/v2/card";
import { SettingSelectVertical, SwitchCard } from "@/component/v2/forms";

import Loading from "@/component/v2/loading";
import { Pagination } from "@/component/v2/pagination";
import { RouteActivationProgress } from "@/component/v2/route-activation-progress";
import { WorkspaceDetail, WorkspaceDirectory, WorkspaceLayout } from "@/component/workspace-layout";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import type { RuleDraft, RuleItem } from "@/contract/route";
import { RuleList } from "./rule-list";
import type { RuleDrop } from "./rule-drag";
import { ArrowRight, ChevronDown, Plus, Save, ListFilter } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
const PAGE_SIZE = 25;

function BypassComponent() {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');

    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState("");
    const [localEditing, setEditing] = useState<Pick<RuleItem, "id" | "name"> | null>(null);
    const desktop = useMediaQuery("(min-width: 768px)");
    const initialized = useRef(false);
    const [editorState, setEditorState] = useState({ dirty: false, pending: false });
    const search = useHashSearch();
    const linkedId = new URLSearchParams(search).get('rule');
    const linkedDraft = useMemo(() => connectionRuleDraft(search), [search]);
    const editing = useMemo(() => localEditing ?? (linkedId ? { id: linkedId, name: '' } : null), [localEditing, linkedId]);
    const closeLink = () => { if (search) clearHashSearch(); };
    const [localCreating, setCreating] = useState(false);
    const creating = localCreating || Boolean(linkedDraft);
    const { data: activation, mutate: mutateActivation } = useSWR(
        "/api/v2/route/activation",
        getRouteActivationStatus,
        {
            revalidateOnFocus: false,
            refreshInterval: (status) => Math.max(status?.hostIndexRefreshAt ?? 0, status?.ruleApplyAt ?? 0) > 0 || (status?.savedRevision ?? 0) > (status?.appliedRevision ?? 0) ? 1000 : 0,
        },
    );
    const { data, error, isValidating, mutate } = useSWR(
        ["/api/v2/route/rules", page, query],
        () => listRules({ page, pageSize: PAGE_SIZE, query }),
        { revalidateOnFocus: false, keepPreviousData: true },
    );
    useServerPageClamp(data?.page, page, setPage);
    useEffect(() => {
        if (!initialized.current && desktop && data?.items.length && !creating && !editing) {
            initialized.current = true;
            setEditing(data.items[0]);
        }
    }, [desktop, data?.items, creating, editing]);
    const selectRule = async (item: RuleItem) => {
        if (reordering || !creating && editing?.id === item.id) return;
        if (!await allowNavigation()) return;
        initialized.current = true;
        closeLink();
        setCreating(false);
        setEditing(item);
    };
    const newRule = async () => {
        if (!await allowNavigation()) return;
        initialized.current = true;
        closeLink();
        setEditing(null);
        setCreating(true);
    };
    const backToRules = () => {
        initialized.current = true;
        closeLink();
        setEditing(null);
        setCreating(false);
        setEditorState({ dirty: false, pending: false });
    };
    const needEditorOptions = creating || editing !== null;
    const { data: listsData } = useSWR(
        needEditorOptions ? "/api/v2/route/lists/options" : null,
        () => collectPages(listRouteLists),
        { revalidateOnFocus: false },
    );
    const { data: inboundsData } = useSWR(
        needEditorOptions ? "/api/v2/inbounds/options" : null,
        () => collectPages(listInbounds),
        { revalidateOnFocus: false },
    );
    const { data: resolversData } = useSWR(
        "/api/v2/resolvers/options",
        () => collectPages(listResolvers),
        { revalidateOnFocus: false },
    );

    const { data: selectors } = useSWR('/api/v2/outbound/selectors', listSelectors);
    const { data: gateways } = useSWR(data?.items.some(item => item.mode === 'gateway') ? '/api/v2/gateway/config' : null, getGatewayConfig, { revalidateOnFocus: false });
    const destinations = Object.fromEntries([...(selectors?.items ?? []).map(selector => [`selector:${selector.id}`, selector.name]), ...(gateways?.gateways ?? []).map(g => [`gateway:${g.id}`, g.name])]);

    const editorOptions = useMemo<RuleEditorOptions>(() => ({
        listTypes: Object.fromEntries((listsData?.items ?? []).map(item => [item.id, item.type])),
        listNames: Object.fromEntries((listsData?.items ?? []).map(item => [item.id, item.name])),
        lists: (listsData?.items ?? []).map(item => item.id).sort((a, b) => a.localeCompare(b)),
        inboundNames: Object.fromEntries((inboundsData?.items ?? []).map(item => [item.id, item.name])),
        inbounds: (inboundsData?.items ?? []).map(item => item.id).sort((a, b) => a.localeCompare(b)),
        resolvers: (resolversData?.items ?? []).map(item => item.id).sort((a, b) => a.localeCompare(b)),
    }), [inboundsData?.items, listsData?.items, resolversData?.items]);

    const { pending: reordering, run: runReorder } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    const moveRule = (item: RuleItem, direction: -1 | 1) => {
        const currentPage = data;
        if (!currentPage || query.trim() || reordering || editorState.dirty || editorState.pending || isValidating || currentPage.page.page !== page) return;
        void runReorder(async () => {
            const index = currentPage.items.findIndex(rule => rule.id === item.id);
            if (index < 0) return;
            let adjacent = currentPage.items[index + direction];
            if (!adjacent) {
                const neighboringPage = page + direction;
                if (neighboringPage < 1) return;
                const result = await listRules({ page: neighboringPage, pageSize: currentPage.page.pageSize || PAGE_SIZE, query: '' });
                adjacent = direction < 0 ? result.items[result.items.length - 1] : result.items[0];
            }
            if (!adjacent) return;
            await changeRulePriority({ id: item.id }, { id: adjacent.id }, 'exchange');
            await mutate();
            void mutateActivation();
            try {
                await applyRouteChanges();
                ctx.Info(t('ruleReordered'));
            } finally {
                await mutateActivation();
            }
        });
    };
    const dropRule = (item: RuleItem, drop: RuleDrop) => {
        if (!data || query.trim() || reordering || editorState.dirty || editorState.pending || isValidating || data.page.page !== page) return;
        void runReorder(async () => {
            await changeRulePriority({ id: item.id }, { id: drop.target.id }, drop.placement);
            await mutate();
            void mutateActivation();
            try { await applyRouteChanges(); ctx.Info(t('ruleReordered')); }
            finally { await mutateActivation(); }
        });
    };
    const refresh = () => {
        void mutate();
        void mutateActivation();
    };
    const saved = (draft: RuleDraft | null) => {
        initialized.current = true;
        refresh();
        closeLink();
        setCreating(false);
        setEditing(draft ? { id: draft.rule.id, name: draft.rule.name } : null);
        setEditorState({ dirty: false, pending: false });
    };

    if (error && !data) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
    if (!data) return <Loading />

    const showEditor = creating || editing !== null;
    return (
        <MainContainer className="max-w-[1440px]">
            <header className={`mb-6 flex-wrap items-center justify-between gap-4 ${showEditor ? 'hidden md:flex' : 'flex'}`}>
                <div><h1 className="sr-only text-2xl font-semibold tracking-tight text-ui-heading lg:not-sr-only">{t('routingTask')}</h1><p className="mt-2 text-sm text-ui-muted">{t('routingOverviewHelp')}</p></div>
                <Button permission="routes:write" variant="primary" onClick={newRule} disabled={reordering || editorState.pending || creating}><Plus size={16} className="mr-1.5" />{uiT('add')}</Button>
            </header>
            <div className={showEditor ? 'hidden md:block' : undefined}>
                <RouteConfigCard destinations={destinations} onSaved={() => { void mutateActivation(); }} />
            </div>
            <RouteActivationProgress status={activation} onApplied={mutateActivation} />
            <WorkspaceLayout className={showEditor ? 'md:mt-6' : 'mt-6'}>
                <WorkspaceDirectory label={t('ruleDirectory')} hiddenOnMobile={showEditor}>
                    <div className="mb-2 space-y-2 border-b border-ui-border/50 px-1 pb-3">
                        <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-medium text-ui-heading">{uiT('routeRules')}</h2>{isValidating && <Spinner size="sm" />}</div>
                        <p className="text-xs text-ui-muted">{t('ruleOrderHelp', { count: data.page.total })}</p>
                        <FilterSearch className="w-full" onEnter={v => { setPage(1); setQuery(v); }} size="sm" />
                    </div>
                    <div className="max-h-[min(72vh,900px)] overflow-y-auto overscroll-contain">
                        {error ? <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading> : <RuleList onReordered={refresh} items={data.items} selectedId={creating ? undefined : editing?.id} destinations={destinations}
                            resolverNames={Object.fromEntries((resolversData?.items ?? []).map(item => [item.id, item.name]))}
                            page={data.page.page || page} pageSize={data.page.pageSize || PAGE_SIZE} total={data.page.total} filtered={Boolean(query.trim())}
                            busy={reordering || isValidating || editorState.pending || editorState.dirty}
                            onOpen={selectRule} onMove={moveRule} onDrop={dropRule} />}
                    </div>
                    {Math.ceil(data.page.total / (data.page.pageSize || PAGE_SIZE)) > 1 && <div className="flex justify-center border-t border-ui-border/60 pt-3">
                        <Pagination currentPage={data.page.page || page} totalItems={data.page.total} pageSize={data.page.pageSize || PAGE_SIZE} onPageChange={setPage} />
                    </div>}
                </WorkspaceDirectory>
                <WorkspaceDetail hiddenOnMobile={!showEditor} transitionKey={creating ? 'new-rule' : editing?.id}>
                    {showEditor ? <RuleEditor key={creating ? 'new-rule' : editing?.id} item={editing} creating={creating} initial={linkedDraft}
                        options={editorOptions} blocked={reordering} onSaved={saved} onBack={backToRules} onStateChange={setEditorState} />
                        : <div className="flex min-h-80 flex-col items-center justify-center gap-3 p-6 text-center text-ui-muted">
                            <ListFilter size={28} aria-hidden="true" /><h2 className="text-lg font-medium text-ui-heading">{t('selectRule')}</h2>
                            <p className="max-w-sm text-sm">{t('selectRuleHelp')}</p><Button permission="routes:write" variant="outline-primary" className="gap-2" onClick={newRule}><Plus size={16} />{uiT('newRouteRule')}</Button>
                        </div>}
                </WorkspaceDetail>
            </WorkspaceLayout>
        </MainContainer>
    );
}

function RouteConfigCard({ onSaved, destinations }: { onSaved: () => void; destinations: Record<string, string> }) {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');

    const ctx = useContext(GlobalToastContext);
    const { data: server, error, isLoading, mutate } = useSWR("/api/v2/route/config", getRouteConfig, { revalidateOnFocus: false });

    const { value: data, setValue: setDraft, commit, dirty } = useEditorDraft("getRouteConfig", server, () => undefined);
    const nodeId = data?.defaultTarget?.type === 'node' ? data.defaultTarget.id : undefined;
    const { data: node } = useSWR(nodeId ? ['/api/v2/nodes/detail', nodeId] : null, () => getNode(nodeId!), { revalidateOnFocus: false });
    const { pending: saving, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    useCloseGuard(dirty, saving, () => undefined);
    const patch = (patchValue: Partial<NonNullable<typeof data>>) => setDraft(prev => prev ? { ...prev, ...patchValue } : prev);
    const save = () => {
        if (!data || saving || error || isLoading) return;
        void run(async () => {
            if (dirty) {
                const next = await saveRouteConfig(data);
                commit(next);
                await mutate(next, { revalidate: false });
            }
            onSaved();
            await applyRouteChanges();
            onSaved();
            ctx.Info("route config applied");
        });
    };

    const target = data?.defaultTarget;
    const destination = !target?.type || target.type === 'default' ? t('defaultProxy') : target.type === 'node' ? node?.name ?? target.id : destinations[`${target.type}:${target.id}`] ?? t('unavailableDestination');
    return <details className="group/fallback rounded-ui-lg bg-ui-surface-muted/50">
        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
            <span className="text-sm font-medium text-ui-heading">{t('fallbackTitle')}</span>
            {data && <span className="min-w-0 truncate text-sm text-ui-muted">{data.defaultMode === 'proxy' ? destination : t(data.defaultMode)}</span>}
            {dirty && <span className="shrink-0 text-xs text-ui-warning">{t('unsavedChanges')}</span>}
            <ChevronDown size={15} aria-hidden="true" className="shrink-0 text-ui-muted transition-transform group-open/fallback:rotate-180" />
        </summary>
        <fieldset disabled={saving} className="min-w-0 border-t border-ui-border/60 p-4 sm:p-5">
                {error ? (
                    <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
                ) : data ? (
                    <div className="min-w-0 space-y-4">
                        <p className="text-sm text-ui-muted">{t('defaultRoutingHelp')}</p>
                        {isLoading && <Spinner size="sm" />}
                        <section className="grid grid-cols-2 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.25fr)]">
                            <SettingSelectVertical className="mb-0" label={t('defaultAction')} value={data.defaultMode}
                                values={[[t('proxy'), 'proxy'], [t('direct'), 'direct'], [t('block'), 'block']]}
                                onChange={defaultMode => patch({ defaultMode })} />
                            {data.defaultMode === 'proxy' && <><ArrowRight size={16} aria-hidden="true" className="mt-8 hidden text-ui-muted sm:block" /><div className="min-w-0"><SettingLabel className="mb-2">{t('destination')}</SettingLabel><RouteTargetPicker compact value={data.defaultTarget} onChange={defaultTarget => patch({ defaultTarget })} /></div></>}
                        </section>
                        <details className="border-t border-ui-border/70 pt-3"><summary className="cursor-pointer text-xs font-medium text-ui-muted">{t("advancedRoutingSettings")}</summary>
                        <section className="mt-4 grid gap-4">
                            <div className="text-sm font-bold text-ui-muted">{uiT("resolveStrategy")}</div>
                            <SwitchCard
                                label={uiT("resolveLocally")}
                                description={uiT("resolveDnsOnTheLocalDevice")}
                                checked={data.resolveLocally}
                                onCheckedChange={(resolveLocally) => patch({ resolveLocally })}
                            />
                            <SwitchCard
                                label={uiT("udpProxyFqdn")}
                                description={uiT("skipLocalDnsResolutionForUdpProxyTraffic")}
                                checked={data.udpProxyFqdnStrategy === "skip_resolve"}
                                onCheckedChange={(checked) => patch({ udpProxyFqdnStrategy: checked ? "skip_resolve" : "default" })}
                            />
                        </section>
                        <section className="grid gap-4">
                            <div className="text-sm font-bold text-ui-muted">{uiT("defaultResolver")}</div>
                            <label className="space-y-2"><SettingLabel>{uiT("directResolver")}</SettingLabel><ResolverPicker label={uiT("directResolver")} value={data.directResolver} onChange={directResolver => patch({ directResolver })} /></label>
                            <label className="space-y-2"><SettingLabel>{uiT("proxyResolver")}</SettingLabel><ResolverPicker label={uiT("proxyResolver")} value={data.proxyResolver} onChange={proxyResolver => patch({ proxyResolver })} /></label>
                        </section></details>
                    </div>
                ) : (
                    <Loading />
                )}

            <div className="mt-4 flex flex-wrap justify-end gap-2">
                {data && <StageChangeButton disabled={saving || Boolean(error)} request={{ store: "configuration", kind: "route-defaults", payload: data }} onCommitted={async () => { const next = await getRouteConfig(); commit(next); await mutate(next, { revalidate: false }); onSaved(); }} />}
                <Button permission="routes:write" size="sm" variant="outline-primary" disabled={saving || !data || Boolean(error)} onClick={save}>
                    {saving ? <Spinner size="sm" className="mr-2" /> : <Save size={16} className="mr-2" />}
                    {t("saveAndApply")}</Button>
            </div>
        </fieldset>
    </details>;
}

export default BypassComponent;
