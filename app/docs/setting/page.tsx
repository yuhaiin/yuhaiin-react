"use client"

import React, { useState, useContext } from "react";
import { Button, Card, Row, Form, Col } from "react-bootstrap";
import { APIUrl, RemoteBypass, SetRemoteBypass, SetUrl } from "../apiurl";
import { GlobalToastContext } from "../common/toast";
import { Fetch } from '../common/proto';
import { google } from "../pbts/proto";

function Setting() {
    const ctx = useContext(GlobalToastContext);
    const [url, setUrl] = useState(APIUrl);
    const [remote, setRemote] = useState(RemoteBypass);

    return <> <Card className="mb-3">
        <Card.Body>
            <Form.Group as={Row} className='mb-3'>
                <Row className="g-2">
                    <Form.Label column sm={1} class="nowrap">API url</Form.Label>
                    <Col sm={3}>
                        <Form.Control value={url} onChange={(v) => setUrl(v.target.value)} />
                    </Col>
                    <Col sm={2}>
                        <Button
                            onClick={() => {
                                SetUrl(url)
                                if (url !== "") ctx.Info(`Set API Url: ${url} success.`)
                                else ctx.Info(`Remove API Url success.`)
                            }}
                        >
                            Save
                        </Button>
                    </Col>
                </Row>
            </Form.Group>
        </Card.Body>
    </Card>

        <Card className="mb-3">
            <Card.Header>Update Remote Bypass Rule</Card.Header>
            <Card.Body>
                <Form.Group as={Row} className='mb-3'>
                    <Row className="g-2">
                        <Col sm={3}>
                            <Form.Control value={remote} onChange={(v) => setRemote(v.target.value)} />
                        </Col>
                        <Col sm={2}>
                            <Button
                                onClick={() => {
                                    SetRemoteBypass(remote)
                                    if (remote !== "") {
                                        Fetch(`/bypass`,
                                            { body: google.protobuf.StringValue.encode({ value: remote }).finish(), })
                                            .then(async ({ error }) => {
                                                if (error !== undefined) ctx.Error(`update remote rule ${remote} failed, ${error.code}| ${await error.msg}`)
                                                else ctx.Info(`update remote rule ${remote} success`)
                                            })
                                    }
                                }}
                            >
                                Update
                            </Button>
                        </Col>
                    </Row>
                </Form.Group>
            </Card.Body>
        </Card>
    </>
}

export default Setting;