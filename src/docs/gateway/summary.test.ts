import { describe, expect, it } from "vitest";
import { newAction, newUpstream } from "@/contract/gateway";
import { actionSummary, conditionSummary } from "./summary";

const t = (key: string) => key;

describe("gateway summaries", () => {
  it("summarizes nested conditions with explicit grouping", () => {
    expect(conditionSummary({
      all: [
        { field: "host", operator: "domain", values: ["example.com"] },
        { any: [{ field: "path", operator: "prefix", values: ["/a"] }, { field: "header", key: "X-Ad", operator: "present" }] },
      ],
    }, t)).toBe("Host domain example.com AND (Path prefix /a OR Header[X-Ad] present)");
  });

  it("flags a reverse proxy without a pool and names an assigned pool", () => {
    const pool = { ...newUpstream(), id: "p", name: "Pool A" };
    expect(actionSummary({ ...newAction("reverse_proxy") }, [pool], t)).toBe("reverse_proxy: noBackendPool");
    expect(actionSummary({ ...newAction("reverse_proxy"), upstream: "p" }, [pool], t)).toBe("reverse_proxy: Pool A");
  });
});
