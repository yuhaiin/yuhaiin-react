import { createID } from "@/common/id";
import { Button } from "@/component/v2/button";
import {
  WorkspaceDetail,
  WorkspaceDirectory,
  WorkspaceLayout,
  WorkspaceSelectionMarker,
} from "@/component/workspace-layout";
import type { Config, Gateway, Rule, Upstream, Interception, FilterList } from "@/contract/gateway";
import { deleteGateway, deleteRule, newRule, newUpstream, newInterception, newGateway } from "@/contract/gateway";
import { ArrowLeft, ListFilter, Plus } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ActionEditor } from "./fields";
import {
  GatewayEditor,
  RuleEditor,
  UpstreamEditor,
  InterceptionEditor,
  FilterEditor,
} from "./resources";

type FilterReport = { id: string; accepted: number; rejected: number; errors: string[] };
type GatewayRuntime = { id: string; requests: number; blocked: number; forwarded: number; errors: number; tlsFailures: number; filterReports?: FilterReport[] };

type Props = {
  config: Config;
  status: GatewayRuntime[];
  onChange: (value: Config) => void;
  refreshFilter: (id: string) => void;
  canRefreshFilter: boolean;
};

type GatewayEditorSelection =
  | { kind: "settings" }
  | { kind: "interception" }
  | { kind: "defaultAction" }
  | { kind: "rule"; id: string }
  | { kind: "filter"; id: string }
  | { kind: "pool"; id: string };

function NavigationGroup({ title, count, action, children }: {
  title: string;
  count?: number;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-1 border-t border-ui-border/60 pt-3">
      <header className="flex items-center justify-between gap-2 px-2">
        <h3 className="min-w-0 truncate text-xs font-medium text-ui-secondary">
          {title}{count !== undefined ? <span className="ml-1 text-ui-muted">· {count}</span> : null}
        </h3>
        {action}
      </header>
      <ul className="m-0 list-none space-y-0.5 p-0">{children}</ul>
    </section>
  );
}

function NavigationItem({ label, description, selected, onSelect }: {
  label: string;
  description?: ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        aria-current={selected ? "true" : undefined}
        onClick={onSelect}
        className={`relative w-full min-w-0 rounded-ui-sm px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus ${selected ? "bg-ui-selected" : "hover:bg-ui-surface-muted/60"}`}
      >
        {selected && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-ui-primary" />}
        <span className="block truncate text-sm font-medium text-ui-heading">{label}</span>
        {description && <span className="mt-0.5 block truncate text-xs text-ui-secondary">{description}</span>}
      </button>
    </li>
  );
}

function AddNavigationItemButton({ label, disabled = false, onClick }: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button size="icon" variant="ghost" className="h-8 w-8 min-w-8" aria-label={label} title={label}
      disabled={disabled} onClick={onClick}>
      <Plus aria-hidden="true" />
    </Button>
  );
}

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

export function GatewayWorkspace({ config, status, onChange, refreshFilter, canRefreshFilter }: Props) {
  const { t } = useTranslation("gateway");
  const [selectedId, setSelectedId] = useState<string | null>(() => config.gateways[0]?.id ?? null);
  const [editorByGateway, setEditorByGateway] = useState<Record<string, GatewayEditorSelection>>({});
  const [narrowEditorOpen, setNarrowEditorOpen] = useState(false);
  const [creatingGateway, setCreatingGateway] = useState(false);
  const knownGatewayIds = useRef(new Set(config.gateways.map((gateway) => gateway.id)));
  useEffect(() => {
    const added = config.gateways.find((gateway) => !knownGatewayIds.current.has(gateway.id));
    knownGatewayIds.current = new Set(config.gateways.map((gateway) => gateway.id));
    if (added) setSelectedId(added.id);
    else if (selectedId && !knownGatewayIds.current.has(selectedId))
      setSelectedId(config.gateways[0]?.id ?? null);
  }, [config.gateways, selectedId]);
  const selectedGateway = config.gateways.find((gateway) => gateway.id === selectedId) ?? null;

  const createGateway = (mode: "listener" | "interception") => {
    const gateway = mode === "interception"
      ? {
          ...newGateway(),
          enabled: true,
          listen: "",
          name: t("newFilterGateway"),
          default: {
            type: "forward",
            status: 200,
            outbound: { type: "inherit_route" },
            preserveHost: false,
            rewrite: {},
          },
        } satisfies Gateway
      : newGateway();
    setCreatingGateway(false);
    setSelectedId(gateway.id);
    setNarrowEditorOpen(false);
    onChange({
      ...config,
      gateways: [...config.gateways, gateway],
      interceptions: mode === "interception"
        ? [...config.interceptions, newInterception(gateway.id, "http_only")]
        : config.interceptions,
    });
  };

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
    interceptions: [...config.interceptions.filter((item) => item.gatewayId !== interception.gatewayId), interception],
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

  const gateway = selectedGateway;
  const rules = gateway ? config.rules.filter((rule) => gateway.ruleIds.includes(rule.id)) : [];
  const interception = gateway
    ? config.interceptions.find((item) => item.gatewayId === gateway.id) ?? newInterception(gateway.id)
    : null;
  const filters = gateway ? config.filterLists.filter((item) => item.gatewayId === gateway.id) : [];
  const neededUpstreams = new Set([
    ...(gateway ? [gateway.default] : []),
    ...rules.map((rule) => rule.action),
  ].filter((action) => action.type === "reverse_proxy").map((action) => action.upstream));
  const pools = config.upstreams.filter((upstream) => neededUpstreams.has(upstream.id));
  const unassignedRule = rules.find((rule) =>
    rule.action.type === "reverse_proxy" && !rule.action.upstream);
  const unassignedFallback = gateway?.default.type === "reverse_proxy" && !gateway.default.upstream;
  const canAddPool = Boolean(unassignedRule || unassignedFallback);
  const runtime = gateway ? status.find((item) => item.id === gateway.id) : undefined;
  const requestedSelection = gateway
    ? editorByGateway[gateway.id] ?? { kind: "settings" as const }
    : { kind: "settings" as const };
  const invalidSelection =
    (requestedSelection.kind === "rule" && !rules.some((rule) => rule.id === requestedSelection.id)) ||
    (requestedSelection.kind === "filter" && !filters.some((filter) => filter.id === requestedSelection.id)) ||
    (requestedSelection.kind === "pool" && !pools.some((pool) => pool.id === requestedSelection.id));
  const activeSelection: GatewayEditorSelection = invalidSelection
    ? { kind: "settings" }
    : requestedSelection;
  const selectedRule = activeSelection.kind === "rule"
    ? rules.find((rule) => rule.id === activeSelection.id) ?? null
    : null;
  const selectedFilter = activeSelection.kind === "filter"
    ? filters.find((filter) => filter.id === activeSelection.id) ?? null
    : null;
  const selectedPool = activeSelection.kind === "pool"
    ? pools.find((pool) => pool.id === activeSelection.id) ?? null
    : null;
  const editorTitle = activeSelection.kind === "settings"
    ? t("gatewaySettings")
    : activeSelection.kind === "interception"
      ? t("interception")
      : activeSelection.kind === "defaultAction"
        ? t("defaultAction")
        : activeSelection.kind === "rule"
          ? selectedRule?.name || t("newRule")
          : activeSelection.kind === "filter"
            ? selectedFilter?.name || t("newFilter")
            : selectedPool?.name || t("newUpstream");
  const selectEditor = (selection: GatewayEditorSelection) => {
    if (!gateway) return;
    setEditorByGateway((current) => ({ ...current, [gateway.id]: selection }));
    setNarrowEditorOpen(true);
  };

  const addGatewayRule = () => {
    if (!gateway) return;
    const rule = newRule();
    selectEditor({ kind: "rule", id: rule.id });
    onChange({
      ...config,
      rules: [...config.rules, rule],
      gateways: config.gateways.map((item) => item.id === gateway.id
        ? { ...item, ruleIds: [...item.ruleIds, rule.id] }
        : item),
    });
  };

  const removeGatewayRule = (rule: Rule) => {
    if (!gateway) return;
    const isShared = config.gateways.some((other) =>
      other.id !== gateway.id && other.ruleIds.includes(rule.id));
    onChange(pruneUnusedPools(isShared
      ? {
          ...config,
          gateways: config.gateways.map((item) => item.id === gateway.id
            ? { ...item, ruleIds: item.ruleIds.filter((id) => id !== rule.id) }
            : item),
        }
      : deleteRule(config, rule.id)));
  };

  const addGatewayFilter = () => {
    if (!gateway) return;
    const filter = newFilter(gateway.id);
    selectEditor({ kind: "filter", id: filter.id });
    onChange({ ...config, filterLists: [...config.filterLists, filter] });
  };

  const addGatewayPool = () => {
    // A new pool is only available after an explicit reverse-proxy action has
    // been selected. Adding it assigns it to that action, and nothing else.
    if (!gateway || !canAddPool) return;
    const upstream = newUpstream();
    selectEditor({ kind: "pool", id: upstream.id });
    const nextRules = unassignedRule
      ? config.rules.map((rule) => rule.id === unassignedRule.id
        ? { ...rule, action: { ...rule.action, upstream: upstream.id } } : rule)
      : config.rules;
    const nextGateways = unassignedRule ? config.gateways : config.gateways.map((item) =>
      item.id === gateway.id
        ? { ...item, default: { ...item.default, upstream: upstream.id } }
        : item);
    onChange(pruneUnusedPools({ ...config, rules: nextRules, gateways: nextGateways,
      upstreams: [...config.upstreams, upstream] }));
  };

  return (
    <WorkspaceLayout>
      <WorkspaceDirectory label={t("gateways")} hiddenOnMobile={Boolean(gateway)}>
        <div className="mb-2 border-b border-ui-border/50 px-1 pb-3">
          <h2 className="text-sm font-medium text-ui-heading">{t("gateways")}</h2>
          <p className="mt-1 text-xs text-ui-secondary">{t("gatewayDirectoryHelp")}</p>
          <Button
            type="button"
            size="sm"
            variant="outline-secondary"
            className="mt-3 w-full justify-start gap-2"
            aria-expanded={creatingGateway}
            aria-controls="gateway-create-modes"
            onClick={() => setCreatingGateway((open) => !open)}
          >
            <Plus aria-hidden="true" size={16} />
            {t("addGateway")}
          </Button>
          {creatingGateway && (
            <div id="gateway-create-modes" role="group" aria-label={t("chooseGatewayMode")}
              className="mt-2 space-y-1 rounded-ui-md border border-ui-border bg-ui-surface p-1">
              <button type="button" aria-label={t("createHttpListener")}
                className="w-full rounded-ui-sm px-3 py-2.5 text-left transition-colors hover:bg-ui-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus"
                onClick={() => createGateway("listener")}>
                <span className="block text-sm font-medium text-ui-heading">{t("createHttpListener")}</span>
                <span className="mt-1 block text-xs text-ui-secondary">{t("createHttpListenerHelp")}</span>
              </button>
              <button type="button" aria-label={t("createTrafficInterception")}
                className="w-full rounded-ui-sm px-3 py-2.5 text-left transition-colors hover:bg-ui-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus"
                onClick={() => createGateway("interception")}>
                <span className="block text-sm font-medium text-ui-heading">{t("createTrafficInterception")}</span>
                <span className="mt-1 block text-xs text-ui-secondary">{t("createTrafficInterceptionHelp")}</span>
              </button>
            </div>
          )}
        </div>
        <ul className="m-0 max-h-[min(72vh,900px)] list-none space-y-1 overflow-y-auto overscroll-contain p-0">
          {config.gateways.map((item) => {
            const itemRuntime = status.find((entry) => entry.id === item.id);
            const selected = item.id === selectedId;
            return (
              <li key={item.id} className="group relative min-w-0 rounded-ui-md transition-colors">
                {selected && <WorkspaceSelectionMarker />}
                <button
                  type="button"
                  aria-current={selected ? "true" : undefined}
                  onClick={() => {
                    setSelectedId(item.id);
                    setNarrowEditorOpen(false);
                  }}
                  className="min-w-0 w-full rounded-ui-md py-2.5 pl-3 pr-3 text-left hover:bg-ui-surface-muted/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ui-heading" title={item.name || t("newGateway")}>
                      {item.name || t("newGateway")}
                    </span>
                    <span className={item.enabled ? "h-1.5 w-1.5 shrink-0 rounded-full bg-ui-success" : "h-1.5 w-1.5 shrink-0 rounded-full bg-ui-muted"}
                      aria-hidden="true" />
                  </div>
                  <p className="mt-1 truncate pl-0 text-xs text-ui-secondary">
                    {item.enabled ? t("enabled") : t("disabled")} · {item.listen || t("interception")}
                  </p>
                  <p className="mt-1 text-[11px] text-ui-secondary">
                    {itemRuntime?.requests ?? 0} {t("requests")}
                  </p>
                </button>
              </li>
            );
          })}
          {!config.gateways.length && (
            <li className="px-2 py-8 text-center text-sm text-ui-secondary">{t("empty")}</li>
          )}
        </ul>
      </WorkspaceDirectory>
      <WorkspaceDetail hiddenOnMobile={!gateway} transitionKey={gateway?.id ?? "empty-gateway"}>
        {gateway && interception ? (
          <div className="space-y-4">
            <header className="mb-4 border-b border-ui-border/60 pb-4">
              <Button size="sm" variant="outline-secondary" className="mb-3 gap-2 border-transparent md:hidden"
                onClick={() => setSelectedId(null)}>
                <ArrowLeft size={16} />{t("backToGateways")}
              </Button>
              <h2 className="break-words text-xl font-semibold tracking-tight text-ui-heading">
                {gateway.name || t("newGateway")}
              </h2>
            </header>
            <p className="text-xs text-ui-secondary">
              {gateway.enabled ? t("enabled") : t("disabled")} · {gateway.listen || t("interception")}
              {" · "}{runtime?.requests ?? 0} {t("requests")}
            </p>
            <div className="grid min-w-0 gap-5 xl:grid-cols-[230px_minmax(0,1fr)]">
              <nav aria-label={t("gateway")} className={`min-w-0 max-h-[min(68vh,760px)] overflow-y-auto pr-1 ${narrowEditorOpen ? "hidden xl:block" : ""}`}>
                <ul className="m-0 list-none space-y-0.5 p-0">
                  <NavigationItem label={t("gatewaySettings")} selected={activeSelection.kind === "settings"}
                    onSelect={() => selectEditor({ kind: "settings" })} />
                  <NavigationItem label={t("interception")} selected={activeSelection.kind === "interception"}
                    onSelect={() => selectEditor({ kind: "interception" })} />
                  <NavigationItem label={t("defaultAction")} selected={activeSelection.kind === "defaultAction"}
                    onSelect={() => selectEditor({ kind: "defaultAction" })} />
                </ul>
                <NavigationGroup title={t("rules")} count={rules.length}
                  action={<AddNavigationItemButton label={t("addRule")} onClick={addGatewayRule} />}>
                  {rules.map((rule, index) => (
                    <NavigationItem key={rule.id} label={rule.name || `${t("newRule")} ${index + 1}`}
                      description={`${t("priority")}: ${rule.priority} · ${rule.enabled ? t("enabled") : t("disabled")}`}
                      selected={activeSelection.kind === "rule" && activeSelection.id === rule.id}
                      onSelect={() => selectEditor({ kind: "rule", id: rule.id })} />
                  ))}
                  {!rules.length && <li className="px-3 py-2 text-xs text-ui-secondary">{t("selectRuleHelp")}</li>}
                </NavigationGroup>
                <NavigationGroup title={t("filters")} count={filters.length}
                  action={<AddNavigationItemButton label={t("addFilter")} onClick={addGatewayFilter} />}>
                  {filters.map((filter, index) => (
                    <NavigationItem key={filter.id} label={filter.name || `${t("newFilter")} ${index + 1}`}
                      description={`${filter.enabled ? t("enabled") : t("disabled")} · ${filter.url ? t("sourceUrl") : t("filterText")}`}
                      selected={activeSelection.kind === "filter" && activeSelection.id === filter.id}
                      onSelect={() => selectEditor({ kind: "filter", id: filter.id })} />
                  ))}
                  {!filters.length && <li className="px-3 py-2 text-xs text-ui-secondary">{t("selectFilterHelp")}</li>}
                </NavigationGroup>
                <NavigationGroup title={t("backendPools")} count={pools.length}
                  action={<AddNavigationItemButton label={t("addUpstream")} disabled={!canAddPool} onClick={addGatewayPool} />}>
                  {pools.map((pool, index) => (
                    <NavigationItem key={pool.id} label={pool.name || `${t("newUpstream")} ${index + 1}`}
                      description={`${t(pool.balance)} · ${pool.backends.length} ${t("backends")}`}
                      selected={activeSelection.kind === "pool" && activeSelection.id === pool.id}
                      onSelect={() => selectEditor({ kind: "pool", id: pool.id })} />
                  ))}
                  {!pools.length && <li className="px-3 py-2 text-xs text-ui-secondary">{t("backendPoolHelp")}</li>}
                </NavigationGroup>
                <div className="mt-3 border-t border-ui-border/60 pt-3">
                  <Button variant="outline-danger" onClick={() => removeGateway(gateway.id)}>
                    {t("delete")} {gateway.name || t("gateway")}
                  </Button>
                </div>
              </nav>
              <section className={`min-w-0 space-y-4 border-t border-ui-border/60 pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0 ${narrowEditorOpen ? "" : "hidden xl:block"}`}>
                <header className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Button size="sm" variant="outline-secondary" className="mb-2 gap-2 border-transparent xl:hidden"
                      onClick={() => setNarrowEditorOpen(false)}>
                      <ArrowLeft size={16} />{t("backToGatewayItems")}
                    </Button>
                    <h3 className="break-words text-base font-medium text-ui-heading">{editorTitle}</h3>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    {selectedRule && <Button size="sm" variant="outline-danger" onClick={() => removeGatewayRule(selectedRule)}>
                      {t("delete")}
                    </Button>}
                    {selectedFilter && <>
                      {selectedFilter.url && <Button size="sm" variant="outline-secondary"
                        disabled={!canRefreshFilter} onClick={() => refreshFilter(selectedFilter.id)}>
                        {t("refreshFilter")}
                      </Button>}
                      <Button size="sm" variant="outline-danger" onClick={() => onChange({
                        ...config, filterLists: config.filterLists.filter((item) => item.id !== selectedFilter.id),
                      })}>{t("delete")}</Button>
                    </>}
                    {selectedPool && <Button size="sm" variant="outline-danger"
                      disabled={config.gateways.some((item) =>
                        item.default.upstream === selectedPool.id && item.default.type === "reverse_proxy")
                        || config.rules.some((rule) => rule.action.type === "reverse_proxy" && rule.action.upstream === selectedPool.id)}
                      onClick={() => onChange({
                        ...config, upstreams: config.upstreams.filter((item) => item.id !== selectedPool.id),
                      })}>{t("delete")}</Button>}
                  </div>
                </header>
                {activeSelection.kind === "settings" && <GatewayEditor item={gateway} config={config} minimal change={updateGateway} />}
                {activeSelection.kind === "interception" && <div className="space-y-4">
                  <p className="text-sm text-ui-secondary">{t("routeHandoffHelp")}</p>
                  <InterceptionEditor item={interception} change={updateInterception} />
                </div>}
                {activeSelection.kind === "defaultAction" && <ActionEditor value={gateway.default} upstreams={pools}
                  onChange={(action) => updateGateway({ ...gateway, default: action })} />}
                {selectedRule && <RuleEditor item={selectedRule} config={{ ...config, upstreams: pools }} change={updateRule} />}
                {selectedFilter && <>
                  <FilterEditor item={selectedFilter} config={config} hideGateway change={updateFilter} />
                  {runtime?.filterReports?.filter((report) => report.id === selectedFilter.id).map((report) => (
                    <div key={report.id} className="text-sm">
                      {report.accepted} {t("acceptedRules")} · {report.rejected} {t("rejectedRules")}
                      {report.errors.map((error, index) => <p key={index} className="text-ui-danger">{error}</p>)}
                    </div>
                  ))}
                </>}
                {selectedPool && <UpstreamEditor item={selectedPool} change={updateUpstream} />}
              </section>
            </div>
          </div>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center gap-3 p-6 text-center text-ui-secondary">
            <ListFilter size={28} aria-hidden="true" />
            <h2 className="text-lg font-medium text-ui-heading">
              {config.gateways.length ? t("selectGateway") : t("empty")}
            </h2>
            {config.gateways.length > 0 && <p className="max-w-sm text-sm">{t("selectGatewayHelp")}</p>}
          </div>
        )}
      </WorkspaceDetail>
    </WorkspaceLayout>
  );
}
