import { requestJSON } from "@/api/client";
import type { Link, LinkList, ShareFeed, ShareFeedEntry, ShareFeedList, ShareFeedPreview } from "@/contract/subscription";
import { normalizeLink, normalizeShareFeed, shareFeedDraft } from "@/contract/subscription";

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

export const shareFeedsKey = "/api/v2/share-feeds";

export async function listShareFeeds(): Promise<ShareFeedList> {
  const data = await requestJSON<ShareFeedList>("GET", shareFeedsKey);
  return { items: (data.items ?? []).map(item => normalizeShareFeed(item)) };
}

export async function createShareFeed(feed: ShareFeed): Promise<ShareFeed> {
  return normalizeShareFeed(await requestJSON<ShareFeed>("POST", shareFeedsKey, shareFeedDraft(feed)));
}

export async function updateShareFeed(feed: ShareFeed): Promise<ShareFeed> {
  return normalizeShareFeed(await requestJSON<ShareFeed>("PUT", `${shareFeedsKey}/${encodeURIComponent(feed.id)}`, shareFeedDraft(feed)));
}

export async function deleteShareFeed(id: string): Promise<void> {
  await requestJSON<void>("DELETE", `${shareFeedsKey}/${encodeURIComponent(id)}`);
}

export async function rotateShareFeed(id: string): Promise<ShareFeed> {
  return normalizeShareFeed(await requestJSON<ShareFeed>("POST", `${shareFeedsKey}/${encodeURIComponent(id)}/rotate`));
}

export async function previewShareFeed(entries: ShareFeedEntry[], signal?: AbortSignal): Promise<ShareFeedPreview> {
  const data = await requestJSON<ShareFeedPreview>("POST", `${shareFeedsKey}/preview`, { entries }, undefined, signal);
  return { nodes: data.nodes ?? [], skipped: data.skipped ?? [], missing: data.missing ?? [] };
}

/** Reads one feed's token; it is masked in ordinary reads for managed sessions. */
export async function getShareFeedToken(id: string, signal?: AbortSignal): Promise<string> {
  const data = await requestJSON<ShareFeedList>("GET", shareFeedsKey, undefined, undefined, signal, { revealSecrets: true });
  const item = (data.items ?? []).find(item => item.id === id);
  if (!item) throw { code: 404, msg: "Share feed not found" };
  return item.token;
}

export async function getSubscriptionSecrets(name: string, signal?: AbortSignal): Promise<Link> {
 const data = await requestJSON<LinkList>("GET", "/api/v2/subscriptions", undefined, undefined, signal, { revealSecrets: true });
 const item = data.items.find(item => item.name === name);
 if (!item) throw { code: 404, msg: 'Subscription not found' };
 return normalizeLink(item);
}
