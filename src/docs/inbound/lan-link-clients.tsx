import type { Go } from "@/api/generated-contracts";
import { createLANLinkInvitation, listLANLinkClients, revokeLANLinkClient, updateLANLinkClient } from "@/api/inbounds";
import { usePermission, useSession } from "@/auth/context";
import { useProtectedSetting } from "@/auth/secret-fields";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { confirmAction } from "@/component/v2/confirmation";
import { FormSection } from "@/component/v2/form-section";
import { SettingInputVertical } from "@/component/v2/forms";
import { Pagination } from "@/component/v2/pagination";
import { useAsyncAction } from "@/hooks/use-editor-draft";
import { clampPage } from "@/hooks/use-pagination";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

const PAGE_SIZE = 8;

/** Manages the clients of a LAN Link gateway: invitations, status and access. */
export function LANLinkClients({ id }: { id: string }) {
    const { t } = useTranslation("ui");
    const [issued, setIssued] = useState<Go.inbound.LANLinkInvitationResponse>();
    const [copied, setCopied] = useState(false);
    const [failed, setFailed] = useState(false);
    const [requestedPage, setPage] = useState(1);
    const manage = useProtectedSetting("manage");
    const reveal = usePermission("secrets:read");
    const local = useSession()?.principal.credentialType === "local";
    const { pending, run } = useAsyncAction(() => setFailed(true));
    const { data, error, mutate } = useSWR(["lan-link-clients", id], () => listLANLinkClients(id),
        { refreshInterval: 5_000, revalidateOnFocus: false, shouldRetryOnError: false });
    const total = data?.items.length ?? 0;
    const page = clampPage(requestedPage, total, PAGE_SIZE);
    const start = (page - 1) * PAGE_SIZE;

    const act = (client: Go.inbound.LANLinkClientStatus, action: "kick" | "block" | "unblock") => void run(async () => {
        if (action !== "unblock" && !await confirmAction(t(action === "kick" ? "peerTunnel.kickConfirm" : "peerTunnel.blockConfirm"))) return;
        setFailed(false);
        await updateLANLinkClient(id, client.id, action);
        await mutate();
    });

    return <FormSection title={t("lanLink.clients")} description={t("lanLink.clientsHelp")}>
        <div className="grid min-w-0 gap-3">
            {data && !data.running && <p role="status" className="text-sm text-ui-muted">{t("lanLink.inactive")}</p>}
            {data?.running && data.publicEndpoint && <p className="break-all text-sm text-ui-muted">{t("lanLink.publicAddress", { address: data.publicEndpoint })}</p>}
            {data?.running && !data.publicEndpoint && data.publicError && <p role="alert" className="text-sm text-ui-danger">{t("lanLink.publicEndpointMissing")}</p>}
            <Button permission="inbounds:write" variant="primary" className="justify-self-start" disabled={!manage || (!reveal && !local) || pending || !data?.running}
                onClick={() => void run(async () => {
                    setFailed(false);
                    setCopied(false);
                    setIssued(await createLANLinkInvitation(id));
                    await mutate();
                })}>{t("lanLink.generateInvitation")}</Button>
            {issued && <div className="grid min-w-0 gap-2 rounded-ui-md border border-ui-border p-3">
                <SettingInputVertical label={t("lanLink.invitation")} value={issued.invitation} onChange={() => {}} readOnly />
                <Button className="justify-self-start" disabled={pending || !navigator.clipboard}
                    onClick={() => void run(async () => {
                        await navigator.clipboard.writeText(issued.invitation);
                        setCopied(true);
                    })}>{t(copied ? "lanLink.invitationCopied" : "lanLink.copyInvitation")}</Button>
                <p className="text-sm text-ui-muted">{t("lanLink.assignedAddress", { address: issued.address })}</p>
            </div>}
            {error && <p role="alert" className="text-sm text-ui-danger">{t("lanLink.loadFailed")} <Button size="sm" onClick={() => void mutate()}>{t("refresh")}</Button></p>}
            {data && total === 0 && <p className="text-sm text-ui-muted">{t("lanLink.noClients")}</p>}
            <ul className="grid gap-2">
                {data?.items.slice(start, start + PAGE_SIZE).map(client => <li key={client.id} className="grid min-w-0 gap-2 rounded-ui-md border border-ui-border p-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <code className="text-sm" title={client.id}>{client.id.slice(0, 12)}</code>
                        <Badge variant={client.blocked ? "danger" : client.retryAt ? "warning" : client.online ? "success" : "muted"}>
                            {t(client.blocked ? "peerTunnel.peerState.blocked" : client.retryAt ? "peerTunnel.peerState.kicked" : client.online ? "lanLink.online" : "peerTunnel.peerState.offline")}
                        </Badge>
                    </div>
                    <dl className="grid gap-x-3 gap-y-1 text-sm sm:grid-cols-[auto_minmax(0,1fr)]">
                        <dt className="text-ui-muted">{t("lanLink.tunnelAddress")}</dt><dd className="break-all font-mono">{client.address}</dd>
                        <dt className="text-ui-muted">{t("lanLink.pairingId")}</dt><dd className="break-all font-mono" title={client.pairingId}>{client.pairingId.slice(0, 12)}</dd>
                        <dt className="text-ui-muted">{t("peerTunnel.dialer")}</dt><dd className="break-all font-mono">{client.dialerEndpoint ?? t("peerTunnel.peerState.offline")}</dd>
                        <dt className="text-ui-muted">{t("peerTunnel.publisher")}</dt><dd className="break-all font-mono">{client.publisherEndpoint ?? t("peerTunnel.peerState.offline")}</dd>
                    </dl>
                    <div className="flex flex-wrap gap-2">
                        {!client.blocked && <Button permission="inbounds:write" size="sm" disabled={pending || !data.running || !client.online} onClick={() => act(client, "kick")}>{t("peerTunnel.kick")}</Button>}
                        <Button permission="inbounds:write" size="sm" disabled={pending} onClick={() => act(client, client.blocked ? "unblock" : "block")}>{t(client.blocked ? "peerTunnel.unblock" : "peerTunnel.block")}</Button>
                        <Button permission="inbounds:write" size="sm" disabled={pending || !manage}
                            onClick={() => void run(async () => {
                                if (!await confirmAction(t("lanLink.revokeConfirm"))) return;
                                setFailed(false);
                                await revokeLANLinkClient(id, client.id);
                                if (issued?.clientId === client.id) setIssued(undefined);
                                await mutate();
                            })}>{t("lanLink.revoke")}</Button>
                    </div>
                </li>)}
            </ul>
            {total > PAGE_SIZE && <Pagination currentPage={page} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setPage} />}
            {failed && <p role="alert" className="text-sm text-ui-danger">{t("lanLink.actionFailed")}</p>}
        </div>
    </FormSection>;
}
