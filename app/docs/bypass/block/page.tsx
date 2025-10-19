"use client"

import { create } from "@bufbuild/protobuf"
import { timestampDate, TimestampSchema } from "@bufbuild/protobuf/wkt"
import { useCallback, useMemo, useState } from "react"
import { Button, Spinner, Table } from "react-bootstrap"
import styles from "../../common/clickable.module.css"
import Loading from "../../common/loading"
import { CustomPagination } from "../../common/pagination"
import { useProtoSWR } from "../../common/proto"
import { block_history, rules } from "../../pbes/api/config_pb"

const TimestampZero = create(TimestampSchema, { seconds: BigInt(0), nanos: 0 })

function BypassBlockHistory() {
    const [sort, setSort] = useState("Time")
    const [asc, setAsc] = useState(1)
    const setSortField = (field: string) => field === sort ? setAsc(-asc) : setSort(field)
    const sortIcon = (field: string) => field === sort ? <i className={asc === -1 ? "bi bi-sort-up-alt" : "bi bi-sort-down-alt"}></i> : <></>

    function sortFuncGeneric<T>(a: T, b: T) { return a > b ? -1 * asc : 1 * asc }
    const sortFunc = useCallback(sortFuncGeneric, [asc]);
    const cth = (field: string) => <th className={styles.clickable} onClick={() => setSortField(field)}>{field}{sortIcon(field)}</th>
    const sortFieldFunc = useCallback((a: block_history, b: block_history) => {
        if (sort === "Host") return sortFunc(a.host, b.host)
        else if (sort === "Proc") return sortFunc(a.process, b.process)
        else if (sort === "Count") return sortFunc(a.blockCount, b.blockCount)
        else return sortFunc(timestampDate(a.time ?? TimestampZero), timestampDate(b.time ?? TimestampZero))
    }, [sort, sortFunc])

    const [page, setPage] = useState(1);

    const { data, error, isLoading, isValidating, mutate } = useProtoSWR(rules.method.block_history)

    const objects = useMemo(() => {
        return data?.objects?.filter(v => v.time).sort(sortFieldFunc)
    }, [data, sortFieldFunc])

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />
    return <>
        <div className="d-flex justify-content-center">
            <div className="d-flex align-items-center gap-2">
                <Button
                    variant="outline-primary"
                    className="mb-3"
                    onClick={() => mutate()}
                    disabled={isValidating || isLoading}
                >
                    <i className="bi bi-arrow-clockwise" /> {(isValidating || isLoading) && <>&nbsp;<Spinner size="sm" animation="border" /></>}
                </Button>

                <CustomPagination
                    currentPage={page}
                    totalItems={objects.length}
                    pageSize={30}
                    onPageChange={(p) => { setPage(p) }}
                />
            </div>
        </div>

        <Table hover striped size="sm">
            <thead>
                <tr>
                    <th>Index</th>
                    {cth("Time")}
                    <th>Net</th>
                    {cth("Host")}
                    {cth("Count")}
                    {data.dumpProcessEnabled && cth("Proc")}
                </tr>
            </thead>
            <tbody className="text-break">
                {
                    objects.slice((page - 1) * 30, (page - 1) * 30 + 30).map((v, index) => {
                        return (
                            <tr key={"bh-" + index}>
                                <td>{index + (page - 1) * 30 + 1}</td>
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