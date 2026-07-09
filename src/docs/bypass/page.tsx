"use client"

import { useCallback } from "react";
import { useHttpSWR } from "../../common/http";
import Loading from "../../component/v2/loading";
import { inbound, lists, resolver, rules } from "@/common/api";
import { configv2 } from "../schema/config/bypass";
import { Bypass } from "./bypass";
import { FilterContext } from "./filter/filter";

function BypassComponent() {
    const { data: listsData } = useHttpSWR(lists.method.list, { revalidateOnFocus: false })
    const { data: inboundsData } = useHttpSWR(inbound.method.list, { revalidateOnFocus: false })
    const { data: resolvers } = useHttpSWR(resolver.method.list, { revalidateOnFocus: false })

    const { data: setting, error, isLoading, mutate: setSetting } =
        useHttpSWR(rules.method.config, { revalidateOnFocus: false })

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