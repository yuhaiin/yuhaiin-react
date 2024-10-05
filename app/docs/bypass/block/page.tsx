"use client"

import { Button, Table } from "react-bootstrap"
import useSWR from "swr"
import { ProtoESFetcher } from "../../common/proto"
import { block_history_listSchema } from "../../pbes/config/grpc/config_pb"
import { create } from "@bufbuild/protobuf"
import { timestampDate, TimestampSchema } from "@bufbuild/protobuf/wkt"
import Loading from "../../common/loading"

const TimestampZero = create(TimestampSchema, { seconds: BigInt(0), nanos: 0 })

function BypassBlockHistory() {
    const { data, error, isLoading, mutate } = useSWR("/bypass/block_history", ProtoESFetcher(block_history_listSchema))

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />
    return <>
        <Button variant="outline-primary" className="mb-3" onClick={() => mutate()}>Refresh</Button>

        <Table hover striped>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Time</th>
                    <th>Protocol</th>
                    <th>Host</th>
                    {data.dumpProcessEnabled && <th>Process</th>}
                </tr>
            </thead>
            <tbody>
                {
                    data?.objects?.sort((a, b) => timestampDate(a.time ?? TimestampZero) > timestampDate(b.time ?? TimestampZero) ? -1 : 1).map((v, index) => {
                        if (v.time)
                            return (
                                <tr key={"bh-" + index}>
                                    <td>{index + 1}</td>
                                    <td>{timestampDate(v.time).toLocaleString()}</td>
                                    <td>{v.protocol}</td>
                                    <td>{v.host}</td>
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