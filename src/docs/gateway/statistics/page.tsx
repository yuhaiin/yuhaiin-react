import { getGatewayConfig, gatewayStatistics, gatewayStatus, resetGatewayStatistics } from "@/api/gateway";
import { Button } from "@/component/v2/button";
import { MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import { PageHeader } from "@/component/v2/page-header";
import { errorMessage, type Config } from "@/contract/gateway";
import { formatBytes } from "@/docs/home/format";
import { ArrowLeft } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { StatTile } from "@/component/v2/stats/charts";
import { BarList, LatencyChart, LatencyHistogram, RequestsChart, TrafficChart } from "./charts";
import {
  aggregateHistory, formatCount, formatMs, formatPercent, latencyPercentile, ratio, type GatewayStatistics,
} from "./model";
import type { Go } from "@/api/generated-contracts";

type Status = Go.gateway.GatewayStatus;

const statusClassLabels = ["statsStatusOther", "1xx", "2xx", "3xx", "4xx", "5xx"] as const;

function GatewayStatisticsView({ config, status, detail }: { config: Config; status: Status; detail?: GatewayStatistics }) {
  const { t, i18n } = useTranslation("gateway");
  const lang = i18n.language;
  const count = (value: number) => formatCount(value, lang);
  const points = useMemo(() => detail ? aggregateHistory(detail.history) : [], [detail]);
  const p50 = detail ? latencyPercentile(detail.latency, 0.5) : null;
  const p95 = detail ? latencyPercentile(detail.latency, 0.95) : null;
  const p99 = detail ? latencyPercentile(detail.latency, 0.99) : null;
  const lastHour = points.reduce((sum, p) => ({ requests: sum.requests + p.requests, blocked: sum.blocked + p.blocked }), { requests: 0, blocked: 0 });
  const ruleName = (id: string) => config.rules.find((r) => r.id === id)?.name || id;
  const upstreamName = (id: string) => config.upstreams.find((u) => u.id === id)?.name || id;
  const filterName = (id: string) => config.filterLists.find((f) => f.id === id)?.name || id;
  const rules = detail ? [
    ...detail.rules.map((rule) => ({ key: rule.id, label: ruleName(rule.id), value: rule.hits, tone: "neutral" as const })),
    { key: "#filter", label: t("statsFilterLists"), value: detail.filterHits, tone: "blocked" as const },
    { key: "#default", label: t("defaultAction"), value: detail.defaultHits, tone: "neutral" as const },
  ].filter((item) => item.value > 0 || !item.key.startsWith("#")).sort((a, b) => b.value - a.value) : [];
  const statusItems = detail ? detail.statusClasses
    .map((value, index) => ({
      key: String(index),
      label: index === 0 ? t(statusClassLabels[0]) : statusClassLabels[index],
      value,
      tone: index >= 5 ? "error" as const : index === 4 ? "blocked" as const : index === 2 ? "forwarded" as const : "neutral" as const,
      detail: formatPercent(ratio(value, detail.statusClasses.reduce((a, b) => a + b, 0)), lang),
    }))
    .filter((item) => item.value > 0) : [];
  const hosts = detail?.topHosts.map((host) => ({
    key: host.host, label: host.host, value: host.requests,
    tone: host.blocked * 2 >= host.requests ? "blocked" as const : "forwarded" as const,
    detail: host.blocked ? t("statsBlockedShare", { value: formatPercent(ratio(host.blocked, host.requests), lang) }) : undefined,
  })) ?? [];
  const since = detail?.sinceUnixMs ? new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" }).format(new Date(detail.sinceUnixMs)) : "—";

  return <div className="space-y-4">
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <StatTile label={t("requests")} value={count(status.requests)}
        detail={t("statsLastHour", { value: count(lastHour.requests) })} />
      <StatTile label={t("statsBlockRate")} value={formatPercent(ratio(status.blocked, status.requests), lang)}
        detail={`${t("blocked")} ${count(status.blocked)}`} />
      <StatTile label={t("forwarded")} value={count(status.forwarded)}
        detail={formatPercent(ratio(status.forwarded, status.requests), lang)} />
      <StatTile label={t("errors")} value={count(status.errors)} tone={status.errors ? "danger" : undefined}
        detail={formatPercent(ratio(status.errors, status.requests), lang)} />
      <StatTile label={t("statsLatencyP50")} value={formatMs(p50)}
        detail={`p95 ${formatMs(p95)} · p99 ${formatMs(p99)}`} />
      <StatTile label={t("activeRequests")} value={count(detail?.activeRequests ?? 0)}
        detail={t("statsAverage", { value: formatMs(status.requests ? status.durationNs / status.requests / 1e6 : null) })} />
    </dl>

    <div className="grid gap-4 xl:grid-cols-2">
      <RequestsChart points={points} />
      <LatencyChart points={points} />
    </div>
    <div className="grid gap-4 xl:grid-cols-2">
      <LatencyHistogram buckets={detail?.latency ?? []}
        summary={`p50 ${formatMs(p50)} · p95 ${formatMs(p95)} · p99 ${formatMs(p99)}`} />
      <TrafficChart points={points} />
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      <BarList title={t("statsRuleHits")} items={rules} empty={t("statsNoRequests")} />
      <BarList title={t("statsTopHosts")} items={hosts} empty={t("statsNoRequests")}
        summary={detail?.hostCountError ? t("statsTopHostsApprox", { value: count(detail.hostCountError) }) : undefined} />
      <BarList title={t("statsStatusCodes")} items={statusItems} empty={t("statsNoRequests")} />
    </div>

    <section className="rounded-ui-sm border border-ui-border bg-ui-surface p-4">
      <h3 className="mb-3 text-sm font-medium text-ui-heading">{t("statsConnection")}</h3>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="text-ui-secondary">{t("outbound")}</dt><dd className="break-all">{status.lastOutbound || "—"}</dd></div>
        <div><dt className="text-ui-secondary">{t("tlsFailures")}</dt><dd className="tabular-nums">{count(status.tlsFailures)}</dd></div>
        <div><dt className="text-ui-secondary">{t("protocolFailures")}</dt><dd className="tabular-nums">{count(status.protocolFailures)}</dd></div>
        <div><dt className="text-ui-secondary">{t("statsTransferred")}</dt>
          <dd className="tabular-nums">↓ {formatBytes(detail?.bytesOut ?? 0, 1, " ")} · ↑ {formatBytes(detail?.bytesIn ?? 0, 1, " ")}</dd></div>
      </dl>
    </section>

    {status.upstreams.length > 0 && <section className="rounded-ui-sm border border-ui-border bg-ui-surface p-4">
      <h3 className="mb-3 text-sm font-medium text-ui-heading">{t("upstreams")}</h3>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="text-xs text-ui-secondary">
            <tr><th className="py-1.5 pr-3 font-normal">{t("backends")}</th><th className="py-1.5 pr-3 font-normal">{t("statsHealth")}</th>
              <th className="py-1.5 pr-3 text-right font-normal">{t("activeRequests")}</th><th className="py-1.5 text-right font-normal">{t("errors")}</th></tr>
          </thead>
          <tbody>
            {status.upstreams.map((upstream) => <Fragment key={upstream.id}>
              <tr className="border-t border-ui-border">
                <td colSpan={2} className="py-2 pr-3 font-medium">{upstreamName(upstream.id)}</td>
                <td className="py-2 pr-3 text-right tabular-nums">{count(upstream.activeRequests)}</td><td />
              </tr>
              {upstream.backends.map((backend, index) => <tr key={`${upstream.id}-${index}`}>
                <td className="break-all py-1.5 pr-3 pl-3 text-ui-secondary">{backend.url}</td>
                <td className={`py-1.5 pr-3 ${backend.healthy ? "text-ui-success" : "text-ui-danger"}`}>
                  {backend.healthy ? `✓ ${t("statsHealthy")}` : `✕ ${t("statsUnhealthy")}`}
                </td>
                <td className="py-1.5 pr-3 text-right tabular-nums">{count(backend.activeRequests)}</td>
                <td className="py-1.5 text-right tabular-nums">{count(backend.failures)}</td>
              </tr>)}
            </Fragment>)}
          </tbody>
        </table>
      </div>
    </section>}

    {status.filterReports.length > 0 && <section className="rounded-ui-sm border border-ui-border bg-ui-surface p-4">
      <h3 className="mb-3 text-sm font-medium text-ui-heading">{t("filters")}</h3>
      <ul className="space-y-1 text-sm">
        {status.filterReports.map((report) => <li key={report.id} className="flex flex-wrap justify-between gap-2">
          <span>{filterName(report.id)}</span>
          <span className="tabular-nums text-ui-secondary">{t("statsFilterRules", { accepted: count(report.accepted), rejected: count(report.rejected) })}</span>
        </li>)}
      </ul>
    </section>}

    <p className="text-xs text-ui-secondary">{t("statsBreakdownSince", { since })}</p>
  </div>;
}

export default function GatewayStatisticsPage() {
  const { t } = useTranslation("gateway");
  const { data: config, error: configError, mutate: mutateConfig } = useSWR("/api/v2/gateway/config", getGatewayConfig, { revalidateOnFocus: false });
  const { data: status, error: statusError, mutate: mutateStatus } = useSWR("/api/v2/gateway/status", gatewayStatus, { refreshInterval: 5000 });
  const { data: detail, mutate: mutateDetail } = useSWR("/api/v2/gateway/statistics", gatewayStatistics, { refreshInterval: 5000 });
  const [selected, setSelected] = useState<string>();
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [resetPending, setResetPending] = useState(false);
  const [failure, setFailure] = useState("");

  const gateways = status?.gateways ?? [];
  const current = gateways.find((g) => g.id === selected) ?? gateways[0];
  const name = (id: string) => config?.gateways.find((g) => g.id === id)?.name || id;

  const reset = async () => {
    if (resetTarget === null || resetPending) return;
    setResetPending(true);
    setFailure("");
    try {
      await resetGatewayStatistics(resetTarget);
      await Promise.all([mutateStatus(), mutateDetail()]);
      setResetTarget(null);
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setResetPending(false);
    }
  };

  if (configError && !config) return <Loading onRetry={() => void mutateConfig()}>{errorMessage(configError)}</Loading>;
  if (!config || (!status && !statusError)) return <Loading />;

  return <MainContainer className="max-w-[1440px]">
    <PageHeader title={t("statsTitle")} description={t("statsDescription")} actions={<>
      <Button asChild size="sm" variant="outline-secondary">
        <a href="#/docs/gateway" className="gap-2"><ArrowLeft size={16} aria-hidden="true" />{t("title")}</a>
      </Button>
      {current && <Button permission="gateway:write" size="sm" variant="outline-secondary" disabled={resetPending}
        onClick={() => setResetTarget(current.id)}>{t("resetStatistics")}</Button>}
      <Button permission="gateway:write" size="sm" variant="outline-secondary" disabled={resetPending || !gateways.length}
        onClick={() => setResetTarget("")}>{t("resetAllStatistics")}</Button>
    </>} />
    <div className="space-y-4">
      {(failure || statusError) && <p role="alert" className="rounded-ui-sm border border-ui-border p-3 text-sm text-ui-danger">
        {failure || errorMessage(statusError)}
      </p>}
      {resetTarget !== null && <div className="flex flex-wrap items-center gap-3 rounded-ui-sm border border-ui-border bg-ui-surface p-3 text-sm"
        role="group" aria-label={t("confirmResetStatistics")}>
        <p className="flex-1">{resetTarget === "" ? t("resetAllStatisticsWarning") : t("resetStatisticsWarning")}</p>
        <Button size="sm" variant="primary" loading={resetPending} onClick={() => void reset()}>{t("confirmResetStatistics")}</Button>
        <Button size="sm" variant="outline-secondary" disabled={resetPending} onClick={() => setResetTarget(null)}>{t("cancel")}</Button>
      </div>}
      {gateways.length > 1 && <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("gateways")}>
        {gateways.map((gateway) => <Button key={gateway.id} size="sm" role="tab"
          aria-selected={gateway.id === current?.id}
          variant={gateway.id === current?.id ? "primary" : "outline-secondary"}
          onClick={() => setSelected(gateway.id)}>{name(gateway.id)}</Button>)}
      </div>}
      {current
        ? <>
          {gateways.length === 1 && <h2 className="text-lg font-semibold text-ui-heading">{name(current.id)}</h2>}
          <GatewayStatisticsView config={config} status={current} detail={detail?.gateways.find((g) => g.id === current.id)} />
        </>
        : <p className="rounded-ui-sm border border-ui-border bg-ui-surface p-6 text-center text-sm text-ui-muted">{t("statsNoGateways")}</p>}
      <a className="inline-block text-sm text-ui-primary underline" href="#/docs/connections/v2">{t("connectionsLink")}</a>
    </div>
  </MainContainer>;
}
