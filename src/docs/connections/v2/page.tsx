import { useTranslation } from 'react-i18next';

import { closeConnections, getConnections } from "@/api/connections";
import { AuthenticatedEventSource } from "@/auth/event-stream";
import { Button } from "@/component/v2/button";
import { MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import { ConnectionRow, ConnectionTableHeader, MobileConnectionSort, connectionRowHeight, sortConnections, type SortBy, type SortOrder } from "./connection-table";
import type { Connection, Connections, Counter } from "@/contract/connection";
import { applyConnectionEvents, type ConnectionEvent } from "./connection-events";
import { usePageVisible } from "@/common/hooks";
import { Power, RefreshCw } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { VList } from "virtua";
import { NodeModal } from "../../node/modal";
import { ConnectionInfo, FlowContainer } from "../components";

const VIRTUALIZE_THRESHOLD = 40;



function Connections() {
    const { t: uiT } = useTranslation('ui');

    const visible = usePageVisible();
    const ctx = useContext(GlobalToastContext);
    const [connections, setConnections] = useState<Record<string, Connection>>({});
    const [selected, setSelected] = useState<Connection | undefined>();
    const [nodeModal, setNodeModal] = useState<{ show: boolean; id?: string }>({ show: false });
    const [sortBy, setSortBy] = useState<SortBy>("id");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [closing, setClosing] = useState(false);
    const [counters, setCounters] = useState<Record<string, Counter>>({});
    const [streamError, setStreamError] = useState("");
    const [streamNonce, setStreamNonce] = useState(0);
    const hasStreamSnapshot = useRef(false);
    const [hydrated, setHydrated] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const rowHeight = isMobile ? connectionRowHeight.mobile : connectionRowHeight.desktop;

    useEffect(() => {
        const media = window.matchMedia("(max-width: 767px)");
        const update = () => setIsMobile(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);

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

    const sortCounters = sortBy === "upload" || sortBy === "download" ? counters : undefined;
    const sorted = useMemo(() => sortConnections(Object.values(connections), sortBy, sortOrder, sortCounters), [connections, sortCounters, sortBy, sortOrder]);
    const changeSort = (field: SortBy) => {
        if (field === sortBy) setSortOrder(order => order === 'asc' ? 'desc' : 'asc');
        else setSortBy(field);
    };

    const handleClose = useCallback((id: string) => {
        setClosing(true);
        closeConnections([id])
            .then(() => {
                setSelected(undefined);
                setConnections(prev => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
            })
            .catch((err) => ctx.Error(`disconnect failed: ${err.msg ?? err}`))
            .finally(() => setClosing(false));
    }, [ctx]);

    // Keeps the sheet's height while it slides away after `selected` clears.
    const [detail, setDetail] = useState(selected);
    if (selected && selected !== detail) setDetail(selected);

    if (error) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
    if ((isLoading && !initial) || !hydrated) return <Loading />

    return (
        <MainContainer className="flex h-full min-h-0 min-w-0 flex-col">
            <NodeModal
                show={nodeModal.show}
                id={nodeModal.id}
                readOnly
                onHide={() => setNodeModal({ show: false })}
            />

            <div className="mb-3 flex shrink-0 items-center gap-2 md:gap-3">
                <h1 className="sr-only text-2xl font-semibold tracking-tight text-ui-heading lg:not-sr-only lg:mr-auto">{uiT("activeConnections")}</h1>
                <span className="flex shrink-0 items-baseline gap-1 text-xs text-ui-muted md:ml-auto"><span className="font-mono text-sm font-medium tabular-nums text-ui-heading">{sorted.length}</span>{uiT("active")}</span>
                <MobileConnectionSort sortBy={sortBy} sortOrder={sortOrder} onFieldChange={setSortBy} onOrderChange={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')} />
                <Button onClick={() => { setStreamError(""); setStreamNonce(value => value + 1); }} size="sm" className="shrink-0 max-md:min-h-11 max-md:min-w-11" variant="outline-secondary" aria-label={uiT("refreshConnections")}>
                    <RefreshCw size={14} /><span className="hidden md:inline">{uiT("refresh")}</span>
                </Button>
            </div>

            <FlowContainer onUpdate={setCounters} variant="summary" compact />

            {streamError && (
                <div className="mb-3 rounded-ui-lg border border-ui-warning/40 bg-ui-warning/10 px-4 py-3 text-sm text-ui-warning">
                    {streamError}
                </div>
            )}

            <section role="table" aria-label={uiT("activeConnections")} aria-rowcount={sorted.length + (isMobile ? 0 : 1)} className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-ui-lg border border-ui-border bg-ui-surface">
                <ConnectionTableHeader sortBy={sortBy} sortOrder={sortOrder} onSort={changeSort} />
                {sorted.length === 0 ? (
                    <div className="min-h-[220px] flex-1 p-6 text-center text-sm text-ui-muted">
                        {uiT("noActiveConnections")}</div>
                ) : sorted.length > VIRTUALIZE_THRESHOLD ? (
                    <div role="rowgroup" className="min-h-0 flex-1 overflow-hidden">
                        <VList
                            data={sorted}
                            itemSize={rowHeight}
                            bufferSize={rowHeight * 10}
                            style={{
                                height: "100%",
                                width: "100%",
                                scrollbarGutter: isMobile ? undefined : "stable",
                            }}
                        >
                            {(conn) => (
                                <ConnectionRow
                                    key={conn.id}
                                    conn={conn}
                                    counter={counters[conn.id]}
                                    onSelect={setSelected}
                                    animated={false}
                                />
                            )}
                        </VList>
                    </div>
                ) : (
                    <div role="rowgroup" className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto md:[scrollbar-gutter:stable]">
                        <AnimatePresence initial={false}>
                            {sorted.map(conn => (
                                <ConnectionRow
                                    key={conn.id}
                                    conn={conn}
                                    counter={counters[conn.id]}
                                    onSelect={setSelected}
                                    animated
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

            </section>

            <Modal open={selected !== undefined} onOpenChange={(open) => !open && setSelected(undefined)}>
                <ModalContent mobileSheet>
                    <ModalHeader closeButton>
                        <ModalTitle>{uiT("connectionDetails")}</ModalTitle>
                    </ModalHeader>
                    <ModalBody className="pt-2">
                        {detail && <ConnectionInfo value={detail} showNodeModal={(id) => setNodeModal({ show: true, id })} />}
                    </ModalBody>
                    <ModalFooter className="border-t-0 pt-0 pb-3 px-3">
                        {detail && (
                            <Button permission="connections:write"
                                variant="danger"
                                className="w-full py-2 flex items-center justify-center notranslate"
                                disabled={closing}
                                onClick={() => handleClose(detail.id)}
                            >
                                {closing ? <Spinner size="sm" className="mr-2" /> : <Power className="text-xl mr-2" />}
                                <span>{uiT("disconnect")}</span>
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </MainContainer>
    );
}

export default Connections;
