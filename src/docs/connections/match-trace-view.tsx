import { clsx } from "clsx";
import { CheckCircle2, ChevronDown, ChevronRight, CircleHelp, CircleMinus, MinusCircle } from "lucide-react";
import { useState, type FC } from "react";
import { useTranslation } from "react-i18next";
import {
    decisiveTraceNodes, defaultTraceExpansion, isTraceGroup, traceState,
    type MatchTrace, type TraceState,
} from "./match-trace-tree";

const PAGE_SIZE = 48;
const tones: Record<TraceState, string> = {
    hit: "text-ui-success",
    miss: "text-ui-muted",
    skipped: "text-ui-muted/60",
    unknown: "text-ui-warning",
};

function StateIcon({ state }: { state: TraceState }) {
    if (state === "hit") return <CheckCircle2 size={14} aria-hidden="true" />;
    if (state === "miss") return <MinusCircle size={14} aria-hidden="true" />;
    if (state === "unknown") return <CircleHelp size={14} aria-hidden="true" />;
    return <CircleMinus size={14} aria-hidden="true" />;
}

type BranchProps = {
    trace: MatchTrace;
    path: string;
    depth: number;
    expanded: ReadonlySet<string>;
    decisive: ReadonlySet<string>;
    visibleCounts: Readonly<Record<string, number>>;
    detailPath: string | null;
    onToggle: (path: string) => void;
    onMore: (path: string) => void;
    onDetail: (path: string) => void;
    stateLabel: (state: string) => string;
    moreLabel: (count: number) => string;
};

const Branch: FC<BranchProps> = ({
    trace, path, depth, expanded, decisive, visibleCounts, detailPath,
    onToggle, onMore, onDetail, stateLabel, moreLabel,
}) => {
    const { t: authT } = useTranslation('auth');
    const state = traceState(trace.state);
    const group = isTraceGroup(trace);
    const open = group && expanded.has(path);
    const relevant = decisive.has(path);
    const children = trace.children ?? [];
    const limit = visibleCounts[path] ?? PAGE_SIZE;
    const remaining = Math.max(0, children.length - limit);
    const rawLabel = trace.label || trace.kind || trace.type;
    const label = ['user', 'group', 'credential'].includes(rawLabel) ? authT(`identityConditions.${rawLabel}`) : rawLabel === 'Destination' || rawLabel === 'destination' ? authT('access.destination') : rawLabel;
    const groupLabel = trace.type.toUpperCase();
    const hasExtraLabel = group && label.toUpperCase() !== groupLabel;
    const hasDetails = Boolean(trace.kind || trace.id);
    return (
        <div className="min-w-0">
            <button type="button"
                onClick={() => group ? onToggle(path) : onDetail(path)}
                aria-expanded={group ? open : undefined}
                aria-label={`${label}: ${stateLabel(state)}`}
                className={clsx(
                    "flex w-full min-w-0 items-start gap-2 rounded-ui-sm px-2 py-2 text-left text-xs hover:bg-ui-surface-muted",
                    relevant && state !== "skipped" && "bg-ui-success-soft/30",
                    state === "skipped" && "opacity-65",
                )}>
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-ui-muted">
                    {group ? (open ? <ChevronDown size={15} /> : <ChevronRight size={15} />) :
                        <span className={tones[state]}><StateIcon state={state}/></span>}
                </span>
                <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                    {group && <span className={clsx(
                        "inline-flex shrink-0 items-center rounded-ui-xs border px-1.5 py-0.5 font-semibold tracking-wide",
                        trace.type === "not" ? "border-ui-warning/30 text-ui-warning" :
                        "border-ui-border bg-ui-surface-muted text-ui-heading",
                    )}>{groupLabel}</span>}
                    {(!group || hasExtraLabel) && <span className="min-w-0 break-words font-medium text-ui-heading [overflow-wrap:anywhere]">{label}</span>}
                    {group && <span className="text-[10px] text-ui-muted">{children.length}</span>}
                </span>
                <span className={clsx("mt-0.5 inline-flex shrink-0 items-center gap-1 text-[11px] font-medium", tones[state])}>
                    {stateLabel(state)}
                </span>
            </button>
            {!group && hasDetails && detailPath === path &&
                <div className="mx-2 mb-2 ml-8 min-w-0 rounded-ui-sm border border-ui-border bg-ui-surface-muted px-2 py-1.5 text-[11px] text-ui-muted [overflow-wrap:anywhere]">
                    {trace.kind && <div>{trace.kind}</div>}
                    {trace.id && <div className="notranslate">{trace.id}</div>}
                </div>}
            {open && (
                <div className={clsx(
                    "min-w-0 border-l border-ui-border",
                    depth < 5 ? "ml-[15px] pl-3" : "ml-2 pl-2",
                )}>
                    {children.slice(0, limit).map((child, index) =>
                        <Branch key={index} trace={child} path={path + "." + index} depth={depth + 1}
                            expanded={expanded} decisive={decisive} visibleCounts={visibleCounts}
                            detailPath={detailPath} onToggle={onToggle} onMore={onMore} onDetail={onDetail}
                            stateLabel={stateLabel} moreLabel={moreLabel} />
                    )}
                    {remaining > 0 && <button type="button"
                        className="mb-1 ml-1 rounded-ui-sm px-2 py-1.5 text-left text-[11px] text-ui-primary hover:bg-ui-surface-muted"
                        onClick={() => onMore(path)}>{moreLabel(remaining)}</button>}
                </div>
            )}
        </div>
    );
};

function allGroupPaths(trace: MatchTrace): Set<string> {
    const result = new Set<string>();
    const stack = [{ trace, path: "0" }];
    while (stack.length) {
        const next = stack.pop()!;
        if (!isTraceGroup(next.trace)) continue;
        result.add(next.path);
        next.trace.children?.forEach((child, index) => {
            stack.push({ trace: child, path: next.path + "." + index });
        });
    }
    return result;
}

/** Children only: the enclosing match-history row is the *single* rule root. */
export const MatchTraceTree: FC<{ trace: MatchTrace }> = ({ trace }) => {
    const { t } = useTranslation("connections");
    const [expanded, setExpanded] = useState(() => defaultTraceExpansion(trace));
    const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
    const [detailPath, setDetailPath] = useState<string | null>(null);
    const [decisive] = useState(() => decisiveTraceNodes(trace));

    const toggle = (path: string) => setExpanded(current => {
        const next = new Set(current);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        return next;
    });
    const onMore = (path: string) => setVisibleCounts(current => ({
        ...current, [path]: (current[path] ?? PAGE_SIZE) + PAGE_SIZE,
    }));
    const stateLabel = (value: string) => {
        const state = traceState(value);
        const fallback = { hit: "True", miss: "False", skipped: "Not evaluated", unknown: "Unknown" };
        return t("circuit." + state, { defaultValue: fallback[state] });
    };
    return (
        <div className="min-w-0 border-t border-ui-border bg-ui-surface px-2 pb-2">
            {isTraceGroup(trace) && <div className="flex flex-wrap items-center justify-end gap-3 px-1 py-1.5 text-[11px] text-ui-muted">
                <button type="button" className="hover:text-ui-heading" onClick={() => setExpanded(defaultTraceExpansion(trace))}>
                    {t("circuit.focusPath", { defaultValue: "Decisive path" })}
                </button>
                <button type="button" className="hover:text-ui-heading" onClick={() => setExpanded(allGroupPaths(trace))}>
                    {t("circuit.expand", { defaultValue: "Expand all" })}
                </button>
                <button type="button" className="hover:text-ui-heading" onClick={() => setExpanded(new Set())}>
                    {t("circuit.collapse", { defaultValue: "Collapse groups" })}
                </button>
            </div>}
            <div className="ml-[15px] min-w-0 border-l border-ui-border pl-3">
                {(trace.children ?? []).slice(0, expanded.has("0") ? visibleCounts["0"] ?? PAGE_SIZE : 0)
                    .map((child, index) => (
                        <Branch key={index} trace={child} path={"0." + index} depth={0}
                            expanded={expanded} decisive={decisive} visibleCounts={visibleCounts}
                            detailPath={detailPath} onToggle={toggle} onMore={onMore}
                            onDetail={path => setDetailPath(current => current === path ? null : path)}
                            stateLabel={stateLabel}
                            moreLabel={count => t("circuit.more", { count, defaultValue: "Show more (" + count + ")" })}/>
                    ))}
                {expanded.has("0") && (trace.children?.length ?? 0) > (visibleCounts["0"] ?? PAGE_SIZE) &&
                    <button type="button" className="rounded-ui-sm px-2 py-1.5 text-[11px] text-ui-primary hover:bg-ui-surface-muted"
                        onClick={() => onMore("0")}>
                        {t("circuit.more", { count: trace.children!.length - (visibleCounts["0"] ?? PAGE_SIZE), defaultValue: "Show more" })}
                    </button>}
                {!expanded.has("0") && (trace.children?.length ?? 0) > 0 &&
                    <button type="button" className="px-2 py-1.5 text-[11px] text-ui-muted hover:text-ui-heading"
                        onClick={() => toggle("0")}>
                        {t("circuit.showConditions", { defaultValue: "Show conditions" })} ({trace.children!.length})
                    </button>}
            </div>
        </div>
    );
};
