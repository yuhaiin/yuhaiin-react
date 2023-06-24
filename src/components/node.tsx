import { useContext, useEffect, useState } from "react";
import { Button, Modal, Form, Card, ListGroup, InputGroup } from "react-bootstrap";
import { APIUrl } from "./apiurl";
import { GlobalToastContext } from "./toast";


function NodeModal(props: { hash: string, editable: boolean, onHide: () => void, onSave?: () => void }) {
    const [node, setNode] = useState({ value: "" });
    const [show, setShow] = useState({ value: true });


    const ctx = useContext(GlobalToastContext);

    useEffect(() => {
        (async () => {
            try {
                await fetch(
                    APIUrl + "/node?hash=" + props.hash,
                    {
                        method: "GET",
                    },
                ).then(async (resp) => {
                    setNode({ value: JSON.stringify(await resp.json(), null, "  ") })
                })

            } catch (e) {
                ctx.Error(`Get Node ${props.hash} Failed. ${e}`)
                console.log(e)
            }
        })()
    }, [])

    return (
        <>
            <Modal
                show={show.value}
                aria-labelledby="contained-modal-title-vcenter"
                size='xl'
                onHide={() => { props.onHide() }}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {props.hash}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        as="textarea"
                        value={node.value}
                        style={{ height: "65vh", fontFamily: "monospace" }}
                        readOnly={!props.editable}
                        onChange={(e) => setNode({ value: e.target.value })}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShow({ value: false }); props.onHide() }}>Close</Button>
                    {props.editable &&
                        <Button variant="primary"
                            onClick={async () => {
                                const resp = await fetch(APIUrl + "/node", {
                                    method: "POST",
                                    headers: {
                                        'content-type': 'application/json;charset=UTF-8',
                                    },
                                    body: node.value,
                                })
                                if (!resp.ok) console.log(await resp.text())
                                else {
                                    console.log("save successful")

                                    if (props.onSave != undefined) props.onSave();

                                    setShow({ value: false });
                                    props.onHide();
                                }
                            }
                            }
                        >
                            Save
                        </Button>
                    }
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default NodeModal;

export function NewNode() {

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
