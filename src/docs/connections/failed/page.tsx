"use client"

import { useDelay } from "@/common/hooks"
import { Button } from "@/component/v2/button"
import { CardList, IconBadge, MainContainer, SettingLabel } from "@/component/v2/card"
import { DataList, DataListItem } from "@/component/v2/datalist"
import { Dropdown, DropdownContent, DropdownTrigger } from "@/component/v2/dropdown"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal"
import { Pagination } from "@/component/v2/pagination"
import { Spinner } from "@/component/v2/spinner"
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import { connections, failed_history } from "@/docs/pbes/api/statistic_pb"
import { timestampDate } from "@bufbuild/protobuf/wkt"
import { ArrowDownWideNarrow, Bug, ChevronRight, Clock, Network, OctagonAlert, RotateCw } from 'lucide-react'
import React, { FC, useMemo, useState } from "react"
import { TimestampZero } from "../../../common/nodes"
import { useProtoSWR } from "../../../common/proto"
import Loading from "../../../component/v2/loading"
import { type } from "../../pbes/statistic/config_pb"

// --- Component: Individual Failed History Row ---
const ListItem: FC<{ data: failed_history }> = React.memo(({ data }) => {
    return (
        <>
            <div className="flex w-full flex-col md:flex-row items-start md:items-center justify-between gap-3">

                {/* Left Side: Icon + Host & Error Preview */}
                <div className="flex items-center grow overflow-hidden gap-3 w-full md:w-auto">
                    <div className="flex items-center justify-center bg-red-500/10 text-red-500 rounded-full shrink-0" style={{ width: '42px', height: '42px' }}>
                        <Bug className="text-xl" />
                    </div>

                    <div className="flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
                        <span className="font-bold truncate text-base text-red-500/75">{data.host}</span>
                        <small className="text-gray-500 dark:text-gray-400 truncate opacity-75 font-mono">
                            {data.error || "Unknown Error"}
                        </small>
                    </div>
                </div>

                {/* Right Side: Metadata Badges */}
                <div className="flex flex-wrap gap-2 items-center shrink-0">
                    <IconBadge icon={Network} text={type[data.protocol ?? type.unknown]} color="info" />
                    <IconBadge icon={OctagonAlert} text={`${data.failedCount} Fails`} color="warning" />
                    <IconBadge icon={Clock} text={timestampDate(data.time!).toLocaleTimeString()} color="secondary" />
                    <div className="text-gray-500 dark:text-gray-400 opacity-25 ml-2 hidden md:block"><ChevronRight /></div>
                </div>
            </div>
        </>
    );
});

// --- Component: Failed Details Modal ---
const InfoModal: FC<{ data?: failed_history, show: boolean, onClose: () => void }> = React.memo(({ data, show, onClose }) => {
    return (
        <Modal open={show} onOpenChange={(open) => !open && onClose()}>
            <ModalContent>
                <ModalHeader closeButton>
                    <ModalTitle className="font-bold text-red-500">Failure Details</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <div>
                        <DataList>
                            {data && (
                                <>
                                    <DataListItem label="Host" value={data.host} />
                                    <DataListItem label="Network" value={type[data.protocol ?? type.unknown]} />
                                    <DataListItem label="Failures" value={String(data.failedCount)} />
                                    <DataListItem label="Last Error" value={data.error} />
                                    <DataListItem label="Process" value={data.process || "System"} />
                                    <DataListItem label="Timestamp" value={timestampDate(data.time!).toLocaleString()} />
                                </>
                            )}
                        </DataList>
                    </div>
                </ModalBody>
                <ModalFooter className="border-0">
                    <Button className="w-full" onClick={onClose}>Close</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
});

function FailedHistory() {
    const [sortBy, setSortBy] = useState("Time");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const [info, setInfo] = useState<{ data?: failed_history, show: boolean }>({ show: false });
    const shouldFetch = useDelay(400);

    const { data, error, isLoading, isValidating, mutate } = useProtoSWR(shouldFetch ? connections.method.failed_history : null);

    const values = useMemo(() => {
        if (!data?.objects) return []
        return data.objects.filter(v => v.time).sort((a, b) => {
            const first = sortOrder === "asc" ? -1 : 1;
            const second = sortOrder === "asc" ? 1 : -1;

            if (sortBy === "Host") return a.host < b.host ? first : second;
            if (sortBy === "Count") return Number(a.failedCount) < Number(b.failedCount) ? first : second;

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
                    <h4 className="font-bold mb-1">Failed Connections</h4>
                    <div className="text-gray-500 dark:text-gray-400 flex items-center text-sm">
                        <Bug className="text-red-500 mr-2" />
                        <span>Tracking {values.length} rejected or timed-out requests</span>
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
                        <DropdownContent align="end" className="p-3" style={{ minWidth: '250px' }}>
                            <div className="mb-3">
                                <SettingLabel>Order</SettingLabel>
                                <ToggleGroup type="single" value={sortOrder} onValueChange={(v) => v && setSortOrder(v as "asc" | "desc")} className="w-full">
                                    <ToggleItem value="asc" className="grow">ASC</ToggleItem>
                                    <ToggleItem value="desc" className="grow">DESC</ToggleItem>
                                </ToggleGroup>
                            </div>
                            <div>
                                <SettingLabel>By</SettingLabel>
                                <ToggleGroup type="single" value={sortBy} onValueChange={(v) => v && setSortBy(v)} className="w-full whitespace-nowrap">
                                    <ToggleItem value="Time" className="grow px-3">Time</ToggleItem>
                                    <ToggleItem value="Host" className="grow px-3">Host</ToggleItem>
                                    <ToggleItem value="Count" className="grow px-3">Count</ToggleItem>
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
                footer={<Pagination currentPage={page} totalItems={values.length} pageSize={pageSize} onPageChange={setPage} />}
            />

        </MainContainer>
    );
}

export default FailedHistory;