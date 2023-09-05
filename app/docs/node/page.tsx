"use client"

import { useContext, useState } from "react";
import { Button, Form, Card, ListGroup, InputGroup } from "react-bootstrap";
import { APIUrl } from "../apiurl";
import { GlobalToastContext } from "../common/toast";


export default function NewNode() {
    const [templateProtocols, setTemplateProtocols] = useState({ value: ["simple"] });
    const [currentProtocol, setCurrentProtocol] = useState({ value: "simple" });
    const [newNode, setNewNode] = useState({ value: "" });

    const ctx = useContext(GlobalToastContext);

    return (
        <>
            <Card className="mb-3">

                <ListGroup variant="flush">

                    <ListGroup.Item>
                        <InputGroup>
                            <Form.Select value={currentProtocol.value} onChange={(e) => setCurrentProtocol({ value: e.target.value })}>
                                <option value="simple">simple</option>
                                <option value="direct">direct</option>
                                <option value="none">none</option>
                                <option value="websocket">websocket</option>
                                <option value="quic">quic</option>
                                <option value="shadowsocks">shadowsocks</option>
                                <option value="obfshttp">obfshttp</option>
                                <option value="shadowsocksr">shadowsocksr</option>
                                <option value="vmess">vmess</option>
                                <option value="trojan">trojan</option>
                                <option value="socks5">socks5</option>
                                <option value="http">http</option>
                            </Form.Select>
                            <Button
                                variant="outline-secondary"
                                onClick={() => {
                                    let v = templateProtocols.value;
                                    v.push(currentProtocol.value);
                                    setTemplateProtocols({ value: v });
                                }}
                            >
                                Add
                            </Button>
                            <Button
                                variant="outline-secondary"
                                onClick={async () => {
                                    const resp = await fetch(
                                        `${APIUrl}/node?page=generate_template&protocols=${encodeURIComponent(JSON.stringify(templateProtocols.value))}`,
                                        {
                                            method: "GET"
                                        }
                                    )
                                    if (!resp.ok) {
                                        let err = await resp.text();
                                        ctx.Error(`Generate template failed. ${err}`)
                                        console.log(err)
                                    } else {
                                        console.log("get successful");
                                        setNewNode({ value: await resp.text() })
                                    }
                                }}
                            >
                                Generate
                            </Button>
                        </InputGroup>
                    </ListGroup.Item>

                    {
                        templateProtocols.value.map((v, index) =>
                            <ListGroup.Item key={index}>
                                <div className="d-sm-flex">

                                    <div className="endpoint-name flex-grow-1 notranslate">{v}</div>
                                    <Button
                                        variant="outline-danger"
                                        className="notranslate"
                                        onClick={() => {
                                            let v = templateProtocols.value;
                                            v.splice(index, 1)
                                            setTemplateProtocols({ value: v });
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </div>

                            </ListGroup.Item>
                        )
                    }

                </ListGroup>
            </Card>


            <Card className="mb-3">
                <Card.Body>
                    <Form.Control
                        as={"textarea"}
                        style={{ height: "500px", fontFamily: "monospace" }}
                        className="mb-3"
                        value={newNode.value}
                        onChange={(e) => setNewNode({ value: e.target.value })}
                    />

                    <Button
                        className="outline-primary me-2"
                        onClick={async () => {
                            const resp = await fetch(
                                APIUrl + "/node",
                                {
                                    method: "POST",
                                    body: newNode.value,
                                }
                            )
                            if (!resp.ok) {
                                let err = await resp.text();
                                ctx.Error(`Add New Node Failed. ${err}`)
                                console.log(err)
                            } else {
                                ctx.Info(`Add New Node Successful`)
                                console.log("add successful");
                            }
                        }}
                    >
                        Save
                    </Button>
                    {/* <Button className="outline-primary">Protocols Template</Button> */}
                </Card.Body>
            </Card>
        </>
    )
}
