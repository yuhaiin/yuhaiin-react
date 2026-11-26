import { getConnections, getConnectionStatistics, getFailedHistory, getTelemetry, getTotalFlow, resetConnectionStatistics } from "@/api/connections";
import { listGeoIPCountries } from "@/api/route";
import { Button } from "@/component/v2/button";
import { MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import { PageHeader } from "@/component/v2/page-header";
import { BarList, BucketHistogram, LineChart, StatTile, useStatsPalette } from "@/component/v2/stats/charts";
import { bucketPercentile, formatCount, formatDuration, formatMs, formatPercent, ratio } from "@/component/v2/stats/format";
import { Select } from "@/component/v2/select";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import { formatBytes } from "@/docs/home/format";
import { ArrowLeftRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { GeoSection } from "./geo-section";
import {
  aggregateHistory, failedByError, failedByHost, liveCountries, rankedDimensions, sortRanked, tally, telemetryCountries, telemetryItems,
  type ConnectionStatistics, type GeoDimension, type RankedDimension, type TelemetrySort,
} from "./model";

const ranges = [
  { key: "now", durationMs: 0 },
  { key: "1h", durationMs: 3_600_000 },
  { key: "24h", durationMs: 86_400_000 },
  { key: "7d", durationMs: 7 * 86_400_000 },
  { key: "30d", durationMs: 30 * 86_400_000 },
] as const;
type RangeKey = typeof ranges[number]["key"];

const errorText = (error: unknown) => (error as { msg?: string })?.msg ?? String(error);
const bytes = (value: number) => formatBytes(value, 1, " ");

function RuntimeSection({ stats }: { stats: ConnectionStatistics }) {
  const { t, i18n } = useTranslation("connectionStats");
  const lang = i18n.language;
  const palette = useStatsPalette();
  const count = (value: number) => formatCount(value, lang);
  const points = useMemo(() => aggregateHistory(stats.history), [stats.history]);
  const p50 = bucketPercentile(stats.connectTime, 0.5);
  const p95 = bucketPercentile(stats.connectTime, 0.95);
  const p99 = bucketPercentile(stats.connectTime, 0.99);
  const lifetimeP50 = bucketPercentile(stats.lifetime, 0.5);
  const lastHour = points.reduce((sum, p) => sum + p.opened, 0);
  const attempts = stats.opened + stats.failed;
  const recentEmpty = points.every((p) => p.opened === 0 && p.closed === 0 && p.failed === 0) ? t("noRecentConnections") : undefined;
  const since = stats.sinceUnixMs ? new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" }).format(new Date(stats.sinceUnixMs)) : "—";
  const failures = stats.failures.map((failure) => ({
    key: failure.kind,
    label: t(`failure.${failure.kind}`, { defaultValue: failure.kind }),
    value: failure.count,
    tone: failure.kind === "blocked" ? "blocked" as const : failure.kind === "canceled" ? "neutral" as const : "error" as const,
    detail: formatPercent(ratio(failure.count, stats.failed), lang),
  })).sort((a, b) => b.value - a.value);

  return <section className="space-y-4" aria-labelledby="connection-runtime-title">
    <div>
      <h2 id="connection-runtime-title" className="text-base font-medium text-ui-heading">{t("runtimeTitle", { since })}</h2>
      <p className="text-sm text-ui-muted">{t("runtimeHelp")}</p>
    </div>
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <StatTile label={t("active")} value={count(stats.active)} detail={t("activeDetail", { tcp: count(stats.activeTcp), udp: count(stats.activeUdp) })} />
      <StatTile label={t("opened")} value={count(stats.opened)} detail={t("lastHour", { value: count(lastHour) })} />
      <StatTile label={t("failureRate")} value={formatPercent(ratio(stats.failed, attempts), lang)}
        tone={stats.failed && ratio(stats.failed, attempts) >= 0.05 ? "danger" : undefined}
        detail={t("failedCount", { value: count(stats.failed) })} />
      <StatTile label={t("traffic")} value={bytes(stats.download + stats.upload)} detail={`↓ ${bytes(stats.download)} · ↑ ${bytes(stats.upload)}`} />
      <StatTile label={t("connectTimeP50")} value={formatMs(p50)} detail={t("percentiles", { p95: formatMs(p95), p99: formatMs(p99) })} />
      <StatTile label={t("lifetimeP50")} value={formatDuration(lifetimeP50)} detail={t("closedCount", { value: count(stats.closed) })} />
    </dl>
    <div className="grid gap-4 xl:grid-cols-2">
      <LineChart title={t("connectionsPerMinute")} points={points} empty={recentEmpty} series={[
        { label: t("opened"), values: points.map((p) => p.opened), color: palette.forwarded, fill: true },
        { label: t("closed"), values: points.map((p) => p.closed), color: palette.neutral },
        { label: t("failed"), values: points.map((p) => p.failed), color: palette.error },
      ]} />
      <LineChart title={t("activePerMinute")} points={points}
        empty={points.every((p) => p.active === 0) ? t("noRecentConnections") : undefined}
        series={[{ label: t("active"), values: points.map((p) => p.active), color: palette.forwarded, fill: true }]} />
      <LineChart title={t("connectTimePerMinute")} points={points} format="ms"
        empty={points.every((p) => p.connectMs === null) ? t("noRecentConnections") : undefined}
        series={[{ label: t("averageConnectTime"), values: points.map((p) => p.connectMs), color: palette.latency, fill: true }]} />
      <LineChart title={t("trafficPerMinute")} points={points} format="bytes"
        empty={points.every((p) => p.download === 0 && p.upload === 0) ? t("noRecentConnections") : undefined}
        series={[
          { label: t("download"), values: points.map((p) => p.download), color: palette.downloadStroke, fill: true },
          { label: t("upload"), values: points.map((p) => p.upload), color: palette.uploadStroke, fill: true },
        ]} />
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      <BucketHistogram title={t("connectTimeDistribution")} buckets={stats.connectTime} valueLabel={t("connections")}
        summary={t("connectTimeHelp")} empty={t("noConnections")} />
      <BucketHistogram title={t("lifetimeDistribution")} buckets={stats.lifetime} valueLabel={t("connections")}
        format={formatDuration} empty={t("noConnections")} />
      <BarList title={t("failureCauses")} items={failures} empty={t("noFailures")} />
    </div>
  </section>;
}

function RankingSection({ telemetry, error, initial, summary }: {
  telemetry?: Parameters<typeof telemetryItems>[0]; error?: unknown; initial: RankedDimension; summary?: string;
}) {
  const { t, i18n } = useTranslation("connectionStats");
  const [dimension, setDimension] = useState<RankedDimension>(initial);
  const [sort, setSort] = useState<TelemetrySort>("traffic");
  const items = sortRanked(telemetryItems(telemetry, dimension), sort).slice(0, 12).map((item) => ({
    key: item.value,
    label: item.value,
    value: sort === "traffic" ? item.download + item.upload : item.failures,
    tone: sort === "failures" ? "error" as const : "forwarded" as const,
    detail: sort === "traffic"
      ? (item.failures ? t("failuresDetail", { value: formatCount(item.failures, i18n.language) }) : undefined)
      : bytes(item.download + item.upload),
  }));
  return <BarList title={t("rankingTitle", { dimension: t(`dimension.${dimension}`) })} items={items} summary={summary}
    empty={error ? t("unavailable", { error: errorText(error) }) : t("noRanking")}
    formatValue={sort === "traffic" ? bytes : undefined}
    actions={<div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <Select value={dimension} ariaLabel={t("rankingDimension")} triggerClassName="w-full"
          onValueChange={(value) => setDimension(value as RankedDimension)}
          items={rankedDimensions.map((value) => ({ value, label: t(`dimension.${value}`) }))} />
      </div>
      <ToggleGroup type="single" value={sort} aria-label={t("sortBy")} className="shrink-0" onValueChange={(value) => value && setSort(value as TelemetrySort)}>
        <ToggleItem value="traffic">{t("metricTraffic")}</ToggleItem>
        <ToggleItem value="failures">{t("metricFailures")}</ToggleItem>
      </ToggleGroup>
    </div>} />;
}

export default function ConnectionStatisticsPage() {
  const { t, i18n } = useTranslation("connectionStats");
  const lang = i18n.language;
  const [range, setRange] = useState<RangeKey>("now");
  const [side, setSide] = useState<GeoDimension>("geo");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetPending, setResetPending] = useState(false);
  const [failure, setFailure] = useState("");
  const live = range === "now";
  const duration = ranges.find((r) => r.key === range)!.durationMs;
  const telemetryRange = live ? 3_600_000 : duration;

  const { data: stats, error: statsError, mutate: mutateStats } = useSWR("/api/v2/connections/statistics", getConnectionStatistics, { refreshInterval: 5000 });
  const { data: connections } = useSWR(live ? "/api/v2/connections#statistics" : null, getConnections, { refreshInterval: 5000 });
  const { data: flow } = useSWR(live ? "/api/v2/connections/total#statistics" : null, () => getTotalFlow(), { refreshInterval: 5000 });
  const { data: telemetry, error: telemetryError } = useSWR(["/api/v2/connections/telemetry#statistics", telemetryRange], () => {
    const to = new Date();
    return getTelemetry(new Date(to.getTime() - telemetryRange), to, 50);
  }, { refreshInterval: 30000, revalidateOnFocus: false });
  const { data: failed } = useSWR("/api/v2/connections/failed-history#statistics", getFailedHistory, { refreshInterval: 30000, revalidateOnFocus: false });
  const { data: geoip } = useSWR("/api/v2/route/geoip/countries", listGeoIPCountries, { revalidateOnFocus: false, shouldRetryOnError: false });

  const open = connections?.connections ?? [];
  const countries = live ? liveCountries(open, flow?.counters, side) : telemetryCountries(telemetry, side);
  const byOutbound = tally(open, (c) => c.nodeName || c.outbound || t("direct")).map((item) => {
    const members = open.filter((c) => (c.nodeName || c.outbound || t("direct")) === item.value);
    const sum = (field: "download" | "upload") => members.reduce((total, c) => total + Number(flow?.counters?.[c.id]?.[field] ?? 0), 0);
    return { key: item.value, label: item.value, value: item.count, tone: "forwarded" as const,
      detail: flow ? t("liveBytes", { download: bytes(sum("download")), upload: bytes(sum("upload")) }) : undefined };
  }).slice(0, 10);
  const byProtocol = tally(open, (c) => c.network?.connType || "—").map((item) => ({
    key: item.value, label: item.value.toUpperCase(), value: item.count, tone: "neutral" as const,
    detail: formatPercent(ratio(item.count, open.length), lang),
  }));
  const failedItems = failed?.items ?? [];
  const errors = failedByError(failedItems).slice(0, 8).map((item) => ({ key: item.value, label: item.value, value: item.count, tone: "error" as const }));
  const hosts = failedByHost(failedItems).slice(0, 8).map((item) => ({ key: item.value, label: item.value, value: item.count, tone: "error" as const }));

  const reset = async () => {
    if (resetPending) return;
    setResetPending(true);
    setFailure("");
    try {
      await resetConnectionStatistics();
      await mutateStats();
      setResetOpen(false);
    } catch (error) {
      setFailure(errorText(error));
    } finally {
      setResetPending(false);
    }
  };

  if (statsError && !stats) return <Loading onRetry={() => void mutateStats()}>{errorText(statsError)}</Loading>;
  if (!stats) return <Loading />;

  return <MainContainer className="max-w-[1440px]">
    <PageHeader title={t("title")} description={t("description")} actions={<>
      <Button asChild size="sm" variant="outline-secondary">
        <a href="#/docs/connections/v2" className="gap-2"><ArrowLeftRight size={16} aria-hidden="true" />{t("activeConnectionsLink")}</a>
      </Button>
      <Button permission="connections:write" size="sm" variant="outline-secondary" disabled={resetPending} onClick={() => setResetOpen(true)}>{t("reset")}</Button>
    </>} />
    <div className="space-y-8">
      {failure && <p role="alert" className="rounded-ui-sm border border-ui-border p-3 text-sm text-ui-danger">{failure}</p>}
      {resetOpen && <div className="flex flex-wrap items-center gap-3 rounded-ui-sm border border-ui-border bg-ui-surface p-3 text-sm"
        role="group" aria-label={t("reset")}>
        <p className="flex-1">{t("resetWarning")}</p>
        <Button size="sm" variant="primary" loading={resetPending} onClick={() => void reset()}>{t("confirmReset")}</Button>
        <Button size="sm" variant="outline-secondary" disabled={resetPending} onClick={() => setResetOpen(false)}>{t("cancel")}</Button>
      </div>}

      <RuntimeSection stats={stats} />

      <section className="space-y-4" aria-labelledby="connection-range-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="connection-range-title" className="text-base font-medium text-ui-heading">{t("rangeTitle")}</h2>
            <p className="text-sm text-ui-muted">{t("rangeHelp")}</p>
          </div>
          <ToggleGroup type="single" value={range} aria-label={t("rangeTitle")} className="flex w-full sm:w-auto" onValueChange={(value) => value && setRange(value as RangeKey)}>
            {ranges.map((r) => <ToggleItem key={r.key} value={r.key} className="flex-1">{t(`range.${r.key}`)}</ToggleItem>)}
          </ToggleGroup>
        </div>

        <GeoSection rows={countries} live={live} side={side} onSide={setSide} geoipLoaded={geoip?.loaded} />

        <div className="grid gap-4 lg:grid-cols-3">
          {(["rule", "outbound", "destination"] as const).map((initial) => <RankingSection key={initial} initial={initial}
            telemetry={telemetry} error={telemetryError} summary={live ? t("range.1h") : undefined} />)}
        </div>
        {live && <div className="grid gap-4 lg:grid-cols-2">
          <BarList title={t("liveByOutbound")} items={byOutbound} empty={t("noActive")} />
          <BarList title={t("liveByProtocol")} items={byProtocol} empty={t("noActive")} />
        </div>}
      </section>

      <section className="space-y-4" aria-labelledby="connection-failed-title">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="connection-failed-title" className="text-base font-medium text-ui-heading">{t("failedTitle")}</h2>
          <a className="text-sm text-ui-primary underline" href="#/docs/connections/failed">{t("failedHistoryLink")}</a>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <BarList title={t("failedByError")} items={errors} empty={t("noFailures")} />
          <BarList title={t("failedByHost")} items={hosts} empty={t("noFailures")} />
        </div>
      </section>
    </div>
  </MainContainer>;
}
