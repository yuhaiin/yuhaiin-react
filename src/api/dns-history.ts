import { requestJSON } from "@/api/client";
import type { Go } from "@/api/generated-contracts";

export type DNSHistoryRecord = Go.dnshistory.Record;
export type DNSHistoryList = Go.dnshistory.ListResponse;
export type DNSHistoryStats = Go.dnshistory.Stats;
export type DNSHistorySettings = Go.dnshistory.Settings;
export type DNSResourceRecord = Go.dnshistory.ResourceRecord;
export type DNSHistoryAttempt = Go.dnshistory.Attempt;

/** Server-side filters; empty values are omitted so they match everything. */
export type DNSHistoryFilter = {
  domain?: string;
  query?: string;
  queryType?: string;
  transport?: string;
  sourceType?: string;
  inboundId?: string;
  process?: string;
  resolver?: string;
  server?: string;
  outcome?: string;
  rcode?: string;
  fakeipOnly?: boolean;
  /** Unix milliseconds. */
  from?: number;
  to?: number;
  /** time (default), domain, type, result or latency; ties stay newest first. */
  sortBy?: "time" | "domain" | "type" | "result" | "latency";
  sortOrder?: "asc" | "desc";
};

function compact(filter: DNSHistoryFilter): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(filter)) {
    if (value === undefined || value === "" || value === false || value === 0) continue;
    out[key] = typeof value === "string" ? value.trim() : value;
  }
  return out;
}

/** `page` is 1-based; keep `filter.to` fixed while paging one view. */
export function listDNSHistory(filter: DNSHistoryFilter, page: number, limit: number, signal?: AbortSignal): Promise<DNSHistoryList> {
  return requestJSON<DNSHistoryList>("GET", "/api/v2/dns/history", undefined, { ...compact(filter), page, limit }, signal).then(result => ({ ...result, items: result.items ?? [] }));
}

export function getDNSHistoryRecord(id: number, signal?: AbortSignal): Promise<DNSHistoryRecord> {
  // The id goes in the body as a number; path parameters are strings.
  return requestJSON<DNSHistoryRecord>("GET", `/api/v2/dns/history/${id}`, { id }, undefined, signal);
}

export function getDNSHistoryStats(from: number, to?: number, signal?: AbortSignal): Promise<DNSHistoryStats> {
  return requestJSON<DNSHistoryStats>("GET", "/api/v2/dns/history/stats", undefined, { from, to }, signal);
}

export function clearDNSHistory(): Promise<Go.dnshistory.ClearResponse> {
  return requestJSON("DELETE", "/api/v2/dns/history");
}

export function getDNSHistorySettings(): Promise<DNSHistorySettings> {
  return requestJSON("GET", "/api/v2/dns/history/settings");
}

export function saveDNSHistorySettings(settings: DNSHistorySettings): Promise<DNSHistorySettings> {
  return requestJSON("PUT", "/api/v2/dns/history/settings", settings);
}
