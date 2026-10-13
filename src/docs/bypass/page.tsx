import { clearHashSearch, useHashSearch } from "@/hooks/useHashLocation";
import { connectionRuleDraft } from "@/docs/connections/actions";
import { listNodes } from "@/api/nodes";
import { listSelectors } from "@/api/selectors";
import { RuleDraftForm } from "./draft-form";
import { draftForSave } from "./draft";
import { ResolverPicker } from "@/component/resolver-picker";
import { RouteTargetPicker } from "@/component/route-target-picker";
import { type RuleEditorOptions } from "./rule-form";
import { useServerPageClamp } from "@/hooks/use-pagination";
import { collectPages } from "@/api/paging";
import { useTranslation } from 'react-i18next';
import { useAsyncAction, useCloseGuard, useEditorDraft } from "@/hooks/use-editor-draft";

import { listInbounds } from "@/api/inbounds";
import { listResolvers } from "@/api/resolvers";
import { applyRouteChanges, changeRulePriority, createRule, deleteRule, getRouteActivationStatus, getRouteConfig, getRule, listRouteLists, listRules, saveRouteConfig, saveRule } from "@/api/route";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardFooter, CardHeader, FilterSearch, MainContainer, SettingLabel } from "@/component/v2/card";
import { SettingSelectVertical, SwitchCard } from "@/component/v2/forms";

import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Pagination } from "@/component/v2/pagination";
import { RouteActivationProgress } from "@/component/v2/route-activation-progress";
import { Select } from "@/component/v2/select";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import type { RuleDraft, RuleItem } from "@/contract/route";
import { createDefaultRuleDraft } from "@/contract/route";
import { RuleTable } from "./rule-table";
import { ArrowRight, Plus, Route, Save, ShieldCheck, Trash } from "lucide-react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
type PriorityOperate = "exchange" | "insert_before" | "insert_after";
const PAGE_SIZE = 8;

function BypassComponent() {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');

    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState("");
    const [localEditing, setEditing] = useState<RuleItem | null>(null);
    const search = useHashSearch();
    const linkedId = new URLSearchParams(search).get('rule');
    const linkedDraft = useMemo(() => connectionRuleDraft(search), [search]);
    const editing = localEditing ?? (linkedId ? { id: linkedId, name: '' } : null);
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
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        ["/api/v2/route/rules", page, query],
        () => listRules({ page, pageSize: PAGE_SIZE, query }),
        { revalidateOnFocus: false },
    );
    useServerPageClamp(data?.page, page, setPage);
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
    const toggleDisabled = (item: RuleItem) => {
        void runToggle(async () => {
            const draft = await getRule(item.id);
            await saveRule(item.id, { ...draft, rule: { ...draft.rule, disabled: !item.disabled } });
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

    const saved = () => {
        mutate();
        mutateAllRules();
        void mutateActivation();
        setEditing(null);
        setPriorityItem(null);
        setCreating(false);
        closeLink();
    };

    if (error) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
    if (isLoading || !data) return <Loading />

    return (
        <MainContainer>
            <header className="mb-6 flex items-start gap-3">
                <span className="mt-1 rounded-ui-lg bg-ui-primary-soft p-2.5 text-ui-primary"><Route size={22} aria-hidden="true" /></span>
                <div><h1 className="text-2xl font-semibold tracking-tight text-ui-heading">{t('routingTask')}</h1><p className="mt-1 text-sm text-ui-muted">{t('routingOverviewHelp')}</p></div>
            </header>
            <RouteConfigCard onSaved={() => { void mutateActivation(); }} />
            <RouteActivationProgress status={activation} onApplied={mutateActivation} />
            <Card density="compact" className="overflow-hidden shadow-none">
                <CardHeader>
                    <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div><h2 className="text-lg font-semibold text-ui-heading">{uiT('routeRules')}</h2><p className="mt-1 text-xs text-ui-muted">{t('ruleOrderHelp', { count: data.page.total })}</p></div>
                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                            {isValidating && <Spinner size="sm" />}
                            <FilterSearch className="min-w-0 flex-1 sm:w-[200px] sm:flex-none" onEnter={(v) => { setPage(1); setQuery(v); }} size="sm" />
                            <Button size="sm" variant="primary" onClick={() => setCreating(true)}><Plus size={16} className="mr-1" /> {uiT("add")}</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody density="compact" className="!p-0">
                    <RuleTable
                        items={data.items}
                        destinations={destinations}
                        resolverNames={Object.fromEntries((resolversData?.items ?? []).map(item => [item.id, item.name]))}
                        busy={toggling}
                        onOpen={setEditing}
                        onPriority={setPriorityItem}
                        onToggle={toggleDisabled}
                    />
                </CardBody>
                {Math.ceil(data.page.total / (data.page.pageSize || PAGE_SIZE)) > 1 && (
                    <CardFooter compact className="flex justify-center">
                        <Pagination currentPage={data.page.page || page} totalItems={data.page.total} pageSize={data.page.pageSize || PAGE_SIZE} onPageChange={setPage} />
                    </CardFooter>
                )}
            </Card>
            <RuleEditorModal item={editing} options={editorOptions} onSaved={saved} onClose={() => { setEditing(null); closeLink(); }} />
            <PriorityModal item={priorityItem} items={allRules?.items ?? data.items} onSaved={saved} onClose={() => setPriorityItem(null)} />
            <CreateRuleModal open={creating} initial={linkedDraft} options={editorOptions} onSaved={saved} onClose={() => { setCreating(false); closeLink(); }} />
        </MainContainer>
    );
}

function RouteConfigCard({ onSaved }: { onSaved: () => void }) {
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

    return (
        <Card className="mb-6 border-ui-border/70 bg-ui-surface-muted/40 shadow-none">
            <fieldset disabled={saving} className="contents">
            <CardBody className="p-5">
                <div className="grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
                    <div><h2 className="flex items-center gap-2 text-sm font-semibold text-ui-heading"><ShieldCheck size={17} className="shrink-0 text-ui-muted" aria-hidden="true" />{t('unmatchedTraffic')}</h2><p className="mt-2 text-xs leading-relaxed text-ui-muted">{t('defaultRoutingHelp')}</p></div>
                {error ? (
                    <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
                ) : data ? (
                    <div className="min-w-0 space-y-4">
                        {isLoading && <Spinner size="sm" />}
                        <section className="grid grid-cols-2 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.25fr)]">
                            <SettingSelectVertical className="mb-0" label={t('defaultAction')} value={data.defaultMode}
                                values={[[t('proxy'), 'proxy'], [t('direct'), 'direct'], [t('block'), 'block']]}
                                onChange={defaultMode => patch({ defaultMode, defaultTarget: defaultMode === 'proxy' ? data.defaultTarget : { type: 'default' } })} />
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
                </div>
            </CardBody>
            <CardFooter compact className="flex justify-end border-ui-border/70 bg-transparent">
                <Button size="sm" variant="outline-primary" disabled={saving || !data || Boolean(error)} onClick={save}>
                    {saving ? <Spinner size="sm" className="mr-2" /> : <Save size={16} className="mr-2" />}
                    {t("saveAndApply")}</Button>
            </CardFooter>
            </fieldset>
        </Card>
    );
}

function RuleEditorModal({ item, options, onSaved, onClose }: { item: Pick<RuleItem, "id" | "name"> | null; options: RuleEditorOptions; onSaved: () => void; onClose: () => void }) {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');
    const { mutate: refreshCache } = useSWRConfig();
    const [actionError, setActionError] = useState('');
    const [deleted, setDeleted] = useState(false);
    useEffect(() => { setActionError(''); setDeleted(false); }, [item?.id]);

    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useSWR(item ? ["/api/v2/route/rules/detail", item.id] : null, () => getRule(item!.id), { revalidateOnFocus: false });

    const { value: draft, setValue: setDraft, dirty, commit } = useEditorDraft(item ? item.id : null, data, createDefaultRuleDraft);
    const { pending, run } = useAsyncAction(error => { const message = error instanceof Error ? error.message : String((error as { msg?: string })?.msg ?? error); setActionError(message); ctx.Error(message); void refreshCache("/api/v2/route/activation"); });
    const close = useCloseGuard(dirty, pending, onClose);
    const save = () => {
        if (!item || !data || error || isLoading || pending) return;
        void run(async () => {
            setActionError('');
            if (dirty && !deleted) {
                const saved = await saveRule(item.id, draftForSave(draft));
                commit(saved);
                await mutate(saved, { revalidate: false });
                void refreshCache("/api/v2/route/lists/options");
            }
            void refreshCache("/api/v2/route/activation");
            await applyRouteChanges();
            ctx.Info("rule applied");
            onSaved();
        });
    };
    const remove = () => {
        if (!item || pending || !data || error || isLoading || !window.confirm("Delete this rule?")) return;
        void run(async () => {
            await deleteRule(item.id);
            setDeleted(true);
            commit(draft);
            void refreshCache("/api/v2/route/activation");
            await applyRouteChanges();
            ctx.Info("rule deleted");
            onSaved();
        });
    };

    return (
        <Modal open={!!item} onOpenChange={(open) => !open && close()}>
            <ModalContent width={760} className="p-0">
                <ModalHeader closeButton className="px-6 py-5"><ModalTitle className="font-semibold">{draft.rule.name || item?.name}</ModalTitle></ModalHeader>
                <ModalBody className="p-5 sm:p-6">
                    <fieldset disabled={pending} className="contents">
                    {error && <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>}
                    {isLoading && <Loading />}
                    {actionError && <p role="alert" className="mb-3 text-sm text-ui-danger">{actionError}</p>}
                    {!isLoading && !error && data && !deleted && <RuleDraftForm value={draft} onChange={setDraft} options={options} />}
                </fieldset>
                </ModalBody>
                <ModalFooter className="flex flex-wrap items-center justify-between gap-3 bg-ui-surface-muted/50 px-5 sm:px-6">
                    <Button variant="outline-danger" className="border-transparent" aria-label={uiT("deleteRule")} title={uiT("deleteRule")} disabled={pending || deleted || isLoading || Boolean(error) || !data} onClick={remove}>
                        <Trash size={16} /><span className="hidden sm:inline">{uiT("deleteRule")}</span></Button>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button onClick={close} disabled={pending}>{uiT("cancel")}</Button>
                        <Button variant="primary" disabled={pending || isLoading || Boolean(error) || !data} onClick={save}><Save size={16} /> {t(actionError && !dirty ? "retryApply" : "saveAndApply")}</Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

function CreateRuleModal({ open, initial, options, onSaved, onClose }: { open: boolean; initial?: RuleDraft; options: RuleEditorOptions; onSaved: () => void; onClose: () => void }) {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');
    const { mutate: refreshCache } = useSWRConfig();
    const [actionError, setActionError] = useState('');
    useEffect(() => { setActionError(''); }, [open]);

    const ctx = useContext(GlobalToastContext);
    const createDraft = useCallback(() => initial ?? createDefaultRuleDraft(), [initial]);
    const { value: draft, setValue: setDraft, dirty, commit } = useEditorDraft<RuleDraft>(open ? initial?.rule.id ?? "new-rule" : null, undefined, createDraft);

    const { pending, run } = useAsyncAction(error => { const message = String((error as { msg?: string })?.msg ?? error); setActionError(message); ctx.Error(message); void refreshCache("/api/v2/route/activation"); });
    const close = useCloseGuard(dirty, pending, onClose);

    const save = () => {
        if (pending || !draft.rule.name.trim()) return;
        void run(async () => {
        setActionError('');
        if (dirty || draft.rule.revision === 0) {
            const saved = draft.rule.revision > 0 ? await saveRule(draft.rule.id, draftForSave(draft)) : await createRule(draftForSave(draft));
            commit(saved);
            void refreshCache("/api/v2/route/lists/options");
        }
        void refreshCache("/api/v2/route/activation");
        await applyRouteChanges();
        ctx.Info("rule applied");
        onSaved();
        });
    };

    return (
        <Modal open={open} onOpenChange={(next) => !next && close()}>
            <ModalContent width={760} className="p-0">
                <ModalHeader closeButton className="px-6 py-5"><ModalTitle className="font-semibold">{uiT("newRouteRule")}</ModalTitle></ModalHeader>
                <ModalBody className="p-5 sm:p-6">
                    <fieldset disabled={pending} className="contents">
                    {actionError && <p role="alert" className="mb-3 text-sm text-ui-danger">{actionError}</p>}
                    <RuleDraftForm value={draft} onChange={setDraft} options={options} />
                </fieldset>
                </ModalBody>
                <ModalFooter className="bg-ui-surface-muted/50 px-5 sm:px-6">
                    <Button variant="primary" onClick={save} disabled={pending || !draft.rule.name.trim()}><Save size={16} /> {t(actionError && !dirty && draft.rule.revision > 0 ? "retryApply" : "saveAndApply")}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
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
