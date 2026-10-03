

import { useTranslation } from 'react-i18next';

import { Button } from "@/component/v2/button";
import { SettingLabel, SettingsBox } from "@/component/v2/card";
import { DropdownSelect, SettingInputVertical, SettingSelectVertical, SwitchCard } from "@/component/v2/forms";
import { Input } from "@/component/v2/input";

import { Select } from "@/component/v2/select";

import type { RouteRule, RuleExpr } from "@/contract/route";
import { normalizeRule } from "@/contract/route";

import { Plus, X } from "lucide-react";

const routeModes = ["bypass", "proxy", "block", "direct"];

const resolveStrategies = ["default", "prefer_ipv4", "prefer_ipv6", "ipv4_only", "ipv6_only"];

const udpProxyStrategies = ["udp_proxy_fqdn_strategy_default", "udp_proxy_fqdn_strategy_disabled", "udp_proxy_fqdn_strategy_resolve"];

const leafRuleExprTypes = ["host", "process", "inbound", "network", "port", "geoip"];

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

function RouteRuleForm({ value, onChange, options, lockName }: { value: RouteRule; onChange: (value: RouteRule) => void; options: RuleEditorOptions; lockName?: boolean }) {
    const { t: uiT } = useTranslation('ui');

    const patch = (patchValue: Partial<RouteRule>) => onChange(normalizeRule({ ...value, ...patchValue }));

    return (
        <div className="space-y-6">
            <SettingsBox>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {!lockName && (
                        <div className="md:col-span-2">
                            <SettingInputVertical label={uiT("name")} value={value.name} onChange={(name) => patch({ name })} />
                        </div>
                    )}
                    <div className="md:col-span-2">
                        <SwitchCard
                            label={uiT("disabled")}
                            description={uiT("ignoreThisRuleDuringRouting")}
                            checked={Boolean(value.disabled)}
                            onCheckedChange={(disabled) => patch({ disabled })}
                        />
                    </div>
                    <SettingSelectVertical label={uiT("mode")} value={value.mode} values={routeModes} onChange={(mode) => patch({ mode })} />
                    <SettingInputVertical label={uiT("tag")} value={value.tag ?? ""} onChange={(tag) => patch({ tag })} placeholder={uiT("optionalTag")} />
                    <SettingSelectVertical label={uiT("resolveStrategy")} value={value.resolveStrategy ?? "default"} values={resolveStrategies} onChange={(resolveStrategy) => patch({ resolveStrategy })} />
                    <SettingSelectVertical
                        label={uiT("udpFqdnStrategy")}
                        value={value.udpProxyFqdnStrategy ?? "udp_proxy_fqdn_strategy_default"}
                        values={udpProxyStrategies}
                        format={formatUdpProxyStrategy}
                        onChange={(udpProxyFqdnStrategy) => patch({ udpProxyFqdnStrategy })}
                    />
                    <div className="md:col-span-2">
                        <SettingSelectVertical
                            label={uiT("resolver")}
                            value={value.resolver ?? ""}
                            values={includeCurrent(options.resolvers, value.resolver ?? "")}
                            onChange={(resolver) => patch({ resolver })}
                            emptyChoose
                            emptyChooseName={uiT("globalDefault")}
                        />
                    </div>
                </div>
            </SettingsBox>
            <SettingsBox>
                <SettingLabel className="mb-0">{uiT("ruleEntries")}</SettingLabel>
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
    const { t: uiT } = useTranslation('ui');

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
                    <Plus size={16} className="mr-1" />{uiT("or")}</Button>
            </div>
        </div>
    );
}

const OrSeparator = () => {
    const { t: uiT } = useTranslation('ui');
    return (
    <div className="my-4 flex items-center">
        <hr className="flex-grow opacity-25" />
        <span className="mx-4 text-xs font-bold uppercase tracking-[1px] text-ui-muted">{uiT("or")}</span>
        <hr className="flex-grow opacity-25" />
    </div>
);
};

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
    const { t: uiT } = useTranslation('ui');

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
                <Plus size={16} className="mr-1" />{uiT("and")}</Button>
        </div>
    );
}

const AndConnector = () => {
    const { t: uiT } = useTranslation('ui');
    return (
    <div className="my-2 flex items-center gap-3 px-3" aria-label={uiT("and")}>
        <div className="h-px flex-1 bg-ui-border" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-ui-primary">{uiT("and")}</span>
        <div className="h-px flex-1 bg-ui-border" />
    </div>
);
};

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
    const { t: uiT } = useTranslation('ui');

    const expr = leafRuleExprTypes.includes(value.type) ? normalizeExpr(value) : createExpr("host");
    const updateType = (type: string) => onChange(createExpr(type));

    return (
        <div className="min-w-0 rounded-ui-lg border border-ui-border bg-ui-surface p-3 shadow-inner-subtle sm:p-4">
            <div className="flex min-w-0 items-end gap-2">
                <div className="min-w-0 flex-1">
                    <SettingLabel className="mb-2 block text-xs">{uiT("conditionType")}</SettingLabel>
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
                    aria-label={uiT("removeRule")}
                    className="shrink-0"
                >
                    <X size={16} />
                </Button>
            </div>
            <div className="mt-3 min-w-0">
                <SettingLabel className="mb-2 block text-xs">{uiT("conditionValue")}</SettingLabel>
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
    const { t: uiT } = useTranslation('ui');

    switch (value.type) {
        case "host":
            return (
                <div className="min-w-0 flex-1">
                    <Select
                        value={value.host?.list ?? ""}
                        onValueChange={(list) => onChange({ ...value, host: { list } })}
                        items={listSelectItems(options.lists, value.host?.list ?? "")}
                        placeholder={uiT("list")}
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
                        placeholder={uiT("list")}
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
            return <div className="min-w-0 flex-1 px-3 text-sm text-ui-muted">{uiT("unsupportedRuleExpression")}</div>;
    }
}

function listSelectItems(values: string[], current: string): { value: string; label: string }[] {
    return [
        { value: "", label: "Choose list" },
        ...includeCurrent(values, current).filter(Boolean).map(list => ({ value: list, label: list })),
    ];
}

export { RouteRuleForm };

export { includeCurrent };

export type { RuleEditorOptions };
