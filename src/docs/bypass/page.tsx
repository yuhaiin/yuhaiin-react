"use client"

import { listInbounds } from "@/api/inbounds";
import { listResolvers } from "@/api/resolvers";
import { changeRulePriority, createRule, deleteRule, getRouteActivationStatus, getRouteConfig, getRule, listRouteLists, listRules, saveRouteConfig, saveRule } from "@/api/route";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardFooter, CardHeader, FilterSearch, IconBox, MainContainer, SettingLabel, SettingsBox } from "@/component/v2/card";
import { DropdownSelect, SettingInputVertical, SettingSelectVertical, SwitchCard } from "@/component/v2/forms";
import { Input } from "@/component/v2/input";
import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Pagination } from "@/component/v2/pagination";
import { RouteActivationProgress } from "@/component/v2/route-activation-progress";
import { Select } from "@/component/v2/select";
import { Spinner } from "@/component/v2/spinner";
import { Switch } from "@/component/v2/switch";
import { GlobalToastContext } from "@/component/v2/toast";
import type { RouteRule, RuleExpr, RuleItem } from "@/contract/route";
import { createDefaultRule, normalizeRule } from "@/contract/route";
import clsx from "clsx";
import { ArrowUpDown, Plus, Route, Save, ShieldCheck, Trash, X } from "lucide-react";
import type { CSSProperties } from "react";
import { useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

const routeModes = ["bypass", "proxy", "block", "direct"];
const resolveStrategies = ["default", "prefer_ipv4", "prefer_ipv6", "ipv4_only", "ipv6_only"];
const udpProxyStrategies = ["udp_proxy_fqdn_strategy_default", "udp_proxy_fqdn_strategy_disabled", "udp_proxy_fqdn_strategy_resolve"];
const leafRuleExprTypes = ["host", "process", "inbound", "network", "port", "geoip"];
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
}) => (
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
                    <span className="text-ui-muted">{item.ruleCount} Rules</span>
                    {item.tag && <span className="min-w-0 truncate text-ui-muted"><span className="font-medium">Tag</span>: {item.tag}</span>}
                    {item.resolver && <span className="min-w-0 truncate font-mono text-ui-muted"><span className="font-sans font-medium">Resolver</span>: {item.resolver}</span>}
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
                    aria-label="Change Priority"
                    title="Change Priority"
                >
                    <ArrowUpDown size={14} />
                </Button>
                <span id={`route-rule-enabled-mobile-${item.index}`} className="sr-only">Enabled {item.name}</span>
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
                aria-label="Change Priority"
                title="Change Priority"
            >
                <ArrowUpDown size={14} />
            </Button>
            <span id={`route-rule-enabled-${item.index}`} className="sr-only">Enabled {item.name}</span>
            <Switch
                checked={!item.disabled}
                onCheckedChange={onToggle}
                aria-labelledby={`route-rule-enabled-${item.index}`}
            />
        </div>
    </div>
);

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
}) => (
    <div role="table" className="min-w-0">
        <div role="row" className="hidden border-b border-ui-border bg-ui-surface-muted/50 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-wide text-ui-muted md:grid md:grid-cols-[2.5rem_minmax(0,2fr)_4rem_3rem_minmax(0,1fr)_minmax(0,1fr)_5rem] md:items-center md:gap-3">
            <span role="columnheader">Order</span>
            <span role="columnheader">Name</span>
            <span role="columnheader">Mode</span>
            <span role="columnheader">Rules</span>
            <span role="columnheader">Tag</span>
            <span role="columnheader">Resolver</span>
            <span role="columnheader" className="sr-only">Control</span>
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
            <div className="px-4 py-8 text-center text-sm text-ui-muted">No records found.</div>
        )}
    </div>
);

type RuleEditorOptions = {
    lists: string[];
    inbounds: string[];
    resolvers: string[];
};

function includeCurrent(values: string[], current: string): string[] {
    if (!current || values.includes(current)) return values;
    return [current, ...values];
}

function includeSelected(values: string[], selected: string[]): string[] {
    const out = [...values];
    for (const value of selected) {
        if (value && !out.includes(value)) out.unshift(value);
    }
    return out;
}

function BypassComponent() {
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
    const needEditorOptions = creating || editing !== null;
    const { data: allRules, mutate: mutateAllRules } = useSWR(
        priorityItem ? "/api/v2/route/rules/all" : null,
        () => listRules({ page: 1, pageSize: 10000 }),
        { revalidateOnFocus: false },
    );
    const { data: listsData } = useSWR(
        needEditorOptions ? "/api/v2/route/lists/options" : null,
        () => listRouteLists({ page: 1, pageSize: 10000 }),
        { revalidateOnFocus: false },
    );
    const { data: inboundsData } = useSWR(
        needEditorOptions ? "/api/v2/inbounds/options" : null,
        () => listInbounds({ page: 1, pageSize: 10000 }),
        { revalidateOnFocus: false },
    );
    const { data: resolversData } = useSWR(
        "/api/v2/resolvers/options",
        () => listResolvers({ page: 1, pageSize: 10000 }),
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

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
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
                            title="Route Rules"
                            description={`${data.page.total} rules · match from top to bottom`}
                        />
                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                            {isValidating && <Spinner size="sm" />}
                            <FilterSearch className="min-w-0 flex-1 sm:w-[200px] sm:flex-none" onEnter={(v) => { setPage(1); setQuery(v); }} size="sm" />
                            <Button size="sm" onClick={() => setCreating(true)}><Plus size={16} className="mr-1" /> Add</Button>
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
    const ctx = useContext(GlobalToastContext);
    const [saving, setSaving] = useState(false);
    const { data, error, isLoading, mutate } = useSWR("/api/v2/route/config", getRouteConfig, { revalidateOnFocus: false });

    const patch = (patchValue: Partial<NonNullable<typeof data>>) => {
        mutate(prev => prev ? { ...prev, ...patchValue } : prev, { revalidate: false });
    };

    const save = () => {
        if (!data) return;
        setSaving(true);
        saveRouteConfig(data)
            .then((next) => {
                ctx.Info("route config saved");
                mutate(next, { revalidate: false });
            })
            .catch((err) => ctx.Error(err.msg ?? String(err)))
            .finally(() => setSaving(false));
    };

    return (
        <Card className="mb-4">
            <CardHeader>
                <IconBox icon={ShieldCheck} tone="danger" title="Global Bypass Settings" description="DNS resolution and routing strategy" />
            </CardHeader>
            <CardBody>
                {error ? (
                    <Loading code={error.code}>{error.msg}</Loading>
                ) : data ? (
                    <div className="grid gap-8">
                        {isLoading && <Spinner size="sm" />}
                        <section className="grid gap-4">
                            <div className="text-sm font-bold text-ui-muted">Resolve Strategy</div>
                            <SwitchCard
                                label="Resolve Locally"
                                description="Resolve DNS on the local device"
                                checked={data.resolveLocally}
                                onCheckedChange={(resolveLocally) => patch({ resolveLocally })}
                            />
                            <SwitchCard
                                label="UDP Proxy FQDN"
                                description="Skip local DNS resolution for UDP proxy traffic"
                                checked={data.udpProxyFqdnStrategy === "skip_resolve"}
                                onCheckedChange={(checked) => patch({ udpProxyFqdnStrategy: checked ? "skip_resolve" : "default" })}
                            />
                        </section>
                        <section className="grid gap-4">
                            <div className="text-sm font-bold text-ui-muted">Default Resolver</div>
                            <SettingSelectVertical label="Direct Resolver" value={data.directResolver} values={includeCurrent(resolvers, data.directResolver)} onChange={(directResolver) => patch({ directResolver })} emptyChoose emptyChooseName="Global Default" />
                            <SettingSelectVertical label="Proxy Resolver" value={data.proxyResolver} values={includeCurrent(resolvers, data.proxyResolver)} onChange={(proxyResolver) => patch({ proxyResolver })} emptyChoose emptyChooseName="Global Default" />
                        </section>
                    </div>
                ) : (
                    <Loading />
                )}
            </CardBody>
            <CardFooter className="flex justify-end">
                <Button disabled={saving || !data} onClick={save}>
                    {saving ? <Spinner size="sm" className="mr-2" /> : <Save size={16} className="mr-2" />}
                    Save Configuration
                </Button>
            </CardFooter>
        </Card>
    );
}

function RuleEditorModal({ item, options, onSaved, onClose }: { item: RuleItem | null; options: RuleEditorOptions; onSaved: () => void; onClose: () => void }) {
    const ctx = useContext(GlobalToastContext);
    const [draft, setDraft] = useState<RouteRule>(createDefaultRule());
    const { data, error, isLoading } = useSWR(item ? ["/api/v2/route/rules/detail", item.name, item.index] : null, () => getRule(item!.name, item!.index), { revalidateOnFocus: false });

    useEffect(() => {
        if (data) setDraft(normalizeRule(data));
    }, [data]);

    const save = () => {
        if (!item) return;
        saveRule(item.name, item.index, draft)
            .then(() => {
                ctx.Info("rule saved");
                onSaved();
            })
            .catch((err) => ctx.Error(err.msg ?? String(err)));
    };

    const remove = () => {
        if (!item) return;
        deleteRule(item.name, item.index)
            .then(() => {
                ctx.Info("rule deleted");
                onSaved();
            })
            .catch((err) => ctx.Error(err.msg ?? String(err)));
    };

    return (
        <Modal open={!!item} onOpenChange={(open) => !open && onClose()}>
            <ModalContent style={{ "--bs-modal-width": "820px" } as CSSProperties}>
                <ModalHeader closeButton><ModalTitle>{item?.name}</ModalTitle></ModalHeader>
                <ModalBody>
                    {error && <Loading code={error.code}>{error.msg}</Loading>}
                    {isLoading && <Loading />}
                    {!isLoading && !error && <RouteRuleForm value={draft} onChange={setDraft} options={options} lockName />}
                </ModalBody>
                <ModalFooter className="flex flex-wrap items-center justify-between gap-3">
                    <Button variant="outline-danger" onClick={remove}>
                        <Trash size={16} /> Delete Rule
                    </Button>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button onClick={onClose}>Cancel</Button>
                        <Button onClick={save}><Save size={16} /> Save</Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

function CreateRuleModal({ open, options, onSaved, onClose }: { open: boolean; options: RuleEditorOptions; onSaved: () => void; onClose: () => void }) {
    const ctx = useContext(GlobalToastContext);
    const [draft, setDraft] = useState<RouteRule>(createDefaultRule());

    useEffect(() => {
        if (open) {
            setDraft(createDefaultRule());
        }
    }, [open]);

    const save = () => {
        createRule(draft)
            .then(() => {
                ctx.Info("rule created");
                onSaved();
            })
            .catch((err) => ctx.Error(err.msg ?? String(err)));
    };

    return (
        <Modal open={open} onOpenChange={(next) => !next && onClose()}>
            <ModalContent style={{ "--bs-modal-width": "820px" } as CSSProperties}>
                <ModalHeader closeButton><ModalTitle>New Route Rule</ModalTitle></ModalHeader>
                <ModalBody>
                    <RouteRuleForm value={draft} onChange={setDraft} options={options} />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={save} disabled={!draft.name.trim()}><Save size={16} /> Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

function PriorityModal({ item, items, onSaved, onClose }: { item: RuleItem | null; items: RuleItem[]; onSaved: () => void; onClose: () => void }) {
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
            <ModalContent style={{ "--bs-modal-width": "520px" } as CSSProperties}>
                <ModalHeader closeButton>
                    <ModalTitle>Change Priority</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    {item && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 rounded-ui-lg border border-ui-border bg-ui-surface-muted p-3">
                                <Badge variant="primary">#{item.index}</Badge>
                                <span className="min-w-0 truncate font-bold">{item.name}</span>
                            </div>
                            <div>
                                <div className="mb-2 text-sm font-semibold text-ui-muted">Target Rule</div>
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
                                <div className="mb-2 text-sm font-semibold text-ui-muted">Operation</div>
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
                        Apply
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

function ruleKey(item: Pick<RuleItem, "name" | "index">): string {
    return `${item.name}::${item.index}`;
}

function RouteRuleForm({ value, onChange, options, lockName }: { value: RouteRule; onChange: (value: RouteRule) => void; options: RuleEditorOptions; lockName?: boolean }) {
    const patch = (patchValue: Partial<RouteRule>) => onChange(normalizeRule({ ...value, ...patchValue }));

    return (
        <div className="space-y-6">
            <SettingsBox>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {!lockName && (
                        <div className="md:col-span-2">
                            <SettingInputVertical label="Name" value={value.name} onChange={(name) => patch({ name })} />
                        </div>
                    )}
                    <div className="md:col-span-2">
                        <SwitchCard
                            label="Disabled"
                            description="Ignore this rule during routing"
                            checked={Boolean(value.disabled)}
                            onCheckedChange={(disabled) => patch({ disabled })}
                        />
                    </div>
                    <SettingSelectVertical label="Mode" value={value.mode} values={routeModes} onChange={(mode) => patch({ mode })} />
                    <SettingInputVertical label="Tag" value={value.tag ?? ""} onChange={(tag) => patch({ tag })} placeholder="Optional tag" />
                    <SettingSelectVertical label="Resolve Strategy" value={value.resolveStrategy ?? "default"} values={resolveStrategies} onChange={(resolveStrategy) => patch({ resolveStrategy })} />
                    <SettingSelectVertical
                        label="UDP FQDN Strategy"
                        value={value.udpProxyFqdnStrategy ?? "udp_proxy_fqdn_strategy_default"}
                        values={udpProxyStrategies}
                        format={formatUdpProxyStrategy}
                        onChange={(udpProxyFqdnStrategy) => patch({ udpProxyFqdnStrategy })}
                    />
                    <div className="md:col-span-2">
                        <SettingSelectVertical
                            label="Resolver"
                            value={value.resolver ?? ""}
                            values={includeCurrent(options.resolvers, value.resolver ?? "")}
                            onChange={(resolver) => patch({ resolver })}
                            emptyChoose
                            emptyChooseName="Global Default"
                        />
                    </div>
                </div>
            </SettingsBox>
            <SettingsBox>
                <SettingLabel className="mb-0">Rule Entries</SettingLabel>
                <RuleExprListEditor value={value.rules ?? []} options={options} onChange={(rules) => patch({ rules })} />
            </SettingsBox>
        </div>
    );
}

function formatUdpProxyStrategy(value: string): string {
    switch (value) {
        case "udp_proxy_fqdn_strategy_default":
            return "global";
        case "udp_proxy_fqdn_strategy_disabled":
            return "disabled";
        case "udp_proxy_fqdn_strategy_resolve":
            return "resolve";
        default:
            return value;
    }
}

function createExpr(type: string): RuleExpr {
    switch (type) {
        case "all":
            return { type, all: [] };
        case "any":
            return { type, any: [] };
        case "not":
            return { type, not: createExpr("host") };
        case "process":
            return { type, process: { list: "" } };
        case "inbound":
            return { type, inbound: { names: [] } };
        case "network":
            return { type, network: { network: "tcp" } };
        case "port":
            return { type, port: { ports: "" } };
        case "geoip":
            return { type, geoip: { countries: "" } };
        case "host":
        default:
            return { type: "host", host: { list: "" } };
    }
}

function normalizeExpr(value: RuleExpr): RuleExpr {
    return createExpr(value.type) && value;
}

function exprGroupLeaves(expr: RuleExpr): RuleExpr[] {
    if (expr.type === "all") return expr.all ?? [];
    return [expr];
}

function groupToExpr(leaves: RuleExpr[]): RuleExpr {
    return { type: "all", all: leaves.length > 0 ? leaves : [createExpr("host")] };
}

function RuleExprListEditor({ value, options, onChange }: { value: RuleExpr[]; options: RuleEditorOptions; onChange: (value: RuleExpr[]) => void }) {
    const groups = (Array.isArray(value) ? value : []).map(exprGroupLeaves);
    const safeGroups = groups.length > 0 ? groups : [[createExpr("host")]];
    const updateGroups = (next: RuleExpr[][]) => onChange(next.map(groupToExpr));

    return (
        <div className="flex min-w-0 flex-col gap-2">
            {safeGroups.map((group, index) => (
                <div key={index}>
                    {index > 0 && <OrSeparator />}
                    <RuleExprGroupEditor
                        value={group}
                        options={options}
                        onChange={(next) => {
                            const nextGroups = [...safeGroups];
                            nextGroups[index] = next;
                            updateGroups(nextGroups);
                        }}
                        onRemove={() => {
                            const nextGroups = safeGroups.filter((_, current) => current !== index);
                            updateGroups(nextGroups.length > 0 ? nextGroups : [[createExpr("host")]]);
                        }}
                    />
                </div>
            ))}
            <div className="mt-2 flex justify-center sm:justify-start">
                <Button className="w-full px-3 sm:w-auto" onClick={() => updateGroups([...safeGroups, [createExpr("host")]])}>
                    <Plus size={16} className="mr-1" />Or
                </Button>
            </div>
        </div>
    );
}

const OrSeparator = () => (
    <div className="my-4 flex items-center">
        <hr className="flex-grow opacity-25" />
        <span className="mx-4 text-xs font-bold uppercase tracking-[1px] text-ui-muted">Or</span>
        <hr className="flex-grow opacity-25" />
    </div>
);

function RuleExprGroupEditor({
    value,
    options,
    onChange,
    onRemove,
}: {
    value: RuleExpr[];
    options: RuleEditorOptions;
    onChange: (value: RuleExpr[]) => void;
    onRemove: () => void;
}) {
    const leaves = value.length > 0 ? value : [createExpr("host")];

    return (
        <div className="min-w-0">
            {leaves.map((item, index) => (
                <div key={index}>
                    {index > 0 && <AndConnector />}
                    <RuleExprLeafEditor
                        value={item}
                        options={options}
                        onChange={(next) => {
                            const nextLeaves = [...leaves];
                            nextLeaves[index] = next;
                            onChange(nextLeaves);
                        }}
                        onRemove={() => {
                            if (leaves.length === 1) onRemove();
                            else onChange(leaves.filter((_, current) => current !== index));
                        }}
                    />
                </div>
            ))}
            <Button size="sm" className="mt-3 w-full border-dashed px-3 sm:w-auto" variant="outline-secondary" onClick={() => onChange([...leaves, createExpr("host")])}>
                <Plus size={16} className="mr-1" />And
            </Button>
        </div>
    );
}

const AndConnector = () => (
    <div className="my-2 flex items-center gap-3 px-3" aria-label="And">
        <div className="h-px flex-1 bg-ui-border" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-ui-primary">And</span>
        <div className="h-px flex-1 bg-ui-border" />
    </div>
);

function RuleExprLeafEditor({
    value,
    options,
    onChange,
    onRemove,
}: {
    value: RuleExpr;
    options: RuleEditorOptions;
    onChange: (value: RuleExpr) => void;
    onRemove: () => void;
}) {
    const expr = leafRuleExprTypes.includes(value.type) ? normalizeExpr(value) : createExpr("host");
    const updateType = (type: string) => onChange(createExpr(type));

    return (
        <div className="min-w-0 rounded-ui-lg border border-ui-border bg-ui-surface p-3 shadow-inner-subtle sm:p-4">
            <div className="flex min-w-0 items-end gap-2">
                <div className="min-w-0 flex-1">
                    <SettingLabel className="mb-2 block text-xs">Condition type</SettingLabel>
                    <Select
                        value={expr.type}
                        onValueChange={updateType}
                        items={includeCurrent(leafRuleExprTypes, expr.type).map(type => ({ value: type, label: formatRuleExprType(type) }))}
                    />
                </div>
                <Button
                    size="icon"
                    variant="outline-danger"
                    onClick={onRemove}
                    aria-label="Remove rule"
                    className="shrink-0"
                >
                    <X size={16} />
                </Button>
            </div>
            <div className="mt-3 min-w-0">
                <SettingLabel className="mb-2 block text-xs">Condition value</SettingLabel>
                <RuleExprLeafFields value={expr} options={options} onChange={onChange} />
            </div>
        </div>
    );
}

function formatRuleExprType(type: string): string {
    switch (type) {
        case "host":
            return "Host";
        case "process":
            return "Process";
        case "inbound":
            return "Inbound";
        case "network":
            return "Network";
        case "port":
            return "Port";
        case "geoip":
            return "Geoip";
        default:
            return type;
    }
}

function RuleExprLeafFields({ value, options, onChange }: { value: RuleExpr; options: RuleEditorOptions; onChange: (value: RuleExpr) => void }) {
    switch (value.type) {
        case "host":
            return (
                <div className="min-w-0 flex-1">
                    <Select
                        value={value.host?.list ?? ""}
                        onValueChange={(list) => onChange({ ...value, host: { list } })}
                        items={listSelectItems(options.lists, value.host?.list ?? "")}
                        placeholder="List"
                    />
                </div>
            );
        case "process":
            return (
                <div className="min-w-0 flex-1">
                    <Select
                        value={value.process?.list ?? ""}
                        onValueChange={(list) => onChange({ ...value, process: { list } })}
                        items={listSelectItems(options.lists, value.process?.list ?? "")}
                        placeholder="List"
                    />
                </div>
            );
        case "inbound": {
            const selectedInbounds = value.inbound?.names ?? (value.inbound?.name ? [value.inbound.name] : []);
            return (
                <div className="min-w-0 flex-1">
                    <DropdownSelect
                        values={selectedInbounds}
                        items={includeSelected(options.inbounds, selectedInbounds)}
                        onUpdate={(names) => onChange({ ...value, inbound: { names } })}
                    />
                </div>
            );
        }
        case "network":
            return (
                <div className="min-w-0 flex-1">
                    <Select
                        value={value.network?.network ?? "tcp"}
                        onValueChange={(network) => onChange({ ...value, network: { network } })}
                        items={["tcp", "udp", "tcp_udp"].map(network => ({ value: network, label: network }))}
                    />
                </div>
            );
        case "port":
            return (
                <div className="min-w-0 flex-1">
                    <Input
                        value={value.port?.ports ?? ""}
                        onChange={(event) => onChange({ ...value, port: { ports: event.target.value } })}
                        placeholder="80,443,1000-2000"
                    />
                </div>
            );
        case "geoip":
            return (
                <div className="min-w-0 flex-1">
                    <Input
                        value={value.geoip?.countries ?? ""}
                        onChange={(event) => onChange({ ...value, geoip: { countries: event.target.value } })}
                        placeholder="CN,JP,US"
                    />
                </div>
            );
        default:
            return <div className="min-w-0 flex-1 px-3 text-sm text-ui-muted">Unsupported rule expression.</div>;
    }
}

function listSelectItems(values: string[], current: string): { value: string; label: string }[] {
    return [
        { value: "", label: "Choose list" },
        ...includeCurrent(values, current).filter(Boolean).map(list => ({ value: list, label: list })),
    ];
}

export default BypassComponent;
