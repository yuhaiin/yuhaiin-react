import { createContext } from "react";
import { Interface, tools } from "../pbes/tools/tools_pb";
import { useProtoSWR } from "./proto";

export const InterfacesContext = createContext<Interface[]>([])

export function Interfaces(): Interface[] {
    const { data: iffs } =
        useProtoSWR(tools, tools.method.get_interface, { revalidateOnFocus: false })

    return iffs ? iffs.interfaces : []
}