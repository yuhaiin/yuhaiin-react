import { createContext } from "react";
import { tools } from "@/common/api";
import { Interface } from "../docs/schema/tools/tools";
import { useHttpSWR } from "./http";

export const InterfacesContext = createContext<Interface[]>([])

export function useInterfaces(): Interface[] {
    const { data: iffs } =
        useHttpSWR(tools.method.get_interface, { revalidateOnFocus: false })

    return iffs ? iffs.interfaces : []
}
