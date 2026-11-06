import type { Action, Condition, Gateway, Interception, Rule, Upstream } from "@/contract/gateway";

type Translate = (key: string, options?: Record<string, unknown>) => string;

// Short protocol-level labels read better than full field names in a one-line
// summary; the editor keeps the descriptive translated labels.
const fieldLabels: Record<string, string> = {
  host: "Host", path: "Path", url: "URL", method: "Method",
  query: "Query", header: "Header", inbound: "Inbound", process: "Process",
};

function conditionValues(condition: Condition): string[] {
  return [...(condition.values ?? []), ...(condition.value ? [condition.value] : [])]
    .map((value) => value.trim()).filter(Boolean);
}

export function conditionSummary(condition: Condition, t: Translate): string {
  if (condition.all?.length) return condition.all.map((item) => wrap(item, t)).join(" AND ");
  if (condition.any?.length) return condition.any.map((item) => wrap(item, t)).join(" OR ");
  if (condition.not) return `NOT ${wrap(condition.not, t)}`;
  const field = fieldLabels[condition.field ?? "path"] ?? condition.field ?? "";
  const subject = condition.key ? `${field}[${condition.key}]` : field;
  const operator = condition.operator ?? "exact";
  if (operator === "present") return `${subject} ${t("present")}`;
  const values = conditionValues(condition);
  if (!values.length) return t("conditionUnset");
  // Long value lists (e.g. ad-block URL sets) would swamp a one-line label.
  const shown = values.length > 1 ? `${values[0]} +${values.length - 1}` : values[0];
  return `${subject} ${t(operator)} ${shown}`;
}

function wrap(condition: Condition, t: Translate): string {
  const text = conditionSummary(condition, t);
  return condition.all?.length || condition.any?.length ? `(${text})` : text;
}

export function actionSummary(action: Action, pools: Upstream[], t: Translate): string {
  switch (action.type) {
    case "block":
    case "respond":
      return `${t(action.type)} ${action.status ?? ""}`.trim();
    case "redirect":
      return action.location ? `${t("redirect")} → ${action.location}` : t("redirect");
    case "reverse_proxy": {
      const pool = pools.find((item) => item.id === action.upstream);
      return `${t("reverse_proxy")}: ${pool ? pool.name || t("newUpstream") : t("noBackendPool")}`;
    }
    default:
      return t(action.type);
  }
}

export function ruleSummary(rule: Rule, pools: Upstream[], t: Translate): string {
  return `${conditionSummary(rule.match, t)} → ${actionSummary(rule.action, pools, t)}`;
}

export function entrySummary(gateway: Gateway, interception: Interception, t: Translate): string {
  const parts: string[] = [];
  if (gateway.listen) parts.push(t("entryListener", { address: gateway.listen }));
  if (interception.mode !== "off") {
    parts.push(`${t("interception")} · ${t(interception.mode)}`);
    if (interception.domains.length) parts.push(t("domainsCount", { count: interception.domains.length }));
  }
  return parts.join(" · ") || t("entryNone");
}

/** Rules are evaluated by ascending priority, then ID; show them that way. */
export function sortRulesByPriority(rules: Rule[]): Rule[] {
  return [...rules].sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
}

/** True when a reverse-proxy action still needs a backend pool. */
export function needsPool(action: Action): boolean {
  return action.type === "reverse_proxy" && !action.upstream;
}
