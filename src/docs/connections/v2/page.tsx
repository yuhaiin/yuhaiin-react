"use client"

import { closeConnections, getConnections } from "@/api/connections";
import { AuthTokenKey, getApiUrl } from "@/common/apiurl";
import { Button } from "@/component/v2/button";
import { MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { PageHeader } from "@/component/v2/page-header";
import { PageStatStrip } from "@/component/v2/page-patterns";
import { GlobalToastContext } from "@/component/v2/toast";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import type { Connection, Connections, Counter } from "@/contract/connection";
import { normalizeConnection } from "@/contract/connection";
import clsx from "clsx";
import { Activity, ArrowDown, ArrowDownWideNarrow, ArrowRight, ArrowUp, ChevronRight, Network, Power, Radio, ShieldCheck, Tag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { VList } from "virtua";
import { NodeModal } from "../../node/modal";
import { ConnectionInfo, FlowContainer, formatBytes, numberValue } from "../components";
import "./live.css";

type SortBy = "id" | "name" | "download" | "upload";
const VIRTUALIZE_THRESHOLD = 40;
const ROW_HEIGHT = 84;

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

    const { data: initial, error, isLoading, mutate } = useSWR("/api/v2/connections", getConnections, {
        revalidateOnFocus: false,
    });

    useEffect(() => {
        if (!initial) return;
        setConnections(Object.fromEntries(initial.connections.map(conn => [conn.id, conn])));
    }, [initial]);

    useEffect(() => {
        if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("mock")) {
            const timer = window.setInterval(() => { void mutate(); }, 3000);
            return () => window.clearInterval(timer);
        }

        let reconnectTimer: number | undefined;
        const source = new EventSource(eventsURL());
        source.onopen = () => setStreamError("");
        const onAdded = (event: MessageEvent<string>) => {
            const payload = JSON.parse(event.data) as Connections;
            setConnections(prev => {
                const next = { ...prev };
                for (const conn of payload.connections ?? []) {
                    const normalized = normalizeConnection(conn);
                    next[normalized.id] = normalized;
                }
                return next;
            });
        };
        const onRemoved = (event: MessageEvent<string>) => {
            const payload = JSON.parse(event.data) as { ids?: string[] };
            setConnections(prev => {
                const next = { ...prev };
                for (const id of payload.ids ?? []) delete next[id];
                return next;
            });
        };
        source.addEventListener("connections_added", onAdded);
        source.addEventListener("connections_removed", onRemoved);
        source.onerror = () => {
            setStreamError("Connection event stream disconnected. Reconnecting...");
            source.close();
            reconnectTimer = window.setTimeout(() => {
                void mutate();
                setStreamNonce((value) => value + 1);
            }, 2000);
        };
        return () => {
            source.close();
            if (reconnectTimer !== undefined) window.clearTimeout(reconnectTimer);
        };
    }, [mutate, streamNonce]);

    const sorted = useMemo(() => {
        const list = Object.values(connections);
        const dir = sortOrder === "asc" ? 1 : -1;
        return list.sort((a, b) => {
            if (sortBy === "name") return a.addr.localeCompare(b.addr) * dir;
            if (sortBy === "download") return (numberValue(counters[a.id]?.download) - numberValue(counters[b.id]?.download)) * dir;
            if (sortBy === "upload") return (numberValue(counters[a.id]?.upload) - numberValue(counters[b.id]?.upload)) * dir;
            return (numberValue(a.id) - numberValue(b.id)) * dir;
        });
    }, [connections, counters, sortBy, sortOrder]);

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

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading && !initial) return <Loading />

    return (
        <MainContainer className="product-page page-skin-traffic page-skin-live flex min-h-full min-w-0 flex-col">
            <NodeModal
                show={nodeModal.show}
                id={nodeModal.id}
                readOnly
                onHide={() => setNodeModal({ show: false })}
            />

            <PageHeader
                eyebrow="Traffic"
                title="Live connections"
                description="Watch active traffic, inspect the route it took, or disconnect a session."
                icon={Network}
                actions={<Button onClick={() => { setStreamError(""); void mutate(); setStreamNonce((value) => value + 1); }} size="sm">Refresh</Button>}
                className="mb-2"
            />

            <PageStatStrip className="ui-live-page-summary" stats={[
                { label: "Active", value: sorted.length, hint: "Current sessions", icon: Activity, tone: "success" },
                { label: "Live feed", value: streamError ? "Reconnecting" : "Connected", hint: "Event stream", icon: Radio, tone: streamError ? "warning" : "primary" },
                { label: "Sort", value: sortBy, hint: `${sortOrder} order`, icon: ArrowDownWideNarrow, tone: "violet" },
                { label: "Actions", value: "Inspect / close", hint: "Select any session", icon: ShieldCheck },
            ]} />

            <section className="ui-traffic-overview" aria-label="Traffic overview">
                <div className="ui-workspace-section-heading">
                    <div>
                        <div className="ui-section-label">Traffic overview</div>
                        <h2>Throughput now</h2>
                    </div>
                    <span>Live totals from the active controller</span>
                </div>
                <FlowContainer onUpdate={setCounters} />
            </section>

            {streamError && (
                <div className="mb-3 rounded-ui-lg border border-ui-warning/40 bg-ui-warning/10 px-4 py-3 text-sm text-ui-warning">
                    {streamError}
                </div>
            )}

            <div className="ui-live-list-toolbar mb-3">
                <div className="ui-live-list-count">
                    <span className="ui-live-list-pulse" />
                    <strong>{sorted.length}</strong>
                    <span>active sessions</span>
                    <small>{streamError ? "Reconnecting to live feed" : "Live feed"}</small>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <ToggleGroup className="flex-nowrap" type="single" value={sortOrder} onValueChange={(v) => v && setSortOrder(v as "asc" | "desc")}>
                        <ToggleItem value="asc"><div className="flex items-center gap-1 whitespace-nowrap"><ArrowUp size={16} /> Asc</div></ToggleItem>
                        <ToggleItem value="desc"><div className="flex items-center gap-1 whitespace-nowrap"><ArrowDown size={16} /> Desc</div></ToggleItem>
                    </ToggleGroup>
                    <ToggleGroup className="flex-nowrap" type="single" value={sortBy} onValueChange={(v) => v && setSortBy(v as SortBy)}>
                        <ToggleItem value="id">Id</ToggleItem>
                        <ToggleItem value="name">Name</ToggleItem>
                        <ToggleItem value="download">Download</ToggleItem>
                        <ToggleItem value="upload">Upload</ToggleItem>
                    </ToggleGroup>
                </div>
            </div>

            {sorted.length === 0 ? (
                <div className="ui-live-empty mb-0 flex min-h-0 flex-1 items-center justify-center rounded-ui-xl border border-ui-border bg-ui-surface p-6 text-center text-ui-muted">
                    No active connections.
                </div>
            ) : sorted.length > VIRTUALIZE_THRESHOLD ? (
                <div className="ui-live-session-list ui-traffic-session-list mb-0 h-[min(62vh,680px)] min-h-[320px] flex-none overflow-hidden rounded-ui-xl border border-ui-border bg-ui-surface shadow-ui-card">
                    <VList
                        data={sorted}
                        itemSize={ROW_HEIGHT}
                        bufferSize={ROW_HEIGHT * 10}
                        style={{ height: "100%", width: "100%" }}
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
                <div className="ui-live-session-list ui-traffic-session-list mb-0 h-[min(62vh,680px)] min-h-[320px] flex-none overflow-y-auto rounded-ui-xl border border-ui-border bg-ui-surface shadow-ui-card">
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
                        <ModalTitle className="text-lg font-bold">Connection Details</ModalTitle>
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
                                <span className="font-bold">Disconnect</span>
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
    const className = "ui-live-connection-row border-b border-ui-border last:border-b-0";
    const handleClick = useCallback(() => onSelect(conn), [conn, onSelect]);
    const mode = conn.mode || "unknown";
    const outbound = conn.nodeName || conn.outbound || "Direct";
    const inbound = conn.inboundName || conn.inbound || "Unknown inbound";
    const process = conn.process || "Unknown process";

    const body = (
        <>
            <div className="ui-live-connection-id">
                <span className="ui-live-connection-dot" />
                <code>#{conn.id}</code>
            </div>
            <div className="ui-live-connection-main">
                <div className="ui-live-connection-title-line">
                    <strong title={conn.addr}>{conn.addr || "Unknown destination"}</strong>
                    <span className={clsx("ui-live-chip", mode === "direct" ? "is-direct" : "is-proxy")}><ShieldCheck size={12} /> {mode}</span>
                    <span className="ui-live-chip"><Network size={12} /> {conn.network.connType || "unknown"}</span>
                    {conn.tag && <span className="ui-live-chip is-tag"><Tag size={12} /> {conn.tag}</span>}
                </div>
                <div className="ui-live-connection-path" title={`${inbound} → ${outbound}`}>
                    <span>{inbound}</span><ArrowRight size={13} /><span>{outbound}</span><i /> <span className="ui-live-connection-process">{process}</span>
                </div>
            </div>
            <FlowBadge download={download} upload={upload} />
            <ChevronRight className="ui-live-connection-chevron" size={18} />
        </>
    );

    if (!animated) {
        return (
            <div className={className} onClick={handleClick}>
                {body}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={className}
            onClick={handleClick}
        >
            {body}
        </motion.div>
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
        <div className="ui-live-connection-flow">
            <span className="is-download">
                <ArrowDown size={11} />
                {download}
            </span>
            <span className="is-upload">
                <ArrowUp size={11} />
                {upload}
            </span>
        </div>
    );
});

export default Connections;
