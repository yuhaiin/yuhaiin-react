import { useTranslation } from 'react-i18next';
import { usePagination } from "@/hooks/use-pagination";

import { blockHistory } from "@/api/route";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { CardList, MainContainer, SettingLabel } from "@/component/v2/card";
import { DataList, DataListItem } from "@/component/v2/datalist";
import { Dropdown, DropdownContent, DropdownTrigger } from "@/component/v2/dropdown";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Pagination } from "@/component/v2/pagination";
import { Spinner } from "@/component/v2/spinner";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import type { BlockHistory } from "@/contract/route";
import { ArrowDownWideNarrow, Ban, ChevronRight, Clock, Network, RotateCw, ShieldOff } from 'lucide-react';
import React, { FC, useMemo, useState } from "react";
import useSWR from "swr";
import Loading from "../../../component/v2/loading";

const ZeroDate = new Date(0);

function historyDate(value?: string): Date {
    if (!value) return ZeroDate;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? ZeroDate : date;
}

function formatProtocolLabel(value?: string) {
    if (!value) return "Unknown";
    return value.split("_").join("/").toUpperCase();
}

// --- Component: Individual Blocked History Row ---
const ListItem: FC<{ data: BlockHistory }> = React.memo(({ data }) => {
    const { t: uiT } = useTranslation('ui');

    return (
        <div className="flex w-full flex-col md:flex-row items-start md:items-center justify-between gap-4">

            {/* Left Side: Icon + Host & Process */}
            <div className="flex items-center grow overflow-hidden gap-4 w-full md:w-auto">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ui-md border border-ui-danger/20 bg-ui-danger-soft text-ui-danger">
                    <ShieldOff size={17} />
                </div>

                <div className="flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
                    <span className="truncate text-base font-semibold text-ui-heading">{data.host}</span>
                    <small className="truncate font-mono text-xs text-ui-muted">
                        {data.process || "System Filter"}
                    </small>
                </div>
            </div>

            {/* Right Side: Metadata Badges */}
            <div className="flex shrink-0 flex-wrap items-center gap-2 pl-[52px] md:pl-0">
                <Badge variant="info" pill className="flex items-center gap-1">
                    <Network size={12} /> {formatProtocolLabel(data.protocol)}
                </Badge>
                <Badge variant="danger" pill className="flex items-center gap-1">
                    <Ban size={12} /> {data.blockCount} {uiT("blocksLabel")}</Badge>
                <Badge variant="secondary" pill className="flex items-center gap-1">
                    <Clock size={12} /> {historyDate(data.time).toLocaleTimeString()}
                </Badge>
                <ChevronRight className="ml-1 hidden text-ui-muted/50 md:block" size={17} />
            </div>
        </div>
    );
});

// --- Component: Details Modal ---
const InfoModal: FC<{ data?: BlockHistory, show: boolean, onClose: () => void }> = React.memo(({ data, show, onClose }) => {
    const { t: uiT } = useTranslation('ui');

    if (!data) return null;
    return (
        <Modal open={show} onOpenChange={(open) => !open && onClose()}>
            <ModalContent>
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
                <ModalFooter className="border-0">
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
    const [info, setInfo] = useState<{ data?: BlockHistory, show: boolean }>({ show: false });

    const { data, error, isLoading, isValidating, mutate } = useSWR("/api/v2/route/rules/block-history", blockHistory);

    const values = useMemo(() => {
        if (!data?.items) return []
        return data.items.filter(v => v.time).sort((a, b) => {
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
    }, [data, sortBy, sortOrder]);

    const pageSize = 30;
    const { page, setPage } = usePagination(values.length, pageSize, JSON.stringify([sortBy, sortOrder]));

    if (error) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const paginatedItems = values.slice((page - 1) * pageSize, page * pageSize);

    return (
        <MainContainer className="flex min-h-full min-w-0 flex-col">
            <InfoModal data={info.data} show={info.show} onClose={() => setInfo({ ...info, show: false })} />

            {/* --- Action Bar --- */}
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold leading-tight text-ui-heading sm:text-2xl">{uiT("blockedTraffic")}</h1>
                    <div className="mt-1 flex items-center text-xs text-ui-muted">
                        <ShieldOff className="mr-1.5 text-ui-danger" size={14} />
                        <span>{uiT("blockedCount", { count: values.length })}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 rounded-ui-lg border border-ui-border bg-ui-surface-muted/50 px-2 py-2">
                    <Button size="sm" onClick={() => mutate()} disabled={isValidating}>
                        {isValidating ? <Spinner size="sm" /> : <RotateCw size={16} />}
                    </Button>

                    <Dropdown>
                        <DropdownTrigger asChild>
                            <Button size="sm">
                                <ArrowDownWideNarrow size={16} />
                            </Button>
                        </DropdownTrigger>
                        <DropdownContent className="w-[min(320px,calc(100vw-2rem))] min-w-0 max-w-[calc(100vw-2rem)] p-3">
                            <div className="mb-3">
                                <SettingLabel className="mb-2">{uiT("order")}</SettingLabel>
                                <ToggleGroup noSlide type="single" value={sortOrder} onValueChange={(v) => v && setSortOrder(v as "asc" | "desc")} className="w-full">
                                    <ToggleItem value="asc" className="grow">{uiT("ascLabel")}</ToggleItem>
                                    <ToggleItem value="desc" className="grow">{uiT("descLabel")}</ToggleItem>
                                </ToggleGroup>
                            </div>
                            <div>
                                <SettingLabel className="mb-2">{uiT("by")}</SettingLabel>
                                <ToggleGroup noSlide type="single" value={sortBy} onValueChange={(v) => v && setSortBy(v)} className="flex w-full flex-wrap">
                                    <ToggleItem value="Time" className="grow">{uiT("time")}</ToggleItem>
                                    <ToggleItem value="Host" className="grow">{uiT("host")}</ToggleItem>
                                    <ToggleItem value="Count" className="grow">{uiT("count")}</ToggleItem>
                                    {data.dumpProcessEnabled && (
                                        <ToggleItem value="Proc" className="grow">{uiT("proc")}</ToggleItem>
                                    )}
                                </ToggleGroup>
                            </div>
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
                footer={<Pagination
                    currentPage={page}
                    totalItems={values.length}
                    pageSize={pageSize}
                    onPageChange={setPage}
                />}
            />

        </MainContainer>
    );
}

export default BypassBlockHistory;
