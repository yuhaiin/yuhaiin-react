"use client"

import { CardList, FilterSearch, IconBadge, MainContainer, SettingLabel } from "@/app/component/cardlist"
import { TimestampZero } from "@/app/component/components"
import { FilterTypeSelect } from "@/app/component/switch"
import { create } from "@bufbuild/protobuf"
import { timestampDate } from "@bufbuild/protobuf/wkt"
import React, { FC, useCallback, useMemo, useState } from "react"
import { Button, Dropdown, Modal, Spinner, ToggleButton, ToggleButtonGroup } from "react-bootstrap"
import Loading from "../../../component/loading"
import { CustomPagination } from "../../../component/pagination"
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
                    <i className={`bi ${data.connection.type?.connType === type.udp ? 'bi-broadcast' : 'bi-arrow-left-right'} fs-5`}></i>
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
                <IconBadge icon="bi-shield-check" text={mode[data.connection.mode]} color="info" />
                <IconBadge icon="bi-arrow-repeat" text={Number(data.count)} color="success" />
                <IconBadge icon="bi-clock" text={timestampDate(data.time!).toLocaleTimeString()} color="secondary" />
                <i className="bi bi-chevron-right text-muted opacity-25 ms-2 d-none d-md-block"></i>
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
            <Modal show={!nodeModal.show && modalData.show} onHide={() => setModalData({ show: false })} centered scrollable>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Session Detail</Modal.Title>
                </Modal.Header>
                <Modal.Body className="pt-0">
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
                </Modal.Body>
                <Modal.Footer className="border-0">
                    <Button variant="primary" className="w-100" onClick={() => setModalData({ show: false })}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* --- Top Action Bar --- */}
            <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-3">
                <div>
                    <h4 className="fw-bold mb-1">Connection History</h4>
                    <div className="text-muted d-flex align-items-center small">
                        <i className="bi bi-info-circle me-2"></i>
                        <span>Showing {values.length} historical records</span>
                    </div>
                </div>

                <div className="d-flex flex-wrap gap-2 justify-content-end align-items-center">
                    <FilterSearch onEnter={setFilter} />

                    <FilterTypeSelect
                        type={typeSchema}
                        value={netFilter}
                        onChange={setNetFilter}
                        format={(v) => v.number === 0 ? "All Networks" : v.name}
                    />

                    <Button variant="outline-primary" size="sm" onClick={() => mutate()} disabled={isValidating}>
                        {isValidating ? <Spinner size="sm" animation="border" /> : <i className="bi bi-arrow-clockwise"></i>}
                    </Button>

                    <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                            <i className="bi bi-sort-down me-1"></i>
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end" className="p-3 shadow-lg border-0" style={{ minWidth: '220px' }}>
                            <div className="mb-3">
                                <SettingLabel>Sort Order</SettingLabel>
                                <ToggleButtonGroup type="radio" name="sortOrder" value={sortOrder} onChange={setSortOrder} className="w-100">
                                    <ToggleButton id="t-asc" value="asc" variant="outline-secondary" size="sm">Ascending</ToggleButton>
                                    <ToggleButton id="t-desc" value="desc" variant="outline-secondary" size="sm">Descending</ToggleButton>
                                </ToggleButtonGroup>
                            </div>
                            <div>
                                <SettingLabel>Sort By</SettingLabel>
                                <ToggleButtonGroup type="radio" name="sortBy" value={sortBy} onChange={setSortBy} className="w-100">
                                    <ToggleButton id="s-time" value="Time" variant="outline-secondary" size="sm">Time</ToggleButton>
                                    <ToggleButton id="s-host" value="Host" variant="outline-secondary" size="sm">Host</ToggleButton>
                                    <ToggleButton id="s-count" value="Count" variant="outline-secondary" size="sm">Count</ToggleButton>
                                </ToggleButtonGroup>
                            </div>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>

            <CardList
                items={paginatedItems}
                onClickItem={(v) => setModalData({ show: true, data: v })}
                renderListItem={(v) => <ListItem data={v} />}
                footer={
                    <CustomPagination
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