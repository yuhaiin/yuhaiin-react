import { SecretValues } from "@/component/secret-values";
import { PageHeader } from '@/component/v2/page-header';
import { ChartColumn } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import {
  getGatewayConfig, getGatewaySecrets, gatewayStatus, saveGatewayConfig, refreshGatewayFilter,
} from "@/api/gateway";
import { Button } from "@/component/v2/button";
import { MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import type { Config } from "@/contract/gateway";
import { errorMessage } from "@/contract/gateway";
import { useCloseGuard } from "@/hooks/use-editor-draft";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useHashSearch } from "@/hooks/useHashLocation";
import { GatewayWorkspace } from "./workspace";
import { AuthorityPanel, RuleTester } from "./tools";
import { httpRuleTesterQuery } from "./test-links";

type Tool = "tester" | "authority" | null;

export default function GatewayPage() {
  const { t } = useTranslation("gateway");
  const { data, error, isLoading, mutate } = useSWR(
    "/api/v2/gateway/config", getGatewayConfig, { revalidateOnFocus: false },
  );
  const { data: status } = useSWR(
    "/api/v2/gateway/status", gatewayStatus, { refreshInterval: 5000 },
  );
  const phone = useMediaQuery("(max-width: 639px)");
  // The Routing Test links here with `?tool=tester&gateway=&url=`.
  const link = httpRuleTesterQuery(useHashSearch());
  const [draft, setDraft] = useState<Config>();
  const [tool, setTool] = useState<Tool>(link.open ? "tester" : null);
  const tools = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState("");
  const [saved, setSaved] = useState(false);
  if (data && !draft) setDraft(structuredClone(data));
  const ready = Boolean(draft);
  // A linked tester sits below the workspace: bring it into view once it renders.
  useEffect(() => {
    if (link.open && ready) tools.current?.scrollIntoView?.({ block: "start" });
  }, [link.open, ready]);
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

  if (error && !data) return <Loading onRetry={() => void mutate()}>{errorMessage(error)}</Loading>;
  if (isLoading || !draft) return <Loading />;

  return (
    <MainContainer className="max-w-[1440px]">
      <div className="space-y-6">
        {/* Desktop keeps the actions in the header; phones show them only while there is
            something to save, in a bar pinned to the bottom (see the end of this block). */}
        <PageHeader title={t("title")} description={t("unifiedDescription")} actions={phone ? undefined : <>
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
        <div ref={tools} className="scroll-mt-4 rounded-ui border border-ui-border bg-ui-surface p-4 sm:p-6 space-y-4">
          <div className="flex flex-wrap gap-2" aria-label={t("diagnostics")}>
            {(["tester", "authority"] as const).map((item) => (
              <Button key={item} size="sm"
                variant={tool === item ? "primary" : "outline-secondary"}
                aria-pressed={tool === item}
                onClick={() => setTool(tool === item ? null : item)}>
                {t(item)}
              </Button>
            ))}
            <Button asChild size="sm" variant="outline-secondary">
              <a href="#/docs/gateway/statistics" className="gap-2">
                <ChartColumn size={16} aria-hidden="true" />{t("statistics")}
              </a>
            </Button>
          </div>
          {tool === "tester" && <RuleTester config={draft}
            initialGatewayId={link.open ? link.gatewayId : ""}
            initialURL={link.open ? link.url : ""} />}
          {tool === "authority" && <AuthorityPanel />}
        </div>
        {phone && (dirty || pending) && (
          <div className="ui-sticky-actions flex gap-2">
            <Button className="flex-1" variant="primary" loading={pending} disabled={!dirty}
              onClick={() => void save()}>{t("saveActivate")}</Button>
            <Button className="flex-1" variant="outline-secondary" disabled={!dirty || pending}
              onClick={() => { setDraft(structuredClone(data)); setFailure(""); }}>
              {t("discard")}
            </Button>
          </div>
        )}
      </div>
    </MainContainer>
  );
}
