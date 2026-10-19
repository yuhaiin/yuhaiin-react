import {
  generateGatewayCA,
  getGatewayCA,
  importGatewayCA,
  testGateway,
} from "@/api/gateway";
import type { Go } from "@/api/generated-contracts";
import { Button } from "@/component/v2/button";
import type { Config, Headers } from "@/contract/gateway";
import { errorMessage } from "@/contract/gateway";
import { Choice, HeaderEditor, TextField } from "./fields";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

export function RuleTester({ config }: { config: Config }) {
  const { t } = useTranslation("gateway");
  const [gatewayId, setGateway] = useState(config.gateways[0]?.id ?? "");
  const [url, setURL] = useState("https://example.com/ads/banner.js");
  const [method, setMethod] = useState("GET");
  const [inboundId, setInbound] = useState("");
  const [sourceIp, setSourceIP] = useState("");
  const [process, setProcess] = useState("");
  const [headers, setHeaders] = useState<Headers>({});
  const [result, setResult] = useState<Go.gateway.TestResult>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const run = async () => {
    setPending(true);
    setError("");
    setResult(undefined);
    try {
      setResult(
        await testGateway({
          gatewayId,
          url,
          method,
          inboundId,
          sourceIp,
          process,
          headers,
        }),
      );
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{t("tester")}</h2>
      <p className="text-sm text-ui-secondary">{t("testerHelp")}</p>
      <Choice
        label={t("gateway")}
        value={gatewayId}
        values={config.gateways.map((g) => ({
          value: g.id,
          label: g.name || g.id,
        }))}
        onChange={setGateway}
      />
      <TextField label={t("url")} value={url} onChange={setURL} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField label={t("method")} value={method} onChange={setMethod} />
        <TextField
          label={t("inbound")}
          value={inboundId}
          onChange={setInbound}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label={t("clientSourceIP")}
          value={sourceIp}
          onChange={setSourceIP}
        />
        <TextField label={t("process")} value={process} onChange={setProcess} />
      </div>
      <HeaderEditor
        label={t("requestHeaders")}
        value={headers}
        onChange={setHeaders}
      />
      <Button
        variant="primary"
        loading={pending}
        disabled={!gatewayId}
        onClick={() => void run()}
      >
        {t("runTest")}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-ui-danger">
          {error}
        </p>
      )}
      {result && (
        <div className="space-y-3 rounded-ui-sm border border-ui-border p-4">
          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <dt>{t("matchedRule")}</dt>
            <dd className="break-all">
              {config.rules.find((rule) => rule.id === result.ruleId)?.name ||
                result.ruleId ||
                t("defaultAction")}
            </dd>
            <dt>{t("action")}</dt>
            <dd>{t(result.action.type)}</dd>
            <dt>{t("upstream")}</dt>
            <dd>
              {config.upstreams.find(
                (upstream) => upstream.id === result.action.upstream,
              )?.name || "—"}
            </dd>
            <dt>{t("outbound")}</dt>
            <dd className="break-all">
              {t(result.action.outbound.type || "inherit_route")}{" "}
              {result.action.outbound.id}
            </dd>
            <dt>{t("requiresMitm")}</dt>
            <dd>{result.requiresMitm ? t("yes") : t("no")}</dd>
          </dl>
          <ol className="space-y-2 text-sm">
            {result.steps.map((step) => (
              <li key={step.ruleId}>
                {step.matched ? "✓" : "—"} {step.name || step.ruleId}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export function AuthorityPanel() {
  const { t } = useTranslation("gateway");
  const { data, error, mutate } = useSWR("/api/v2/gateway/ca", getGatewayCA);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [certificate, setCertificate] = useState<File>();
  const [key, setKey] = useState<File>();
  const change = async (importing: boolean) => {
    if (!data) return;
    setPending(true);
    setFailure("");
    try {
      const next =
        importing && certificate && key
          ? await importGatewayCA({
              revision: data.revision,
              certificatePem: await certificate.text(),
              privateKeyPem: await key.text(),
            })
          : await generateGatewayCA(data.revision);
      await mutate(next, false);
      setConfirm(false);
      setCertificate(undefined);
      setKey(undefined);
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      setPending(false);
    }
  };
  const download = () => {
    if (!data?.certificatePem) return;
    const url = URL.createObjectURL(
      new Blob([data.certificatePem], { type: "application/x-pem-file" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "yuhaiin-local-ca.pem";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">{t("authority")}</h2>
      <p
        role="note"
        className="rounded-ui-sm border border-ui-warning/20 bg-ui-warning-soft p-4 text-sm text-ui-warning"
      >
        {t("mitmWarning")}
      </p>
      {(failure || error) && (
        <p role="alert" className="text-sm text-ui-danger">
          {failure || errorMessage(error)}
        </p>
      )}
      {data && (
        <>
          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <dt>{t("status")}</dt>
            <dd>{data.present ? t("ready") : t("notGenerated")}</dd>
            <dt>{t("subject")}</dt>
            <dd>{data.subject || "—"}</dd>
            <dt>{t("fingerprint")}</dt>
            <dd className="break-all font-mono">{data.fingerprint || "—"}</dd>
            <dt>{t("validity")}</dt>
            <dd>
              {data.present
                ? `${new Date(data.notBefore).toLocaleDateString()} – ${new Date(data.notAfter).toLocaleDateString()}`
                : "—"}
            </dd>
            <dt>{t("cache")}</dt>
            <dd>
              {data.cachedCertificates} / {data.cacheCapacity}
            </dd>
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button disabled={!data.present} onClick={download}>
              {t("downloadCertificate")}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => setConfirm(true)}
            >
              {data.present ? t("rotateCA") : t("generateCA")}
            </Button>
          </div>
          {confirm && (
            <div className="space-y-3 rounded-ui-sm border border-ui-border p-4">
              <p className="text-sm">{t("rotationWarning")}</p>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  loading={pending}
                  onClick={() => void change(false)}
                >
                  {t("confirmCA")}
                </Button>
                <Button onClick={() => setConfirm(false)}>{t("cancel")}</Button>
              </div>
            </div>
          )}
          <details className="space-y-3">
            <summary className="cursor-pointer font-medium">
              {t("importCA")}
            </summary>
            <p className="pt-3 text-sm text-ui-secondary">{t("importHelp")}</p>
            <label className="block text-sm">
              {t("rootCertificate")}
              <input
                className="mt-1 block w-full"
                type="file"
                accept=".pem,.crt,.cer"
                onChange={(event) => setCertificate(event.target.files?.[0])}
              />
            </label>
            <label className="block text-sm">
              {t("privateKey")}
              <input
                className="mt-1 block w-full"
                type="file"
                accept=".pem,.key"
                onChange={(event) => setKey(event.target.files?.[0])}
              />
            </label>
            <Button
              variant="outline-danger"
              disabled={!certificate || !key}
              loading={pending}
              onClick={() => void change(true)}
            >
              {t("importCA")}
            </Button>
          </details>
        </>
      )}
      <details className="space-y-3">
        <summary className="cursor-pointer font-medium">
          {t("installation")}
        </summary>
        <p className="pt-3 text-sm">{t("installationHelp")}</p>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>{t("installWindows")}</li>
          <li>{t("installMac")}</li>
          <li>{t("installLinux")}</li>
          <li>{t("installMobile")}</li>
        </ul>
        <p className="text-sm text-ui-secondary">{t("protocolLimits")}</p>
      </details>
    </div>
  );
}
