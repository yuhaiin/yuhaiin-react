import { useTranslation } from 'react-i18next';

import { closeConnections } from "@/api/connections";
import { Button } from "@/component/v2/button";
import { MainContainer } from "@/component/v2/card";
import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import { ConnectionRow, ConnectionTableHeader, MobileConnectionSort, connectionRowHeight, sortConnections, type SortBy, type SortOrder } from "./connection-table";
import type { Connection, Counter } from "@/contract/connection";
import { useConnectionStream } from "./use-connection-stream";
import { Power, RefreshCw, X } from "lucide-react";
import { useCountryNames } from "@/common/country-names";
import { CountryFlag } from "@/component/country-flag";
import { navigation, useNavigationSnapshot } from "@/hooks/navigation";
import { AnimatePresence } from "motion/react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { VList } from "virtua";
import { NodeModal } from "../../node/modal";
import { ConnectionInfo, FlowContainer } from "../components";

const VIRTUALIZE_THRESHOLD = 40;



/** `?geo=JP` or `?outboundGeo=US`, linked from the Connections statistics map. */
function useCountryFilter() {
    const { location } = useNavigationSnapshot();
    const query = new URLSearchParams(location.split('?')[1] ?? '');
    for (const key of ['geo', 'outboundGeo'] as const) {
        const value = query.get(key)?.trim().toUpperCase();
        if (value) return { key, value };
    }
    return undefined;
}

function Connections() {
    const { t: uiT } = useTranslation('ui');
    const { t: statsT } = useTranslation('connectionStats');
    const countryNames = useCountryNames();
    const countryFilter = useCountryFilter();

    const ctx = useContext(GlobalToastContext);
    const { connections, hydrated, initial, error, isLoading, mutate, streamError, reconnect, removeLocally } = useConnectionStream();
    const [selected, setSelected] = useState<Connection | undefined>();
    const [nodeModal, setNodeModal] = useState<{ show: boolean; id?: string }>({ show: false });
    const [sortBy, setSortBy] = useState<SortBy>("id");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [closing, setClosing] = useState(false);
    const [counters, setCounters] = useState<Record<string, Counter>>({});
    const listWrapperRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);
    const rowHeight = isMobile ? connectionRowHeight.mobile : connectionRowHeight.desktop;

    useEffect(() => {
        const media = window.matchMedia("(max-width: 767px)");
        const update = () => setIsMobile(media.matches);
        update();
        media.addEventListener("change", update);
        return () => media.removeEventListener("change", update);
    }, []);

    const sortCounters = sortBy === "upload" || sortBy === "download" ? counters : undefined;
    const filterKey = countryFilter?.key;
    const filterValue = countryFilter?.value;
    const sorted = useMemo(() => {
        const all = Object.values(connections);
        const visible = filterKey ? all.filter(conn => (conn[filterKey] ?? '').toUpperCase() === filterValue) : all;
        return sortConnections(visible, sortBy, sortOrder, sortCounters);
    }, [connections, sortCounters, sortBy, sortOrder, filterKey, filterValue]);
    const changeSort = (field: SortBy) => {
        if (field === sortBy) setSortOrder(order => order === 'asc' ? 'desc' : 'asc');
        else setSortBy(field);
    };

    const handleClose = useCallback((id: string) => {
        setClosing(true);
        closeConnections([id])
            .then(() => {
                setSelected(undefined);
                removeLocally([id]);
            })
            .catch((err) => ctx.Error(`disconnect failed: ${err.msg ?? err}`))
            .finally(() => setClosing(false));
    }, [ctx, removeLocally]);

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
                <Button onClick={reconnect} size="sm" className="shrink-0 max-md:min-h-11 max-md:min-w-11" variant="outline-secondary" aria-label={uiT("refreshConnections")}>
                    <RefreshCw size={14} /><span className="hidden md:inline">{uiT("refresh")}</span>
                </Button>
            </div>

            <FlowContainer onUpdate={setCounters} variant="summary" compact />

            {countryFilter && (
                <div className="mb-3 flex shrink-0 flex-wrap items-center gap-2 text-sm">
                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-ui-md bg-ui-primary-soft px-2 py-1 text-ui-primary">
                        <CountryFlag code={countryFilter.value} />
                        <span className="min-w-0 truncate">{statsT(countryFilter.key === 'geo' ? 'filterGeo' : 'filterOutboundGeo', { country: `${countryNames(countryFilter.value)} (${countryFilter.value})` })}</span>
                        <button type="button" aria-label={statsT('clearFilter')} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-ui-sm hover:bg-ui-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus"
                            onClick={() => navigation.replace('/docs/connections/v2')}><X size={12} aria-hidden="true" /></button>
                    </span>
                </div>
            )}

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
                    <div ref={listWrapperRef} role="rowgroup" className="min-h-0 flex-1 overflow-hidden">
                        <VList
                            data={sorted}
                            // Rows ignore the pointer while scrolling so hover
                            // repaints don't follow the content under a still cursor.
                            onScroll={() => listWrapperRef.current?.setAttribute("data-scrolling", "")}
                            onScrollEnd={() => listWrapperRef.current?.removeAttribute("data-scrolling")}
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
                                variant="destructive"
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
