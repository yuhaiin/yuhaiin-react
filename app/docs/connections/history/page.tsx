"use client"

import { create } from "@bufbuild/protobuf"
import { timestampDate, TimestampSchema } from "@bufbuild/protobuf/wkt"
import React, { FC, useCallback, useMemo, useState } from "react"
import { Badge, Button, Dropdown, Form, InputGroup, Modal, Spinner, ToggleButton, ToggleButtonGroup } from "react-bootstrap"
import Loading from "../../common/loading"
import { CustomPagination } from "../../common/pagination"
import { useProtoSWR } from "../../common/proto"
import { NodeModal } from "../../node/modal"
import { all_history, connections } from "../../pbes/api/statistic_pb"
import { mode } from "../../pbes/config/bypass_pb"
import { connectionSchema, type, typeSchema } from "../../pbes/statistic/config_pb"
import { ConnectionInfo, ListGroupItemString } from "../components"
import styles from '../v2/connections.module.css'

const TimestampZero = create(TimestampSchema, { seconds: BigInt(0), nanos: 0 })

const IconBadge: FC<{ icon: string, text: string | number, className?: string }> = ({ icon, text, className }) => {
    return <Badge pill bg="primary" className={className}>
        <i className={`bi ${icon} me-1`}></i>
        {text}
    </Badge>
}

const ListItemComponent: FC<{ data: all_history, onClick?: () => void }> =
    ({ data, onClick }) => {
        if (!data.connection) return <></>

        return (
            <li
                className={styles['list-item']}
                onClick={onClick}
            >
                <div className={styles['item-main']}>
                    <code className={styles['item-id']}>{data.connection.id.toString()}</code>
                    <span className={styles['item-addr']}>{data.connection.addr}</span>
                </div>

                <div className={styles['item-details-right']}>
                    <div className={styles['item-details']}>
                        <IconBadge icon="bi-shield-check" text={mode[data.connection.mode]} />
                        <IconBadge icon="bi-hdd-network" text={type[data.connection.type?.connType ?? 0]} />
                        <IconBadge icon="bi-arrow-repeat" text={Number(data.count)} />
                        <IconBadge icon="bi-clock" text={timestampDate(data.time!).toLocaleTimeString()} />
                    </div>
                </div>
            </li>
        );
    }

const ListItem = React.memo(ListItemComponent)

function History() {

    const [sortBy, setSortBy] = useState("Time")
    const changeSortBy = useCallback((value: string) => {
        setSortBy(value)
    }, [setSortBy])


    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // 'asc' | 'desc'
    const changeSortOrder = useCallback((value: "asc" | "desc") => {
        setSortOrder(value)
    }, [setSortOrder])

    const [filter, setFilter] = useState("");
    const [filterInput, setFilterInput] = useState("");
    const [netFilter, setNetFilter] = useState<type>(type.unknown);


    const [page, setPage] = useState(1);


    const [modalData, setModalData] = useState<{ show: boolean, data?: all_history }>({ show: false })
    const { data, error, isLoading, isValidating, mutate } = useProtoSWR(connections.method.all_history)

    const values = useMemo(() => {
        if (!data?.objects) return []
        return data.objects?.
            filter(v => {
                if (!v.time || !v.connection) return false
                if (netFilter && v.connection?.type?.connType !== netFilter) return false
                if (filter) return v.connection.addr?.toLowerCase().includes(filter) ||
                    v.connection.process?.toLowerCase().includes(filter)
                return true
            }).
            sort((a, b) => {
                let first = 1;
                let second = -1;

                if (sortOrder === "asc") {
                    first = -1;
                    second = 1;
                }

                if (sortBy) {
                    switch (sortBy) {
                        case "Host":
                            return (a.connection?.addr ?? "") < (b.connection?.addr ?? "") ? first : second
                        case "Count":
                            return Number(a.count) < Number(b.count) ? first : second
                    }
                }

                const aTime = a.time ?? TimestampZero;
                const bTime = b.time ?? TimestampZero;

                if (aTime.seconds < bTime.seconds) return first;
                if (aTime.seconds > bTime.seconds) return second;
                if (aTime.nanos < bTime.nanos) return first;
                if (aTime.nanos > bTime.nanos) return second;
                return 0;
            })
    }, [data, filter, netFilter, sortBy, sortOrder])



    const [nodeModal, setNodeModal] = useState<{ show: boolean, hash: string }>({ show: false, hash: "" });
    const showNodeModal = useCallback((hash: string) => {
        setNodeModal({ show: true, hash: hash });
    }, []);

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />



    return <>
        <NodeModal
            editable={false}
            show={nodeModal.show}
            hash={nodeModal.hash}
            onHide={() => setNodeModal({ show: false, hash: "" })}
        />

        <Modal
            scrollable
            centered
            show={!nodeModal.show && modalData.show}
            onHide={() => setModalData(prev => { return { ...prev, show: false } })}
        >
            <Modal.Body>
                <ConnectionInfo
                    showNodeModal={showNodeModal}
                    value={modalData.data?.connection ?? create(connectionSchema, {})}
                    startContent={
                        <>
                            <ListGroupItemString itemKey="Count" itemValue={modalData.data?.count.toString() ?? "1"} />
                            <ListGroupItemString itemKey="Time" itemValue={timestampDate(modalData.data?.time ?? TimestampZero).toLocaleString()} />
                        </>
                    }
                />
            </Modal.Body>
            <Modal.Footer className="d-flex">
                <Button
                    variant="outline-primary"
                    className="flex-grow-1 notranslate"
                    onClick={() => setModalData(prev => { return { ...prev, show: false } })}
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>


        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <CustomPagination
                currentPage={page}
                totalItems={values.length}
                pageSize={30}
                onPageChange={(p) => { setPage(p) }}
            />
            <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
                <InputGroup style={{ width: 'auto' }}>
                    <Form.Control value={filterInput} onChange={(e) => setFilterInput(e.target.value)} placeholder="Filter..." />
                    <Button onClick={() => { setFilter(filterInput.toLowerCase()) }}>
                        <i className="bi bi-funnel" />
                    </Button>
                </InputGroup>

                <Form.Select
                    value={netFilter}
                    onChange={(e) => setNetFilter(Number(e.target.value))}
                    style={{ width: 'auto' }}
                >
                    {
                        typeSchema.values.map((v) =>
                            <option key={v.number} value={v.number}>
                                {v.number === 0 ? "All Net" : v.name}
                            </option>
                        )
                    }
                </Form.Select>

                <Button
                    variant="outline-primary"
                    onClick={() => mutate()}
                    disabled={isValidating || isLoading}
                >
                    <i className="bi bi-arrow-clockwise" />{(isValidating || isLoading) && <>&nbsp;<Spinner size="sm" animation="border" /></>}
                </Button>
                <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary">
                        <i className="bi bi-sort-down"></i> Sort
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <div className="p-2 d-flex flex-column gap-2">
                            <ToggleButtonGroup type="radio" name="sortOrder" value={sortOrder} onChange={changeSortOrder}>
                                <ToggleButton id="sort-asc" value="asc" variant="outline-secondary">
                                    <i className="bi bi-sort-up"></i> Asc
                                </ToggleButton>
                                <ToggleButton id="sort-desc" value="desc" variant="outline-secondary">
                                    <i className="bi bi-sort-down"></i> Desc
                                </ToggleButton>
                            </ToggleButtonGroup>

                            <ToggleButtonGroup type="radio" name="sortBy" value={sortBy} onChange={changeSortBy}>
                                <ToggleButton id="sort-time" value="Time" variant="outline-secondary">
                                    Time
                                </ToggleButton>
                                <ToggleButton id="sort-host" value="Host" variant="outline-secondary">
                                    Host
                                </ToggleButton>
                                <ToggleButton id="sort-count" value="Count" variant="outline-secondary">
                                    Count
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </div>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>

        <ul className={styles['connections-list']}>
            {
                values.slice((page - 1) * 30, (page - 1) * 30 + 30).map((v, index) => {
                    return (
                        <ListItem data={v} key={`his-${index}`} onClick={() => setModalData({ show: true, data: v })} />
                    )
                })
            }
        </ul>
    </>
}

export default History
