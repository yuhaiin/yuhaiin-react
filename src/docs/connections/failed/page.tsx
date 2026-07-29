"use client"

import { getFailedHistory } from "@/api/connections"
import { Button } from "@/component/v2/button"
import { CardList, IconBadge, MainContainer, SettingLabel } from "@/component/v2/card"
import { DataList, DataListItem } from "@/component/v2/datalist"
import { Dropdown, DropdownContent, DropdownTrigger } from "@/component/v2/dropdown"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal"
import { Pagination } from "@/component/v2/pagination"
import { PageHeader } from "@/component/v2/page-header"
import { PageStatStrip } from "@/component/v2/page-patterns"
import { ResourceWorkspace } from "@/component/v2/resource-workspace"
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import type { FailedHistory as FailedHistoryItem } from "@/contract/connection"
import { ArrowDownWideNarrow, Bug, ChevronRight, Clock, Network, OctagonAlert, RotateCw, ShieldAlert } from "lucide-react"
import React, { FC, useMemo, useState } from "react"
import useSWR from "swr"
import Loading from "../../../component/v2/loading"

function formatProtocolLabel(value?: string) {
    if (!value) return "Unknown";
    return value.split("_").join("/").toUpperCase();
}

const ListItem: FC<{ data: FailedHistoryItem }> = React.memo(({ data }) => {
    return (
        <>
            <div className="flex w-full flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center grow overflow-hidden gap-4 w-full md:w-auto">
                    <div className="flex items-center justify-center bg-red-500/10 text-red-500 rounded-full shrink-0" style={{ width: "42px", height: "42px" }}>
                        <Bug className="text-xl" />
                    </div>
                    <div className="flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
                        <span className="font-bold truncate text-base text-red-500/75">{data.host}</span>
                        <small className="text-ui-muted truncate opacity-75 font-mono">
                            {data.error || "Unknown Error"}
                        </small>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center shrink-0">
                    <IconBadge icon={Network} text={formatProtocolLabel(data.protocol)} color="info" />
                    <IconBadge icon={OctagonAlert} text={`${data.failedCount} Fails`} color="warning" />
                    <IconBadge icon={Clock} text={new Date(data.time).toLocaleTimeString()} color="secondary" />
                    <div className="text-ui-muted opacity-25 ml-2 hidden md:block"><ChevronRight /></div>
                </div>
            </div>
        </>
    );
});

function FailedHistory() {
    const [sortBy, setSortBy] = useState("Time");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const [info, setInfo] = useState<{ data?: FailedHistoryItem, show: boolean }>({ show: false });
    const { data, error, isLoading, isValidating, mutate } = useSWR("/api/v2/connections/failed-history", getFailedHistory);

    const values = useMemo(() => {
        const items = data?.items ?? [];
        return items.sort((a, b) => {
            const dir = sortOrder === "asc" ? 1 : -1;
            if (sortBy === "Host") return a.host.localeCompare(b.host) * dir;
            if (sortBy === "Count") return (Number(a.failedCount) - Number(b.failedCount)) * dir;
            return (new Date(a.time).getTime() - new Date(b.time).getTime()) * dir;
        });
    }, [data, sortBy, sortOrder]);

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const pageSize = 30;
    const paginatedItems = values.slice((page - 1) * pageSize, page * pageSize);
    const hosts = new Set(values.map(item => item.host).filter(Boolean)).size;
    const protocols = new Set(values.map(item => item.protocol).filter(Boolean)).size;
    const latest = values[0]?.time ? new Date(values[0].time).toLocaleTimeString() : "—";

    return (
        <MainContainer className="product-page page-skin-traffic page-skin-failed">
            <PageHeader
                eyebrow="Traffic"
                title="Failed connections"
                description={`Keep an eye on ${values.length} rejected or timed-out requests and inspect the last error when something needs attention.`}
                icon={Bug}
                actions={<Button size="sm" onClick={() => mutate()} disabled={isValidating}><RotateCw size={16} className="mr-1" /> Refresh</Button>}
            />
            <PageStatStrip stats={[
                { label: "Failures", value: values.length, hint: "Matching records", icon: Bug, tone: "warning" },
                { label: "Hosts", value: hosts, hint: "Affected destinations", icon: Network, tone: "violet" },
                { label: "Protocols", value: protocols, hint: "Observed types", icon: ShieldAlert },
                { label: "Latest", value: latest, hint: "Most recent failure", icon: Clock, tone: "danger" },
            ]} />
            <Modal open={info.show} onOpenChange={(open) => !open && setInfo({ ...info, show: false })}>
                <ModalContent>
                    <ModalHeader closeButton><ModalTitle className="font-bold text-red-500">Failure Details</ModalTitle></ModalHeader>
                    <ModalBody>
                        <DataList>
                            {info.data && (
                                <>
                                    <DataListItem label="Host" value={info.data.host} />
                                    <DataListItem label="Network" value={formatProtocolLabel(info.data.protocol)} />
                                    <DataListItem label="Failures" value={info.data.failedCount} />
                                    <DataListItem label="Last Error" value={info.data.error} />
                                    <DataListItem label="Process" value={info.data.process || "System"} />
                                    <DataListItem label="Timestamp" value={new Date(info.data.time).toLocaleString()} />
                                </>
                            )}
                        </DataList>
                    </ModalBody>
                    <ModalFooter className="border-0"><Button className="w-full" onClick={() => setInfo({ ...info, show: false })}>Close</Button></ModalFooter>
                </ModalContent>
            </Modal>

            <ResourceWorkspace
                className="ui-traffic-workspace"
                railClassName="ui-traffic-rail"
                mainClassName="ui-traffic-main ui-traffic-table"
                icon={Bug}
                eyebrow="Traffic recovery"
                title="Understand rejected traffic"
                description="Failures are grouped here so you can see the last error, affected host, and retry pressure without opening the live view."
                links={[{ label: "Live connections", href: "#/docs/connections/v2" }, { label: "Activity history", href: "#/docs/connections/history" }]}
            >
            <div className="ui-filter-toolbar mb-5 items-end">
                <div className="flex flex-wrap gap-2 justify-end items-center">
                    <Dropdown>
                        <DropdownTrigger asChild><Button size="sm"><ArrowDownWideNarrow size={16} /></Button></DropdownTrigger>
                        <DropdownContent align="end" className="p-3" style={{ minWidth: "320px" }}>
                            <div className="mb-3">
                                <SettingLabel>Order</SettingLabel>
                                <ToggleGroup type="single" value={sortOrder} onValueChange={(v) => v && setSortOrder(v as "asc" | "desc")} className="w-full">
                                    <ToggleItem value="asc" className="grow">ASC</ToggleItem>
                                    <ToggleItem value="desc" className="grow">DESC</ToggleItem>
                                </ToggleGroup>
                            </div>
                            <SettingLabel>By</SettingLabel>
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
                getKey={(v) => `${v.host}-${v.time}`}
                onClickItem={(item) => setInfo({ show: true, data: item })}
                renderListItem={(item) => <ListItem data={item} />}
                footer={<Pagination currentPage={page} totalItems={values.length} pageSize={pageSize} onPageChange={setPage} />}
            />
            </ResourceWorkspace>
        </MainContainer>
    );
}

export default FailedHistory;
