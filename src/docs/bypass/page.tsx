import { clearHashSearch, useHashSearch } from "@/hooks/useHashLocation";
import { connectionRuleDraft } from "@/docs/connections/actions";
import { listNodes } from "@/api/nodes";
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
import { applyRouteChanges, changeRulePriority, getRouteActivationStatus, getRouteConfig, getRule, listRouteLists, listRules, saveRouteConfig, saveRule } from "@/api/route";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { FilterSearch, MainContainer, SettingLabel } from "@/component/v2/card";
import { SettingSelectVertical, SwitchCard } from "@/component/v2/forms";

import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Pagination } from "@/component/v2/pagination";
import { RouteActivationProgress } from "@/component/v2/route-activation-progress";
import { WorkspaceDetail, WorkspaceDirectory, WorkspaceLayout } from "@/component/workspace-layout";
import { Select } from "@/component/v2/select";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import type { RuleDraft, RuleItem } from "@/contract/route";
import { RuleList } from "./rule-list";
import { ArrowRight, ChevronDown, Plus, Save, ListFilter } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
type PriorityOperate = "exchange" | "insert_before" | "insert_after";
const PAGE_SIZE = 25;

function BypassComponent() {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');

    const ctx = useContext(GlobalToastContext);
    const { mutate: refreshCache } = useSWRConfig();
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
    const [priorityItem, setPriorityItem] = useState<RuleItem | null>(null);
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
    const selectRule = (item: RuleItem) => {
        if (toggling || !creating && editing?.id === item.id) return;
        if (!allowNavigation()) return;
        initialized.current = true;
        closeLink();
        setCreating(false);
        setEditing(item);
    };
    const newRule = () => {
        if (!allowNavigation()) return;
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
    const { data: allRules, mutate: mutateAllRules } = useSWR(
        priorityItem ? "/api/v2/route/rules/all" : null,
        () => collectPages(listRules),
        { revalidateOnFocus: false },
    );
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

    const { data: nodes } = useSWR('/api/v2/nodes/all', () => collectPages(listNodes));
    const { data: selectors } = useSWR('/api/v2/outbound/selectors', listSelectors);
    const destinations = Object.fromEntries([
        ...(nodes?.items ?? []).map(node => [`node:${node.id}`, node.name]),
        ...(selectors?.items ?? []).map(selector => [`selector:${selector.id}`, selector.name]),
    ]);

    const editorOptions = useMemo<RuleEditorOptions>(() => ({
        listTypes: Object.fromEntries((listsData?.items ?? []).map(item => [item.id, item.type])),
        listNames: Object.fromEntries((listsData?.items ?? []).map(item => [item.id, item.name])),
        lists: (listsData?.items ?? []).map(item => item.id).sort((a, b) => a.localeCompare(b)),
        inboundNames: Object.fromEntries((inboundsData?.items ?? []).map(item => [item.id, item.name])),
        inbounds: (inboundsData?.items ?? []).map(item => item.id).sort((a, b) => a.localeCompare(b)),
        resolvers: (resolversData?.items ?? []).map(item => item.id).sort((a, b) => a.localeCompare(b)),
    }), [inboundsData?.items, listsData?.items, resolversData?.items]);

    const { pending: toggling, run: runToggle } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    const { pending: reordering, run: runReorder } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    const moveRule = (item: RuleItem, direction: -1 | 1) => {
        const currentPage = data;
        if (!currentPage || query.trim() || toggling || reordering || editorState.dirty || editorState.pending || isValidating || currentPage.page.page !== page) return;
        void runReorder(async () => {
            const index = currentPage.items.findIndex(rule => rule.id === item.id);
            if (index < 0) return;
            let adjacent = currentPage.items[index + direction];
            if (!adjacent) {
                const neighboringPage = page + direction;
                if (neighboringPage < 1) return;
                const result = await listRules({ page: neighboringPage, pageSize: PAGE_SIZE, query: '' });
                adjacent = direction < 0 ? result.items.at(-1) : result.items[0];
            }
            if (!adjacent) return;
            await changeRulePriority({ id: item.id }, { id: adjacent.id }, 'exchange');
            await mutate();
            void mutateAllRules();
            void mutateActivation();
            try {
                await applyRouteChanges();
                ctx.Info(t('ruleReordered'));
            } finally {
                await mutateActivation();
            }
        });
    };
    const toggleDisabled = (item: RuleItem) => {
        void runToggle(async () => {
            const draft = await getRule(item.id);
            const saved = await saveRule(item.id, { ...draft, rule: { ...draft.rule, disabled: !item.disabled } });
            await refreshCache(["/api/v2/route/rules/detail", item.id], saved, { revalidate: false });
            await mutate();
            await mutateActivation();
            try {
                await applyRouteChanges();
                ctx.Info(item.disabled ? "rule enabled and applied" : "rule disabled and applied");
            } finally {
                await mutateActivation();
            }
        });
    };

    const refresh = () => {
        void mutate();
        void mutateAllRules();
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
                <div><h1 className="text-3xl font-semibold tracking-tight text-ui-heading">{t('routingTask')}</h1><p className="mt-2 text-sm text-ui-muted">{t('routingOverviewHelp')}</p></div>
                <Button variant="primary" onClick={newRule} disabled={toggling || reordering || editorState.pending || creating}><Plus size={16} className="mr-1.5" />{uiT('add')}</Button>
            </header>
            <div className={showEditor ? 'hidden md:block' : undefined}>
                <RouteConfigCard destinations={destinations} onSaved={() => { void mutateActivation(); }} />
            </div>
            <RouteActivationProgress status={activation} onApplied={mutateActivation} />
            <WorkspaceLayout className={showEditor ? 'md:mt-6' : 'mt-6'}>
                <WorkspaceDirectory label={t('ruleDirectory')} hiddenOnMobile={showEditor}>
                    <div className="mb-2 space-y-2 border-b border-ui-border/50 px-1 pb-3">
                        <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold text-ui-heading">{uiT('routeRules')}</h2>{isValidating && <Spinner size="sm" />}</div>
                        <p className="text-xs text-ui-muted">{t('ruleOrderHelp', { count: data.page.total })}</p>
                        <FilterSearch className="w-full" onEnter={v => { setPage(1); setQuery(v); }} size="sm" />
                    </div>
                    <div className="max-h-[min(72vh,900px)] overflow-y-auto overscroll-contain">
                        {error ? <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading> : <RuleList items={data.items} selectedId={creating ? undefined : editing?.id} destinations={destinations}
                            resolverNames={Object.fromEntries((resolversData?.items ?? []).map(item => [item.id, item.name]))}
                            page={data.page.page || page} pageSize={data.page.pageSize || PAGE_SIZE} total={data.page.total} filtered={Boolean(query.trim())}
                            busy={toggling || reordering || isValidating || editorState.pending || editorState.dirty}
                            onOpen={selectRule} onPriority={setPriorityItem} onToggle={toggleDisabled} onMove={moveRule} />}
                    </div>
                    {Math.ceil(data.page.total / (data.page.pageSize || PAGE_SIZE)) > 1 && <div className="flex justify-center border-t border-ui-border/60 pt-3">
                        <Pagination currentPage={data.page.page || page} totalItems={data.page.total} pageSize={data.page.pageSize || PAGE_SIZE} onPageChange={setPage} />
                    </div>}
                </WorkspaceDirectory>
                <WorkspaceDetail hiddenOnMobile={!showEditor}>
                    {showEditor ? <RuleEditor key={creating ? 'new-rule' : editing?.id} item={editing} creating={creating} initial={linkedDraft}
                        options={editorOptions} blocked={toggling || reordering} onSaved={saved} onBack={backToRules} onStateChange={setEditorState} />
                        : <div className="flex min-h-80 flex-col items-center justify-center gap-3 p-6 text-center text-ui-muted">
                            <ListFilter size={28} aria-hidden="true" /><h2 className="text-lg font-medium text-ui-heading">{t('selectRule')}</h2>
                            <p className="max-w-sm text-sm">{t('selectRuleHelp')}</p><Button variant="outline-primary" className="gap-2" onClick={newRule}><Plus size={16} />{uiT('newRouteRule')}</Button>
                        </div>}
                </WorkspaceDetail>
            </WorkspaceLayout>
            <PriorityModal item={priorityItem} items={allRules?.items ?? data.items} onSaved={() => { refresh(); if (editing) void refreshCache(["/api/v2/route/rules/detail", editing.id]); setPriorityItem(null); }} onClose={() => setPriorityItem(null)} />
        </MainContainer>
    );
}

function RouteConfigCard({ onSaved, destinations }: { onSaved: () => void; destinations: Record<string, string> }) {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');

    const ctx = useContext(GlobalToastContext);
    const { data: server, error, isLoading, mutate } = useSWR("/api/v2/route/config", getRouteConfig, { revalidateOnFocus: false });

    const { value: data, setValue: setDraft, commit, dirty } = useEditorDraft("getRouteConfig", server, () => undefined);
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
    const destination = !target?.type || target.type === 'default' ? t('defaultProxy') : destinations[`${target.type}:${target.id}`] ?? t('unavailableDestination');
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

            <div className="mt-4 flex justify-end">
                <Button size="sm" variant="outline-primary" disabled={saving || !data || Boolean(error)} onClick={save}>
                    {saving ? <Spinner size="sm" className="mr-2" /> : <Save size={16} className="mr-2" />}
                    {t("saveAndApply")}</Button>
            </div>
        </fieldset>
    </details>;
}

function PriorityModal({ item, items, onSaved, onClose }: { item: RuleItem | null; items: RuleItem[]; onSaved: () => void; onClose: () => void }) {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');
    const { mutate: refreshCache } = useSWRConfig();

    const ctx = useContext(GlobalToastContext);
    const [target, setTarget] = useState("");
    const [operate, setOperate] = useState<PriorityOperate>("exchange");
    const [committed, setCommitted] = useState(false);
    const [actionError, setActionError] = useState('');
    const { pending: saving, run } = useAsyncAction(error => { const message = String((error as { msg?: string })?.msg ?? error); setActionError(message); ctx.Error(message); void refreshCache('/api/v2/route/activation'); });
    const close = useCloseGuard(false, saving, onClose);

    useEffect(() => {
        if (!item) return;
        setTarget(item.id);
        setCommitted(false); setActionError('');
        setOperate("exchange");
    }, [item]);

    const apply = () => {
        if (!item || saving) return;
        if (!committed && !items.some(value => value.id === target)) { setActionError(t('resourceUnavailable')); return; }
        void run(async () => {
            setActionError('');
            if (!committed) {
                await changeRulePriority({ id:item.id }, { id:target }, operate);
                setCommitted(true);
                void refreshCache(key => key === '/api/v2/route/rules/all' || Array.isArray(key) && key[0] === '/api/v2/route/rules');
            }
            void refreshCache('/api/v2/route/activation');
            await applyRouteChanges();
            onSaved();
        });
    };

    return (
        <Modal open={!!item} onOpenChange={(open) => !open && close()}>
            <ModalContent width={520}>
                <ModalHeader closeButton>
                    <ModalTitle>{uiT("changePriority")}</ModalTitle>
                </ModalHeader>
                <ModalBody className="p-5 sm:p-6">
                    {actionError && <p role="alert" className="mb-3 text-sm text-ui-danger">{actionError}</p>}
                    {item && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-ui-lg border border-ui-border bg-ui-surface-muted p-3">
                                <Badge variant="primary">#{item.index}</Badge>
                                <span className="min-w-0 truncate font-bold">{item.name}</span>
                            </div>
                            <div>
                                <div className="mb-2 text-sm font-semibold text-ui-muted">{uiT("targetRule")}</div>
                                <Select
                                    ariaLabel={uiT("targetRule")} disabled={saving || committed} value={target}
                                    onValueChange={setTarget}
                                    items={items.map((rule) => ({
                                        value: rule.id,
                                        label: `#${rule.index} - ${rule.name}`,
                                    }))}
                                    triggerClassName="w-full"
                                />
                            </div>
                            <div>
                                <div className="mb-2 text-sm font-semibold text-ui-muted">{uiT("operation")}</div>
                                <Select
                                    ariaLabel={uiT("operation")} disabled={saving || committed} value={operate}
                                    onValueChange={(value) => setOperate(value as PriorityOperate)}
                                    items={[
                                        { value: "exchange", label: "Exchange" },
                                        { value: "insert_before", label: "Insert Before" },
                                        { value: "insert_after", label: "Insert After" },
                                    ]}
                                    triggerClassName="w-full"
                                />
                            </div>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={apply} disabled={saving || !item}>
                        {saving ? <Spinner size="sm" className="mr-2" /> : <Save size={16} className="mr-2" />}
                        {t(committed ? "retryApply" : "saveAndApply")}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default BypassComponent;
