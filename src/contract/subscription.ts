import type { Go } from "@/api/generated-contracts";

export type Link = Go.subscription.Link;
export type LinkList = Go.subscription.LinkList;
export type ShareFeed = Go.subscription.ShareFeed;
export type ShareFeedList = Go.subscription.ShareFeedList;
export type ShareFeedEntry = Go.subscription.ShareFeedEntry;
export type ShareFeedPreview = Go.subscription.ShareFeedPreview;
export type ShareFeedEntryKind = "group" | "node";

export const shareFeedPath = "/share/";

export function defaultShareFeed(): ShareFeed {
  return { id: "", name: "", enabled: true, token: "", baseUrl: "", entries: [], createdAt: 0, updatedAt: 0, lastAccess: 0, accessCount: 0 };
}

export function normalizeLink(value: Partial<Link> | undefined): Link {
  return {
    name: value?.name ?? "",
    url: value?.url ?? "",
    type: value?.type || "reserve",
  };
}

export function normalizeShareFeed(value: Partial<ShareFeed> | undefined): ShareFeed {
  const base = defaultShareFeed();
  return {
    ...base,
    ...value,
    name: value?.name ?? "",
    token: value?.token ?? "",
    baseUrl: value?.baseUrl ?? "",
    entries: Array.isArray(value?.entries) ? value.entries.map(entry => ({ kind: entry.kind, value: entry.value })) : [],
  };
}

/** The editable part of a feed; the server owns the token and statistics. */
export function shareFeedDraft(feed: ShareFeed): Pick<ShareFeed, "id" | "name" | "enabled" | "baseUrl" | "entries"> {
  return { id: feed.id, name: feed.name, enabled: feed.enabled, baseUrl: feed.baseUrl, entries: feed.entries };
}

/** The subscription URL for a token, or "" for a feed without one. */
export function shareFeedURL(baseUrl: string, token: string): string {
  if (!token) return "";
  return baseUrl.replace(/\/+$/, "") + shareFeedPath + encodeURIComponent(token);
}
