import { base64ToBytes, bytesToBase64 } from "@/common/base64";

import { StringField, NumberField, BoolField, MoreOptions, stringValue, numberValue } from "./fields";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";
import { Input } from "@/component/v2/input";

import { Button } from "@/component/v2/button";
import { SettingInputBytes } from "@/component/v2/forms";
import { InputList } from "@/component/v2/listeditor";
import type { NodeProtocolConfig } from "@/contract/node";

import { ArrowDown, ArrowUp, Plus, Trash } from "lucide-react";
import { FC } from "react";
import { useTranslation } from "react-i18next";

type FixedAddress = {
    host?: string;
    port?: number;
    network_interface?: string;
};

const AddressList: FC<{
    title: string;
    data?: FixedAddress[];
    editable: boolean;
    onChange: (value: FixedAddress[]) => void;
}> = ({ title, data, editable, onChange }) => {
    const { t: uiT } = useTranslation('ui');

    const items = Array.isArray(data) ? data : [];

    const update = (index: number, patch: Partial<FixedAddress>) => {
        const next = [...items];
        next[index] = { ...next[index], ...patch };
        onChange(next);
    };

    const move = (index: number, direction: -1 | 1) => {
        const nextIndex = index + direction;
        if (nextIndex < 0 || nextIndex >= items.length) return;
        const next = [...items];
        [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
        onChange(next);
    };

    const label = (index: number) => {
        const item = items[index];
        const host = stringValue(item?.host);
        const port = numberValue(item?.port);
        if (!host) return `Entry ${index + 1}`;
        return port > 0 ? `${host}:${port}` : host;
    };

    // Header and rows are separate grids, so the action column needs a fixed width to line up.
    const columns = editable ? "md:grid-cols-[minmax(0,2fr)_7rem_minmax(0,1fr)_7.5rem]" : "md:grid-cols-[minmax(0,2fr)_7rem_minmax(0,1fr)]";

    return (
        <div>
            <div className="mb-2 flex items-center justify-between px-1">
                <h6 className="mb-0 text-sm font-medium text-ui-heading">{title}</h6>
                <small className="text-ui-muted">{uiT("entryCount", { count: items.length })}</small>
            </div>

            {items.length > 0 && (
                <div className="divide-y divide-ui-border rounded-ui-md border border-ui-border">
                    <div className={`hidden gap-2 px-2.5 pb-1.5 pt-2 text-xs text-ui-muted md:grid ${columns}`}>
                        <span className="truncate">{uiT("host")}</span>
                        <span className="truncate">{uiT("port")}</span>
                        <span className="truncate" title={uiT("networkInterface")}>{uiT("networkInterface")}</span>
                    </div>
                    {items.map((item, index) => (
                        <div key={index} className={`grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-2 p-2.5 ${columns}`}>
                            <Input size="sm" className="max-md:col-span-2" aria-label={`${uiT("host")} ${index + 1}`} placeholder="example.com:443" value={stringValue(item.host)} disabled={!editable} onChange={(event) => update(index, { host: event.target.value })} />
                            <Input size="sm" type="number" min={0} aria-label={`${uiT("port")} ${index + 1}`} placeholder={uiT("unsetPlaceholder")} value={numberValue(item.port) || ""} disabled={!editable} onChange={(event) => update(index, { port: numberValue(event.target.value) })} />
                            <Input size="sm" aria-label={`${uiT("networkInterface")} ${index + 1}`} placeholder={uiT("optionalPlaceholder")} value={stringValue(item.network_interface)} disabled={!editable} onChange={(event) => update(index, { network_interface: event.target.value })} />
                            {editable && (
                                <div className="flex justify-end gap-1 max-md:col-span-2 max-md:-my-1">
                                    <Button size="icon" variant="ghost" aria-label={`${uiT("moveUp")} ${label(index)}`} onClick={() => move(index, -1)} disabled={index === 0}><ArrowUp size={15} /></Button>
                                    <Button size="icon" variant="ghost" aria-label={`${uiT("moveDown")} ${label(index)}`} onClick={() => move(index, 1)} disabled={index === items.length - 1}><ArrowDown size={15} /></Button>
                                    <Button size="icon" variant="ghost" className="text-ui-danger" aria-label={`${uiT("delete")} ${label(index)}`} onClick={() => onChange(items.filter((_, current) => current !== index))}><Trash size={15} /></Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {editable && (
                <Button size="sm" variant="ghost" className="mt-2" onClick={() => onChange([...items, { host: "", port: 0, network_interface: "" }])}>
                    <Plus className="mr-1" size={15} /> {uiT("addItem", { item: title })}
                </Button>
            )}
        </div>
    );
};

const FixedForm: FC<{
    config: NodeProtocolConfig<"fixed">;
    editable: boolean;
    onChange: (value: Partial<NodeProtocolConfig<"fixed">>) => void;
}> = ({ config, editable, onChange }) => {
    const { t: uiT } = useTranslation('ui');
    return (
    <div className="grid gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StringField label={uiT("host")} value={config.host} disabled={!editable} onChange={(host) => onChange({ host })} />
            <NumberField label={uiT("port")} value={config.port} disabled={!editable} onChange={(port) => onChange({ port })} />
            <StringField label={uiT("networkInterface")} value={config.network_interface} disabled={!editable} onChange={(network_interface) => onChange({ network_interface })} />
        </div>
        <AddressList
            title={uiT("alternateHost")}
            data={config.alternate_host ?? []}
            editable={editable}
            onChange={(alternate_host) => onChange({ alternate_host })}
        />
    </div>
);
};

const FixedV2Form: FC<{
    config: NodeProtocolConfig<"fixedv2">;
    editable: boolean;
    onChange: (value: Partial<NodeProtocolConfig<"fixedv2">>) => void;
}> = ({ config, editable, onChange }) => {
    const { t: uiT } = useTranslation('ui');

    const addresses = Array.isArray(config.addresses) ? config.addresses : [];

    return (
        <div className="grid gap-4">
            <AddressList title={uiT("hosts")} data={addresses} editable={editable} onChange={(next) => onChange({ addresses: next })} />
            <MoreOptions active={config.udp_happy_eyeballs === true}>
                <BoolField label={uiT("udpHappyeyeballs")} value={config.udp_happy_eyeballs} disabled={!editable} onChange={(udp_happy_eyeballs) => onChange({ udp_happy_eyeballs })} />
            </MoreOptions>
        </div>
    );
};

const WireguardForm: FC<{
    config: NodeProtocolConfig<"wireguard">;
    hideReserved?: boolean;
    editable: boolean;
    onChange: (value: Partial<NodeProtocolConfig<"wireguard">>) => void;
}> = ({ config, editable, onChange, hideReserved }) => {
    const { t: uiT } = useTranslation('ui');

    const peers = Array.isArray(config.peers) ? config.peers : [];

    const updatePeer = (index: number, patch: Partial<NonNullable<NodeProtocolConfig<"wireguard">["peers"]>[number]>) => {
        const next = [...peers];
        next[index] = { ...next[index], ...patch };
        onChange({ peers: next });
    };

    return (
        <div className="grid gap-4">
            <StringField secret label={uiT("secretKey")} value={config.secretKey} disabled={!editable} onChange={(secretKey) => onChange({ secretKey })} />
            <NumberField label="MTU" value={config.mtu} disabled={!editable} onChange={(mtu) => onChange({ mtu })} />
            {!hideReserved && <SettingInputBytes
                label={uiT("reserved")}
                value={base64ToBytes(config.reserved)}
                disabled={!editable}
                onChange={(reserved) => onChange({ reserved: bytesToBase64(reserved) })}
            />}
            <InputList title={uiT("localAddress")} data={config.endpoint ?? []} disabled={!editable} onChange={(endpoint) => onChange({ endpoint })} />

            <div>
                <div className="mb-2 flex items-center justify-between px-1">
                    <h6 className="mb-0 font-bold opacity-75">{uiT("peers")}</h6>
                    <small className="text-ui-muted">{uiT("peerCount", { count: peers.length })}</small>
                </div>

                <Accordion type="multiple" defaultValue={peers.length > 0 ? ["peer-0"] : []} className="mb-3">
                    {peers.map((peer, index) => (
                        <AccordionItem value={`peer-${index}`} key={index}>
                            <AccordionTrigger>
                                <span className="truncate">{peer.endpoint || `Peer ${index + 1}`}</span>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="grid gap-4 p-1">
                                    <StringField label={uiT("endpoint")} value={peer.endpoint} disabled={!editable} onChange={(endpoint) => updatePeer(index, { endpoint })} />
                                    <StringField label={uiT("publicKey")} value={peer.publicKey} disabled={!editable} onChange={(publicKey) => updatePeer(index, { publicKey })} />
                                    <StringField secret label={uiT("preSharedKey")} value={peer.preSharedKey} disabled={!editable} onChange={(preSharedKey) => updatePeer(index, { preSharedKey })} />
                                    <NumberField label={uiT("keepAlive")} value={peer.keepAlive} disabled={!editable} onChange={(keepAlive) => updatePeer(index, { keepAlive })} />
                                    <InputList title={uiT("allowedIps")} data={peer.allowedIps ?? []} disabled={!editable} onChange={(allowedIps) => updatePeer(index, { allowedIps })} />

                                    {editable && (
                                        <div className="flex justify-end pt-3">
                                            <Button variant="outline-danger" size="sm" onClick={() => onChange({ peers: peers.filter((_, current) => current !== index) })}>
                                                <Trash size={16} className="mr-2" /> {uiT("deletePeer")}</Button>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                {editable && (
                    <div className="flex justify-end px-1">
                        <Button onClick={() => onChange({ peers: [...peers, { allowedIps: ["0.0.0.0/0"], endpoint: "127.0.0.1:51820", publicKey: "" }] })}>
                            <Plus className="mr-1" size={16} /> {uiT("addPeer")}</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export { WireguardForm, FixedForm, FixedV2Form };
