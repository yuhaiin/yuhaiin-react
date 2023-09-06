"use client"

import React, { useContext, useState } from "react";
import { Row, Col, ButtonGroup, Button, Dropdown, Card, ListGroup, Badge, Spinner } from "react-bootstrap";
import { APIUrl } from "../apiurl";
import NodeModal from "../modal/node";
import Loading from "../common/loading";
import { GlobalToastContext } from "../common/toast";
import useSWR from 'swr'
import { JsonFetcher } from '../common/proto';
import { produce } from 'immer';

type Latency = {
    tcp?: string,
    udp?: string,
    tcpOnLoading?: boolean
    udpOnLoading?: boolean
}

function Group() {
    const ctx = useContext(GlobalToastContext);
    const [selectNode, setSelectNode] = useState("");
    const [currentGroup, setCurrentGroup] = useState({ value: "" });
    const [modalHash, setModalHash] = useState({ hash: "" });
    const { data: groups, error, isLoading } = useSWR(APIUrl + "/grouplist", JsonFetcher<string[]>)
    const { data: nodes, mutate: mutateNodes } = useSWR(currentGroup.value !== "" ? `${APIUrl}/group?name=${currentGroup.value}` : null, JsonFetcher<{}>)
    const [latency, setLatency] = useState<{ [key: string]: Latency }>({})


    const NodeItem = React.memo((props: { hash: string, latency: Latency | undefined }) => {
        const getStr = (s: string | undefined) => s === undefined ? "N/A" : s

        const updateTestingStatus = (modify: (x: Latency) => void) => {
            setLatency((latency) => {
                let data = latency[props.hash]
                if (data === undefined || data === null) data = {
                    tcp: "N/A",
                    udp: "N/A",
                }
                modify(data)
                latency[props.hash] = data
                return { ...latency }
            })
        }

        const TestButton = () => {
            if (props.latency?.tcpOnLoading || props.latency?.udpOnLoading)
                return <Spinner animation="border" size="sm" />
            return <a href="#empty"
                onClick={async () => {
                    updateTestingStatus((v) => { v.tcpOnLoading = true; v.udpOnLoading = true })
                    fetch(`${APIUrl}/latency?hash=${props.hash}&type=tcp`).then(async (r) => {
                        let tcp = r.ok ? await r.text() : "timeout"
                        updateTestingStatus(async (v) => { v.tcpOnLoading = false; v.tcp = tcp })
                    })
                    fetch(`${APIUrl}/latency?hash=${props.hash}&type=udp`).then(async (r) => {
                        let udp = r.ok ? await r.text() : "timeout"
                        updateTestingStatus(async (v) => { v.udpOnLoading = false; v.udp = udp })
                    })
                }}>
                Test
            </a>
        }

        return <>
            <Badge className="rounded-pill bg-light text-dark ms-1 text-uppercase">
                tcp: {getStr(props.latency?.tcp)}
            </Badge>
            <Badge className="rounded-pill bg-light text-dark ms-1 me-1 text-uppercase">
                udp:{getStr(props.latency?.udp)}
            </Badge>
            <TestButton />
        </>
    })

    const Nodes = React.memo((props: { nodes: { [key: string]: string } }) => {
        let entries = Object.entries(props.nodes);

        if (entries.length === 0)
            return <Card.Body>
                <div className="text-center my-2" style={{ opacity: '0.4' }}>グールプはまだ指定されていません。</div>
            </Card.Body>



        return <ListGroup variant="flush">
            {
                entries.map(([k, v]) => {
                    return <ListGroup.Item
                        key={v}
                        as={"label"}
                        style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}
                    >
                        <input
                            className="form-check-input me-1"
                            type="radio"
                            name="select_node"
                            value={v}
                            onChange={
                                (e) => {
                                    console.log(e.target.value)
                                    setSelectNode(e.target.value)
                                }
                            }
                            checked={selectNode === v}
                        />
                        <a href="#empty"
                            onClick={(e) => {
                                e.preventDefault();
                                setModalHash({ hash: v });
                            }}
                        >
                            {k}
                        </a>
                        <NodeItem hash={v} latency={latency[v]} />
                    </ListGroup.Item>
                })
            }
        </ListGroup>
    })

    if (isLoading) return <Loading />
    if (error !== undefined) return <div>{error.info}</div>

    return (
        <>
            <NodeModal
                show={modalHash.hash !== ""}
                hash={modalHash.hash}
                editable
                onHide={() => setModalHash({ hash: "" })}
                onSave={() => mutateNodes()}
            />

            <div>
                <Row>
                    <Col className="mb-4 d-flex">
                        <Dropdown onSelect={(e) => {
                            setCurrentGroup({ value: e != null ? e : "" })
                            mutateNodes()
                        }
                        }>
                            <Dropdown.Toggle variant="light">GROUP</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item eventKey={""}>Select...</Dropdown.Item>

                                {
                                    groups?.map((k) => {
                                        return <Dropdown.Item eventKey={k} key={k}>{k}</Dropdown.Item>
                                    })
                                }
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                </Row>

                <Card className="mb-3">
                    <Nodes nodes={nodes !== undefined ? nodes : {}} />

                    <Card.Header>
                        <Dropdown
                            onSelect={
                                async (key) => {
                                    fetch(
                                        `${APIUrl}/node?hash=${selectNode}&&net=${key}`,
                                        {
                                            method: "PUT"
                                        }
                                    ).then(async (r) => {
                                        if (!r.ok) console.log(await r.text())
                                        else {
                                            let net = key === "tcp" ? "TCP" : "UDP";
                                            ctx.Info(`Change${net} Node To ${selectNode} Successful`)
                                            console.log("change node successfully")
                                        }
                                    })
                                }
                            }
                        >
                            <ButtonGroup>
                                <ButtonGroup>
                                    <Dropdown.Toggle variant="outline-primary">USE</Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item eventKey={"tcpudp"}>TCP&UDP</Dropdown.Item>
                                        <Dropdown.Item eventKey={"tcp"}>TCP</Dropdown.Item>
                                        <Dropdown.Item eventKey={"udp"}>UDP</Dropdown.Item>
                                    </Dropdown.Menu>
                                </ButtonGroup>
                                <Button
                                    variant="outline-danger"
                                    onClick={() => {
                                        fetch(
                                            `${APIUrl}/node?hash=${selectNode}`,
                                            {
                                                method: "DELETE"
                                            }
                                        ).then(async (r) => {
                                            if (!r.ok) {
                                                let error = await r.text();
                                                console.log(error)
                                                ctx.Error(`Delete Node ${selectNode} Failed. ${error}`)
                                            } else {
                                                console.log("delete successful")
                                                ctx.Info(`Delete Node ${selectNode} Successful.`)
                                                mutateNodes()
                                            }
                                        })
                                    }}
                                >
                                    DELETE
                                </Button>
                                {/* <Button variant="outline-primary" onClick={() => console.log("add new node")}>Add New Node</Button> */}
                            </ButtonGroup>
                        </Dropdown>
                    </Card.Header>
                </Card>
            </div >
        </>
    );
}

export default Group;