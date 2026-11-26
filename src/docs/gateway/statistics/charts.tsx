import { BucketHistogram, LineChart, useStatsPalette } from "@/component/v2/stats/charts";
import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { type HistoryPoint, type LatencyBucket } from "./model";

export { BarList, ChartFrame, Legend } from "@/component/v2/stats/charts";

export function RequestsChart({ points }: { points: HistoryPoint[] }) {
  const { t } = useTranslation("gateway");
  const palette = useStatsPalette();
  return <LineChart title={t("statsRequestsPerMinute")} points={points}
    empty={points.every((p) => p.requests === 0) ? t("statsNoRecentRequests") : undefined}
    series={[
      { label: t("forwarded"), values: points.map((p) => p.forwarded), color: palette.forwarded, fill: true },
      { label: t("blocked"), values: points.map((p) => p.blocked), color: palette.blocked, fill: true },
      { label: t("errors"), values: points.map((p) => p.errors), color: palette.error },
    ]} />;
}

export function LatencyChart({ points }: { points: HistoryPoint[] }) {
  const { t } = useTranslation("gateway");
  const palette = useStatsPalette();
  return <LineChart title={t("statsLatencyPerMinute")} points={points} format="ms"
    empty={points.every((p) => p.latencyMs === null) ? t("statsNoRecentRequests") : undefined}
    series={[{ label: t("averageDuration"), values: points.map((p) => p.latencyMs), color: palette.latency, fill: true }]} />;
}

export function TrafficChart({ points }: { points: HistoryPoint[] }) {
  const { t } = useTranslation("gateway");
  const palette = useStatsPalette();
  return <LineChart title={t("statsTrafficPerMinute")} points={points} format="bytes"
    empty={points.every((p) => p.bytesIn === 0 && p.bytesOut === 0) ? t("statsNoRecentRequests") : undefined}
    series={[
      { label: t("statsBytesOut"), values: points.map((p) => p.bytesOut), color: palette.downloadStroke, fill: true },
      { label: t("statsBytesIn"), values: points.map((p) => p.bytesIn), color: palette.uploadStroke, fill: true },
    ]} />;
}

export function LatencyHistogram({ buckets, summary }: { buckets: LatencyBucket[]; summary?: ReactNode }) {
  const { t } = useTranslation("gateway");
  return <BucketHistogram title={t("statsLatencyDistribution")} buckets={buckets} summary={summary}
    empty={t("statsNoRequests")} valueLabel={t("requests")} />;
}
