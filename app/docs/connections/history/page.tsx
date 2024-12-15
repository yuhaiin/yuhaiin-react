"use client"

import { create } from "@bufbuild/protobuf"
import { timestampDate, TimestampSchema } from "@bufbuild/protobuf/wkt"
import { useState } from "react"
import { Button, Spinner, Table } from "react-bootstrap"
import useSWR from "swr"
import styles from "../../common/clickable.module.css"
import Loading from "../../common/loading"
import { ProtoESFetcher } from "../../common/proto"
import { type } from "../../pbes/statistic/config_pb"
import { all_history, connections } from "../../pbes/statistic/grpc/config_pb"

const TimestampZero = create(TimestampSchema, { seconds: BigInt(0), nanos: 0 })

function History() {
    const [sort, setSort] = useState("Time")
    const [asc, setAsc] = useState(1)
    const setSortField = (field: string) => field === sort ? setAsc(-asc) : setSort(field)
    const sortIcon = (field: string) => field === sort ? <i className={asc === -1 ? "bi bi-sort-up-alt" : "bi bi-sort-down-alt"}></i> : <></>
    const sortFunc = (a: any, b: any) => a > b ? -1 * asc : 1 * asc
    const cth = (field: string) => <th className={styles.clickable} onClick={() => setSortField(field)}>{field}{sortIcon(field)}</th>
    const sortFieldFunc = (a: all_history, b: all_history) => {
        if (sort === "Host") return sortFunc(a.connection?.addr, b.connection?.addr)
        else if (sort === "Proc") return sortFunc(a.connection?.extra.Process, b.connection?.extra.Process)
        else if (sort === "Count") return sortFunc(a.count, b.count)
        else return sortFunc(timestampDate(a.time ?? TimestampZero), timestampDate(b.time ?? TimestampZero))
    }

    const { data, error, isLoading, isValidating, mutate } = useSWR("/conn/history",
        ProtoESFetcher(connections.method.all_history))


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
                            <tr key={"bh-" + index}>
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