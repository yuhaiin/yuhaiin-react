"use client"

import { useDelay } from "@/common/hooks"
import { jsonSSESubscription, postJSON } from "@/common/http"
import { Button } from "@/component/v2/button"
import { IconBadge } from "@/component/v2/card"
import Loading from "@/component/v2/loading"
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal"
import { Spinner } from "@/component/v2/spinner"
import { GlobalToastContext } from "@/component/v2/toast"
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup"
import { ConnectionInfo, FlowContainer, formatBytes } from "@/docs/connections/components"
import { counter, normalizeConnection, notify_data } from "@/common/api"
import { connection, connectionSchema, type } from "@/docs/schema/statistic/config"
import { create } from "@/common/plain"
import { clsx } from "clsx"
import { ArrowDown, ArrowUp, Network, Power, ShieldCheck, Tag } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { FC, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react"
import useSWRSubscription from 'swr/subscription'
import { VList } from "virtua"
import { NodeModal } from "../../node/modal"
import { mode } from "../../schema/config/bypass"

type ConnectionsState = { [key: string]: connection }

type ConnectionAction =
    | { type: 'NOTIFY'; data: notify_data[] }
    | { type: 'RESET' }

type CounterRecord = {
    download: bigint
    upload: bigint
    downloadLabel: string
    uploadLabel: string
}

const ZERO_COUNTER: CounterRecord = {
    download: BigInt(0),
    upload: BigInt(0),
    downloadLabel: "0B",
    uploadLabel: "0B",
}

const CONNECTION_ROW_HEIGHT = 72
const CONNECTION_ROW_HEIGHT_MOBILE = 112
const CONNECTION_LIST_MAX_HEIGHT = 720
const ANIMATED_LIST_LIMIT = 100
const CONNECTION_EVENTS_PATH = "/api/v1/connections/events"

function asRecord(value: unknown): Record<string, unknown> {
    return value !== null && typeof value === "object" ? value as Record<string, unknown> : {}
}

function decodeConnectionEvent(event: string, raw: unknown): notify_data | undefined {
    const value = asRecord(raw)
    switch (event) {
        case "connections_added": {
            const rawConnections = Array.isArray(value.connections) ? value.connections : []
            return {
                data: {
                    case: "notifyNewConnections",
                    value: {
                        connections: rawConnections.map((conn) => normalizeConnection(conn)),
                    },
                },
            }
        }
        case "connections_removed": {
            const ids = Array.isArray(value.ids) ? value.ids : []
            return {
                data: {
                    case: "notifyRemoveConnections",
                    value: {
                        ids: ids.map((id) => BigInt(typeof id === "string" || typeof id === "number" ? id : 0)),
                    },
                },
            }
        }
        default:
            return undefined
    }
}

class ConnectionCountersStore {
    private counters = new Map<string, CounterRecord>()
    private listeners = new Map<string, Set<() => void>>()
    private allListeners = new Set<() => void>()
    private version = 0

    getSnapshot = (id: string) => {
        return this.counters.get(id) ?? ZERO_COUNTER
    }

    getVersion = () => {
        return this.version
    }

    subscribe = (id: string, listener: () => void) => {
        let listeners = this.listeners.get(id)
        if (!listeners) {
            listeners = new Set()
            this.listeners.set(id, listeners)
        }

        listeners.add(listener)
        return () => {
            listeners?.delete(listener)
            if (listeners?.size === 0) this.listeners.delete(id)
        }
    }

    subscribeAll = (listener: () => void) => {
        this.allListeners.add(listener)
        return () => this.allListeners.delete(listener)
    }

    updateMany(next: { [key: string]: counter }) {
        let hasChange = false
        const changedIds: string[] = []

        for (const key in next) {
            const value = next[key]
            const existing = this.counters.get(key)
            const downloadLabel = formatBytes(Number(value.download))
            const uploadLabel = formatBytes(Number(value.upload))

            if (
                existing?.download === value.download &&
                existing?.upload === value.upload &&
                existing.downloadLabel === downloadLabel &&
                existing.uploadLabel === uploadLabel
            ) {
                continue
            }

            this.counters.set(key, {
                download: value.download,
                upload: value.upload,
                downloadLabel,
                uploadLabel,
            })
            changedIds.push(key)
            hasChange = true
        }

        if (!hasChange) return
        this.version++
        changedIds.forEach(id => this.listeners.get(id)?.forEach(listener => listener()))
        this.allListeners.forEach(listener => listener())
    }

    delete(id: string) {
        if (!this.counters.delete(id)) return
        this.version++
        this.listeners.get(id)?.forEach(listener => listener())
        this.allListeners.forEach(listener => listener())
    }

    clear() {
        if (this.counters.size === 0) return
        const ids = Array.from(this.counters.keys())
        this.counters.clear()
        this.version++
        ids.forEach(id => this.listeners.get(id)?.forEach(listener => listener()))
        this.allListeners.forEach(listener => listener())
    }
}

const connectionsReducer = (state: ConnectionsState, action: ConnectionAction): ConnectionsState => {
    switch (action.type) {
        case 'NOTIFY': {
            let next = state
            let changed = false

            const ensureNext = () => {
                if (next === state) next = { ...state }
                changed = true
            }

            for (const r of action.data) {
                switch (r.data.case) {
                    case "notifyNewConnections": {
                        r.data.value.connections.forEach((conn: connection) => {
                            const key = conn.id.toString()
                            if (state[key] === conn) return
                            ensureNext()
                            next[key] = conn
                        })
                        break
                    }
                    case "notifyRemoveConnections": {
                        r.data.value.ids.forEach((id: bigint) => {
                            const key = id.toString()
                            if (!state[key]) return
                            ensureNext()
                            delete next[key]
                        })
                        break
                    }
                }
            }

            return changed ? next : state
        }
        case 'RESET':
            return {}
        default:
            return state
    }
}

function Connections() {
    const [info, setInfo] = useState<{ id: string, show: boolean }>({ id: "", show: false });
    const shouldFetch = useDelay(400)
    const [connsMap, dispatch] = React.useReducer(connectionsReducer, {})
    const countersStore = useMemo(() => new ConnectionCountersStore(), [])
    const subscriptionId = React.useId()

    const selectedConnection = info.id ? connsMap[info.id] : undefined
    const hideInfo = useCallback(() => setInfo(prev => ({ ...prev, show: false })), [])

    const processStream = useCallback((rs: notify_data[]): boolean => {
        for (const r of rs) {
            if (r.data.case === "notifyRemoveConnections") {
                r.data.value.ids.forEach((id: bigint) => countersStore.delete(id.toString()))
            }
        }
        dispatch({ type: 'NOTIFY', data: rs })
        return true
    }, [countersStore])

    const onDisconnect = useCallback(() => {
        countersStore.clear()
        dispatch({ type: 'RESET' })
    }, [countersStore])

    const updateCounters = useCallback((cc: { [key: string]: counter }) => {
        countersStore.updateMany(cc)
    }, [countersStore])

    const subscribe = useMemo(() =>
        jsonSSESubscription(CONNECTION_EVENTS_PATH, decodeConnectionEvent, processStream, { onDisconnect }),
        [processStream, onDisconnect]
    )

    const { data: isConnected, error: conn_error } =
        useSWRSubscription(
            shouldFetch ? `${CONNECTION_EVENTS_PATH}#${subscriptionId}` : null,
            subscribe,
            {}
        )

    const [sortBy, setSortBy] = useState("id")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [nodeModal, setNodeModal] = useState<{ show: boolean, hash: string }>({ show: false, hash: "" });
    const showNodeModal = useCallback((hash: string) => {
        setNodeModal({ show: true, hash: hash });
    }, []);

    return (
        <div>
            <NodeModal
                editable={false}
                show={nodeModal.show}
                hash={nodeModal.hash}
                onHide={() => setNodeModal(prev => ({ ...prev, show: false }))}
            />

            <FlowContainer onUpdate={updateCounters} />

            <InfoOffcanvas
                data={selectedConnection ?? create(connectionSchema, {})}
                show={!nodeModal.show && info.show && selectedConnection !== undefined}
                onClose={hideInfo}
                showNodeModal={showNodeModal}
            />

            <div className="flex justify-end mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                    <ToggleGroup className="flex-nowrap" type="single" value={sortOrder} onValueChange={(v) => v && setSortOrder(v as "asc" | "desc")}>
                        <ToggleItem value="asc">
                            <div className="flex items-center gap-1 whitespace-nowrap"><ArrowUp size={16} /> Asc</div>
                        </ToggleItem>
                        <ToggleItem value="desc">
                            <div className="flex items-center gap-1 whitespace-nowrap"><ArrowDown size={16} /> Desc</div>
                        </ToggleItem>
                    </ToggleGroup>

                    <ToggleGroup className="flex-nowrap" type="single" value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
                        <ToggleItem value="id">Id</ToggleItem>
                        <ToggleItem value="name">Name</ToggleItem>
                        <ToggleItem value="download">Download</ToggleItem>
                        <ToggleItem value="upload">Upload</ToggleItem>
                    </ToggleGroup>
                </div>
            </div>

            <ConnectionList
                conns={connsMap}
                countersStore={countersStore}
                setInfo={setInfo}
                conn_error={conn_error}
                sortFields={sortBy || "id"}
                sortOrder={sortOrder}
                isLoading={isConnected === undefined && !conn_error}
            />
        </div>
    );
}

const compareBigInt = (a: bigint, b: bigint, sortOrder?: "asc" | "desc") => {
    if (a === b) return 0
    const result = a < b ? -1 : 1
    return sortOrder === "asc" ? result : -result
}

const compareString = (a: string, b: string, sortOrder?: "asc" | "desc") => {
    const result = a.localeCompare(b)
    return sortOrder === "asc" ? result : -result
}

const ConnectionListComponent: FC<{
    conns: ConnectionsState,
    countersStore: ConnectionCountersStore,
    setInfo: (info: { id: string, show: boolean }) => void
    conn_error?: { code: number, msg: string },
    sortFields?: string,
    sortOrder?: "asc" | "desc",
    isLoading?: boolean,
}> = ({ conns, countersStore, conn_error, setInfo, sortFields, sortOrder, isLoading }) => {
    const isTrafficSort = sortFields === "download" || sortFields === "upload"
    const subscribeSortCounters = useCallback((listener: () => void) => {
        if (!isTrafficSort) return () => { }
        return countersStore.subscribeAll(listener)
    }, [countersStore, isTrafficSort])
    const getSortCounterVersion = useCallback(() => {
        return isTrafficSort ? countersStore.getVersion() : 0
    }, [countersStore, isTrafficSort])
    const counterVersion = useSyncExternalStore(subscribeSortCounters, getSortCounterVersion, getSortCounterVersion)
    const isCompactLayout = useMediaQuery("(max-width: 767px)")
    const rowHeight = isCompactLayout ? CONNECTION_ROW_HEIGHT_MOBILE : CONNECTION_ROW_HEIGHT
    const ids = useMemo(() => Object.keys(conns ?? {}), [conns])

    const sortedIds = useMemo(() => {
        void counterVersion;
        return [...ids].sort((a, b) => {
            const first = conns[a]
            const second = conns[b]

            if (!first || !second) return 0

            switch (sortFields) {
                case "name":
                    return compareString(first.addr ?? "", second.addr ?? "", sortOrder)
                case "download":
                    return compareBigInt(countersStore.getSnapshot(a).download, countersStore.getSnapshot(b).download, sortOrder)
                case "upload":
                    return compareBigInt(countersStore.getSnapshot(a).upload, countersStore.getSnapshot(b).upload, sortOrder)
                default:
                    return compareBigInt(first.id, second.id, sortOrder)
            }
        })
    }, [ids, conns, sortFields, sortOrder, countersStore, counterVersion])

    const handleSelect = useCallback((id: string) => {
        setInfo({ id, show: true })
    }, [setInfo])

    if (conn_error !== undefined) return <Loading code={conn_error.code}>{conn_error.msg}</Loading>
    if (isLoading) return <Loading />

    if (sortedIds.length === 0) {
        return <div className="p-6 mb-8 text-center text-gray-500 rounded-sidebar-radius border border-sidebar-border bg-sidebar-bg">
            No active connections.
        </div>
    }

    const listHeight = Math.min(Math.max(sortedIds.length * rowHeight, rowHeight), CONNECTION_LIST_MAX_HEIGHT)

    if (sortedIds.length <= ANIMATED_LIST_LIMIT) {
        return <ul className="flex flex-col p-0 m-0 mb-8 overflow-hidden rounded-sidebar-radius border border-sidebar-border bg-sidebar-bg shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]">
            <AnimatePresence initial={false} mode="popLayout">
                {sortedIds.map((id) => {
                    const conn = conns[id]
                    if (!conn) return null

                    return (
                        <AnimatedConnectionRow
                            key={id}
                            id={id}
                            conn={conn}
                            countersStore={countersStore}
                            onSelect={handleSelect}
                        />
                    )
                })}
            </AnimatePresence>
        </ul>
    }

    return <div className="p-0 m-0 mb-8 overflow-hidden rounded-sidebar-radius border border-sidebar-border bg-sidebar-bg shadow-xl transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]">
        <VList
            data={sortedIds}
            itemSize={rowHeight}
            bufferSize={rowHeight * 6}
            style={{ height: listHeight, width: "100%" }}
        >
            {(id) => (
                <ConnectionRow
                    key={id}
                    id={id}
                    conn={conns[id]}
                    countersStore={countersStore}
                    onSelect={handleSelect}
                />
            )}
        </VList>
    </div>
}

const ConnectionList = React.memo(ConnectionListComponent)

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(() => {
        if (typeof window === "undefined") return false
        return window.matchMedia(query).matches
    })

    React.useEffect(() => {
        const mediaQuery = window.matchMedia(query)
        const update = () => setMatches(mediaQuery.matches)

        update()
        mediaQuery.addEventListener("change", update)
        return () => mediaQuery.removeEventListener("change", update)
    }, [query])

    return matches
}

const AnimatedConnectionRow: FC<{
    id: string,
    conn: connection,
    countersStore: ConnectionCountersStore,
    onSelect: (id: string) => void,
}> = ({ id, conn, countersStore, onSelect }) => {
    const counter = useSyncExternalStore(
        useCallback((listener) => countersStore.subscribe(id, listener), [countersStore, id]),
        useCallback(() => countersStore.getSnapshot(id), [countersStore, id]),
        () => ZERO_COUNTER,
    )

    return (
        <motion.li
            className="flex flex-col items-start md:flex-row md:justify-between px-4 py-3 border-b border-sidebar-border transition-colors duration-200 cursor-pointer hover:bg-sidebar-hover last:border-b-0"
            onClick={() => onSelect(id)}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
            <ListItemContent conn={conn} counter={counter} />
        </motion.li>
    )
}

type ConnectionRowProps = {
    id: string,
    conn?: connection,
    countersStore: ConnectionCountersStore,
    onSelect: (id: string) => void,
}

const ConnectionRow = ({ id, conn, countersStore, onSelect }: ConnectionRowProps) => {
    const counter = useSyncExternalStore(
        useCallback((listener) => countersStore.subscribe(id, listener), [countersStore, id]),
        useCallback(() => countersStore.getSnapshot(id), [countersStore, id]),
        () => ZERO_COUNTER,
    )

    if (!conn) return null

    return (
        <div
            className="flex h-full flex-col items-start md:flex-row md:justify-between px-4 py-3 border-b border-sidebar-border transition-colors duration-200 cursor-pointer hover:bg-sidebar-hover last:border-b-0"
            onClick={() => onSelect(id)}
        >
            <ListItemContent conn={conn} counter={counter} />
        </div>
    )
}

const ListItemContent: FC<{ conn: connection, counter: CounterRecord }> = React.memo(({ conn, counter }) => {
    return (
        <>
            <div className="flex min-w-0 flex-col">
                <code className="font-mono text-xs text-sidebar-color">{conn.id.toString()}</code>
                <span className="font-medium text-md truncate">{conn.addr}</span>
            </div>

            <div className="flex flex-col items-start gap-2 md:items-end md:mt-0">
                <FlowBadge download={counter.downloadLabel} upload={counter.uploadLabel} />
                <div className="flex gap-2 items-center flex-wrap text-xs md:mt-0">
                    <IconBadge icon={ShieldCheck} text={mode[conn.mode]} />
                    <IconBadge icon={Network} text={type[conn.type?.connType ?? 0]} />
                    {conn.tag && <IconBadge icon={Tag} text={conn.tag} />}
                </div>
            </div>
        </>
    )
})

const FlowBadgeComponent: FC<{ download: string, upload: string }> = ({ download, upload }) => {
    return <div className="flex gap-2">
        <span className={clsx(
            "rounded-full flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium",
            "bg-slate-100 text-slate-500 dark:bg-[#2b2b40] dark:text-[#a6a6c0]"
        )}>
            <ArrowDown size={12} className="mr-1" />
            {download}
        </span>
        <span className={clsx(
            "rounded-full flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium",
            "bg-slate-100 text-slate-500 dark:bg-[#2b2b40] dark:text-[#a6a6c0]"
        )}>
            <ArrowUp size={12} className="mr-1" />
            {upload}
        </span>
    </div>
}

const FlowBadge = React.memo(FlowBadgeComponent)

const InfoOffcanvasComponent: FC<{
    data: connection,
    show: boolean,
    onClose: () => void,
    showNodeModal?: (hash: string) => void
}> = ({ data, show, onClose: handleClose, showNodeModal }) => {
    const ctx = useContext(GlobalToastContext);
    const [closing, setClosing] = useState(false);

    const closeConnection = useCallback(() => {
        setClosing(true)
        postJSON("/api/v1/connections:close", { ids: [Number(data.id)] })
            .then(handleClose)
            .catch((error) => {
                const code = typeof error?.code === "number" ? error.code : 500
                const msg = typeof error?.msg === "string" ? error.msg : "failed to disconnect"
                ctx.Error(`code ${data.id} failed, ${code}| ${msg}`)
            })
            .finally(() => { setClosing(false) })
    }, [setClosing, data.id, ctx, handleClose])

    return (
        <Modal open={show} onOpenChange={(open) => !open && handleClose()}>
            <ModalContent>
                <ModalHeader closeButton>
                    <ModalTitle className="text-lg font-bold">
                        Connection Details
                    </ModalTitle>
                </ModalHeader>

                <ModalBody className="pt-2">
                    <ConnectionInfo value={data} showNodeModal={showNodeModal} />
                </ModalBody>

                <ModalFooter className="border-t-0 pt-0 pb-3 px-3">
                    <Button
                        variant="danger"
                        className="w-full py-2 flex items-center justify-center notranslate"
                        disabled={closing}
                        onClick={closeConnection}
                    >
                        {closing ? (
                            <>
                                <Spinner
                                    size="sm"
                                    className="mr-2"
                                />
                                Disconnecting...
                            </>
                        ) : (
                            <>
                                <Power className="text-xl mr-2" />
                                <span className="font-bold">Disconnect</span>
                            </>
                        )}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

const InfoOffcanvas = React.memo(InfoOffcanvasComponent)

export default Connections;
