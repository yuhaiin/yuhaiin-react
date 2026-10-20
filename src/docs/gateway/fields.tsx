import { RouteTargetPicker } from "@/component/route-target-picker";
import { Button } from "@/component/v2/button";
import { Input, Textarea } from "@/component/v2/input";
import { Select } from "@/component/v2/select";
import Switch from "@/component/v2/switch";
import type { Action, Condition, Headers, Upstream } from "@/contract/gateway";
import { newAction } from "@/contract/gateway";
import type { RouteTarget } from "@/contract/route";
import { useId, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <div className="text-sm font-medium text-ui-secondary">{label}</div>
      {children}
    </div>
  );
}
export function TextField({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
}: {
  label: string;
  value?: string | number;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  const id = useId();
  return (
    <div className="min-w-0 space-y-1">
      <label className="text-sm font-medium text-ui-secondary" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <Textarea
          id={id}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}
export function Choice({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: string;
  values: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <Select
        ariaLabel={label}
        value={value}
        items={values}
        onValueChange={onChange}
      />
    </Field>
  );
}
export function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm">{label}</span>
      <Switch ariaLabel={label} checked={value} onCheckedChange={onChange} />
    </div>
  );
}
export function OutboundField({
  value,
  onChange,
}: {
  value: RouteTarget;
  onChange: (value: RouteTarget) => void;
}) {
  const { t } = useTranslation("gateway");
  const mode =
    value.type === "node" ||
    value.type === "selector" ||
    value.type === "default"
      ? "selected"
      : value.type || "inherit_route";
  return (
    <div className="space-y-2">
      <Choice
        label={t("outbound")}
        value={mode}
        onChange={(next) =>
          onChange({ type: next === "selected" ? "default" : next })
        }
        values={["inherit_route", "direct", "selected"].map((item) => ({
          value: item,
          label: t(item),
        }))}
      />
      {(mode === "selected" || value.type === "default") && (
        <RouteTargetPicker value={value} onChange={onChange} compact />
      )}
    </div>
  );
}
export function HeaderEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: Headers;
  onChange: (value: Headers) => void;
}) {
  const { t } = useTranslation("gateway");
  const signature = JSON.stringify(value ?? {});
  const fromValue = () => ({
    signature,
    rows: Object.entries(value ?? {}).flatMap(([key, values]) =>
      values.map((item) => ({ key, value: item })),
    ),
  });
  const [draft, setDraft] = useState(fromValue);
  if (draft.signature !== signature) setDraft(fromValue());
  const rows = draft.rows;
  const change = (next: typeof rows) => {
    const headers: Headers = {};
    for (const row of next)
      if (row.key.trim()) (headers[row.key.trim()] ??= []).push(row.value);
    setDraft({ rows: next, signature: JSON.stringify(headers) });
    onChange(headers);
  };
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      {rows.map((row, index) => (
        <div
          key={index}
          className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3"
        >
          <Input
            aria-label={`${label} ${t("key")} ${index + 1}`}
            value={row.key}
            onChange={(event) =>
              change(
                rows.map((item, n) =>
                  n === index ? { ...item, key: event.target.value } : item,
                ),
              )
            }
          />
          <Input
            aria-label={`${label} ${t("value")} ${index + 1}`}
            value={row.value}
            onChange={(event) =>
              change(
                rows.map((item, n) =>
                  n === index ? { ...item, value: event.target.value } : item,
                ),
              )
            }
          />
          <Button
            variant="outline-danger"
            onClick={() => change(rows.filter((_, n) => n !== index))}
          >
            {t("remove")}
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        variant="outline-secondary"
        onClick={() => change([...rows, { key: "", value: "" }])}
      >
        {t("addHeader")}
      </Button>
    </fieldset>
  );
}
const emptyCondition = (): Condition => ({
  field: "path",
  operator: "exact",
  values: [""],
});

// Keep the raw textarea draft while typing. Parsing it eagerly and rendering
// values.join("\n") back into the control used to swallow newlines and made
// multi-value conditions effectively impossible to edit.
function ConditionValuesEditor({
  value,
  onChange,
}: {
  value: Condition;
  onChange: (value: Condition) => void;
}) {
  const { t } = useTranslation("gateway");
  const canonical = (value.values ?? (value.value ? [value.value] : [])).join("\n");
  const [draft, setDraft] = useState({ canonical, text: canonical });
  if (draft.canonical !== canonical) {
    setDraft({ canonical, text: canonical });
  }
  return (
    <TextField
      label={t("valuesOnePerLine")}
      value={draft.text}
      multiline
      onChange={(text) => {
        const values = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
        setDraft({ canonical: values.join("\n"), text });
        onChange({ ...value, value: undefined, values });
      }}
    />
  );
}

export function ConditionEditor({
  value,
  onChange,
  depth = 0,
}: {
  value: Condition;
  onChange: (value: Condition) => void;
  depth?: number;
}) {
  const { t } = useTranslation("gateway");
  const kind = value.all
    ? "all"
    : value.any
      ? "any"
      : value.not
        ? "not"
        : "leaf";
  const children = value.all ?? value.any ?? (value.not ? [value.not] : []);
  const canUnwrap = children.length === 1 &&
    !children[0].all && !children[0].any && !children[0].not;
  const changeKind = (next: string) => {
    if (next === kind) return;
    if (next === "leaf") {
      if (canUnwrap) onChange(children[0]);
      return;
    }
    const preserved = kind === "leaf" ? [value] : children;
    if (next === "not") {
      // NOT has exactly one child. Do not silently discard additional ones.
      if (preserved.length === 1) onChange({ not: preserved[0] });
      return;
    }
    if (next === "all") onChange({ all: preserved.length ? preserved : [emptyCondition()] });
    if (next === "any") onChange({ any: preserved.length ? preserved : [emptyCondition()] });
  };
  const kinds = ["leaf", "all", "any", "not"].filter((next) =>
    next === kind ||
    (next === "leaf" ? canUnwrap : next === "not" ? kind === "leaf" || children.length === 1 : true),
  );
  return (
    <div className={depth === 0 ? "space-y-3" : "space-y-3 border-l border-ui-border/60 pl-3"}>
      {depth === 0 && (
        <h5 className="text-sm font-medium text-ui-heading">{t("condition")}</h5>
      )}
      <Choice
        label={t("combination")}
        value={kind}
        values={kinds.map((item) => ({ value: item, label: t(item) }))}
        onChange={changeKind}
      />
      {kind === "leaf" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Choice
            label={t("field")}
            value={value.field ?? "path"}
            values={["host", "path", "url", "method", "query", "header", "inbound", "process"].map(
              (item) => ({ value: item, label: t(item) }),
            )}
            onChange={(field) => onChange({ ...value, field })}
          />
          <Choice
            label={t("operator")}
            value={value.operator ?? "exact"}
            values={["exact", "prefix", "suffix", "domain", "regex", "present"].map(
              (item) => ({ value: item, label: t(item) }),
            )}
            onChange={(operator) => onChange({
              ...value,
              operator,
              ...(operator === "present" ? { values: undefined, value: undefined } : {}),
            })}
          />
          {(value.field === "query" || value.field === "header") && (
            <TextField
              label={t("key")}
              value={value.key}
              onChange={(key) => onChange({ ...value, key })}
            />
          )}
          {value.operator !== "present" && (
            <div className="sm:col-span-2">
              <ConditionValuesEditor value={value} onChange={onChange} />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {children.map((child, index) => (
            <div key={index} className="space-y-2">
              <ConditionEditor
                depth={depth + 1}
                value={child}
                onChange={(next) => onChange(
                  kind === "not" ? { not: next } : {
                    [kind]: children.map((item, i) => i === index ? next : item),
                  },
                )}
              />
              {kind !== "not" && children.length > 1 && (
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => onChange({ [kind]: children.filter((_, i) => i !== index) })}
                >
                  {t("remove")}
                </Button>
              )}
            </div>
          ))}
          {kind !== "not" && depth < 12 && (
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => onChange({ [kind]: [...children, emptyCondition()] })}
            >
              {t("addCondition")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function ActionEditor({
  value,
  upstreams,
  onChange,
}: {
  value: Action;
  upstreams: Upstream[];
  onChange: (value: Action) => void;
}) {
  const { t } = useTranslation("gateway");
  return (
    <div className="space-y-4">
      <Choice
        label={t("action")}
        value={value.type}
        values={[
          "forward",
          "reverse_proxy",
          "block",
          "redirect",
          "rewrite",
          "respond",
        ].map((item) => ({ value: item, label: t(item) }))}
        onChange={(type) => onChange(newAction(type))}
      />
      {value.type === "reverse_proxy" && (
        <>
          <Choice
            label={t("upstream")}
            value={value.upstream ?? ""}
            values={[
              { value: "", label: t("newBackendPool") },
              ...upstreams.map((item) => ({
                value: item.id,
                label: item.name || item.id,
              })),
            ]}
            onChange={(upstream) => onChange({ ...value, upstream })}
          />
          <Toggle
            label={t("preserveHost")}
            value={value.preserveHost}
            onChange={(preserveHost) => onChange({ ...value, preserveHost })}
          />
        </>
      )}
      {["block", "respond", "redirect"].includes(value.type) && (
        <TextField
          type="number"
          label={t("statusCode")}
          value={value.status}
          onChange={(status) => onChange({ ...value, status: Number(status) })}
        />
      )}
      {["block", "respond"].includes(value.type) && (
        <TextField
          multiline
          label={t("responseBody")}
          value={value.body}
          onChange={(body) => onChange({ ...value, body })}
        />
      )}
      {value.type === "redirect" && (
        <TextField
          label={t("location")}
          value={value.location}
          onChange={(location) => onChange({ ...value, location })}
        />
      )}
      {["forward", "reverse_proxy", "rewrite"].includes(value.type) && (
        <>
          <OutboundField
            value={value.outbound}
            onChange={(outbound) => onChange({ ...value, outbound })}
          />
          <details className="space-y-3">
            <summary className="cursor-pointer text-sm font-medium">
              {t("rewrite")}
            </summary>
            <div className="grid grid-cols-1 gap-3 pt-3 sm:grid-cols-2">
              {(["scheme", "host", "path"] as const).map((key) => (
                <TextField
                  key={key}
                  label={t(key)}
                  value={value.rewrite[key]}
                  onChange={(next) =>
                    onChange({
                      ...value,
                      rewrite: { ...value.rewrite, [key]: next },
                    })
                  }
                />
              ))}
              <Toggle
                label={t("overrideQuery")}
                value={value.rewrite.query !== undefined}
                onChange={(enabled) =>
                  onChange({
                    ...value,
                    rewrite: {
                      ...value.rewrite,
                      query: enabled ? "" : undefined,
                    },
                  })
                }
              />
              {value.rewrite.query !== undefined && (
                <TextField
                  label={t("rewriteQuery")}
                  value={value.rewrite.query}
                  onChange={(query) =>
                    onChange({
                      ...value,
                      rewrite: { ...value.rewrite, query },
                    })
                  }
                />
              )}
            </div>
            <HeaderEditor
              label={t("requestHeaders")}
              value={value.rewrite.headers}
              onChange={(headers) =>
                onChange({ ...value, rewrite: { ...value.rewrite, headers } })
              }
            />
          </details>
        </>
      )}
      <HeaderEditor
        label={t("responseHeaders")}
        value={value.responseHeaders}
        onChange={(responseHeaders) => onChange({ ...value, responseHeaders })}
      />
    </div>
  );
}
