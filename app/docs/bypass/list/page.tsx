"use client";

import { create } from "@bufbuild/protobuf";
import { EmptySchema, StringValueSchema } from "@bufbuild/protobuf/wkt";
import React, { FC, useContext, useEffect, useState } from "react";
import { Alert, Button, Card, Form, InputGroup, ListGroup, Modal, Spinner } from "react-bootstrap";
import useSWR from "swr";
import { ConfirmModal } from "../../common/confirm";
import Loading, { Error } from "../../common/loading";
import { FetchProtobuf, ProtoESFetcher, ProtoPath, useProtoSWR } from "../../common/proto";
import { SettingCheck, SettingTypeSelect } from "../../common/switch";
import { GlobalToastContext } from "../../common/toast";
import { NewItemList } from "../../config/components";
import { list, list_list_type_enum, list_list_type_enumSchema, list_localSchema, list_remoteSchema, listSchema } from "../../pbes/config/bypass/bypass_pb";
import { lists } from "../../pbes/config/grpc/config_pb";

export default function Lists() {
    const ctx = useContext(GlobalToastContext);

    const { data: listsData, error, isLoading, mutate } = useProtoSWR(lists.method.list)

    const [showdata, setShowdata] = useState({ show: false, name: "", new: false });
    const [confirm, setConfirm] = useState<{ show: boolean, name: string }>({ show: false, name: "" });
    const [newdata, setNewdata] = useState({ value: "" });
    const [refresh, setRefresh] = useState(false)

    if (error !== undefined) return <Card className="align-items-center">
        <Card.Body>
            <Error statusCode={error.code} title={error.msg} />
        </Card.Body>
    </Card>

    if (isLoading || listsData === undefined) return <Card className="align-items-center">
        <Card.Body>
            <Loading />
        </Card.Body>
    </Card>


    const deleteList = (name: string) => {
        FetchProtobuf(lists.method.remove, create(StringValueSchema, { value: name }),)
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("remove successful")
                    mutate()
                } else {
                    const msg = error.msg;
                    ctx.Error(msg)
                    console.error(error.code, msg)
                }
            })
    }

    return <>
        <ConfirmModal
            show={confirm.show}
            content={<>Are you sure to delete {confirm.name}?</>}
            onOk={() => {
                deleteList(confirm.name)
                setConfirm(prev => { return { ...prev, show: false } })
            }}
            onHide={() => { setConfirm(prev => { return { ...prev, show: false } }) }}
        />

        <ListsModal
            name={showdata.name}
            show={showdata.show}
            isNew={showdata.new}
            onHide={(save) => {
                if (save) mutate()
                setShowdata(prev => { return { ...prev, show: false } })
            }}
        />


        <Card>
            {listsData.names.length !== 0 &&
                <ListGroup variant="flush" style={{ borderBottom: "none" }}>
                    {listsData.names.
                        sort((a, b) => { return a <= b ? -1 : 1 }).
                        map((v, k) => {
                            return <React.Fragment key={"resolvers-" + k}>
                                <ListGroup.Item
                                    action
                                    className="d-flex justify-content-between align-items-center"
                                    style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}
                                    onClick={(e) => { e.stopPropagation(); setShowdata({ show: true, name: v, new: false }) }}
                                >
                                    {v}
                                    {v !== "bootstrap" &&
                                        <Button
                                            variant='outline-danger'
                                            disabled={v === "bootstrap"}
                                            size="sm"
                                            as={"span"}
                                            key={k + "span-button"}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setConfirm({ show: true, name: v })
                                            }}
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </Button>
                                    }
                                </ListGroup.Item>
                            </React.Fragment>
                        })
                    }
                </ListGroup>
            }


            <Card.Footer className="d-flex justify-content-between">
                <InputGroup className="d-flex justify-content-end">
                    <Form.Control value={newdata.value} onChange={(e) => setNewdata({ value: e.target.value })} />
                    <Button
                        variant='outline-success'
                        onClick={() => {
                            if (!newdata.value || listsData.names.includes(newdata.value)) return
                            if (showdata.name === newdata.value && showdata.new)
                                setShowdata(prev => { return { ...prev, show: true } })
                            else
                                setShowdata({ show: true, name: newdata.value, new: true })
                        }}
                    >
                        <i className="bi bi-plus-lg" />New </Button>

                </InputGroup>

                <Button
                    className="ms-2"
                    variant='outline-primary'
                    disabled={refresh}
                    onClick={() => {
                        setRefresh(true)
                        FetchProtobuf(lists.method.refresh, create(EmptySchema))
                            .then(async ({ error }) => {
                                if (error === undefined) {
                                    ctx.Info("refresh successful")
                                } else {
                                    const msg = error.msg;
                                    ctx.Error(msg)
                                    console.error(error.code, msg)
                                }
                                setRefresh(false)
                            })
                    }}
                >
                    {refresh && <Spinner animation="border" size="sm" />} Refresh
                </Button>
            </Card.Footer>
        </Card>

    </>
}

const ListsModal: FC<{ name: string, show: boolean, isNew?: boolean, onHide: (save?: boolean) => void }> = ({ name, show, isNew, onHide }) => {

    const ctx = useContext(GlobalToastContext);

    const [loadding, setLoadding] = useState(false);

    // isValidating becomes true whenever there is an ongoing request whether the data is loaded or not
    // isLoading becomes true when there is an ongoing request and data is not loaded yet.
    const { data, error, isLoading, isValidating, mutate } = useSWR(name === "" ? undefined : ProtoPath(lists.method.get),
        ProtoESFetcher(
            lists.method.get,
            create(StringValueSchema, { value: name }),
            isNew ? create(listSchema, {
                name: name, listType: list_list_type_enum.host, list: { case: "local", value: create(list_localSchema, { lists: [] }) }
            }) : undefined
        ),
        {
            shouldRetryOnError: false,
            keepPreviousData: false,
            revalidateOnFocus: false,
        })

    useEffect(() => { mutate(); }, [name, isNew, mutate])

    return <>
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header>{name}</Modal.Header>
            <Modal.Body>
                {error ?
                    <>
                        <h4 className="text-center my-2">{error.code} - {error.msg}</h4>
                        <pre className="text-center my-2 text-danger lead">{error.raw}</pre>
                    </> :
                    isValidating || isLoading || !data ? <Loading /> :
                        <Single value={data} onChange={(e) => { mutate(e, false) }} />
                }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => { onHide() }}>Close</Button>
                <Button
                    variant="outline-primary"
                    disabled={loadding}
                    onClick={() => {
                        setLoadding(true)
                        FetchProtobuf(lists.method.save, data)
                            .then(async ({ error }) => {
                                if (error === undefined) {
                                    ctx.Info("save successful")
                                    onHide(true)
                                } else {
                                    const msg = error.msg;
                                    ctx.Error(msg)
                                    console.error(error.code, msg)
                                }
                                mutate();
                                setLoadding(false)
                            })
                    }}
                >
                    {loadding && <Spinner animation="border" size="sm" />}    Save
                </Button>
            </Modal.Footer>
        </Modal>
    </>
}

const Single: FC<{ value: list, onChange: (x: list) => void }> = ({ value, onChange }) => {
    return <>
        <SettingTypeSelect label='Type' type={list_list_type_enumSchema} value={value.listType} onChange={(v) => onChange({ ...value, listType: v })} />
        <SettingCheck label="Remote"
            checked={value.list.case === "remote"}
            onChange={(v) => {
                const values = value.list.case === "remote" ? value.list.value.urls : value.list.value.lists

                onChange(
                    {
                        ...value, list: v ?
                            {
                                case: "remote", value: create(list_remoteSchema, { urls: values })
                            } :
                            {
                                case: "local", value: create(list_localSchema, { lists: values })
                            }
                    })
            }}
        />

        <NewItemList
            title="List"
            data={value.list.case === "remote" ? value.list.value.urls : value.list.value.lists}
            onChange={(x) => {
                onChange({
                    ...value,
                    list: value.list.case === "remote" ?
                        { case: "remote", value: create(list_remoteSchema, { urls: x }) } :
                        { case: "local", value: create(list_localSchema, { lists: x }) }
                })
            }}
        />

        {
            value.errorMsgs.map((v, index) => {
                return (
                    <Alert className="mt-2" key={index} variant="danger">
                        {v}
                    </Alert>
                )
            })
        }
    </>
}
