"use client"

// import { FilterTypeSelect } from "@/app/component/switch"
import { Button } from "@/app/component/v2/button"
import { CardList, FilterSearch, IconBadge, MainContainer, SettingLabel } from "@/app/component/v2/card"
import { Dropdown, DropdownContent, DropdownTrigger } from "@/app/component/v2/dropdown"
import { SettingTypeSelect } from "@/app/component/v2/forms"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/app/component/v2/modal"
import { Spinner } from "@/app/component/v2/spinner"
import { ToggleGroup, ToggleItem } from "@/app/component/v2/togglegroup"
import { create } from "@bufbuild/protobuf"
import { timestampDate } from "@bufbuild/protobuf/wkt"
import React, { FC, useCallback, useMemo, useState } from "react"
import { ArrowClockwise, ArrowLeftRight, ArrowRepeat, Broadcast, ChevronRight, Clock, InfoCircle, ShieldCheck, SortDown } from "react-bootstrap-icons"
import Loading from "../../../component/loading"
// import { CustomPagination } from "../../../component/pagination"
import { Pagination } from "@/app/component/v2/pagination"
import { TimestampZero } from "../../common/nodes"
import { useProtoSWR } from "../../common/proto"
import { NodeModal } from "../../node/modal"
import { all_history, connections } from "../../pbes/api/statistic_pb"
import { mode } from "../../pbes/config/bypass_pb"
import { connectionSchema, type, typeSchema } from "../../pbes/statistic/config_pb"
import { ConnectionInfo, ListGroupItemString } from "../components"


// --- Component: Individual History Row (Subscribe Style) ---
const ListItem: FC<{ data: all_history }> = React.memo(({ data }) => {
    if (!data.connection) return null;
    return (
        <>
            {/* Left Side: Icon + Address & ID (Subscribe style) */}
            <div className="d-flex align-items-center flex-grow-1 overflow-hidden gap-3 w-100 w-md-auto">
                <div className="d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle flex-shrink-0" style={{ width: '42px', height: '42px' }}>
                    {data.connection.type?.connType === type.udp ? <Broadcast className="fs-5" /> : <ArrowLeftRight className="fs-5" />}
                </div>

                <div className="d-flex flex-column overflow-hidden" style={{ minWidth: 0 }}>
                    <span className="fw-bold text-truncate fs-6">{data.connection.addr}</span>
                    <small className="text-muted font-monospace opacity-75">
                        ID: #{data.connection.id.toString()} • {type[data.connection.type?.connType ?? 0]}
                    </small>
                </div>
            </div>

            {/* Right Side: Metadata Badges */}
            <div className="d-flex flex-wrap gap-2 align-items-center flex-shrink-0 ms-md-0">
                <IconBadge icon={ShieldCheck} text={mode[data.connection.mode]} color="info" />
                <IconBadge icon={ArrowRepeat} text={Number(data.count)} color="success" />
                <IconBadge icon={Clock} text={timestampDate(data.time!).toLocaleTimeString()} color="secondary" />
                <div className="text-muted opacity-25 ms-2 d-none d-md-block"><ChevronRight /></div>
            </div>
        </>
    );
});

function History() {
    const [sortBy, setSortBy] = useState("Time")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [filter, setFilter] = useState("");
    const [filterInput, setFilterInput] = useState("");
    const [netFilter, setNetFilter] = useState<type>(type.unknown);
    const [page, setPage] = useState(1);
    const [modalData, setModalData] = useState<{ show: boolean, data?: all_history }>({ show: false });
    const [nodeModal, setNodeModal] = useState<{ show: boolean, hash: string }>({ show: false, hash: "" });

    const { data, error, isLoading, isValidating, mutate } = useProtoSWR(connections.method.all_history);

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
                onHide={() => setNodeModal({ show: false, hash: "" })}
            />

            {/* Details Modal */}
            <Modal open={!nodeModal.show && modalData.show} onOpenChange={(open) => !open && setModalData({ show: false })}>
                <ModalContent>
                    <ModalHeader closeButton>
                        <ModalTitle className="fw-bold">Session Detail</ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                        <ConnectionInfo
                            showNodeModal={showNodeModal}
                            value={modalData.data?.connection ?? create(connectionSchema, {})}
                            startContent={
                                <>
                                    <ListGroupItemString itemKey="Total Count" itemValue={modalData.data?.count.toString() ?? "1"} />
                                    <ListGroupItemString itemKey="Last Activity" itemValue={timestampDate(modalData.data?.time ?? TimestampZero).toLocaleString()} />
                                </>
                            }
                        />
                    </ModalBody>
                    <ModalFooter className="border-0">
                        <Button variant="default" className="w-100" onClick={() => setModalData({ show: false })}>Close</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* --- Top Action Bar --- */}
            <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-3">
                <div>
                    <h4 className="fw-bold mb-1">Connection History</h4>
                    <div className="text-muted d-flex align-items-center small">
                        <InfoCircle className="me-2" />
                        <span>Showing {values.length} historical records</span>
                    </div>
                </div>

                <div className="d-flex flex-wrap gap-2 justify-content-end align-items-center">
                    <FilterSearch onEnter={setFilter} size="sm" />

                    <SettingTypeSelect
                        type={typeSchema}
                        value={netFilter}
                        onChange={setNetFilter}
                        format={(v) => v === 0 ? "All Networks" : typeSchema.values.find(x => x.number === v)?.name ?? "Unknown"}
                        className="mb-0"
                        triggerClassName="py-0"
                    />

                    <Button variant="outline-primary" size="sm" onClick={() => mutate()} disabled={isValidating}>
                        {isValidating ? <Spinner size="sm" /> : <ArrowClockwise />}
                    </Button>

                    <Dropdown>
                        <DropdownTrigger asChild>
                            <Button variant="outline-secondary" size="sm">
                                <SortDown className="me-1" />
                            </Button>
                        </DropdownTrigger>
                        <DropdownContent align="end" className="p-3" style={{ minWidth: '220px' }}>
                            <div className="mb-3">
                                <SettingLabel>Sort Order</SettingLabel>
                                <ToggleGroup type="single" value={sortOrder} onValueChange={(v) => v && setSortOrder(v as "asc" | "desc")} className="w-100">
                                    <ToggleItem value="asc" className="flex-grow-1">Asc</ToggleItem>
                                    <ToggleItem value="desc" className="flex-grow-1">Desc</ToggleItem>
                                </ToggleGroup>
                            </div>
                            <div>
                                <SettingLabel>Sort By</SettingLabel>
                                <ToggleGroup type="single" value={sortBy} onValueChange={(v) => v && setSortBy(v)} className="w-100">
                                    <ToggleItem value="Time" className="flex-grow-1">Time</ToggleItem>
                                    <ToggleItem value="Host" className="flex-grow-1">Host</ToggleItem>
                                    <ToggleItem value="Count" className="flex-grow-1">Count</ToggleItem>
                                </ToggleGroup>
                            </div>
                        </DropdownContent>
                    </Dropdown>
                </div>
            </div>

            <CardList
                items={paginatedItems}
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