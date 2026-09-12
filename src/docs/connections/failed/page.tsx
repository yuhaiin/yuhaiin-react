"use client"

import { getFailedHistory } from "@/api/connections"
import { Button } from "@/component/v2/button"
import { CardList, MainContainer, SettingLabel } from "@/component/v2/card"
import { DataList, DataListItem } from "@/component/v2/datalist"
import { Dropdown, DropdownContent, DropdownTrigger } from "@/component/v2/dropdown"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal"
import { Pagination } from "@/component/v2/pagination"
import { Spinner } from "@/component/v2/spinner"
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import type { FailedHistory as FailedHistoryItem } from "@/contract/connection"
import { ArrowDownWideNarrow, Bug, ChevronRight, Clock, Network, OctagonAlert, RotateCw } from "lucide-react"
import React, { FC, useMemo, useState } from "react"
import useSWR from "swr"
import Loading from "../../../component/v2/loading"
import { ConnectionBadge } from "../components"

function formatProtocolLabel(value?: string) {
    if (!value) return "Unknown";
    return value.split("_").join("/").toUpperCase();
}

export function sortFailedHistory(
    items: FailedHistoryItem[],
    sortBy: string,
    sortOrder: "asc" | "desc",
) {
    const dir = sortOrder === "asc" ? 1 : -1;
    return [...items].sort((a, b) => {
        if (sortBy === "Host") return a.host.localeCompare(b.host) * dir;
        if (sortBy === "Count") return (Number(a.failedCount) - Number(b.failedCount)) * dir;
        return (new Date(a.time).getTime() - new Date(b.time).getTime()) * dir;
    });
}

const ListItem: FC<{ data: FailedHistoryItem }> = React.memo(({ data }) => {
    return (
        <>
            <div className="flex w-full flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center grow overflow-hidden gap-4 w-full md:w-auto">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ui-md border border-ui-danger/20 bg-ui-danger-soft text-ui-danger">
                        <Bug size={17} />
                    </div>
                    <div className="flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
                        <span className="truncate text-base font-semibold text-ui-danger">{data.host}</span>
                        <small className="truncate font-mono text-xs text-ui-muted">
                            {data.error || "Unknown Error"}
                        </small>
                    </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 pl-[52px] md:pl-0">
                    <ConnectionBadge icon={Network} text={formatProtocolLabel(data.protocol)} />
                    <ConnectionBadge icon={OctagonAlert} text={`${data.failedCount} failures`} tone="warning" />
                    <ConnectionBadge icon={Clock} text={new Date(data.time).toLocaleTimeString()} tone="neutral" />
                    <ChevronRight size={17} className="ml-1 hidden text-ui-muted/50 md:block" />
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
        return sortFailedHistory(data?.items ?? [], sortBy, sortOrder);
    }, [data, sortBy, sortOrder]);

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const pageSize = 30;
    const paginatedItems = values.slice((page - 1) * pageSize, page * pageSize);

    return (
        <MainContainer className="flex min-h-full min-w-0 flex-col">
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

            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="mt-1 text-xl font-semibold leading-tight text-ui-heading sm:text-2xl">Failed connections</h1>
                    <div className="mt-1 flex items-center text-xs text-ui-muted">
                        <Bug className="mr-1.5 text-ui-danger" size={14} />
                        <span>Tracking {values.length} rejected or timed-out requests</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2 rounded-ui-lg border border-ui-border bg-ui-surface-muted/50 px-2 py-2">
                    <Button size="sm" onClick={() => mutate()} disabled={isValidating}>
                        {isValidating ? <Spinner size="sm" /> : <RotateCw size={16} />}
                    </Button>
                    <Dropdown>
                        <DropdownTrigger asChild><Button size="sm"><ArrowDownWideNarrow size={16} /></Button></DropdownTrigger>
                        <DropdownContent align="end" className="w-[min(320px,calc(100vw-2rem))] min-w-0 max-w-[calc(100vw-2rem)] p-3">
                            <div className="mb-3">
                                <SettingLabel>Order</SettingLabel>
                                <ToggleGroup type="single" value={sortOrder} onValueChange={(v) => v && setSortOrder(v as "asc" | "desc")} className="w-full">
                                <ToggleItem value="asc" className="grow">Asc</ToggleItem>
                                <ToggleItem value="desc" className="grow">Desc</ToggleItem>
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
        </MainContainer>
    );
}

export default FailedHistory;
