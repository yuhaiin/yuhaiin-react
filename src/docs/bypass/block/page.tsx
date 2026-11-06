import { PageHeader } from '@/component/v2/page-header';
import { useTranslation } from 'react-i18next';
import { usePagination } from "@/hooks/use-pagination";

import { blockHistory } from "@/api/route";
import { Button } from "@/component/v2/button";
import { MainContainer } from "@/component/v2/card";
import { DataListItem, DataSection } from "@/component/v2/datalist";
import { HistoryList, HistoryListSkeleton, HistoryTitle, HistoryToolbar, formatHistoryTime, formatProtocolLabel, matchesHistorySearch, nextHistorySort, type HistoryColumn } from "@/component/v2/history-list";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import type { BlockHistory } from "@/contract/route";
import { ShieldOff } from 'lucide-react';
import React, { FC, useMemo, useState } from "react";
import useSWR from "swr";
import Loading from "../../../component/v2/loading";
import { ConnectionActions } from "../../connections/connection-actions";

const ZeroDate = new Date(0);

function historyDate(value?: string): Date {
    if (!value) return ZeroDate;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? ZeroDate : date;
}

// --- Component: Details Modal ---
const InfoModal: FC<{ data?: BlockHistory, show: boolean, onClose: () => void }> = React.memo(({ data, show, onClose }) => {
    const { t: uiT } = useTranslation('ui');
    const { t: detailT } = useTranslation('connections');

    if (!data) return null;
    return (
        <Modal open={show} onOpenChange={(open) => !open && onClose()}>
            <ModalContent mobileSheet>
                <ModalHeader closeButton>
                    <ModalTitle className="font-bold">{uiT("blockedSessionDetails")}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <div className="space-y-4">
                        <ConnectionActions host={data.host.replace(/^([^:]+):\d+$/, "$1")} process={data.process} />
                        <DataSection title={detailT("detail.Basic")}>
                            <DataListItem label={uiT("totalBlocks")} value={String(data.blockCount)} />
                            <DataListItem label={uiT("time")} value={historyDate(data.time).toLocaleString()} />
                            <DataListItem label={uiT("host")} value={data.host} />
                            <DataListItem label={uiT("network")} value={formatProtocolLabel(data.protocol)} />
                        </DataSection>
                        {data.process && <DataSection title={detailT("detail.Process")}><DataListItem label={uiT("process")} value={data.process} /></DataSection>}
                    </div>
                </ModalBody>
                <ModalFooter className="border-0 max-md:hidden">
                    <Button className="w-full" onClick={onClose}>{uiT("close")}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
});

function BypassBlockHistory() {
    const { t: uiT } = useTranslation('ui');

    const [sortBy, setSortBy] = useState("Time");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [filter, setFilter] = useState("");
    const [info, setInfo] = useState<{ data?: BlockHistory, show: boolean }>({ show: false });

    const { data, error, isLoading, isValidating, mutate } = useSWR("/api/v2/route/rules/block-history", blockHistory);

    const values = useMemo(() => {
        if (!data?.items) return []
        return data.items.filter(v => v.time && matchesHistorySearch(filter, v.host, v.process)).sort((a, b) => {
            const first = sortOrder === "asc" ? -1 : 1;
            const second = sortOrder === "asc" ? 1 : -1;

            if (sortBy === "Host") return a.host < b.host ? first : second;
            if (sortBy === "Count") return Number(a.blockCount) < Number(b.blockCount) ? first : second;
            if (sortBy === "Proc") return (a.process ?? "") < (b.process ?? "") ? first : second;

            const aTime = historyDate(a.time).getTime();
            const bTime = historyDate(b.time).getTime();
            if (aTime < bTime) return first;
            if (aTime > bTime) return second;
            return 0;
        })
    }, [data, filter, sortBy, sortOrder]);

    const pageSize = 30;
    const resetKey = JSON.stringify([filter, sortBy, sortOrder]);
    const { page, setPage } = usePagination(values.length, pageSize, resetKey);

    if (error) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>

    const paginatedItems = values.slice((page - 1) * pageSize, page * pageSize);
    // With process capture on, the process gets its own sortable column.
    const showProcess = Boolean(data?.dumpProcessEnabled);
    const columns: HistoryColumn<BlockHistory>[] = [
        { id: "host", header: uiT("host"), width: "minmax(0,1fr)", role: "primary", sortKey: "Host",
          label: v => `${uiT("blockedSessionDetails")}: ${v.host}`,
          cell: v => <HistoryTitle title={v.host} detail={showProcess ? undefined : v.process || "System Filter"} /> },
        ...(showProcess ? [{ id: "process", header: uiT("process"), width: "minmax(0,0.7fr)", sortKey: "Proc",
          cell: (v: BlockHistory) => v.process || "System Filter" }] : []),
        { id: "protocol", header: uiT("protocol"), width: "4.5rem", mono: true, cell: v => formatProtocolLabel(v.protocol) },
        { id: "blocks", header: uiT("totalBlocks"), width: "6rem", numeric: true, mono: true, sortKey: "Count", tone: "danger",
          cell: v => Number(v.blockCount).toLocaleString(), mobileCell: v => uiT("blockCount", { count: Number(v.blockCount) }) },
        { id: "time", header: uiT("time"), width: "9.5rem", numeric: true, mono: true, role: "aside", sortKey: "Time",
          cell: v => formatHistoryTime(historyDate(v.time)) },
    ];
    const sort = (field: string) => { const next = nextHistorySort(field, sortBy, sortOrder); setSortBy(next.sortBy); setSortOrder(next.sortOrder); };

    return (
        <MainContainer className="flex min-h-full min-w-0 flex-col">
            <InfoModal data={info.data} show={info.show} onClose={() => setInfo({ ...info, show: false })} />

            {/* --- Action Bar --- */}
            <PageHeader
                title={uiT("blockedTraffic")}
                className="mb-4"
                stickyActions
                description={<span className="flex min-h-4 items-center text-xs">{data && <><ShieldOff className="mr-1.5 text-ui-danger" size={14} /><span>{uiT("blockedCount", { count: values.length })}</span></>}</span>}
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
                        ...(data?.dumpProcessEnabled ? [{ value: "Proc", label: uiT("proc") }] : []),
                    ]}
                />}
            />

            {isLoading || data === undefined ? <HistoryListSkeleton /> : <HistoryList
                label={uiT("blockedTraffic")}
                items={paginatedItems}
                columns={columns}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={sort}
                getKey={(v) => `${v.host}-${v.time}`}
                onClickItem={(item) => setInfo({ show: true, data: item })}
                page={page}
                totalItems={values.length}
                pageSize={pageSize}
                onPageChange={setPage}
                resetKey={resetKey}
            />}

        </MainContainer>
    );
}

export default BypassBlockHistory;
