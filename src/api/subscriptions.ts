import { requestJSON } from "@/api/client";
import type { Link, LinkList, Publish, PublishList, ResolvePublishResponse } from "@/contract/subscription";
import { normalizeLink, normalizePublish } from "@/contract/subscription";

export async function listSubscriptions(): Promise<LinkList> {
  const data = await requestJSON<LinkList>("GET", "/api/v2/subscriptions");
  return { items: (data.items ?? []).map(item => normalizeLink(item)) };
}

export async function saveSubscriptions(items: Link[]): Promise<void> {
  await requestJSON<void>("PUT", "/api/v2/subscriptions", { items: items.map(item => normalizeLink(item)) });
}

export async function deleteSubscriptions(names: string[]): Promise<void> {
  await requestJSON<void>("DELETE", "/api/v2/subscriptions", { names });
}

export async function updateSubscriptions(names: string[]): Promise<void> {
  await requestJSON<void>("POST", "/api/v2/subscriptions/update", { names });
}

export async function listPublishes(): Promise<PublishList> {
  const data = await requestJSON<PublishList>("GET", "/api/v2/publishes");
  return { items: (data.items ?? []).map(item => normalizePublish(item)) };
}

export async function savePublish(publish: Publish): Promise<void> {
  const normalized = normalizePublish(publish);
  await requestJSON<void>("PUT", `/api/v2/publishes/${encodeURIComponent(normalized.name)}`, normalized);
}

export async function deletePublish(name: string): Promise<void> {
  await requestJSON<void>("DELETE", `/api/v2/publishes/${encodeURIComponent(name)}`);
}

export async function resolvePublish(name: string, password: string, path: string): Promise<ResolvePublishResponse> {
  const data = await requestJSON<ResolvePublishResponse>("POST", `/api/v2/publishes/${encodeURIComponent(name)}/resolve`, { name, password, path });
  return { points: (data.points ?? []) };
}
