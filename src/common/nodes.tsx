import { create } from "@bufbuild/protobuf";
import { TimestampSchema } from "@bufbuild/protobuf/wkt";
import { createContext, FC, useEffect, useState } from "react";
import { SettingSelectVertical } from "../component/v2/forms";
import { NodesResponse } from "../docs/pbes/api/node_pb";

export const TimestampZero = create(TimestampSchema, { seconds: BigInt(0), nanos: 0 })

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

const nodesCache = new WeakMap<NodesResponse, Nodes>()

export const getNodeName = (hash: string, data?: NodesResponse) => {
    if (!data || hash === "") return ""

    let nodes = nodesCache.get(data)
    if (!nodes) {
        nodes = new Nodes(data)
        nodesCache.set(data, nodes)
    }

    return nodes.getGroupByHash(hash).node ?? ""
}


export const Node: FC<{
    hash: string,
    data: Nodes,
    onChangeNode: (x: string) => void,
    disabled?: boolean
}> = ({ hash, data, onChangeNode, disabled }) => {
    const [group, setGroup] = useState("")
    useEffect(() => { setGroup(data.getGroupByHash(hash).group) }, [hash, data])

    return <>
        <SettingSelectVertical
            disabled={disabled}
            label="Group"
            className="mb-2"
            emptyChoose
            value={group}
            onChange={(x) => { setGroup(x) }}
            values={data.getGroups()}
        />

        <SettingSelectVertical
            disabled={disabled}
            label="Node"
            emptyChoose
            value={hash}
            onChange={(x) => { onChangeNode(x) }}
            values={data.getNodesByGroup(group)}
        />
    </>
}