"use client"

import { closeConnections, getConnections } from "@/api/connections";
import { AuthTokenKey, getApiUrl } from "@/common/apiurl";
import { Button } from "@/component/v2/button";
import { IconBadge, MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import type { Connection, Connections, Counter } from "@/contract/connection";
import { normalizeConnection } from "@/contract/connection";
import { ArrowDown, ArrowUp, Network, Power, ShieldCheck, Tag } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo, useCallback, useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { VList } from "virtua";
import { NodeModal } from "../../node/modal";
import { ConnectionInfo, FlowContainer, formatBytes, numberValue } from "../components";

type SortBy = "id" | "name" | "download" | "upload";
const VIRTUALIZE_THRESHOLD = 40;
const ROW_HEIGHT = 52;

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
        <MainContainer>
            <NodeModal
                show={nodeModal.show}
                id={nodeModal.id}
                readOnly
                onHide={() => setNodeModal({ show: false })}
            />

            <FlowContainer onUpdate={setCounters} />

            {streamError && (
                <div className="mb-3 rounded-ui-lg border border-ui-warning/40 bg-ui-warning/10 px-4 py-3 text-sm text-ui-warning">
                    {streamError}
                </div>
            )}

            <div className="flex justify-end mb-3">
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
                    <Button onClick={() => { setStreamError(""); void mutate(); setStreamNonce((value) => value + 1); }} size="sm">Refresh</Button>
                </div>
            </div>

            {sorted.length === 0 ? (
                <div className="p-6 mb-8 text-center text-ui-muted rounded-sidebar-radius border border-sidebar-border bg-sidebar-bg">
                    No active connections.
                </div>
            ) : sorted.length > VIRTUALIZE_THRESHOLD ? (
                <div className="mb-8 overflow-hidden rounded-sidebar-radius border border-sidebar-border bg-sidebar-bg shadow-xl">
                    <VList
                        data={sorted}
                        itemSize={ROW_HEIGHT}
                        bufferSize={ROW_HEIGHT * 10}
                        style={{
                            height: Math.min(
                                sorted.length * ROW_HEIGHT,
                                typeof window === "undefined" ? 720 : Math.min(window.innerHeight * 0.72, 900),
                            ),
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
                <div className="flex flex-col p-0 m-0 mb-8 overflow-hidden rounded-sidebar-radius border border-sidebar-border bg-sidebar-bg shadow-xl">
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
    // Keep everything in one dense row. Avoid 1fr/space-between — that creates a huge empty middle.
    const className = "flex min-h-[52px] items-center gap-2.5 border-b border-sidebar-border px-3.5 py-2 transition-colors duration-150 cursor-pointer hover:bg-sidebar-hover last:border-b-0";
    const handleClick = useCallback(() => onSelect(conn), [conn, onSelect]);

    const body = (
        <>
            <code className="w-[3.25rem] shrink-0 font-mono text-[11px] tabular-nums text-sidebar-color/75">
                {conn.id}
            </code>

            <span
                className="min-w-0 max-w-[min(42vw,28rem)] shrink truncate text-[0.9rem] font-medium leading-5 text-ui-heading"
                title={conn.addr}
            >
                {conn.addr}
            </span>

            <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-1.5">
                <IconBadge icon={ShieldCheck} text={conn.mode || "unknown"} />
                <IconBadge icon={Network} text={conn.network.connType || "unknown"} />
                {conn.tag && <IconBadge icon={Tag} text={conn.tag} />}
            </div>

            <FlowBadge download={download} upload={upload} />
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
        <div className="inline-flex shrink-0 items-center gap-2 text-[11px] font-semibold tabular-nums">
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
