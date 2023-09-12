"use client"

import React, { useState, useContext } from "react";
import { Button, Card, Row, Form, Col } from "react-bootstrap";
import { APIUrl, SetUrl } from "../apiurl";
import { SettingInputText } from "../config/components";
import { GlobalToastContext } from "../common/toast";

function Setting() {
    const ctx = useContext(GlobalToastContext);
    const [url, setUrl] = useState(APIUrl);

    return <Card className="mb-3">
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
}

export default Setting;