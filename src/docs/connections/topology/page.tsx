import { closeConnections } from "@/api/connections";
import { listDNSHistory } from "@/api/dns-history";
import { usePermission } from "@/auth/context";
import { Button } from "@/component/v2/button";
import { MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import type { Connection } from "@/contract/connection";
import { Power } from "lucide-react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { ConnectionInfo, useFlow } from "../components";
import { useConnectionStream } from "../v2/use-connection-stream";
import { TopologyDetails } from "./details";
import { buildDnsTopology } from "./dns";
import { desktopLayout, edgeCurve, LayoutMemory, mobileLayout, samplePath, svgPath } from "./layout";
import { appName, buildTopology, COLUMNS, desktopLimits, emptyFilter, filterOptions, highlightPaths, mobileLimits, searchConnections, type Column, type TopologyFilter, type TopologyNode } from "./model";
import { compactMapping, defaultMapping } from "./ribbons";
import { RateSampler, type Rate } from "./rates";
import { buildScene, type Detail, type Emphasis, type SceneBundle, type SceneEdge } from "./scene";
import { TopologyStage, type Selection, type StageHandle } from "./stage";
import { TopologyToolbar } from "./toolbar";
import { useTopologyCatalog } from "./use-catalog";

/** The model is rebuilt at most this often while events stream in. */
const MODEL_INTERVAL = 400;
const DNS_WINDOW = 5 * 60 * 1000;
const DNS_LIMIT = 200;
const DNS_GAP = 96;
const DETAIL_WIDTH = 360;

function useCompact() {
    const [compact, setCompact] = useState(() => typeof window !== "undefined" && window.matchMedia?.("(max-width: 767px)").matches);
    useEffect(() => {
        const media = window.matchMedia("(max-width: 767px)");
        const update = () => setCompact(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);
    return compact;
}

/** Trailing-edge throttle: the latest value, delivered at most once per interval. */
function useThrottled<T>(value: T, interval: number): T {
    const [current, setCurrent] = useState(value);
    const last = useRef(0);
    useEffect(() => {
        const wait = Math.max(0, last.current + interval - Date.now());
        const timer = window.setTimeout(() => {
            last.current = Date.now();
            setCurrent(value);
        }, wait);
        return () => window.clearTimeout(timer);
    }, [value, interval]);
    return current;
}

function useDebounced<T>(value: T, delay: number): T {
    const [current, setCurrent] = useState(value);
    useEffect(() => {
        const timer = window.setTimeout(() => setCurrent(value), delay);
        return () => window.clearTimeout(timer);
    }, [value, delay]);
    return current;
}

export default function NetworkTopologyPage() {
    const { t } = useTranslation(["topology", "ui"]);
    const toast = useContext(GlobalToastContext);
    const compact = useCompact();
    const stream = useConnectionStream();
    const canDns = usePermission("dns-history:read");
    const [frozen, setFrozen] = useState<{ connections: Record<string, Connection>; rates: Map<string, Rate> } | null>(null);
    const paused = frozen !== null;
    const [filter, setFilter] = useState<TopologyFilter>(emptyFilter);
    const [search, setSearch] = useState("");
    const query = useDebounced(search, 150);
    const [selection, setSelection] = useState<Selection>(null);
    // Zoom level of detail, reported by the stage only when it crosses a threshold.
    const [detail, setDetail] = useState<Detail>("normal");
    const bundlesRef = useRef<SceneBundle[]>([]);
    const [dnsLayer, setDnsLayer] = useState(true);
    const [opened, setOpened] = useState<Connection | undefined>();
    const [closing, setClosing] = useState(false);
    const stage = useRef<StageHandle>(null);
    const root = useRef<HTMLDivElement>(null);

    // Rates: per-connection counter deltas between the 2 s samples of useFlow.
    const { data: flow } = useFlow();
    const sampler = useRef(new RateSampler());
    const [rates, setRates] = useState<Map<string, Rate>>(() => new Map());
    useEffect(() => {
        if (flow) setRates(sampler.current.sample(flow.counters, flow.time.getTime()).rates);
    }, [flow]);

    const liveConnections = useThrottled(stream.connections, MODEL_INTERVAL);
    // Pause freezes what is shown; the stream and the sampler keep running so resuming is current at once.
    const setPaused = useCallback((value: boolean) => setFrozen(value ? { connections: liveConnections, rates } : null), [liveConnections, rates]);
    const connections = frozen?.connections ?? liveConnections;
    const shownRates = frozen?.rates ?? rates;

    const connectionList = useMemo(() => Object.values(connections), [connections]);
    const nodeIds = useMemo(() => [...new Set(connectionList.map(connection => connection.nodeId).filter(Boolean))].sort(), [connectionList]);
    const catalog = useTopologyCatalogStable(nodeIds, !paused);

    const pinned = useRef<{ sources: string[]; destinations: string[] }>({ sources: [], destinations: [] });
    const model = useMemo(() => buildTopology({
        connections: connectionList, rates: shownRates, catalog, filter,
        limits: compact ? mobileLimits : desktopLimits, previous: pinned.current,
    }), [connectionList, shownRates, catalog, filter, compact]);
    useEffect(() => { pinned.current = model.pinned; }, [model]);
    const options = useMemo(() => filterOptions(connectionList, catalog), [connectionList, catalog]);

    const { data: dnsData } = useSWR(canDns && dnsLayer && !paused ? "topology:dns-history" : null,
        () => listDNSHistory({ from: Date.now() - DNS_WINDOW }, 1, DNS_LIMIT),
        { refreshInterval: 5000, revalidateOnFocus: false, keepPreviousData: true, shouldRetryOnError: false });
    const dnsRecords = useMemo(() => dnsData?.items ?? [], [dnsData]);
    const dns = useMemo(() => canDns && dnsLayer && dnsRecords.length ? buildDnsTopology(dnsRecords, compact ? 3 : 6, catalog.apps) : undefined, [canDns, dnsLayer, dnsRecords, compact, catalog.apps]);

    // Layout memory keeps positions across updates; ghosts need a re-layout once they expire.
    const mainMemory = useRef(new LayoutMemory());
    const dnsMemory = useRef(new LayoutMemory());
    const [tick, setTick] = useState(0);
    const layoutOptions = compact ? mobileLayout : desktopLayout;
    useEffect(() => { mainMemory.current.reset(); dnsMemory.current.reset(); }, [compact]);
    const layout = useMemo(() => mainMemory.current.layout(model.nodes, Date.now(), layoutOptions, model.edges),
        // `tick` re-runs the layout so expired ghosts release their slots.
        // oxlint-disable-next-line react-hooks/exhaustive-deps
        [model, layoutOptions, tick]);
    const dnsLayout = useMemo(() => dns ? dnsMemory.current.layout(dns.nodes, Date.now(), layoutOptions, dns.edges) : undefined,
        // oxlint-disable-next-line react-hooks/exhaustive-deps
        [dns, layoutOptions, tick]);
    const hasGhosts = layout.nodes.some(node => node.ghost) || Boolean(dnsLayout?.nodes.some(node => node.ghost));
    useEffect(() => {
        if (!hasGhosts) return;
        const timer = window.setTimeout(() => setTick(value => value + 1), 1500);
        return () => window.clearTimeout(timer);
    }, [hasGhosts, layout]);
    const dnsOffset = layout.height + DNS_GAP;

    const matches = useMemo(() => searchConnections(connectionList, query), [connectionList, query]);
    const emphasis = useMemo<Emphasis | null>(() => {
        if (query.trim()) return highlightPaths(model, matches);
        if (!selection) return null;
        if (selection.type === "node") {
            const node = model.nodes.find(item => item.id === selection.id);
            if (node) return withSelf(highlightPaths(model, node.connectionIds), node.id);
            const dnsNode = dns?.nodes.find(item => item.id === selection.id);
            if (dnsNode) return dnsEmphasis(dns!, dnsNode);
            return null;
        }
        if (selection.type === "bundle") {
            const bundle = bundlesRef.current.find(item => item.id === selection.id);
            if (!bundle) return null;
            const emphasis = withSelf(highlightPaths(model, bundle.connectionIds), bundle.node);
            // Only the trunk's own edges stand out; the rest of their paths stay visible but quiet.
            return { nodes: emphasis.nodes, edges: new Set(bundle.edgeIds) };
        }
        const edge = model.edges.find(item => item.id === selection.id);
        if (edge) return highlightPaths(model, edge.connectionIds);
        return null;
    }, [query, matches, selection, model, dns]);

    // Keep the selection visible next to the detail panel (desktop) or above the sheet (phones).
    const revealed = useRef("");
    useEffect(() => {
        if (!selection || revealed.current === selection.id) return;
        revealed.current = selection.id;
        const bundle = selection.type === "bundle" ? bundlesRef.current.find(item => item.id === selection.id) : undefined;
        const ids = selection.type === "node" ? [selection.id] : bundle ? [bundle.node, ...bundle.peers] : (() => {
            const edge = model.edges.find(item => item.id === selection.id) ?? dns?.edges.find(item => item.id === selection.id);
            return edge ? [edge.from, edge.to] : [];
        })();
        stage.current?.reveal(ids, compact ? 0 : DETAIL_WIDTH + 24);
    }, [selection, model, dns, compact]);
    useEffect(() => {
        if (selection || !revealed.current) return;
        revealed.current = "";
        stage.current?.restore();
    }, [selection]);

    // Escape clears the selection from anywhere on the page, except while typing or in a dialog.
    useEffect(() => {
        if (!selection) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key !== "Escape" || event.defaultPrevented || opened) return;
            const target = event.target as HTMLElement | null;
            if (target?.closest("input, textarea, [role=dialog], [role=menu]")) return;
            setSelection(null);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [selection, opened]);

    const focusedSearch = useRef("");
    useEffect(() => {
        const value = query.trim();
        if (!value || !emphasis || focusedSearch.current === value) return;
        focusedSearch.current = value;
        if (emphasis.nodes.size) stage.current?.focus(emphasis.nodes);
    }, [query, emphasis]);
    useEffect(() => { if (!query.trim()) focusedSearch.current = ""; }, [query]);

    // Bundling: a search or a node/edge selection expands the paths involved; a selected
    // trunk stays bundled so its members remain recognisable as one group.
    const { edges: scene, bundles } = useMemo<{ edges: SceneEdge[]; bundles: SceneBundle[] }>(() => {
        const expand = selection?.type === "bundle" ? null : emphasis?.edges ?? null;
        const main = buildScene(layout, model.edges, emphasis, false, 0, detail, expand);
        if (!dns || !dnsLayout) return main;
        const auxiliary = buildScene(dnsLayout, dns.edges, emphasis, true, dnsOffset).edges;
        return { edges: [...main.edges, ...auxiliary, ...fakeIpLinks(layout, dnsLayout, dnsOffset, model.nodes, selection)], bundles: main.bundles };
    }, [layout, model, emphasis, dns, dnsLayout, dnsOffset, selection, detail]);
    useEffect(() => { bundlesRef.current = bundles; }, [bundles]);

    const ghost = useMemo(() => selection?.type === "node" ? [...layout.nodes, ...(dnsLayout?.nodes ?? [])].find(node => node.ghost && node.node.id === selection.id)?.node : undefined, [selection, layout, dnsLayout]);

    const columnLabels = useMemo(() => Object.fromEntries(COLUMNS.map(column => [column, t(`columns.${column}`)])) as Record<Column, string>, [t]);
    const mapping = compact ? compactMapping : defaultMapping;
    const onSelect = useCallback((next: Selection) => setSelection(next), []);

    const disconnect = (id: string) => {
        setClosing(true);
        closeConnections([id])
            .then(() => { setOpened(undefined); stream.removeLocally([id]); })
            .catch(error => toast.Error(`disconnect failed: ${error.msg ?? error}`))
            .finally(() => setClosing(false));
    };
    const [openedDetail, setOpenedDetail] = useState(opened);
    if (opened && opened !== openedDetail) setOpenedDetail(opened);

    if (stream.error && !stream.hydrated) return <Loading code={stream.error.code} onRetry={() => void stream.mutate()}>{stream.error.msg}</Loading>;
    if (!stream.hydrated) return <Loading />;

    const details = (
        <TopologyDetails selection={selection} model={model} dns={dns} dnsRecords={dnsRecords} ghost={ghost} bundles={bundles}
            connections={connections} rates={shownRates} appName={process => appName(process, catalog)} onSelect={onSelect} onOpenConnection={setOpened}
            onClose={() => setSelection(null)} sheet={compact} />
    );

    return (
        <MainContainer className="flex h-full min-h-0 min-w-0 flex-col">
            <TopologyToolbar
                state={stream.state} paused={paused} onPausedChange={setPaused}
                visible={model.visible} total={model.total} up={model.up} down={model.down}
                search={search} onSearchChange={setSearch} matches={matches.size}
                filter={filter} options={options} onFilterChange={setFilter}
                dnsAvailable={canDns} dns={dnsLayer} onDnsChange={setDnsLayer}
            />
            {stream.streamError && (
                <div className="mb-3 rounded-ui-lg border border-ui-warning/40 bg-ui-warning/10 px-4 py-2 text-sm text-ui-warning" role="status">{stream.streamError}</div>
            )}
            <div ref={root} data-topology-ready className="relative flex min-h-[420px] min-w-0 flex-1 overflow-hidden rounded-ui-lg border border-ui-border bg-ui-bg max-md:-mx-[var(--page-gutter)] max-md:rounded-none max-md:border-x-0">
                <TopologyStage
                    ref={stage}
                    layout={layout}
                    dns={dns && dnsLayout ? { layout: dnsLayout, offset: dnsOffset, label: t("dnsBand", { count: dns.records }) } : undefined}
                    scene={scene}
                    bundles={bundles}
                    onDetailChange={setDetail}
                    emphasis={emphasis}
                    selection={selection}
                    paused={paused}
                    compact={compact}
                    mapping={mapping}
                    columnLabels={columnLabels}
                    fullscreenTarget={root}
                    onSelect={onSelect}
                >
                    {model.total === 0 && (
                        <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-6">
                            <p className="rounded-ui-md border border-ui-border bg-ui-surface px-4 py-2 text-sm text-ui-muted shadow-ui-card">{t("empty")}</p>
                        </div>
                    )}
                </TopologyStage>
                {!compact && selection && (
                    <aside className="absolute bottom-16 right-3 top-3 z-10 w-[min(360px,calc(100%-24px))] overflow-y-auto overscroll-contain rounded-ui-lg border border-ui-border bg-ui-surface p-4 shadow-ui-elevated" aria-label={t("details.label")}>
                        {details}
                    </aside>
                )}
            </div>

            <Modal open={compact && selection !== null} onOpenChange={open => !open && setSelection(null)}>
                <ModalContent mobileSheet>
                    <ModalHeader closeButton><ModalTitle>{selection?.type === "edge" ? t("details.edgeTitle") : selection?.type === "bundle" ? t("details.bundleTitle") : t("details.nodeTitle")}</ModalTitle></ModalHeader>
                    <ModalBody className="pt-2">{compact && details}</ModalBody>
                </ModalContent>
            </Modal>

            <Modal open={opened !== undefined} onOpenChange={open => !open && setOpened(undefined)}>
                <ModalContent mobileSheet>
                    <ModalHeader closeButton><ModalTitle>{t("ui:connectionDetails")}</ModalTitle></ModalHeader>
                    <ModalBody className="pt-2">{openedDetail && <ConnectionInfo value={openedDetail} />}</ModalBody>
                    <ModalFooter className="border-t-0 px-3 pb-3 pt-0">
                        {openedDetail && (
                            <Button permission="connections:write" variant="destructive" className="flex w-full items-center justify-center py-2 notranslate"
                                disabled={closing} onClick={() => disconnect(openedDetail.id)}>
                                {closing ? <Spinner size="sm" className="mr-2" /> : <Power className="mr-2 text-xl" />}
                                <span>{t("ui:disconnect")}</span>
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </MainContainer>
    );
}

/** The catalog only changes when its sources do; node ids are compared by value. */
function useTopologyCatalogStable(nodeIds: string[], live: boolean) {
    const key = nodeIds.join(",");
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    const stable = useMemo(() => nodeIds, [key]);
    return useTopologyCatalog(stable, live);
}

function withSelf(emphasis: Emphasis, id: string): Emphasis {
    emphasis.nodes.add(id);
    return emphasis;
}

function dnsEmphasis(dns: NonNullable<ReturnType<typeof buildDnsTopology>>, node: TopologyNode): Emphasis {
    const records = new Set(node.dns?.recordIds);
    const nodes = new Set<string>([node.id]);
    for (const other of dns.nodes) if (other.dns?.recordIds.some(id => records.has(id))) nodes.add(other.id);
    const edges = new Set(dns.edges.filter(edge => nodes.has(edge.from) && nodes.has(edge.to)).map(edge => edge.id));
    return { nodes, edges };
}

/**
 * FakeIP association: dotted links from the DNS band's FakeIP answer node to
 * the destinations whose connections were made to a FakeIP address. Drawn
 * only while one of them is selected, so they never clutter the graph.
 */
function fakeIpLinks(layout: ReturnType<LayoutMemory["layout"]>, dnsLayout: ReturnType<LayoutMemory["layout"]>, offset: number, nodes: TopologyNode[], selection: Selection): SceneEdge[] {
    if (selection?.type !== "node") return [];
    const fakeNode = dnsLayout.byId.get("dns:answer:fakeip");
    if (!fakeNode) return [];
    const targets = nodes.filter(node => node.column === "destination" && node.fakeIp && (selection.id === fakeNode.node.id || selection.id === node.id));
    const { nodeWidth: w, nodeHeight: h, orientation } = layout.options;
    return targets.flatMap(target => {
        const placed = layout.byId.get(target.id);
        if (!placed) return [];
        const from = { ...fakeNode, y: fakeNode.y + offset };
        const curve = orientation === "horizontal"
            ? [{ x: from.x + w, y: from.y + h / 2 }, { x: from.x + w + 70, y: from.y + h / 2 }, { x: placed.x + w + 70, y: placed.y + h / 2 }, { x: placed.x + w, y: placed.y + h / 2 }] as Parameters<typeof samplePath>[0]
            : edgeCurve(layout, placed, from);
        const d = svgPath(curve);
        const id = `fakeip>${target.id}`;
        return [{
            edge: { id, from: fakeNode.node.id, to: target.id, network: "udp" as const, connections: target.connections, up: 0, down: 0, connectionIds: target.connectionIds },
            d,
            interactive: false,
            render: { id, d, ends: [curve[0].x, curve[0].y, curve[3].x, curve[3].y], vertical: orientation !== "horizontal", length: samplePath(curve).length, dashed: true, up: 0, down: 0, alpha: 1, highlighted: true, auxiliary: { weight: 1 } },
        }];
    });
}

