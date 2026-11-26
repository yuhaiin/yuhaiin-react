import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../styles";
import { formatCount } from "./format";

// Kept apart from the canvas charts so pages that only list values (such as
// the home page) do not pull in chart.js.

export type BarTone = "blocked" | "forwarded" | "error" | "neutral";

export interface BarItem {
  key: string;
  label: ReactNode;
  value: number;
  detail?: ReactNode;
  tone?: BarTone;
  /** Tooltip for the label; defaults to the label when it is a string. */
  title?: string;
  href?: string;
}

/** Ranked HTML bars: readable, selectable text and no canvas for short lists. */
export function BarList({ title, items, empty, valueHeader, summary, formatValue, actions, className, listClassName }: {
  title: string;
  items: BarItem[];
  empty: string;
  valueHeader?: string;
  summary?: ReactNode;
  formatValue?: (value: number) => ReactNode;
  actions?: ReactNode;
  className?: string;
  /** Classes for the item list, e.g. to let it scroll inside a bounded panel. */
  listClassName?: string;
}) {
  const { i18n } = useTranslation();
  const max = Math.max(0, ...items.map((item) => item.value));
  const tone = {
    blocked: "var(--chart-upload)",
    forwarded: "var(--chart-download)",
    error: "var(--color-danger)",
    neutral: "var(--border-strong)",
  };
  const format = formatValue ?? ((value: number) => formatCount(value, i18n.language));
  return <section className={cn("min-w-0 rounded-ui-sm border border-ui-border bg-ui-surface p-4", className)}>
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="text-sm font-medium text-ui-heading">{title}</h3>
      {(summary || valueHeader) && <div className="text-xs text-ui-secondary">{summary ?? valueHeader}</div>}
    </div>
    {actions && <div className="mb-3">{actions}</div>}
    {items.length === 0
      ? <p className="py-6 text-center text-sm text-ui-muted">{empty}</p>
      : <ul className={cn("space-y-2.5", listClassName)}>
        {items.map((item) => {
          const label = <span className="min-w-0 truncate text-ui-fg" title={item.title ?? (typeof item.label === "string" ? item.label : undefined)}>{item.label}</span>;
          return <li key={item.key} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              {item.href ? <a href={item.href} className="min-w-0 truncate hover:underline">{label}</a> : label}
              <span className="shrink-0 tabular-nums text-ui-fg">
                {format(item.value)}
                {item.detail && <span className="ml-2 text-xs text-ui-secondary">{item.detail}</span>}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-ui-surface-muted">
              <div className="h-full rounded-full" style={{ width: `${max ? Math.max(1, (item.value / max) * 100) : 0}%`, background: tone[item.tone ?? "neutral"] }} />
            </div>
          </li>;
        })}
      </ul>}
  </section>;
}

export function StatTile({ label, value, detail, tone }: { label: string; value: ReactNode; detail?: ReactNode; tone?: "danger" }) {
  return <div className="min-w-0 rounded-ui-sm border border-ui-border bg-ui-surface p-4">
    <dt className="text-xs text-ui-secondary">{label}</dt>
    <dd className={`mt-1 truncate text-2xl font-semibold tabular-nums ${tone === "danger" ? "text-ui-danger" : "text-ui-heading"}`}>{value}</dd>
    {detail && <dd className="mt-0.5 truncate text-xs text-ui-secondary">{detail}</dd>}
  </div>;
}
