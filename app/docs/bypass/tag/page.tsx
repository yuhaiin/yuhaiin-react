"use client"

import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import Error from 'next/error';
import { FC, useContext, useState } from "react";
import { Button, ButtonGroup, FloatingLabel, Form, Modal, ToggleButton } from "react-bootstrap";
import { ConfirmModal } from "../../common/confirm";
import Loading from "../../common/loading";
import { Node, Nodes } from "../../common/nodes";
import { FetchProtobuf, useProtoSWR } from '../../common/proto';
import { FormSelect } from "../../common/switch";
import { GlobalToastContext } from "../../common/toast";
import { NodeModal } from "../../node/modal";
import { node, save_tag_req, save_tag_reqSchema, tag, tags_response } from "../../pbes/api/node_pb";
import { tag_type, tags, tagsSchema } from "../../pbes/node/tag_pb";
import styles from './tag.module.css';


const HashPill: FC<{ v: tags, onHashClick: (h: string) => void }> = ({ v, onHashClick }) => {
    if (v.hash.length === 0 || v.hash[0] === "") {
        return (
            <div className={styles['hash-pill']} title="Global Fallback">
                <div className={`${styles['hash-pill-icon']} ${styles['bg-type-global']}`}>
                    <i className="bi bi-globe"></i>
                </div>
                <span className="text-muted fw-medium">Global</span>
            </div>
        );
    }

    const isMirror = v.type === tag_type.mirror;
    const iconBgClass = isMirror ? styles['bg-type-mirror'] : styles['bg-type-node'];
    const icon = isMirror ? "bi-files" : "bi-hdd-network";

    return (
        <div className={styles['hash-pill']}>
            <div className={`${styles['hash-pill-icon']} ${iconBgClass}`}>
                <i className={`bi ${icon}`}></i>
            </div>
            <a
                href="#"
                className="font-monospace text-decoration-none text-body text-truncate d-block text-start"
                style={{ maxWidth: '100%' }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onHashClick(v.hash[0]);
                }}
            >
                {v.hash[0]}
            </a>
        </div>
    );
};


const TagItem: FC<{
    k: string,
    v: tags,
    onEdit: () => void,
    onDelete: () => void,
    onHashClick: (h: string) => void
}> = ({ k, v, onEdit, onDelete, onHashClick }) => {
    return (
        <li className={styles['list-item']} onClick={onEdit}>
            <div className={styles['item-top']}>
                <i className="bi bi-tag-fill text-muted me-2 small opacity-50"></i>
                <span className={styles['item-title']} title={k}>{k}</span>
            </div>

            <div className={styles['item-bottom']}>
                <div className={styles['pill-wrapper']}>
                    <HashPill v={v} onHashClick={onHashClick} />
                </div>

                <div className={styles['action-wrapper']}>
                    <Button
                        as="div"
                        variant="link"
                        size="sm"
                        className="p-0 text-danger opacity-50 opacity-100-hover d-flex align-items-center justify-content-center"
                        style={{ width: '100%', height: '100%' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        <i className="bi bi-trash" style={{ lineHeight: 1 }}></i>
                    </Button>
                </div>
            </div>
        </li>
    )
}


function Tags() {
    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useProtoSWR(tag.method.list)
    const { data: nodes } = useProtoSWR(node.method.list)
    const [modalHash, setModalHash] = useState({ hash: "", show: false });
    const [tagModalData, setTagModalData] = useState({ show: false, tag: create(save_tag_reqSchema, { tag: "", hash: "", type: tag_type.node }), new: true });
    const [confirmData, setConfirmData] = useState({ show: false, name: "" });

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || data == undefined) return <Loading />

    return (
        <>
            <ConfirmModal
                show={confirmData.show}
                content={
                    <div className="text-center">
                        <i className="bi bi-exclamation-circle text-danger display-4 mb-3 d-block"></i>
                        <p className="mb-0">Delete tag <strong className="text-break">{confirmData.name}</strong>?</p>
                    </div>
                }
                onHide={() => setConfirmData({ ...confirmData, show: false })}
                onOk={() => {
                    FetchProtobuf(tag.method.remove, create(StringValueSchema, { value: confirmData.name }))
                        .then(async ({ error }) => {
                            if (error !== undefined) ctx.Error(`delete tag failed: ${error.msg}`)
                            else {
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
                nodes={new Nodes(nodes)}
                data={data}
                tag={tagModalData.tag}
                onChangeTag={(x) => setTagModalData({ ...tagModalData, tag: x })}
                new={tagModalData.new}
                onHide={() => setTagModalData({ ...tagModalData, show: false })}
                onSave={() => {
                    if (tagModalData.tag.tag === "" || tagModalData.tag.hash === "") return
                    FetchProtobuf(tag.method.save, tagModalData.tag)
                        .then(async ({ error }) => {
                            if (error !== undefined) ctx.Error(`save failed: ${error.msg}`)
                            else {
                                await mutate();
                            }
                            setTagModalData({ ...tagModalData, show: false })
                        })
                }}
            />

            <div className={styles.tagList + " mb-3"}>
                <div className={styles.tagHeader}>
                    <span className="fw-bold small text-muted text-uppercase ls-1">
                        <i className="bi bi-tags-fill me-2 text-primary"></i>Tags
                    </span>
                    <Button
                        variant="primary"
                        size="sm"
                        className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                        style={{ width: '28px', height: '28px' }}
                        onClick={() => setTagModalData({
                            show: true,
                            tag: create(save_tag_reqSchema, { tag: "new tag", hash: "", type: tag_type.node }), new: true
                        })}
                    >
                        <i className="bi bi-plus-lg"></i>
                    </Button>
                </div>

                <ul className="list-unstyled m-0 p-0">
                    {
                        Object
                            .entries(data.tags)
                            .sort((a, b) => a[0].localeCompare(b[0]))
                            .map(([k, v]) => {
                                return <TagItem
                                    key={k}
                                    k={k}
                                    v={create(tagsSchema, v)}
                                    onEdit={() => setTagModalData({
                                        show: true,
                                        tag: create(save_tag_reqSchema, { tag: k, hash: v.hash[0], type: v.type }),
                                        new: false
                                    })}
                                    onDelete={() => setConfirmData({ show: true, name: k })}
                                    onHashClick={(h) => setModalHash({ hash: h, show: true })}
                                />
                            })
                    }
                    {Object.keys(data.tags).length === 0 && (
                        <li className="text-center text-muted py-5">
                            <span className="small">No tags</span>
                        </li>
                    )}
                </ul>
            </div>
        </>
    )
}

const TagModal = (props: {
    show: boolean,
    nodes: Nodes,
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
                <ButtonGroup className="mb-3 d-flex w-100">
                    <ToggleButton
                        id="toggle-node"
                        type="radio"
                        variant="outline-primary"
                        value={tag_type.node}
                        onChange={() => { props.tag.type = tag_type.node; props.onChangeTag(props.tag) }}
                        checked={props.tag.type === tag_type.node}
                        className="w-50"
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
                        className="w-50"
                    >
                        Mirror
                    </ToggleButton>
                </ButtonGroup>

                {props.new &&
                    <FloatingLabel label="Tag Name" className="mb-2" >
                        <Form.Control placeholder="Tag Name"
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
                <Button variant="link" className="text-decoration-none text-muted" onClick={() => { props.onHide() }}>Cancel</Button>
                <Button
                    variant="primary"
                    onClick={() => { props.onSave() }}
                >
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    </>
}


const Mirror = (props: {
    value: string,
    data: tags_response,
    onChangeMirror: (x: string) => void
}) => {
    return <FloatingLabel label="Target Mirror Tag" className="mb-2" >
        <FormSelect
            emptyChoose
            value={props.value}
            onChange={(x) => { props.onChangeMirror(x) }}
            values={Object.keys(props.data.tags).sort((a, b) => { return a <= b ? -1 : 1 })}
        />
    </FloatingLabel>
}

export default Tags;