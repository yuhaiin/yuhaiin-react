import type { Go } from "@/api/generated-contracts";
import { createLANLinkInvitation, revokeLANLinkClient } from "@/api/inbounds";
import { usePermission, useSession } from "@/auth/context";
import { useProtectedSetting } from "@/auth/secret-fields";
import { Button } from "@/component/v2/button";
import { confirmAction } from "@/component/v2/confirmation";
import { FormSection } from "@/component/v2/form-section";
import { SettingInputVertical } from "@/component/v2/forms";
import { useAsyncAction } from "@/hooks/use-editor-draft";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function LANLinkClients({ id, clients, refresh }: {
    id: string;
    clients: Go.inbound.LANLinkClient[];
    refresh: () => Promise<unknown>;
}) {
    const { t } = useTranslation("ui");
    const [issued, setIssued] = useState<Go.inbound.LANLinkInvitationResponse>();
    const [copied, setCopied] = useState(false);
    const [failed, setFailed] = useState(false);
    const manage = useProtectedSetting("manage");
    const reveal = usePermission("secrets:read");
    const local = useSession()?.principal.credentialType === "local";
    const { pending, run } = useAsyncAction(() => setFailed(true));

    return <FormSection title={t("lanLink.clients")}>
        <div className="grid min-w-0 gap-3">
            <Button permission="inbounds:write" className="justify-self-start" disabled={!manage || (!reveal && !local) || pending}
                onClick={() => void run(async () => {
                    setFailed(false);
                    setCopied(false);
                    setIssued(await createLANLinkInvitation(id));
                    await refresh();
                })}>{t("lanLink.generateInvitation")}</Button>
            {issued && <div className="grid min-w-0 gap-2">
                <SettingInputVertical label={t("lanLink.invitation")} value={issued.invitation} onChange={() => {}} readOnly />
                <Button className="justify-self-start" disabled={pending || !navigator.clipboard}
                    onClick={() => void run(async () => {
                        await navigator.clipboard.writeText(issued.invitation);
                        setCopied(true);
                    })}>{t(copied ? "lanLink.invitationCopied" : "lanLink.copyInvitation")}</Button>
                <p className="text-sm text-ui-muted">{t("lanLink.assignedAddress", { address: issued.address })}</p>
            </div>}
            <ul className="grid gap-2">
                {clients.map(client => <li key={client.id} className="flex flex-wrap items-center justify-between gap-2">
                    <code className="text-sm" title={client.id}>{client.id.slice(0, 12)}</code>
                    <Button permission="inbounds:write" disabled={pending || !manage} size="sm"
                        onClick={() => void run(async () => {
                            if (!await confirmAction(t("lanLink.revokeConfirm"))) return;
                            setFailed(false);
                            await revokeLANLinkClient(id, client.id);
                            if (issued?.clientId === client.id) setIssued(undefined);
                            await refresh();
                        })}>{t("lanLink.revoke")}</Button>
                </li>)}
            </ul>
            {failed && <p role="alert" className="text-sm text-ui-danger">{t("lanLink.actionFailed")}</p>}
        </div>
    </FormSection>;
}
