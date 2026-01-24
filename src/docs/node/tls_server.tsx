import { Button } from "@/component/v2/button"
import { Card, CardBody, CardTitle } from "@/component/v2/card"
import { SettingInputVertical } from "@/component/v2/forms"
import { Input, Textarea } from "@/component/v2/input"
import { InputList } from "@/component/v2/listeditor"
import { create } from "@bufbuild/protobuf"
import { FC, useState } from "react"
import { PlusLg, Trash } from "react-bootstrap-icons"
import { certificate, certificateSchema, tls_server_config, tls_termination } from "../pbes/node/protocol_pb"
import { Props } from "./tools"

export const TLSServerComponents = (props: { tls: tls_server_config, onChange: (x: tls_server_config) => void, editable?: boolean }) => {
    const [newSni, setNewSni] = useState("www.example.com")
    const { editable = true } = props;

    return (
        <>
            <InputList
                title='Next Protos'
                className='mb-4'
                data={props.tls?.nextProtos ?? []}
                disabled={!editable}
                onChange={(e) => props.onChange({ ...props.tls, nextProtos: e })}
            />

            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                    <h6 className="fw-bold mb-0 opacity-75">Certificates</h6>
                    <small className="text-muted">{props.tls.certificates.length} entries</small>
                </div>

                {
                    props.tls && props.tls.certificates.map((v, index) => {
                        return <Card className='mb-3' key={"tls_certificates" + index}>
                            <CardBody>
                                {editable && (
                                    <CardTitle className='d-flex justify-content-end mb-3'>
                                        <Button variant='outline-danger' size="sm" onClick={() => props.onChange({ ...props.tls, certificates: props.tls.certificates.filter((_, i) => i !== index) })}>
                                            <Trash /> Remove
                                        </Button>
                                    </CardTitle>
                                )}
                                <TLSCertificateComponents
                                    cert={create(certificateSchema, v)}
                                    editable={editable}
                                    onChange={(e) => {
                                        props.onChange({ ...props.tls, certificates: [...props.tls.certificates.slice(0, index), e, ...props.tls.certificates.slice(index + 1)] })
                                    }
                                    } />
                            </CardBody>
                        </Card>
                    })
                }

                {editable && (
                    <div className="d-flex justify-content-end px-1">
                        <Button variant='outline-primary'
                            onClick={() => props.onChange({
                                ...props.tls, certificates: [...props.tls.certificates, create(certificateSchema, {
                                    cert: new Uint8Array(0),
                                    key: new Uint8Array(0),
                                    certFilePath: "",
                                    keyFilePath: "",
                                })]
                            })} >
                            <PlusLg className="me-1" /> New Certificate
                        </Button>
                    </div>
                )}
            </div>

            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2 px-1">
                    <h6 className="fw-bold mb-0 opacity-75">SNI Certificates</h6>
                    <small className="text-muted">{Object.keys(props.tls.serverNameCertificate || {}).length} entries</small>
                </div>

                {
                    props.tls && props.tls.serverNameCertificate
                    && Object.entries(props.tls.serverNameCertificate).map(([k, v]) => {
                        return (
                            <Card className='mb-3' key={"server_name_certificate" + k}>
                                <CardBody>
                                    <CardTitle className='d-flex justify-content-between align-items-center mb-3'>
                                        <span className="fw-bold text-primary">{k}</span>
                                        {editable && (
                                            <Button variant='outline-danger' size="sm" onClick={() => {
                                                const serverNameCertificate = { ...props.tls.serverNameCertificate }
                                                delete serverNameCertificate[k]
                                                props.onChange({ ...props.tls, serverNameCertificate })
                                            }}>
                                                <Trash />
                                            </Button>
                                        )}
                                    </CardTitle>
                                    <TLSCertificateComponents cert={create(certificateSchema, v)}
                                        editable={editable}
                                        onChange={(e) => { props.onChange({ ...props.tls, serverNameCertificate: { ...props.tls.serverNameCertificate, [k]: e } }) }}
                                    />
                                </CardBody>
                            </Card>
                        )
                    })
                }

                {editable && (
                    <div className="bg-body-tertiary p-3 rounded-3 d-flex align-items-end gap-3 flex-wrap flex-sm-nowrap">
                        <div className="flex-grow-1">
                            <label className="form-label small fw-bold opacity-75">New SNI Hostname</label>
                            <Input value={newSni} onChange={(e) => setNewSni(e.target.value)} />
                        </div>
                        <Button variant='outline-primary'
                            className="mb-1"
                            style={{ height: '35px' }}
                            onClick={() => { if (newSni) props.onChange({ ...props.tls, serverNameCertificate: { ...props.tls.serverNameCertificate, [newSni]: create(certificateSchema, {}) } }) }}
                        >
                            <PlusLg className="me-1" /> Add SNI
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
            <TLSServerComponents tls={value.tls} editable={editable} onChange={(e) => onChange({ ...value, tls: e })} />
        </>
    )
}

const TLSCertificateComponents = (props: { cert: certificate, onChange: (x: certificate) => void, editable?: boolean }) => {
    const { editable = true } = props;
    return (
        <>
            <div className="mb-3">
                <label className="form-label small fw-bold opacity-75 mb-2">Certificate (PEM)</label>
                <Textarea
                    rows={5}
                    readOnly={!editable}
                    className="font-monospace"
                    style={{ fontSize: '0.8rem' }}
                    value={new TextDecoder().decode(props.cert.cert)}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => props.onChange({ ...props.cert, cert: new TextEncoder().encode(e.target.value) })}
                />
            </div>

            <div className="mb-3">
                <label className="form-label small fw-bold opacity-75 mb-2">Private Key (PEM)</label>
                <Textarea
                    rows={5}
                    readOnly={!editable}
                    className="font-monospace"
                    style={{ fontSize: '0.8rem' }}
                    value={new TextDecoder().decode(props.cert.key)}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => props.onChange({ ...props.cert, key: new TextEncoder().encode(e.target.value) })}
                />
            </div>

            <div className="row g-3">
                <div className="col-md-6">
                    <SettingInputVertical label='Cert File Path' value={props.cert.certFilePath} disabled={!editable} onChange={(e: string) => props.onChange({ ...props.cert, certFilePath: e })} />
                </div>
                <div className="col-md-6">
                    <SettingInputVertical label='Key File Path' value={props.cert.keyFilePath} disabled={!editable} onChange={(e: string) => props.onChange({ ...props.cert, keyFilePath: e })} />
                </div>
            </div>
        </>
    )
}