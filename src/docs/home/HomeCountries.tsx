import { listGeoIPCountries } from "@/api/route";
import { Card, CardBody, CardHeader, IconBox } from "@/component/v2/card";
import type { TelemetrySummary } from "@/contract/connection";
import { GeoSection } from "@/docs/connections/statistics/geo-section";
import { telemetryCountries, type GeoDimension } from "@/docs/connections/statistics/model";
import { Globe2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

/** The Connections statistics country map, for the range picked on the home page. */
export default function HomeCountries({ telemetry, range }: { telemetry?: TelemetrySummary; range: string }) {
  const { t } = useTranslation("connectionStats");
  const [side, setSide] = useState<GeoDimension>("geo");
  const { data: geoip } = useSWR("/api/v2/route/geoip/countries", listGeoIPCountries, { revalidateOnFocus: false, shouldRetryOnError: false });
  // Older servers do not report country telemetry at all; hide the card then.
  if (telemetry && !telemetry.groups.some((group) => group.dimension === "geo" || group.dimension === "outboundGeo")) return null;
  return <Card density="compact">
    <CardHeader className="flex-wrap gap-3 px-4 py-3.5">
      <IconBox icon={Globe2} tone="neutral" title={t("geoTitle")} description={t("homeGeoDescription", { range })} />
      <a href="#/docs/connections/statistics" className="ml-auto text-sm text-ui-primary underline">{t("openStatistics")}</a>
    </CardHeader>
    <CardBody>
      <GeoSection bare rows={telemetryCountries(telemetry, side)} live={false} side={side} onSide={setSide}
        geoipLoaded={geoip?.loaded} hint={t("homeGeoHint")} />
    </CardBody>
  </Card>;
}
