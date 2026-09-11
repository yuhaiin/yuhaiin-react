"use client"

import { getAllHistory } from "@/api/connections"
import { Button } from "@/component/v2/button"
import { CardList, FilterSearch, MainContainer, SettingLabel } from "@/component/v2/card"
import { DataListItem } from "@/component/v2/datalist"
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/component/v2/dropdown"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal"
import { Pagination } from "@/component/v2/pagination"
import { Spinner } from "@/component/v2/spinner"
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import type { AllHistory } from "@/contract/connection"
import { ArrowDownWideNarrow, ArrowLeftRight, ChevronRight, Clock, Info, Radio, RefreshCw, RotateCw, ShieldCheck } from "lucide-react"
import React, { FC, useMemo, useState } from "react"
import useSWR from "swr"
import Loading from "../../../component/v2/loading"
import { NodeModal } from "../../node/modal"
import { ConnectionBadge, ConnectionInfo } from "../components"

function formatProtocolLabel(value?: string) {
    if (!value) return "Unknown";
    return value.split("_").join("/").toUpperCase();
}

const ListItem: FC<{ data: AllHistory }> = React.memo(({ data }) => {
    return (
        <div className="flex min-w-0 w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 w-full items-center gap-3 sm:w-auto sm:flex-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ui-md border border-ui-primary/20 bg-ui-primary-soft text-ui-primary">
                    {data.connection.network.connType.startsWith("udp") ? <Radio size={17} /> : <ArrowLeftRight size={17} />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <span className="truncate text-base font-bold" title={data.connection.addr}>{data.connection.addr || "-"}</span>
                    <small className="truncate font-mono text-xs text-ui-muted">
                        ID: #{data.connection.id} • {formatProtocolLabel(data.connection.network.connType)}
                    </small>
                </div>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2 pl-[54px] sm:shrink-0 sm:pl-0">
                <ConnectionBadge icon={ShieldCheck} text={formatProtocolLabel(data.connection.mode)} />
                <ConnectionBadge icon={RefreshCw} text={`${data.count} events`} tone="success" />
                <ConnectionBadge icon={Clock} text={new Date(data.time).toLocaleTimeString()} tone="neutral" />
                <ChevronRight size={17} className="ml-1 hidden text-ui-muted/50 md:block" />
            </div>
        </div>
    );
});

function History() {
    const [sortBy, setSortBy] = useState("Time");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [filter, setFilter] = useState("");
    const [networkFilter, setNetworkFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [modalData, setModalData] = useState<{ show: boolean, data?: AllHistory }>({ show: false });
    const [nodeModal, setNodeModal] = useState<{ show: boolean; id?: string }>({ show: false });
    const { data, error, isLoading, isValidating, mutate } = useSWR("/api/v2/connections/history", getAllHistory);

    const values = useMemo(() => {
        const items = data?.items ?? [];
        return [...items]
            .filter(v => {
                if (networkFilter !== "all" && v.connection.network.connType !== networkFilter) return false;
                if (!filter) return true;
                const q = filter.toLowerCase();
                return v.connection.addr.toLowerCase().includes(q) || v.connection.process.toLowerCase().includes(q);
            })
            .sort((a, b) => {
                const dir = sortOrder === "asc" ? 1 : -1;
                if (sortBy === "Host") return a.connection.addr.localeCompare(b.connection.addr) * dir;
                if (sortBy === "Count") return (Number(a.count) - Number(b.count)) * dir;
                return (new Date(a.time).getTime() - new Date(b.time).getTime()) * dir;
            });
    }, [data, filter, networkFilter, sortBy, sortOrder]);

    const networkOptions = useMemo(() => {
        const values = new Set((data?.items ?? []).map(item => item.connection.network.connType).filter(Boolean));
        return Array.from(values).sort((a, b) => a.localeCompare(b));
    }, [data]);

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const pageSize = 30;
    const paginatedItems = values.slice((page - 1) * pageSize, page * pageSize);

    return (
        <MainContainer className="flex min-h-full min-w-0 flex-col">
            <NodeModal
                show={nodeModal.show}
                id={nodeModal.id}
                readOnly
                onHide={() => setNodeModal({ show: false })}
            />
            <Modal open={modalData.show} onOpenChange={(open) => !open && setModalData(prev => ({ ...prev, show: false }))}>
                <ModalContent>
                    <ModalHeader closeButton><ModalTitle className="font-bold">Session Detail</ModalTitle></ModalHeader>
                    <ModalBody>
                        {modalData.data && (
                            <ConnectionInfo
                                value={modalData.data.connection}
                                showNodeModal={(id) => setNodeModal({ show: true, id })}
                                startContent={<>
                                    <DataListItem label="Total Count" value={modalData.data.count} />
                                    <DataListItem label="Last Activity" value={new Date(modalData.data.time).toLocaleString()} />
                                </>}
                            />
                        )}
                    </ModalBody>
                    <ModalFooter className="border-0"><Button className="w-full" onClick={() => setModalData(prev => ({ ...prev, show: false }))}>Close</Button></ModalFooter>
                </ModalContent>
            </Modal>

            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="mt-1 text-xl font-semibold leading-tight text-ui-heading sm:text-2xl">Connection history</h1>
                    <div className="mt-1 flex items-center text-xs text-ui-muted">
                        <Info className="mr-1.5" size={14} />
                        <span>Showing {values.length} historical records</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2 rounded-ui-lg border border-ui-border bg-ui-surface-muted/50 px-2 py-2">
                    <FilterSearch onEnter={setFilter} size="sm" />
                    <Dropdown>
                        <DropdownTrigger asChild>
                            <Button size="sm" variant="outline-secondary">
                                {networkFilter === "all" ? "All Networks" : formatProtocolLabel(networkFilter)}
                            </Button>
                        </DropdownTrigger>
                        <DropdownContent align="end" className="min-w-[160px] max-w-[220px]">
                            <DropdownItem onSelect={() => setNetworkFilter("all")}>All Networks</DropdownItem>
                            {networkOptions.map(option => (
                                <DropdownItem key={option} onSelect={() => setNetworkFilter(option)}>
                                    {formatProtocolLabel(option)}
                                </DropdownItem>
                            ))}
                        </DropdownContent>
                    </Dropdown>
                    <Button size="sm" onClick={() => mutate()} disabled={isValidating}>
                        {isValidating ? <Spinner size="sm" /> : <RotateCw size={16} />}
                    </Button>
                    <Dropdown>
                        <DropdownTrigger asChild><Button size="sm"><ArrowDownWideNarrow className="mr-1" size={16} /></Button></DropdownTrigger>
                        <DropdownContent align="end" className="p-3" style={{ minWidth: "320px" }}>
                            <div className="mb-3">
                                <SettingLabel>Sort Order</SettingLabel>
                                <ToggleGroup type="single" value={sortOrder} onValueChange={(v) => v && setSortOrder(v as "asc" | "desc")} className="w-full">
                                    <ToggleItem value="asc" className="grow">Asc</ToggleItem>
                                    <ToggleItem value="desc" className="grow">Desc</ToggleItem>
                                </ToggleGroup>
                            </div>
                            <SettingLabel>Sort By</SettingLabel>
                            <ToggleGroup type="single" value={sortBy} onValueChange={(v) => v && setSortBy(v)} className="w-full whitespace-nowrap">
                                <ToggleItem value="Time" className="grow px-3">Time</ToggleItem>
                                <ToggleItem value="Host" className="grow px-3">Host</ToggleItem>
                                <ToggleItem value="Count" className="grow px-3">Count</ToggleItem>
                            </ToggleGroup>
                        </DropdownContent>
                    </Dropdown>
                </div>
            </div>

            <CardList
                items={paginatedItems}
                animated={false}
                getKey={(v) => `${v.connection.id}-${v.time}`}
                onClickItem={(v) => setModalData({ show: true, data: v })}
                renderListItem={(v) => <ListItem data={v} />}
                footer={<Pagination currentPage={page} totalItems={values.length} pageSize={pageSize} onPageChange={setPage} />}
            />
        </MainContainer>
    );
}

export default History;
