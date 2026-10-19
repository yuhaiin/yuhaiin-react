import { Button } from "@/component/v2/button";
import type {
  Config,
  Gateway,
  Rule,
  Upstream,
  Interception,
  FilterList,
} from "@/contract/gateway";
import { words } from "@/contract/gateway";
import {
  ActionEditor,
  Choice,
  ConditionEditor,
  Field,
  OutboundField,
  TextField,
  Toggle,
} from "./fields";
import { useTranslation } from "react-i18next";

export function GatewayEditor({
  item,
  config,
  change,
  minimal = false,
}: {
  item: Gateway;
  config: Config;
  change: (next: Gateway) => void;
  minimal?: boolean;
}) {
  const { t } = useTranslation("gateway");
  return (
    <div className="space-y-5">
      <TextField
        label={t("name")}
        value={item.name}
        onChange={(name) => change({ ...item, name })}
      />
      <Toggle
        label={t("enabled")}
        value={item.enabled}
        onChange={(enabled) => change({ ...item, enabled })}
      />
      <TextField
        label={t("listen")}
        value={item.listen}
        onChange={(listen) => change({ ...item, listen })}
      />
      <p className="text-sm text-ui-secondary">{t("listenHelp")}</p>
      <TextField
        label={t("allowedSources")}
        value={item.allowedSources.join(", ")}
        onChange={(value) => change({ ...item, allowedSources: words(value) })}
      />
      <Choice
        label={t("tlsMode")}
        value={item.tlsMode}
        values={["off", "termination"].map((value) => ({
          value,
          label: t(value),
        }))}
        onChange={(tlsMode) => change({ ...item, tlsMode })}
      />
      {item.tlsMode === "termination" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label={t("certificateFile")}
            value={item.certificateFile}
            onChange={(certificateFile) => change({ ...item, certificateFile })}
          />
          <TextField
            label={t("keyFile")}
            value={item.keyFile}
            onChange={(keyFile) => change({ ...item, keyFile })}
          />
        </div>
      )}
      <TextField
        type="number"
        label={t("maxBodyBytes")}
        value={item.maxBodyBytes}
        onChange={(value) => change({ ...item, maxBodyBytes: Number(value) })}
      />
      {!minimal && <Field label={t("rules")}>
        {config.rules.length === 0 && (
          <p className="text-sm text-ui-secondary">{t("createRulesFirst")}</p>
        )}
        <div className="space-y-2">
          {config.rules.map((rule) => (
            <Toggle
              key={rule.id}
              label={`${rule.name || rule.id} · ${rule.priority}`}
              value={item.ruleIds.includes(rule.id)}
              onChange={(checked) =>
                change({
                  ...item,
                  ruleIds: checked
                    ? [...item.ruleIds, rule.id]
                    : item.ruleIds.filter((id) => id !== rule.id),
                })
              }
            />
          ))}
        </div>
      </Field>}
      {!minimal && <Field label={t("defaultAction")}>
        <ActionEditor
          value={item.default}
          upstreams={config.upstreams}
          onChange={(action) => change({ ...item, default: action })}
        />
      </Field>}
    </div>
  );
}

export function RuleEditor({
  item,
  config,
  change,
}: {
  item: Rule;
  config: Config;
  change: (next: Rule) => void;
}) {
  const { t } = useTranslation("gateway");
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          label={t("name")}
          value={item.name}
          onChange={(name) => change({ ...item, name })}
        />
        <TextField
          type="number"
          label={t("priority")}
          value={item.priority}
          onChange={(value) => change({ ...item, priority: Number(value) })}
        />
      </div>
      <Toggle
        label={t("enabled")}
        value={item.enabled}
        onChange={(enabled) => change({ ...item, enabled })}
      />
      <p className="text-sm text-ui-secondary">{t("priorityHelp")}</p>
      <ConditionEditor
        value={item.match}
        onChange={(match) => change({ ...item, match })}
      />
      <div className="border-t border-ui-border/60 pt-4">
        <ActionEditor
          value={item.action}
          upstreams={config.upstreams}
          onChange={(action) => change({ ...item, action })}
        />
      </div>
    </div>
  );
}

export function UpstreamEditor({
  item,
  change,
}: {
  item: Upstream;
  change: (next: Upstream) => void;
}) {
  const { t } = useTranslation("gateway");
  const numbers = [
    "connectTimeoutMs",
    "idleTimeoutMs",
    "requestTimeoutMs",
    "maxConnections",
    "maxConcurrent",
    "requestsPerSecond",
    "burst",
    "healthIntervalMs",
    "failureThreshold",
    "recoveryMs",
    "retries",
  ] as const;
  return (
    <div className="space-y-5">
      <TextField
        label={t("name")}
        value={item.name}
        onChange={(name) => change({ ...item, name })}
      />
      <Choice
        label={t("balance")}
        value={item.balance}
        values={["round_robin", "weighted_round_robin", "least_requests"].map(
          (value) => ({ value, label: t(value) }),
        )}
        onChange={(balance) => change({ ...item, balance })}
      />
      <Field label={t("backends")}>
        <div className="space-y-3">
          {item.backends.map((backend, index) => (
            <div
              key={index}
              className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3"
            >
              <TextField
                label={`${t("url")} ${index + 1}`}
                value={backend.url}
                onChange={(url) =>
                  change({
                    ...item,
                    backends: item.backends.map((b, n) =>
                      n === index ? { ...b, url } : b,
                    ),
                  })
                }
              />
              <TextField
                type="number"
                label={t("weight")}
                value={backend.weight}
                onChange={(value) =>
                  change({
                    ...item,
                    backends: item.backends.map((b, n) =>
                      n === index ? { ...b, weight: Number(value) } : b,
                    ),
                  })
                }
              />
              <Button
                variant="outline-danger"
                disabled={item.backends.length === 1}
                onClick={() =>
                  change({
                    ...item,
                    backends: item.backends.filter((_, n) => n !== index),
                  })
                }
              >
                {t("remove")}
              </Button>
            </div>
          ))}
          <Button
            variant="outline-secondary"
            onClick={() =>
              change({
                ...item,
                backends: [...item.backends, { url: "", weight: 1 }],
              })
            }
          >
            {t("addBackend")}
          </Button>
        </div>
      </Field>
      <OutboundField
        value={item.outbound}
        onChange={(outbound) => change({ ...item, outbound })}
      />
      <TextField
        label={t("serverName")}
        value={item.serverName}
        onChange={(serverName) => change({ ...item, serverName })}
      />
      <TextField
        multiline
        label={t("trustPem")}
        value={item.trustPem}
        onChange={(trustPem) => change({ ...item, trustPem })}
      />
      <TextField
        label={t("healthPath")}
        value={item.healthPath}
        onChange={(healthPath) => change({ ...item, healthPath })}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {numbers.map((key) => (
          <TextField
            key={key}
            type="number"
            label={t(key)}
            value={item[key]}
            onChange={(value) => change({ ...item, [key]: Number(value) })}
          />
        ))}
      </div>
    </div>
  );
}

export function InterceptionEditor({ item, change }: {
  item: Interception;
  change: (next: Interception) => void;
}) {
  const { t } = useTranslation("gateway");
  return (
    <div className="space-y-4">
      <Choice
        label={t("interceptionMode")}
        value={item.mode}
        values={["off", "http_only", "tls_passthrough", "https_mitm"].map(
          (value) => ({ value, label: t(value) }),
        )}
        onChange={(mode) => change({ ...item, mode })}
      />
      {item.mode === "https_mitm" && (
        <p
          role="note"
          className="rounded-ui-sm border border-ui-warning/20 bg-ui-warning-soft p-3 text-sm text-ui-warning"
        >
          {t("mitmWarning")}
        </p>
      )}
      <TextField
        label={t("domains")}
        value={item.domains.join(", ")}
        onChange={(value) => change({ ...item, domains: words(value) })}
      />
      <TextField
        label={t("excludeDomains")}
        value={item.excludeDomains.join(", ")}
        onChange={(value) => change({ ...item, excludeDomains: words(value) })}
      />
      <TextField
        label={t("ports")}
        value={item.ports.join(", ")}
        onChange={(value) =>
          change({ ...item, ports: words(value).map(Number) })
        }
      />
      <TextField
        label={t("allowedSources")}
        value={item.sources.join(", ")}
        onChange={(value) => change({ ...item, sources: words(value) })}
      />
      <TextField
        label={t("processes")}
        value={item.processes.join(", ")}
        onChange={(value) => change({ ...item, processes: words(value) })}
      />
      <Choice
        label={t("unknownTls")}
        value={item.unknownTls || "passthrough"}
        values={["passthrough", "reject"].map((value) => ({
          value,
          label: t(value),
        }))}
        onChange={(unknownTls) => change({ ...item, unknownTls })}
      />
      <p className="text-sm text-ui-secondary">{t("protocolLimits")}</p>
    </div>
  );
}

export function FilterEditor({
  item,
  config,
  change,
  hideGateway = false,
}: {
  item: FilterList;
  config: Config;
  change: (next: FilterList) => void;
  hideGateway?: boolean;
}) {
  const { t } = useTranslation("gateway");
  return (
    <div className="space-y-4">
      <TextField
        label={t("name")}
        value={item.name}
        onChange={(name) => change({ ...item, name })}
      />
      <Toggle
        label={t("enabled")}
        value={item.enabled}
        onChange={(enabled) => change({ ...item, enabled })}
      />
      {!hideGateway && <Choice
        label={t("gateway")}
        value={item.gatewayId}
        values={config.gateways.map((g) => ({
          value: g.id,
          label: g.name || g.id,
        }))}
        onChange={(gatewayId) => change({ ...item, gatewayId })}
      />}
      <TextField
        label={t("sourceUrl")}
        value={item.url}
        onChange={(url) => change({ ...item, url })}
      />
      <TextField
        multiline
        label={t("filterText")}
        value={item.text}
        onChange={(text) => change({ ...item, text })}
      />
      <p className="text-sm text-ui-secondary">{t("filterHelp")}</p>
    </div>
  );
}
