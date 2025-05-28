"use client"

import { clone } from "@bufbuild/protobuf";
import Loading from "../common/loading";
import { useProtoSWR } from "../common/proto";
import { configSchema } from "../pbes/config/bypass/bypass_pb";
import { bypass, inbound, lists, resolver } from "../pbes/config/grpc/config_pb";
import Bypass from "./bypass";
import { FilterContext } from "./filter/filter";

function BypassComponent() {
    const { data: listsData } = useProtoSWR(lists.method.list, { revalidateOnFocus: false })
    const { data: inboundsData } = useProtoSWR(inbound.method.list, { revalidateOnFocus: false })
    const { data: resolvers } = useProtoSWR(resolver.method.list, { revalidateOnFocus: false })


    const { data: setting, error, isLoading, mutate: setSetting } =
        useProtoSWR(bypass.method.load, { revalidateOnFocus: false })


    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || !setting) return <Loading />

    return <>


        <FilterContext value={{
            Inbounds: inboundsData ? inboundsData.names : [],
            Lists: listsData ? listsData.names : [],
            Resolvers: resolvers ? resolvers.names.sort((a, b) => a.localeCompare(b)) : [],
        }}>
            <Bypass bypass={clone(configSchema, setting)} onChange={(x) => { setSetting(x, false) }} refresh={setSetting} />
        </FilterContext>

    </>
}

export default BypassComponent;