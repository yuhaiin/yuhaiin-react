"use client"

import { getAllHistory } from "@/api/connections"
import { Button } from "@/component/v2/button"
import { CardList, FilterSearch, IconBadge, MainContainer, SettingLabel } from "@/component/v2/card"
import { DataListItem } from "@/component/v2/datalist"
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "@/component/v2/dropdown"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal"
import { Pagination } from "@/component/v2/pagination"
import { PageHeader } from "@/component/v2/page-header"
import { PageStatStrip } from "@/component/v2/page-patterns"
import { ResourceWorkspace } from "@/component/v2/resource-workspace"
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import type { AllHistory } from "@/contract/connection"
import { Activity, ArrowDownWideNarrow, ArrowLeftRight, ChevronRight, Clock, Radio, RefreshCw, RotateCw, ShieldCheck } from "lucide-react"
import React, { FC, useMemo, useState } from "react"
import useSWR from "swr"
import Loading from "../../../component/v2/loading"
import { NodeModal } from "../../node/modal"
import { ConnectionInfo } from "../components"

function formatProtocolLabel(value?: string) {
    if (!value) return "Unknown";
    return value.split("_").join("/").toUpperCase();
}

const ListItem: FC<{ data: AllHistory }> = React.memo(({ data }) => {
    return (
        <div className="flex min-w-0 w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 w-full items-center gap-3 sm:w-auto sm:flex-1">
                <div className="flex items-center justify-center bg-ui-primary-soft text-ui-primary rounded-full shrink-0" style={{ width: "42px", height: "42px" }}>
                    {data.connection.network.connType.startsWith("udp") ? <Radio className="text-xl" /> : <ArrowLeftRight className="text-xl" />}
                </div>
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <span className="truncate text-base font-bold" title={data.connection.addr}>{data.connection.addr || "-"}</span>
                    <small className="truncate font-mono text-sm text-ui-muted opacity-75">
                        ID: #{data.connection.id} • {formatProtocolLabel(data.connection.network.connType)}
                    </small>
                </div>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2 pl-[54px] sm:shrink-0 sm:pl-0">
                <IconBadge icon={ShieldCheck} text={formatProtocolLabel(data.connection.mode)} color="info" />
                <IconBadge icon={RefreshCw} text={data.count} color="success" />
                <IconBadge icon={Clock} text={new Date(data.time).toLocaleTimeString()} color="secondary" />
                <div className="text-ui-muted opacity-25 ml-2 hidden md:block"><ChevronRight /></div>
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
        return items
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
    const latest = values[0]?.time ? new Date(values[0].time).toLocaleTimeString() : "—";

    return (
        <MainContainer className="product-page page-skin-traffic page-skin-history">
            <PageHeader
                eyebrow="Traffic"
                title="Activity history"
                description={`Review ${values.length} stored connection records and open any session for its full route details.`}
                icon={Clock}
                actions={<Button size="sm" onClick={() => mutate()} disabled={isValidating}><RotateCw size={16} className="mr-1" /> Refresh</Button>}
            />
            <PageStatStrip stats={[
                { label: "Records", value: values.length, hint: "Matching history", icon: Clock },
                { label: "Networks", value: networkOptions.length, hint: "Observed types", icon: Activity, tone: "violet" },
                { label: "Page size", value: pageSize, hint: "Rows per page", icon: ArrowDownWideNarrow, tone: "success" },
                { label: "Latest", value: latest, hint: "Most recent record", icon: RefreshCw, tone: "warning" },
            ]} />
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

            <ResourceWorkspace
                className="ui-traffic-workspace"
                railClassName="ui-traffic-rail"
                mainClassName="ui-traffic-main ui-traffic-table"
                icon={Clock}
                eyebrow="Traffic archive"
                title="Follow a session back"
                description="Search stored sessions by destination, then open one to inspect its inbound, rule, resolver, and outbound path."
                links={[{ label: "Live connections", href: "#/docs/connections/v2" }, { label: "Failed connections", href: "#/docs/connections/failed" }]}
            >
            <div className="ui-filter-toolbar mb-5 items-end">
                <div className="flex flex-wrap gap-2 justify-end items-center">
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
            </ResourceWorkspace>
        </MainContainer>
    );
}

export default History;
