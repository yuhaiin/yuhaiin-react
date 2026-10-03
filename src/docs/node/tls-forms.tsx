import { base64ToBytes, bytesToBase64 } from "@/common/base64";
import { StringField, BoolField } from "./fields";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/component/v2/accordion";

import { Button } from "@/component/v2/button";

import { SettingInputBytes, SettingInputVertical } from "@/component/v2/forms";

import { InputBytesList, InputList } from "@/component/v2/listeditor";
import type { NodeProtocolConfig } from "@/contract/node";

import { Plus, Trash } from "lucide-react";
import { FC, useState } from "react";
import { useTranslation } from "react-i18next";


const TLSConfigForm: FC<{
    config: Partial<NodeProtocolConfig<"tls">>;
    editable: boolean;
    showEnabled?: boolean;
    onChange: (value: Partial<NodeProtocolConfig<"tls">>) => void;
}> = ({ config, editable, showEnabled = true, onChange }) => {
    const { t: uiT } = useTranslation('ui');
    return (
    <div className="grid gap-4">
        {showEnabled && (
            <BoolField label={uiT("tlsEnabled")} value={config.enable} disabled={!editable} onChange={(enable) => onChange({ ...config, enable })} />
        )}
        <BoolField label={uiT("insecureSkipVerify")} value={config.insecure_skip_verify} disabled={!editable} onChange={(insecure_skip_verify) => onChange({ ...config, insecure_skip_verify })} />
        <InputList title={uiT("serverNames")} data={config.servernames ?? []} disabled={!editable} onChange={(servernames) => onChange({ ...config, servernames })} />
        <InputList title={uiT("nextProtos")} data={config.next_protos ?? []} disabled={!editable} onChange={(next_protos) => onChange({ ...config, next_protos })} />
        <InputBytesList
            title={uiT("caCertificate")}
            data={(config.ca_cert ?? []).map(base64ToBytes)}
            disabled={!editable}
            onChange={(caCert) => onChange({ ...config, ca_cert: caCert.map(bytesToBase64) })}
        />
        <SettingInputBytes
            label={uiT("echConfigList")}
            value={base64ToBytes(config.ech_config)}
            disabled={!editable}
            onChange={(echConfig) => onChange({ ...config, ech_config: bytesToBase64(echConfig) })}
        />
    </div>
);
};

type Certificate = NonNullable<NonNullable<NodeProtocolConfig<"tls_termination">["tls"]>["certificates"]>[number];

const CertificateForm: FC<{
    cert: Certificate;
    editable: boolean;
    onChange: (value: Certificate) => void;
}> = ({ cert, editable, onChange }) => {
    const { t: uiT } = useTranslation('ui');
    return (
    <div className="grid gap-4">
        <SettingInputBytes label={uiT("certificatePem")} value={base64ToBytes(cert.cert)} disabled={!editable} onChange={(value) => onChange({ ...cert, cert: bytesToBase64(value) })} />
        <SettingInputBytes label={uiT("privateKeyPem")} value={base64ToBytes(cert.key)} disabled={!editable} onChange={(value) => onChange({ ...cert, key: bytesToBase64(value) })} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <StringField label={uiT("certFilePath")} value={cert.cert_file_path} disabled={!editable} onChange={(cert_file_path) => onChange({ ...cert, cert_file_path })} />
            <StringField label={uiT("keyFilePath")} value={cert.key_file_path} disabled={!editable} onChange={(key_file_path) => onChange({ ...cert, key_file_path })} />
        </div>
    </div>
);
};

const ServerTLSForm: FC<{
    config: NonNullable<NodeProtocolConfig<"tls_termination">["tls"]>;
    editable: boolean;
    onChange: (value: NonNullable<NodeProtocolConfig<"tls_termination">["tls"]>) => void;
}> = ({ config, editable, onChange }) => {
    const { t: uiT } = useTranslation('ui');

    const certificates = Array.isArray(config.certificates) ? config.certificates : [];
    const sni = config.serverNameCertificate ?? {};
    const [newSNI, setNewSNI] = useState("www.example.com");

    return (
        <div className="grid gap-4">
            <InputList title={uiT("nextProtos")} data={config.next_protos ?? []} disabled={!editable} onChange={(next_protos) => onChange({ ...config, next_protos })} />

            <div>
                <div className="mb-2 flex items-center justify-between px-1">
                    <h6 className="mb-0 font-bold opacity-75">{uiT("certificates")}</h6>
                    <small className="text-ui-muted">{certificates.length} {uiT("entriesLabel")}</small>
                </div>
                <Accordion type="multiple" defaultValue={certificates.length > 0 ? ["cert-0"] : []} className="mb-3">
                    {certificates.map((cert, index) => (
                        <AccordionItem value={`cert-${index}`} key={index}>
                            <AccordionTrigger>{uiT("certificate")} {index + 1}</AccordionTrigger>
                            <AccordionContent>
                                <div className="grid gap-4 p-1">
                                    <CertificateForm
                                        cert={cert}
                                        editable={editable}
                                        onChange={(nextCert) => onChange({ ...config, certificates: certificates.map((item, current) => current === index ? nextCert : item) })}
                                    />
                                    {editable && (
                                        <div className="flex justify-end pt-3">
                                            <Button variant="outline-danger" size="sm" onClick={() => onChange({ ...config, certificates: certificates.filter((_, current) => current !== index) })}>
                                                <Trash size={16} className="mr-2" /> {uiT("remove")}</Button>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                {editable && (
                    <div className="flex justify-end px-1">
                        <Button onClick={() => onChange({ ...config, certificates: [...certificates, { cert: "", key: "", cert_file_path: "", key_file_path: "" }] })}>
                            <Plus className="mr-1" size={16} /> {uiT("newCertificate")}</Button>
                    </div>
                )}
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between px-1">
                    <h6 className="mb-0 font-bold opacity-75">{uiT("sniCertificates")}</h6>
                    <small className="text-ui-muted">{Object.keys(sni).length} {uiT("entriesLabel")}</small>
                </div>
                <Accordion type="multiple" className="mb-3">
                    {Object.entries(sni).map(([serverName, cert]) => (
                        <AccordionItem value={`sni-${serverName}`} key={serverName}>
                            <AccordionTrigger>{serverName}</AccordionTrigger>
                            <AccordionContent>
                                <div className="grid gap-4 p-1">
                                    <CertificateForm
                                        cert={cert}
                                        editable={editable}
                                        onChange={(nextCert) => onChange({ ...config, serverNameCertificate: { ...sni, [serverName]: nextCert } })}
                                    />
                                    {editable && (
                                        <div className="flex justify-end pt-3">
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => {
                                                    const next = { ...sni };
                                                    delete next[serverName];
                                                    onChange({ ...config, serverNameCertificate: next });
                                                }}
                                            >
                                                <Trash size={16} className="mr-2" /> {uiT("remove")}</Button>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                {editable && (
                    <div className="flex flex-wrap items-end gap-3 rounded-ui-lg bg-ui-surface-muted p-3 sm:flex-nowrap">
                        <div className="w-full flex-1">
                            <SettingInputVertical label={uiT("newSniHostname")} value={newSNI} onChange={setNewSNI} />
                        </div>
                        <Button className="mb-4" onClick={() => newSNI && onChange({ ...config, serverNameCertificate: { ...sni, [newSNI]: { cert: "", key: "", cert_file_path: "", key_file_path: "" } } })}>
                            <Plus className="mr-1" size={16} /> {uiT("addSni")}</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

const TLSTerminationForm: FC<{
    config: NodeProtocolConfig<"tls_termination">;
    editable: boolean;
    onChange: (value: Partial<NodeProtocolConfig<"tls_termination">>) => void;
}> = ({ config, editable, onChange }) => (
    <ServerTLSForm config={config.tls ?? {}} editable={editable} onChange={(tls) => onChange({ tls })} />
);

const HTTPTerminationForm: FC<{
    config: NodeProtocolConfig<"http_termination">;
    editable: boolean;
    onChange: (value: Partial<NodeProtocolConfig<"http_termination">>) => void;
}> = ({ config, editable, onChange }) => {
    const { t: uiT } = useTranslation('ui');

    const headers = config.headers ?? {};
    const [newPath, setNewPath] = useState("/");

    const updatePath = (path: string, value: NonNullable<NodeProtocolConfig<"http_termination">["headers"]>[string]) => {
        onChange({ headers: { ...headers, [path]: value } });
    };

    return (
        <div>
            <div className="mb-2 flex items-center justify-between px-1">
                <h6 className="mb-0 font-bold opacity-75">{uiT("httpHeaders")}</h6>
                <small className="text-ui-muted">{Object.keys(headers).length} {uiT("paths")}</small>
            </div>
            <Accordion type="multiple" className="mb-3">
                {Object.entries(headers).map(([path, value]) => {
                    const items = Array.isArray(value.headers) ? value.headers : [];
                    return (
                        <AccordionItem value={`path-${path}`} key={path}>
                            <AccordionTrigger>{path}</AccordionTrigger>
                            <AccordionContent>
                                <div className="grid gap-3 p-1">
                                    {items.map((header, index) => (
                                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2" key={index}>
                                            <StringField label="Key" value={header.key} disabled={!editable} onChange={(key) => updatePath(path, { headers: items.map((item, current) => current === index ? { ...item, key } : item) })} />
                                            <StringField label="Value" value={header.value} disabled={!editable} onChange={(nextValue) => updatePath(path, { headers: items.map((item, current) => current === index ? { ...item, value: nextValue } : item) })} />
                                            {editable && (
                                                <Button className="mt-7" variant="outline-danger" size="icon" onClick={() => updatePath(path, { headers: items.filter((_, current) => current !== index) })}>
                                                    <Trash size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {editable && (
                                        <div className="flex justify-between gap-2">
                                            <Button onClick={() => updatePath(path, { headers: [...items, { key: "", value: "" }] })}>
                                                <Plus className="mr-1" size={16} /> {uiT("addHeader")}</Button>
                                            <Button
                                                variant="outline-danger"
                                                onClick={() => {
                                                    const next = { ...headers };
                                                    delete next[path];
                                                    onChange({ headers: next });
                                                }}
                                            >
                                                <Trash size={16} className="mr-2" /> {uiT("removePath")}</Button>
                                        </div>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
            {editable && (
                <div className="flex flex-wrap items-end gap-3 rounded-ui-lg bg-ui-surface-muted p-3 sm:flex-nowrap">
                    <div className="w-full flex-1">
                        <SettingInputVertical label={uiT("newPath")} value={newPath} onChange={setNewPath} />
                    </div>
                    <Button className="mb-4" onClick={() => newPath && onChange({ headers: { ...headers, [newPath]: { headers: [] } } })}>
                        <Plus className="mr-1" size={16} /> {uiT("addPath")}</Button>
                </div>
            )}
        </div>
    );
};

export { TLSConfigForm, TLSTerminationForm, HTTPTerminationForm };
