"use client"

import { create } from "@bufbuild/protobuf"
import { timestampDate, TimestampSchema } from "@bufbuild/protobuf/wkt"
import { useState } from "react"
import { Button, Modal, Spinner, Table } from "react-bootstrap"
import styles from "../../common/clickable.module.css"
import Loading from "../../common/loading"
import { useProtoSWR } from "../../common/proto"
import { connectionSchema, type } from "../../pbes/statistic/config_pb"
import { all_history, connections } from "../../pbes/statistic/grpc/config_pb"
import { ConnectionInfo, ListGroupItem } from "../components"

const TimestampZero = create(TimestampSchema, { seconds: BigInt(0), nanos: 0 })

function History() {
    const [sort, setSort] = useState("Time")
    const [asc, setAsc] = useState(1)
    const setSortField = (field: string) => field === sort ? setAsc(-asc) : setSort(field)
    const sortIcon = (field: string) => field === sort ? <i className={asc === -1 ? "bi bi-sort-up-alt" : "bi bi-sort-down-alt"}></i> : <></>
    function sortFunc<T>(a: T, b: T) { return a > b ? -1 * asc : 1 * asc }
    const cth = (field: string) => <th className={styles.clickable} onClick={() => setSortField(field)}>{field}{sortIcon(field)}</th>
    const sortFieldFunc = (a: all_history, b: all_history) => {
        if (sort === "Host") return sortFunc(a.connection?.addr, b.connection?.addr)
        else if (sort === "Proc") return sortFunc(a.connection?.extra.Process, b.connection?.extra.Process)
        else if (sort === "Count") return sortFunc(a.count, b.count)
        else return sortFunc(timestampDate(a.time ?? TimestampZero), timestampDate(b.time ?? TimestampZero))
    }

    const [modalData, setModalData] = useState<{ show: boolean, data?: all_history }>({ show: false })
    const { data, error, isLoading, isValidating, mutate } = useProtoSWR(connections, connections.method.all_history)


    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />
    return <>
        <Modal centered show={modalData.show} onHide={() => setModalData(prev => { return { ...prev, show: false } })}>
            <Modal.Body>
                <ConnectionInfo
                    value={modalData.data?.connection ?? create(connectionSchema, {})}
                    endContent={
                        <>
                            <ListGroupItem itemKey="Count" itemValue={modalData.data?.count.toString() ?? "1"} />
                            <ListGroupItem itemKey="Time" itemValue={timestampDate(modalData.data?.time ?? TimestampZero).toLocaleString()} />
                        </>
                    }
                />
            </Modal.Body>
        </Modal>

        <Button
            variant="outline-primary"
            className="mb-3"
            onClick={() => mutate()}
            disabled={isValidating || isLoading}
        >
            Refresh {(isValidating || isLoading) && <>&nbsp;<Spinner size="sm" animation="border" /></>}
        </Button>

        <Table hover striped size="sm">
            <thead>
                <tr>
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
                    data?.objects?.filter(v => v.time).sort(sortFieldFunc).map((v, index) => {
                        return (
                            <tr key={"bh-" + index} onClick={() => setModalData({ show: true, data: v })}>
                                <td>{timestampDate(v.time!).toLocaleString()}</td>
                                <td>{v.connection?.addr}</td>
                                <td>{v.connection?.extra.MODE}</td>
                                <td>{type[v.connection?.type?.connType ?? type.unknown]}</td>
                                <td>{Number(v.count)}</td>
                                {data.dumpProcessEnabled && <td>{v.connection?.extra.Process}</td>}
                            </tr>
                        )
                    })
                }
            </tbody>
        </Table>
    </>
}

export default History