"use client"

import { create } from "@bufbuild/protobuf"
import { timestampDate, TimestampSchema } from "@bufbuild/protobuf/wkt"
import React, { FC, useCallback, useMemo, useState } from "react"
import { Badge, Button, Dropdown, Modal, Spinner, ToggleButton, ToggleButtonGroup } from "react-bootstrap"
import Loading from "../../common/loading"
import { CustomPagination } from "../../common/pagination"
import { useProtoSWR } from "../../common/proto"
import { block_history, rules } from "../../pbes/api/config_pb"
import styles from '../../connections/v2/connections.module.css';
import { ListGroupItemString } from "../../connections/components"

const TimestampZero = create(TimestampSchema, { seconds: BigInt(0), nanos: 0 })

const IconBadge: FC<{ icon: string, text: string | number, className?: string }> = ({ icon, text, className }) => {
    return <Badge pill bg="secondary" className={className}>
        <i className={`bi ${icon} me-1`}></i>
        {text}
    </Badge>
}

const ListItemComponent: FC<{ data: block_history, onClick?: () => void }> =
    ({ data, onClick }) => {
        return (
            <li
                className={styles['list-item']}
                onClick={onClick}
            >
                <div className={styles['item-main']}>
                    <span className={styles['item-addr']}>{data.host}</span>
                </div>

                <div className={styles['item-details-right']}>
                    <div className={styles['item-details']}>
                        <IconBadge icon="bi-ethernet" text={data.protocol} />
                        <IconBadge icon="bi-bug" text={Number(data.blockCount)} />
                        <IconBadge icon="bi-clock" text={timestampDate(data.time!).toLocaleTimeString()} />
                    </div>
                </div>
            </li>
        );
    }

const ListItem = React.memo(ListItemComponent)

const InfoModalComponent: FC<{
    data?: block_history,
    show: boolean,
    onClose: () => void,
}> = ({ data, show, onClose: handleClose }) => {
    if (!data) return <></>
    return (
        <Modal
            show={show}
            onHide={handleClose}
            scrollable
            centered
            contentClassName="border-0 shadow-lg"
        >
            <Modal.Header closeButton className="border-bottom-0 pb-0">
                <Modal.Title className="h5 fw-bold">
                    Block History Details
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="pt-2">
                <ListGroupItemString itemKey="Time" itemValue={timestampDate(data.time!).toLocaleString()} />
                <ListGroupItemString itemKey="Net" itemValue={data.protocol} />
                <ListGroupItemString itemKey="Host" itemValue={data.host} />
                <ListGroupItemString itemKey="Count" itemValue={String(data.blockCount)} />
                <ListGroupItemString itemKey="Process" itemValue={data.process} />
            </Modal.Body>

            <Modal.Footer className="border-top-0 pt-0 pb-3 px-3">
                <Button
                    variant="secondary"
                    className="w-100 py-2 d-flex align-items-center justify-content-center notranslate"
                    onClick={handleClose}
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

const InfoModal = React.memo(InfoModalComponent)


function BypassBlockHistory() {
    const [sortBy, setSortBy] = useState("Time")
    const changeSortBy = useCallback((value: string) => {
        setSortBy(value)
    }, [setSortBy])


    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const changeSortOrder = useCallback((value: "asc" | "desc") => {
        setSortOrder(value)
    }, [setSortOrder])

    const [page, setPage] = useState(1);
    const [info, setInfo] = useState<{ data?: block_history, show: boolean }>({
        show: false
    });

    const hideInfo = useCallback(() => {
        setInfo(prev => { return { ...prev, show: false } })
    }, [])


    const { data, error, isLoading, isValidating, mutate } = useProtoSWR(rules.method.block_history)

    const values = useMemo(() => {
        if (!data?.objects) return []
        return data.objects.filter(v => v.time).sort((a, b) => {
            let first = 1;
            let second = -1;

            if (sortOrder === "asc") {
                first = -1;
                second = 1;
            }

            if (sortBy) {
                switch (sortBy) {
                    case "Host":
                        return a.host < b.host ? first : second
                    case "Count":
                        return Number(a.blockCount) < Number(b.blockCount) ? first : second
                    case "Proc":
                        return (a.process ?? "") < (b.process ?? "") ? first : second
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
    }, [data, sortBy, sortOrder])

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />
    return <>
        <InfoModal
            data={info.data}
            show={info.show}
            onClose={hideInfo}
        />

        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
            <CustomPagination
                currentPage={page}
                totalItems={values.length}
                pageSize={30}
                onPageChange={(p) => { setPage(p) }}
            />
            <div className="d-flex align-items-center gap-2">
                <Button
                    variant="outline-primary"
                    onClick={() => mutate()}
                    disabled={isValidating || isLoading}
                >
                    <i className="bi bi-arrow-clockwise" /> {(isValidating || isLoading) && <>&nbsp;<Spinner size="sm" animation="border" /></>}
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
                                {data.dumpProcessEnabled && <ToggleButton id="sort-proc" value="Proc" variant="outline-secondary">
                                    Proc
                                </ToggleButton>}
                            </ToggleButtonGroup>
                        </div>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        </div>

        <ul className={styles['connections-list']}>
            {
                values.slice((page - 1) * 30, (page - 1) * 30 + 30).map((e, i) => {
                    return <ListItem
                        data={e}
                        key={`${i}-${e.host}`}
                        onClick={() => setInfo({ data: e, show: true })}
                    />
                })
            }
        </ul>
    </>
}

export default BypassBlockHistory