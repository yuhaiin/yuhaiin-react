import { create } from "@bufbuild/protobuf"
import { FC, useState } from "react"
import { Button, Card, Form, InputGroup } from "react-bootstrap"
import { NewItemList, SettingInputText, SettingInputTextarea } from "../config/components"
import { certificate, certificateSchema, tls_server_config, tls_termination } from "../pbes/node/protocol_pb"
import { Props } from "./tools"

export const TLSServerComponents = (props: { tls: tls_server_config, onChange: (x: tls_server_config) => void }) => {
    const [newSni, setNewSni] = useState("www.example.com")

    return (
        <>
            <NewItemList
                title='Next Protos'
                className='mb-2'
                data={props.tls?.nextProtos ?? []}
                onChange={(e) => props.onChange({ ...props.tls, nextProtos: e })}
            />

            {
                props.tls && props.tls.certificates.map((v, index) => {
                    return <Card className='mb-2' key={"tls_certificates" + index}>
                        <Card.Body>
                            <Card.Title className='d-flex justify-content-end align-items-center'>
                                <Button variant='outline-danger' onClick={() => props.onChange({ ...props.tls, certificates: props.tls.certificates.filter((_, i) => i !== index) })}>
                                    <i className="bi bi-x-lg"></i>
                                </Button>
                            </Card.Title>
                            <TLSCertificateComponents cert={create(certificateSchema, v)}
                                onChange={(e) => {
                                    props.onChange({ ...props.tls, certificates: [...props.tls.certificates.slice(0, index), e, ...props.tls.certificates.slice(index + 1)] })
                                }
                                } />
                        </Card.Body>
                    </Card>
                })
            }

            <InputGroup className="d-flex justify-content-end mb-2">
                <Button variant='outline-success'
                    onClick={() => props.onChange({
                        ...props.tls, certificates: [...props.tls.certificates, create(certificateSchema, {
                            cert: new Uint8Array(0),
                            key: new Uint8Array(0),
                            certFilePath: "",
                            keyFilePath: "",
                        })]
                    })} >
                    <i className="bi bi-plus-lg" />New Certificate
                </Button>
            </InputGroup>


            {
                props.tls && props.tls.serverNameCertificate
                && Object.entries(props.tls.serverNameCertificate).map(([k, v]) => {
                    return (
                        <Card className='mb-2' key={"server_name_certificate" + k}>
                            <Card.Body>
                                <Card.Title className='d-flex justify-content-between align-items-center'>
                                    {k}
                                    <Button variant='outline-danger' onClick={() => {
                                        const serverNameCertificate = { ...props.tls.serverNameCertificate }
                                        delete serverNameCertificate[k]
                                        props.onChange({ ...props.tls, serverNameCertificate })
                                    }}>
                                        <i className="bi bi-x-lg"></i>
                                    </Button>
                                </Card.Title>
                                <TLSCertificateComponents cert={create(certificateSchema, v)}
                                    onChange={(e) => { props.onChange({ ...props.tls, serverNameCertificate: { ...props.tls.serverNameCertificate, [k]: e } }) }}
                                />
                            </Card.Body>
                        </Card>
                    )
                })
            }

            <InputGroup className="d-flex justify-content-end">
                <Form.Control value={newSni} onChange={(e) => setNewSni(e.target.value)} />
                <Button variant='outline-success'
                    onClick={() => { if (newSni) props.onChange({ ...props.tls, serverNameCertificate: { ...props.tls.serverNameCertificate, [newSni]: create(certificateSchema, {}) } }) }}
                >
                    <i className="bi bi-plus-lg" />New SNI Certificate
                </Button>
            </InputGroup>
        </>
    )
}


export const UnWrapTls: FC<Props<tls_termination>> = ({ value, onChange }) => {
    return (
        <>
            <TLSServerComponents tls={value.tls} onChange={(e) => onChange({ ...value, tls: e })} />
        </>
    )
}

const TLSCertificateComponents = (props: { cert: certificate, onChange: (x: certificate) => void }) => {
    return (
        <>
            <SettingInputTextarea label='Cert' value={new TextDecoder().decode(props.cert.cert)}
                onChange={(e: string) => props.onChange({ ...props.cert, cert: new TextEncoder().encode(e) })} />

            <SettingInputTextarea label='Key' value={new TextDecoder().decode(props.cert.key)}
                onChange={(e: string) => props.onChange({ ...props.cert, key: new TextEncoder().encode(e) })} />

            <SettingInputText label='Cert File' value={props.cert.certFilePath} onChange={(e: string) => props.onChange({ ...props.cert, certFilePath: e })} />
            <SettingInputText label='Key File' value={props.cert.keyFilePath} onChange={(e: string) => props.onChange({ ...props.cert, keyFilePath: e })} />
        </>
    )
}