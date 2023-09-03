import React, { useContext, useEffect, useState } from "react";
import { Row, Col, ButtonGroup, Button, Dropdown, Card, ListGroup, Badge, Spinner } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import { APIUrl } from "./apiurl";
import NodeModal from "./node";
import Loading from "./loading";
import { GlobalToastContext } from "./toast";



function Group() {
    const [groups, setGroups] = useState<{ gs: string[] }>({ gs: [] });
    const [nodes, setNodes] = useState({ nodes: {} })
    const [selectNode, setSelectNode] = useState({ node: "" });
    const [currentGroup, setCurrentGroup] = useState({ value: "" });
    const [latency, setLatency] = useState<{ [key: string]: { tcp: string, udp: string, testing: boolean } }>({});
    const [loading, setLoading] = useState({ value: true })

    const ctx = useContext(GlobalToastContext);

    const refresh = async () => {
        try {
            const resp = await fetch(
                APIUrl + "/grouplist",
                {
                    method: "GET",
                },
            )
            if (!resp.ok) return

            setGroups({ gs: await resp.json() })
            setLoading({ value: false })
        } catch (e) {
            console.log(e)
        }
    }
    useEffect(() => {
        (async () => {
            await refresh();
        })()
    }, [])

    const handleChangeGroup = async (e: string | null) => {
        if (e === null || e?.length === 0) {
            setNodes({ nodes: new Map<string, string>() })
            return
        }

        try {
            const resp = await fetch(
                APIUrl + "/group?name=" + e,
                {
                    method: "GET",
                }
            )
            if (resp.ok) setNodes({ nodes: await resp.json() })
            else console.log(await resp.text())
        } catch (e) {
            console.log(e)
        }
    }


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);

        setSelectNode({ node: e.target.value });
    };


    const updateTestingStatus = (hash: string, modify: (x: { tcp: string, udp: string, testing: boolean }) => void) => {
        let data = latency[hash]
        if (data === undefined || data === null) data = { tcp: "N/A", udp: "N/A", testing: false }
        modify(data)
        latency[hash] = data
        setLatency({ ...latency })
    }

    const setLatencyResult = async (hash: string, result: Response, tcp = true) => {
        let str = "";
        if (result.status === 200) {
            str = await result.text();
        }
        str = str !== "" ? str : "timeout"

        if (tcp) updateTestingStatus(hash, (x) => x.tcp = str);
        else updateTestingStatus(hash, (x) => x.udp = str);
    }

    const handleLatency = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, hash: string) => {
        e.preventDefault();


        if (latency[hash] !== undefined && latency[hash] != null && latency[hash].testing === true) return

        updateTestingStatus(hash, (x) => x.testing = true)

        let tcp = false;
        let udp = false;

        fetch(
            APIUrl + "/latency?hash=" + hash + "&type=tcp",
            {
                method: "GET"
            }
        ).then(async (result) => {
            setLatencyResult(hash, result)
            tcp = true;

            if (udp) updateTestingStatus(hash, (x) => x.testing = false)

        })

        fetch(
            APIUrl + "/latency?hash=" + hash + "&type=udp",
            {
                method: "GET"
            }
        ).then(async (result) => {
            setLatencyResult(hash, result, false)

            udp = true;

            if (tcp) updateTestingStatus(hash, (x) => x.testing = false)

        })
    };

    const [modalHash, setModalHash] = useState({ hash: "" });

    function NodeItem({ name = "", hash = "" }) {
        return (<>
            <ListGroup.Item as={"label"} style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}>
                <input className="form-check-input me-1" type="radio" name="select_node" value={hash} onChange={handleChange} checked={selectNode.node === hash} />
                <a href="#empty" onClick={(e) => {
                    e.preventDefault();
                    setModalHash({ hash: hash });
                }}>{name}</a>
                <Badge className="rounded-pill bg-light text-dark ms-1 text-uppercase">tcp: {latency[hash] != null ? latency[hash].tcp : "N/A"}</Badge>
                <Badge className="rounded-pill bg-light text-dark ms-1 me-1 text-uppercase">udp:{latency[hash] != null ? latency[hash].udp : "N/A"}</Badge>
                {
                    (latency[hash] != null && latency[hash].testing) ?
                        <Spinner animation="border" size="sm" />
                        :
                        <a href="#empty" onClick={(e) => handleLatency(e, hash)}>Test</a>
                }
            </ListGroup.Item>
        </>)
    }

    const Nodes = React.memo((props: { nodes: {} }) => {
        let entries = Object.entries(props.nodes);

        if (entries.length === 0) {
            return (
                <Card.Body>
                    <div className="text-center my-2" style={{ opacity: '0.4' }}>グールプはまだ指定されていません。</div>
                </Card.Body>)
        }

        return (
            <ListGroup variant="flush">
                {
                    entries.map(([k, v]) => {
                        return <NodeItem name={k} hash={typeof v === 'string' ? v : undefined} key={k} />
                    })
                }
            </ListGroup>
        )
    })

    return (
        <>
            {modalHash.hash !== "" &&
                <NodeModal
                    hash={modalHash.hash}
                    editable
                    onHide={() => setModalHash({ hash: "" })}
                    onSave={() => handleChangeGroup(currentGroup.value)}
                />}

            {loading.value && <Loading />}
            {!loading.value &&
                <div>
                    <Row>
                        <Col className="mb-4 d-flex">
                            <Dropdown onSelect={(e) => {
                                setCurrentGroup({ value: e != null ? e : "" })
                                handleChangeGroup(e)
                            }
                            }>
                                <Dropdown.Toggle variant="light">GROUP</Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item eventKey={""}>Select...</Dropdown.Item>

                                    {
                                        groups.gs.map((k) => {
                                            return <Dropdown.Item eventKey={k} key={k}>{k}</Dropdown.Item>
                                        })
                                    }
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>

                    <Card className="mb-3">
                        <Nodes nodes={nodes.nodes} />

                        <Card.Header>
                            <Dropdown
                                onSelect={
                                    async (key) => {
                                        const resp = await fetch(
                                            `${APIUrl}/node?hash=${selectNode.node}&&net=${key}`,
                                            {
                                                method: "PUT"
                                            }
                                        )
                                        if (!resp.ok) console.log(await resp.text())
                                        else {
                                            let net = "";
                                            if (key === "tcp") net = " TCP";
                                            if (key === "udp") net = " UDP";

                                            ctx.Info(`Change${net} Node To ${selectNode.node} Successful`)
                                            console.log("change node successfully")

                                        }
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
                                        onClick={async () => {

                                            const resp = await fetch(
                                                `${APIUrl}/node?hash=${selectNode.node}`,
                                                {
                                                    method: "DELETE"
                                                }
                                            )
                                            if (!resp.ok) {
                                                let error = resp.text();
                                                console.log(error)
                                                ctx.Error(`Delete Node ${selectNode.node} Failed. ${error}`)
                                            } else {
                                                console.log("delete successful")
                                                ctx.Info(`Delete Node ${selectNode.node} Successful.`)
                                                await handleChangeGroup(currentGroup.value);
                                            }
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
            }
        </>
    );
}

export default Group;