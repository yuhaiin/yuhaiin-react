import { useTranslation } from 'react-i18next';
import { usePagination } from "@/hooks/use-pagination";

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
    const { t: uiT } = useTranslation("ui");
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
                    <ConnectionBadge icon={OctagonAlert} text={uiT("failedBadge", { count: Number(data.failedCount) })} tone="warning" />
                    <ConnectionBadge icon={Clock} text={new Date(data.time).toLocaleTimeString()} tone="neutral" />
                    <ChevronRight size={17} className="ml-1 hidden text-ui-muted/50 md:block" />
                </div>
            </div>
        </>
    );
});

function FailedHistory() {
    const { t: uiT } = useTranslation('ui');

    const [sortBy, setSortBy] = useState("Time");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [info, setInfo] = useState<{ data?: FailedHistoryItem, show: boolean }>({ show: false });
    const { data, error, isLoading, isValidating, mutate } = useSWR("/api/v2/connections/failed-history", getFailedHistory);

    const values = useMemo(() => {
        return sortFailedHistory(data?.items ?? [], sortBy, sortOrder);
    }, [data, sortBy, sortOrder]);

    const pageSize = 30;
    const { page, setPage } = usePagination(values.length, pageSize, JSON.stringify([sortBy, sortOrder]));

    if (error) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const paginatedItems = values.slice((page - 1) * pageSize, page * pageSize);

    return (
        <MainContainer className="flex min-h-full min-w-0 flex-col">
            <Modal open={info.show} onOpenChange={(open) => !open && setInfo({ ...info, show: false })}>
                <ModalContent>
                    <ModalHeader closeButton><ModalTitle className="font-bold text-red-500">{uiT("failureDetails")}</ModalTitle></ModalHeader>
                    <ModalBody>
                        <DataList>
                            {info.data && (
                                <>
                                    <DataListItem label={uiT("host")} value={info.data.host} />
                                    <DataListItem label={uiT("network")} value={formatProtocolLabel(info.data.protocol)} />
                                    <DataListItem label={uiT("failures")} value={info.data.failedCount} />
                                    <DataListItem label={uiT("lastError")} value={info.data.error} />
                                    <DataListItem label={uiT("process")} value={info.data.process || "System"} />
                                    <DataListItem label={uiT("timestamp")} value={new Date(info.data.time).toLocaleString()} />
                                </>
                            )}
                        </DataList>
                    </ModalBody>
                    <ModalFooter className="border-0"><Button className="w-full" onClick={() => setInfo({ ...info, show: false })}>{uiT("close")}</Button></ModalFooter>
                </ModalContent>
            </Modal>

            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="mt-1 text-xl font-semibold leading-tight text-ui-heading sm:text-2xl">{uiT("failedConnections")}</h1>
                    <div className="mt-1 flex items-center text-xs text-ui-muted">
                        <Bug className="mr-1.5 text-ui-danger" size={14} />
                        <span>{uiT("failureCount", { count: values.length })}</span>
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
                                <SettingLabel>{uiT("order")}</SettingLabel>
                                <ToggleGroup type="single" value={sortOrder} onValueChange={(v) => v && setSortOrder(v as "asc" | "desc")} className="w-full">
                                <ToggleItem value="asc" className="grow">{uiT("ascLabel")}</ToggleItem>
                                <ToggleItem value="desc" className="grow">{uiT("descLabel")}</ToggleItem>
                                </ToggleGroup>
                            </div>
                            <SettingLabel>{uiT("by")}</SettingLabel>
                            <ToggleGroup type="single" value={sortBy} onValueChange={(v) => v && setSortBy(v)} className="w-full whitespace-nowrap">
                                <ToggleItem value="Time" className="grow px-3">{uiT("time")}</ToggleItem>
                                <ToggleItem value="Host" className="grow px-3">{uiT("host")}</ToggleItem>
                                <ToggleItem value="Count" className="grow px-3">{uiT("count")}</ToggleItem>
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
