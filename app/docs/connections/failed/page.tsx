"use client"

import { create } from "@bufbuild/protobuf"
import { timestampDate, TimestampSchema } from "@bufbuild/protobuf/wkt"
import { useState } from "react"
import { Button, Spinner, Table } from "react-bootstrap"
import styles from "../../common/clickable.module.css"
import Loading from "../../common/loading"
import { useProtoSWR } from "../../common/proto"
import { type } from "../../pbes/statistic/config_pb"
import { connections, failed_history } from "../../pbes/statistic/grpc/config_pb"

const TimestampZero = create(TimestampSchema, { seconds: BigInt(0), nanos: 0 })

function FailedHistory() {
    const [sort, setSort] = useState("Time")
    const [asc, setAsc] = useState(1)
    const setSortField = (field: string) => field === sort ? setAsc(-asc) : setSort(field)
    const sortIcon = (field: string) => field === sort ? <i className={asc === -1 ? "bi bi-sort-up-alt" : "bi bi-sort-down-alt"}></i> : <></>
    function sortFunc<T>(a: T, b: T) { return a > b ? -1 * asc : 1 * asc }
    const cth = (field: string) => <th className={styles.clickable} onClick={() => setSortField(field)}>{field}{sortIcon(field)}</th>
    const sortFieldFunc = (a: failed_history, b: failed_history) => {
        if (sort === "Host") return sortFunc(a.host, b.host)
        else if (sort === "Proc") return sortFunc(a.process, b.process)
        else if (sort === "Count") return sortFunc(a.failedCount, b.failedCount)
        else return sortFunc(timestampDate(a.time ?? TimestampZero), timestampDate(b.time ?? TimestampZero))
    }

    const { data, error, isLoading, isValidating, mutate } = useProtoSWR(connections.method.failed_history)

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />
    return <>
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
                    <th>Net</th>
                    {cth("Host")}
                    {cth("Count")}
                    <th>Err</th>
                    {data.dumpProcessEnabled && cth("Proc")}
                </tr>
            </thead>
            <tbody className="text-break">
                {
                    data?.objects?.filter(v => v.time).sort(sortFieldFunc).map((v, index) => {
                        return (
                            <tr key={"bh-" + index}>
                                <td>{timestampDate(v.time!).toLocaleString()}</td>
                                <td>{type[v.protocol ?? type.unknown]}</td>
                                <td>{v.host}</td>
                                <td>{Number(v.failedCount)}</td>
                                <td>{v.error}</td>
                                {data.dumpProcessEnabled && <td>{v.process}</td>}
                            </tr>
                        )
                    })
                }
            </tbody>
        </Table>
    </>
}

export default FailedHistory