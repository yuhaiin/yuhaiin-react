"use client"

import { Button } from "@/component/v2/button";
import { Card, CardBody, CardFooter, CardHeader, ErrorMsg, IconBox, ListItem, MainContainer, SettingsBox } from '@/component/v2/card';
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
                <ModalHeader closeButton className="border-b-0 pb-0">
                    <ModalTitle className="font-bold">{name}</ModalTitle>
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
                <ModalFooter className="flex justify-between">
                    <div>
                        {!isNew && (
                            <Button variant="outline-danger" onClick={() => { onDelete(); }}>
                                <Trash className="mr-2" size={16} />Delete
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => onHide()}>Cancel</Button>
                        <Button disabled={saving || !inbound} onClick={handleSave}>
                            {saving ? <Spinner size="sm" /> : <><Check className="mr-1" size={16} /> Save</>}
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

const InboundItem: FC<{ name: string, }> = ({ name }) => {
    return <>
        <div className="flex items-center grow overflow-hidden">
            <div className="bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center mr-4 shrink-0 w-9 h-9">
                <LogIn size={20} />
            </div>
            <span className="truncate font-medium">{name}</span>
        </div>
        <ChevronRight className="text-gray-500 opacity-25" size={16} />
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
            <Card className="mb-4">
                <CardHeader>
                    <IconBox icon={Settings} color="#f59e0b" title='Inbound Configuration' description="Global interception & sniffing" />
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <SwitchCard
                                label="DNS Hijack"
                                description="Intersects DNS requests"
                                checked={inbounds.hijackDns}
                                onCheckedChange={() => mutate({ ...inbounds, hijackDns: !inbounds.hijackDns }, false)}
                                className="p-4 rounded-lg h-full bg-gray-100 dark:bg-[#2b2b40]"
                            />
                        </div>
                        <div>
                            <SwitchCard
                                label="FakeDNS"
                                description="Use virtual IP logic"
                                checked={inbounds.hijackDnsFakeip}
                                onCheckedChange={() => mutate({ ...inbounds, hijackDnsFakeip: !inbounds.hijackDnsFakeip }, false)}
                                className="p-4 rounded-lg h-full bg-gray-100 dark:bg-[#2b2b40]"
                            />
                        </div>
                        <div>
                            <SwitchCard
                                label="Traffic Sniffing"
                                description="Inspects protocol types"
                                checked={!!inbounds.sniff?.enabled}
                                onCheckedChange={() => mutate({ ...inbounds, sniff: { ...inbounds.sniff, enabled: !inbounds.sniff?.enabled } }, false)}
                                className="p-4 rounded-lg h-full bg-gray-100 dark:bg-[#2b2b40]"
                            />
                        </div>
                    </div>
                </CardBody>
                <CardFooter className="flex justify-end">
                    <Button disabled={saving} onClick={handleApply}>
                        {saving ? <Spinner size="sm" /> : <><Save className="mr-1" size={16} /> Apply Settings</>}
                    </Button>
                </CardFooter>
            </Card>

            {/* 2. Inbound Service List Card */}
            <Card>
                <CardHeader>
                    <IconBox icon={DoorOpen} color="#0d6efd" title="Entry Points" description={`${inbounds.names.length} active inbounds`} />
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {
                            inbounds.names.sort((a, b) => a.localeCompare(b)).map((name) => (
                                <div key={name} className="h-full">
                                    <ListItem
                                        className="h-full justify-between p-4"
                                        onClick={() => setShowdata({ show: true, name, new: false })}
                                    >
                                        <InboundItem name={name} />
                                    </ListItem>
                                </div>
                            ))
                        }

                        {/* Add New Item Input */}
                        <div className="h-full">
                            <ListItem className="h-full p-4 border-dashed border-sidebar-border bg-[var(--bs-secondary-bg)]">
                                <form
                                    className="flex w-full gap-2"
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
                                        className="w-full bg-transparent border-none shadow-none px-0 outline-none text-sm text-[var(--input-text-color)] placeholder:text-[var(--input-placeholder)]"
                                        placeholder="Create new..."
                                        autoComplete="off"
                                    />
                                    <Button size="sm" type="submit" disabled={saving} className="border-none bg-transparent text-blue-600 p-0 hover:bg-transparent hover:text-blue-500">
                                        <Plus size={20} />
                                    </Button>
                                </form>
                            </ListItem>
                        </div>
                    </div>
                    {inbounds.names.length === 0 && (
                        <div className="text-center text-gray-500 p-4">
                            No records found.
                        </div>
                    )}
                </CardBody>
            </Card>
        </MainContainer>
    );
}

export default InboudComponent;