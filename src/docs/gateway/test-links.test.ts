import { describe, expect, it } from "vitest";
import {
  httpRuleTesterHref, httpRuleTesterQuery, routingTarget, routingTestHref, routingTestQuery, testURL,
} from "./test-links";

describe("test links", () => {
  it("routes a URL's host, keeping an explicit port", () => {
    expect(routingTarget("https://example.com/ads/banner.js")).toBe("example.com");
    expect(routingTarget("http://example.com:8080/x")).toBe("example.com:8080");
    expect(routingTarget(" example.com ")).toBe("example.com");
    expect(routingTestHref("https://example.com/a")).toBe("#/docs/bypass/test?q=example.com");
    expect(routingTestHref("")).toBe("#/docs/bypass/test");
    expect(routingTestQuery("q=example.com%3A443")).toBe("example.com:443");
    expect(routingTestQuery("")).toBe("");
  });

  it("turns a routing input into a tester URL", () => {
    expect(testURL("example.com")).toBe("https://example.com/");
    expect(testURL("example.com:8443")).toBe("https://example.com:8443/");
    expect(testURL("http://example.com/x")).toBe("http://example.com/x");
    expect(testURL("")).toBe("");
  });

  it("round-trips the HTTP rule tester link", () => {
    const href = httpRuleTesterHref("spotify", "ads.example.com");
    expect(href.startsWith("#/docs/gateway?")).toBe(true);
    expect(httpRuleTesterQuery(href.slice(href.indexOf("?") + 1))).toEqual({
      open: true, gatewayId: "spotify", url: "https://ads.example.com/",
    });
    expect(httpRuleTesterQuery("").open).toBe(false);
  });
});
