

import { useTranslation } from 'react-i18next';

import { ResolverPicker } from "@/component/resolver-picker";
import { RouteTargetPicker } from "@/component/route-target-picker";
import { Button } from "@/component/v2/button";
import { SettingLabel } from "@/component/v2/card";
import { DropdownSelect, SettingInputVertical, SettingSelectVertical, SwitchCard } from "@/component/v2/forms";
import { Input } from "@/component/v2/input";

import { Select } from "@/component/v2/select";

import type { RouteRule, RuleExpr } from "@/contract/route";
import { normalizeRule } from "@/contract/route";

import { Plus, X } from "lucide-react";

const routeModes = ["proxy", "block", "direct"];

const resolveStrategies = ["default", "prefer_ipv4", "prefer_ipv6", "only_ipv4", "only_ipv6"];

const udpProxyStrategies = ["udp_proxy_fqdn_strategy_default", "skip_resolve", "udp_proxy_fqdn_strategy_resolve"];


type RuleEditorOptions = {
    lists: string[];
    listNames?: Record<string, string>;
    listTypes?: Record<string, string>;
    inbounds: string[];
    inboundNames?: Record<string, string>;
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
            <section className="border-b border-ui-border/70 pb-5 last:border-b-0 last:pb-0">
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
                    <div>{value.mode === "proxy" && <RouteTargetPicker value={value.target} onChange={target => patch({ target })} />}</div>
                    <SettingSelectVertical label={uiT("resolveStrategy")} value={value.resolveStrategy ?? "default"} values={resolveStrategies} onChange={(resolveStrategy) => patch({ resolveStrategy })} />
                    <SettingSelectVertical
                        label={uiT("udpFqdnStrategy")}
                        value={value.udpProxyFqdnStrategy ?? "udp_proxy_fqdn_strategy_default"}
                        values={udpProxyStrategies}
                        format={formatUdpProxyStrategy}
                        onChange={(udpProxyFqdnStrategy) => patch({ udpProxyFqdnStrategy })}
                    />
                    <div className="md:col-span-2">
                        <label className="block space-y-2"><SettingLabel>{uiT("resolver")}</SettingLabel>
                            <ResolverPicker value={value.resolver ?? ""} onChange={resolver => patch({ resolver })} />
                        </label>
                    </div>
                </div>
            </section>
            <section className="border-b border-ui-border/70 pb-5 last:border-b-0 last:pb-0">
                <SettingLabel className="mb-0">{uiT("ruleEntries")}</SettingLabel>
                <RuleExprListEditor value={value.rules ?? []} options={options} onChange={(rules) => patch({ rules })} />
            </section>
        </div>
    );
}

function formatUdpProxyStrategy(value: string): string {
    switch (value) {
        case "udp_proxy_fqdn_strategy_default":
            return "global";
        case "skip_resolve":
            return "disabled";
        case "udp_proxy_fqdn_strategy_resolve":
            return "resolve";
        default:
            return value;
    }
}

function createExpr(type: string): RuleExpr {
    switch (type) {
        case "always":
            return { type, always: {} };
        case "all":
            return { type, all: [createExpr("host")] };
        case "any":
            return { type, any: [createExpr("host")] };
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

function RuleExprListEditor({ value, options, onChange }: { value: RuleExpr[]; options: RuleEditorOptions; onChange: (value: RuleExpr[]) => void }) {
    const { t } = useTranslation('routing');
    return <div className="space-y-3">
        <p className="text-sm text-ui-muted">{t('topLevelAny')}</p>
        {value.map((expr, index) => <ExpressionEditor key={index} value={expr} options={options}
            onChange={next => onChange(value.map((item, i) => i === index ? next : item))}
            onRemove={() => onChange(value.filter((_, i) => i !== index))} />)}
        <Button size="sm" onClick={() => onChange([...value, createExpr('host')])}><Plus size={16} />{t('addCondition')}</Button>
    </div>;
}

function ExpressionEditor({ value, options, onChange, onRemove }: { value: RuleExpr; options: RuleEditorOptions; onChange: (value: RuleExpr) => void; onRemove: () => void }) {
    const { t } = useTranslation('routing');
    const types = ['host', 'process', 'inbound', 'network', 'port', 'geoip', 'all', 'any', 'not', 'always'];
    const children = value.type === 'all' ? value.all : value.type === 'any' ? value.any : [];
    const group = value.type === 'all' || value.type === 'any';
    const patchChildren = (items: RuleExpr[]) => onChange(value.type === 'all' ? { type: 'all', all: items } : { type: 'any', any: items });
    return <div className="space-y-3 rounded-ui-lg border border-ui-border/70 bg-ui-surface-muted/30 p-3">
        <div className="flex items-center gap-2">
            <Select ariaLabel={t("conditionOperator")} value={value.type} items={includeCurrent(types, value.type).map(type => ({ value: type, label: t(`condition.${type}`, { defaultValue: type }) }))} onValueChange={type => onChange(createExpr(type))} />
            <Button size="icon" variant="outline-danger" aria-label={t('removeCondition')} onClick={onRemove}><X size={16} /></Button>
        </div>
        {group ? <div className="space-y-3 border-l-2 border-ui-border pl-3">
            {children.map((child, index) => <ExpressionEditor key={index} value={child} options={options} onChange={next => patchChildren(children.map((item, i) => i === index ? next : item))} onRemove={() => patchChildren(children.filter((_, i) => i !== index))} />)}
            <Button size="sm" onClick={() => patchChildren([...children, createExpr('host')])}>{t('addCondition')}</Button>
        </div> : value.type === 'not' ? <ExpressionEditor value={value.not ?? createExpr('host')} options={options} onChange={not => onChange({ type: 'not', not })} onRemove={() => onChange(createExpr('host'))} />
        : value.type === 'always' ? <p className="text-sm text-ui-muted">{t('allTrafficHelp')}</p> : <RuleExprLeafFields value={value} options={options} onChange={onChange} />}
    </div>;
}

function RuleExprLeafFields({ value, options, onChange }: { value: RuleExpr; options: RuleEditorOptions; onChange: (value: RuleExpr) => void }) {
    const { t } = useTranslation("routing");
    const { t: uiT } = useTranslation('ui');

    switch (value.type) {
        case "host":
            return (
                <div className="min-w-0 flex-1">
                    <Select
                        value={value.host?.list ?? ""}
                        onValueChange={(list) => onChange({ ...value, host: { list } })}
                        items={listSelectItems(options.lists.filter(id => !options.listTypes?.[id] || ["host", "hosts_as_host"].includes(options.listTypes[id])), value.host?.list ?? "", options.listNames)}
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
                        items={listSelectItems(options.lists.filter(id => !options.listTypes?.[id] || options.listTypes[id] === "process"), value.process?.list ?? "", options.listNames)}
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
                        format={id => options.inboundNames?.[id] ?? id}
                        onUpdate={(names) => onChange({ ...value, inbound: { names } })}
                    />
                </div>
            );
        }
        case "network":
            return (
                <div className="min-w-0 flex-1">
                    <Select
                        ariaLabel={uiT("network")} value={value.network?.network ?? "tcp"}
                        onValueChange={(network) => onChange({ ...value, network: { network } })}
                        items={["tcp", "udp"].map(network => ({ value: network, label: network }))}
                    />
                </div>
            );
        case "port":
            return (
                <div className="min-w-0 flex-1">
                    <Input
                        aria-label={uiT("port")} value={value.port?.ports ?? ""}
                        onChange={(event) => onChange({ ...value, port: { ports: event.target.value } })}
                        placeholder="80,443,1000-2000"
                    />
                </div>
            );
        case "geoip":
            return (
                <div className="min-w-0 flex-1">
                    <Input
                        aria-label={t("countryCodes")} value={value.geoip?.countries ?? ""}
                        onChange={(event) => onChange({ ...value, geoip: { countries: event.target.value } })}
                        placeholder="CN,JP,US"
                    />
                </div>
            );
        default:
            return <div className="min-w-0 flex-1 px-3 text-sm text-ui-muted">{uiT("unsupportedRuleExpression")}</div>;
    }
}

function listSelectItems(values: string[], current: string, names?: Record<string, string>): { value: string; label: string }[] {
    return [
        { value: "", label: "Choose list" },
        ...includeCurrent(values, current).filter(Boolean).map(list => ({ value: list, label: names?.[list] ?? list })),
    ];
}

export { RouteRuleForm };

export { includeCurrent };

export type { RuleEditorOptions };
