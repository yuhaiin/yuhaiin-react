"use client"

import { Button } from "@/component/v2/button";
import { Card, CardBody, CardFooter, CardHeader, ErrorMsg, IconBox, MainContainer, SettingsBox } from '@/component/v2/card';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { Spinner } from "@/component/v2/spinner";
import { SwitchCard } from "@/component/v2/switch";
import { clone, create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import { Check, ChevronRight, DoorOpen, LogIn, Plus, Save, Settings, Trash } from "lucide-react";
import { FC, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { FetchProtobuf, ProtoESFetcher, ProtoPath, useProtoSWR } from "../../common/proto";
import Loading, { Error as ErrorDisplay } from "../../component/v2/loading";
import { GlobalToastContext } from "../../component/v2/toast";
import { inbound as inboundService } from "../pbes/api/config_pb";
import { inboundSchema } from "../pbes/config/inbound_pb";
import { Inbound } from "./inboud";

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
        <Modal open={show} onOpenChange={(open) => !open && onHide()}>
            <ModalContent style={{ maxWidth: '800px' }}>
                <ModalHeader closeButton className="border-bottom-0 pb-0">
                    <ModalTitle className="fw-bold">{name}</ModalTitle>
                </ModalHeader>
                <ModalBody className="pt-2">
                    {error ? <ErrorMsg msg={error.msg} code={error.code} raw={error.raw} /> : isValidating || isLoading || !inbound ? (
                        <Loading />
                    ) : (
                        <SettingsBox>
                            <Inbound inbound={inbound} onChange={(x) => mutate(clone(inboundSchema, x), false)} />
                        </SettingsBox>
                    )}
                </ModalBody>
                <ModalFooter className="d-flex justify-content-between">
                    <div>
                        {!isNew && (
                            <Button variant="outline-danger" onClick={() => { onDelete(); }}>
                                <Trash className="me-2" />Delete
                            </Button>
                        )}
                    </div>
                    <div className="d-flex gap-2">
                        <Button onClick={() => onHide()}>Cancel</Button>
                        <Button disabled={saving || !inbound} onClick={handleSave}>
                            {saving ? <Spinner size="sm" /> : <><Check className="me-1" /> Save</>}
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

const InboundItem: FC<{ name: string, }> = ({ name }) => {
    return <>
        <div className="d-flex align-items-center flex-grow-1 overflow-hidden">
            <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: '36px', height: '36px' }}>
                <LogIn />
            </div>
            <span className="text-truncate fw-medium">{name}</span>
        </div>
        <ChevronRight className="text-muted opacity-25" />
    </>
}

function InboudComponent() {
    const ctx = useContext(GlobalToastContext);
    const { data: inbounds, error, isLoading, mutate } = useProtoSWR(inboundService.method.list);

    const [saving, setSaving] = useState(false);
    const [showdata, setShowdata] = useState({ show: false, name: "", new: false });

    if (error !== undefined) return <ErrorDisplay statusCode={error.code} title={error.msg} />
    if (isLoading || inbounds === undefined) return <Loading />

    const deleteInbound = (name: string) => {
        FetchProtobuf(inboundService.method.remove, create(StringValueSchema, { value: name }))
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("Removed successful");
                    mutate();
                    setShowdata(prev => ({ ...prev, show: false })); // Ensure modal closes on delete
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
            <Card className="mb-3">
                <CardHeader>
                    <IconBox icon={Settings} color="#f59e0b" title='Inbound Configuration' description="Global interception & sniffing" />
                </CardHeader>
                <CardBody>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <SwitchCard
                                label="DNS Hijack"
                                description="Intersects DNS requests"
                                checked={inbounds.hijackDns}
                                onCheckedChange={() => mutate({ ...inbounds, hijackDns: !inbounds.hijackDns }, false)}
                                className="p-3 rounded-3 h-100 bg-body-tertiary"
                            />
                        </div>
                        <div className="col-md-4">
                            <SwitchCard
                                label="FakeDNS"
                                description="Use virtual IP logic"
                                checked={inbounds.hijackDnsFakeip}
                                onCheckedChange={() => mutate({ ...inbounds, hijackDnsFakeip: !inbounds.hijackDnsFakeip }, false)}
                                className="p-3 rounded-3 h-100 bg-body-tertiary"
                            />
                        </div>
                        <div className="col-md-4">
                            <SwitchCard
                                label="Traffic Sniffing"
                                description="Inspects protocol types"
                                checked={!!inbounds.sniff?.enabled}
                                onCheckedChange={() => mutate({ ...inbounds, sniff: { ...inbounds.sniff, enabled: !inbounds.sniff?.enabled } }, false)}
                                className="p-3 rounded-3 h-100 bg-body-tertiary"
                            />
                        </div>
                    </div>
                </CardBody>
                <CardFooter className="d-flex justify-content-end">
                    <Button disabled={saving} onClick={handleApply}>
                        {saving ? <Spinner size="sm" /> : <><Save className="me-1" /> Apply Settings</>}
                    </Button>
                </CardFooter>
            </Card>

            {/* 2. Inbound Service List Card */}
            <Card>
                <CardHeader>
                    <IconBox icon={DoorOpen} color="#0d6efd" title="Entry Points" description={`${inbounds.names.length} active inbounds`} />
                </CardHeader>
                <CardBody>
                    <div className="row g-3">
                        {
                            inbounds.names.sort((a, b) => a.localeCompare(b)).map((name, index) => (
                                <div className="col-md-6 col-lg-4" key={index}>
                                    <div
                                        className="p-3 rounded-3 h-100 bg-body-tertiary d-flex align-items-center justify-content-between cursor-pointer"
                                        onClick={() => setShowdata({ show: true, name, new: false })}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Enter') setShowdata({ show: true, name, new: false }) }}
                                    >
                                        <InboundItem name={name} />
                                    </div>
                                </div>
                            ))
                        }

                        {/* Add New Item Input */}
                        <div className="col-md-6 col-lg-4">
                            <div className="p-3 rounded-3 h-100 bg-body-tertiary d-flex align-items-center">
                                <form
                                    className="d-flex w-100 gap-2"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const form = e.target as HTMLFormElement;
                                        const input = form.elements.namedItem('newInbound') as HTMLInputElement;
                                        if (input.value) {
                                            handleCreate(input.value);
                                            input.value = "";
                                        }
                                    }}
                                >
                                    <input
                                        name="newInbound"
                                        className="form-control form-control-sm bg-transparent border-0 shadow-none px-0"
                                        placeholder="Create new..."
                                        autoComplete="off"
                                    />
                                    <Button size="sm" type="submit" disabled={saving} className="border-0 bg-transparent text-primary p-0">
                                        <Plus className="fs-5" />
                                    </Button>
                                </form>
                            </div>
                        </div>

                    </div>
                    {inbounds.names.length === 0 && (
                        <div className="text-center text-muted p-3">
                            No records found.
                        </div>
                    )}
                </CardBody>
            </Card>
        </MainContainer>
    );
}

export default InboudComponent;