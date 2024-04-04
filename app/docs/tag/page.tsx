"use client"

import { useState, useContext } from "react";
import { Badge, Button, Card, FloatingLabel, Form, InputGroup, ListGroup } from "react-bootstrap";
import Loading from "../common/loading";
import useSWR from 'swr'
import { Fetch, NewObject, ProtoESFetcher } from '../common/proto';
import Error from 'next/error';
import NodeModal from "../modal/node";
import { GlobalToastContext } from "../common/toast";
import { save_tag_req } from "../pbes/node/grpc/node_pb";
import { tag_type, tags } from "../pbes/node/tag/tag_pb";
import { manager } from "../pbes/node/node_pb";
import { StringValue } from "@bufbuild/protobuf";

function Tags() {
    const ctx = useContext(GlobalToastContext);
    const [currentGroup, setCurrentGroup] = useState("");
    const [saveTag, setSaveTag] = useState<save_tag_req>(new save_tag_req({ tag: "", hash: "", type: tag_type.node }));
    const { data, error, isLoading, mutate } = useSWR("/nodes", ProtoESFetcher<manager>(new manager()))
    const [modalHash, setModalHash] = useState({ hash: "", show: false });

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />

    if (isLoading || data == undefined) return <Loading />

    const TagItem = (k: string, v: tags) => {
        return (
            <ListGroup.Item style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }} key={k}>
                <div className="d-flex flex-wrap">
                    <a className="text-decoration-none"
                        href="#empty"
                        onClick={(e) => {
                            e.preventDefault();
                            setSaveTag((x) => { return new save_tag_req({ ...x, tag: k }) })
                        }}
                    >{k}</a>
                    <Badge className="rounded-pill bg-light text-dark text-truncate ms-1">
                        {v.hash.length === 0 || v.hash[0] === ""
                            ?
                            <>Fallback <i className="bi bi-heart-arrow"></i> Global</>
                            :
                            v.type === tag_type.mirror
                                ?
                                <>Mirror <i className="bi bi-arrow-right"></i> {v.hash}</>
                                :
                                <>Target <i className="bi bi-arrow-right"></i>
                                    <a className="text-truncate" href="#" onClick={(e) => { e.preventDefault(); setModalHash({ hash: v.hash[0], show: true }) }} >{v.hash}</a></>
                        }
                    </Badge>

                    <a
                        className="text-decoration-none ms-auto text-truncate"
                        href='#empty'
                        onClick={(e) => {
                            e.preventDefault();
                            Fetch("/tag", {
                                method: "DELETE",
                                body: new StringValue({ value: k }).toBinary()
                            })
                                .then(async ({ error }) => {
                                    if (error !== undefined) ctx.Error(`delete tag ${k} failed, ${error.code}| ${await error.msg}`)
                                    else {
                                        ctx.Info(`delete tag ${k} success`);
                                        await mutate();
                                    }
                                })
                        }}
                    >
                        <i className="bi-trash"></i>DELETE
                    </a>
                </div>
            </ListGroup.Item>
        )
    }


    return (
        <>
            <NodeModal
                show={modalHash.show}
                hash={modalHash.hash}
                onHide={() => setModalHash({ ...modalHash, show: false })}
            />
            <Card className="mb-3">

                <ListGroup variant="flush">
                    {
                        Object
                            .entries(data.tags)
                            .sort((a, b) => { return a <= b ? -1 : 1 })
                            .map(([k, v]) => { return TagItem(k, new tags(v)) })
                    }
                </ListGroup>
            </Card >

            < Card className="mb-3" >
                <Card.Body>
                    <InputGroup className="mb-3">
                        <Form.Check inline
                            type="radio"
                            onChange={() => { setSaveTag((x) => { return new save_tag_req({ ...x, type: tag_type.node, hash: "" }) }) }}
                            checked={saveTag.type === tag_type.node}
                            label="Node"
                        />
                        <Form.Check inline
                            type="radio"
                            onChange={() => { setSaveTag((x) => { return new save_tag_req({ ...x, type: tag_type.mirror, hash: "" }) }) }}
                            checked={saveTag.type === tag_type.mirror}
                            label="Mirror"
                        />
                    </InputGroup>

                    <FloatingLabel label="Tag" className="mb-2" >
                        <Form.Control placeholder="Tag" aria-label="Tag" aria-describedby="basic-addon1"
                            value={saveTag.tag}
                            onChange={(e) => { setSaveTag((x) => { return new save_tag_req({ ...x, tag: e.target.value }) }) }}
                        ></Form.Control>
                    </FloatingLabel>

                    {saveTag.type === tag_type.node ?
                        <>
                            <FloatingLabel label="Group" className="mb-2" >
                                <Form.Select defaultValue={""}
                                    onChange={(e) => setCurrentGroup(e.target.value)}>
                                    <option>Choose...</option>
                                    {
                                        Object
                                            .keys(data.groupsV2)
                                            .sort((a, b) => { return a <= b ? -1 : 1 })
                                            .map((k) => {
                                                return (<option value={k} key={k}>{k}</option>)
                                            })
                                    }
                                </Form.Select>
                            </FloatingLabel>

                            <FloatingLabel label="Node" className="mb-2" >
                                <Form.Select defaultValue={""}
                                    onChange={(e) => { setSaveTag((x) => { return new save_tag_req({ ...x, hash: e.target.value }) }) }}>
                                    <option value="">Choose...</option>
                                    {
                                        Object
                                            .entries(NewObject(data.groupsV2[currentGroup]?.nodesV2))
                                            .sort((a, b) => { return a <= b ? -1 : 1 })
                                            .map(([k, v]) => {
                                                return (<option value={v} key={k}>{k}</option>)
                                            })
                                    }
                                </Form.Select>
                            </FloatingLabel>
                        </>
                        :
                        <FloatingLabel label="Mirror" className="mb-2" >
                            <Form.Select defaultValue={""}
                                onChange={(e) => { setSaveTag((x) => { return new save_tag_req({ ...x, hash: e.target.value }) }) }}
                            >
                                <option value="">Choose...</option>
                                {
                                    Object
                                        .keys(data.tags)
                                        .sort((a, b) => { return a <= b ? -1 : 1 })
                                        .map((k) => {
                                            return (<option value={k} key={k}>{k}</option>)
                                        })
                                }
                            </Form.Select>
                        </FloatingLabel>
                    }
                    <Button
                        variant="outline-primary"
                        onClick={() => {
                            if (saveTag.tag === "" || saveTag.hash === "") return
                            Fetch("/tag", { body: saveTag.toBinary() })
                                .then(async ({ error }) => {
                                    if (error !== undefined) ctx.Error(`save tag ${saveTag.tag} failed, ${error.code}| ${await error.msg}`)
                                    else {
                                        ctx.Info(`Set tag ${saveTag.tag} to ${saveTag.hash} successful`);
                                        await mutate();
                                    }
                                })

                        }}
                    >
                        Save
                    </Button>

                </Card.Body>
            </Card >
        </>
    )
}

export default Tags;