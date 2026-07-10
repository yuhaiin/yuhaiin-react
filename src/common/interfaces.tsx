import { createContext } from "react";
import useSWR from "swr";
import { getInterfaces } from "@/api/tools";
import type { InterfaceInfo } from "@/contract/tools";

export const InterfacesContext = createContext<InterfaceInfo[]>([])

export function useInterfaces(): InterfaceInfo[] {
    const { data: iffs } = useSWR("/api/v2/tools/interfaces", getInterfaces, { revalidateOnFocus: false })

    return iffs ? iffs.interfaces : []
}
