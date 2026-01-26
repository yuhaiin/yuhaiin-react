"use client"

import { useDelay } from "@/common/hooks";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { CardList, MainContainer, SettingLabel } from "@/component/v2/card";
import { DataList, DataListItem } from "@/component/v2/datalist";
import { Dropdown, DropdownContent, DropdownTrigger } from "@/component/v2/dropdown";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Pagination } from "@/component/v2/pagination";
import { Spinner } from "@/component/v2/spinner";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import { block_history, rules } from "@/docs/pbes/api/config_pb";
import { timestampDate } from "@bufbuild/protobuf/wkt";
import { ArrowDownWideNarrow, Ban, ChevronRight, Clock, Network, RotateCw, ShieldOff } from 'lucide-react';
import React, { FC, useMemo, useState } from "react";
import { TimestampZero } from "../../../common/nodes";
import { useProtoSWR } from "../../../common/proto";
import Loading from "../../../component/v2/loading";

// --- Component: Individual Blocked History Row ---
const ListItem: FC<{ data: block_history }> = React.memo(({ data }) => {
    return (
        <div className="flex w-full flex-col md:flex-row items-start md:items-center justify-between gap-3">

            {/* Left Side: Icon + Host & Process */}
            <div className="flex items-center flex-grow overflow-hidden gap-3 w-full md:w-auto">
                <div className="flex items-center justify-center bg-danger bg-opacity-10 text-danger rounded-full shrink-0" style={{ width: '42px', height: '42px' }}>
                    <ShieldOff className="text-xl" />
                </div>

                <div className="flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
                    <span className="font-bold truncate text-base opacity-75">{data.host}</span>
                    <small className="text-gray-500 truncate opacity-75 font-monospace">
                        {data.process || "System Filter"}
                    </small>
                </div>
            </div>

            {/* Right Side: Metadata Badges */}
            <div className="flex flex-wrap gap-2 items-center shrink-0">
                <Badge variant="info" pill className="flex items-center gap-1">
                    <Network size={12} /> {data.protocol}
                </Badge>
                <Badge variant="danger" pill className="flex items-center gap-1">
                    <Ban size={12} /> {data.blockCount} Blocks
                </Badge>
                <Badge variant="secondary" pill className="flex items-center gap-1">
                    <Clock size={12} /> {timestampDate(data.time!).toLocaleTimeString()}
                </Badge>
                <ChevronRight className="text-gray-500 opacity-25 ml-2 hidden md:block" size={16} />
            </div>
        </div>
    );
});

// --- Component: Details Modal ---
const InfoModal: FC<{ data?: block_history, show: boolean, onClose: () => void }> = React.memo(({ data, show, onClose }) => {
    if (!data) return null;
    return (
        <Modal open={show} onOpenChange={(open) => !open && onClose()}>
            <ModalContent>
                <ModalHeader closeButton>
                    <ModalTitle>Blocked Session Details</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <DataList>
                        <DataListItem label="Time" value={timestampDate(data.time!).toLocaleString()} />
                        <DataListItem label="Network" value={data.protocol} />
                        <DataListItem label="Host" value={data.host} />
                        <DataListItem label="Total Blocks" value={String(data.blockCount)} />
                        <DataListItem label="Process" value={data.process || "Unknown"} />
                    </DataList>
                </ModalBody>
                <ModalFooter className="border-0">
                    <Button className="w-full" onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
});

function BypassBlockHistory() {
    const [sortBy, setSortBy] = useState("Time");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const [info, setInfo] = useState<{ data?: block_history, show: boolean }>({ show: false });
    const shouldFetch = useDelay(400);

    const { data, error, isLoading, isValidating, mutate } = useProtoSWR(shouldFetch ? rules.method.block_history : null);

    const values = useMemo(() => {
        if (!data?.objects) return []
        return data.objects.filter(v => v.time).sort((a, b) => {
            const first = sortOrder === "asc" ? -1 : 1;
            const second = sortOrder === "asc" ? 1 : -1;

            if (sortBy === "Host") return a.host < b.host ? first : second;
            if (sortBy === "Count") return Number(a.blockCount) < Number(b.blockCount) ? first : second;
            if (sortBy === "Proc") return (a.process ?? "") < (b.process ?? "") ? first : second;

            const aTime = a.time ?? TimestampZero;
            const bTime = b.time ?? TimestampZero;
            if (aTime.seconds < bTime.seconds) return first;
            if (aTime.seconds > bTime.seconds) return second;
            return 0;
        })
    }, [data, sortBy, sortOrder]);

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const pageSize = 30;
    const paginatedItems = values.slice((page - 1) * pageSize, page * pageSize);

    return (
        <MainContainer>
            <InfoModal data={info.data} show={info.show} onClose={() => setInfo({ ...info, show: false })} />

            {/* --- Action Bar --- */}
            <div className="flex flex-wrap justify-between items-end mb-4 gap-3">
                <div>
                    <h4 className="font-bold mb-1">Blocked Traffic</h4>
                    <div className="text-gray-500 flex items-center small">
                        <ShieldOff className="mr-2 text-danger opacity-75" />
                        <span>Displaying {values.length} connections denied by rules</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end items-center">
                    <Button size="sm" onClick={() => mutate()} disabled={isValidating}>
                        {isValidating ? <Spinner size="sm" /> : <RotateCw size={16} />}
                    </Button>

                    <Dropdown>
                        <DropdownTrigger asChild>
                            <Button size="sm">
                                <ArrowDownWideNarrow size={16} />
                            </Button>
                        </DropdownTrigger>
                        <DropdownContent style={{ minWidth: '240px' }} className="p-3">
                            <div className="mb-3">
                                <SettingLabel className="mb-2">Order</SettingLabel>
                                <ToggleGroup type="single" value={sortOrder} onValueChange={(v) => v && setSortOrder(v as "asc" | "desc")} className="w-full">
                                    <ToggleItem value="asc" className="flex-grow">ASC</ToggleItem>
                                    <ToggleItem value="desc" className="flex-grow">DESC</ToggleItem>
                                </ToggleGroup>
                            </div>
                            <div>
                                <SettingLabel className="mb-2">By</SettingLabel>
                                <ToggleGroup type="single" value={sortBy} onValueChange={(v) => v && setSortBy(v)} className="flex flex-wrap">
                                    <ToggleItem value="Time" className="flex-grow">Time</ToggleItem>
                                    <ToggleItem value="Host" className="flex-grow">Host</ToggleItem>
                                    <ToggleItem value="Count" className="flex-grow">Count</ToggleItem>
                                    {data.dumpProcessEnabled && (
                                        <ToggleItem value="Proc" className="flex-grow">Proc</ToggleItem>
                                    )}
                                </ToggleGroup>
                            </div>
                        </DropdownContent>
                    </Dropdown>
                </div>
            </div>

            <CardList
                items={paginatedItems}
                getKey={(v) => `${v.host}-${v.time?.seconds}`}
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