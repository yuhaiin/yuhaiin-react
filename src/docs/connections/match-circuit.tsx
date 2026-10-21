import { clsx } from "clsx";
import { ChevronDown, ChevronRight, Maximize2, Minus, Plus } from "lucide-react";
import { useId, useMemo, useRef, useState, type FC, type PointerEvent } from "react";
import { useTranslation } from "react-i18next";
import { buildCircuitLayout, initialCollapsed, traceState, type MatchTrace, type TraceState } from "./match-circuit-layout";

const colors: Record<TraceState, string> = {
    hit: "#788f69",
    miss: "#a6b0a6",
    skipped: "#b6a788",
    unknown: "#c18f50",
};

const textForState = (state: TraceState, t: (key: string, options?: { defaultValue: string }) => string) => {
    const labels = {
        hit: t("circuit.hit", { defaultValue: "True" }),
        miss: t("circuit.miss", { defaultValue: "False" }),
        skipped: t("circuit.skipped", { defaultValue: "Not evaluated" }),
        unknown: t("circuit.unknown", { defaultValue: "Unknown" }),
    };
    return labels[state];
};

function EllipsisLabel({ text, limit = 25 }: { text: string; limit?: number }) {
    return <title>{text.length > limit ? text : undefined}</title>;
}

export const MatchCircuit: FC<{ trace: MatchTrace }> = ({ trace }) => {
    const { t } = useTranslation("connections");
    const [collapsed, setCollapsed] = useState(() => initialCollapsed(trace));
    const [selected, setSelected] = useState("0");
    const [scale, setScale] = useState(1);
    const scrollRef = useRef<HTMLDivElement>(null);
    const gridId = useId();
    const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
    const layout = useMemo(() => buildCircuitLayout(trace, collapsed), [trace, collapsed]);
    const inspected = layout.nodes.find(node => node.key === selected) ?? layout.nodes[0];
    const stateLabel = (state: string) => textForState(traceState(state), t);

    const setFit = () => {
        const viewport = scrollRef.current;
        if (!viewport) return;
        setScale(Math.max(0.3, Math.min(1, (viewport.clientWidth - 28) / layout.width)));
        viewport.scrollTo({ left: 0, top: 0 });
    };
    const toggle = (key: string) => setCollapsed(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
    });
    const nodeStatus = (state: string) => {
        const s = traceState(state);
        return s === "hit" ? "✓" : s === "miss" ? "×" : s === "skipped" ? "–" : "?";
    };
    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0 || (event.target as Element).closest("[data-circuit-node]")) return;
        const target = event.currentTarget;
        dragRef.current = { x: event.clientX, y: event.clientY, left: target.scrollLeft, top: target.scrollTop };
        target.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        const drag = dragRef.current;
        if (!drag) return;
        const viewport = event.currentTarget;
        viewport.scrollLeft = drag.left + drag.x - event.clientX;
        viewport.scrollTop = drag.top + drag.y - event.clientY;
    };
    return (
        <div className="min-w-0 overflow-hidden rounded-ui-lg border border-ui-border bg-ui-surface">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ui-border px-3 py-2">
                <span className="text-xs font-semibold text-ui-heading">{t("circuit.title", { defaultValue: "Logic circuit" })}</span>
                <div className="flex flex-wrap gap-1">
                    <button type="button" className="rounded-ui-sm border border-ui-border px-2 py-1 text-xs text-ui-muted hover:bg-ui-surface-muted" onClick={() => setCollapsed(new Set())}>
                        {t("circuit.expand", { defaultValue: "Expand all" })}
                    </button>
                    <button type="button" className="rounded-ui-sm border border-ui-border px-2 py-1 text-xs text-ui-muted hover:bg-ui-surface-muted" onClick={() => setCollapsed(new Set((trace.children ?? []).map((_, i) => "0." + i)))}>
                        {t("circuit.collapse", { defaultValue: "Collapse groups" })}
                    </button>
                    <button type="button" className="rounded-ui-sm border border-ui-border p-1.5 text-ui-muted hover:bg-ui-surface-muted" onClick={() => setScale(value => Math.max(.3, value - .15))} aria-label={t("circuit.zoomOut", { defaultValue: "Zoom out" })}><Minus size={14}/></button>
                    <button type="button" className="rounded-ui-sm border border-ui-border p-1.5 text-ui-muted hover:bg-ui-surface-muted" onClick={() => setScale(value => Math.min(2, value + .15))} aria-label={t("circuit.zoomIn", { defaultValue: "Zoom in" })}><Plus size={14}/></button>
                    <button type="button" className="rounded-ui-sm border border-ui-border p-1.5 text-ui-muted hover:bg-ui-surface-muted" onClick={setFit} aria-label={t("circuit.fit", { defaultValue: "Fit to width" })}><Maximize2 size={14}/></button>
                </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 py-2 text-[11px] text-ui-muted">
                {(["hit", "miss", "skipped", "unknown"] as const).map(s => (
                    <span key={s} className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[s] }} />{textForState(s, t)}</span>
                ))}
                <span className="ml-auto">{t("circuit.hint", { defaultValue: "AND: series · OR: parallel · NOT: inversion" })}</span>
            </div>
            <div
                ref={scrollRef}
                className="max-h-[520px] min-h-[220px] cursor-grab overflow-auto bg-ui-surface-muted/40 active:cursor-grabbing"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={() => { dragRef.current = null; }}
                onPointerCancel={() => { dragRef.current = null; }}
            >
                <svg role="group" aria-label={t("circuit.title", { defaultValue: "Logic circuit" })} viewBox={`0 0 ${layout.width} ${layout.height}`} width={layout.width * scale} height={layout.height * scale} className="block max-w-none" style={{ minWidth: layout.width * scale }}>
                    <defs>
                        <pattern id={gridId} width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="currentColor" opacity=".11"/></pattern>
                    </defs>
                    <rect width={layout.width} height={layout.height} fill={`url(#${gridId})`} className="text-ui-muted"/>
                    {layout.nodes.filter(node => node.trace.children?.length && !node.collapsed).map(node => {
                        const status = traceState(node.trace.state);
                        return <rect key={node.key} x={node.x} y={node.y} width={node.width} height={node.height} rx={10} fill="var(--color-ui-surface, #fff)" stroke={colors[status]} strokeWidth="1.1" opacity=".9"/>;
                    })}
                    {layout.wires.map(wire => <path key={wire.key} d={wire.d} fill="none" stroke={colors[wire.state]} strokeWidth={wire.state === "hit" ? 2.8 : 1.8} strokeDasharray={wire.state === "skipped" ? "5 4" : undefined} strokeLinecap="round" strokeLinejoin="round"/>)}
                    {layout.nodes.map(node => {
                        const { trace: value, key, collapsed: isCollapsed } = node;
                        const state = traceState(value.state);
                        const isOpenGroup = (value.children?.length ?? 0) > 0 && !isCollapsed;
                        return <g key={key} data-circuit-node="true" role="button" tabIndex={0}
                            onClick={() => setSelected(key)}
                            onDoubleClick={() => { if (value.children?.length) toggle(key); }}
                            onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelected(key); if (value.children?.length) toggle(key); } }}
                            aria-label={`${value.label || value.type}, ${stateLabel(value.state)}`}
                            className={clsx("cursor-pointer outline-none", selected === key && "drop-shadow-sm")}>
                            {isOpenGroup
                                ? <>
                                    <rect x={node.x + 1} y={node.y + 1} width={node.width - 2} height={42} rx={9} fill={colors[state]} fillOpacity=".1"/>
                                    <path d={`M ${node.x+1} ${node.y+44} H ${node.x+node.width-1}`} stroke={colors[state]} strokeOpacity=".3"/>
                                    <text x={node.x + 13} y={node.y + 27} fontSize={12} fill="currentColor" fontWeight="600">{(value.label || value.type).slice(0, 34)}</text>
                                    <text x={node.x + node.width - 98} y={node.y + 27} fontSize={11} fill={colors[state]} textAnchor="end">{stateLabel(value.state)}</text>
                                </>
                                : <>
                                    <rect x={node.x} y={node.y} width={node.width} height={node.height} rx={8} fill="var(--color-ui-surface, #fff)" stroke={colors[state]} strokeWidth={selected === key ? 2.4 : 1.3}/>
                                    <text x={node.x + 12} y={node.y + 23} fontSize={12} fill="currentColor" fontWeight="600">{(value.label || value.type).slice(0, isCollapsed ? 25 : 22)}</text>
                                    <text x={node.x + 12} y={node.y + 46} fontSize={11} fill={colors[state]}>{nodeStatus(value.state)} {stateLabel(value.state)}</text>
                                </>}
                            <EllipsisLabel text={value.label || value.type}/>
                            {(isOpenGroup || isCollapsed) && <g onClick={event => { event.stopPropagation(); toggle(key); setSelected(key); }} className="cursor-pointer">
                                <rect x={node.x + node.width - 82} y={node.y + 8} rx={6} width={69} height={25} fill={colors[state]} fillOpacity=".12"/>
                                <text x={node.x + node.width - 48} y={node.y + 25} textAnchor="middle" fontWeight="700" fontSize={11} fill={colors[state]}>{value.type.toUpperCase()}</text>
                                {isCollapsed ? <ChevronRight x={node.x + node.width - 23} y={node.y + 12} size={15} color={colors[state]}/> : <ChevronDown x={node.x + node.width - 23} y={node.y + 12} size={15} color={colors[state]}/>}
                            </g>}
                            {value.type === "not" && isOpenGroup && <circle cx={node.x + node.width / 2} cy={node.y + node.height - 14} r={8} fill="var(--color-ui-surface, #fff)" stroke={colors[state]} strokeWidth={2}/>}
                        </g>;
                    })}
                </svg>
            </div>
            {inspected && <div className="grid gap-1.5 border-t border-ui-border px-3 py-2 text-xs text-ui-muted sm:grid-cols-[1fr_auto]">
                <div className="min-w-0 break-all"><span className="font-semibold text-ui-heading">{inspected.trace.label || inspected.trace.type}</span>
                    {inspected.trace.kind && <span> · {inspected.trace.kind}</span>}
                    {inspected.trace.id && <span> · {inspected.trace.id}</span>}
                </div>
                <span className="font-medium" style={{ color: colors[traceState(inspected.trace.state)] }}>{stateLabel(inspected.trace.state)}</span>
            </div>}
        </div>
    );
};
