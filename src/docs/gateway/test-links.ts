// Deep links between the Routing Test (/docs/bypass/test) and the Gateway's
// HTTP rule tester, so a result in one can be checked in the other.

const ROUTING_TEST = "/docs/bypass/test";
const GATEWAY = "/docs/gateway";

/** Host of a URL, or the input itself when it does not parse as one. */
export function routingTarget(url: string): string {
  const value = url.trim();
  try {
    return new URL(value).host || value;
  } catch {
    return value;
  }
}

/** Routing Test link that runs `url`'s host straight away. */
export function routingTestHref(url: string): string {
  const target = routingTarget(url);
  return `#${ROUTING_TEST}${target ? `?${new URLSearchParams({ q: target })}` : ""}`;
}

/** Routing Test input carried by `?q=`, if any. */
export function routingTestQuery(search: string): string {
  return new URLSearchParams(search).get("q")?.trim() ?? "";
}

/** A Routing Test input ("host", "host:port", or a URL) as a URL for the HTTP rule tester. */
export function testURL(target: string): string {
  const value = target.trim();
  if (!value || /^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return value;
  return `https://${value}/`;
}

/** Gateway page link that opens the HTTP rule tester for `gatewayId` and `target`. */
export function httpRuleTesterHref(gatewayId: string, target: string): string {
  const query = new URLSearchParams({ tool: "tester", gateway: gatewayId });
  const url = testURL(target);
  if (url) query.set("url", url);
  return `#${GATEWAY}?${query}`;
}

export interface TesterLink {
  open: boolean;
  gatewayId: string;
  url: string;
}

/** HTTP rule tester state carried by the Gateway page's query. */
export function httpRuleTesterQuery(search: string): TesterLink {
  const query = new URLSearchParams(search);
  return {
    open: query.get("tool") === "tester",
    gatewayId: query.get("gateway") ?? "",
    url: query.get("url") ?? "",
  };
}
