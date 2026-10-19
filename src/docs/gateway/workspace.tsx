import { createID } from "@/common/id";
import { Button } from "@/component/v2/button";
import type { Config, Gateway, Rule, Upstream, Interception, FilterList } from "@/contract/gateway";
import { deleteGateway, deleteRule, newRule, newUpstream } from "@/contract/gateway";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ActionEditor } from "./fields";
import {
  GatewayEditor,
  RuleEditor,
  UpstreamEditor,
  InterceptionEditor,
  FilterEditor,
} from "./resources";

type InboundItem = { id: string; name: string };
type FilterReport = { id: string; accepted: number; rejected: number; errors: string[] };
type GatewayRuntime = { id: string; requests: number; blocked: number; forwarded: number; errors: number; tlsFailures: number; filterReports?: FilterReport[] };

type Props = {
  config: Config;
  inbounds: InboundItem[];
  status: GatewayRuntime[];
  onChange: (value: Config) => void;
  refreshFilter: (id: string) => void;
  canRefreshFilter: boolean;
};

function Section({ title, count, children, initiallyOpen = false }: {
  title: string;
  count?: number;
  children: ReactNode;
  initiallyOpen?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <details className="rounded-ui-sm border border-ui-border p-3 sm:p-4" open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className="cursor-pointer font-medium">
        {title}{count !== undefined ? " · " + count : ""}
      </summary>
      <div className="space-y-4 pt-4">{children}</div>
    </details>
  );
}

const emptyInterception = (inboundId: string, gatewayId: string): Interception => ({
  inboundId, gatewayId, mode: "http_only", domains: [], excludeDomains: [],
  ports: [], sources: [], processes: [], unknownTls: "passthrough",
});

const newFilter = (gatewayId: string): FilterList => ({
  id: createID(), name: "", revision: 0, enabled: true,
  gatewayId, text: "||example.com/ads/*",
});

/**
 * The editor is grouped by Gateway rather than by database table. Resources
 * remain in the current API payload until the atomic L4/L7 API is available.
 * Every edit still commits in the same revisioned Gateway transaction.
 */
function pruneUnusedPools(config: Config): Config {
  const used = new Set([
    ...config.gateways.map((gateway) => gateway.default),
    ...config.rules.map((rule) => rule.action),
  ].filter((action) => action.type === "reverse_proxy").map((action) => action.upstream));
  return { ...config, upstreams: config.upstreams.filter((pool) => used.has(pool.id)) };
}

export function GatewayWorkspace({ config, inbounds, status, onChange, refreshFilter, canRefreshFilter }: Props) {
  const { t } = useTranslation("gateway");
  const [selectedInbound, setSelectedInbound] = useState<Record<string, string>>({});

  const updateGateway = (gateway: Gateway) => onChange(pruneUnusedPools({
    ...config, gateways: config.gateways.map((item) => item.id === gateway.id ? gateway : item),
  }));
  const updateRule = (rule: Rule) => onChange(pruneUnusedPools({
    ...config, rules: config.rules.map((item) => item.id === rule.id ? rule : item),
  }));
  const updateUpstream = (upstream: Upstream) => onChange({
    ...config, upstreams: config.upstreams.map((item) => item.id === upstream.id ? upstream : item),
  });
  const updateInterception = (interception: Interception) => onChange({
    ...config,
    interceptions: [...config.interceptions.filter((item) => item.inboundId !== interception.inboundId), interception],
  });
  const updateFilter = (filter: FilterList) => onChange({
    ...config, filterLists: config.filterLists.map((item) => item.id === filter.id ? filter : item),
  });

  const removeGateway = (id: string) => {
    const next = deleteGateway(config, id);
    const referencedRules = new Set(next.gateways.flatMap((g) => g.ruleIds));
    next.rules = next.rules.filter((r) => referencedRules.has(r.id));
    const referencedPools = new Set([
      ...next.gateways.map((g) => g.default),
      ...next.rules.map((r) => r.action),
    ].filter((action) => action.type === "reverse_proxy").map((action) => action.upstream));
    next.upstreams = next.upstreams.filter((u) => referencedPools.has(u.id));
    onChange(next);
  };

  if (config.gateways.length === 0) {
    return <p className="text-sm text-ui-secondary">{t("empty")}</p>;
  }

  return (
    <div className="space-y-5">
      {config.gateways.map((gateway) => {
        const rules = config.rules.filter((rule) => gateway.ruleIds.includes(rule.id));
        const interceptions = config.interceptions.filter((item) => item.gatewayId === gateway.id);
        const filters = config.filterLists.filter((item) => item.gatewayId === gateway.id);
        const neededUpstreams = new Set([
          gateway.default,
          ...rules.map((rule) => rule.action),
        ].filter((action) => action.type === "reverse_proxy").map((action) => action.upstream));
        const pools = config.upstreams.filter((upstream) => neededUpstreams.has(upstream.id));
        const unassignedRule = rules.find((rule) =>
          rule.action.type === "reverse_proxy" && !rule.action.upstream);
        const unassignedFallback = gateway.default.type === "reverse_proxy" && !gateway.default.upstream;
        const canAddPool = Boolean(unassignedRule || unassignedFallback);
        const runtime = status.find((item) => item.id === gateway.id);
        const availableInbounds = inbounds.filter((item) =>
          !config.interceptions.some((entry) => entry.inboundId === item.id));
        return (
          <Section key={gateway.id}
            title={gateway.name || t("newGateway")}
            initiallyOpen={config.gateways.length === 1 || !gateway.name}>
            <p className="text-xs text-ui-secondary">
              {gateway.enabled ? t("enabled") : t("disabled")} · {gateway.listen || t("interception")}
              {" · "}{runtime?.requests ?? 0} {t("requests")}
            </p>
            <Section title={t("gatewaySettings")} initiallyOpen>
              <GatewayEditor item={gateway} config={config} minimal
                change={updateGateway} />
            </Section>
            <Section title={t("trafficSources")} count={interceptions.length + (gateway.listen ? 1 : 0)}
              initiallyOpen={interceptions.length > 0}>
              <p className="text-sm text-ui-secondary">{t("sourceHelp")}</p>
              {gateway.listen && <p className="text-sm">{t("listen")}: {gateway.listen}</p>}
              {interceptions.map((entry) => (
                <Section key={entry.inboundId}
                  title={inbounds.find((item) => item.id === entry.inboundId)?.name || entry.inboundId}>
                  <InterceptionEditor item={entry} config={config} hideGateway
                    inboundName={inbounds.find((item) => item.id === entry.inboundId)?.name || entry.inboundId}
                    change={updateInterception} />
                  <Button variant="outline-danger" onClick={() => onChange({
                    ...config, interceptions: config.interceptions.filter((item) => item.inboundId !== entry.inboundId),
                  })}>{t("remove")}</Button>
                </Section>
              ))}
              <div className="flex flex-wrap gap-2 items-center">
                <select className="max-w-full rounded-ui-sm border border-ui-border bg-ui-surface p-2 text-sm"
                  aria-label={t("inbound")} value={selectedInbound[gateway.id] ?? ""}
                  onChange={(event) => setSelectedInbound((previous) => ({ ...previous, [gateway.id]: event.target.value }))}>
                  <option value="">{t("inbound")}</option>
                  {availableInbounds.map((item) =>
                    <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <Button disabled={!selectedInbound[gateway.id]}
                  onClick={() => {
                    const inboundId = selectedInbound[gateway.id];
                    if (!inboundId || !availableInbounds.some((item) => item.id === inboundId)) return;
                    onChange({ ...config, interceptions: [...config.interceptions, emptyInterception(inboundId, gateway.id)] });
                    setSelectedInbound((previous) => ({ ...previous, [gateway.id]: "" }));
                  }}>{t("addSource")}</Button>
              </div>
              <p className="text-sm text-ui-secondary">{t("routeHandoffHelp")}</p>
            </Section>
            <Section title={t("rules")} count={rules.length} initiallyOpen>
              {rules.map((rule) => (
                <Section key={rule.id} title={rule.name || t("newRule")}>
                  <RuleEditor item={rule} config={{ ...config, upstreams: pools }} change={updateRule} />
                  <Button variant="outline-danger" onClick={() => {
                    const isShared = config.gateways.some((other) =>
                      other.id !== gateway.id && other.ruleIds.includes(rule.id));
                    onChange(pruneUnusedPools(isShared
                      ? { ...config, gateways: config.gateways.map((g) => g.id === gateway.id
                          ? { ...g, ruleIds: g.ruleIds.filter((id) => id !== rule.id) } : g) }
                      : deleteRule(config, rule.id)));
                  }}>{t("delete")}</Button>
                </Section>
              ))}
              <Button onClick={() => {
                const rule = newRule();
                onChange({ ...config,
                  rules: [...config.rules, rule],
                  gateways: config.gateways.map((g) => g.id === gateway.id
                    ? { ...g, ruleIds: [...g.ruleIds, rule.id] } : g),
                });
              }}>{t("addRule")}</Button>
            </Section>
            <Section title={t("filters")} count={filters.length}>
              {filters.map((filter) => (
                <Section key={filter.id} title={filter.name || t("newFilter")}>
                  <FilterEditor item={filter} config={config} hideGateway change={updateFilter} />
                  {filter.url && <Button variant="outline-secondary"
                    disabled={!canRefreshFilter} onClick={() => refreshFilter(filter.id)}>
                    {t("refreshFilter")}
                  </Button>}
                  {runtime?.filterReports?.filter((report) => report.id === filter.id).map((report) => (
                    <div key={report.id} className="text-sm">
                      {report.accepted} {t("acceptedRules")} · {report.rejected} {t("rejectedRules")}
                      {report.errors.map((error, index) => <p key={index} className="text-ui-danger">{error}</p>)}
                    </div>
                  ))}
                  <Button variant="outline-danger" onClick={() => onChange({
                    ...config, filterLists: config.filterLists.filter((item) => item.id !== filter.id),
                  })}>{t("delete")}</Button>
                </Section>
              ))}
              <Button onClick={() => onChange({
                ...config, filterLists: [...config.filterLists, newFilter(gateway.id)],
              })}>{t("addFilter")}</Button>
            </Section>
            <Section title={t("defaultAction")} initiallyOpen>
              <ActionEditor value={gateway.default} upstreams={pools}
                onChange={(action) => updateGateway({ ...gateway, default: action })} />
            </Section>
            <Section title={t("backendPools")} count={pools.length}>
              {pools.map((upstream) => (
                <Section key={upstream.id} title={upstream.name || t("newUpstream")}>
                  <UpstreamEditor item={upstream} change={updateUpstream} />
                  <Button variant="outline-danger"
                    disabled={config.gateways.some((g) =>
                      g.default.upstream === upstream.id && g.default.type === "reverse_proxy")
                      || config.rules.some((r) => r.action.type === "reverse_proxy" && r.action.upstream === upstream.id)}
                    onClick={() => onChange({
                      ...config, upstreams: config.upstreams.filter((item) => item.id !== upstream.id),
                    })}>{t("delete")}</Button>
                </Section>
              ))}
              <Button disabled={!canAddPool} onClick={() => {
                // Creating a backend pool must never implicitly change the
                // Gateway's fallback from Block/Forward to Reverse Proxy.
                // Require an explicit reverse-proxy action selection first.
                if (!canAddPool) return;
                const upstream = newUpstream();
                const nextRules = unassignedRule
                  ? config.rules.map((rule) => rule.id === unassignedRule.id
                    ? { ...rule, action: { ...rule.action, upstream: upstream.id } } : rule)
                  : config.rules;
                const nextGateways = unassignedRule ? config.gateways : config.gateways.map((g) =>
                  g.id === gateway.id
                    ? { ...g, default: { ...g.default, upstream: upstream.id } }
                    : g);
                onChange(pruneUnusedPools({ ...config, rules: nextRules, gateways: nextGateways,
                  upstreams: [...config.upstreams, upstream] }));
              }}>{t("addUpstream")}</Button>
              <p className="text-xs text-ui-secondary">{t("backendPoolHelp")}</p>
            </Section>
            <Button variant="outline-danger" onClick={() => removeGateway(gateway.id)}>
              {t("delete")} {gateway.name || t("gateway")}
            </Button>
          </Section>
        );
      })}
    </div>
  );
}
