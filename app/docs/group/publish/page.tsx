"use client"

import { create, toBinary } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import Error from 'next/error';
import { useContext, useEffect, useState } from "react";
import { Badge, Button, ButtonGroup, Card, Dropdown, FloatingLabel, Form, InputGroup, ListGroup, Modal } from "react-bootstrap";
import { useLocalStorage } from 'usehooks-ts';
import { APIUrlDefault, APIUrlKey } from '../../common/apiurl';
import { useClipboard } from '../../common/clipboard';
import { ConfirmModal } from "../../common/confirm";
import Loading from "../../common/loading";
import { FetchProtobuf, useProtoSWR } from '../../common/proto';
import { GlobalToastContext } from "../../common/toast";
import { node, SavePublishRequestSchema, subscribe } from "../../pbes/api/node_pb";
import { Publish, PublishSchema, YuhaiinUrl_RemoteSchema, YuhaiinUrlSchema } from "../../pbes/node/subscribe_pb";

function EditModal(
    props: {
        show: boolean,
        isEdit: boolean,
        onHide: () => void,
        item?: Publish,
        configName?: string,
        nodes: any,
        mutatePub: () => void,
    }
) {
    const { show, isEdit, onHide, item, configName: initialConfigName, nodes, mutatePub } = props;

    const [newItem, setNewItem] = useState(item ? create(PublishSchema, item) : create(PublishSchema, {
        name: "",
        path: "",
        password: "",
        points: [],
        address: typeof window !== 'undefined' ? window.location.host : '',
        insecure: typeof window !== 'undefined' ? window.location.protocol !== 'https:' : true,
    }));

    const [configName, setConfigName] = useState(initialConfigName || "");
    const [selectedNodes, setSelectedNodes] = useState<string[]>(item?.points || []);
    const ctx = useContext(GlobalToastContext);

    const handleNodeSelect = (hash: string) => {
        setSelectedNodes(prev =>
            prev.includes(hash) ? prev.filter(h => h !== hash) : [...prev, hash]
        );
    };

    const handleSave = () => {
        if (!configName || !newItem.name) {
            ctx.Error("Configuration Name and Subscription Name are required.");
            return;
        }

        const req = create(SavePublishRequestSchema, {
            name: configName,
            publish: create(PublishSchema, {
                ...newItem,
                points: selectedNodes,
            }),
        });

        FetchProtobuf(subscribe.method.save_publish, req).then(({ error }) => {
            if (error) {
                ctx.Error(`Failed to save publish config: ${error.msg}`);
            } else {
                ctx.Info("Successfully saved publish config.");
                mutatePub();
                onHide();
            }
        });
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{isEdit ? 'Edit' : 'Add'} Publish Configuration</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FloatingLabel label="Configuration Name" className="mb-3">
                    <Form.Control placeholder="my-awesome-config" value={configName} onChange={e => setConfigName(e.target.value)} disabled={isEdit} />
                </FloatingLabel>
                <FloatingLabel label="Subscription Name" className="mb-3">
                    <Form.Control placeholder="my-sub" value={newItem.name} onChange={e => setNewItem(create(PublishSchema, { ...newItem, name: e.target.value }))} />
                </FloatingLabel>
                <FloatingLabel label="Subscription Path" className="mb-3">
                    <Form.Control placeholder="custom/path" value={newItem.path} onChange={e => setNewItem(create(PublishSchema, { ...newItem, path: e.target.value }))} />
                </FloatingLabel>
                <FloatingLabel label="Password" className="mb-3">
                    <Form.Control type="password" placeholder="password" value={newItem.password} onChange={e => setNewItem(create(PublishSchema, { ...newItem, password: e.target.value }))} />
                </FloatingLabel>
                <FloatingLabel label="Address" className="mb-3">
                    <Form.Control placeholder="example.com:443" value={newItem.address} onChange={e => setNewItem(create(PublishSchema, { ...newItem, address: e.target.value }))} />
                </FloatingLabel>
                <Form.Check
                    type="switch"
                    label="Insecure"
                    checked={newItem.insecure}
                    onChange={(e) => setNewItem(create(PublishSchema, { ...newItem, insecure: e.target.checked }))}
                    className="mb-3"
                />

                <Dropdown as={ButtonGroup} className="d-block mb-3">
                    <Dropdown.Toggle variant="outline-secondary" className="w-100">Select Nodes ({selectedNodes.length})</Dropdown.Toggle>
                    <Dropdown.Menu style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {nodes.groups.map((g: any) => (
                            <div key={g.name}>
                                <Dropdown.Header>{g.name}</Dropdown.Header>
                                {g.nodes.map((n: any) => (
                                    <Dropdown.ItemText key={n.hash}>
                                        <Form.Check
                                            type="checkbox"
                                            label={n.name}
                                            checked={selectedNodes.includes(n.hash)}
                                            onChange={() => handleNodeSelect(n.hash)}
                                        />
                                    </Dropdown.ItemText>
                                ))}
                            </div>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={handleSave}>Save</Button>
            </Modal.Footer>
        </Modal>
    );
}


function PublishPage() {
    const { data: publishes, error: errPub, isLoading: loadingPub, mutate: mutatePub } = useProtoSWR(subscribe.method.list_publish);
    const { data: nodes, error: errNodes, isLoading: loadingNodes } = useProtoSWR(node.method.list);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentItem, setCurrentItem] = useState<Publish | undefined>(undefined);
    const [currentConfigName, setCurrentConfigName] = useState<string | undefined>(undefined);
    const [confirmDelete, setConfirmDelete] = useState({ show: false, name: '' });

    const ctx = useContext(GlobalToastContext);
    const { copy, copied } = useClipboard({
        onCopyError: (e) => ctx.Error(e.message)
    });

    const [apiUrl] = useLocalStorage<string>(APIUrlKey, APIUrlDefault)

    useEffect(() => {
        if (copied) {
            ctx.Info("Copied to clipboard!");
        }
    }, [copied, ctx]);


    if (errPub) return <Error statusCode={errPub.code} title={errPub.msg} />
    if (errNodes) return <Error statusCode={errNodes.code} title={errNodes.msg} />
    if (loadingPub || loadingNodes || !publishes || !nodes) return <Loading />

    const handleRemove = (name: string) => {
        FetchProtobuf(subscribe.method.remove_publish, create(StringValueSchema, { value: name })).then(({ error }) => {
            if (error) {
                ctx.Error(`Failed to remove publish config: ${error.msg}`);
            } else {
                ctx.Info("Successfully removed publish config.");
                mutatePub();
            }
        });
    };

    const handleShowModal = (edit: boolean, configName?: string, item?: Publish) => {
        setIsEdit(edit);
        setCurrentItem(item);
        setCurrentConfigName(configName);
        setShowModal(true);
    };

    const handleHideModal = () => {
        setShowModal(false);
        setCurrentItem(undefined);
        setCurrentConfigName(undefined);
    };

    return (
        <>
            <ConfirmModal
                show={confirmDelete.show}
                content={<p>Delete publish configuration {confirmDelete.name}?</p>}
                onHide={() => setConfirmDelete({ show: false, name: '' })}
                onOk={() => {
                    handleRemove(confirmDelete.name);
                    setConfirmDelete({ show: false, name: '' });
                }}
            />

            <Card>
                <ListGroup variant="flush">
                    {Object.entries(publishes.publishes).map(([name, pub]) => {
                        const yuhaiinUrlRemote = create(YuhaiinUrl_RemoteSchema, {
                            publish: create(PublishSchema, pub),
                        });

                        const yuhaiinUrl = create(YuhaiinUrlSchema, {
                            name: pub.name,
                            url: {
                                value: yuhaiinUrlRemote,
                                case: 'remote',
                            },
                        });

                        const encodedYuhaiinUrl = `yuhaiin://${btoa(String.fromCharCode(...toBinary(YuhaiinUrlSchema, yuhaiinUrl))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`;

                        return (
                            <ListGroup.Item key={name} className="mb-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                                <Badge bg="primary" className="me-2">{name}</Badge>
                                <span className="me-2">{pub.name}</span>
                                <InputGroup size="sm" className="me-2">
                                    <Form.Control readOnly value={encodedYuhaiinUrl} style={{ minWidth: '200px' }} />
                                    <Button variant="outline-secondary" onClick={() => copy(encodedYuhaiinUrl)}>
                                        {copied ? 'Copied' : 'Copy'}
                                    </Button>
                                </InputGroup>
                                <ButtonGroup>
                                    <Button variant="outline-primary" size="sm" onClick={() => handleShowModal(true, name, pub)}>Edit</Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => setConfirmDelete({ show: true, name: name })}>Delete</Button>
                                </ButtonGroup>
                            </ListGroup.Item>
                        );
                    })}
                    <ListGroup.Item className="d-sm-flex">
                        <Button
                            variant="outline-success"
                            className="flex-grow-1"
                            onClick={() => handleShowModal(false)}
                        >
                            <i className="bi bi-plus-lg" />Add New Publish
                        </Button>
                    </ListGroup.Item>
                </ListGroup>
            </Card>

            {showModal && (
                <EditModal
                    show={showModal}
                    isEdit={isEdit}
                    onHide={handleHideModal}
                    item={currentItem}
                    configName={currentConfigName}
                    nodes={nodes}
                    mutatePub={mutatePub}
                />
            )}
        </>
    )
}

export default PublishPage;