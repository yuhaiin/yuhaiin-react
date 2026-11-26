import { useCountryNames } from "@/common/country-names";
import { BarList } from "@/component/v2/stats/charts";
import { formatCount } from "@/component/v2/stats/format";
import { WorldMap } from "@/component/v2/stats/world-map";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import { formatBytes } from "@/docs/home/format";
import { navigation } from "@/hooks/navigation";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { countryValue, type CountryMetric, type CountryRow, type GeoDimension } from "./model";

const TOP = 10;

export function GeoSection({ rows, live, side, onSide, geoipLoaded }: {
  rows: CountryRow[];
  /** Live rows carry connection counts and destinations; telemetry rows do not. */
  live: boolean;
  side: GeoDimension;
  onSide: (side: GeoDimension) => void;
  /** False when the GeoIP database is known to be missing. */
  geoipLoaded?: boolean;
}) {
  const { t, i18n } = useTranslation("connectionStats");
  const countryName = useCountryNames();
  const [chosen, setChosen] = useState<CountryMetric>("traffic");
  const metric: CountryMetric = !live && chosen === "connections" ? "traffic" : live && chosen === "failures" ? "connections" : chosen;
  const lang = i18n.language;

  const known = rows.filter((row) => row.code);
  const unknown = rows.find((row) => !row.code);
  const values = useMemo(() => Object.fromEntries(known.map((row) => [row.code, countryValue(row, metric)])), [known, metric]);
  const byCode = useMemo(() => new Map(rows.map((row) => [row.code, row])), [rows]);
  const format = (value: number) => metric === "traffic" ? formatBytes(value, 1, " ") : formatCount(value, lang);
  const filterHref = (code: string) => `#/docs/connections/v2?${side}=${encodeURIComponent(code)}`;

  const ranked = [...known, ...(unknown ? [unknown] : [])]
    .map((row) => ({ row, value: countryValue(row, metric) }))
    .filter((item) => item.value > 0)
    .sort((a, b) => (b.row.code ? 1 : 0) - (a.row.code ? 1 : 0) || b.value - a.value)
    .slice(0, TOP + 1);
  const items = ranked.map(({ row, value }) => ({
    key: row.code || "#unknown",
    label: row.code ? `${countryName(row.code)} (${row.code})` : t("geoUnknown"),
    value,
    tone: row.code ? (metric === "failures" ? "error" as const : "forwarded" as const) : "neutral" as const,
    detail: metric !== "traffic" && row.download + row.upload > 0 ? formatBytes(row.download + row.upload, 1, " ") : undefined,
    href: live && row.code ? filterHref(row.code) : undefined,
  }));

  const noCountries = known.every((row) => countryValue(row, metric) <= 0);
  const metrics: CountryMetric[] = live ? ["connections", "traffic"] : ["traffic", "failures"];
  const metricLabel = { connections: t("metricConnections"), traffic: t("metricTraffic"), failures: t("metricFailures") }[metric];
  const sideLabel = side === "geo" ? t("geoDestination") : t("geoOutbound");

  return <section className="min-w-0 rounded-ui-sm border border-ui-border bg-ui-surface p-4" aria-labelledby="connection-geo-title">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <h3 id="connection-geo-title" className="text-sm font-medium text-ui-heading">{t("geoTitle")}</h3>
      <div className="flex flex-wrap gap-2">
        <ToggleGroup type="single" value={side} aria-label={t("geoTitle")} onValueChange={(value) => value && onSide(value as GeoDimension)}>
          <ToggleItem value="geo">{t("geoDestination")}</ToggleItem>
          <ToggleItem value="outboundGeo">{t("geoOutbound")}</ToggleItem>
        </ToggleGroup>
        <ToggleGroup type="single" value={metric} aria-label={t("sortBy")} onValueChange={(value) => value && setChosen(value as CountryMetric)}>
          {metrics.map((value) => <ToggleItem key={value} value={value}>
            {{ connections: t("metricConnections"), traffic: t("metricTraffic"), failures: t("metricFailures") }[value]}
          </ToggleItem>)}
        </ToggleGroup>
      </div>
    </div>

    {noCountries && geoipLoaded === false
      ? <div className="rounded-ui-sm border border-dashed border-ui-border p-6 text-center text-sm text-ui-muted">
        <p>{t("geoNotConfigured")}</p>
        <a className="mt-2 inline-block text-ui-primary underline" href="#/docs/bypass/list">{t("geoConfigure")}</a>
      </div>
      : <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
        <div className="min-w-0">
          <WorldMap values={values}
            label={t("geoMapLabel", { metric: metricLabel, side: sideLabel })}
            onSelect={live ? (code) => navigation.push(filterHref(code).slice(1)) : undefined}
            minLabel={t("geoLegendLow")} maxLabel={t("geoLegendHigh")}
            tooltip={(code, name) => {
              const row = byCode.get(code);
              return <div className="space-y-1">
                <p className="font-medium text-ui-heading">{countryName(code) || name} <span className="text-ui-secondary">({code})</span></p>
                {row ? <dl className="grid grid-cols-[auto_1fr] gap-x-3 tabular-nums">
                  {live && <><dt className="text-ui-secondary">{t("metricConnections")}</dt><dd className="text-right">{formatCount(row.connections, lang)}</dd></>}
                  <dt className="text-ui-secondary">↓</dt><dd className="text-right">{formatBytes(row.download, 1, " ")}</dd>
                  <dt className="text-ui-secondary">↑</dt><dd className="text-right">{formatBytes(row.upload, 1, " ")}</dd>
                  {!live && <><dt className="text-ui-secondary">{t("metricFailures")}</dt><dd className="text-right">{formatCount(row.failures, lang)}</dd></>}
                </dl> : <p className="text-ui-secondary">—</p>}
                {row && row.destinations.length > 0 && <div>
                  <p className="text-ui-secondary">{t("geoTopDestinations")}</p>
                  <ul>{row.destinations.map((d) => <li key={d.value} className="flex justify-between gap-3">
                    <span className="truncate font-mono">{d.value}</span><span className="tabular-nums">{d.connections}</span>
                  </li>)}</ul>
                </div>}
              </div>;
            }} />
          <p className="mt-1 text-xs text-ui-secondary">{live ? t("geoFilterHint") : t("geoLimited")}</p>
        </div>
        <BarList title={t("geoTopCountries")} items={items} empty={t("geoNoData")} formatValue={format} />
      </div>}
  </section>;
}
