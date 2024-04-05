"use client"

import { useState, useContext } from "react";
import { Badge, Button, ButtonGroup, Card, FloatingLabel, Form, ListGroup, Modal, ToggleButton } from "react-bootstrap";
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
    const { data, error, isLoading, mutate } = useSWR("/nodes", ProtoESFetcher<manager>(new manager()))
    const [modalHash, setModalHash] = useState({ hash: "", show: false });
    const [tagModalData, setTagModalData] = useState({ show: false, tag: new save_tag_req({ tag: "", hash: "", type: tag_type.node }), new: true });

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />

    if (isLoading || data == undefined) return <Loading />

    const TagItem = (k: string, v: tags) => {
        return (
            <ListGroup.Item
                className="align-items-center d-flex justify-content-between"
                style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}
                key={k}
                action
                onClick={(e) => {
                    setTagModalData({ show: true, tag: new save_tag_req({ tag: k, hash: v.hash[0], type: v.type }), new: false })
                }}
            >
                <div>
                    {k}
                    <Badge className="rounded-pill bg-light text-dark ms-1">
                        {v.hash.length === 0 || v.hash[0] === ""
                            ?
                            <>Fallback <i className="bi bi-heart-arrow"></i> Global</>
                            :
                            v.type === tag_type.mirror
                                ?
                                <>Mirror <i className="bi bi-arrow-right"></i> {v.hash}</>
                                :
                                <>Target <i className="bi bi-arrow-right"></i>
                                    <a
                                        className="text-truncate"
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setModalHash({ hash: v.hash[0], show: true })
                                        }} >
                                        {v.hash}
                                    </a>
                                </>
                        }
                    </Badge>
                </div>

                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();

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
                    <i className="bi-trash"></i></Button>
            </ListGroup.Item>
        )
    }


    return (
        <>
            <NodeModal
                show={modalHash.show}
                hash={modalHash.hash}
                onHide={() => setModalHash({ ...modalHash, hash: "", show: false })}
            />

            <TagModal
                show={tagModalData.show}
                data={data}
                tag={tagModalData.tag}
                onChangeTag={(x) => setTagModalData({ ...tagModalData, tag: x })}
                new={tagModalData.new}
                onHide={() => setTagModalData({ ...tagModalData, show: false })}
                onSave={() => {
                    if (tagModalData.tag.tag === "" || tagModalData.tag.hash === "") return
                    Fetch("/tag", { body: tagModalData.tag.toBinary() })
                        .then(async ({ error }) => {
                            if (error !== undefined) ctx.Error(`save tag ${tagModalData.tag.tag} failed, ${error.code}| ${await error.msg}`)
                            else {
                                ctx.Info(`Set tag ${tagModalData.tag.tag} to ${tagModalData.tag.hash} successful`);
                                await mutate();
                            }
                            setTagModalData({ ...tagModalData, show: false })
                        })
                }}
            />

            <Card className="mb-3">

                <ListGroup variant="flush">
                    {
                        Object
                            .entries(data.tags)
                            .sort((a, b) => { return a <= b ? -1 : 1 })
                            .map(([k, v]) => { return TagItem(k, new tags(v)) })
                    }

                    <ListGroup.Item className="d-sm-flex">
                        <Button
                            variant="outline-success"
                            className="flex-grow-1"
                            onClick={() => setTagModalData({
                                show: true,
                                tag: new save_tag_req({ tag: "new tag", hash: "", type: tag_type.node }), new: true
                            })}
                        >
                            <i className="bi bi-plus-lg" />New
                        </Button>
                    </ListGroup.Item>

                </ListGroup>
            </Card >

        </>
    )
}


const TagModal = (props: {
    show: boolean,
    data: manager,
    tag: save_tag_req,
    new?: boolean,
    onHide: () => void,
    onSave: () => void,
    onChangeTag: (x: save_tag_req) => void
}) => {
    return <>
        <Modal show={props.show} onHide={() => { props.onHide() }}>
            <Modal.Header closeButton>{props.tag.tag}</Modal.Header>
            <Modal.Body>
                <ButtonGroup className="mb-3 d-flex">
                    <ToggleButton
                        id="toggle-node"
                        type="radio"
                        variant="outline-primary"
                        value={tag_type.node}
                        onChange={() => { props.tag.type = tag_type.node; props.onChangeTag(props.tag) }}
                        checked={props.tag.type === tag_type.node}
                    >
                        Node
                    </ToggleButton>
                    <ToggleButton
                        id="toggle-mirror"
                        type="radio"
                        variant="outline-primary"
                        value={tag_type.mirror}
                        onChange={() => { props.tag.type = tag_type.mirror; props.onChangeTag(props.tag) }}
                        checked={props.tag.type === tag_type.mirror}
                    >
                        Mirror
                    </ToggleButton>
                </ButtonGroup>

                {props.new &&
                    <FloatingLabel label="Tag" className="mb-2" >
                        <Form.Control placeholder="Tag" aria-label="Tag" aria-describedby="basic-addon1"
                            value={props.tag.tag}
                            onChange={(e) => { props.tag.tag = e.target.value; props.onChangeTag(props.tag) }}
                        ></Form.Control>
                    </FloatingLabel>
                }
                {
                    props.tag.type == tag_type.mirror ?
                        <>
                            <Mirror data={props.data} value={props.tag.hash} onChangeMirror={(x) => { props.tag.hash = x; props.onChangeTag(props.tag) }} />
                        </> :
                        <>
                            <Node data={props.data}
                                hash={props.tag.hash}
                                onChangeNode={(x) => { props.tag.hash = x; props.onChangeTag(props.tag) }}
                            />
                        </>
                }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => { props.onHide() }}>Close</Button>
                <Button
                    variant="outline-primary"
                    onClick={() => { props.onSave() }}
                >
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    </>
}

const Node = (props: {
    hash: string,
    data: manager,
    onChangeNode: (x: string) => void
}) => {
    const [group, setGroup] = useState({ data: props.data.nodes[props.hash]?.group ?? "" })

    return <>
        <FloatingLabel label="Group" className="mb-2" >
            <Form.Select defaultValue={group.data}
                onChange={(e) => setGroup({ data: e.target.value })}>
                <option>Choose...</option>
                {
                    Object
                        .keys(props.data.groupsV2)
                        .sort((a, b) => { return a <= b ? -1 : 1 })
                        .map((k) => {
                            return (<option value={k} key={k}>{k}</option>)
                        })
                }
            </Form.Select>
        </FloatingLabel>

        <FloatingLabel label="Node" className="mb-2" >
            <Form.Select defaultValue={props.hash}
                onChange={(e) => { props.onChangeNode(e.target.value) }}>
                <option value="">Choose...</option>
                {
                    Object
                        .entries(NewObject(props.data.groupsV2[group.data]?.nodesV2))
                        .sort((a, b) => { return a <= b ? -1 : 1 })
                        .map(([k, v]) => {
                            return (<option value={v} key={k}>{k}</option>)
                        })
                }
            </Form.Select>
        </FloatingLabel>
    </>
}

const Mirror = (props: {
    value: string,
    data: manager,
    onChangeMirror: (x: string) => void
}) => {
    return <FloatingLabel label="Mirror" className="mb-2" >
        <Form.Select defaultValue={props.value}
            onChange={(e) => { props.onChangeMirror(e.target.value) }}
        >
            <option value="">Choose...</option>
            {
                Object
                    .keys(props.data.tags)
                    .sort((a, b) => { return a <= b ? -1 : 1 })
                    .map((k) => {
                        return (<option value={k} key={k}>{k}</option>)
                    })
            }
        </Form.Select>
    </FloatingLabel>
}

export default Tags;