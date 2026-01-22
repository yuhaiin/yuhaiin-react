"use client"

import { CardList, IconBadge, MainContainer, SettingLabel } from "@/app/component/cardlist"
import { TimestampZero } from "@/app/component/components"
import { timestampDate } from "@bufbuild/protobuf/wkt"
import React, { FC, useMemo, useState } from "react"
import { Button, Dropdown, Modal, Spinner, ToggleButton, ToggleButtonGroup } from "react-bootstrap"
import Loading from "../../../component/loading"
import { CustomPagination } from "../../../component/pagination"
import { useProtoSWR } from "../../common/proto"
import { connections, failed_history } from "../../pbes/api/statistic_pb"
import { type } from "../../pbes/statistic/config_pb"
import { ListGroupItemString } from "../components"


// --- Component: Individual Failed History Row ---
const ListItem: FC<{ data: failed_history }> = React.memo(({ data }) => {
    return (
        <>
            <div className="d-flex w-100 flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">

                {/* Left Side: Icon + Host & Error Preview */}
                <div className="d-flex align-items-center flex-grow-1 overflow-hidden gap-3 w-100 w-md-auto">
                    <div className="d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle flex-shrink-0" style={{ width: '42px', height: '42px' }}>
                        <i className="bi bi-bug fs-5"></i>
                    </div>

                    <div className="d-flex flex-column overflow-hidden" style={{ minWidth: 0 }}>
                        <span className="fw-bold text-truncate fs-6 text-danger text-opacity-75">{data.host}</span>
                        <small className="text-muted text-truncate opacity-75 font-monospace">
                            {data.error || "Unknown Error"}
                        </small>
                    </div>
                </div>

                {/* Right Side: Metadata Badges */}
                <div className="d-flex flex-wrap gap-2 align-items-center flex-shrink-0">
                    <IconBadge icon="bi-ethernet" text={type[data.protocol ?? type.unknown]} color="info" />
                    <IconBadge icon="bi-exclamation-octagon" text={`${data.failedCount} Fails`} color="warning" />
                    <IconBadge icon="bi-clock" text={timestampDate(data.time!).toLocaleTimeString()} color="secondary" />
                    <i className="bi bi-chevron-right text-muted opacity-25 ms-2 d-none d-md-block"></i>
                </div>
            </div>
        </>
    );
});

// --- Component: Failed Details Modal ---
const InfoModal: FC<{ data?: failed_history, show: boolean, onClose: () => void }> = React.memo(({ data, show, onClose }) => {
    if (!data) return null;
    return (
        <Modal show={show} onHide={onClose} centered scrollable>
            <Modal.Header closeButton className="border-0">
                <Modal.Title className="fw-bold text-danger">Failure Details</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-0">
                <div>
                    <ListGroupItemString itemKey="Host" itemValue={data.host} />
                    <ListGroupItemString itemKey="Network" itemValue={type[data.protocol ?? type.unknown]} />
                    <ListGroupItemString itemKey="Failures" itemValue={String(data.failedCount)} />
                    <ListGroupItemString itemKey="Last Error" itemValue={data.error} />
                    <ListGroupItemString itemKey="Process" itemValue={data.process || "System"} />
                    <ListGroupItemString itemKey="Timestamp" itemValue={timestampDate(data.time!).toLocaleString()} />
                </div>
            </Modal.Body>
            <Modal.Footer className="border-0">
                <Button variant="outline-secondary" className="w-100" onClick={onClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
});

function FailedHistory() {
    const [sortBy, setSortBy] = useState("Time");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const [info, setInfo] = useState<{ data?: failed_history, show: boolean }>({ show: false });

    const { data, error, isLoading, isValidating, mutate } = useProtoSWR(connections.method.failed_history);

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
            <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-3">
                <div>
                    <h4 className="fw-bold mb-1">Failed Connections</h4>
                    <div className="text-muted d-flex align-items-center small">
                        <i className="bi bi-bug-fill text-danger me-2"></i>
                        <span>Tracking {values.length} rejected or timed-out requests</span>
                    </div>
                </div>

                <div className="d-flex flex-wrap gap-2 justify-content-end align-items-center">
                    <Button variant="outline-primary" size="sm" onClick={() => mutate()} disabled={isValidating}>
                        {isValidating ? <Spinner size="sm" animation="border" /> : <i className="bi bi-arrow-clockwise"></i>}
                    </Button>

                    <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                            <i className="bi bi-sort-down me-1"></i> Sort
                        </Dropdown.Toggle>
                        <Dropdown.Menu align="end" className="p-3 shadow-lg border-0" style={{ minWidth: '220px' }}>
                            <div className="mb-3">
                                <SettingLabel>Order</SettingLabel>
                                <ToggleButtonGroup type="radio" name="sortOrder" value={sortOrder} onChange={setSortOrder} className="w-100">
                                    <ToggleButton id="f-asc" value="asc" variant="outline-secondary" size="sm">ASC</ToggleButton>
                                    <ToggleButton id="f-desc" value="desc" variant="outline-secondary" size="sm">DESC</ToggleButton>
                                </ToggleButtonGroup>
                            </div>
                            <div>
                                <SettingLabel>By</SettingLabel>
                                <ToggleButtonGroup type="radio" name="sortBy" value={sortBy} onChange={setSortBy} className="w-100">
                                    <ToggleButton id="f-time" value="Time" variant="outline-secondary" size="sm">Time</ToggleButton>
                                    <ToggleButton id="f-host" value="Host" variant="outline-secondary" size="sm">Host</ToggleButton>
                                    <ToggleButton id="f-count" value="Count" variant="outline-secondary" size="sm">Count</ToggleButton>
                                </ToggleButtonGroup>
                            </div>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>

            <CardList
                items={paginatedItems}
                onClickItem={(item) => setInfo({ show: true, data: item })}
                renderListItem={(item) => <ListItem data={item} />}
                footer={<CustomPagination currentPage={page} totalItems={values.length} pageSize={pageSize} onPageChange={setPage} />}
            />

        </MainContainer>
    );
}

export default FailedHistory;