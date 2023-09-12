"use client"

import { useState, useContext } from "react";
import { Badge, Button, Card, FloatingLabel, Form, InputGroup, ListGroup } from "react-bootstrap";
import Loading from "../common/loading";
import { save_tag_req as SaveTag } from "../protos/node/grpc/node";
import { tag_type as TagType, tags as Tag } from "../protos/node/tag/tag";
import { manager as Manager } from "../protos/node/node";
import useSWR from 'swr'
import { Fetch, ProtoFetcher } from '../common/proto';
import Error from 'next/error';
import NodeModal from "../modal/node";
import { GlobalToastContext } from "../common/toast";
import { StringValue } from "../protos/google/protobuf/wrappers";

function Tags() {
    const ctx = useContext(GlobalToastContext);
    const [currentGroup, setCurrentGroup] = useState("");
    const [saveTag, setSaveTag] = useState<SaveTag>({ tag: "", hash: "", type: TagType.node });
    const { data, error, isLoading, mutate } = useSWR("/nodes", ProtoFetcher(Manager))
    const [modalHash, setModalHash] = useState({ hash: "" });

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />

    if (isLoading || data == undefined) return <Loading />

    const TagItem = (k: string, v: Tag) => {
        return (
            <ListGroup.Item style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }} key={k}>
                <div className="d-flex flex-wrap">
                    <a className="text-decoration-none"
                        href="#empty"
                        onClick={(e) => {
                            e.preventDefault();
                            setSaveTag((x) => { return { ...x, tag: k } })
                        }}
                    >{k}</a>
                    <Badge className="rounded-pill bg-light text-dark text-truncate ms-1">
                        {v.hash.length === 0 || v.hash[0] === ""
                            ?
                            <>Fallback <i className="bi bi-heart-arrow"></i> Global</>
                            :
                            v.type === TagType.mirror
                                ?
                                <>Mirror <i className="bi bi-arrow-right"></i> {v.hash}</>
                                :
                                <>Target <i className="bi bi-arrow-right"></i>
                                    <a className="text-truncate" href="#" onClick={(e) => { e.preventDefault(); setModalHash({ hash: v.hash[0] }) }} >{v.hash}</a></>
                        }
                    </Badge>

                    <a
                        className="text-decoration-none ms-auto text-truncate"
                        href='#empty'
                        onClick={(e) => {
                            e.preventDefault();
                            Fetch("/tag", {
                                method: "DELETE",
                                body: StringValue.encode({ value: k }).finish()
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
                show={modalHash.hash !== ""}
                hash={modalHash.hash}
                onHide={() => setModalHash({ hash: "" })}
            />
            <Card className="mb-3">

                <ListGroup variant="flush">
                    {
                        Object
                            .entries(data.tags)
                            .sort((a, b) => { return a <= b ? -1 : 1 })
                            .map(([k, v]) => { return TagItem(k, v) })
                    }
                </ListGroup>
            </Card >

            < Card className="mb-3" >
                <Card.Body>
                    <InputGroup className="mb-3">
                        <Form.Check inline
                            type="radio"
                            onChange={() => { setSaveTag((x) => { return { ...x, type: TagType.node, hash: "" } }) }}
                            checked={saveTag.type === TagType.node}
                            label="Node"
                        />
                        <Form.Check inline
                            type="radio"
                            onChange={() => { setSaveTag((x) => { return { ...x, type: TagType.mirror, hash: "" } }) }}
                            checked={saveTag.type === TagType.mirror}
                            label="Mirror"
                        />
                    </InputGroup>

                    <FloatingLabel label="Tag" className="mb-2" >
                        <Form.Control placeholder="Tag" aria-label="Tag" aria-describedby="basic-addon1"
                            value={saveTag.tag}
                            onChange={(e) => { setSaveTag((x) => { return { ...x, tag: e.target.value } }) }}
                        ></Form.Control>
                    </FloatingLabel>

                    {saveTag.type === TagType.node ?
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
                                    onChange={(e) => { setSaveTag((x) => { return { ...x, hash: e.target.value } }) }}>
                                    <option value="">Choose...</option>
                                    {
                                        Object
                                            .entries(data.groupsV2[currentGroup] !== undefined ? data.groupsV2[currentGroup].nodesV2 : {})
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
                                onChange={(e) => { setSaveTag((x) => { return { ...x, hash: e.target.value } }) }}
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
                            Fetch("/tag", { body: SaveTag.encode(saveTag).finish() })
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