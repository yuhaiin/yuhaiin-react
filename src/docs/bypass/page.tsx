import { RouteRuleForm, includeCurrent, type RuleEditorOptions } from "./rule-form";
import { useServerPageClamp } from "@/hooks/use-pagination";
import { collectPages } from "@/api/paging";
import { useTranslation } from 'react-i18next';
import { useAsyncAction, useCloseGuard, useEditorDraft } from "@/hooks/use-editor-draft";

import { listInbounds } from "@/api/inbounds";
import { listResolvers } from "@/api/resolvers";
import { changeRulePriority, createRule, deleteRule, getRouteActivationStatus, getRouteConfig, getRule, listRouteLists, listRules, saveRouteConfig, saveRule } from "@/api/route";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardFooter, CardHeader, FilterSearch, IconBox, MainContainer } from "@/component/v2/card";
import { SettingSelectVertical, SwitchCard } from "@/component/v2/forms";

import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Pagination } from "@/component/v2/pagination";
import { RouteActivationProgress } from "@/component/v2/route-activation-progress";
import { Select } from "@/component/v2/select";
import { Spinner } from "@/component/v2/spinner";
import { Switch } from "@/component/v2/switch";
import { GlobalToastContext } from "@/component/v2/toast";
import type { RouteRule, RuleItem } from "@/contract/route";
import { createDefaultRule } from "@/contract/route";
import clsx from "clsx";
import { ArrowUpDown, Plus, Route, Save, ShieldCheck, Trash } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
type PriorityOperate = "exchange" | "insert_before" | "insert_after";
const PAGE_SIZE = 8;

function modeTextTone(mode: string): string {
    switch (mode.toLowerCase()) {
        case "proxy":
            return "text-ui-primary";
        case "direct":
            return "text-ui-success";
        case "block":
            return "text-ui-danger";
        case "bypass":
            return "text-ui-warning";
        default:
            return "text-ui-muted";
    }
}

const RuleTableRow = ({
    item,
    onOpen,
    onPriority,
    onToggle,
}: {
    item: RuleItem;
    onOpen: () => void;
    onPriority: () => void;
    onToggle: () => void;
}) => {
    const { t: uiT } = useTranslation('ui');
    return (
    <div
        role="row"
        className={clsx(
            "min-w-0 cursor-pointer border-b border-ui-border/70 px-4 py-2.5 last:border-b-0 md:grid md:grid-cols-[2.5rem_minmax(0,2fr)_4rem_3rem_minmax(0,1fr)_minmax(0,1fr)_5rem] md:items-center md:gap-3 md:py-2",
            item.disabled && "opacity-60",
        )}
        onClick={onOpen}
    >
        <div role="cell" className="hidden font-mono text-xs font-semibold tabular-nums text-ui-muted md:block">
            #{item.index}
        </div>
        <div role="cell" className="flex min-w-0 items-center justify-between gap-3">
            <span className="shrink-0 font-mono text-xs font-semibold tabular-nums text-ui-muted md:hidden">
                #{item.index}
            </span>
            <div className="min-w-0 flex-1">
                <button
                    type="button"
                    className="block max-w-full min-w-0 text-left text-sm font-semibold text-ui-heading underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus"
                    onClick={(event) => {
                        event.stopPropagation();
                        onOpen();
                    }}
                    aria-label={item.name}
                    title={item.name}
                >
                    <span className="block truncate">{item.name}</span>
                </button>
                <div className="mt-1 flex min-w-0 items-center gap-2 text-xs md:hidden">
                    <span className={clsx("font-semibold", modeTextTone(item.mode))}>{item.mode || "Unknown"}</span>
                    <span className="text-ui-muted">{item.ruleCount} {uiT("rules")}</span>
                    {item.tag && <span className="min-w-0 truncate text-ui-muted"><span className="font-medium">{uiT("tag")}</span>: {item.tag}</span>}
                    {item.resolver && <span className="min-w-0 truncate font-mono text-ui-muted"><span className="font-sans font-medium">{uiT("resolver")}</span>: {item.resolver}</span>}
                </div>
            </div>
            <div
                className="flex shrink-0 items-center gap-1.5 md:hidden"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
            >
                <Button
                    type="button"
                    size="icon"
                    variant="outline-secondary"
                    className="h-7 w-7"
                    onClick={onPriority}
                    aria-label={uiT("changePriority")}
                    title={uiT("changePriority")}
                >
                    <ArrowUpDown size={14} />
                </Button>
                <span id={`route-rule-enabled-mobile-${item.index}`} className="sr-only">{uiT("enabled")} {item.name}</span>
                <Switch
                    checked={!item.disabled}
                    onCheckedChange={onToggle}
                    aria-labelledby={`route-rule-enabled-mobile-${item.index}`}
                />
            </div>
        </div>
        <div role="cell" className={clsx("hidden text-xs font-semibold capitalize md:block", modeTextTone(item.mode))}>
            {item.mode || "Unknown"}
        </div>
        <div role="cell" className="hidden text-sm tabular-nums text-ui-muted md:block">
            {item.ruleCount}
        </div>
        <div role="cell" className="hidden min-w-0 truncate text-sm text-ui-muted md:block" title={item.tag || undefined}>
            {item.tag || "—"}
        </div>
        <div role="cell" className="hidden min-w-0 truncate font-mono text-xs text-ui-muted md:block" title={item.resolver || undefined}>
            {item.resolver || "Default"}
        </div>
        <div
            role="cell"
            className="hidden items-center justify-end gap-1.5 md:flex"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
        >
            <Button
                type="button"
                size="icon"
                variant="outline-secondary"
                className="h-7 w-7"
                onClick={onPriority}
                aria-label={uiT("changePriority")}
                title={uiT("changePriority")}
            >
                <ArrowUpDown size={14} />
            </Button>
            <span id={`route-rule-enabled-${item.index}`} className="sr-only">{uiT("enabled")} {item.name}</span>
            <Switch
                checked={!item.disabled}
                onCheckedChange={onToggle}
                aria-labelledby={`route-rule-enabled-${item.index}`}
            />
        </div>
    </div>
);
};

const RuleTable = ({
    items,
    onOpen,
    onPriority,
    onToggle,
}: {
    items: RuleItem[];
    onOpen: (item: RuleItem) => void;
    onPriority: (item: RuleItem) => void;
    onToggle: (item: RuleItem) => void;
}) => {
    const { t: uiT } = useTranslation('ui');
    return (
    <div role="table" className="min-w-0">
        <div role="row" className="hidden border-b border-ui-border bg-ui-surface-muted/50 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-wide text-ui-muted md:grid md:grid-cols-[2.5rem_minmax(0,2fr)_4rem_3rem_minmax(0,1fr)_minmax(0,1fr)_5rem] md:items-center md:gap-3">
            <span role="columnheader">{uiT("order")}</span>
            <span role="columnheader">{uiT("name")}</span>
            <span role="columnheader">{uiT("mode")}</span>
            <span role="columnheader">{uiT("rules")}</span>
            <span role="columnheader">{uiT("tag")}</span>
            <span role="columnheader">{uiT("resolver")}</span>
            <span role="columnheader" className="sr-only">{uiT("control")}</span>
        </div>
        {items.length > 0 ? items.map((item) => (
            <RuleTableRow
                key={`${item.name}-${item.index}`}
                item={item}
                onOpen={() => onOpen(item)}
                onPriority={() => onPriority(item)}
                onToggle={() => onToggle(item)}
            />
        )) : (
            <div className="px-4 py-8 text-center text-sm text-ui-muted">{uiT("noRecordsFound")}</div>
        )}
    </div>
);
};

function BypassComponent() {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState("");
    const [editing, setEditing] = useState<RuleItem | null>(null);
    const [priorityItem, setPriorityItem] = useState<RuleItem | null>(null);
    const [creating, setCreating] = useState(false);
    const { data: activation, mutate: mutateActivation } = useSWR(
        "/api/v2/route/activation",
        getRouteActivationStatus,
        {
            revalidateOnFocus: false,
            refreshInterval: (status) => Math.max(status?.hostIndexRefreshAt ?? 0, status?.ruleApplyAt ?? 0) > Date.now() ? 1000 : 0,
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

    const editorOptions = useMemo<RuleEditorOptions>(() => ({
        lists: (listsData?.items ?? []).map(item => item.name).sort((a, b) => a.localeCompare(b)),
        inbounds: (inboundsData?.items ?? []).map(item => item.id).sort((a, b) => a.localeCompare(b)),
        resolvers: (resolversData?.items ?? []).map(item => item.id).sort((a, b) => a.localeCompare(b)),
    }), [inboundsData?.items, listsData?.items, resolversData?.items]);

    const toggleDisabled = (item: RuleItem) => {
        getRule(item.name, item.index)
            .then((rule) => saveRule(item.name, item.index, { ...rule, disabled: !item.disabled }))
            .then(() => {
                ctx.Info(item.disabled ? "rule enabled" : "rule disabled");
                mutate();
                void mutateActivation();
            })
            .catch((err) => ctx.Error(err.msg ?? String(err)));
    };

    const saved = () => {
        mutate();
        mutateAllRules();
        void mutateActivation();
        setEditing(null);
        setPriorityItem(null);
        setCreating(false);
    };

    if (error) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
    if (isLoading || !data) return <Loading />

    return (
        <MainContainer>
            <RouteConfigCard resolvers={editorOptions.resolvers} />
            <RouteActivationProgress status={activation} onApplied={mutateActivation} />
            <Card density="compact" className="overflow-hidden shadow-ui-card">
                <CardHeader>
                    <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <IconBox
                            icon={Route}
                            tone="primary"
                            title={uiT("routeRules")}
                            description={`${data.page.total} rules · match from top to bottom`}
                        />
                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                            {isValidating && <Spinner size="sm" />}
                            <FilterSearch className="min-w-0 flex-1 sm:w-[200px] sm:flex-none" onEnter={(v) => { setPage(1); setQuery(v); }} size="sm" />
                            <Button size="sm" onClick={() => setCreating(true)}><Plus size={16} className="mr-1" /> {uiT("add")}</Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody density="compact" className="!p-0">
                    <RuleTable
                        items={data.items}
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
            <RuleEditorModal item={editing} options={editorOptions} onSaved={saved} onClose={() => setEditing(null)} />
            <PriorityModal item={priorityItem} items={allRules?.items ?? data.items} onSaved={saved} onClose={() => setPriorityItem(null)} />
            <CreateRuleModal open={creating} options={editorOptions} onSaved={saved} onClose={() => setCreating(false)} />
        </MainContainer>
    );
}

function RouteConfigCard({ resolvers }: { resolvers: string[] }) {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const { data: server, error, isLoading, mutate } = useSWR("/api/v2/route/config", getRouteConfig, { revalidateOnFocus: false });

    const { value: data, setValue: setDraft, commit, dirty } = useEditorDraft("getRouteConfig", server, () => undefined);
    const { pending: saving, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    useCloseGuard(dirty, saving, () => undefined);
    const patch = (patchValue: Partial<NonNullable<typeof data>>) => setDraft(prev => prev ? { ...prev, ...patchValue } : prev);
    const save = () => {
        if (!data || saving || error || isLoading) return;
        void run(async () => {
            const next = await saveRouteConfig(data);
            commit(next);
            await mutate(next, { revalidate: false });
            ctx.Info("route config saved");
        });
    };

    return (
        <Card className="mb-4">
            <fieldset disabled={saving} className="contents">
            <CardHeader>
                <IconBox icon={ShieldCheck} tone="danger" title={uiT("globalBypassSettings")} description={uiT("dnsResolutionAndRoutingStrategy")} />
            </CardHeader>
            <CardBody>
                {error ? (
                    <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
                ) : data ? (
                    <div className="grid gap-8">
                        {isLoading && <Spinner size="sm" />}
                        <section className="grid gap-4">
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
                            <SettingSelectVertical label={uiT("directResolver")} value={data.directResolver} values={includeCurrent(resolvers, data.directResolver)} onChange={(directResolver) => patch({ directResolver })} emptyChoose emptyChooseName={uiT("globalDefault")} />
                            <SettingSelectVertical label={uiT("proxyResolver")} value={data.proxyResolver} values={includeCurrent(resolvers, data.proxyResolver)} onChange={(proxyResolver) => patch({ proxyResolver })} emptyChoose emptyChooseName={uiT("globalDefault")} />
                        </section>
                    </div>
                ) : (
                    <Loading />
                )}
            </CardBody>
            <CardFooter className="flex justify-end">
                <Button disabled={saving || !data || Boolean(error)} onClick={save}>
                    {saving ? <Spinner size="sm" className="mr-2" /> : <Save size={16} className="mr-2" />}
                    {uiT("saveConfiguration")}</Button>
            </CardFooter>
            </fieldset>
        </Card>
    );
}

function RuleEditorModal({ item, options, onSaved, onClose }: { item: RuleItem | null; options: RuleEditorOptions; onSaved: () => void; onClose: () => void }) {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useSWR(item ? ["/api/v2/route/rules/detail", item.name, item.index] : null, () => getRule(item!.name, item!.index), { revalidateOnFocus: false });

    const { value: draft, setValue: setDraft, dirty } = useEditorDraft(item ? JSON.stringify([item.name, item.index]) : null, data, createDefaultRule);
    const { pending, run } = useAsyncAction(error => ctx.Error(error instanceof Error ? error.message : String((error as { msg?: string })?.msg ?? error)));
    const close = useCloseGuard(dirty, pending, onClose);
    const save = () => {
        if (!item || !data || error || isLoading || pending) return;
        void run(async () => {
            await saveRule(item.name, item.index, draft);
            ctx.Info("rule saved");
            onSaved();
        });
    };
    const remove = () => {
        if (!item || pending || !data || error || isLoading || !window.confirm("Delete this rule?")) return;
        void run(async () => {
            await deleteRule(item.name, item.index);
            ctx.Info("rule deleted");
            onSaved();
        });
    };

    return (
        <Modal open={!!item} onOpenChange={(open) => !open && close()}>
            <ModalContent width={820}>
                <ModalHeader closeButton><ModalTitle>{item?.name}</ModalTitle></ModalHeader>
                <ModalBody>
                    <fieldset disabled={pending} className="contents">
                    {error && <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>}
                    {isLoading && <Loading />}
                    {!isLoading && !error && data && <RouteRuleForm value={draft} onChange={setDraft} options={options} lockName />}
                </fieldset>
                </ModalBody>
                <ModalFooter className="flex flex-wrap items-center justify-between gap-3">
                    <Button variant="outline-danger" disabled={pending || isLoading || Boolean(error) || !data} onClick={remove}>
                        <Trash size={16} /> {uiT("deleteRule")}</Button>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button onClick={close} disabled={pending}>{uiT("cancel")}</Button>
                        <Button disabled={pending || isLoading || Boolean(error) || !data} onClick={save}><Save size={16} /> {uiT("save")}</Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

function CreateRuleModal({ open, options, onSaved, onClose }: { open: boolean; options: RuleEditorOptions; onSaved: () => void; onClose: () => void }) {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const [draft, setDraft] = useState<RouteRule>(createDefaultRule());

    useEffect(() => {
        if (open) {
            setDraft(createDefaultRule());
        }
    }, [open]);

    const { pending, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    const close = useCloseGuard(JSON.stringify(draft) !== JSON.stringify(createDefaultRule()), pending, onClose);

    const save = () => {
        if (pending || !draft.name.trim()) return;
        void run(async () => {
        await createRule(draft);
        ctx.Info("rule created");
        onSaved();
        });
    };

    return (
        <Modal open={open} onOpenChange={(next) => !next && close()}>
            <ModalContent width={820}>
                <ModalHeader closeButton><ModalTitle>{uiT("newRouteRule")}</ModalTitle></ModalHeader>
                <ModalBody>
                    <fieldset disabled={pending} className="contents">
                    <RouteRuleForm value={draft} onChange={setDraft} options={options} />
                </fieldset>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={save} disabled={pending || !draft.name.trim()}><Save size={16} /> {uiT("save")}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

function PriorityModal({ item, items, onSaved, onClose }: { item: RuleItem | null; items: RuleItem[]; onSaved: () => void; onClose: () => void }) {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const [target, setTarget] = useState("");
    const [operate, setOperate] = useState<PriorityOperate>("exchange");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!item) return;
        setTarget(ruleKey(item));
        setOperate("exchange");
    }, [item]);

    const apply = () => {
        if (!item) return;
        const targetItem = items.find((value) => ruleKey(value) === target);
        if (!targetItem) {
            ctx.Error("target rule not found on current page");
            return;
        }
        setSaving(true);
        changeRulePriority(
            { name: item.name, index: item.index },
            { name: targetItem.name, index: targetItem.index },
            operate,
        )
            .then(() => {
                ctx.Info("rule priority changed");
                onSaved();
            })
            .catch((err) => ctx.Error(err.msg ?? String(err)))
            .finally(() => setSaving(false));
    };

    return (
        <Modal open={!!item} onOpenChange={(open) => !open && onClose()}>
            <ModalContent width={520}>
                <ModalHeader closeButton>
                    <ModalTitle>{uiT("changePriority")}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    {item && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-ui-lg border border-ui-border bg-ui-surface-muted p-3">
                                <Badge variant="primary">#{item.index}</Badge>
                                <span className="min-w-0 truncate font-bold">{item.name}</span>
                            </div>
                            <div>
                                <div className="mb-2 text-sm font-semibold text-ui-muted">{uiT("targetRule")}</div>
                                <Select
                                    value={target}
                                    onValueChange={setTarget}
                                    items={items.map((rule) => ({
                                        value: ruleKey(rule),
                                        label: `#${rule.index} - ${rule.name}`,
                                    }))}
                                    triggerClassName="w-full"
                                />
                            </div>
                            <div>
                                <div className="mb-2 text-sm font-semibold text-ui-muted">{uiT("operation")}</div>
                                <Select
                                    value={operate}
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
                        {uiT("apply")}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

function ruleKey(item: Pick<RuleItem, "name" | "index">): string {
    return `${item.name}::${item.index}`;
}

export default BypassComponent;
