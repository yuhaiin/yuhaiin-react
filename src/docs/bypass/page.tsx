"use client"

import { listInbounds } from "@/api/inbounds";
import { listResolvers } from "@/api/resolvers";
import { changeRulePriority, createRule, deleteRule, getRouteConfig, getRule, listRouteLists, listRules, saveRouteConfig, saveRule } from "@/api/route";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardFooter, CardHeader, CardList, FilterSearch, IconBox, MainContainer, SettingLabel, SettingsBox } from "@/component/v2/card";
import { DropdownSelect, SettingInputVertical, SettingSelectVertical, SwitchCard } from "@/component/v2/forms";
import { Input } from "@/component/v2/input";
import { InputGroup } from "@/component/v2/inputgroup";
import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Pagination } from "@/component/v2/pagination";
import { Select } from "@/component/v2/select";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import type { RouteRule, RuleExpr, RuleItem } from "@/contract/route";
import { createDefaultRule, normalizeRule } from "@/contract/route";
import { ArrowDown, ArrowUp, ArrowUpDown, Plus, Power, Route, Save, ShieldCheck, Trash, X } from "lucide-react";
import type { CSSProperties } from "react";
import { useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

const routeModes = ["bypass", "proxy", "block", "direct"];
const resolveStrategies = ["default", "prefer_ipv4", "prefer_ipv6", "ipv4_only", "ipv6_only"];
const udpProxyStrategies = ["udp_proxy_fqdn_strategy_default", "udp_proxy_fqdn_strategy_disabled", "udp_proxy_fqdn_strategy_resolve"];
const leafRuleExprTypes = ["host", "process", "inbound", "network", "port", "geoip"];
type PriorityOperate = "exchange" | "insert_before" | "insert_after";
const PAGE_SIZE = 8;

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
    const { data, error, isLoading, isValidating, mutate } = useSWR(
        ["/api/v2/route/rules", page, query],
        () => listRules({ page, pageSize: PAGE_SIZE, query }),
        { revalidateOnFocus: false },
    );
    const { data: allRules, mutate: mutateAllRules } = useSWR(
        "/api/v2/route/rules/all",
        () => listRules({ page: 1, pageSize: 10000 }),
        { revalidateOnFocus: false },
    );
    const { data: listsData } = useSWR(
        "/api/v2/route/lists/options",
        () => listRouteLists({ page: 1, pageSize: 10000 }),
        { revalidateOnFocus: false },
    );
    const { data: inboundsData } = useSWR(
        "/api/v2/inbounds/options",
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
            })
            .catch((err) => ctx.Error(err.msg ?? String(err)));
    };

    const moveRule = (item: RuleItem, direction: -1 | 1) => {
        const items = allRules?.items ?? data?.items ?? [];
        const index = items.findIndex(current => current.name === item.name && current.index === item.index);
        const target = items[index + direction];
        if (index < 0 || !target) {
            ctx.Error("No adjacent rule");
            return;
        }
        changeRulePriority(
            { name: item.name, index: item.index },
            { name: target.name, index: target.index },
            "exchange",
        )
            .then(() => {
                ctx.Info("rule priority changed");
                mutate();
                mutateAllRules();
            })
            .catch((err) => ctx.Error(err.msg ?? String(err)));
    };

    const saved = () => {
        mutate();
        mutateAllRules();
        setEditing(null);
        setPriorityItem(null);
        setCreating(false);
    };

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || !data) return <Loading />

    return (
        <MainContainer>
            <RouteConfigCard resolvers={editorOptions.resolvers} />
            <div className="flex justify-end mb-3 gap-2">
                <FilterSearch onEnter={(v) => { setPage(1); setQuery(v); }} size="sm" />
                <Button size="sm" variant="outline-primary" onClick={() => setCreating(true)}><Plus size={16} /></Button>
            </div>
            <CardList
                items={data.items}
                getKey={(v) => `${v.name}-${v.index}`}
                renderListItem={(item) => (
                    <div className="flex w-full items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                            <Badge variant="secondary" className="mt-0.5 shrink-0">#{item.index}</Badge>
                            <Route className="mt-0.5 shrink-0 text-ui-muted" size={22} />
                            <div className="min-w-0">
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                    <span className="truncate text-lg font-bold text-ui-heading">{item.name}</span>
                                    <Badge variant="info">{item.mode}</Badge>
                                </div>
                                {item.disabled && <Badge variant="secondary">disabled</Badge>}
                                <div className="mt-3 grid gap-1 text-sm text-ui-muted">
                                    <div><span className="mr-1">Mode</span><span className="font-semibold text-ui-fg">{item.mode || "-"}</span></div>
                                    <div><span className="mr-1">Rules</span><span className="font-semibold text-ui-fg">{item.ruleCount}</span></div>
                                    <div><span className="mr-1">Tag</span><span className="font-semibold text-ui-fg">{item.tag || "-"}</span></div>
                                    <div><span className="mr-1">Resolver</span><span className="font-semibold text-ui-fg">{item.resolver || "-"}</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-wrap justify-end gap-2">
                            <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={(e) => { e.stopPropagation(); moveRule(item, -1); }}
                                aria-label="Move rule up"
                            >
                                <ArrowUp size={16} />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={(e) => { e.stopPropagation(); moveRule(item, 1); }}
                                aria-label="Move rule down"
                            >
                                <ArrowDown size={16} />
                            </Button>
                            <Button
                                size="sm"
                                variant="outline-secondary"
                                onClick={(e) => { e.stopPropagation(); setPriorityItem(item); }}
                                aria-label="Change priority"
                            >
                                <ArrowUpDown size={16} />
                            </Button>
                            <Button
                                size="sm"
                                variant={item.disabled ? "outline-primary" : "outline-secondary"}
                                onClick={(e) => { e.stopPropagation(); toggleDisabled(item); }}
                                aria-label={item.disabled ? "Enable rule" : "Disable rule"}
                            >
                                <Power size={16} />
                            </Button>
                        </div>
                    </div>
                )}
                onClickItem={(item) => setEditing(item)}
                header={
                    <div className="flex items-center justify-between w-full">
                        <IconBox icon={Route} color="#3b82f6" title="Route Rules" description="Routing policy and matching order" />
                        {isValidating && <Spinner size="sm" />}
                    </div>
                }
                footer={<Pagination currentPage={data.page.page || page} totalItems={data.page.total} pageSize={data.page.pageSize || PAGE_SIZE} onPageChange={setPage} />}
            />
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
                <IconBox icon={ShieldCheck} color="#ec4899" title="Global Bypass Settings" description="DNS resolution and routing strategy" />
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
                <ModalFooter className="flex justify-between">
                    <Button variant="outline-danger" onClick={remove}>
                        <Trash size={16} /> Delete Rule
                    </Button>
                    <div className="flex gap-2">
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
        <div className="flex flex-col gap-2">
            <RulesSeparator />
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
            <div className="mt-2">
                <Button className="px-3" onClick={() => updateGroups([...safeGroups, [createExpr("host")]])}>
                    <Plus size={16} className="mr-1" />Or
                </Button>
            </div>
        </div>
    );
}

const OrSeparator = () => (
    <div className="my-4 flex items-center">
        <hr className="flex-grow opacity-25" />
        <span className="mx-4 text-xs font-bold uppercase tracking-[1px] text-gray-500 dark:text-gray-400">Or</span>
        <hr className="flex-grow opacity-25" />
    </div>
);

const RulesSeparator = () => (
    <div className="my-4 flex items-center">
        <hr className="flex-grow opacity-25" />
        <span className="mx-4 text-xs font-bold uppercase tracking-[1px] text-gray-500 dark:text-gray-400">Rules</span>
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
        <div className="rounded-md border border-gray-500/10 bg-secondary/10 p-4">
            {leaves.map((item, index) => (
                <div key={index}>
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
                    {index < leaves.length - 1 && (
                        <div className="mb-4 ml-4 text-xs font-bold uppercase text-blue-500">And</div>
                    )}
                </div>
            ))}
            <Button size="sm" className="px-3" onClick={() => onChange([...leaves, createExpr("host")])}>
                <Plus size={16} className="mr-1" />And
            </Button>
        </div>
    );
}

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
        <InputGroup className="mb-4">
            <div className="flex-[0_0_130px]">
                <Select
                    value={expr.type}
                    onValueChange={updateType}
                    items={includeCurrent(leafRuleExprTypes, expr.type).map(type => ({ value: type, label: formatRuleExprType(type) }))}
                    triggerClassName="focus:relative focus:z-10 hover:relative hover:z-10"
                    groupPosition="first"
                />
            </div>
            <RuleExprLeafFields value={expr} options={options} onChange={onChange} />
            <div className="flex-[0_0_42px]">
                <Button
                    size="icon"
                    variant="outline-danger"
                    onClick={onRemove}
                    aria-label="Remove rule"
                    className="h-full w-full !rounded-l-none focus:relative focus:z-10 hover:relative hover:z-10"
                >
                    <X size={16} />
                </Button>
            </div>
        </InputGroup>
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
                <div className="flex-1">
                    <Select
                        value={value.host?.list ?? ""}
                        onValueChange={(list) => onChange({ ...value, host: { list } })}
                        items={listSelectItems(options.lists, value.host?.list ?? "")}
                        placeholder="List"
                        triggerClassName="focus:relative focus:z-10 hover:relative hover:z-10"
                        groupPosition="middle"
                    />
                </div>
            );
        case "process":
            return (
                <div className="flex-1">
                    <Select
                        value={value.process?.list ?? ""}
                        onValueChange={(list) => onChange({ ...value, process: { list } })}
                        items={listSelectItems(options.lists, value.process?.list ?? "")}
                        placeholder="List"
                        triggerClassName="focus:relative focus:z-10 hover:relative hover:z-10"
                        groupPosition="middle"
                    />
                </div>
            );
        case "inbound": {
            const selectedInbounds = value.inbound?.names ?? (value.inbound?.name ? [value.inbound.name] : []);
            return (
                <div className="flex-1">
                    <DropdownSelect
                        values={selectedInbounds}
                        items={includeSelected(options.inbounds, selectedInbounds)}
                        onUpdate={(names) => onChange({ ...value, inbound: { names } })}
                        triggerClassName="focus:relative focus:z-10 hover:relative hover:z-10"
                        groupPosition="middle"
                    />
                </div>
            );
        }
        case "network":
            return (
                <div className="flex-1">
                    <Select
                        value={value.network?.network ?? "tcp"}
                        onValueChange={(network) => onChange({ ...value, network: { network } })}
                        items={["tcp", "udp", "tcp_udp"].map(network => ({ value: network, label: network }))}
                        triggerClassName="focus:relative focus:z-10 hover:relative hover:z-10"
                        groupPosition="middle"
                    />
                </div>
            );
        case "port":
            return (
                <div className="flex-1">
                    <Input
                        value={value.port?.ports ?? ""}
                        onChange={(event) => onChange({ ...value, port: { ports: event.target.value } })}
                        placeholder="80,443,1000-2000"
                        className="focus:relative focus:z-10 hover:relative hover:z-10"
                        groupPosition="middle"
                    />
                </div>
            );
        case "geoip":
            return (
                <div className="flex-1">
                    <Input
                        value={value.geoip?.countries ?? ""}
                        onChange={(event) => onChange({ ...value, geoip: { countries: event.target.value } })}
                        placeholder="CN,JP,US"
                        className="focus:relative focus:z-10 hover:relative hover:z-10"
                        groupPosition="middle"
                    />
                </div>
            );
        default:
            return <div className="flex-1 px-3 text-sm text-ui-muted">Unsupported rule expression.</div>;
    }
}

function listSelectItems(values: string[], current: string): { value: string; label: string }[] {
    return [
        { value: "", label: "Choose list" },
        ...includeCurrent(values, current).filter(Boolean).map(list => ({ value: list, label: list })),
    ];
}

export default BypassComponent;
