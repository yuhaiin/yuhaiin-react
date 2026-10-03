import { useTranslation } from 'react-i18next';

import { closeConnections, getConnections } from "@/api/connections";
import { AuthTokenKey, getApiUrl } from "@/common/apiurl";
import { Button } from "@/component/v2/button";
import { MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import type { Connection, Connections, Counter } from "@/contract/connection";
import { applyConnectionEvents, type ConnectionEvent } from "./connection-events";
import { usePageVisible } from "@/common/hooks";
import { ArrowDown, ArrowUp, Network, Power, RefreshCw, ShieldCheck, Tag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { VList } from "virtua";
import { NodeModal } from "../../node/modal";
import { ConnectionBadge, ConnectionInfo, FlowContainer, formatBytes, numberValue } from "../components";

type SortBy = "id" | "name" | "download" | "upload";
const VIRTUALIZE_THRESHOLD = 40;
const ROW_HEIGHT = 52;
const MOBILE_ROW_HEIGHT = 80;

function eventsURL() {
    const apiUrl = getApiUrl();
    const base = apiUrl !== "" ? apiUrl : window.location.toString();
    const url = new URL(base);
    url.hash = "";
    url.pathname = "/api/v2/connections/events";
    const token = localStorage.getItem(AuthTokenKey);
    if (token) url.searchParams.set("token", token);
    return url.toString();
}

function Connections() {
    const { t: uiT } = useTranslation('ui');

    const visible = usePageVisible();
    const ctx = useContext(GlobalToastContext);
    const [connections, setConnections] = useState<Record<string, Connection>>({});
    const [selected, setSelected] = useState<Connection | undefined>();
    const [nodeModal, setNodeModal] = useState<{ show: boolean; id?: string }>({ show: false });
    const [sortBy, setSortBy] = useState<SortBy>("id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [closing, setClosing] = useState(false);
    const [counters, setCounters] = useState<Record<string, Counter>>({});
    const [streamError, setStreamError] = useState("");
    const [streamNonce, setStreamNonce] = useState(0);
    const hasStreamSnapshot = useRef(false);
    const [isMobile, setIsMobile] = useState(false);
    const rowHeight = isMobile ? MOBILE_ROW_HEIGHT : ROW_HEIGHT;

    useEffect(() => {
        const media = window.matchMedia("(max-width: 639px)");
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
        };
        const queue = (event: ConnectionEvent) => {
            pending.push(event);
            if (pending.length >= 1000) flush();
            else if (flushTimer === undefined) flushTimer = window.setTimeout(flush, 100);
        };
        const source = new EventSource(eventsURL());
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
    const sorted = useMemo(() => {
        const list = Object.values(connections);
        const dir = sortOrder === "asc" ? 1 : -1;
        return list.sort((a, b) => {
            if (sortBy === "name") return a.addr.localeCompare(b.addr) * dir;
            if (sortBy === "download") return (numberValue(sortCounters?.[a.id]?.download) - numberValue(sortCounters?.[b.id]?.download)) * dir;
            if (sortBy === "upload") return (numberValue(sortCounters?.[a.id]?.upload) - numberValue(sortCounters?.[b.id]?.upload)) * dir;
            return (numberValue(a.id) - numberValue(b.id)) * dir;
        });
    }, [connections, sortCounters, sortBy, sortOrder]);

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

    if (error) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
    if (isLoading && !initial) return <Loading />

    return (
        <MainContainer className="flex h-full min-h-0 min-w-0 flex-col">
            <NodeModal
                show={nodeModal.show}
                id={nodeModal.id}
                readOnly
                onHide={() => setNodeModal({ show: false })}
            />

            <div className="mb-3 flex items-end justify-between gap-3">
                <div className="min-w-0">
                    <h1 className="mt-1 truncate text-xl font-semibold leading-tight text-ui-heading sm:text-2xl">{uiT("activeConnections")}</h1>
                </div>
                <div className="flex shrink-0 items-baseline gap-2 rounded-full border border-ui-border bg-ui-surface-muted px-3 py-1.5">
                    <span className="font-mono text-base font-semibold tabular-nums text-ui-heading">{sorted.length}</span>
                    <span className="text-xs text-ui-muted">{uiT("active")}</span>
                </div>
            </div>

            <FlowContainer onUpdate={setCounters} variant="summary" />

            {streamError && (
                <div className="mb-3 rounded-ui-lg border border-ui-warning/40 bg-ui-warning/10 px-4 py-3 text-sm text-ui-warning">
                    {streamError}
                </div>
            )}

            <div className="mb-3 flex w-full flex-wrap items-center gap-2 rounded-ui-lg border border-ui-border bg-ui-surface-muted/50 px-2 py-2">
                <div className="flex min-w-0 basis-full items-center gap-2 sm:basis-auto">
                    <span className="hidden px-1 text-xs font-medium text-ui-muted sm:inline">{uiT("sort")}</span>
                    <div className="min-w-0 max-w-full overflow-x-auto pb-1 sm:pb-0">
                        <ToggleGroup noSlide className="flex-nowrap" type="single" value={sortBy} onValueChange={(v) => v && setSortBy(v as SortBy)}>
                            <ToggleItem value="id">{uiT("idLabel")}</ToggleItem>
                            <ToggleItem value="name">{uiT("name")}</ToggleItem>
                            <ToggleItem value="download">{uiT("download")}</ToggleItem>
                            <ToggleItem value="upload">{uiT("upload")}</ToggleItem>
                        </ToggleGroup>
                    </div>
                </div>
                <ToggleGroup noSlide className="shrink-0 flex-nowrap" type="single" value={sortOrder} onValueChange={(v) => v && setSortOrder(v as "asc" | "desc")}>
                    <ToggleItem value="asc"><span className="flex items-center gap-1 whitespace-nowrap"><ArrowUp size={14} /> {uiT("ascLabel")}</span></ToggleItem>
                    <ToggleItem value="desc"><span className="flex items-center gap-1 whitespace-nowrap"><ArrowDown size={14} /> {uiT("descLabel")}</span></ToggleItem>
                </ToggleGroup>
                <Button
                    onClick={() => { setStreamError(""); setStreamNonce((value) => value + 1); }}
                    size="sm"
                    variant="outline-secondary"
                    className="ml-auto shrink-0"
                    aria-label={uiT("refreshConnections")}
                >
                    <RefreshCw size={14} className="mr-1.5" />
                    {uiT("refresh")}</Button>
            </div>

            {sorted.length === 0 ? (
                <div className="min-h-[220px] flex-1 rounded-ui-lg border border-ui-border bg-ui-surface p-6 text-center text-ui-muted shadow-ui-card">
                    {uiT("noActiveConnections")}</div>
            ) : sorted.length > VIRTUALIZE_THRESHOLD ? (
                <div className="min-h-0 flex-1 overflow-hidden rounded-ui-lg border border-ui-border bg-ui-surface shadow-ui-card">
                    <VList
                        data={sorted}
                        itemSize={rowHeight}
                        bufferSize={ROW_HEIGHT * 10}
                        style={{
                            height: "100%",
                            width: "100%",
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
                <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto rounded-ui-lg border border-ui-border bg-ui-surface shadow-ui-card">
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

            <Modal open={selected !== undefined} onOpenChange={(open) => !open && setSelected(undefined)}>
                <ModalContent>
                    <ModalHeader closeButton>
                        <ModalTitle className="text-lg font-bold">{uiT("connectionDetails")}</ModalTitle>
                    </ModalHeader>
                    <ModalBody className="pt-2">
                        {selected && <ConnectionInfo value={selected} showNodeModal={(id) => setNodeModal({ show: true, id })} />}
                    </ModalBody>
                    <ModalFooter className="border-t-0 pt-0 pb-3 px-3">
                        {selected && (
                            <Button
                                variant="danger"
                                className="w-full py-2 flex items-center justify-center notranslate"
                                disabled={closing}
                                onClick={() => handleClose(selected.id)}
                            >
                                {closing ? <Spinner size="sm" className="mr-2" /> : <Power className="text-xl mr-2" />}
                                <span className="font-bold">{uiT("disconnect")}</span>
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </MainContainer>
    );
}

const ConnectionRow = memo(function ConnectionRow({
    conn,
    counter,
    onSelect,
    animated = true,
}: {
    conn: Connection;
    counter?: Counter;
    onSelect: (conn: Connection) => void;
    animated?: boolean;
}) {
    const download = formatBytes(numberValue(counter?.download));
    const upload = formatBytes(numberValue(counter?.upload));
    // Keep everything in one dense row. Avoid 1fr/space-between — that creates a huge empty middle.
    const className = "flex min-h-[52px] items-center gap-2.5 border-b border-ui-border/70 px-3.5 py-2 transition-colors duration-150 cursor-pointer hover:bg-ui-surface-muted last:border-b-0 max-sm:grid max-sm:min-h-[80px] max-sm:grid-cols-[3.25rem_minmax(0,1fr)] max-sm:gap-x-2 max-sm:gap-y-1 max-sm:py-2.5 sm:flex-nowrap";
    const handleClick = useCallback(() => onSelect(conn), [conn, onSelect]);

    const body = (
        <>
            <code className="w-[3.25rem] shrink-0 font-mono text-[11px] tabular-nums text-ui-muted max-sm:col-start-1 max-sm:row-start-1">
                {conn.id}
            </code>

            <span
                className="min-w-0 max-w-[min(42vw,28rem)] shrink truncate text-[0.9rem] font-medium leading-5 text-ui-heading max-sm:col-start-2 max-sm:row-start-1 max-sm:w-full max-sm:max-w-none"
                title={conn.addr}
            >
                {conn.addr}
            </span>

            <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-1.5 max-sm:col-span-2 max-sm:row-start-2 max-sm:flex-nowrap max-sm:overflow-x-auto">
                <ConnectionBadge icon={ShieldCheck} text={conn.mode || "unknown"} />
                <ConnectionBadge icon={Network} text={conn.network.connType || "unknown"} />
                {conn.tag && <ConnectionBadge icon={Tag} text={conn.tag} tone="neutral" />}
            </div>

            <FlowBadge download={download} upload={upload} />
        </>
    );

    if (!animated) {
        return (
            <button type="button" className={className + " w-full text-left"} onClick={handleClick}>
                {body}
            </button>
        );
    }

    return (
        <motion.button
            type="button"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={className + " w-full text-left"}
            onClick={handleClick}
        >
            {body}
        </motion.button>
    );
}, (prev, next) => (
    prev.conn === next.conn
    && prev.animated === next.animated
    && prev.onSelect === next.onSelect
    && numberValue(prev.counter?.download) === numberValue(next.counter?.download)
    && numberValue(prev.counter?.upload) === numberValue(next.counter?.upload)
));

const FlowBadge = memo(function FlowBadge({ download, upload }: { download: string; upload: string }) {
    return (
        <div className="inline-flex shrink-0 items-center gap-2 font-mono text-[11px] font-medium tabular-nums max-sm:col-span-2 max-sm:row-start-3 max-sm:justify-self-end">
            <span className="inline-flex items-center gap-0.5 text-ui-info">
                <ArrowDown size={11} />
                {download}
            </span>
            <span className="inline-flex items-center gap-0.5 text-ui-success">
                <ArrowUp size={11} />
                {upload}
            </span>
        </div>
    );
});

export default Connections;
