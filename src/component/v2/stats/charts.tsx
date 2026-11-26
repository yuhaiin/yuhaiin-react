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
import { bucketLabel, formatCount, formatMs, type Bucket } from "./format";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Filler);

/** Resolves theme tokens once per light/dark switch; canvas cannot read CSS variables. */
export function useStatsPalette() {
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
      neutral: read("--border-strong"),
    };
    // CSS variables change with the resolved mode, even though the reader has no arguments.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved]);
}

export type StatsPalette = ReturnType<typeof useStatsPalette>;

export function chartTooltip(palette: StatsPalette) {
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

export function timeLabels(points: { end: number }[], locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" });
  return points.map((point) => formatter.format(new Date(point.end)));
}

export function baseLineOptions(palette: StatsPalette, tick: (value: number) => string, label: (item: TooltipItem<"line">) => string): ChartOptions<"line"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...chartTooltip(palette),
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

/** Byte axis with unit-aligned ticks. */
export function byteLineOptions(palette: StatsPalette): ChartOptions<"line"> {
  const result = baseLineOptions(palette,
    () => "",
    (item) => `${item.dataset.label}: ${formatBytes(Number(item.parsed.y), 1, " ")}`,
  );
  const y = result.scales!.y!;
  y.ticks = { ...y.ticks, callback: (_value, index, ticks) => formatTrafficTicks(ticks.map((tick) => Number(tick.value)))[index] };
  return result;
}

export function lineDataset(label: string, data: (number | null)[], color: string, fill = false) {
  return {
    label, data, borderColor: color,
    backgroundColor: fill ? `color-mix(in srgb, ${color} 10%, transparent)` : color,
    borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, pointHitRadius: 8, tension: 0.25, fill, spanGaps: false,
  };
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ui-secondary" aria-hidden="true">
    {items.map((item) => <li key={item.label} className="flex items-center gap-1.5">
      <span className="inline-block h-0.5 w-3 rounded-full" style={{ background: item.color }} />{item.label}
    </li>)}
  </ul>;
}

export function ChartFrame({ title, legend, children, empty, height = 220, summary }: {
  title: string; legend?: ReactNode; children: ReactNode; empty?: string; height?: number; summary?: ReactNode;
}) {
  // The chart fills whatever height its grid row gives the card (at least
  // `height`), so a taller neighbour never leaves an empty band under it.
  return <section className="flex min-w-0 flex-col rounded-ui-sm border border-ui-border bg-ui-surface p-4">
    <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="text-sm font-medium text-ui-heading">{title}</h3>
      {summary && <div className="text-xs text-ui-secondary">{summary}</div>}
    </div>
    {legend && <div className="mb-2">{legend}</div>}
    <div className="relative min-h-0 flex-1" style={{ minHeight: height }}>
      {empty
        ? <p className="flex h-full items-center justify-center text-sm text-ui-muted">{empty}</p>
        : children}
    </div>
  </section>;
}

export function LineChart({ title, points, series, empty, summary, format = "count" }: {
  title: string;
  points: { end: number }[];
  series: { label: string; values: (number | null)[]; color: string; fill?: boolean }[];
  empty?: string;
  summary?: ReactNode;
  format?: "count" | "ms" | "bytes";
}) {
  const { i18n } = useTranslation();
  const palette = useStatsPalette();
  const data = useMemo(() => ({
    labels: timeLabels(points, i18n.language),
    datasets: series.map((s) => lineDataset(s.label, s.values, s.color, s.fill)),
  }), [points, series, i18n.language]);
  const options = useMemo(() => {
    if (format === "bytes") return byteLineOptions(palette);
    const value = format === "ms" ? formatMs : (v: number) => formatCount(v, i18n.language);
    return baseLineOptions(palette, value, (item) => `${item.dataset.label}: ${value(Number(item.parsed.y))}`);
  }, [palette, format, i18n.language]);
  return <ChartFrame title={title} empty={empty} summary={summary}
    legend={series.length > 1 ? <Legend items={series.map((s) => ({ label: s.label, color: s.color }))} /> : undefined}>
    <Line data={data} options={options} aria-label={title} role="img" />
  </ChartFrame>;
}

export function BucketHistogram({ title, buckets, summary, empty, valueLabel, format = formatMs }: {
  title: string; buckets: Bucket[]; summary?: ReactNode; empty: string; valueLabel: string; format?: (value: number) => string;
}) {
  const { i18n } = useTranslation();
  const palette = useStatsPalette();
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  const data = useMemo(() => ({
    labels: buckets.map((bucket, index) => bucketLabel(bucket, buckets[index - 1], format)),
    datasets: [{
      label: valueLabel, data: buckets.map((b) => b.count),
      backgroundColor: palette.latency, borderRadius: 4, borderSkipped: "start" as const,
      maxBarThickness: 28, categoryPercentage: 0.9, barPercentage: 0.9,
    }],
  }), [buckets, palette, valueLabel, format]);
  const options = useMemo<ChartOptions<"bar">>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...chartTooltip(palette),
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
  return <ChartFrame title={title} summary={summary} empty={total ? undefined : empty}>
    <Bar data={data} options={options} aria-label={title} role="img" />
  </ChartFrame>;
}

export { BarList, StatTile, type BarItem, type BarTone } from "./bar-list";
