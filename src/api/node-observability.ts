import { requestJSON } from "@/api/client";
import type { Go } from './generated-contracts';
import type { NodeLatencyResponse } from "@/contract/node";

export type OutboundState = "disabled" | "healthy" | "degraded" | "unknown";

export type OutboundProbe = {
    checkedAt: number;
    result: NodeLatencyResponse;
};

export type OutboundRuntimeStatus = {
    id: string;
    state: OutboundState;
    uploadBytes: string;
    downloadBytes: string;
    uploadBps: string;
    downloadBps: string;
    udpSentPackets: string;
    udpRecvPackets: string;
    tcpAttempts: string;
    tcpConnections: string;
    udpAttempts: string;
    udpSessions: string;
    pingAttempts: string;
    failures: string;
    activeTCP: number;
    activeUDP: number;
    lastSuccessAt: number;
    lastFailureAt: number;
    lastUsedAt: number;
    lastError?: string;
    probes?: Record<string, OutboundProbe>;
    tcpHealth?: Go.node.ChannelHealth;
    udpHealth?: Go.node.ChannelHealth;
    throughput?: Go.node.ThroughputMeasurement;
    uploadThroughput?: Go.node.ThroughputMeasurement;
    throughputHistory?: Go.node.ThroughputMeasurement[];
    protocol?: { state: string; lastError?: string; updatedAt: number };
};

/**
 * Retrieves status only for the currently visible page and selected node.
 * No inactive proxy gets initialized or probed by this request.
 */
export async function getNodeStatuses(ids: string[]): Promise<Record<string, OutboundRuntimeStatus>> {
    if (ids.length === 0) return {};
    const unique = [...new Set(ids)].slice(0, 100);
    const response = await requestJSON<{ items: OutboundRuntimeStatus[] }>(
        "POST", "/api/v2/nodes/status", { ids: unique },
    );
    return Object.fromEntries((response.items ?? []).map(status => [status.id, status]));
}
