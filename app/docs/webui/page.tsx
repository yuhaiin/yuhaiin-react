"use client"

import React, { useState, useContext } from "react";
import { Button, Card, Row, Form, Col, Spinner } from "react-bootstrap";
import { APIUrl, LatencyDNSUrl, LatencyHTTPUrl, LatencyIPv6, RemoteBypass, SetLatencyDNSUrl, SetLatencyHTTPUrl, SetLatencyIPv6, SetRemoteBypass, SetUrl } from "../apiurl";
import { GlobalToastContext } from "../common/toast";
import { SettingCheck } from "../common/switch";
import { Fetch } from '../common/proto';
import { create, toBinary } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";

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
    const [remote, setRemote] = useState(RemoteBypass);
    const [remoteLoading, setRemoteLoading] = useState(false);
    const [latencyHTTP, setLatencyHTTP] = useState(LatencyHTTPUrl);
    const [latencyDNS, setLatencyDNS] = useState(LatencyDNSUrl);
    const [latencyIPv6, setLatencyIPv6] = useState(LatencyIPv6);


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

            <OnelineEdit
                title="Remote Rule"
                value={remote}
                onChange={setRemote}
                buttonText="Update"
                loading={remoteLoading}
                onClick={() => {
                    SetRemoteBypass(remote)
                    if (remote !== "") {
                        setRemoteLoading(true)
                        Fetch(`/bypass`,
                            { body: toBinary(StringValueSchema, create(StringValueSchema, { value: remote })), })
                            .then(async ({ error }) => {
                                if (error !== undefined) ctx.Error(`update remote rule ${remote} failed, ${error.code}| ${await error.msg}`)
                                else ctx.Info(`update remote rule ${remote} success`)
                                setRemoteLoading(false)
                            })
                    }
                }}
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

        </Card.Body>
    </Card>
    </>
}

export default Setting;