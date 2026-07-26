"use client";

import type { Connection } from "@/contract/connection";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Map as MapIcon, Maximize2, Minimize2, Minus, Plus, RotateCcw, ShieldCheck } from "lucide-react";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type TopologyKind = "device" | "application" | "inbound" | "route" | "outbound";

type TopologyNode = {
    id: string;
    kind: TopologyKind;
    label: string;
    meta: string;
    count: number;
    x: number;
    y: number;
};

type TopologyEdge = {
    id: string;
    from: string;
    to: string;
    count: number;
};

type TopologyGraph = {
    nodes: TopologyNode[];
    edges: TopologyEdge[];
    paths: Array<{ nodeIds: string[]; edgeIds: string[] }>;
    width: number;
    height: number;
};

const nodeWidth = 270;
const nodeHeight = 72;
const columnX: Record<TopologyKind, number> = {
    device: 32,
    application: 382,
    inbound: 732,
    route: 1082,
    outbound: 1432,
};
const columnLabels: Array<{ kind: TopologyKind; label: string }> = [
    { kind: "device", label: "Source" },
    { kind: "application", label: "Application" },
    { kind: "inbound", label: "Inbound" },
    { kind: "route", label: "Route decision" },
    { kind: "outbound", label: "Outbound" },
];

function routeModeLabel(mode?: string) {
    switch (mode) {
        case "proxy": return "Proxy";
        case "direct": return "Direct";
        case "bypass": return "Bypass";
        case "block": return "Block";
        default: return mode || "Default route";
    }
}

function shorten(value: string, length = 26) {
    return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

function applicationName(process: string) {
    const normalized = process.trim();
    if (!normalized) return "Unknown application";
    return normalized.split(/[\\/]/).pop() || normalized;
}

function routeLabel(connection: Connection) {
    return connection.tag
        || connection.matchHistory?.find((entry) => entry.history.some((item) => item.matched))?.ruleName
        || routeModeLabel(connection.mode);
}

function buildTopology(connections: Connection[]): TopologyGraph {
    const graphNodes = new globalThis.Map<string, Omit<TopologyNode, "x" | "y">>();
    const graphEdges = new globalThis.Map<string, TopologyEdge>();
    const graphPaths: TopologyGraph["paths"] = [];

    const addNode = (id: string, kind: TopologyKind, label: string, meta: string, count = 1) => {
        const existing = graphNodes.get(id);
        if (existing) existing.count += count;
        else graphNodes.set(id, { id, kind, label, meta, count });
    };
    const addEdge = (from: string, to: string, count = 1) => {
        const id = `${from}->${to}`;
        const existing = graphEdges.get(id);
        if (existing) existing.count += count;
        else graphEdges.set(id, { id, from, to, count });
        return id;
    };

    const deviceId = "device:this-computer";
    addNode(deviceId, "device", "Your device", "This computer");

    for (const connection of connections) {
        const inboundId = `inbound:${connection.inbound || connection.inboundName || "unknown"}`;
        const routeId = `route:${connection.tag}|${routeLabel(connection)}|${connection.mode || "default"}`;
        const outboundId = `outbound:${connection.nodeId || connection.nodeName || connection.outbound || "unresolved"}`;
        const applicationId = `application:${connection.process || connection.component || "unknown"}`;
        const inboundLabel = connection.inboundName || connection.inbound || "Unknown inbound";
        const outboundLabel = connection.nodeName || connection.nodeId || connection.outbound || "Unresolved outbound";
        const applicationLabel = applicationName(connection.process || connection.component || "");

        addNode(applicationId, "application", applicationLabel, connection.pid ? `pid · ${connection.pid}` : "Active application");
        addNode(inboundId, "inbound", inboundLabel, connection.network.connType || connection.protocol || "connection");
        addNode(routeId, "route", routeLabel(connection), connection.tag ? `tag · ${connection.tag}` : routeModeLabel(connection.mode));
        addNode(outboundId, "outbound", outboundLabel, connection.nodeId ? `node · ${connection.nodeId}` : connection.outbound || "No node id");

        const nodeIds = [deviceId, applicationId, inboundId, routeId, outboundId];
        const edgeIds = [
            addEdge(deviceId, applicationId),
            addEdge(applicationId, inboundId),
            addEdge(inboundId, routeId),
            addEdge(routeId, outboundId),
        ];
        graphPaths.push({ nodeIds, edgeIds });
    }

    const rawNodes = [...graphNodes.values()];
    const rowsByKind = new globalThis.Map<TopologyKind, typeof rawNodes>();
    const rowIndexById = new globalThis.Map<string, number>();
    for (const node of rawNodes) {
        const rows = rowsByKind.get(node.kind) ?? [];
        rowIndexById.set(node.id, rows.length);
        rows.push(node);
        rowsByKind.set(node.kind, rows);
    }
    const maxRows = Math.max(...columnLabels.map(({ kind }) => rowsByKind.get(kind)?.length ?? 0), 1);
    const height = Math.max(500, 105 + maxRows * 102);
    const positioned = rawNodes.map((node) => {
        const index = rowIndexById.get(node.id) ?? 0;
        // Keep the source in the visible starting area even when the outbound
        // column contains hundreds of rows. The graph remains vertically
        // pannable, but the initial viewport should never center on empty space.
        const y = node.kind === "device" ? 70 : 70 + index * 102;
        return { ...node, x: columnX[node.kind], y };
    });

    return { nodes: positioned, edges: [...graphEdges.values()], paths: graphPaths, width: 1710, height };
}

function nodePalette(kind: TopologyKind) {
    switch (kind) {
        case "device": return { fill: "#f3edff", stroke: "#cbb8ff", accent: "#7659dc" };
        case "application": return { fill: "#fff7e9", stroke: "#f0d7a5", accent: "#d78a18" };
        case "inbound": return { fill: "#eafaf3", stroke: "#a7dfc5", accent: "#1ca570" };
        case "route": return { fill: "#edf4ff", stroke: "#9bbcff", accent: "#2e73e8" };
        case "outbound": return { fill: "#eef5ff", stroke: "#9ebef5", accent: "#2367d5" };
    }
}

const TopologyNodeCard: FC<{ node: TopologyNode; selected: boolean; related: boolean; dimmed: boolean; onSelect: () => void }> = ({ node, selected, related, dimmed, onSelect }) => {
    const palette = nodePalette(node.kind);
    const labelLength = node.count > 1 ? 23 : 29;
    const metaLength = node.count > 1 ? 31 : 34;
    return (
        <g data-topology-node="true" className={clsx("friendly-topology-node", related && "is-related", dimmed && "is-dimmed")} onPointerDown={(event) => { event.stopPropagation(); onSelect(); }} role="button" tabIndex={0} aria-label={`${node.label}, ${node.meta}`} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(); }}>
            <title>{`${node.label} · ${node.meta}`}</title>
            <rect x={node.x} y={node.y} width={nodeWidth} height={nodeHeight} rx="14" fill={palette.fill} stroke={selected ? "#2367d5" : palette.stroke} strokeWidth={selected ? "3" : "1.5"} />
            <circle cx={node.x + 22} cy={node.y + 25} r="8" fill={palette.accent} opacity="0.95" />
            <text x={node.x + 42} y={node.y + 27} fill="#18243b" fontSize="14" fontWeight="700">{shorten(node.label, labelLength)}</text>
            <text x={node.x + 42} y={node.y + 49} fill="#6f7f98" fontSize="11">{shorten(node.meta, metaLength)}</text>
            {node.count > 1 && <text x={node.x + nodeWidth - 14} y={node.y + 21} textAnchor="end" fill={palette.accent} fontSize="10" fontWeight="700">×{node.count}</text>}
        </g>
    );
};

const NetworkTopology: FC<{
    connections: Connection[];
    dataSource: "Live API data" | "Preview data";
    isConnected: boolean;
    onManage: () => void;
    expanded: boolean;
    onToggleExpanded: () => void;
}> = ({ connections, dataSource, isConnected, onManage, expanded, onToggleExpanded }) => {
    const graph = useMemo(() => buildTopology(connections), [connections]);
    const [viewport, setViewport] = useState({ x: 24, y: 24, scale: 0.9 });
    const [drag, setDrag] = useState<{ x: number; y: number; startX: number; startY: number }>();
    const [selectedNodeId, setSelectedNodeId] = useState("");
    const canvasRef = useRef<SVGSVGElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 500 });
    const selectedNode = graph.nodes.find((node) => node.id === selectedNodeId);
    const nodeMap = useMemo(() => new globalThis.Map(graph.nodes.map((node) => [node.id, node])), [graph.nodes]);
    const selectedPaths = useMemo(() => {
        if (!selectedNode) return null;
        const paths = graph.paths.filter((path) => path.nodeIds.includes(selectedNode.id));
        return {
            nodeIds: new Set(paths.flatMap((path) => path.nodeIds)),
            edgeIds: new Set(paths.flatMap((path) => path.edgeIds)),
            count: paths.length,
        };
    }, [graph.paths, selectedNode]);

    useEffect(() => {
        const svg = canvasRef.current;
        if (!svg) return;
        const updateSize = () => setCanvasSize({ width: Math.max(svg.clientWidth, 1), height: Math.max(svg.clientHeight, 1) });
        updateSize();
        const observer = new ResizeObserver(updateSize);
        observer.observe(svg);
        return () => observer.disconnect();
    }, [expanded, connections.length]);

    useEffect(() => {
        if (!expanded) return;
        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") onToggleExpanded();
        };
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", closeOnEscape);
        };
    }, [expanded, onToggleExpanded]);

    const zoomAtPoint = (delta: number, clientX?: number, clientY?: number) => {
        const svg = canvasRef.current;
        const rect = svg?.getBoundingClientRect();
        const anchorX = rect && clientX !== undefined ? clientX - rect.left : canvasSize.width / 2;
        const anchorY = rect && clientY !== undefined ? clientY - rect.top : canvasSize.height / 2;
        setViewport((current) => {
            const nextScale = Math.min(2.4, Math.max(0.45, current.scale + delta));
            const worldX = (anchorX - current.x) / current.scale;
            const worldY = (anchorY - current.y) / current.scale;
            return { scale: nextScale, x: anchorX - worldX * nextScale, y: anchorY - worldY * nextScale };
        });
    };
    const resetViewport = () => setViewport({ x: 24, y: 24, scale: 0.9 });
    const handlePointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
        if ((event.target as Element).closest("[data-topology-node=\"true\"]")) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDrag({ x: event.clientX, y: event.clientY, startX: viewport.x, startY: viewport.y });
    };
    const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
        if (!drag) return;
        setViewport((current) => ({ ...current, x: drag.startX + (event.clientX - drag.x) / current.scale, y: drag.startY + (event.clientY - drag.y) / current.scale }));
    };
    const handlePointerUp = () => setDrag(undefined);
    const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
        // macOS trackpad pinch is exposed as a ctrl+wheel gesture. Normal
        // scrolling must remain scrolling and must never zoom this canvas.
        if (!event.ctrlKey) return;
        event.preventDefault();
        const delta = Math.max(-0.16, Math.min(0.16, -event.deltaY * 0.0025));
        zoomAtPoint(delta, event.clientX, event.clientY);
    };

    const content = (
        <section id="network-map" className={clsx("friendly-surface friendly-network-map", expanded && "is-expanded")} role={expanded ? "dialog" : undefined} aria-modal={expanded || undefined} aria-label={expanded ? "Full screen network topology" : undefined}>
            {!expanded && <div className="friendly-section-heading">
                <div>
                    <div className="friendly-kicker"><MapIcon size={14} /> Network topology <span className="friendly-data-source">{dataSource}</span></div>
                    <p>{connections.length > 0 ? `${connections.length} live connections · ${graph.nodes.length} nodes · ${graph.edges.length} links` : "A live topology appears here when the controller has active connections."}</p>
                </div>
                <button type="button" className="friendly-text-button" onClick={onToggleExpanded}>Open full map <Maximize2 size={15} /></button>
            </div>}

            <div className={clsx("friendly-topology-canvas", expanded && "is-expanded")}>
                <div className="friendly-topology-toolbar">
                    <span><span className="friendly-topology-live-dot" /> Live topology</span>
                    <button type="button" aria-label="Zoom out" onClick={() => zoomAtPoint(-0.08)}><Minus size={15} /></button>
                    <button type="button" aria-label="Zoom in" onClick={() => zoomAtPoint(0.08)}><Plus size={15} /></button>
                    <button type="button" aria-label="Reset view" onClick={resetViewport}><RotateCcw size={14} /></button>
                    {expanded && <button type="button" aria-label="Exit full map" onClick={onToggleExpanded}><Minimize2 size={14} /></button>}
                </div>
                <div className="friendly-topology-hint"><ArrowLeft size={13} /> drag to pan <span>·</span> pinch to zoom</div>
                {connections.length > 0 ? (
                    <svg
                        ref={canvasRef}
                        className={clsx("friendly-topology-svg", drag && "is-dragging")}
                        viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
                        preserveAspectRatio="none"
                        role="img"
                        aria-label="Live network topology"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        onWheel={handleWheel}
                    >
                        <defs>
                            <marker id="friendly-topology-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth">
                                <path d="M0,0 L8,4 L0,8 z" fill="#9aa8bd" />
                            </marker>
                        </defs>
                        <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}>
                            {columnLabels.map((column) => <text key={column.kind} x={columnX[column.kind]} y="28" fill="#8090a8" fontSize="11" fontWeight="700">{column.label}</text>)}
                            {graph.edges.map((edge) => {
                                const from = nodeMap.get(edge.from);
                                const to = nodeMap.get(edge.to);
                                if (!from || !to) return null;
                                const x1 = from.x + nodeWidth;
                                const y1 = from.y + nodeHeight / 2;
                                const x2 = to.x;
                                const y2 = to.y + nodeHeight / 2;
                                const bend = Math.max(36, (x2 - x1) * 0.42);
                                return (
                                    <g key={edge.id} className={clsx("friendly-topology-edge", selectedPaths && (selectedPaths.edgeIds.has(edge.id) ? "is-highlighted" : "is-dimmed"))}>
                                        <path d={`M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`} fill="none" stroke="#b6c1d0" strokeWidth="2" markerEnd="url(#friendly-topology-arrow)" />
                                        {edge.count > 1 && <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 5} fill="#7c8aa1" fontSize="10" fontWeight="700">×{edge.count}</text>}
                                    </g>
                                );
                            })}
                            {graph.nodes.map((node) => <TopologyNodeCard key={node.id} node={node} selected={selectedNodeId === node.id} related={Boolean(selectedPaths?.nodeIds.has(node.id))} dimmed={Boolean(selectedPaths && !selectedPaths.nodeIds.has(node.id))} onSelect={() => setSelectedNodeId(node.id)} />)}
                        </g>
                    </svg>
                ) : (
                    <div className="friendly-topology-empty"><MapIcon size={28} /><strong>No active topology yet</strong><span>When connections start, every application, inbound, route, and outbound will appear here.</span></div>
                )}
            </div>

            {!expanded && <div className="friendly-topology-footer">
                <div className="friendly-topology-legend"><span><i className="friendly-topology-legend-dot is-application" /> application</span><span><i className="friendly-topology-legend-dot is-inbound" /> inbound</span><span><i className="friendly-topology-legend-dot is-route" /> route/tag</span><span><i className="friendly-topology-legend-dot is-outbound" /> outbound</span></div>
                <div className="friendly-topology-selection">{selectedNode ? <><strong>{selectedNode.label}</strong><span>{selectedPaths?.count ?? 0} related live path{selectedPaths?.count === 1 ? "" : "s"}</span></> : <><ShieldCheck size={15} /><span>All paths are shown together; click a node to highlight its full path.</span></>}</div>
            </div>}

            {!expanded && <div className="friendly-map-detail"><div><strong>{graph.nodes.length} nodes across {graph.edges.length} links</strong><p>Drag the canvas to inspect the complete live topology. Outbound is resolved from each live connection.</p></div><button type="button" className="friendly-text-button" onClick={onManage}>Manage <ArrowRight size={15} /></button></div>}
            {!expanded && <div className="friendly-map-note"><ShieldCheck size={17} /><span>{isConnected ? "Every live path is rendered in the topology. The map is a logical route view, not a packet-level trace." : "This map waits for live connections so it does not invent a route or outbound node."}</span></div>}
        </section>
    );

    return expanded && typeof document !== "undefined" ? createPortal(content, document.body) : content;
};

export default NetworkTopology;
