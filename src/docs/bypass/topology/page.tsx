"use client"

import { listNodes } from "@/api/nodes";
import { listResolvers } from "@/api/resolvers";
import { getRouteConfig, getRule, listRouteLists, listRules, listTags } from "@/api/route";
import { useTheme } from "@/common/ThemeProvider";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import type { Node } from "@/contract/node";
import type { Resolver } from "@/contract/resolver";
import type { RouteRule, RuleExpr, RuleItem, TagItem, ListItem } from "@/contract/route";
import { ArrowRight, Braces, ChevronRight, CircleHelp, ExternalLink, Globe2, List, Route, Server, Sun, Tag, Waypoints } from "lucide-react";
import type { ElementType, ReactNode } from "react";
import { useMemo, useState } from "react";
import useSWR from "swr";
import { useLocation } from "wouter";

type ModeTone = "proxy" | "direct" | "block" | "bypass" | "muted";

const modeToneStyles: Record<ModeTone, { card: string; icon: string; badge: "primary" | "success" | "danger" | "warning" | "muted" }> = {
    proxy: { card: "border-ui-primary/25 bg-ui-primary-soft/35", icon: "bg-ui-primary-soft text-ui-primary", badge: "primary" },
    direct: { card: "border-ui-success/25 bg-ui-success-soft/35", icon: "bg-ui-success-soft text-ui-success", badge: "success" },
    block: { card: "border-ui-danger/25 bg-ui-danger-soft/35", icon: "bg-ui-danger-soft text-ui-danger", badge: "danger" },
    bypass: { card: "border-ui-warning/25 bg-ui-warning-soft/35", icon: "bg-ui-warning-soft text-ui-warning", badge: "warning" },
    muted: { card: "border-ui-border bg-ui-surface-muted/55", icon: "bg-ui-surface-muted text-ui-muted", badge: "muted" },
};

function ruleKey(item: RuleItem) {
    return `${item.name}:${item.index}`;
}

function modeTone(mode?: string): ModeTone {
    switch ((mode ?? "").toLowerCase()) {
        case "proxy": return "proxy";
        case "direct": return "direct";
        case "block": return "block";
        case "bypass": return "bypass";
        default: return "muted";
    }
}

function modeLabel(mode?: string) {
    switch ((mode ?? "").toLowerCase()) {
        case "proxy": return "Proxy";
        case "direct": return "Direct exit";
        case "bypass": return "Bypass";
        case "block": return "Block";
        default: return mode || "Default route";
    }
}

function collectListReferences(expr: RuleExpr | undefined, names: string[]) {
    if (!expr) return;
    switch (expr.type) {
        case "all":
            expr.all.forEach((child) => collectListReferences(child, names));
            break;
        case "any":
            expr.any.forEach((child) => collectListReferences(child, names));
            break;
        case "not":
            collectListReferences(expr.not, names);
            break;
        case "host":
            if (expr.host?.list) names.push(expr.host.list);
            break;
        case "process":
            if (expr.process?.list) names.push(expr.process.list);
            break;
        default:
            break;
    }
}

function listReferences(rule?: RouteRule) {
    const names: string[] = [];
    rule?.rules?.forEach((expr) => collectListReferences(expr, names));
    return Array.from(new Set(names));
}

function resolveRule(item: RuleItem, detail?: RouteRule): RouteRule {
    return detail ?? {
        name: item.name,
        mode: item.mode,
        tag: item.tag,
        resolver: item.resolver,
        rules: [],
    };
}

function sourcePreview(item?: ListItem) {
    if (!item) return "List reference";
    if (item.itemCount > 0) return `${item.itemCount.toLocaleString()} entries · ${item.type || "source"}`;
    return item.type || item.source || "Match source";
}

function TopologyCard({
    icon: Icon,
    title,
    subtitle,
    children,
    className = "",
    tone = "muted",
}: {
    icon: ElementType;
    title: ReactNode;
    subtitle?: ReactNode;
    children?: ReactNode;
    className?: string;
    tone?: ModeTone;
}) {
    const styles = modeToneStyles[tone];
    return (
        <div className={`min-w-0 rounded-ui-lg border px-3.5 py-3 shadow-[0_5px_16px_rgba(42,72,116,0.05)] ${styles.card} ${className}`}>
            <div className="flex min-w-0 items-start gap-2.5">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-ui-md ${styles.icon}`}>
                    <Icon size={17} strokeWidth={1.9} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="truncate text-[0.78rem] font-bold text-ui-heading" title={typeof title === "string" ? title : undefined}>{title}</div>
                    {subtitle && <div className="mt-1 truncate text-[0.68rem] leading-4 text-ui-muted" title={typeof subtitle === "string" ? subtitle : undefined}>{subtitle}</div>}
                    {children}
                </div>
            </div>
        </div>
    );
}

function LaneHeading({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="mb-4 flex min-h-[58px] flex-col items-center justify-start border-b border-ui-border/70 px-2 pb-3 text-center">
            <div className="text-[0.9rem] font-bold text-ui-heading">{title}</div>
            <div className="mt-1 text-[0.68rem] leading-4 text-ui-muted">{subtitle}</div>
        </div>
    );
}

function LaneConnector({ dashed = false }: { dashed?: boolean }) {
    const stroke = dashed ? "var(--color-violet)" : "var(--color-primary)";
    return (
        <div className="relative z-20 flex min-h-[108px] items-center justify-center" aria-hidden="true">
            <svg className="block h-5 w-24 shrink-0 translate-x-2 overflow-visible" viewBox="0 0 96 20" preserveAspectRatio="none">
                <circle cx="0" cy="10" r="3.25" fill={stroke} />
                <line x1="4" y1="10" x2="74" y2="10" stroke={stroke} strokeWidth="2.5" strokeDasharray={dashed ? "6 5" : undefined} vectorEffect="non-scaling-stroke" />
                <path d="M72 5 L80 10 L72 15" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
        </div>
    );
}

function InlineRouteLink() {
    return (
        <div className="-mx-2 flex min-w-[54px] shrink-0 items-center text-ui-primary" aria-hidden="true">
            <span className="h-0.5 flex-1 bg-ui-primary/70" />
            <ArrowRight size={15} strokeWidth={2.2} />
        </div>
    );
}

const sourceCards = [
    { icon: Globe2, title: "Your device", subtitle: "All traffic enters the route engine", tone: "proxy" as ModeTone },
    { icon: Braces, title: "Application · Browser", subtitle: "Process and destination context", tone: "bypass" as ModeTone },
    { icon: Server, title: "Inbound · server-tun", subtitle: "TCP · UDP traffic", tone: "direct" as ModeTone },
];

function SourceCell({ index }: { index: number }) {
    if (index < sourceCards.length) {
        return <TopologyCard {...sourceCards[index]} className="min-h-[108px]" />;
    }
    if (index === sourceCards.length) {
        return <div className="flex min-h-[108px] items-center justify-center rounded-ui-lg border border-dashed border-ui-border px-4 text-center text-[0.68rem] leading-5 text-ui-muted">The same source context continues through the remaining rules.</div>;
    }
    return <div className="min-h-[108px]" aria-hidden="true" />;
}

function RuleCell({ item, index, detail, selected, onSelect }: { item: RuleItem; index: number; detail?: RouteRule; selected: boolean; onSelect: (item: RuleItem) => void }) {
    const tone = modeTone(item.mode);
    const refs = listReferences(detail);
    return (
        <button
            type="button"
            onClick={() => onSelect(item)}
            className={`min-h-[108px] w-full rounded-ui-lg border px-3.5 py-3 text-left shadow-[0_5px_16px_rgba(42,72,116,0.05)] transition-[border-color,box-shadow,background-color] ${selected ? "border-ui-primary bg-ui-primary-soft/45 shadow-[0_7px_19px_rgba(33,105,232,0.12)] ring-2 ring-ui-primary/15" : "border-ui-border !bg-[var(--color-surface)] hover:border-ui-primary/40 hover:bg-ui-hover"}`}
            aria-pressed={selected}
        >
            <div className="flex min-w-0 items-start gap-2.5">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${selected ? "bg-ui-primary text-white" : "bg-ui-primary-soft text-ui-primary"}`}>{index + 1}</span>
                <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center gap-2">
                        <span className="min-w-0 truncate text-[0.8rem] font-bold text-ui-heading">{item.name || "Unnamed rule"}</span>
                        {item.disabled && <Badge variant="muted" pill className="px-1.5 py-0.5 text-[0.58rem]">Off</Badge>}
                    </span>
                    <span className="mt-1 block text-[0.67rem] leading-4 text-ui-muted">{refs.length > 0 ? `Matches ${refs.length} list${refs.length === 1 ? "" : "s"}` : `${item.ruleCount || 0} condition${item.ruleCount === 1 ? "" : "s"}`}</span>
                    <span className="mt-2 inline-flex items-center gap-1.5"><Badge variant={modeToneStyles[tone].badge} pill className="px-2 py-0.5 text-[0.59rem] uppercase tracking-wide">{modeLabel(item.mode)}</Badge><span className="truncate text-[0.64rem] text-ui-muted">{item.tag || "default tag"}</span></span>
                </span>
                <ChevronRight className="mt-1 shrink-0 text-ui-muted/60" size={15} />
            </div>
        </button>
    );
}

function MatchSourceCell({ detail, lists, selected }: { detail?: RouteRule; lists: ListItem[]; selected: boolean }) {
    const refs = listReferences(detail);
    if (refs.length === 0) {
        return <div className="flex min-h-[108px] items-center justify-center rounded-ui-lg border border-dashed border-ui-border px-3 text-center text-[0.68rem] text-ui-muted">No list reference · always / other conditions</div>;
    }
    const firstList = lists.find((entry) => entry.name === refs[0]);
    const title = refs.length === 1 ? `List · ${refs[0]}` : `Lists · ${refs.length} references`;
    const subtitle = refs.length === 1 ? sourcePreview(firstList) : "Condition inputs · first match wins";
    return (
        <TopologyCard icon={List} title={title} subtitle={subtitle} tone="muted" className={`${selected ? "ring-2 ring-[var(--color-violet)]/25" : ""} min-h-[108px] !border-[var(--color-violet)]/50 !bg-[var(--color-surface)] px-2.5 py-2 shadow-[0_5px_14px_rgba(42,72,116,0.04)]`}>
            <div className="mt-2 flex min-w-0 items-center gap-1.5 overflow-hidden">
                {refs.slice(0, 3).map((name) => <span key={name} className="min-w-0 truncate rounded-full border border-[var(--color-violet)]/30 bg-[var(--color-violet-soft)] px-1.5 py-0.5 text-[0.57rem] text-ui-muted">{name}</span>)}
                {refs.length > 3 && <span className="shrink-0 text-[0.57rem] font-semibold text-[var(--color-violet)]">+{refs.length - 3}</span>}
                <Badge variant="secondary" className="ml-auto shrink-0 px-1.5 py-0.5 text-[0.57rem]">Ref</Badge>
            </div>
        </TopologyCard>
    );
}

function resolveExit(mode: string, tagName: string, tag: TagItem | undefined, nodes: Node[]) {
    if (mode === "block") return { icon: CircleHelp, title: "Block", subtitle: "Drop / reject traffic", nodeNames: [], tone: "block" as ModeTone };
    if (mode === "direct" || mode === "bypass") return { icon: Globe2, title: "Direct exit", subtitle: "Connect without a node", nodeNames: [], tone: "direct" as ModeTone };
    const nodeNames = tag?.type === "node"
        ? nodes.filter((node) => tag.hash.includes(node.id)).map((node) => node.name || node.id)
        : [];
    return {
        icon: Waypoints,
        title: `Node group · ${tagName || "proxy"}`,
        subtitle: nodeNames.length > 0 ? nodeNames.slice(0, 2).join(" · ") : tag?.type === "mirror" ? "Mirror tag · multiple exits" : "Smart select best node",
        nodeNames,
        tone: "proxy" as ModeTone,
    };
}

function ResultCell({ item, detail, tags, nodes, resolvers, routeConfig, selected }: { item: RuleItem; detail?: RouteRule; tags: TagItem[]; nodes: Node[]; resolvers: Resolver[]; routeConfig?: { directResolver?: string; proxyResolver?: string }; selected: boolean }) {
    const rule = resolveRule(item, detail);
    const mode = (rule.mode || item.mode || "").toLowerCase();
    const tone = modeTone(mode);
    const tagName = rule.tag || item.tag || modeLabel(mode);
    const tag = tags.find((entry) => entry.name === tagName);
    const resolverId = rule.resolver || (mode === "proxy" ? routeConfig?.proxyResolver : routeConfig?.directResolver) || "system";
    const resolver = resolvers.find((entry) => entry.id === resolverId);
    const exit = resolveExit(mode, tagName, tag, nodes);
    return (
        <div className={`flex min-h-[108px] items-center gap-2 rounded-ui-lg ${selected ? "ring-2 ring-ui-primary/15" : ""}`}>
            <TopologyCard icon={Tag} title={`Tag · ${tagName}`} subtitle={tag?.type ? `${tag.type} route target` : "Rule result"} tone={tone} className="min-h-[108px] min-w-0 flex-[0.9] px-2.5 py-2 shadow-[0_5px_14px_rgba(42,72,116,0.04)]" />
            <InlineRouteLink />
            <TopologyCard icon={exit.icon} title={exit.title} subtitle={`${resolverId} · ${resolver?.type || "resolver"} · ${exit.subtitle}`} tone={exit.tone} className="min-h-[108px] min-w-0 flex-[1.1] px-2.5 py-2 shadow-[0_5px_14px_rgba(42,72,116,0.04)]">
                {exit.nodeNames.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{exit.nodeNames.slice(0, 3).map((name) => <span key={name} className="inline-flex items-center gap-1 rounded-full border border-ui-border bg-ui-surface-muted px-1.5 py-0.5 text-[0.58rem] text-ui-muted"><i className="h-1.5 w-1.5 rounded-full bg-ui-success" />{name}</span>)}</div>}
            </TopologyCard>
        </div>
    );
}

function TopologyRow({ item, index, detail, lists, tags, nodes, resolvers, routeConfig, selected, onSelect }: { item: RuleItem; index: number; detail?: RouteRule; lists: ListItem[]; tags: TagItem[]; nodes: Node[]; resolvers: Resolver[]; routeConfig?: { directResolver?: string; proxyResolver?: string }; selected: boolean; onSelect: (item: RuleItem) => void }) {
    return (
        <div className="grid min-w-[1140px] grid-cols-[minmax(170px,0.9fr)_48px_minmax(215px,1.1fr)_48px_minmax(215px,1.05fr)_48px_minmax(365px,1.6fr)] items-stretch gap-0">
            <div className="min-w-0 border-r border-ui-border/70 px-4"><SourceCell index={index} /></div>
            <LaneConnector />
            <div className="min-w-0 border-r border-ui-border/70 px-4"><RuleCell item={item} index={index} detail={detail} selected={selected} onSelect={onSelect} /></div>
            <LaneConnector dashed />
            <div className="min-w-0 border-r border-ui-border/70 px-4"><MatchSourceCell detail={detail} lists={lists} selected={selected} /></div>
            <LaneConnector />
            <div className="min-w-0 px-4"><ResultCell item={item} detail={detail} tags={tags} nodes={nodes} resolvers={resolvers} routeConfig={routeConfig} selected={selected} /></div>
        </div>
    );
}

export default function BypassTopologyPage() {
    const [, navigate] = useLocation();
    const { resolved, setPreference } = useTheme();
    const [selectedKey, setSelectedKey] = useState<string>();
    const { data: rules, error: rulesError, isLoading: rulesLoading } = useSWR("/api/v2/route/rules/topology", () => listRules({ page: 1, pageSize: 100 }), { revalidateOnFocus: false });
    const { data: lists, error: listsError } = useSWR("/api/v2/route/lists/topology", () => listRouteLists({ page: 1, pageSize: 100 }), { revalidateOnFocus: false });
    const { data: tags, error: tagsError } = useSWR("/api/v2/route/tags/topology", () => listTags({ page: 1, pageSize: 100 }), { revalidateOnFocus: false });
    const { data: resolvers, error: resolversError } = useSWR("/api/v2/resolvers/topology", () => listResolvers({ page: 1, pageSize: 100 }), { revalidateOnFocus: false });
    const { data: nodes, error: nodesError } = useSWR("/api/v2/nodes/topology", () => listNodes({ page: 1, pageSize: 100 }), { revalidateOnFocus: false });
    const { data: routeConfig } = useSWR("/api/v2/route/config/topology", getRouteConfig, { revalidateOnFocus: false });

    const ruleItems = rules?.items ?? [];
    const activeKey = selectedKey && ruleItems.some((item) => ruleKey(item) === selectedKey) ? selectedKey : ruleItems[0] ? ruleKey(ruleItems[0]) : undefined;
    const visibleRules = ruleItems.slice(0, 8);
    const detailKey = visibleRules.length > 0 ? visibleRules.map(ruleKey).join("|") : null;
    const { data: detailItems, error: detailsError, isLoading: detailsLoading } = useSWR(
        detailKey ? ["/api/v2/route/rules/topology-details", detailKey] : null,
        () => Promise.all(visibleRules.map((item) => getRule(item.name, item.index))),
        { revalidateOnFocus: false },
    );

    const detailMap = useMemo(() => new Map((detailItems ?? []).map((item, index) => [visibleRules[index] ? ruleKey(visibleRules[index]) : item.name, item])), [detailItems, visibleRules]);
    const loading = rulesLoading || !rules;
    const error = rulesError || listsError || tagsError || resolversError || nodesError || detailsError;

    if (error) return <Loading code={error.code}>{error.msg}</Loading>;
    if (loading) return <Loading />;

    return (
        <MainContainer className="!max-w-none !pb-5">
            <div className="flex items-center justify-between border-b border-ui-border/80 px-1 py-2">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-[-0.03em] text-ui-heading">Routing</h1>
                    <Badge variant="primary" pill className="px-2.5 py-1 text-[0.64rem]">Topology</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <span className="hidden items-center gap-2 rounded-full border border-ui-success/25 bg-ui-success-soft/50 px-3 py-1.5 text-xs font-semibold text-ui-success sm:inline-flex"><i className="h-2 w-2 rounded-full bg-ui-success" /> Service running</span>
                    <Button size="icon" variant="outline-secondary" onClick={() => navigate("/docs/bypass")} aria-label="Open rule editor" title="Open rule editor"><ExternalLink size={16} /></Button>
                    <Button size="icon" variant="outline-secondary" onClick={() => setPreference(resolved === "dark" ? "light" : "dark")} aria-label={resolved === "dark" ? "Switch to light theme" : "Switch to dark theme"} title={resolved === "dark" ? "Switch to light theme" : "Switch to dark theme"}><Sun size={16} /></Button>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-ui-lg border border-ui-border bg-[var(--color-surface)] px-4 py-3 text-[0.68rem] text-ui-muted">
                <span className="font-bold text-ui-heading">How to read</span>
                <span>1. Read rules from top to bottom.</span>
                <span>2. The first matching rule wins.</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-5 border-t-2 border-dashed border-[var(--color-violet)]" /> List condition</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-5 bg-ui-primary" /> Route result</span>
                <span className="font-semibold text-ui-primary">Click a rule to highlight its path.</span>
            </div>

            <section className="mt-3 overflow-hidden rounded-ui-lg border border-ui-border bg-[radial-gradient(circle_at_52%_42%,var(--color-surface)_0,var(--color-surface-muted)_68%,var(--color-bg)_100%)] shadow-[0_10px_30px_rgba(42,72,116,0.06)]" aria-label="Routing topology map">
                <div className="overflow-x-auto p-3 sm:p-4">
                    {ruleItems.length === 0 ? (
                        <div className="flex min-h-[360px] min-w-[980px] flex-col items-center justify-center gap-3 text-center text-ui-muted">
                            <Route className="text-ui-primary" size={30} />
                            <strong className="text-ui-heading">No route rules yet</strong>
                            <span className="max-w-sm text-sm">Create a rule first, then this page will show its list dependencies and route result.</span>
                            <Button onClick={() => navigate("/docs/bypass")}>Open rules</Button>
                        </div>
                    ) : (
                        <div className="min-w-[1140px]">
                            <div className="grid grid-cols-[minmax(170px,0.9fr)_48px_minmax(215px,1.1fr)_48px_minmax(215px,1.05fr)_48px_minmax(365px,1.6fr)] gap-0">
                                <div className="min-w-0 border-r border-ui-border/70 px-4"><LaneHeading title="Source" subtitle="Device / Application / Inbound" /></div>
                                <div aria-hidden="true" />
                                <div className="min-w-0 border-r border-ui-border/70 px-4"><LaneHeading title="Rule evaluation" subtitle="First matching rule wins" /></div>
                                <div aria-hidden="true" />
                                <div className="min-w-0 border-r border-ui-border/70 px-4"><LaneHeading title="Match sources" subtitle="Lists are condition inputs, not stages" /></div>
                                <div aria-hidden="true" />
                                <div className="min-w-0 px-4"><LaneHeading title="Route result" subtitle="Resolver / Exit" /></div>
                            </div>
                            <div className="mt-3 space-y-3">
                                {visibleRules.map((item, index) => <TopologyRow key={ruleKey(item)} item={item} index={index} detail={detailMap.get(ruleKey(item))} lists={lists?.items ?? []} tags={tags?.items ?? []} nodes={nodes?.items ?? []} resolvers={resolvers?.items ?? []} routeConfig={routeConfig} selected={ruleKey(item) === activeKey} onSelect={(selectedItem) => setSelectedKey(ruleKey(selectedItem))} />)}
                            </div>
                        </div>
                    )}
                </div>

                {ruleItems.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ui-border/70 bg-[var(--color-surface)] px-5 py-3 text-xs text-ui-muted">
                    <span>{detailsLoading ? "Loading rule references…" : `${`Showing ${visibleRules.length} of ${rules.page.total} rules`}${activeKey ? ` · Active: ${visibleRules.find((item) => ruleKey(item) === activeKey)?.name || "selected rule"}` : ""}`}</span>
                    <span className="inline-flex items-center gap-1.5"><CircleHelp size={14} /> Select a rule to inspect its complete match path.</span>
                </div>}
            </section>

        </MainContainer>
    );
}
