"use client"

import { useContext, useState } from "react";
import { Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import { APIUrl, LatencyDNSUrl, LatencyHTTPUrl, LatencyIPUrl, LatencyIPv6, LatencyStunTCPUrl, LatencyStunUrl, SetLatencyDNSUrl, SetLatencyHTTPUrl, SetLatencyIPUrl, SetLatencyIPv6, SetLatencyStunTCPUrl, SetLatencyStunUrl, SetUrl } from "../common/apiurl";
import { SettingCheck } from "../common/switch";
import { GlobalToastContext } from "../common/toast";

const OnelineEdit = (props: {
    title: string,
    value: string,
    onChange: (v: string) => void,
    onClick: () => void,
    buttonText?: string,
    placeholder?: string,
    loading?: boolean
}) => {
    return <>
        <Form.Group as={Row} className='mb-1 ms-1'>
            <Row className="g-2">
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
    const ctx = useContext(GlobalToastContext);
    const [url, setUrl] = useState(APIUrl);
    const [latencyHTTP, setLatencyHTTP] = useState(LatencyHTTPUrl);
    const [latencyDNS, setLatencyDNS] = useState(LatencyDNSUrl);
    const [latencyIPv6, setLatencyIPv6] = useState(LatencyIPv6);
    const [latencyIPUrl, setLatencyIPUrl] = useState(LatencyIPUrl);
    const [latencyStunUrl, setLatencyStunUrl] = useState(LatencyStunUrl);
    const [latencyStunTCPUrl, setLatencyStunTCPUrl] = useState(LatencyStunTCPUrl);

    return <> <Card className="mb-3">
        <Card.Body>
            <OnelineEdit
                title="API Host"
                value={url}
                onChange={setUrl}
                placeholder="http://127.0.0.1:50051"
                onClick={() => {
                    SetUrl(url)
                    if (url !== "") ctx.Info(`Set API Url: ${url} success.`)
                    else ctx.Info(`Remove API Url success.`)
                    console.log(url)
                }} buttonText="Save"
            />

            <hr />

            <Card.Title className='mb-2'>Latency</Card.Title>

            <SettingCheck
                label="IPv6"
                checked={latencyIPv6}
                onChange={() => {
                    setLatencyIPv6(!latencyIPv6)
                    SetLatencyIPv6(!latencyIPv6)
                }}
            />

            <OnelineEdit
                title="HTTP(tcp)"
                placeholder="https://clients3.google.com/generate_204"
                value={latencyHTTP}
                onChange={setLatencyHTTP}
                onClick={() => {
                    SetLatencyHTTPUrl(latencyHTTP)
                    if (latencyHTTP !== "") ctx.Info(`Set Latency HTTP Url: ${latencyHTTP} success.`)
                    else ctx.Info(`Remove Latency HTTP Url success.`)
                }}
            />

            <OnelineEdit
                title="DOQ(udp)"
                placeholder="dns.adguard.com:853"
                value={latencyDNS}
                onChange={setLatencyDNS}
                onClick={() => {
                    SetLatencyDNSUrl(latencyDNS)
                    if (latencyDNS !== "") ctx.Info(`Set Latency DNS: ${latencyDNS} success.`)
                    else ctx.Info(`Remove Latency DNS success.`)
                }}
            />

            <OnelineEdit
                title="IP"
                placeholder="http://ip.sb"
                value={latencyIPUrl}
                onChange={setLatencyIPUrl}
                onClick={() => {
                    SetLatencyIPUrl(latencyIPUrl)
                    if (latencyIPUrl !== "") ctx.Info(`Set Latency IP Url: ${latencyIPUrl} success.`)
                    else ctx.Info(`Remove Latency IP Url success.`)
                }}
            />

            <OnelineEdit
                title="STUN"
                placeholder="stun.syncthing.net:3478"
                value={latencyStunUrl}
                onChange={setLatencyStunUrl}
                onClick={() => {
                    SetLatencyStunUrl(latencyStunUrl)
                    if (latencyStunUrl !== "") ctx.Info(`Set Latency STUN Url: ${latencyStunUrl} success.`)
                    else ctx.Info(`Remove Latency STUN Url success.`)
                }}
            />

            <OnelineEdit
                title="STUN TCP"
                placeholder="stun.syncthing.net:3478"
                value={latencyStunTCPUrl}
                onChange={setLatencyStunTCPUrl}
                onClick={() => {
                    SetLatencyStunTCPUrl(latencyStunTCPUrl)
                    if (latencyStunTCPUrl !== "") ctx.Info(`Set Latency STUN TCP Url: ${latencyStunTCPUrl} success.`)
                    else ctx.Info(`Remove Latency STUN TCP Url success.`)
                }}
            />
        </Card.Body>
    </Card>
    </>
}

export default Setting;