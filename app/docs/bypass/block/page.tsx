"use client"

import { Button, Table } from "react-bootstrap"
import useSWR from "swr"
import { ProtoESFetcher } from "../../common/proto"
import { block_history, block_history_listSchema } from "../../pbes/config/grpc/config_pb"
import { create } from "@bufbuild/protobuf"
import { timestampDate, TimestampSchema } from "@bufbuild/protobuf/wkt"
import Loading from "../../common/loading"
import { useState } from "react"
import styles from "../../common/clickable.module.css";

const TimestampZero = create(TimestampSchema, { seconds: BigInt(0), nanos: 0 })

function BypassBlockHistory() {
    const [sort, setSort] = useState("Time")
    const [asc, setAsc] = useState(1)
    const setSortField = (field: string) => field === sort ? setAsc(-asc) : setSort(field)
    const sortIcon = (field: string) => field === sort ? <i className={asc === -1 ? "bi bi-sort-up-alt" : "bi bi-sort-down-alt"}></i> : <></>
    const sortFunc = (a: any, b: any) => a > b ? -1 * asc : 1 * asc
    const cth = (field: string) => <th className={styles.clickable} onClick={() => setSortField(field)}>{field}{sortIcon(field)}</th>
    const sortFieldFunc = (a: block_history, b: block_history) => {
        if (sort === "Host") return sortFunc(a.host, b.host)
        else if (sort === "Proc") return sortFunc(a.process, b.process)
        else if (sort === "Count") return sortFunc(a.blockCount, b.blockCount)
        else return sortFunc(timestampDate(a.time ?? TimestampZero), timestampDate(b.time ?? TimestampZero))
    }

    const { data, error, isLoading, mutate } = useSWR("/bypass/block_history", ProtoESFetcher(block_history_listSchema))

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />
    return <>
        <Button variant="outline-primary" className="mb-3" onClick={() => mutate()}>Refresh</Button>

        <Table hover striped>
            <thead>
                <tr>
                    {cth("Time")}
                    <th>Net</th>
                    {cth("Host")}
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
                                <td>{v.protocol}</td>
                                <td>{v.host}</td>
                                <td>{Number(v.blockCount)}</td>
                                {data.dumpProcessEnabled && <td>{v.process}</td>}
                            </tr>
                        )
                    })
                }
            </tbody>
        </Table>
    </>
}

export default BypassBlockHistory