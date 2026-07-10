import type { Node } from "@/contract/node";

export type Link = {
  name: string;
  url: string;
  type: string;
};

export type LinkList = {
  items: Link[];
};

export type Publish = {
  name: string;
  points: string[];
  path: string;
  password: string;
  address: string;
  insecure: boolean;
};

export type PublishList = {
  items: Publish[];
};

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
