import {
  getGatewayConfig,
  gatewayStatus,
  saveGatewayConfig,
  refreshGatewayFilter,
} from "@/api/gateway";
import { listInbounds } from "@/api/inbounds";
import { createID } from "@/common/id";
import { Button } from "@/component/v2/button";
import { MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import type { Config } from "@/contract/gateway";
import {
  errorMessage,
  newGateway,
  newRule,
  newUpstream,
} from "@/contract/gateway";
import {
  GatewayEditor,
  RuleEditor,
  UpstreamEditor,
  InterceptionEditor,
  FilterEditor,
} from "./resources";
import { AuthorityPanel, RuleTester } from "./tools";
import { useState } from "react";
import { useCloseGuard } from "@/hooks/use-editor-draft";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

const views = [
  "gateways",
  "rules",
  "upstreams",
  "interception",
  "filters",
  "authority",
  "tester",
  "statistics",
] as const;
type View = (typeof views)[number];

export default function GatewayPage() {
  const { t } = useTranslation("gateway");
  const { data, error, isLoading, mutate } = useSWR(
    "/api/v2/gateway/config",
    getGatewayConfig,
    { revalidateOnFocus: false },
  );
  const { data: status, error: statusError } = useSWR(
    "/api/v2/gateway/status",
    gatewayStatus,
    { refreshInterval: 5000 },
  );
  const { data: inbounds } = useSWR("/api/v2/inbounds/gateway", () =>
    listInbounds(),
  );
  const [draft, setDraft] = useState<Config>();
  const [view, setView] = useState<View>("gateways");
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState("");
  const [saved, setSaved] = useState(false);
  if (data && !draft) setDraft(structuredClone(data));
  const dirty = Boolean(
    data && draft && JSON.stringify(data) !== JSON.stringify(draft),
  );
  useCloseGuard(dirty, pending, () => undefined);

  const save = async () => {
    if (!draft) return;
    setPending(true);
    setFailure("");
    setSaved(false);
    try {
      const next = await saveGatewayConfig(draft);
      await mutate(next, false);
      setDraft(structuredClone(next));
      setSaved(true);
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setPending(false);
    }
  };
  if (error && !data)
    return (
      <Loading onRetry={() => void mutate()}>{errorMessage(error)}</Loading>
    );
  if (isLoading || !draft) return <Loading />;
  const refreshFilter = async (id: string) => {
    setPending(true);
    setFailure("");
    try {
      const next = await refreshGatewayFilter(id);
      await mutate(next, false);
      setDraft(structuredClone(next));
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setPending(false);
    }
  };
  const config = draft;
  const change = (next: Config) => {
    setDraft(next);
    setSaved(false);
  };
  return (
    <MainContainer className="max-w-screen-xl">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{t("title")}</h1>
            <p className="mt-1 text-sm text-ui-secondary">{t("description")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              loading={pending}
              disabled={!dirty}
              onClick={() => void save()}
            >
              {t("saveActivate")}
            </Button>
            <Button
              variant="outline-secondary"
              disabled={!dirty || pending}
              onClick={() => {
                setDraft(structuredClone(data));
                setFailure("");
              }}
            >
              {t("discard")}
            </Button>
          </div>
        </div>
        {failure && (
          <p
            role="alert"
            className="rounded-ui-sm border border-ui-border p-3 text-sm text-ui-danger"
          >
            {failure}
          </p>
        )}
        {saved && (
          <p role="status" className="text-sm text-ui-secondary">
            {t("saved")}
          </p>
        )}
        <nav aria-label={t("title")} className="flex flex-wrap gap-2">
          {views.map((item) => (
            <Button
              key={item}
              size="sm"
              variant={view === item ? "primary" : "outline-secondary"}
              aria-pressed={view === item}
              onClick={() => setView(item)}
            >
              {t(item)}
            </Button>
          ))}
        </nav>
        <div className="min-w-0 rounded-ui border border-ui-border bg-ui-surface p-4 sm:p-6">
          {view === "gateways" && (
            <div className="space-y-4">
              <Button
                onClick={() =>
                  change({
                    ...config,
                    gateways: [...config.gateways, newGateway()],
                  })
                }
              >
                {t("addGateway")}
              </Button>
              {config.gateways.length === 0 && (
                <p className="text-sm text-ui-secondary">{t("empty")}</p>
              )}
              {config.gateways.map((item) => {
                const runtime = status?.gateways.find((g) => g.id === item.id);
                return (
                  <details
                    key={item.id}
                    className="rounded-ui-sm border border-ui-border p-4"
                    open={!item.name}
                  >
                    <summary className="cursor-pointer break-words font-medium">
                      {item.name || t("newGateway")} ·{" "}
                      {item.enabled ? t("enabled") : t("disabled")} ·{" "}
                      {item.listen || t("interception")} · {item.tlsMode} ·{" "}
                      {item.ruleIds.length} {t("rules")} ·{" "}
                      {runtime?.requests ?? 0} {t("requests")}
                    </summary>
                    <div className="space-y-4 pt-4">
                      <GatewayEditor
                        item={item}
                        config={config}
                        change={(next) =>
                          change({
                            ...config,
                            gateways: config.gateways.map((g) =>
                              g.id === item.id ? next : g,
                            ),
                          })
                        }
                      />
                      <Button
                        variant="outline-danger"
                        onClick={() =>
                          change({
                            ...config,
                            gateways: config.gateways.filter(
                              (g) => g.id !== item.id,
                            ),
                            interceptions: config.interceptions.filter(
                              (i) => i.gatewayId !== item.id,
                            ),
                          })
                        }
                      >
                        {t("delete")}
                      </Button>
                    </div>
                  </details>
                );
              })}
            </div>
          )}
          {view === "rules" && (
            <div className="space-y-4">
              <Button
                onClick={() =>
                  change({ ...config, rules: [...config.rules, newRule()] })
                }
              >
                {t("addRule")}
              </Button>
              {config.rules.map((item) => (
                <details
                  key={item.id}
                  className="rounded-ui-sm border border-ui-border p-4"
                  open={!item.name}
                >
                  <summary className="cursor-pointer font-medium">
                    {item.name || t("newRule")} · {item.priority} ·{" "}
                    {t(item.action.type)}
                  </summary>
                  <div className="space-y-4 pt-4">
                    <RuleEditor
                      item={item}
                      config={config}
                      change={(next) =>
                        change({
                          ...config,
                          rules: config.rules.map((r) =>
                            r.id === item.id ? next : r,
                          ),
                        })
                      }
                    />
                    <Button
                      variant="outline-danger"
                      onClick={() =>
                        change({
                          ...config,
                          rules: config.rules.filter((r) => r.id !== item.id),
                        })
                      }
                    >
                      {t("delete")}
                    </Button>
                  </div>
                </details>
              ))}
            </div>
          )}
          {view === "upstreams" && (
            <div className="space-y-4">
              <Button
                onClick={() =>
                  change({
                    ...config,
                    upstreams: [...config.upstreams, newUpstream()],
                  })
                }
              >
                {t("addUpstream")}
              </Button>
              {config.upstreams.map((item) => (
                <details
                  key={item.id}
                  className="rounded-ui-sm border border-ui-border p-4"
                  open={!item.name}
                >
                  <summary className="cursor-pointer font-medium">
                    {item.name || t("newUpstream")} · {item.backends.length}{" "}
                    {t("backends")}
                  </summary>
                  <div className="space-y-4 pt-4">
                    <UpstreamEditor
                      item={item}
                      change={(next) =>
                        change({
                          ...config,
                          upstreams: config.upstreams.map((u) =>
                            u.id === item.id ? next : u,
                          ),
                        })
                      }
                    />
                    <Button
                      variant="outline-danger"
                      onClick={() =>
                        change({
                          ...config,
                          upstreams: config.upstreams.filter(
                            (u) => u.id !== item.id,
                          ),
                        })
                      }
                    >
                      {t("delete")}
                    </Button>
                  </div>
                </details>
              ))}
            </div>
          )}
          {view === "interception" && (
            <div className="space-y-5">
              <p className="text-sm text-ui-secondary">
                {t("interceptionHelp")}
              </p>
              {inbounds?.items.map((inbound) => {
                const item = config.interceptions.find(
                  (i) => i.inboundId === inbound.id,
                ) ?? {
                  inboundId: inbound.id,
                  gatewayId: config.gateways[0]?.id ?? "",
                  mode: "off",
                  domains: [],
                  excludeDomains: [],
                  ports: [],
                  sources: [],
                  processes: [],
                  unknownTls: "passthrough",
                };
                return (
                  <details
                    key={inbound.id}
                    className="rounded-ui-sm border border-ui-border p-4"
                  >
                    <summary className="cursor-pointer font-medium">
                      {inbound.name} · {t(item.mode)}
                    </summary>
                    <div className="pt-4">
                      <InterceptionEditor
                        item={item}
                        config={config}
                        inboundName={inbound.name}
                        change={(next) =>
                          change({
                            ...config,
                            interceptions: [
                              ...config.interceptions.filter(
                                (i) => i.inboundId !== inbound.id,
                              ),
                              next,
                            ],
                          })
                        }
                      />
                    </div>
                  </details>
                );
              })}
            </div>
          )}
          {view === "filters" && (
            <div className="space-y-4">
              <Button
                disabled={config.gateways.length === 0}
                onClick={() =>
                  change({
                    ...config,
                    filterLists: [
                      ...config.filterLists,
                      {
                        id: createID(),
                        name: "",
                        revision: 0,
                        enabled: true,
                        gatewayId: config.gateways[0]?.id ?? "",
                        text: "||example.com/ads/*",
                      },
                    ],
                  })
                }
              >
                {t("addFilter")}
              </Button>
              {config.filterLists.map((item) => (
                <details
                  key={item.id}
                  className="rounded-ui-sm border border-ui-border p-4"
                  open={!item.name}
                >
                  <summary className="cursor-pointer font-medium">
                    {item.name || t("newFilter")}
                  </summary>
                  <div className="space-y-4 pt-4">
                    <FilterEditor
                      item={item}
                      config={config}
                      change={(next) =>
                        change({
                          ...config,
                          filterLists: config.filterLists.map((f) =>
                            f.id === item.id ? next : f,
                          ),
                        })
                      }
                    />
                    {item.url && (
                      <Button
                        variant="outline-secondary"
                        disabled={dirty || pending}
                        onClick={() => void refreshFilter(item.id)}
                      >
                        {t("refreshFilter")}
                      </Button>
                    )}
                    {status?.gateways
                      .flatMap((g) => g.filterReports ?? [])
                      .filter((report) => report.id === item.id)
                      .map((report) => (
                        <div key={report.id} className="space-y-1 text-sm">
                          <p>
                            {report.accepted} {t("acceptedRules")} ·{" "}
                            {report.rejected} {t("rejectedRules")}
                          </p>
                          {report.errors.map((error, index) => (
                            <p key={index} className="text-ui-danger">
                              {error}
                            </p>
                          ))}
                        </div>
                      ))}
                    <Button
                      variant="outline-danger"
                      onClick={() =>
                        change({
                          ...config,
                          filterLists: config.filterLists.filter(
                            (f) => f.id !== item.id,
                          ),
                        })
                      }
                    >
                      {t("delete")}
                    </Button>
                  </div>
                </details>
              ))}
            </div>
          )}
          {view === "authority" && <AuthorityPanel />}
          {view === "tester" && <RuleTester config={config} />}
          {view === "statistics" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t("statistics")}</h2>
              {statusError && (
                <p role="alert" className="text-ui-danger">
                  {errorMessage(statusError)}
                </p>
              )}
              {status?.gateways.map((gateway) => (
                <div
                  key={gateway.id}
                  className="space-y-3 rounded-ui-sm border border-ui-border p-4"
                >
                  <h3 className="font-medium">
                    {config.gateways.find((g) => g.id === gateway.id)?.name ||
                      gateway.id}
                  </h3>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    {(
                      [
                        "requests",
                        "blocked",
                        "forwarded",
                        "errors",
                        "tlsFailures",
                        "protocolFailures",
                      ] as const
                    ).map((key) => (
                      <div key={key}>
                        <dt className="text-ui-secondary">{t(key)}</dt>
                        <dd>{gateway[key]}</dd>
                      </div>
                    ))}
                    <div>
                      <dt>{t("averageDuration")}</dt>
                      <dd>
                        {gateway.requests
                          ? (
                              gateway.durationNs /
                              gateway.requests /
                              1e6
                            ).toFixed(2)
                          : "0"}{" "}
                        ms
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt>{t("outbound")}</dt>
                      <dd className="break-all">
                        {gateway.lastOutbound || "—"}
                      </dd>
                    </div>
                  </dl>
                  {gateway.upstreams.map((upstream) => (
                    <div key={upstream.id} className="space-y-1 text-sm">
                      <h4>
                        {config.upstreams.find((u) => u.id === upstream.id)
                          ?.name || upstream.id}
                      </h4>
                      {upstream.backends.map((backend, index) => (
                        <p key={index} className="break-all">
                          {backend.healthy ? "✓" : "✕"} {backend.url} ·{" "}
                          {backend.activeRequests} {t("activeRequests")} ·{" "}
                          {backend.failures} {t("errors")}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
              <a
                className="text-sm text-ui-primary underline"
                href="#/docs/connections/v2"
              >
                {t("connectionsLink")}
              </a>
            </div>
          )}
        </div>
      </div>
    </MainContainer>
  );
}
