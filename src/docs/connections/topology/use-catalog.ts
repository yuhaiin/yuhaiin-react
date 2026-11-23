import { listInbounds, listInboundStatuses } from "@/api/inbounds";
import { activeNodes, getNode } from "@/api/nodes";
import { getNodeStatuses } from "@/api/node-observability";
import { usePermission } from "@/auth/context";
import type { Node } from "@/contract/node";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import type { InboundInfo, OutboundInfo, TopologyCatalog } from "./model";

const options = { revalidateOnFocus: false, shouldRetryOnError: false, keepPreviousData: true };

function outboundInfo(node: Node): OutboundInfo {
    return { id: node.id, name: node.name, protocols: node.chain.map(protocol => protocol.type) };
}

/**
 * Configuration and runtime state that names and classifies topology nodes:
 * inbound names, protocols and listener state; outbound node names, chain
 * protocols (to tell VPN tunnels from proxies) and health. Every request is
 * optional: a session without the permission, or a failed request, leaves
 * the topology on the names recorded in the connections themselves.
 *
 * Nodes referenced by connections but not instantiated are fetched once
 * each, by id, and cached for the page's lifetime.
 */
export function useTopologyCatalog(connectionNodeIds: string[], live: boolean): TopologyCatalog {
    const canInbounds = usePermission("inbounds:read");
    const canNodes = usePermission("nodes:read");
    const interval = live ? 15_000 : 0;

    const { data: inbounds } = useSWR(canInbounds ? "topology:inbounds" : null, () => listInbounds({ page: 1, pageSize: 200 }), { ...options, refreshInterval: interval * 2 });
    const { data: inboundStatuses } = useSWR(canInbounds ? "topology:inbound-status" : null, listInboundStatuses, { ...options, refreshInterval: interval });
    const { data: active } = useSWR(canNodes ? "topology:active-nodes" : null, activeNodes, { ...options, refreshInterval: interval });

    const [fetched, setFetched] = useState<Map<string, OutboundInfo>>(() => new Map());
    const requested = useRef(new Set<string>());
    const unmounted = useRef(new AbortController());
    const knownKey = active?.items.map(node => node.id).join(",") ?? "";
    const wanted = connectionNodeIds.join(",");

    useEffect(() => {
        // Created here, not at first render, so a StrictMode remount gets a live controller.
        const controller = new AbortController();
        unmounted.current = controller;
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!canNodes) return;
        const known = new Set(knownKey.split(","));
        const missing = wanted.split(",").filter(id => id && !known.has(id) && !requested.current.has(id)).slice(0, 20);
        if (missing.length === 0) return;
        for (const id of missing) requested.current.add(id);
        const signal = unmounted.current.signal;
        void Promise.allSettled(missing.map(id => getNode(id, signal))).then(results => {
            if (signal.aborted) return;
            setFetched(previous => {
                const next = new Map(previous);
                for (const result of results) if (result.status === "fulfilled" && result.value.id) next.set(result.value.id, outboundInfo(result.value));
                return next;
            });
        });
    }, [canNodes, knownKey, wanted]);

    const statusIds = useMemo(() => {
        const ids = new Set([...(active?.items.map(node => node.id) ?? []), ...connectionNodeIds.filter(Boolean)]);
        return [...ids].sort().slice(0, 100);
    }, [active, connectionNodeIds]);
    const { data: nodeStatus } = useSWR(canNodes && statusIds.length ? ["topology:node-status", statusIds.join(",")] : null,
        () => getNodeStatuses(statusIds), { ...options, refreshInterval: interval });

    return useMemo<TopologyCatalog>(() => {
        const inboundMap = new Map<string, InboundInfo>();
        const statusById = new Map(inboundStatuses?.map(status => [status.id, status.status]));
        for (const inbound of inbounds?.items ?? []) {
            inboundMap.set(inbound.id, { id: inbound.id, name: inbound.name, protocol: inbound.protocol.type, enabled: inbound.enabled, status: statusById.get(inbound.id) });
        }
        const nodes = new Map(fetched);
        for (const node of active?.items ?? []) nodes.set(node.id, outboundInfo(node));
        return {
            inbounds: inboundMap,
            nodes,
            nodeStatus: new Map(Object.entries(nodeStatus ?? {}).map(([id, status]) => [id, status.state])),
            activeNodes: active?.items.map(node => node.id) ?? [],
        };
    }, [inbounds, inboundStatuses, active, fetched, nodeStatus]);
}
