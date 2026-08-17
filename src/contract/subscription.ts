import type { Node } from "@/contract/node";
import type { Go } from "@/api/generated-contracts";

export type Link = Go.subscription.Link;
export type LinkList = Go.subscription.LinkList;
export type Publish = Go.subscription.Publish;
export type PublishList = Go.subscription.PublishList;

export type ResolvePublishResponse = {
  points: Node[];
};

export function defaultPublish(name = ""): Publish {
  return { name, points: [], path: "", password: "", address: "", insecure: false };
}

export function normalizeLink(value: Partial<Link> | undefined): Link {
  return {
    name: value?.name ?? "",
    url: value?.url ?? "",
    type: value?.type || "reserve",
  };
}

export function normalizePublish(value: Partial<Publish> | undefined): Publish {
  return {
    name: value?.name ?? "",
    points: Array.isArray(value?.points) ? value.points : [],
    path: value?.path ?? "",
    password: value?.password ?? "",
    address: value?.address ?? "",
    insecure: value?.insecure ?? false,
  };
}
