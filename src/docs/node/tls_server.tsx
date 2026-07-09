import { Button } from "@/component/v2/button"
import { Card, CardBody, CardTitle } from "@/component/v2/card"
import { SettingInputVertical } from "@/component/v2/forms"
import { Input, Textarea } from "@/component/v2/input"
import { InputList } from "@/component/v2/listeditor"
import { create } from "@/common/plain"
import { Plus, Trash } from 'lucide-react'
import { FC, useState } from "react"
import { certificate, certificateSchema, tls_server_config, tls_termination, tls_server_configSchema } from "../schema/node/protocol"
import { Props } from "./tools"

export const TLSServerComponents = (props: { tls: tls_server_config, onChange: (x: tls_server_config) => void, editable?: boolean }) => {
    const [newSni, setNewSni] = useState("www.example.com")
    const { editable = true } = props;
    const tls = {
        ...props.tls,
        certificates: Array.isArray(props.tls?.certificates) ? props.tls.certificates : [],
        nextProtos: Array.isArray(props.tls?.nextProtos) ? props.tls.nextProtos : [],
        serverNameCertificate: props.tls?.serverNameCertificate ?? {},
    };

    return (
        <>
            <InputList
                title='Next Protos'
                className='mb-4'
                data={tls.nextProtos}
                disabled={!editable}
                onChange={(e) => props.onChange({ ...tls, nextProtos: e })}
            />

            <div className="mb-4">
                <div className="flex justify-between items-center mb-2 px-1">
                    <h6 className="font-bold mb-0 opacity-75">Certificates</h6>
                    <small className="text-gray-500 dark:text-gray-400">{tls.certificates.length} entries</small>
                </div>

                {
                    tls.certificates.map((v, index) => {
                        return <Card className='mb-3' key={"tls_certificates" + index}>
                            <CardBody>
                                {editable && (
                                    <CardTitle className='flex justify-end mb-3'>
                                        <Button variant='outline-danger' size="sm" onClick={() => props.onChange({ ...tls, certificates: tls.certificates.filter((_, i) => i !== index) })}>
                                            <Trash size={16} className="mr-2" /> Remove
                                        </Button>
                                    </CardTitle>
                                )}
                                <TLSCertificateComponents
                                    cert={create(certificateSchema, v)}
                                    editable={editable}
                                    onChange={(e) => {
                                        props.onChange({ ...tls, certificates: [...tls.certificates.slice(0, index), e, ...tls.certificates.slice(index + 1)] })
                                    }
                                    } />
                            </CardBody>
                        </Card>
                    })
                }

                {editable && (
                    <div className="flex justify-end px-1">
                        <Button
                            onClick={() => props.onChange({
                                ...tls, certificates: [...tls.certificates, create(certificateSchema, {
                                    cert: new Uint8Array(0),
                                    key: new Uint8Array(0),
                                    certFilePath: "",
                                    keyFilePath: "",
                                })]
                            })} >
                            <Plus className="mr-1" size={16} /> New Certificate
                        </Button>
                    </div>
                )}
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center mb-2 px-1">
                    <h6 className="font-bold mb-0 opacity-75">SNI Certificates</h6>
                    <small className="text-gray-500 dark:text-gray-400">{Object.keys(tls.serverNameCertificate).length} entries</small>
                </div>

                {
                    Object.entries(tls.serverNameCertificate).map(([k, v]) => {
                        return (
                            <Card className='mb-3' key={"server_name_certificate" + k}>
                                <CardBody>
                                    <CardTitle className='flex justify-between items-center mb-3'>
                                        <span className="font-bold text-primary">{k}</span>
                                        {editable && (
                                            <Button variant='outline-danger' size="sm" onClick={() => {
                                                const serverNameCertificate = { ...tls.serverNameCertificate }
                                                delete serverNameCertificate[k]
                                                props.onChange({ ...tls, serverNameCertificate })
                                            }}>
                                                <Trash size={16} />
                                            </Button>
                                        )}
                                    </CardTitle>
                                    <TLSCertificateComponents cert={create(certificateSchema, v)}
                                        editable={editable}
                                        onChange={(e) => { props.onChange({ ...tls, serverNameCertificate: { ...tls.serverNameCertificate, [k]: e } }) }}
                                    />
                                </CardBody>
                            </Card>
                        )
                    })
                }

                {editable && (
                    <div className="bg-gray-100 dark:bg-[#2b2b40] p-3 rounded-lg flex items-end gap-3 flex-wrap sm:flex-nowrap">
                        <div className="flex-1 w-full">
                            <label className="text-sm font-bold opacity-75 block mb-2">New SNI Hostname</label>
                            <Input value={newSni} onChange={(e) => setNewSni(e.target.value)} />
                        </div>
                        <Button
                            className="mb-1"
                            style={{ height: '35px' }}
                            onClick={() => { if (newSni) props.onChange({ ...tls, serverNameCertificate: { ...tls.serverNameCertificate, [newSni]: create(certificateSchema, {}) } }) }}
                        >
                            <Plus className="mr-1" size={16} /> Add SNI
                        </Button>
                    </div>
                )}
            </div>
        </>
    )
}


export const UnWrapTls: FC<Props<tls_termination>> = ({ value, onChange, editable = true }) => {
    return (
        <>
            <TLSServerComponents tls={value.tls ?? create(tls_server_configSchema, {})} editable={editable} onChange={(e) => onChange({ ...value, tls: e })} />
        </>
    )
}

const TLSCertificateComponents = (props: { cert: certificate, onChange: (x: certificate) => void, editable?: boolean }) => {
    const { editable = true } = props;
    return (
        <>
            <div className="mb-3">
                <label className="text-sm font-bold opacity-75 mb-2 block">Certificate (PEM)</label>
                <Textarea
                    rows={5}
                    readOnly={!editable}
                    className="font-mono text-[0.8rem]"
                    value={new TextDecoder().decode(props.cert.cert)}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => props.onChange({ ...props.cert, cert: new TextEncoder().encode(e.target.value) })}
                />
            </div>

            <div className="mb-3">
                <label className="text-sm font-bold opacity-75 mb-2 block">Private Key (PEM)</label>
                <Textarea
                    rows={5}
                    readOnly={!editable}
                    className="font-mono text-[0.8rem]"
                    value={new TextDecoder().decode(props.cert.key)}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => props.onChange({ ...props.cert, key: new TextEncoder().encode(e.target.value) })}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <SettingInputVertical label='Cert File Path' value={props.cert.certFilePath} disabled={!editable} onChange={(e: string) => props.onChange({ ...props.cert, certFilePath: e })} />
                </div>
                <div>
                    <SettingInputVertical label='Key File Path' value={props.cert.keyFilePath} disabled={!editable} onChange={(e: string) => props.onChange({ ...props.cert, keyFilePath: e })} />
                </div>
            </div>
        </>
    )
}
