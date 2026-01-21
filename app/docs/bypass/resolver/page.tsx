"use client";

import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import { FC, useContext, useEffect, useState } from "react";
import { Button, Card, Form, InputGroup, Modal, Spinner } from "react-bootstrap";
import useSWR from "swr";
import { ConfirmModal } from "../../common/confirm";
import Loading, { Error } from "../../common/loading";
import { FetchProtobuf, ProtoESFetcher, ProtoPath, useProtoSWR } from "../../common/proto";
import { SettingTypeSelect } from "../../common/switch";
import { GlobalToastContext } from "../../common/toast";
import { SettingInputText } from "../../config/components";
import { resolver, save_resolverSchema } from "../../pbes/api/config_pb";
import { dns, dnsSchema, type, typeSchema } from "../../pbes/config/dns_pb";
import { Fakedns } from "./fakedns";
import { Hosts } from "./hosts";
import styles from './resolver.module.css';
import { Server } from "./server";

export default function ResolverComponent() {
    return (
        <div className={styles.mainContainer}>
            <Resolver />

            <div className="row g-4 mt-3">
                <div className="col-lg-6">
                    <Hosts />
                </div>
                <div className="col-lg-6">
                    <Fakedns />
                </div>
            </div>

            <div className="mt-5">
                <Server />
            </div>
        </div>
    );
}

function Resolver() {
    const ctx = useContext(GlobalToastContext);
    const { data: resolvers, error, isLoading, mutate } = useProtoSWR(resolver.method.list)
    const [showdata, setShowdata] = useState({ show: false, name: "", new: false });
    const [confirm, setConfirm] = useState<{ show: boolean, name: string }>({ show: false, name: "" });
    const [newdata, setNewdata] = useState({ value: "" });

    if (error !== undefined) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || resolvers === undefined) return <Loading />

    const deleteResolver = (name: string) => {
        FetchProtobuf(resolver.method.remove, create(StringValueSchema, { value: name }),)
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("remove successful")
                    mutate()
                } else {
                    ctx.Error(error.msg)
                    console.error(error.code, error.msg)
                }
            })
    }

    const handleCreate = () => {
        if (!newdata.value || resolvers.names.includes(newdata.value)) return;

        if (showdata.name === newdata.value && showdata.new) {
            setShowdata(prev => { return { ...prev, show: true } })
        } else {
            setShowdata({ show: true, name: newdata.value, new: true })
        }
    };

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
                if (save) {
                    mutate();
                    setNewdata({ value: "" });
                }
                setShowdata(prev => { return { ...prev, show: false } })
            }}
            onDelete={(name) => setConfirm({ show: true, name: name })}
        />

        <Card className={`${styles.configCard} mb-5`}>
            <Card.Header className={styles.cardHeaderCustom}>
                <div className="d-flex align-items-center">
                    <div className={styles.iconBox}><i className="bi bi-layers-half"></i></div>
                    <div>
                        <h5 className="mb-0 fw-bold">Resolvers</h5>
                        <small className="text-muted">Upstream Resolvers</small>
                    </div>
                </div>
            </Card.Header>

            <Card.Body className="p-4">
                <div id="resolverList" className="row g-3">
                    {resolvers.names.
                        sort((a, b) => a.localeCompare(b)).
                        map((v, k) => (
                            <div className="col-md-6 col-lg-4" key={k}>
                                <div className={styles.resolverItem} onClick={() => setShowdata({ show: true, name: v, new: false })}>
                                    <i className="bi bi-hdd-network me-2"></i>
                                    <span className="flex-grow-1 text-truncate">{v}</span>
                                    {v === 'bootstrap' && <i className="bi bi-patch-check-fill text-primary ms-2" title="System Default"></i>}
                                </div>
                            </div>
                        ))
                    }
                    <div className="col-md-6 col-lg-4">
                        <div className={`${styles.resolverItem} ${styles.newItemBox}`}>
                            <InputGroup className="w-100 align-items-center">
                                <Form.Control
                                    value={newdata.value}
                                    onChange={(e) => setNewdata({ value: e.target.value })}
                                    placeholder="New Resolver Name..."
                                    className={styles.seamlessInput}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
                                    autoComplete="off"
                                />
                                <Button
                                    variant='link'
                                    onClick={handleCreate}
                                    className={styles.seamlessBtn}
                                >
                                    <i className="bi bi-plus-lg" style={{ fontSize: '1.2rem' }} />
                                </Button>
                            </InputGroup>
                        </div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    </>
}


const ResolverModal: FC<{
    name: string, show: boolean, isNew?: boolean, onHide: (save?: boolean) => void, onDelete: (name: string) => void
}> = ({ name, show, isNew, onHide, onDelete }) => {
    const ctx = useContext(GlobalToastContext);
    const [saving, setSaving] = useState(false);

    const { data, error, isLoading, isValidating, mutate } = useSWR(name === "" ? undefined : ProtoPath(resolver.method.get),
        ProtoESFetcher(
            resolver.method.get,
            create(StringValueSchema, { value: name }),
            isNew ? create(dnsSchema, { host: "8.8.8.8", type: type.udp }) : undefined
        ),
        { shouldRetryOnError: false, keepPreviousData: false, revalidateOnFocus: false })

    useEffect(() => { mutate(); }, [name, isNew, mutate])

    const handleSave = () => {
        setSaving(true);
        FetchProtobuf(resolver.method.save,
            create(save_resolverSchema, { name: name, resolver: data }))
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("save successful")
                    onHide(true)
                } else {
                    ctx.Error(error.msg)
                    console.error(error.code, error.msg)
                }
            }).finally(() => setSaving(false));
    }

    return (
        <Modal show={show} onHide={() => onHide()} centered>
            <Modal.Header closeButton>
                <Modal.Title>{name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error ?
                    <Error statusCode={error.code} title={error.msg} /> :
                    isValidating || isLoading || !data ? <Loading /> :
                        <Single value={data} onChange={(e) => { mutate(e, false) }} />
                }
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={() => onHide()}>Close</Button>
                {name !== 'bootstrap' && !isNew &&
                    <Button variant="outline-danger" onClick={() => { onHide(false); onDelete(name); }}>
                        Remove
                    </Button>
                }
                <Button variant="primary" disabled={saving} onClick={handleSave}>
                    {saving ? <Spinner as="span" animation="border" size="sm" /> : (isNew ? "Create" : "Update")}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

const Single: FC<{ value: dns, onChange: (x: dns) => void }> = ({ value, onChange }) => {
    return <>
        <SettingInputText placeholder="e.g. tls://8.8.8.8:853" label='Upstream DNS' value={value.host} onChange={(v: string) => onChange({ ...value, host: v })} />
        <SettingTypeSelect label='Type' type={typeSchema} value={value.type} onChange={(v: number) => onChange({ ...value, type: v })} />
        <SettingInputText label='Subnet (Optional)' placeholder="e.g. 114.114.114.0/24" value={value.subnet} onChange={(v: string) => onChange({ ...value, subnet: v })} />
        <SettingInputText className='' label='SNI (Optional)' value={value.tlsServername} onChange={(v: string) => onChange({ ...value, tlsServername: v })} />
    </>
}
