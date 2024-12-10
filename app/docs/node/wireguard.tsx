import { create } from "@bufbuild/protobuf"
import { FC } from "react"
import { Button, Col, Form, InputGroup, Row } from "react-bootstrap"
import { Container, NewItemList, SettingInputText } from "../config/components"
import { wireguard, wireguard_peer_config, wireguard_peer_configSchema } from "../pbes/node/protocol/protocol_pb"
import { Props } from "./tools"

const NewPeersList: FC<{ title: string, data: wireguard_peer_config[], onChange: (x: wireguard_peer_config[]) => void }> =
    ({ title, data, onChange }) => {
        return (<Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2} className="nowrap">{title}</Form.Label>

            {
                data && data.map((v, index) => {
                    return (
                        <Col sm={{ span: 10, offset: index !== 0 ? 2 : 0 }} key={index} >
                            <InputGroup className="mb-2" >
                                <Container
                                    title="Peer"
                                    onClose={() => { onChange([...data.slice(0, index), ...data.slice(index + 1)]) }}>
                                    <Peer value={v} onChange={(e) => { onChange([...data.slice(0, index), e, ...data.slice(index + 1)]) }} />
                                </Container>
                            </InputGroup>
                        </Col>
                    )
                })
            }

            <Col sm={{ span: 10, offset: data?.length !== 0 ? 2 : 0 }}>
                <InputGroup className="mb-2 justify-content-md-end" >
                    <Button variant='outline-success' onClick={() => {
                        onChange([...data, create(wireguard_peer_configSchema, {
                            allowedIps: ["0.0.0.0/0"],
                            endpoint: "127.0.0.1:51820",
                            publicKey: "SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY=",
                        })])
                    }} >
                        <i className="bi bi-plus-lg" />
                    </Button>
                </InputGroup>
            </Col>

        </Form.Group>)
    }

const Peer: FC<Props<wireguard_peer_config>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="Endpoint"
            value={value.endpoint}
            onChange={(e) => { onChange({ ...value, endpoint: e }) }}
        />

        <SettingInputText
            label="PublicKey"
            value={value.publicKey}
            onChange={(e) => { onChange({ ...value, publicKey: e }) }}
        />

        <NewItemList
            title="AllowedIps"
            data={value.allowedIps}
            onChange={(e) => { onChange({ ...value, allowedIps: e }) }}
        />
    </>
}

export const Wireguardv2: FC<Props<wireguard>> = ({ value, onChange }) => {
    return <>
        <SettingInputText
            label="SecretKey"
            value={value.secretKey}
            placeholder="SHVqHEGI7k2+OQ/oWMmWY2EQObbRQjRBdDPimh0h1WY="
            onChange={(e) => { onChange({ ...value, secretKey: e }) }}
        />

        <SettingInputText
            label="MTU"
            value={value.mtu}
            onChange={(e) => { if (!isNaN(Number(e))) onChange({ ...value, mtu: Number(e) }) }}
        />

        <SettingInputText
            label="IdleTimeout"
            value={value.idleTimeout}
            onChange={(e) => { if (!isNaN(Number(e))) onChange({ ...value, idleTimeout: Number(e) }) }}
        />

        <SettingInputText
            label="Reserved"
            value={btoa(String.fromCharCode.apply(null, value.reserved))}
            onChange={(e) => { onChange({ ...value, reserved: Uint8Array.from(atob(e), c => c.charCodeAt(0)) }) }}
        />

        <NewItemList
            title="Endpoint"
            data={value.endpoint}
            onChange={(e) => { onChange({ ...value, endpoint: e }) }}
        />

        <NewPeersList
            title="Peers"
            data={value.peers}
            onChange={(e) => { onChange({ ...value, peers: e }) }}
        />
    </>
}