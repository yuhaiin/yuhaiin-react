import { cn } from "@/component/v2/styles";
import { ArrowDown, ArrowLeftRight, ArrowUp } from "lucide-react";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { PlacedNode } from "./layout";
import { NodeIcon } from "./node-icon";
import { formatRate, nodeName, nodeType, statusTone } from "./presentation";
import type { Selection } from "./stage";
import styles from "./topology.module.css";

interface NodeCardProps {
    placed: PlacedNode;
    width: number;
    height: number;
    offsetY?: number;
    compact: boolean;
    selected: boolean;
    dimmed: boolean;
    onSelect: (selection: Selection) => void;
}

/**
 * One aggregated node. Every number on it comes from the model: connection
 * counts from the event stream, rates from counter deltas, DNS counts from
 * history. A node without traffic shows zeros, never a placeholder rate.
 */
export const NodeCard = memo(function NodeCard({ placed, width, height, offsetY = 0, compact, selected, dimmed, onSelect }: NodeCardProps) {
    const { t } = useTranslation(["topology"]);
    const { node, ghost } = placed;
    const name = nodeName(node, t);
    const type = nodeType(node, t);
    const tone = statusTone(ghost ? "closed" : node.status);
    const status = t(`status.${ghost ? "closed" : node.status}`);
    const dns = node.dns;
    const label = [name, type, status, dns
        ? t("card.dnsSummary", { count: dns.queries, failures: dns.failures })
        : t("card.summary", { count: node.connections, up: formatRate(node.up), down: formatRate(node.down) }), node.refId ? `ID ${node.refId}` : ""].filter(Boolean).join(", ");

    return (
        <button
            type="button"
            className={cn(styles.card, compact && styles.cardCompact, selected && styles.cardSelected, ghost && styles.cardGhost, dimmed && styles.cardDimmed,
                node.status === "active" && !ghost && styles.cardActive, dns && styles.cardAuxiliary)}
            style={{ width, height, transform: `translate(${placed.x}px, ${placed.y + offsetY}px)` }}
            data-node-id={node.id}
            data-status={ghost ? "closed" : node.status}
            aria-pressed={selected}
            aria-label={label}
            title={[name, node.path, type, `ID: ${node.refId || node.id}`].filter(Boolean).join("\n")}
            onClick={event => { event.stopPropagation(); onSelect({ type: "node", id: node.id }); }}
        >
            <span className={cn(styles.icon, styles[`tone-${tone}`])} aria-hidden="true"><NodeIcon node={node} size={compact ? 14 : 16} imageSize={compact ? 20 : 24} /></span>
            <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 text-left">
                <span className="flex min-w-0 items-center gap-1.5">
                    <span className={cn(styles.name, "notranslate min-w-0 truncate")}>{name}</span>
                    <span className={cn(styles.dot, styles[`dot-${tone}`])} aria-hidden="true" />
                </span>
                {!compact && (
                    <span className={cn(styles.meta, "flex min-w-0 items-baseline justify-between gap-2")}>
                        <span className="min-w-0 truncate">{type}</span>
                        <span className="shrink-0 font-mono tabular-nums">{dns ? t("card.queries", { count: dns.queries }) : t("card.connections", { count: node.connections })}</span>
                    </span>
                )}
                {dns ? (
                    <span className={cn(styles.metrics, "truncate")}>
                        {compact && <span>{t("card.queries", { count: dns.queries })}</span>}
                        {dns.failures > 0 ? <span className="text-ui-danger">{t("card.failed", { count: dns.failures })}</span> : !compact && <span className="text-ui-tertiary">{dns.averageMs.toFixed(1)} ms</span>}
                    </span>
                ) : compact ? (
                    <span className={cn(styles.metrics, "truncate")}>
                        <span className="inline-flex items-center gap-0.5 tabular-nums"><ArrowLeftRight size={11} aria-hidden="true" />{node.connections}</span>
                        <span className="text-ui-tertiary" aria-hidden="true">·</span>
                        <span className={cn("truncate tabular-nums", node.up + node.down > 0 ? "text-ui-fg" : "text-ui-tertiary")}>{formatRate(node.up + node.down)}</span>
                    </span>
                ) : (
                    <span className={cn(styles.metrics, "truncate")}>
                        <span className={cn("inline-flex items-center gap-0.5 tabular-nums", node.up > 0 ? styles.up : "text-ui-tertiary")}><ArrowUp size={11} aria-hidden="true" />{formatRate(node.up)}</span>
                        <span className={cn("inline-flex items-center gap-0.5 tabular-nums", node.down > 0 ? styles.down : "text-ui-tertiary")}><ArrowDown size={11} aria-hidden="true" />{formatRate(node.down)}</span>
                    </span>
                )}
            </span>
        </button>
    );
});
