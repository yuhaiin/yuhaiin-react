import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Condition } from "@/contract/gateway";
import { ConditionEditor } from "./fields";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@/component/route-target-picker", () => ({
  RouteTargetPicker: () => null,
}));

let host: HTMLDivElement;
let root: Root;
let current: Condition;

function Harness({ initial }: { initial: Condition }) {
  const [value, setValue] = useState(initial);
  return <ConditionEditor value={value} onChange={(next) => {
    current = next;
    setValue(next);
  }} />;
}

beforeEach(() => {
  current = {};
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
});
function render(initial: Condition) {
  current = initial;
  act(() => root.render(<Harness initial={initial} />));
}
function textareas() {
  return [...host.querySelectorAll<HTMLTextAreaElement>("textarea")];
}
function edit(element: HTMLTextAreaElement, value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
function addCondition() {
  const button = [...host.querySelectorAll<HTMLButtonElement>("button")]
    .find((element) => element.textContent?.trim() === "addCondition");
  if (!button) throw new Error("addCondition missing");
  act(() => button.click());
}

it("edits multiple values and does not eat trailing newlines", () => {
  render({ field: "path", operator: "prefix", values: ["/api", "/admin"] });
  expect(textareas()[0].value).toBe("/api\n/admin");
  edit(textareas()[0], "/api\n/admin\n");
  expect(textareas()[0].value).toBe("/api\n/admin\n");
  expect(current.values).toEqual(["/api", "/admin"]);
  edit(textareas()[0], "/api\n/admin\n/private");
  expect(textareas()[0].value).toBe("/api\n/admin\n/private");
  expect(current.values).toEqual(["/api", "/admin", "/private"]);
});

it("shows same-field alternatives separately and Add creates a new leaf", () => {
  render({ any: [
    { field: "path", operator: "exact", values: ["/a", "/b"] },
    { field: "path", operator: "exact", values: ["/c"] },
  ] });
  expect(textareas()).toHaveLength(2);
  addCondition();
  expect(current.any).toHaveLength(3);
  expect(textareas()).toHaveLength(3);
  edit(textareas()[2], "/new\n/other");
  expect(current.any?.[0].values).toEqual(["/a", "/b"]);
  expect(current.any?.[1].values).toEqual(["/c"]);
  expect(current.any?.[2].values).toEqual(["/new", "/other"]);
});

it("migrates a legacy single value when edited", () => {
  render({ field: "host", operator: "domain", value: "example.com" });
  expect(textareas()[0].value).toBe("example.com");
  edit(textareas()[0], "example.com\nexample.org");
  expect(current.value).toBeUndefined();
  expect(current.values).toEqual(["example.com", "example.org"]);
});

it("preserves existing children when adding more values to a group", () => {
  render({ all: [
    { field: "host", values: ["a.test", "b.test"] },
    { field: "path", operator: "prefix", values: ["/api"] },
  ] });
  addCondition();
  expect(current.all).toHaveLength(3);
  expect(current.all?.[0].values).toEqual(["a.test", "b.test"]);
  expect(current.all?.[1].values).toEqual(["/api"]);
});
