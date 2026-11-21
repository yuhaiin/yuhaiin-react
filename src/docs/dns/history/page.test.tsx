import "@/i18n";
import type { DNSHistoryRecord } from "@/api/dns-history";
import { authorizeTest, resetTestAuth } from "@/test/auth";
import { navigation } from "@/hooks/navigation";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { SWRConfig } from "swr";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import DNSHistoryPage from "./page";

const api = vi.hoisted(() => ({
    listDNSHistory: vi.fn(),
    getDNSHistoryRecord: vi.fn(),
    getDNSHistoryStats: vi.fn(),
    getDNSHistorySettings: vi.fn(),
    saveDNSHistorySettings: vi.fn(),
    clearDNSHistory: vi.fn(),
}));
vi.mock("@/api/dns-history", () => api);
vi.mock("@/api/inbounds", () => ({ listInbounds: vi.fn(async () => ({ items: [{ id: "tun", name: "TUN" }], page: { page: 1, pageSize: 200, total: 1 } })) }));
const confirm = vi.hoisted(() => ({ answer: true }));
vi.mock("@/component/v2/confirmation", () => ({ confirmAction: vi.fn(async () => confirm.answer) }));

function record(id: number, overrides: Partial<DNSHistoryRecord> = {}): DNSHistoryRecord {
    return {
        id, createdAt: new Date(Date.UTC(2026, 10, 21, 12, 0, id)).toISOString(), durationNs: 1_500_000, transport: "udp", sourceType: "dns_hijack",
        clientIp: "10.0.0.2", clientPort: 5353, inboundId: "tun", inboundName: "TUN", processName: "/usr/bin/curl",
        domain: `host${id}.example.com`, queryType: "A", queryClass: "IN", transactionId: 4660,
        resolver: "r1", resolverLabel: "Primary", server: "1.1.1.1:53", serverType: "udp", cacheStatus: "miss", resolutionSource: "upstream",
        fakeip: { requested: false, returned: false, reason: "disabled", allocation: "not_requested", force: false, global: false, skipCheck: false },
        outcome: "success", rcode: "NOERROR", requestSize: 40, responseSize: 56, sentBytes: 56, answerCount: 1, authorityCount: 0, additionalCount: 0,
        answerSummary: "203.0.113.1", ...overrides,
    } as DNSHistoryRecord;
}

const stats = { from: 0, to: 0, total: 120, success: 100, failed: 20, dropped: 3, timeout: 5, writeErrors: 1, fakeip: 40, cacheHits: 30, cacheMisses: 10, avgLatencyNs: 2_500_000,
    recorder: { enabled: true, queueLength: 0, queueCapacity: 4096, persisted: 120, recordsDropped: 7, persistenceErrors: 0, startedAt: "2026-11-21T00:00:00Z" } };

let root: Root, host: HTMLDivElement;
beforeEach(() => {
    vi.clearAllMocks();
    confirm.answer = true;
    authorizeTest();
    // 60 records: page 1 has 50, page 2 the rest.
    api.listDNSHistory.mockImplementation(async (_filter: unknown, page: number) => ({
        items: Array.from({ length: page === 2 ? 10 : 50 }, (_, index) => record(page === 2 ? 50 + index + 1 : index + 1)).reverse(),
        total: 60, limit: 50, page }));
    api.getDNSHistoryStats.mockResolvedValue(stats);
    api.getDNSHistorySettings.mockResolvedValue({ enabled: true, retentionHours: 72, maxRecords: 20000 });
    api.saveDNSHistorySettings.mockImplementation(async (value: unknown) => value);
    api.clearDNSHistory.mockResolvedValue({ deleted: 3 });
    api.getDNSHistoryRecord.mockImplementation(async (id: number) => record(id, {
        fakeip: { requested: true, returned: true, ipv4: "198.18.0.5", poolIpv4: "198.18.0.0/15", reason: "force_fakeip", allocation: "allocated", force: true, global: false, skipCheck: false },
        answer: [{ name: `host${id}.example.com`, type: "A", class: "IN", ttl: 40, data: "198.18.0.5" }, { name: `host${id}.example.com`, type: "TXT", class: "IN", ttl: 40, data: "\"v=spf1 -all\"" }],
        flags: { aa: false, tc: false, rd: true, ra: true, ad: false, cd: false, serverTruncated: false },
        details: { requestRd: true, requestCd: false, requestAd: false, requestDo: false, attempts: [
            { resolver: "Primary", transport: "udp", offsetNs: 0, durationNs: 3_000_000_000, result: "timeout", error: "i/o timeout" },
            { resolver: "Primary", transport: "udp+tc-retry", offsetNs: 3_000_000_000, durationNs: 25_000_000, result: "success", rcode: "NOERROR" }] },
    }));
    host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); resetTestAuth(); });

async function render() {
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><DNSHistoryPage /></SWRConfig>));
}
const text = () => document.body.textContent ?? "";
function button(label: string) {
    const found = [...document.querySelectorAll("button")].find(b => b.getAttribute("aria-label") === label || b.textContent?.trim() === label);
    if (!found) throw Error("Missing button " + label);
    return found;
}
async function click(label: string) { await act(async () => button(label).click()); }
function type(input: HTMLInputElement, value: string) {
    act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value); input.dispatchEvent(new Event("input", { bubbles: true })); });
}

it("shows the overview and the newest page from one list and one stats request", async () => {
    await render();
    expect(text()).toContain("host50.example.com");
    expect(text()).toContain("203.0.113.1");
    expect(text()).toContain("120");
    expect(text()).toContain("75%"); // 30 hits of 40 cache lookups
    expect(api.listDNSHistory).toHaveBeenCalledTimes(1);
    expect(api.getDNSHistoryStats).toHaveBeenCalledTimes(1);
    const [filter, page, limit] = api.listDNSHistory.mock.calls[0];
    expect(page).toBe(1);
    expect(limit).toBe(50);
    expect(Date.now() - filter.from).toBeGreaterThan(23 * 3600_000);
    expect(filter.to).toBeGreaterThanOrEqual(filter.from);
});

it("uses the shared numbered pagination over a fixed time window", async () => {
    await render();
    await click("2");
    const [first] = api.listDNSHistory.mock.calls[0];
    const [filter, page, limit] = api.listDNSHistory.mock.calls[api.listDNSHistory.mock.calls.length - 1];
    expect([page, limit]).toEqual([2, 50]);
    expect(filter.to).toBe(first.to);
    expect(text()).toContain("host60.example.com");
    await click("1");
    expect(text()).toContain("host50.example.com");
});

it("sends the search to the server and restarts at the first page", async () => {
    await render();
    await click("2");
    const input = host.querySelector<HTMLInputElement>("input[placeholder]")!;
    type(input, "Example");
    await act(async () => input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })));
    const [filter, page] = api.listDNSHistory.mock.calls[api.listDNSHistory.mock.calls.length - 1];
    expect(filter.query).toBe("example");
    expect(page).toBe(1);
});

it("applies filters from the filter panel", async () => {
    await render();
    await click("Filters (0 active)");
    const dialog = document.querySelector<HTMLElement>("[role=dialog]")!;
    const inputs = dialog.querySelectorAll<HTMLInputElement>("input:not([type=hidden])");
    type(inputs[0], "example.com");
    await act(async () => dialog.querySelector<HTMLButtonElement>("[role=switch]")!.click());
    await click("Apply");
    const [filter, page] = api.listDNSHistory.mock.calls[api.listDNSHistory.mock.calls.length - 1];
    expect(filter).toMatchObject({ domain: "example.com", fakeipOnly: true });
    expect(page).toBe(1);
    expect(button("Filters (2 active)")).toBeTruthy();
});

it("shows the detail with every record section, attempts and the FakeIP mapping link", async () => {
    await render();
    await click("DNS request details: host50.example.com");
    expect(api.getDNSHistoryRecord).toHaveBeenCalledWith(50);
    const dialog = document.querySelector<HTMLElement>("[role=dialog]")!;
    expect(dialog.textContent).toContain("Answer (2)");
    expect(dialog.textContent).toContain("\"v=spf1 -all\"");
    expect(dialog.textContent).toContain("FakeIP forced by the inbound");
    expect(dialog.textContent).toContain("Upstream attempts");
    expect(dialog.textContent).toContain("i/o timeout");
    expect(dialog.textContent).toContain("udp+tc-retry");
    await click("Open mapping 198.18.0.5");
    expect(navigation.current.location).toBe("/docs/bypass/resolver?tab=fakeip&fakeip=198.18.0.5");
});

it("shows empty, disabled and error states", async () => {
    api.listDNSHistory.mockResolvedValue({ items: [], total: 0, limit: 50 });
    api.getDNSHistorySettings.mockResolvedValue({ enabled: false, retentionHours: 72, maxRecords: 20000 });
    await render();
    expect(text()).toContain("DNS history recording is off");
    expect(text()).toContain("Recording is off, so no DNS requests are recorded.");
    act(() => root.unmount());
    root = createRoot(host);
    api.listDNSHistory.mockRejectedValue({ code: 500, msg: "history store unavailable" });
    await render();
    expect(text()).toContain("history store unavailable");
});

it("turns recording off and clears history only after confirmation", async () => {
    await render();
    await click("DNS history settings");
    const dialog = () => document.querySelector<HTMLElement>("[role=dialog]")!;
    expect(dialog().textContent).toContain("History records dropped");
    expect(dialog().textContent).toContain("7");
    await act(async () => dialog().querySelector<HTMLButtonElement>("[role=switch]")!.click());
    await click("Save");
    expect(api.saveDNSHistorySettings).toHaveBeenCalledWith({ enabled: false, retentionHours: 72, maxRecords: 20000 });

    await click("DNS history settings");
    confirm.answer = false;
    await click("Clear history");
    expect(api.clearDNSHistory).not.toHaveBeenCalled();
    confirm.answer = true;
    await click("Clear history");
    expect(api.clearDNSHistory).toHaveBeenCalledTimes(1);
});

it("rejects invalid retention before saving", async () => {
    await render();
    await click("DNS history settings");
    const input = document.querySelector<HTMLElement>("[role=dialog]")!.querySelector<HTMLInputElement>("input[type=number]")!;
    type(input, "0");
    expect(button("Save").disabled).toBe(true);
    expect(document.body.textContent).toContain("Enter 1 to 720 hours.");
});

it("keeps the mobile line readable without horizontal scrolling", async () => {
    await render();
    const row = document.querySelector<HTMLElement>("[role=row][class*=cursor-pointer]")!;
    const mobileLine = row.querySelector<HTMLElement>(".md\\:hidden")!;
    expect(mobileLine.textContent).toContain("TUN");
    expect(mobileLine.textContent).toContain("Success");
    expect(mobileLine.textContent).not.toContain("Primary");
    expect(row.className).toContain("min-w-0");
});

it("runs the page transition when the next page's rows arrive, not before", async () => {
    await render();
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    const original = api.listDNSHistory.getMockImplementation()!;
    api.listDNSHistory.mockImplementation(async (filter: unknown, page: number, limit: number) => { await pending; return original(filter, page, limit); });
    const before = document.querySelector("[role=table] > [role=rowgroup]:last-child");
    await click("2");
    // Still waiting: the previous rows stay and are not re-animated.
    expect(document.querySelector("[role=table] > [role=rowgroup]:last-child")).toBe(before);
    expect(text()).toContain("host50.example.com");
    await act(async () => { release(); await pending; });
    const after = document.querySelector("[role=table] > [role=rowgroup]:last-child");
    expect(after).not.toBe(before);
    expect(text()).toContain("host60.example.com");
});

it("sorts on the server from the column headers and restarts at page 1", async () => {
    await render();
    await click("2");
    await click("Domain");
    let [filter, page] = api.listDNSHistory.mock.calls[api.listDNSHistory.mock.calls.length - 1];
    expect(filter).toMatchObject({ sortBy: "domain", sortOrder: "asc" });
    expect(page).toBe(1);
    await click("Domain");
    [filter] = api.listDNSHistory.mock.calls[api.listDNSHistory.mock.calls.length - 1];
    expect(filter).toMatchObject({ sortBy: "domain", sortOrder: "desc" });
    await click("Latency");
    [filter] = api.listDNSHistory.mock.calls[api.listDNSHistory.mock.calls.length - 1];
    expect(filter).toMatchObject({ sortBy: "latency", sortOrder: "asc" });
    const header = [...document.querySelectorAll("[role=columnheader]")].find(cell => cell.textContent === "Latency")!;
    expect(header.getAttribute("aria-sort")).toBe("ascending");
});
