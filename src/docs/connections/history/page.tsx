"use client"

// import { FilterTypeSelect } from "@/component/switch"
import { useDelay } from "@/common/hooks"
import { TimestampZero } from "@/common/nodes"
import { Button } from "@/component/v2/button"
import { CardList, FilterSearch, IconBadge, MainContainer, SettingLabel } from "@/component/v2/card"
import { DataListItem } from "@/component/v2/datalist"
import { Dropdown, DropdownContent, DropdownTrigger } from "@/component/v2/dropdown"
import { SettingTypeSelect } from "@/component/v2/forms"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal"
import { Pagination } from "@/component/v2/pagination"
import { Spinner } from "@/component/v2/spinner"
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import { create } from "@bufbuild/protobuf"
import { timestampDate } from "@bufbuild/protobuf/wkt"
import { ArrowDownWideNarrow, ArrowLeftRight, ChevronRight, Clock, Info, Radio, RefreshCw, RotateCw, ShieldCheck } from 'lucide-react'
import React, { FC, useCallback, useMemo, useState } from "react"
import { useProtoSWR } from "../../../common/proto"
import Loading from "../../../component/v2/loading"
import { NodeModal } from "../../node/modal"
import { all_history, connections } from "../../pbes/api/statistic_pb"
import { mode } from "../../pbes/config/bypass_pb"
import { connectionSchema, type, typeSchema } from "../../pbes/statistic/config_pb"
import { ConnectionInfo } from "../components"

const netTypeMap = Object.fromEntries(typeSchema.values.map(({ number, name }) => [number, name]));

// --- Component: Individual History Row (Subscribe Style) ---
const ListItem: FC<{ data: all_history }> = React.memo(({ data }) => {
    if (!data.connection) return null;
    return (
        <>
            {/* Left Side: Icon + Address & ID (Subscribe style) */}
            <div className="flex items-center grow overflow-hidden gap-3 w-full md:w-auto">
                <div className="flex items-center justify-center bg-blue-500/10 text-blue-500 rounded-full shrink-0" style={{ width: '42px', height: '42px' }}>
                    {data.connection.type?.connType === type.udp ? <Radio className="text-xl" /> : <ArrowLeftRight className="text-xl" />}
                </div>

                <div className="flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
                    <span className="font-bold truncate text-base">{data.connection.addr}</span>
                    <small className="text-gray-500 dark:text-gray-400 font-mono opacity-75">
                        ID: #{data.connection.id.toString()} • {type[data.connection.type?.connType ?? 0]}
                    </small>
                </div>
            </div>

            {/* Right Side: Metadata Badges */}
            <div className="flex flex-wrap gap-2 items-center shrink-0 md:ml-0">
                <IconBadge icon={ShieldCheck} text={mode[data.connection.mode]} color="info" />
                <IconBadge icon={RefreshCw} text={Number(data.count)} color="success" />
                <IconBadge icon={Clock} text={timestampDate(data.time!).toLocaleTimeString()} color="secondary" />
                <div className="text-gray-500 dark:text-gray-400 opacity-25 ml-2 hidden md:block"><ChevronRight /></div>
            </div>
        </>
    );
});

function History() {
    const [sortBy, setSortBy] = useState("Time")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [filter, setFilter] = useState("");
    const [netFilter, setNetFilter] = useState<type>(type.unknown);
    const [page, setPage] = useState(1);
    const [modalData, setModalData] = useState<{ show: boolean, data?: all_history }>({ show: false });
    const [nodeModal, setNodeModal] = useState<{ show: boolean, hash: string }>({ show: false, hash: "" });
    const shouldFetch = useDelay(400);

    const { data, error, isLoading, isValidating, mutate } = useProtoSWR(shouldFetch ? connections.method.all_history : null);

    const showNodeModal = useCallback((hash: string) => {
        setNodeModal({ show: true, hash: hash });
    }, []);

    const values = useMemo(() => {
        if (!data?.objects) return []
        return data.objects
            .filter(v => {
                if (!v.time || !v.connection) return false
                if (netFilter && v.connection?.type?.connType !== netFilter) return false
                if (filter) return v.connection.addr?.toLowerCase().includes(filter) ||
                    v.connection.process?.toLowerCase().includes(filter)
                return true
            })
            .sort((a, b) => {
                const first = sortOrder === "asc" ? -1 : 1;
                const second = sortOrder === "asc" ? 1 : -1;
                if (sortBy === "Host") return (a.connection?.addr ?? "") < (b.connection?.addr ?? "") ? first : second;
                if (sortBy === "Count") return Number(a.count) < Number(b.count) ? first : second;

                const aTime = a.time ?? TimestampZero;
                const bTime = b.time ?? TimestampZero;
                if (aTime.seconds < bTime.seconds) return first;
                if (aTime.seconds > bTime.seconds) return second;
                return 0;
            })
    }, [data, filter, netFilter, sortBy, sortOrder]);

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const pageSize = 30;
    const paginatedItems = values.slice((page - 1) * pageSize, page * pageSize);

    return (
        <MainContainer>
            <NodeModal
                editable={false}
                show={nodeModal.show}
                hash={nodeModal.hash}
                onHide={() => setNodeModal(prev => ({ ...prev, show: false }))}
            />

            {/* Details Modal */}
            <Modal
                open={!nodeModal.show && modalData.show}
                onOpenChange={(open) => !open && setModalData(prev => ({ ...prev, show: false }))}
            >
                <ModalContent>
                    <ModalHeader closeButton>
                        <ModalTitle className="font-bold">Session Detail</ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                        <ConnectionInfo
                            showNodeModal={showNodeModal}
                            value={modalData.data?.connection ?? create(connectionSchema, {})}
                            startContent={
                                <>
                                    <DataListItem label="Total Count" value={modalData.data?.count.toString() ?? "1"} />
                                    <DataListItem label="Last Activity" value={timestampDate(modalData.data?.time ?? TimestampZero).toLocaleString()} />
                                </>
                            }
                        />
                    </ModalBody>
                    <ModalFooter className="border-0">
                        <Button variant="default" className="w-full" onClick={() => setModalData(prev => ({ ...prev, show: false }))}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* --- Top Action Bar --- */}
            <div className="flex flex-wrap justify-between items-end mb-4 gap-3">
                <div>
                    <h4 className="font-bold mb-1">Connection History</h4>
                    <div className="text-gray-500 dark:text-gray-400 flex items-center text-sm">
                        <Info className="mr-2" />
                        <span>Showing {values.length} historical records</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end items-center">
                    <FilterSearch onEnter={setFilter} size="sm" />

                    <SettingTypeSelect
                        type={typeSchema}
                        value={netFilter}
                        onChange={setNetFilter}
                        format={(v) => v === 0 ? "All Networks" : netTypeMap[v] ?? "Unknown"}
                        className="mb-0"
                        triggerClassName="py-0"
                        size="sm"
                        style={{ minWidth: "120px" }}
                    />

                    <Button size="sm" onClick={() => mutate()} disabled={isValidating}>
                        {isValidating ? <Spinner size="sm" /> : <RotateCw size={16} />}
                    </Button>

                    <Dropdown>
                        <DropdownTrigger asChild>
                            <Button size="sm">
                                <ArrowDownWideNarrow className="mr-1" size={16} />
                            </Button>
                        </DropdownTrigger>
                        <DropdownContent align="end" className="p-3" style={{ minWidth: '250px' }}>
                            <div className="mb-3">
                                <SettingLabel>Sort Order</SettingLabel>
                                <ToggleGroup type="single" value={sortOrder} onValueChange={(v) => v && setSortOrder(v as "asc" | "desc")} className="w-full">
                                    <ToggleItem value="asc" className="grow">Asc</ToggleItem>
                                    <ToggleItem value="desc" className="grow">Desc</ToggleItem>
                                </ToggleGroup>
                            </div>
                            <div>
                                <SettingLabel>Sort By</SettingLabel>
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
                getKey={(v) => `${v.connection?.id}-${v.time?.seconds}`}
                onClickItem={(v) => setModalData({ show: true, data: v })}
                renderListItem={(v) => <ListItem data={v} />}
                footer={
                    <Pagination
                        currentPage={page}
                        totalItems={values.length}
                        pageSize={pageSize}
                        onPageChange={setPage}
                    />
                }
            />
        </MainContainer>
    );
}

export default History;