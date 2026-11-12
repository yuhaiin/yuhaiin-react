import type { Go } from "@/api/generated-contracts";
import { useSecretField } from "@/auth/secret-fields";
import { bytesToBase64 } from "@/common/base64";
import { useAsyncAction } from "@/hooks/use-editor-draft";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./v2/button";
import { SettingInputVertical } from "./v2/forms";
import { InputList } from "./v2/listeditor";

export function PeerTunnelForm({ value, onChange, disabled }: {
    value: Partial<Go.transport.PeerTunnel>;
    onChange: (patch: Partial<Go.transport.PeerTunnel>) => void;
    disabled?: boolean;
}) {
    const { t: uiT } = useTranslation("ui");
    const access = useSecretField(value.privateKey, true);
    const [generated, setGenerated] = useState<{ privateKey: string; publicKey: string }>();
    const [generationFailed, setGenerationFailed] = useState(false);
    const { pending, run } = useAsyncAction(() => setGenerationFailed(true));
    const generate = () => {
        setGenerationFailed(false);
        void run(async () => {
            const keys = await crypto.subtle.generateKey("X25519", true, ["deriveBits"]) as CryptoKeyPair;
            const { d } = await crypto.subtle.exportKey("jwk", keys.privateKey);
            if (!d) throw new Error("Missing X25519 private key");
            const privateKey = d.replace(/-/g, "+").replace(/_/g, "/") + "=";
            const publicKey = bytesToBase64(new Uint8Array(await crypto.subtle.exportKey("raw", keys.publicKey)));
            setGenerated({ privateKey, publicKey });
            onChange({ privateKey });
        });
    };
    return <div className="grid min-w-0 gap-4">
        <SettingInputVertical label={uiT("peerTunnel.coordinator")} value={value.coordinator ?? ""} onChange={coordinator => onChange({ coordinator })} disabled={disabled} placeholder="tunnel.example.net:51821" />
        <SettingInputVertical secret type="password" label={uiT("peerTunnel.token")} value={value.token ?? ""} onChange={token => onChange({ token })} disabled={disabled} />
        <div className="grid min-w-0 gap-2">
            <SettingInputVertical secret type="password" label={uiT("privateKey")} value={value.privateKey ?? ""} onChange={privateKey => onChange({ privateKey })} disabled={disabled || pending} />
            {!value.privateKey && !access.disabled && !disabled && <Button className="justify-self-start" loading={pending} onClick={generate}>{uiT("peerTunnel.generateKey")}</Button>}
            {generationFailed && <p role="alert" className="text-sm text-ui-danger">{uiT("peerTunnel.keyError")}</p>}
            {generated && generated.privateKey === value.privateKey && <SettingInputVertical label={uiT("peerTunnel.sharePublicKey")} value={generated.publicKey} onChange={() => {}} readOnly />}
        </div>
        <SettingInputVertical label={uiT("peerTunnel.peerPublicKey")} value={value.peerPublicKey ?? ""} onChange={peerPublicKey => onChange({ peerPublicKey })} disabled={disabled} />
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <SettingInputVertical label={uiT("peerTunnel.localIp")} value={value.localIp ?? ""} onChange={localIp => onChange({ localIp })} disabled={disabled} />
            <SettingInputVertical label={uiT("peerTunnel.peerIp")} value={value.peerIp ?? ""} onChange={peerIp => onChange({ peerIp })} disabled={disabled} />
        </div>
        <InputList title={uiT("peerTunnel.routes")} data={value.routes} onChange={routes => onChange({ routes })} disabled={disabled} placeholder="192.168.1.0/24" />
    </div>;
}

export function PeerDiscoveryForm({ value, onChange }: {
    value: Go.inbound.PeerDiscoveryProtocol;
    onChange: (patch: Partial<Go.inbound.PeerDiscoveryProtocol>) => void;
}) {
    const { t: uiT } = useTranslation("ui");
    const access = useSecretField(undefined, true);
    const { tokens, registrationKeys = [] } = value;
    const newKey = () => bytesToBase64(crypto.getRandomValues(new Uint8Array(32)));
    return <div className="grid min-w-0 gap-4">
        <div className="grid gap-2">
            <InputList secret title={uiT("lanLink.registrationKeys")} data={registrationKeys} onChange={registrationKeys => onChange({ registrationKeys })} />
            <Button className="justify-self-start" disabled={access.disabled || registrationKeys.length >= 64}
                onClick={() => onChange({ registrationKeys: [...registrationKeys, newKey()] })}>{uiT("lanLink.generateRegistration")}</Button>
        </div>
        <details>
            <summary>{uiT("peerTunnel.tokens")}</summary>
            <InputList secret title={uiT("peerTunnel.tokens")} data={tokens} onChange={tokens => onChange({ tokens })} />
            <Button disabled={access.disabled || tokens.length >= 1024}
                onClick={() => onChange({ tokens: [...tokens, newKey()] })}>{uiT("peerTunnel.generateToken")}</Button>
        </details>
    </div>;
}
