import { createContext } from "react";
import { tools } from "../pbes/api/tools_pb";
import { Interface } from "../pbes/tools/tools_pb";
import { useProtoSWR } from "./proto";

export const InterfacesContext = createContext<Interface[]>([])

export function Interfaces(): Interface[] {
    const { data: iffs } =
        useProtoSWR(tools.method.get_interface, { revalidateOnFocus: false })

    return iffs ? iffs.interfaces : []
}
