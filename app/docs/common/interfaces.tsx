import { createContext } from "react";
import useSWR from "swr";
import { Interface, tools } from "../pbes/tools/tools_pb";
import { ProtoESFetcher } from "./proto";

export const InterfacesContext = createContext<Interface[]>([])

export function Interfaces(): Interface[] {
    const { data: iffs } =
        useSWR("/interfaces", ProtoESFetcher(tools.method.get_interface), { revalidateOnFocus: false })

    return iffs ? iffs.interfaces : []
}