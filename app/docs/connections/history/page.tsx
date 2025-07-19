"use client"

import { create } from "@bufbuild/protobuf"
import { timestampDate, TimestampSchema } from "@bufbuild/protobuf/wkt"
import { useCallback, useMemo, useState } from "react"
import { Button, Form, InputGroup, ListGroup, Modal, Spinner, Table } from "react-bootstrap"
import styles from "../../common/clickable.module.css"
import Loading from "../../common/loading"
import { CustomPagination } from "../../common/pagination"
import { useProtoSWR } from "../../common/proto"
import { connectionSchema, type, typeSchema } from "../../pbes/statistic/config_pb"
import { all_history, connections } from "../../pbes/statistic/grpc/config_pb"
import { ConnectionInfo, ListGroupItemString } from "../components"

const TimestampZero = create(TimestampSchema, { seconds: BigInt(0), nanos: 0 })

function History() {

    const [sort, setSort] = useState("Time")
    const [asc, setAsc] = useState(1)
    const setSortField = (field: string) => field === sort ? setAsc(-asc) : setSort(field)
    const sortIcon = (field: string) => field === sort ? <i className={asc === -1 ? "bi bi-sort-up-alt" : "bi bi-sort-down-alt"}></i> : <></>
    function sortFuncGeneric<T>(a: T, b: T) { return a > b ? -1 * asc : 1 * asc }
    const sortFunc = useCallback(sortFuncGeneric, [asc]);
    const cth = (field: string) => <th className={styles.clickable} onClick={() => setSortField(field)}>{field}{sortIcon(field)}</th>
    const sortFieldFunc = useCallback((a: all_history, b: all_history) => {
        if (sort === "Host") return sortFunc(a.connection?.addr, b.connection?.addr)
        else if (sort === "Proc") return sortFunc(a.connection?.process, b.connection?.process)
        else if (sort === "Count") return sortFunc(a.count, b.count)
        else return sortFunc(timestampDate(a.time ?? TimestampZero), timestampDate(b.time ?? TimestampZero))
    }, [sort, sortFunc])

    const [filter, setFilter] = useState("");
    const [filterInput, setFilterInput] = useState("");
    const [netFilter, setNetFilter] = useState<type>(type.unknown);


    const [page, setPage] = useState(1);


    const [modalData, setModalData] = useState<{ show: boolean, data?: all_history }>({ show: false })
    const { data, error, isLoading, isValidating, mutate } = useProtoSWR(connections.method.all_history)

    const objects = useMemo(() => {
        return data?.objects?.
            filter(v => {
                if (!v.time) return false
                if (netFilter && v.connection?.type?.connType !== netFilter) return false
                if (filter) return v.connection.addr?.toLowerCase().includes(filter) ||
                    v.connection.process?.toLowerCase().includes(filter)
                return true
            }).
            sort(sortFieldFunc)
    }, [data, filter, netFilter, sortFieldFunc])

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />



    return <>
        <Modal centered show={modalData.show} onHide={() => setModalData(prev => { return { ...prev, show: false } })}>
            <Modal.Body>
                <ConnectionInfo
                    value={modalData.data?.connection ?? create(connectionSchema, {})}
                    startContent={
                        <>
                            <ListGroupItemString itemKey="Count" itemValue={modalData.data?.count.toString() ?? "1"} />
                            <ListGroupItemString itemKey="Time" itemValue={timestampDate(modalData.data?.time ?? TimestampZero).toLocaleString()} />
                        </>
                    }
                    endContent={
                        <>
                            <ListGroup.Item className="d-sm-flex justify-content-center">
                                <Button
                                    variant="outline-primary"
                                    className="flex-grow-1"
                                    onClick={() => setModalData(prev => { return { ...prev, show: false } })}
                                >
                                    Close
                                </Button>
                            </ListGroup.Item>
                        </>
                    }
                />
            </Modal.Body>
        </Modal>


        <div className="d-flex">
            <div className="d-flex align-items-center gap-2 mb-3 ms-auto flex-wrap">

                <span className="d-flex align-items-center gap-2">
                    <InputGroup>
                        <Form.Control value={filterInput} onChange={(e) => setFilterInput(e.target.value)} />
                        <Button onClick={() => { setFilter(filterInput.toLowerCase()) }}>
                            <i className="bi bi-funnel" />
                        </Button>
                    </InputGroup>
                </span>

                <span className="d-flex align-items-center gap-2">
                    <select
                        className="form-select"
                        value={netFilter}
                        onChange={(e) => setNetFilter(Number(e.target.value))}
                        style={{ width: 130 }}
                    >
                        {
                            typeSchema.values.map((v) =>
                                <option key={v.number} value={v.number}>
                                    {v.number === 0 ? "all" : v.name}
                                </option>
                            )
                        }
                    </select>
                </span>

                <Button
                    variant="outline-primary"
                    onClick={() => mutate()}
                    disabled={isValidating || isLoading}
                >
                    <i className="bi bi-arrow-clockwise" />{(isValidating || isLoading) && <>&nbsp;<Spinner size="sm" animation="border" /></>}
                </Button>
            </div>
        </div>

        <CustomPagination
            currentPage={page}
            totalItems={objects.length}
            pageSize={30}
            onPageChange={(p) => { setPage(p) }}
        />

        <Table hover striped size="sm">
            <thead>
                <tr>
                    <th>Index</th>
                    {cth("Time")}
                    {cth("Host")}
                    <th>Mode</th>
                    <th>Net</th>
                    {cth("Count")}
                    {data.dumpProcessEnabled && cth("Proc")}
                </tr>
            </thead>
            <tbody className="text-break">
                {
                    objects.slice((page - 1) * 30, (page - 1) * 30 + 30).map((v, index) => {
                        return (
                            <tr key={"bh-" + index} onClick={() => setModalData({ show: true, data: v })}>
                                <td>{index + (page - 1) * 30 + 1}</td>
                                <td>{timestampDate(v.time!).toLocaleString()}</td>
                                <td>{v.connection?.addr}</td>
                                <td>{v.connection?.mode}</td>
                                <td>{type[v.connection?.type?.connType ?? type.unknown]}</td>
                                <td>{Number(v.count)}</td>
                                {data.dumpProcessEnabled && <td>{v.connection?.process}</td>}
                            </tr>
                        )
                    })
                }
            </tbody>
        </Table>
    </>
}

export default History
