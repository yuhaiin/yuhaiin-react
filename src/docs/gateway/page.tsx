import { SecretValues } from "@/component/secret-values";
import { PageHeader } from '@/component/v2/page-header';
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import {
  getGatewayConfig, getGatewaySecrets, gatewayStatus, saveGatewayConfig, refreshGatewayFilter, resetGatewayStatistics,
} from "@/api/gateway";
import { Button } from "@/component/v2/button";
import { MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import type { Config } from "@/contract/gateway";
import { errorMessage } from "@/contract/gateway";
import { useCloseGuard } from "@/hooks/use-editor-draft";
import { GatewayWorkspace } from "./workspace";
import { AuthorityPanel, RuleTester } from "./tools";

type Tool = "tester" | "authority" | "statistics" | null;

export default function GatewayPage() {
  const { t } = useTranslation("gateway");
  const { data, error, isLoading, mutate } = useSWR(
    "/api/v2/gateway/config", getGatewayConfig, { revalidateOnFocus: false },
  );
  const { data: status, error: statusError, mutate: mutateStatus } = useSWR(
    "/api/v2/gateway/status", gatewayStatus, { refreshInterval: 5000 },
  );
  const [draft, setDraft] = useState<Config>();
  const [tool, setTool] = useState<Tool>(null);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState("");
  const [saved, setSaved] = useState(false);
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [resetPending, setResetPending] = useState(false);
  if (data && !draft) setDraft(structuredClone(data));
  const dirty = Boolean(data && draft && JSON.stringify(data) !== JSON.stringify(draft));
  useCloseGuard(dirty, pending, () => undefined);

  const change = (next: Config) => {
    setDraft(next);
    setSaved(false);
  };

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

  const refreshFilter = async (id: string) => {
    if (dirty || pending) return;
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

  const resetStatistics = async () => {
    if (resetTarget === null || resetPending || pending) return;
    setResetPending(true);
    setFailure("");
    try {
      await resetGatewayStatistics(resetTarget);
      await mutateStatus();
      setResetTarget(null);
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setResetPending(false);
    }
  };

  if (error && !data) return <Loading onRetry={() => void mutate()}>{errorMessage(error)}</Loading>;
  if (isLoading || !draft) return <Loading />;

  return (
    <MainContainer className="max-w-screen-xl">
      <div className="space-y-6">
        <PageHeader title={t("title")} description={t("unifiedDescription")} actions={<>
            <Button variant="primary" loading={pending} disabled={!dirty}
              onClick={() => void save()}>{t("saveActivate")}</Button>
            <Button variant="outline-secondary" disabled={!dirty || pending}
              onClick={() => { setDraft(structuredClone(data)); setFailure(""); }}>
              {t("discard")}
            </Button>
        </>} />
        {(failure || status?.startupError) && <p role="alert"
          className="rounded-ui-sm border border-ui-border p-3 text-sm text-ui-danger">
          {failure || status?.startupError}
        </p>}
        {saved && <p role="status" className="text-sm text-ui-secondary">{t("saved")}</p>}
        <SecretValues value={draft} load={getGatewaySecrets}><GatewayWorkspace config={draft} onChange={change}
          status={status?.gateways ?? []}
          canRefreshFilter={!dirty && !pending}
          refreshFilter={(id) => void refreshFilter(id)} /></SecretValues>
        <div className="rounded-ui border border-ui-border bg-ui-surface p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-2" aria-label={t("diagnostics")}>
            {(["tester", "statistics", "authority"] as const).map((item) => (
              <Button key={item} size="sm"
                variant={tool === item ? "primary" : "outline-secondary"}
                aria-pressed={tool === item}
                onClick={() => setTool(tool === item ? null : item)}>
                {t(item)}
              </Button>
            ))}
          </div>
          {tool === "tester" && <RuleTester config={draft} />}
          {tool === "authority" && <AuthorityPanel />}
          {tool === "statistics" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{t("statistics")}</h2>
                <Button permission="gateway:write" size="sm" variant="outline-secondary" disabled={pending || resetPending || !status?.gateways.length}
                  onClick={() => setResetTarget("")}>{t("resetAllStatistics")}</Button>
              </div>
              {resetTarget !== null && (
                <div className="flex flex-wrap items-center gap-3 rounded-ui-sm border border-ui-border p-3 text-sm"
                  role="group" aria-label={t("confirmResetStatistics")}>
                  <p className="flex-1">{resetTarget === "" ? t("resetAllStatisticsWarning") : t("resetStatisticsWarning")}</p>
                  <Button size="sm" variant="primary" loading={resetPending} disabled={pending}
                    onClick={() => void resetStatistics()}>{t("confirmResetStatistics")}</Button>
                  <Button size="sm" variant="outline-secondary" disabled={resetPending}
                    onClick={() => setResetTarget(null)}>{t("cancel")}</Button>
                </div>
              )}
              {statusError && <p role="alert" className="text-ui-danger">{errorMessage(statusError)}</p>}
              {status?.gateways.map((gateway) => (
                <div key={gateway.id} className="space-y-3 rounded-ui-sm border border-ui-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium">
                      {draft.gateways.find((g) => g.id === gateway.id)?.name || gateway.id}
                    </h3>
                    <Button permission="gateway:write" size="sm" variant="outline-secondary" disabled={pending || resetPending}
                      onClick={() => setResetTarget(gateway.id)}>{t("resetStatistics")}</Button>
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    {(["requests", "blocked", "forwarded", "errors", "tlsFailures", "protocolFailures"] as const)
                      .map((key) => (
                        <div key={key}><dt className="text-ui-secondary">{t(key)}</dt><dd>{gateway[key]}</dd></div>
                      ))}
                    <div><dt>{t("averageDuration")}</dt>
                      <dd>{gateway.requests ? (gateway.durationNs / gateway.requests / 1e6).toFixed(2) : "0"} ms</dd>
                    </div>
                    <div><dt>{t("outbound")}</dt><dd className="break-all">{gateway.lastOutbound || "—"}</dd></div>
                  </dl>
                  {gateway.upstreams.map((upstream) => (
                    <div key={upstream.id} className="space-y-1 text-sm">
                      <h4>{draft.upstreams.find((u) => u.id === upstream.id)?.name || upstream.id}</h4>
                      {upstream.backends.map((backend, index) => <p key={index} className="break-all">
                        {backend.healthy ? "✓" : "✕"} {backend.url} · {backend.activeRequests} {t("activeRequests")} · {backend.failures} {t("errors")}
                      </p>)}
                    </div>
                  ))}
                </div>
              ))}
              <a className="text-sm text-ui-primary underline" href="#/docs/connections/v2">
                {t("connectionsLink")}
              </a>
            </div>
          )}
        </div>
      </div>
    </MainContainer>
  );
}
