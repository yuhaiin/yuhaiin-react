import { PageHeader } from '@/component/v2/page-header';
import { ConnectionActions } from '../connection-actions';
import { useTranslation } from 'react-i18next';
import { usePagination } from "@/hooks/use-pagination";

import { getFailedHistory } from "@/api/connections"
import { Button } from "@/component/v2/button"
import { MainContainer } from "@/component/v2/card"
import { DataList, DataListItem } from "@/component/v2/datalist"
import { HistoryList, HistoryListSkeleton, HistoryRow, HistoryToolbar, formatHistoryTime, formatProtocolLabel, matchesHistorySearch } from "@/component/v2/history-list"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal"
import type { FailedHistory as FailedHistoryItem } from "@/contract/connection"
import { Bug, Network, OctagonAlert } from "lucide-react"
import React, { FC, useMemo, useState } from "react"
import useSWR from "swr"
import Loading from "../../../component/v2/loading"

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
        <HistoryRow
            icon={Bug}
            iconTone="danger"
            title={data.host}
            titleClassName="text-ui-danger"
            subtitle={data.error || "Unknown Error"}
            subtitleOnMobile
            time={formatHistoryTime(new Date(data.time))}
            meta={[
                { icon: OctagonAlert, text: uiT("failedBadge", { count: Number(data.failedCount) }), tone: "warning" },
                { icon: Network, text: formatProtocolLabel(data.protocol) },
            ]}
        />
    );
});

function FailedHistory() {
    const { t: uiT } = useTranslation('ui');

    const [sortBy, setSortBy] = useState("Time");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [filter, setFilter] = useState("");
    const [info, setInfo] = useState<{ data?: FailedHistoryItem, show: boolean }>({ show: false });
    const { data, error, isLoading, isValidating, mutate } = useSWR("/api/v2/connections/failed-history", getFailedHistory);

    const values = useMemo(() => {
        const items = (data?.items ?? []).filter(v => matchesHistorySearch(filter, v.host, v.error, v.process));
        return sortFailedHistory(items, sortBy, sortOrder);
    }, [data, filter, sortBy, sortOrder]);

    const pageSize = 30;
    const resetKey = JSON.stringify([filter, sortBy, sortOrder]);
    const { page, setPage } = usePagination(values.length, pageSize, resetKey);

    if (error) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>

    const paginatedItems = values.slice((page - 1) * pageSize, page * pageSize);

    return (
        <MainContainer className="flex min-h-full min-w-0 flex-col">
            <Modal open={info.show} onOpenChange={(open) => !open && setInfo({ ...info, show: false })}>
                <ModalContent mobileSheet>
                    <ModalHeader closeButton><ModalTitle className="font-bold text-red-500">{uiT("failureDetails")}</ModalTitle></ModalHeader>
                    <ModalBody>
                        {info.data && <ConnectionActions host={info.data.host.replace(/^([^:]+):\d+$/, "$1")} process={info.data.process} />}
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
                    <ModalFooter className="border-0 max-md:hidden"><Button className="w-full" onClick={() => setInfo({ ...info, show: false })}>{uiT("close")}</Button></ModalFooter>
                </ModalContent>
            </Modal>

            <PageHeader
                title={uiT("failedConnections")}
                className="mb-4"
                stickyActions
                description={<span className="flex min-h-4 items-center text-xs">{data && <><Bug className="mr-1.5 text-ui-danger" size={14} /><span>{uiT("failureCount", { count: values.length })}</span></>}</span>}
                actions={<HistoryToolbar
                    onSearch={setFilter}
                    onRefresh={() => void mutate()}
                    refreshing={isValidating}
                    sortOrder={sortOrder}
                    onSortOrderChange={setSortOrder}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    sortOptions={[
                        { value: "Time", label: uiT("time") },
                        { value: "Host", label: uiT("host") },
                        { value: "Count", label: uiT("count") },
                    ]}
                />}
            />

            {isLoading || data === undefined ? <HistoryListSkeleton /> : <HistoryList
                items={paginatedItems}
                getKey={(v) => `${v.host}-${v.time}`}
                onClickItem={(item) => setInfo({ show: true, data: item })}
                renderRow={(item) => <ListItem data={item} />}
                page={page}
                totalItems={values.length}
                pageSize={pageSize}
                onPageChange={setPage}
                resetKey={resetKey}
            />}
        </MainContainer>
    );
}

export default FailedHistory;
