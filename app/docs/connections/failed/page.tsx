"use client"

import { Button, Table } from "react-bootstrap"
import useSWR from "swr"
import { ProtoESFetcher } from "../../common/proto"
import { create } from "@bufbuild/protobuf"
import { timestampDate, TimestampSchema } from "@bufbuild/protobuf/wkt"
import Loading from "../../common/loading"
import { failed_history_listSchema, failed_history } from "../../pbes/statistic/grpc/config_pb"
import { useState } from "react"
import styles from "../../common/clickable.module.css";

const TimestampZero = create(TimestampSchema, { seconds: BigInt(0), nanos: 0 })

function FailedHistory() {
    const [sort, setSort] = useState("Time")
    const [asc, setAsc] = useState(1)
    const setSortField = (field: string) => field === sort ? setAsc(-asc) : setSort(field)
    const sortIcon = (field: string) => field === sort ? <i className={asc === -1 ? "bi bi-sort-up-alt" : "bi bi-sort-down-alt"}></i> : <></>
    const sortFunc = (a: any, b: any) => a > b ? -1 * asc : 1 * asc
    const cth = (field: string) => <th className={styles.clickable} onClick={() => setSortField(field)}>{field}{sortIcon(field)}</th>
    const sortFieldFunc = (a: failed_history, b: failed_history) => {
        if (sort === "Host") return sortFunc(a.host, b.host)
        else if (sort === "Process") return sortFunc(a.process, b.process)
        else return sortFunc(timestampDate(a.time ?? TimestampZero), timestampDate(b.time ?? TimestampZero))
    }

    const { data, error, isLoading, mutate } = useSWR("/conn/failed_history", ProtoESFetcher(failed_history_listSchema))


    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />
    return <>
        <Button variant="outline-primary" className="mb-3" onClick={() => mutate()}>Refresh</Button>

        <Table hover striped>
            <thead>
                <tr>
                    <th>#</th>
                    {cth("Time")}
                    <th>Net</th>
                    {cth("Host")}
                    <th>Error</th>
                    {data.dumpProcessEnabled && cth("Process")}
                </tr>
            </thead>
            <tbody className="text-break">
                {
                    data?.objects?.filter(v => v.time).sort(sortFieldFunc).map((v, index) => {
                        return (
                            <tr key={"bh-" + index}>
                                <td>{index + 1}</td>
                                <td>{timestampDate(v.time!).toLocaleString()}</td>
                                <td>{v.protocol}</td>
                                <td>{v.host}</td>
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