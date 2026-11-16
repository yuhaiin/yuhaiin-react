import { useTheme } from "@/common/ThemeProvider";
import { chartPalette } from "@/docs/home/chart-palette";
import { formatBytes, formatTrafficTicks } from "@/docs/home/format";
import {
  BarElement, CategoryScale, Chart as ChartJS, Filler, LinearScale, LineElement, PointElement, Tooltip,
  type ChartOptions, type TooltipItem,
} from "chart.js";
import { useMemo, type ReactNode } from "react";
import { Bar, Line } from "react-chartjs-2";
import { useTranslation } from "react-i18next";
import { formatCount, formatMs, latencyBucketLabel, type HistoryPoint, type LatencyBucket } from "./model";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler);

/** Resolves theme tokens once per light/dark switch; canvas cannot read CSS variables. */
function usePalette() {
  const { resolved } = useTheme();
  return useMemo(() => {
    const base = chartPalette();
    const style = getComputedStyle(document.documentElement);
    const read = (token: string) => style.getPropertyValue(token).trim();
    return {
      ...base,
      forwarded: read("--chart-download"),
      blocked: read("--chart-upload"),
      error: read("--color-danger"),
      latency: read("--chart-download"),
    };
    // CSS variables change with the resolved mode, even though the reader has no arguments.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved]);
}

type Palette = ReturnType<typeof usePalette>;

function tooltip(palette: Palette) {
  return {
    backgroundColor: palette.tooltipBg,
    borderColor: palette.tooltipBorder,
    borderWidth: 1,
    titleColor: palette.axis,
    bodyColor: palette.tooltipText,
    usePointStyle: true,
    boxWidth: 8,
    boxHeight: 8,
    boxPadding: 4,
    padding: 10,
    cornerRadius: 8,
    titleFont: { size: 12, weight: 400 as const },
    bodyFont: { size: 12, weight: 500 as const },
  };
}

function timeLabels(points: HistoryPoint[], locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  return points.map((point) => formatter.format(new Date(point.end)));
}

function baseLineOptions(palette: Palette, tick: (value: number) => string, label: (item: TooltipItem<"line">) => string): ChartOptions<"line"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltip(palette),
        callbacks: {
          labelColor: (context) => {
            const color = context.dataset.borderColor as string;
            return { borderColor: color, backgroundColor: color };
          },
          label,
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: palette.axis, callback: (value) => tick(Number(value)), maxTicksLimit: 5 }, grid: { color: palette.grid }, border: { display: false } },
      x: { grid: { display: false }, ticks: { color: palette.axis, maxRotation: 0, autoSkipPadding: 24 } },
    },
  };
}

function line(label: string, data: (number | null)[], color: string, fill = false) {
  return {
    label, data, borderColor: color,
    backgroundColor: fill ? `color-mix(in srgb, ${color} 10%, transparent)` : color,
    borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, pointHitRadius: 8, tension: 0.25, fill, spanGaps: false,
  };
}

export function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ui-secondary" aria-hidden="true">
    {items.map((item) => <li key={item.label} className="flex items-center gap-1.5">
      <span className="inline-block h-0.5 w-3 rounded-full" style={{ background: item.color }} />{item.label}
    </li>)}
  </ul>;
}

export function ChartFrame({ title, legend, children, empty, height = 220, summary }: {
  title: string; legend?: ReactNode; children: ReactNode; empty?: string; height?: number; summary?: ReactNode;
}) {
  return <section className="min-w-0 rounded-ui-sm border border-ui-border bg-ui-surface p-4">
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="text-sm font-medium text-ui-heading">{title}</h3>
      {summary && <div className="text-xs text-ui-secondary">{summary}</div>}
    </div>
    {legend && <div className="mb-2">{legend}</div>}
    <div className="relative" style={{ height }}>
      {empty
        ? <p className="flex h-full items-center justify-center text-sm text-ui-muted">{empty}</p>
        : children}
    </div>
  </section>;
}

export function RequestsChart({ points }: { points: HistoryPoint[] }) {
  const { t, i18n } = useTranslation("gateway");
  const palette = usePalette();
  const data = useMemo(() => ({
    labels: timeLabels(points, i18n.language),
    datasets: [
      line(t("forwarded"), points.map((p) => p.forwarded), palette.forwarded, true),
      line(t("blocked"), points.map((p) => p.blocked), palette.blocked, true),
      line(t("errors"), points.map((p) => p.errors), palette.error),
    ],
  }), [points, palette, t, i18n.language]);
  const options = useMemo(() => baseLineOptions(palette,
    (value) => formatCount(value, i18n.language),
    (item) => `${item.dataset.label}: ${formatCount(Number(item.parsed.y), i18n.language)}`,
  ), [palette, i18n.language]);
  const empty = points.every((p) => p.requests === 0) ? t("statsNoRecentRequests") : undefined;
  return <ChartFrame title={t("statsRequestsPerMinute")} empty={empty}
    legend={<Legend items={[
      { label: t("forwarded"), color: palette.forwarded },
      { label: t("blocked"), color: palette.blocked },
      { label: t("errors"), color: palette.error },
    ]} />}>
    <Line data={data} options={options} aria-label={t("statsRequestsPerMinute")} role="img" />
  </ChartFrame>;
}

export function LatencyChart({ points }: { points: HistoryPoint[] }) {
  const { t, i18n } = useTranslation("gateway");
  const palette = usePalette();
  const data = useMemo(() => ({
    labels: timeLabels(points, i18n.language),
    datasets: [line(t("averageDuration"), points.map((p) => p.latencyMs), palette.latency, true)],
  }), [points, palette, t, i18n.language]);
  const options = useMemo(() => baseLineOptions(palette,
    (value) => formatMs(value),
    (item) => `${item.dataset.label}: ${formatMs(Number(item.parsed.y))}`,
  ), [palette]);
  const empty = points.every((p) => p.latencyMs === null) ? t("statsNoRecentRequests") : undefined;
  return <ChartFrame title={t("statsLatencyPerMinute")} empty={empty}>
    <Line data={data} options={options} aria-label={t("statsLatencyPerMinute")} role="img" />
  </ChartFrame>;
}

export function TrafficChart({ points }: { points: HistoryPoint[] }) {
  const { t, i18n } = useTranslation("gateway");
  const palette = usePalette();
  const data = useMemo(() => ({
    labels: timeLabels(points, i18n.language),
    datasets: [
      line(t("statsBytesOut"), points.map((p) => p.bytesOut), palette.downloadStroke, true),
      line(t("statsBytesIn"), points.map((p) => p.bytesIn), palette.uploadStroke, true),
    ],
  }), [points, palette, t, i18n.language]);
  const options = useMemo(() => {
    const result = baseLineOptions(palette,
      () => "",
      (item) => `${item.dataset.label}: ${formatBytes(Number(item.parsed.y), 1, " ")}`,
    );
    const y = result.scales!.y!;
    y.ticks = { ...y.ticks, callback: (_value, index, ticks) => formatTrafficTicks(ticks.map((tick) => Number(tick.value)))[index] };
    return result;
  }, [palette]);
  const empty = points.every((p) => p.bytesIn === 0 && p.bytesOut === 0) ? t("statsNoRecentRequests") : undefined;
  return <ChartFrame title={t("statsTrafficPerMinute")} empty={empty}
    legend={<Legend items={[
      { label: t("statsBytesOut"), color: palette.downloadStroke },
      { label: t("statsBytesIn"), color: palette.uploadStroke },
    ]} />}>
    <Line data={data} options={options} aria-label={t("statsTrafficPerMinute")} role="img" />
  </ChartFrame>;
}

export function LatencyHistogram({ buckets, summary }: { buckets: LatencyBucket[]; summary?: ReactNode }) {
  const { t, i18n } = useTranslation("gateway");
  const palette = usePalette();
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  const data = useMemo(() => ({
    labels: buckets.map((bucket, index) => latencyBucketLabel(bucket, buckets[index - 1])),
    datasets: [{
      label: t("requests"), data: buckets.map((b) => b.count),
      backgroundColor: palette.latency, borderRadius: 4, borderSkipped: "start" as const,
      maxBarThickness: 28, categoryPercentage: 0.9, barPercentage: 0.9,
    }],
  }), [buckets, palette, t]);
  const options = useMemo<ChartOptions<"bar">>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltip(palette),
        callbacks: {
          label: (item) => {
            const count = Number(item.parsed.y);
            return `${formatCount(count, i18n.language)} (${total ? ((count / total) * 100).toFixed(1) : 0}%)`;
          },
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: palette.axis, maxTicksLimit: 5, callback: (value) => formatCount(Number(value), i18n.language) }, grid: { color: palette.grid }, border: { display: false } },
      x: { grid: { display: false }, ticks: { color: palette.axis, maxRotation: 0, autoSkip: true, autoSkipPadding: 8, font: { size: 11 } } },
    },
  }), [palette, i18n.language, total]);
  return <ChartFrame title={t("statsLatencyDistribution")} summary={summary} empty={total ? undefined : t("statsNoRequests")}>
    <Bar data={data} options={options} aria-label={t("statsLatencyDistribution")} role="img" />
  </ChartFrame>;
}

/** Ranked HTML bars: readable, selectable text and no canvas for short lists. */
export function BarList({ title, items, empty, valueHeader, summary }: {
  title: string;
  items: { key: string; label: ReactNode; value: number; detail?: ReactNode; tone?: "blocked" | "forwarded" | "error" | "neutral" }[];
  empty: string;
  valueHeader?: string;
  summary?: ReactNode;
}) {
  const { i18n } = useTranslation();
  const max = Math.max(0, ...items.map((item) => item.value));
  const tone = {
    blocked: "var(--chart-upload)",
    forwarded: "var(--chart-download)",
    error: "var(--color-danger)",
    neutral: "var(--border-strong)",
  };
  return <section className="min-w-0 rounded-ui-sm border border-ui-border bg-ui-surface p-4">
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="text-sm font-medium text-ui-heading">{title}</h3>
      {(summary || valueHeader) && <div className="text-xs text-ui-secondary">{summary ?? valueHeader}</div>}
    </div>
    {items.length === 0
      ? <p className="py-6 text-center text-sm text-ui-muted">{empty}</p>
      : <ul className="space-y-2.5">
        {items.map((item) => <li key={item.key} className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-ui-fg" title={typeof item.label === "string" ? item.label : undefined}>{item.label}</span>
            <span className="shrink-0 tabular-nums text-ui-fg">
              {formatCount(item.value, i18n.language)}
              {item.detail && <span className="ml-2 text-xs text-ui-secondary">{item.detail}</span>}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-ui-surface-muted">
            <div className="h-full rounded-full" style={{ width: `${max ? Math.max(1, (item.value / max) * 100) : 0}%`, background: tone[item.tone ?? "neutral"] }} />
          </div>
        </li>)}
      </ul>}
  </section>;
}
