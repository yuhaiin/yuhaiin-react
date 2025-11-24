"use client"

import { Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { useLocalStorage } from "usehooks-ts";
import { APIUrlDefault, APIUrlKey, LatencyDNSUrlDefault, LatencyDNSUrlKey, LatencyHTTPUrlDefault, LatencyHTTPUrlKey, LatencyIPUrlDefault, LatencyIPUrlKey, LatencyIPv6Default, LatencyIPv6Key, LatencyStunTCPUrlDefault, LatencyStunTCPUrlKey, LatencyStunUrlDefault, LatencyStunUrlKey } from "../common/apiurl";
import { SettingCheck } from "../common/switch";
import { SettingInputText } from "../config/components";

const OnelineEdit = (props: {
    title: string,
    value: string,
    onChange: (v: string) => void,
    onClick: () => void,
    buttonText?: string,
    placeholder?: string,
    loading?: boolean,
    className?: string
}) => {
    return <>
        <Form.Group as={Row} className={'ms-1' + (props.className ? " " + props.className : "")}>
            <Row>
                <Form.Label column sm={2} className="nowrap">{props.title}</Form.Label>
                <Col sm={6}>
                    <Form.Control value={props.value} onChange={(v) => props.onChange(v.target.value)} placeholder={props.placeholder} />
                </Col>
                <Col sm={2}>
                    <Button disabled={props.loading} onClick={() => props.onClick()} variant="outline-primary">
                        {props.buttonText ? props.buttonText : "Save"}
                        {props.loading &&
                            <Spinner size="sm" animation="border" variant='primary' />}
                    </Button>
                </Col>
            </Row>
        </Form.Group>
    </>
}

function Setting() {
    const [url, setUrl] = useLocalStorage(APIUrlKey, APIUrlDefault);
    const [latencyHTTP, setLatencyHTTP] = useLocalStorage(LatencyHTTPUrlKey, LatencyHTTPUrlDefault);
    const [latencyDNS, setLatencyDNS] = useLocalStorage(LatencyDNSUrlKey, LatencyDNSUrlDefault);
    const [latencyIPv6, setLatencyIPv6] = useLocalStorage(LatencyIPv6Key, LatencyIPv6Default);
    const [latencyIPUrl, setLatencyIPUrl] = useLocalStorage(LatencyIPUrlKey, LatencyIPUrlDefault);
    const [latencyStunUrl, setLatencyStunUrl] = useLocalStorage(LatencyStunUrlKey, LatencyStunUrlDefault);
    const [latencyStunTCPUrl, setLatencyStunTCPUrl] = useLocalStorage(LatencyStunTCPUrlKey, LatencyStunTCPUrlDefault);

    return <> <Card className="mb-3">
        <Card.Body>
            <SettingInputText
                label="API Host"
                value={url}
                onChange={(v: string) => setUrl(v)}
                placeholder="http://127.0.0.1:50051"
            />

            <hr />

            <Card.Title className='mb-2'>Latency</Card.Title>

            <SettingCheck
                label="IPv6"
                className="mb-1 ms-1"
                checked={latencyIPv6}
                onChange={() => { setLatencyIPv6(!latencyIPv6) }}
            />

            <SettingInputText
                label="HTTP(tcp)"
                placeholder="https://clients3.google.com/generate_204"
                value={latencyHTTP}
                className="mb-2"
                onChange={(v: string) => setLatencyHTTP(v)}
            />

            <SettingInputText
                label="DOQ(udp)"
                placeholder="dns.adguard.com:853"
                className="mb-2"
                value={latencyDNS}
                onChange={(v: string) => setLatencyDNS(v)}
            />

            <SettingInputText
                label="IP"
                placeholder="http://ip.sb"
                className="mb-2"
                value={latencyIPUrl}
                onChange={(v: string) => setLatencyIPUrl(v)}
            />

            <SettingInputText
                label="STUN"
                placeholder="stun.syncthing.net:3478"
                className="mb-2"
                value={latencyStunUrl}
                onChange={(v: string) => setLatencyStunUrl(v)}
            />

            <SettingInputText
                label="STUN TCP"
                placeholder="stun.syncthing.net:3478"
                value={latencyStunTCPUrl}
                onChange={(v: string) => setLatencyStunTCPUrl(v)}
            />
        </Card.Body>
    </Card>
    </>
}

export default Setting;