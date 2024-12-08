"use client"

import { useContext, useState } from "react";
import { Button, Card, Form, Row, Col, FloatingLabel, DropdownButton, Dropdown, Spinner, ButtonGroup } from "react-bootstrap";
import Loading from "../common/loading";
import { GlobalToastContext } from "../common/toast";
import useSWR from 'swr'
import { FetchProtobuf, ProtoESFetcher, } from '../common/proto';
import Error from 'next/error';
import { link, linkSchema, type } from "../pbes/node/subscribe/subscribe_pb";
import { link_reqSchema, save_link_reqSchema, subscribe } from "../pbes/node/grpc/node_pb";
import { create } from "@bufbuild/protobuf";

function Subscribe() {
    const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});
    const [addItem, setAddItem] = useState<link>(create(linkSchema, { name: "", url: "", type: type.reserve }));
    const { data: links, error, isLoading, mutate } = useSWR("/sublist", ProtoESFetcher(subscribe.method.get))
    const ctx = useContext(GlobalToastContext);

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || links === undefined) return <Loading />

    const Update = (name: string) => {
        setUpdating({ ...updating, [name]: true });
        FetchProtobuf(subscribe.method.update, `/sub`, "PATCH", create(link_reqSchema, { names: [name] }))
            .then(async ({ error }) => {
                if (error !== undefined) ctx.Error(`Update failed ${error.code}| ${error.msg}`)
                else ctx.Info(`Update successfully`);
                setUpdating({ ...updating, [name]: false });
            })
    }
    const Delete = (name: string) => {
        FetchProtobuf(subscribe.method.remove, `/sub`, "DELETE", create(link_reqSchema, { names: [name] }))
            .then(async ({ error }) => {
                if (error !== undefined) ctx.Error(`delete ${name} failed, ${error.code}| ${error.msg}`)
                else mutate()
            })
    }
    return (
        <>

            <Row className="row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4">
                {
                    links.links && Object.entries(links.links)
                        .sort((a, b) => { return a <= b ? -1 : 1 })
                        .map(([k, vv]) => {
                            return <Col className="mb-3" key={k}>
                                <Card className="h-100">
                                    <Card.Header>{vv.name}</Card.Header>
                                    <Card.Body>
                                        {vv.url}
                                    </Card.Body>
                                    <ButtonGroup as={Card.Footer} className="d-flex">
                                        <Button variant="outline-primary"
                                            onClick={() => Update(vv.name)}
                                            disabled={updating[vv.name]}
                                            className="w-100"
                                        >
                                            {updating[vv.name] &&
                                                <Spinner size="sm" animation="border" variant="primary" />}
                                            Update
                                        </Button>
                                        <DropdownButton
                                            onSelect={(event) => { if (event === "ok") Delete(vv.name) }}
                                            as={ButtonGroup}
                                            variant="outline-danger"
                                            title="Remove"
                                            className="w-100"
                                        >
                                            <Dropdown.Item eventKey={"ok"}>OK</Dropdown.Item>
                                            <Dropdown.Item eventKey={"cancel"}>Cancel</Dropdown.Item>
                                        </DropdownButton>
                                    </ButtonGroup>
                                </Card>
                            </Col>
                        })
                }
                <Col className="mb-3">
                    <Card className="h-100">
                        <Card.Header>Add</Card.Header>
                        <Card.Body>


                            <FloatingLabel label="Name" className="mb-3">
                                <Form.Control
                                    placeholder="group1"
                                    value={addItem.name}
                                    onChange={(e) => setAddItem(create(linkSchema, { ...addItem, name: e.target.value }))}
                                />
                            </FloatingLabel>

                            <FloatingLabel label="Link" className="mb-3">
                                <Form.Control
                                    placeholder="https://www.example.com"
                                    value={addItem.url}
                                    onChange={(e) => setAddItem(create(linkSchema, { ...addItem, url: e.target.value }))}
                                />
                            </FloatingLabel>

                        </Card.Body>
                        <ButtonGroup as={Card.Footer}>
                            <Button
                                variant="outline-primary"
                                onClick={async () => {
                                    if (addItem.name === "" || addItem.url === "") return
                                    FetchProtobuf(
                                        subscribe.method.save,
                                        `/sub`,
                                        "POST",
                                        create(save_link_reqSchema, { links: [addItem] }))
                                        .then(async ({ error }) => {
                                            if (error !== undefined) ctx.Error(`save link ${addItem.url} failed, ${error.code}| ${error.msg}`)
                                            else mutate()
                                        })

                                }}
                            >
                                ADD
                            </Button>
                        </ButtonGroup>
                    </Card>
                </Col>
            </Row>

        </>
    )
}


export default Subscribe;