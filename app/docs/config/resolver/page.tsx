"use client";

import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import React, { FC, useContext, useEffect, useState } from "react";
import { Button, Card, Form, InputGroup, ListGroup, Modal, Spinner } from "react-bootstrap";
import useSWR from "swr";
import { ConfirmModal } from "../../common/confirm";
import Loading, { Error } from "../../common/loading";
import { FetchProtobuf, ProtoESFetcher } from "../../common/proto";
import { SettingCheck, SettingTypeSelect } from "../../common/switch";
import { GlobalToastContext } from "../../common/toast";
import { dns, dnsSchema, type, typeSchema } from "../../pbes/config/dns/dns_pb";
import { resolver, save_resolverSchema } from "../../pbes/config/grpc/config_pb";
import { NewItemList, SettingInputText } from "../components";

export default function ResolverComponent() {
    return <>
        <div className="mb-3">
            <Resolver />
        </div>
        <div className="mb-3">
            <Hosts />
        </div>
        <Fakedns />
    </>
}

function Resolver() {
    const ctx = useContext(GlobalToastContext);

    const { data: resolvers, error, isLoading, mutate } = useSWR("/resolvers", ProtoESFetcher(resolver.method.list))

    const [showdata, setShowdata] = useState({ show: false, name: "", new: false });
    const [confirm, setConfirm] = useState<{ show: boolean, name: string }>({ show: false, name: "" });
    const [newdata, setNewdata] = useState({ value: "" });

    if (error !== undefined) return <Card className="align-items-center">
        <Card.Body>
            <Error statusCode={error.code} title={error.msg} />
        </Card.Body>
    </Card>

    if (isLoading || resolvers === undefined) return <Card className="align-items-center">
        <Card.Body>
            <Loading />
        </Card.Body>
    </Card>


    const deleteResolver = (name: string) => {
        FetchProtobuf(resolver.method.remove, "/resolver", "DELETE", create(StringValueSchema, { value: name }),)
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
                deleteResolver(confirm.name)
                setConfirm(prev => { return { ...prev, show: false } })
            }}
            onHide={() => { setConfirm(prev => { return { ...prev, show: false } }) }}
        />

        <ResolverModal
            name={showdata.name}
            show={showdata.show}
            isNew={showdata.new}
            onHide={(save) => {
                if (save) mutate()
                setShowdata(prev => { return { ...prev, show: false } })
            }}
        />


        <Card>
            {resolvers.names.length !== 0 &&
                <ListGroup variant="flush">
                    {resolvers.names.
                        sort((a, b) => { return a <= b ? -1 : 1 }).
                        map((v, k) => {
                            return <React.Fragment key={"resolvers-" + k}>
                                <ListGroup.Item
                                    action
                                    disabled={v === "direct" || v === "proxy" || v === "bootstrap"}
                                    className="d-flex justify-content-between align-items-center"
                                    style={{ border: "0ch", borderBottom: "1px solid #dee2e6" }}
                                    onClick={(e) => { e.stopPropagation(); setShowdata({ show: true, name: v, new: false }) }}
                                >
                                    {v}
                                    {v !== "bootstrap" &&
                                        <Button
                                            variant='outline-danger'
                                            disabled={v === "direct" || v === "proxy" || v === "bootstrap"}
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


            <Card.Footer>
                <InputGroup className="d-flex justify-content-end">
                    <Form.Control value={newdata.value} onChange={(e) => setNewdata({ value: e.target.value })} />
                    <Button
                        variant='outline-success'
                        onClick={() => {
                            if (!newdata.value || resolvers.names.includes(newdata.value)) return
                            if (showdata.name === newdata.value && showdata.new)
                                setShowdata(prev => { return { ...prev, show: true } })
                            else
                                setShowdata({ show: true, name: newdata.value, new: true })
                        }}
                    >
                        <i className="bi bi-plus-lg" />New </Button>
                </InputGroup>
            </Card.Footer>
        </Card>

    </>
}


const Hosts: FC = () => {
    const ctx = useContext(GlobalToastContext);

    const [newHosts, setNewHosts] = useState({ key: "", value: "" })
    const [saving, setSaving] = useState(false);

    const { data, error, isLoading, mutate } =
        useSWR("/resolver/hosts", ProtoESFetcher(resolver.method.hosts))

    if (error !== undefined) return <Card className="align-items-center">
        <Card.Body>
            <Error statusCode={error.code} title={error.msg} />
        </Card.Body>
    </Card>

    if (isLoading || data === undefined) return <Card className="align-items-center">
        <Card.Body>
            <Loading />
        </Card.Body>
    </Card>

    return <>
        <Card>
            <Card.Body>
                {
                    Object.entries(data.hosts)
                        .sort(([a], [b]) => { return a > b ? -1 : 1 })
                        .map(([k, v], i) =>
                            <InputGroup className={i !== 0 ? "mt-2" : ""} key={"hosts" + k}>
                                <Form.Control readOnly value={k} />
                                <InputGroup.Text><i className="bi bi-arrow-right"></i></InputGroup.Text>
                                <Form.Control
                                    value={v}
                                    onChange={(e) => mutate(prev => { return { ...prev, hosts: { ...prev.hosts, [k]: e.target.value } } }, false)}
                                />
                                <Button variant='outline-danger' onClick={() => {
                                    const tmp = { ...data.hosts }
                                    delete tmp[k]
                                    mutate({ ...data, hosts: tmp }, false)
                                }}>
                                    <i className="bi bi-x-lg"></i>
                                </Button>
                            </InputGroup>
                        )
                }

                <InputGroup className="mt-2">
                    <Form.Control value={newHosts.key} onChange={(e) => setNewHosts({ ...newHosts, key: e.target.value })} />
                    <InputGroup.Text><i className="bi bi-arrow-right"></i></InputGroup.Text>
                    <Form.Control
                        value={newHosts.value}
                        onChange={(e) => setNewHosts({ ...newHosts, value: e.target.value })}
                    />
                    <Button variant='outline-success' onClick={() => {
                        if (newHosts.key === "" || data.hosts[newHosts.key] !== undefined) return
                        mutate({ ...data, hosts: { ...data.hosts, [newHosts.key]: newHosts.value } }, false)
                    }}>
                        <i className="bi bi-plus-lg"></i>
                    </Button>
                </InputGroup>

            </Card.Body>

            <Card.Footer className="d-flex justify-content-end">
                <Button
                    variant="outline-primary"
                    disabled={saving}
                    onClick={() => {
                        setSaving(true)
                        FetchProtobuf(resolver.method.save_hosts, "/resolver/hosts", "PATCH", data)
                            .then(async ({ error }) => {
                                if (error === undefined) {
                                    ctx.Info("save hosts successful")
                                } else {
                                    const msg = error.msg;
                                    ctx.Error(msg)
                                    console.error(error.code, msg)
                                }

                                mutate()
                                setSaving(false)
                            })
                    }}
                >
                    Save{saving && <>&nbsp;<Spinner size="sm" animation="border" /></>}
                </Button>
            </Card.Footer>
        </Card>
    </>
}

const ResolverModal: FC<{ name: string, show: boolean, isNew?: boolean, onHide: (save?: boolean) => void }> = ({ name, show, isNew, onHide }) => {

    const ctx = useContext(GlobalToastContext);

    // isValidating becomes true whenever there is an ongoing request whether the data is loaded or not
    // isLoading becomes true when there is an ongoing request and data is not loaded yet.
    const { data, error, isLoading, isValidating, mutate } = useSWR(name === "" ? undefined : `/resolver`,
        ProtoESFetcher(
            resolver.method.get,
            "POST",
            create(StringValueSchema, { value: name }),
            isNew ? create(dnsSchema, { host: "8.8.8.8", type: type.udp }) : undefined
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
                    onClick={() => {
                        FetchProtobuf(resolver.method.save, "/resolver", "PATCH", create(save_resolverSchema, { name: name, resolver: data }))
                            .then(async ({ error }) => {
                                if (error === undefined) {
                                    ctx.Info("save successful")
                                    onHide(true)
                                } else {
                                    const msg = error.msg;
                                    ctx.Error(msg)
                                    console.error(error.code, msg)
                                }
                            })
                    }}
                >
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    </>
}

const Single: FC<{ value: dns, onChange: (x: dns) => void }> = ({ value, onChange }) => {
    return <>
        <SettingInputText label='Host' value={value.host} onChange={(v) => onChange({ ...value, host: v })} />
        <SettingTypeSelect label='Type' type={typeSchema} value={value.type} onChange={(v) => onChange({ ...value, type: v })} />
        <SettingInputText label='Subnet' value={value.subnet} onChange={(v) => onChange({ ...value, subnet: v })} />
        <SettingInputText mb='' label='SNI' value={value.tlsServername} onChange={(v) => onChange({ ...value, tlsServername: v })} />
    </>
}

const Fakedns: FC = () => {
    const ctx = useContext(GlobalToastContext);

    const [saving, setSaving] = useState(false);

    const { data, error, isLoading, mutate } =
        useSWR("/resolver/fakedns", ProtoESFetcher(resolver.method.fakedns))

    if (error !== undefined) return <Card className="align-items-center">
        <Card.Body>
            <Error statusCode={error.code} title={error.msg} />
        </Card.Body>
    </Card>

    if (isLoading || data === undefined) return <Card className="align-items-center">
        <Card.Body>
            <Loading />
        </Card.Body>
    </Card>

    return <>
        <Card>
            <Card.Body>
                <SettingCheck label="Enabled"
                    checked={data.enabled}
                    onChange={() => mutate(prev => { return { ...prev, enabled: !prev.enabled } }, false)} />
                <SettingInputText label='IPv4 Range' value={data.ipv4Range} onChange={(v) => mutate(prev => { return { ...prev, ipv4Range: v } }, false)} />
                <SettingInputText label='IPv6 Range' value={data.ipv6Range} onChange={(v) => mutate(prev => { return { ...prev, ipv6Range: v } }, false)} />

                <NewItemList
                    title="Whitelist"
                    data={data.whitelist}
                    onChange={(v) => mutate(prev => { return { ...prev, whitelist: v } }, false)}
                />
            </Card.Body>
            <Card.Footer className="d-flex justify-content-end">
                <Button
                    variant="outline-primary"
                    disabled={saving}
                    onClick={() => {
                        setSaving(true)
                        FetchProtobuf(resolver.method.save_fakedns, "/resolver/fakedns", "PATCH", data)
                            .then(async ({ error }) => {
                                if (error === undefined) {
                                    ctx.Info("save fakedns successful")
                                } else {
                                    const msg = error.msg;
                                    ctx.Error(msg)
                                    console.error(error.code, msg)
                                }

                                mutate()
                                setSaving(false)
                            })
                    }}
                >
                    Save{saving && <>&nbsp;<Spinner size="sm" animation="border" /></>}
                </Button>
            </Card.Footer>
        </Card>
    </>
}
