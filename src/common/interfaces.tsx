import { createContext } from "react";
import { tools } from "../docs/pbes/api/tools_pb";
import { Interface } from "../docs/pbes/tools/tools_pb";
import { useProtoSWR } from "./proto";

export const InterfacesContext = createContext<Interface[]>([])

export function useInterfaces(): Interface[] {
    const { data: iffs } =
        useProtoSWR(tools.method.get_interface, { revalidateOnFocus: false })

    return iffs ? iffs.interfaces : []
}
