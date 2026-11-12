import { listPeerTunnelPeers } from "@/api/nodes";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalTrigger } from "@/component/v2/modal";
import { Pagination } from "@/component/v2/pagination";
import { Network, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

export function PeerTunnelPeers() {
    const { t: uiT } = useTranslation("ui");
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const { data, error, isValidating, mutate } = useSWR(
        open ? ["peer-tunnel-peers", page] : null, () => listPeerTunnelPeers(page),
        { revalidateOnFocus: false, refreshInterval: 15_000, shouldRetryOnError: false },
    );

    return <Modal open={open} onOpenChange={value => { setOpen(value); if (!value) setPage(1); }}>
        <ModalTrigger asChild><Button permission="nodes:read" variant="outline-secondary" className="gap-1.5"><Network size={16} />{uiT("peerTunnel.peers")}</Button></ModalTrigger>
        <ModalContent width={620}>
            <ModalHeader closeButton><ModalTitle>{uiT("peerTunnel.peers")}</ModalTitle></ModalHeader>
            <ModalBody>
                <p className="text-sm text-ui-muted">{uiT("peerTunnel.peersHelp")}</p>
                {error ? <p role="alert" className="mt-3 text-sm text-ui-danger">{uiT("peerTunnel.peerListFailed")}</p> :
                    !data ? <p role="status" className="mt-3 text-sm text-ui-muted">{uiT("loading")}</p> :
                    data.items.length === 0 ? <p className="mt-3 text-sm text-ui-muted">{uiT("peerTunnel.noPeers")}</p> :
                    <ul className="mt-3 grid gap-2">
                        {data.items.map(peer => <li key={peer.nodeId} className="min-w-0 rounded-ui-md border border-ui-border p-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <span className="min-w-0 break-all font-medium text-ui-heading">{peer.name}</span>
                                <Badge variant={peer.state === "online" ? "success" : peer.state === "offline" ? "muted" : "warning"} dot>
                                    {uiT(`peerTunnel.peerState.${peer.state}`, { defaultValue: uiT("peerTunnel.peerState.unknown") })}
                                </Badge>
                            </div>
                            <dl className="mt-2 grid gap-x-3 gap-y-1 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
                                {peer.endpoint && <><dt className="text-ui-muted">{uiT("peerTunnel.udpEndpoint")}</dt><dd className="break-all font-mono">{peer.endpoint}</dd></>}
                                <dt className="text-ui-muted">{uiT("peerTunnel.peerIp")}</dt><dd className="break-all font-mono">{peer.tunnelIp}</dd>
                                <dt className="text-ui-muted">{uiT("peerTunnel.routes")}</dt><dd className="break-words font-mono">{peer.routes.join(", ")}</dd>
                            </dl>
                        </li>)}
                    </ul>}
            </ModalBody>
            <ModalFooter>
                {data && data.page.total > data.page.pageSize && <Pagination currentPage={data.page.page} totalItems={data.page.total} pageSize={data.page.pageSize} onPageChange={setPage} />}
                <Button size="sm" disabled={isValidating} onClick={() => void mutate()} className="gap-1.5"><RefreshCw size={14} />{uiT("refresh")}</Button>
            </ModalFooter>
        </ModalContent>
    </Modal>;
}
