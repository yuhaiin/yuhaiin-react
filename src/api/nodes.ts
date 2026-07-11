import { requestJSON } from "@/api/client";
import type { Go } from "@/api/generated-contracts";
import { LatencyDNSUrlDefault, LatencyHTTPUrlDefault, LatencyIPUrlDefault, LatencyStunTCPUrlDefault, LatencyStunUrlDefault, normalizeLatencyDNSUrl } from "@/common/apiurl";
import type { Node, NodeLatencyRequest, NodeLatencyResponse, NodeList } from "@/contract/node";
import { normalizeNode } from "@/contract/node";

export async function listNodes(query?: string | { page?: number; pageSize?: number; query?: string }): Promise<NodeList> {
  const params = typeof query === "string"
    ? { query }
    : {
      page: query?.page,
      page_size: query?.pageSize,
      query: query?.query,
    };
  const data = await requestJSON<{ items: Go.node.Node[]; page: NodeList["page"] }>("GET", "/api/v2/nodes", undefined, params);
  return {
    items: (data.items ?? []).map((item) => normalizeNode(item as unknown as Partial<Node>)),
    page: data.page ?? { page: 1, pageSize: 0, total: 0 },
  };
}

export async function getNode(id: string): Promise<Node> {
  return normalizeNode(await requestJSON<Go.node.Node>("GET", `/api/v2/nodes/${encodeURIComponent(id)}`) as unknown as Node);
}

export async function createNode(node: Node): Promise<Node> {
  return normalizeNode(await requestJSON<Go.node.Node>("POST", "/api/v2/nodes", normalizeNode(node)) as unknown as Node);
}

export async function saveNode(node: Node): Promise<Node> {
  const normalized = normalizeNode(node);
  return normalizeNode(await requestJSON<Go.node.Node>("PUT", `/api/v2/nodes/${encodeURIComponent(normalized.id)}`, normalized) as unknown as Node);
}

export async function deleteNode(id: string): Promise<void> {
  await requestJSON<void>("DELETE", `/api/v2/nodes/${encodeURIComponent(id)}`);
}

export async function selectedNodes(): Promise<{ tcp?: Node; udp?: Node }> {
  const data = await requestJSON<{ tcp?: Go.node.Node; udp?: Go.node.Node }>("GET", "/api/v2/nodes/selected");
  return {
    tcp: data.tcp ? normalizeNode(data.tcp as unknown as Partial<Node>) : undefined,
    udp: data.udp ? normalizeNode(data.udp as unknown as Partial<Node>) : undefined,
  };
}

export async function activeNodes(): Promise<{ items: Node[] }> {
  const data = await requestJSON<{ items?: Go.node.Node[] }>("GET", "/api/v2/nodes/active");
  return { items: (data.items ?? []).map(item => normalizeNode(item as unknown as Partial<Node>)) };
}

export async function useNode(id: string): Promise<void> {
  await requestJSON<void>("POST", `/api/v2/nodes/${encodeURIComponent(id)}/use`);
}

export async function closeNode(id: string): Promise<void> {
  await requestJSON<void>("POST", `/api/v2/nodes/${encodeURIComponent(id)}/close`);
}

export type NodeLatencyType = "tcp" | "udp" | "ip" | "stun" | "stun_tcp";

export type NodeLatencyOptions = {
  tcpURL?: string;
  udpHost?: string;
  ipURL?: string;
  stunHost?: string;
  stunTCPHost?: string;
  ipv6?: boolean;
};

export async function latencyNode(id: string, type: NodeLatencyType = "tcp", options: NodeLatencyOptions = {}): Promise<NodeLatencyResponse> {
  const body = createLatencyBody(type, options);
  return requestJSON<Go.node.LatencyResponse>("POST", `/api/v2/nodes/${encodeURIComponent(id)}/latency`, body) as Promise<NodeLatencyResponse>;
}

function createLatencyBody(type: NodeLatencyType, options: NodeLatencyOptions): NodeLatencyRequest {
  switch (type) {
    case "tcp":
      return { type, url: options.tcpURL || LatencyHTTPUrlDefault, ipv6: options.ipv6 ?? true };
    case "udp":
      return { type: "doq", host: normalizeLatencyDNSUrl(options.udpHost || LatencyDNSUrlDefault), targetDomain: "www.google.com", ipv6: options.ipv6 ?? true };
    case "ip":
      return { type, url: options.ipURL || LatencyIPUrlDefault, ipv6: options.ipv6 ?? true };
    case "stun":
      return { type, host: options.stunHost || LatencyStunUrlDefault, tcp: false, ipv6: options.ipv6 ?? true };
    case "stun_tcp":
      return { type, host: options.stunTCPHost || LatencyStunTCPUrlDefault, tcp: true, ipv6: options.ipv6 ?? true };
  }
}
