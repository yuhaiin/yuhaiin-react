import { listPeerTunnelPeers } from "@/api/nodes";
import { LANLinkPath } from "@/component/lan-link-form";
import type { Go } from "@/api/generated-contracts";
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
                                {peer.tunnelIp && <><dt className="text-ui-muted">{uiT("peerTunnel.peerIp")}</dt><dd className="break-all font-mono">{peer.tunnelIp}</dd></>}
                                <dt className="text-ui-muted">{uiT("peerTunnel.routes")}</dt><dd className="break-words font-mono">{peer.routes.join(", ")}</dd>
                            </dl>
                            {peer.link && <LocalLink link={peer.link} />}
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

/** The local side of a LAN Link: this node's addresses and the path in use. */
function LocalLink({ link }: { link: Go.transport.LANLinkStatus }) {
    const { t } = useTranslation("ui");
    const variant = link.state === "connected" ? "success" : link.state === "connecting" ? "warning" : "muted";
    return <div className="mt-3 grid min-w-0 gap-2 border-t border-ui-border pt-3">
        <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-ui-heading">{t("lanLink.thisDevice")}</span>
            <Badge variant={variant}>{t(`lanLink.linkState.${link.state}`, { defaultValue: link.state })}</Badge>
        </div>
        <dl className="grid gap-x-3 gap-y-1 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
            {link.localIp && <><dt className="text-ui-muted">{t("peerTunnel.localIp")}</dt><dd className="break-all font-mono">{link.localIp}</dd></>}
            {link.listen && <><dt className="text-ui-muted">{t("lanLink.localListen")}</dt><dd className="break-all font-mono">{link.listen}</dd></>}
            {link.pairingId && <><dt className="text-ui-muted">{t("lanLink.pairingId")}</dt><dd className="break-all font-mono" title={link.pairingId}>{link.pairingId.slice(0, 12)}</dd></>}
            {link.coordinator && <><dt className="text-ui-muted">{t("lanLink.gatewayAddress")}</dt><dd className="break-all font-mono">{link.coordinator}</dd></>}
            {link.peerEndpoint && <><dt className="text-ui-muted">{t("lanLink.peerEndpoint")}</dt><dd className="min-w-0"><LANLinkPath endpoint={link.peerEndpoint} path={link.path} /></dd></>}
        </dl>
        {link.state === "idle" && <p className="text-xs text-ui-muted">{t("lanLink.idleHelp")}</p>}
        {link.state !== "connected" && link.error && <p role="alert" className="break-words text-xs text-ui-danger">{link.error}</p>}
    </div>;
}
