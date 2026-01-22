"use client"

import { Card, CardBody, CardFooter, CardHeader, CardRowList, ErrorMsg, IconBox, MainContainer, SettingsBox } from '@/app/component/cardlist'
import { clone, create } from "@bufbuild/protobuf"
import { StringValueSchema } from "@bufbuild/protobuf/wkt"
import { FC, useContext, useEffect, useState } from "react"
import { Button, Modal, Spinner } from "react-bootstrap"
import useSWR from "swr"
import Loading, { Error } from "../../component/loading"
import { SettingSwitchCard } from "../../component/switch"
import { GlobalToastContext } from "../../component/toast"
import { FetchProtobuf, ProtoESFetcher, ProtoPath, useProtoSWR } from "../common/proto"
import { inbound as inboundService } from "../pbes/api/config_pb"
import { inboundSchema } from "../pbes/config/inbound_pb"
import { Inbound } from "./inboud"

const InboundModal: FC<{
    show: boolean,
    name: string,
    onHide: (save?: boolean) => void,
    onDelete: () => void,
    isNew?: boolean,
}> = ({ show, name, onHide, onDelete, isNew }) => {
    const ctx = useContext(GlobalToastContext);
    const [saving, setSaving] = useState(false);

    const { data: inbound, error, isLoading, isValidating, mutate } = useSWR(
        name === "" ? undefined : ProtoPath(inboundService.method.get),
        ProtoESFetcher(
            inboundService.method.get,
            create(StringValueSchema, { value: name }),
            isNew ? create(inboundSchema, { name: name, enabled: false }) : undefined
        ),
        { shouldRetryOnError: false, keepPreviousData: false, revalidateOnFocus: false }
    )

    useEffect(() => { mutate(); }, [name, isNew, mutate])

    const handleSave = () => {
        if (!inbound) return;
        setSaving(true);
        inbound.name = name;
        FetchProtobuf(inboundService.method.save, inbound)
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("Save successful");
                    onHide(true);
                } else {
                    ctx.Error(error.msg);
                }
            })
            .finally(() => setSaving(false));
    };

    return (
        <Modal show={show} onHide={() => onHide()} centered size='xl' scrollable>
            <Modal.Header closeButton className="border-bottom-0 pb-0">
                <Modal.Title className="fw-bold">{isNew ? "New Inbound" : `Edit Inbound: ${name}`}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="pt-2">
                {error ? <ErrorMsg msg={error.msg} code={error.code} raw={error.raw} /> : isValidating || isLoading || !inbound ? (
                    <Loading />
                ) : (
                    <SettingsBox>
                        {/* Assuming the Inbound internal component handles its own rows/fields */}
                        <Inbound inbound={inbound} onChange={(x) => mutate(clone(inboundSchema, x), false)} />
                    </SettingsBox>
                )}
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-between">
                <div>
                    {!isNew && (
                        <Button variant="outline-danger" onClick={() => { onHide(); onDelete(); }}>
                            <i className="bi bi-trash me-2"></i>Delete
                        </Button>
                    )}
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-secondary" onClick={() => onHide()}>Cancel</Button>
                    <Button variant="primary" disabled={saving || !inbound} onClick={handleSave}>
                        {saving ? <Spinner size="sm" animation="border" /> : <><i className="bi bi-check-lg me-1"></i> Save</>}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}

const InboundItem: FC<{ name: string, }> = ({ name }) => {
    return <>
        <div className="d-flex align-items-center flex-grow-1 overflow-hidden">
            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: '36px', height: '36px' }}>
                <i className="bi bi-box-arrow-in-right"></i>
            </div>
            <span className="text-truncate fw-medium">{name}</span>
        </div>
        <i className="bi bi-chevron-right text-muted opacity-25"></i>
    </>
}

function InboudComponent() {
    const ctx = useContext(GlobalToastContext);
    const { data: inbounds, error, isLoading, mutate } = useProtoSWR(inboundService.method.list);

    const [saving, setSaving] = useState(false);
    const [showdata, setShowdata] = useState({ show: false, name: "", new: false });

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || inbounds === undefined) return <Loading />

    const deleteInbound = (name: string) => {
        FetchProtobuf(inboundService.method.remove, create(StringValueSchema, { value: name }))
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("Removed successful");
                    mutate();
                } else {
                    ctx.Error(error.msg);
                }
            });
    }

    const handleApply = () => {
        setSaving(true);
        FetchProtobuf(inboundService.method.apply, inbounds)
            .then(async ({ error }) => {
                if (error === undefined) ctx.Info("Settings applied successfully");
                else ctx.Error(error.msg);
                mutate();
            })
            .finally(() => setSaving(false));
    };

    const handleCreate = (v: string) => {
        if (!inbounds.names.includes(v)) setShowdata({ show: true, name: v, new: true });
    };

    return (
        <MainContainer>
            <InboundModal
                show={showdata.show}
                name={showdata.name}
                isNew={showdata.new}
                onHide={(save) => {
                    if (save) mutate();
                    setShowdata(prev => ({ ...prev, show: false }));
                }}
                onDelete={() => deleteInbound(showdata.name)}
            />

            {/* 1. Global Settings Card */}
            <Card>
                <CardHeader>
                    <IconBox icon="gear-fill" color="#f59e0b" title='Inbound Configuration' description="Global interception & sniffing" />
                </CardHeader>
                <CardBody>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <SettingSwitchCard
                                label="DNS Hijack"
                                description="Intersects DNS requests"
                                checked={inbounds.hijackDns}
                                onChange={() => mutate({ ...inbounds, hijackDns: !inbounds.hijackDns }, false)}
                            />
                        </div>
                        <div className="col-md-4">
                            <SettingSwitchCard
                                label="FakeDNS"
                                description="Use virtual IP logic"
                                checked={inbounds.hijackDnsFakeip}
                                onChange={() => mutate({ ...inbounds, hijackDnsFakeip: !inbounds.hijackDnsFakeip }, false)}
                            />
                        </div>
                        <div className="col-md-4">
                            <SettingSwitchCard
                                label="Traffic Sniffing"
                                description="Inspects protocol types"
                                checked={!!inbounds.sniff?.enabled}
                                onChange={() => mutate({ ...inbounds, sniff: { ...inbounds.sniff, enabled: !inbounds.sniff?.enabled } }, false)}
                            />
                        </div>
                    </div>
                </CardBody>
                <CardFooter>
                    <Button variant="primary" disabled={saving} onClick={handleApply}>
                        {saving ? <Spinner size="sm" animation="border" /> : <><i className="bi bi-save me-1"></i> Apply Settings</>}
                    </Button>
                </CardFooter>
            </Card>


            {/* 2. Inbound Service List Card */}
            <CardRowList
                items={inbounds.names.sort((a, b) => a.localeCompare(b))}
                onClickItem={(name) => setShowdata({ show: true, name, new: false })}
                onAddNew={handleCreate}
                renderListItem={(name) => (<InboundItem name={name} />)}
                header={
                    <IconBox icon="door-open" color="primary" title="Entry Points" description={`${inbounds.names.length} active inbounds`} />
                }
                adding={saving}
            />
        </MainContainer>
    );
}

export default InboudComponent;