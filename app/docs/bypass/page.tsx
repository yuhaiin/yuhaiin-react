"use client"

import { useCallback } from "react";
import Loading from "../common/loading";
import { useProtoSWR } from "../common/proto";
import { inbound, lists, resolver, rules } from "../pbes/api/config_pb";
import { configv2 } from "../pbes/config/bypass_pb";
import { Bypass } from "./bypass";
import { FilterContext } from "./filter/filter";

function BypassComponent() {
    const { data: listsData } = useProtoSWR(lists.method.list, { revalidateOnFocus: false })
    const { data: inboundsData } = useProtoSWR(inbound.method.list, { revalidateOnFocus: false })
    const { data: resolvers } = useProtoSWR(resolver.method.list, { revalidateOnFocus: false })

    const { data: setting, error, isLoading, mutate: setSetting } =
        useProtoSWR(rules.method.config, { revalidateOnFocus: false })

    const onChangeSetting = useCallback((x: configv2) => {
        setSetting(x, false)
    }, [setSetting])


    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || !setting) return <Loading />

    return <>
        <FilterContext value={{
            Inbounds: inboundsData ? inboundsData.names : [],
            Lists: listsData ? listsData.names : [],
            Resolvers: resolvers ? resolvers.names.sort((a, b) => a.localeCompare(b)) : [],
        }}>
            <Bypass bypass={setting} onChange={onChangeSetting} refresh={setSetting} />
        </FilterContext>
    </>
}

export default BypassComponent;