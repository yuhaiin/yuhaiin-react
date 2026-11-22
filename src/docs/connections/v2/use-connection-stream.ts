import { getConnections } from "@/api/connections";
import { AuthenticatedEventSource } from "@/auth/event-stream";
import { usePageVisible } from "@/common/hooks";
import type { Connection, Connections } from "@/contract/connection";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { applyConnectionEvents, type ConnectionEvent } from "./connection-events";

export type StreamState = "connecting" | "live" | "reconnecting";

/**
 * Active connections from `/api/v2/connections/events`, with the HTTP list as
 * a fallback until the stream's first snapshot.
 *
 * The first `connections_added` event of every stream is a full snapshot and
 * replaces the state, so a reconnect restores it and drops connections that
 * closed while disconnected. Events are applied in batches (100 ms, or 1000
 * events) and duplicates keep the existing row identity. The stream closes
 * while the page is hidden and reconnects 2 s after an error. One stream per
 * hook instance.
 */
export function useConnectionStream() {
    const visible = usePageVisible();
    const [connections, setConnections] = useState<Record<string, Connection>>({});
    const [streamError, setStreamError] = useState("");
    const [state, setState] = useState<StreamState>("connecting");
    const [streamNonce, setStreamNonce] = useState(0);
    const [hydrated, setHydrated] = useState(false);
    const hasStreamSnapshot = useRef(false);

    const { data: initial, error, isLoading, mutate } = useSWR("/api/v2/connections", getConnections, {
        revalidateOnFocus: false,
    });

    useEffect(() => {
        // The HTTP response is only a fallback. Once the event stream has
        // delivered its initial snapshot, a late/revalidated HTTP response
        // may be stale and must not replace the live connection state.
        if (!initial || hasStreamSnapshot.current) return;
        setConnections(Object.fromEntries(initial.connections.map(conn => [conn.id, conn])));
        setHydrated(true);
    }, [initial]);

    useEffect(() => {
        if (!visible) return;
        hasStreamSnapshot.current = false;
        let stopped = false;
        let reconnectTimer: number | undefined;
        let flushTimer: number | undefined;
        let pending: ConnectionEvent[] = [];
        const flush = () => {
            if (flushTimer !== undefined) window.clearTimeout(flushTimer);
            flushTimer = undefined;
            if (stopped || !pending.length) return;
            const events = pending;
            pending = [];
            setConnections(previous => applyConnectionEvents(previous, events));
            setHydrated(true);
        };
        const queue = (event: ConnectionEvent) => {
            pending.push(event);
            if (pending.length >= 1000) flush();
            else if (flushTimer === undefined) flushTimer = window.setTimeout(flush, 100);
        };
        const source = new AuthenticatedEventSource("/api/v2/connections/events");
        source.onopen = () => { if (!stopped) setStreamError(""); };
        const onAdded = (event: MessageEvent<string>) => {
            if (stopped) return;
            try {
                const payload = JSON.parse(event.data) as Connections;
                if (!Array.isArray(payload.connections)) throw new Error("Invalid connection event");
                const snapshot = !hasStreamSnapshot.current;
                hasStreamSnapshot.current = true;
                if (snapshot) setState("live");
                queue({ type: snapshot ? 'snapshot' : 'added', connections: payload.connections });
            } catch { setStreamError("Invalid connection event. Refresh to reconnect."); }
        };
        const onRemoved = (event: MessageEvent<string>) => {
            if (stopped) return;
            try {
                const payload = JSON.parse(event.data) as { ids?: string[] };
                if (!Array.isArray(payload.ids)) throw new Error("Invalid removal event");
                queue({ type: 'removed', ids: payload.ids });
            } catch { setStreamError("Invalid connection event. Refresh to reconnect."); }
        };
        source.addEventListener("connections_added", onAdded);
        source.addEventListener("connections_removed", onRemoved);
        source.onerror = () => {
            if (stopped) return;
            setStreamError("Connection event stream disconnected. Reconnecting...");
            setState("reconnecting");
            source.close();
            reconnectTimer = window.setTimeout(() => {
                if (stopped) return;
                setStreamNonce((value) => value + 1);
            }, 2000);
        };
        return () => {
            stopped = true;
            source.close();
            if (flushTimer !== undefined) window.clearTimeout(flushTimer);
            if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
        };
    }, [streamNonce, visible]);

    const reconnect = useCallback(() => {
        setStreamError("");
        setStreamNonce(value => value + 1);
    }, []);

    /** Drops connections closed through the API before the stream reports them. */
    const removeLocally = useCallback((ids: string[]) => {
        setConnections(previous => applyConnectionEvents(previous, [{ type: 'removed', ids }]));
    }, []);

    return { connections, hydrated, initial, error, isLoading, mutate, streamError, state, reconnect, removeLocally };
}
