import { createContext, FC, useEffect, useState } from "react";
import { FloatingLabel } from "react-bootstrap";
import { NodesResponse } from "../pbes/node/grpc/node_pb";
import { FormSelect } from "./switch";


export class Nodes {
    byName: { [key: string]: { [key: string]: string } }
    byHash: { [key: string]: { group: string, node: string } }


    constructor(data?: NodesResponse) {
        this.byName = {}
        this.byHash = {}

        if (!data) return

        for (const group of data.groups) {
            this.byName[group.name] = {}
            for (const node of group.nodes) {
                this.byName[group.name][node.name] = node.hash
                this.byHash[node.hash] = { group: group.name, node: node.name }
            }
        }
    }


    getHashByName(group: string, node: string): string {
        const g = this.byName[group]
        if (!g) return ""
        return g[node]
    }

    getGroupByHash(hash: string): { group: string, node: string } {
        const h = this.byHash[hash]
        if (!h) return { group: "", node: "" }
        return h
    }

    getNodesByGroup(group: string): [string, string][] {
        const g = this.byName[group]
        if (!g) return []
        return Object.entries(g)
    }

    getGroups(): string[] {
        return Object.keys(this.byName)
    }
}


export const NodesContext = createContext<Nodes>(new Nodes())

export const getNodeName = (hash: string, data?: NodesResponse) => {
    if (data === undefined || hash === "") return ""
    for (const group in data.groups) {
        for (const node of data.groups[group].nodes) {
            if (node.hash === hash) return node.name
        }
    }

    return ""
}


export const Node: FC<{
    hash: string,
    data: Nodes,
    onChangeNode: (x: string) => void
}> = ({ hash, data, onChangeNode }) => {
    const [group, setGroup] = useState("")
    useEffect(() => { setGroup(data.getGroupByHash(hash).group) }, [hash, data])

    return <>
        <FloatingLabel label="Group" className="mb-2" >
            <FormSelect
                emptyChoose
                value={group}
                onChange={(x) => { setGroup(x) }}
                values={data.getGroups()}
            />
        </FloatingLabel>

        <FloatingLabel label="Node">
            <FormSelect
                emptyChoose
                value={hash}
                onChange={(x) => { onChangeNode(x) }}
                values={data.getNodesByGroup(group)}
            />
        </FloatingLabel>
    </>
}