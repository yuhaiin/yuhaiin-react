"use client"

import { Button } from '@/component/v2/button';
import { CardRowList, IconBox, MainContainer } from '@/component/v2/card';
import { SettingInputVertical, SettingTypeSelect } from '@/component/v2/forms';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { create } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import { Check, ChevronRight, Layers, Network, ShieldCheck, Trash } from 'lucide-react';
import { FC, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { FetchProtobuf, ProtoESFetcher, ProtoPath, useProtoSWR } from "../../../common/proto";
import { ConfirmModal } from "../../../component/v2/confirm";
import Loading, { Error } from "../../../component/v2/loading";
import { resolver, save_resolverSchema } from "../../pbes/api/config_pb";
import { dns, dnsSchema, type, typeSchema } from "../../pbes/config/dns_pb";
import { Fakedns } from "./fakedns";
import { Hosts } from "./hosts";
import { Server } from "./server";

export default function ResolverComponent() {
    return (
        <MainContainer>
            <div className="flex flex-col gap-6">
                <Resolver />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <Hosts />
                    </div>
                    <div>
                        <Fakedns />
                    </div>
                </div>

                <div>
                    <Server />
                </div>
            </div>
        </MainContainer>
    );
}

function Resolver() {
    const ctx = useContext(GlobalToastContext);
    const { data: resolvers, error, isLoading, mutate } = useProtoSWR(resolver.method.list)
    const [showdata, setShowdata] = useState({ show: false, name: "", new: false });
    const [confirm, setConfirm] = useState<{ show: boolean, name: string }>({ show: false, name: "" });

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

    const handleCreate = (v: string) => {
        if (resolvers.names.includes(v)) return;

        if (showdata.name === v && showdata.new) {
            setShowdata(prev => { return { ...prev, show: true } })
        } else {
            setShowdata({ show: true, name: v, new: true })
        }
    };

    return <>
        <ConfirmModal
            show={confirm.show}
            title="Delete Resolver"
            content={<>Are you sure to delete <span className="font-bold text-red-500">{confirm.name}</span>?</>}
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
                }
                setShowdata(prev => { return { ...prev, show: false } })
            }}
            onDelete={(name) => setConfirm({ show: true, name: name })}
        />

        <CardRowList
            items={resolvers.names.sort((a, b) => a.localeCompare(b))}
            renderListItem={(v) =>
                <>
                    <Network className="mr-4 text-gray-500 dark:text-gray-400" size={20} />
                    <span className="flex-grow truncate font-medium">{v}</span>
                    {v === 'bootstrap' && <ShieldCheck className="text-blue-500 ml-2" size={16} title="System Default" />}
                    <ChevronRight className="text-gray-500 dark:text-gray-400 opacity-25 ml-2" size={16} />
                </>
            }
            onClickItem={(v) => setShowdata({ show: true, name: v, new: false })}
            onAddNew={handleCreate}
            header={<IconBox icon={Layers} color="#3b82f6" title='Resolvers' description='Upstream DNS Resolvers' />}
        />
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
                mutate();
            }).finally(() => setSaving(false));
    }

    return (
        <Modal open={show} onOpenChange={(open) => !open && onHide()}>
            <ModalContent>
                <ModalHeader closeButton>
                    <ModalTitle>{name}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    {error ?
                        <Error statusCode={error.code} title={error.msg} /> :
                        isValidating || isLoading || !data ? <Loading /> :
                            <Single value={data} onChange={(e) => { mutate(e, false) }} />
                    }
                </ModalBody>
                <ModalFooter className="flex justify-between">
                    <div>
                        {name !== 'bootstrap' && !isNew &&
                            <Button variant="outline-danger" onClick={() => { onHide(false); onDelete(name); }}>
                                <Trash className="mr-2" size={16} />Delete
                            </Button>
                        }
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => onHide()}>Cancel</Button>
                        <Button disabled={saving} onClick={handleSave}>
                            {saving ? <Spinner size="sm" /> : <><Check className="mr-2" size={16} />{isNew ? "Create" : "Save"}</>}
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

const Single: FC<{ value: dns, onChange: (x: dns) => void }> = ({ value, onChange }) => {
    return (
        <div className="flex flex-col">
            <SettingInputVertical
                placeholder="e.g. tls://8.8.8.8:853"
                label='Upstream DNS'
                value={value.host}
                onChange={(v: string) => onChange({ ...value, host: v })}
            />
            <SettingTypeSelect
                label='Type'
                type={typeSchema}
                value={value.type}
                onChange={(v: number) => onChange({ ...value, type: v })}
            />
            <SettingInputVertical
                label='Subnet (Optional)'
                placeholder="e.g. 114.114.114.0/24"
                value={value.subnet}
                onChange={(v: string) => onChange({ ...value, subnet: v })}
            />
            <SettingInputVertical
                label='SNI (Optional)'
                value={value.tlsServername}
                onChange={(v: string) => onChange({ ...value, tlsServername: v })}
            />
        </div>
    )
}
