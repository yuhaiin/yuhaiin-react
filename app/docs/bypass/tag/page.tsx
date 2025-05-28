"use client"

import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import Error from 'next/error';
import { FC, useContext, useEffect, useState } from "react";
import { Badge, Button, ButtonGroup, Card, FloatingLabel, Form, ListGroup, Modal, ToggleButton } from "react-bootstrap";
import { ConfirmModal } from "../../common/confirm";
import Loading from "../../common/loading";
import { FetchProtobuf, useProtoSWR } from '../../common/proto';
import { FormSelect } from "../../common/switch";
import { GlobalToastContext } from "../../common/toast";
import { NodeModal } from "../../node/modal";
import { node, nodes_response, save_tag_req, save_tag_reqSchema, tag, tags_response } from "../../pbes/node/grpc/node_pb";
import { tag_type, tags, tagsSchema } from "../../pbes/node/tag/tag_pb";

function Tags() {
    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useProtoSWR(tag.method.list)
    const { data: nodes } = useProtoSWR(node.method.list)
    const [modalHash, setModalHash] = useState({ hash: "", show: false });
    const [tagModalData, setTagModalData] = useState({ show: false, tag: create(save_tag_reqSchema, { tag: "", hash: "", type: tag_type.node }), new: true });
    const [confirmData, setConfirmData] = useState({ show: false, name: "" });

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />

    if (isLoading || data == undefined) return <Loading />

    const TagItem: FC<{ k: string, v: tags }> = ({ k, v }) => {
        return (
            <ListGroup.Item
                className="align-items-center d-flex justify-content-between"
                style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}
                key={k}
                action
                onClick={() => {
                    setTagModalData({
                        show: true,
                        tag: create(save_tag_reqSchema, { tag: k, hash: v.hash[0], type: v.type }),
                        new: false
                    })
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
                    as="span"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setConfirmData({ show: true, name: k }) }}
                >
                    <i className="bi-trash"></i></Button>
            </ListGroup.Item>
        )
    }


    return (
        <>
            <ConfirmModal
                show={confirmData.show}
                content={<p>Delete tag {confirmData.name}?</p>}
                onHide={() => setConfirmData({ ...confirmData, show: false })}
                onOk={() => {
                    FetchProtobuf(tag.method.remove, create(StringValueSchema, { value: confirmData.name }))
                        .then(async ({ error }) => {
                            if (error !== undefined) ctx.Error(`delete tag ${confirmData.name} failed, ${error.code}| ${error.msg}`)
                            else {
                                ctx.Info(`delete tag ${confirmData.name} success`);
                                await mutate();
                            }
                            setConfirmData({ ...confirmData, show: false })
                        })
                }}
            />

            <NodeModal
                show={modalHash.show}
                hash={modalHash.hash}
                onHide={() => setModalHash({ ...modalHash, show: false })}
            />

            <TagModal
                show={tagModalData.show}
                nodes={nodes}
                data={data}
                tag={tagModalData.tag}
                onChangeTag={(x) => setTagModalData({ ...tagModalData, tag: x })}
                new={tagModalData.new}
                onHide={() => setTagModalData({ ...tagModalData, show: false })}
                onSave={() => {
                    if (tagModalData.tag.tag === "" || tagModalData.tag.hash === "") return
                    FetchProtobuf(tag.method.save, tagModalData.tag)
                        .then(async ({ error }) => {
                            if (error !== undefined) ctx.Error(`save tag ${tagModalData.tag.tag} failed, ${error.code}| ${error.msg}`)
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
                            .map(([k, v]) => { return <TagItem key={k} k={k} v={create(tagsSchema, v)} /> })
                    }

                    <ListGroup.Item className="d-sm-flex">
                        <Button
                            variant="outline-success"
                            className="flex-grow-1"
                            onClick={() => setTagModalData({
                                show: true,
                                tag: create(save_tag_reqSchema, { tag: "new tag", hash: "", type: tag_type.node }), new: true
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
    nodes?: nodes_response,
    data: tags_response,
    tag: save_tag_req,
    new?: boolean,
    onHide: () => void,
    onSave: () => void,
    onChangeTag: (x: save_tag_req) => void
}) => {
    return <>
        <Modal show={props.show} onHide={() => { props.onHide() }} centered>
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
                            <Node
                                data={props.nodes}
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

const getGroup = (hash: string, data?: nodes_response) => {
    if (data === undefined || hash === "") return ""
    for (const group in data.groups) {
        for (const node in data.groups[group].nodesV2) {
            if (data.groups[group].nodesV2[node] === hash) return group
        }
    }

    return ""
}

const Node = (props: {
    hash: string,
    data?: nodes_response,
    onChangeNode: (x: string) => void
}) => {
    const [group, setGroup] = useState({ data: getGroup(props.hash, props.data) })
    useEffect(() => {
        if (props.hash) setGroup({ data: getGroup(props.hash, props.data) })
    }, [props.hash, props.data]);

    return <>
        <FloatingLabel label="Group" className="mb-2" >
            <FormSelect emptyChoose value={group.data} onChange={(x) => { setGroup({ data: x }) }} values={Object.keys(props.data ? props.data.groups : {}).sort((a, b) => { return a <= b ? -1 : 1 })} />
        </FloatingLabel>

        <FloatingLabel label="Node">
            <FormSelect
                emptyChoose
                value={props.hash}
                onChange={(x) => { props.onChangeNode(x) }}
                values={Object.entries(props.data ? props.data.groups[group.data]?.nodesV2 ?? {} : {}).sort((a, b) => { return a <= b ? -1 : 1 })}
            />
        </FloatingLabel>
    </>
}

const Mirror = (props: {
    value: string,
    data: tags_response,
    onChangeMirror: (x: string) => void
}) => {
    return <FloatingLabel label="Mirror" className="mb-2" >
        <FormSelect
            emptyChoose
            value={props.value}
            onChange={(x) => { props.onChangeMirror(x) }}
            values={Object.keys(props.data.tags).sort((a, b) => { return a <= b ? -1 : 1 })}
        />
    </FloatingLabel>
}

export default Tags;