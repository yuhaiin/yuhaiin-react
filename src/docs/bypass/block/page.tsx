import { PageHeader } from '@/component/v2/page-header';
import { useTranslation } from 'react-i18next';
import { usePagination } from "@/hooks/use-pagination";

import { blockHistory } from "@/api/route";
import { Button } from "@/component/v2/button";
import { MainContainer } from "@/component/v2/card";
import { DataList, DataListItem } from "@/component/v2/datalist";
import { HistoryList, HistoryListSkeleton, HistoryRow, HistoryToolbar, formatHistoryTime, formatProtocolLabel, matchesHistorySearch } from "@/component/v2/history-list";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import type { BlockHistory } from "@/contract/route";
import { Ban, Network, ShieldOff } from 'lucide-react';
import React, { FC, useMemo, useState } from "react";
import useSWR from "swr";
import Loading from "../../../component/v2/loading";

const ZeroDate = new Date(0);

function historyDate(value?: string): Date {
    if (!value) return ZeroDate;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? ZeroDate : date;
}

// --- Component: Individual Blocked History Row ---
const ListItem: FC<{ data: BlockHistory }> = React.memo(({ data }) => {
    const { t: uiT } = useTranslation('ui');

    return (
        <HistoryRow
            icon={ShieldOff}
            iconTone="danger"
            title={data.host}
            subtitle={data.process || "System Filter"}
            subtitleOnMobile
            time={formatHistoryTime(historyDate(data.time))}
            meta={[
                { icon: Ban, text: uiT("blockCount", { count: Number(data.blockCount) }), tone: "danger" },
                { icon: Network, text: formatProtocolLabel(data.protocol) },
            ]}
        />
    );
});

// --- Component: Details Modal ---
const InfoModal: FC<{ data?: BlockHistory, show: boolean, onClose: () => void }> = React.memo(({ data, show, onClose }) => {
    const { t: uiT } = useTranslation('ui');

    if (!data) return null;
    return (
        <Modal open={show} onOpenChange={(open) => !open && onClose()}>
            <ModalContent mobileSheet>
                <ModalHeader closeButton>
                    <ModalTitle>{uiT("blockedSessionDetails")}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <DataList>
                        <DataListItem label={uiT("time")} value={historyDate(data.time).toLocaleString()} />
                        <DataListItem label={uiT("network")} value={formatProtocolLabel(data.protocol)} />
                        <DataListItem label={uiT("host")} value={data.host} />
                        <DataListItem label={uiT("totalBlocks")} value={String(data.blockCount)} />
                        <DataListItem label={uiT("process")} value={data.process || "Unknown"} />
                    </DataList>
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

export default BypassBlockHistory;
