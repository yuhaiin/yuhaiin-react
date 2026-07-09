"use client"

import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { CardRowList, IconBox, MainContainer } from '@/component/v2/card';
import { SettingInputVertical, SettingTypeSelect } from '@/component/v2/forms';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { create } from "@/common/plain";
import { StringValueSchema } from "@/common/plain";
import { Check, ChevronRight, Layers, Network, Trash } from 'lucide-react';
import { FC, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { FetchHTTP, HttpFetcher, ApiPath, useHttpSWR, useHttpSWRRequest } from "../../../common/http";
import { ConfirmModal } from "../../../component/v2/confirm";
import Loading, { Error } from "../../../component/v2/loading";
import { resolver, resolver_item } from "@/common/api";
import { dns, dnsSchema, type, typeSchema } from "../../schema/config/dns";
import { Fakedns } from "./fakedns";
import { Hosts } from "./hosts";
import { Server } from "./server";

const PAGE_SIZE = 8;

const ResolverItem: FC<{ item: resolver_item }> = ({ item }) => {
    return (
        <>
            <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(190px,0.34fr)_minmax(0,1fr)] md:items-center">
                <div className="flex min-w-0 items-center">
                    <Network className="mr-4 text-gray-500 dark:text-gray-400 shrink-0" size={20} />
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate font-medium">{item.name}</span>
                        <Badge variant="info" className="shrink-0">{item.type}</Badge>
                        {item.system && <Badge variant="primary" className="shrink-0">System</Badge>}
                    </div>
                </div>
                <div className="grid min-w-0 gap-2 text-xs text-ui-muted sm:grid-cols-3">
                    <div className="min-w-0">
                        <span className="mr-1 text-ui-muted/70">Host</span>
                        <span className="truncate font-mono font-medium text-ui-fg">{item.host || "-"}</span>
                    </div>
                    <div className="min-w-0">
                        <span className="mr-1 text-ui-muted/70">Subnet</span>
                        <span className="truncate font-mono font-medium text-ui-fg">{item.subnet || "-"}</span>
                    </div>
                    <div className="min-w-0">
                        <span className="mr-1 text-ui-muted/70">TLS</span>
                        <span className="truncate font-mono font-medium text-ui-fg">{item.tlsServername || "-"}</span>
                    </div>
                </div>
            </div>
            <ChevronRight className="text-gray-500 dark:text-gray-400 opacity-25 ml-2 shrink-0" size={16} />
        </>
    )
}

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
    const [page, setPage] = useState(1);
    const { data: resolvers, error, isLoading, mutate } = useHttpSWRRequest(
        resolver.method.list_page,
        { page, pageSize: PAGE_SIZE },
    )
    const { data: allResolvers, mutate: mutateAllResolvers } = useHttpSWR(resolver.method.list, { revalidateOnFocus: false })
    const [showdata, setShowdata] = useState({ show: false, name: "", new: false });
    const [confirm, setConfirm] = useState<{ show: boolean, name: string }>({ show: false, name: "" });

    if (error !== undefined) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || resolvers === undefined) return <Loading />
    const resolverItems: resolver_item[] = resolvers.items.length > 0
        ? resolvers.items
        : resolvers.names.map((name) => ({ name, type: "", host: "", subnet: "", tlsServername: "", system: name === "bootstrap" }));

    const deleteResolver = (name: string) => {
        FetchHTTP(resolver.method.remove, create(StringValueSchema, { value: name }),)
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("remove successful")
                    mutate()
                    mutateAllResolvers()
                } else {
                    ctx.Error(error.msg)
                    console.error(error.code, error.msg)
                }
            })
    }

    const handleCreate = (v: string) => {
        if (allResolvers?.names.includes(v) || resolvers.names.includes(v)) return;

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
                    mutateAllResolvers();
                }
                setShowdata(prev => { return { ...prev, show: false } })
            }}
            onDelete={(name) => setConfirm({ show: true, name: name })}
        />

        <CardRowList
            layout="list"
            paginated
            pageSize={PAGE_SIZE}
            currentPage={resolvers.page?.page || page}
            totalItems={resolvers.page?.total ?? resolvers.names.length}
            onPageChange={setPage}
            items={resolverItems}
            getKey={(item) => item.name}
            renderListItem={(item) => <ResolverItem item={item} />}
            onClickItem={(item) => setShowdata({ show: true, name: item.name, new: false })}
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

    const { data, error, isLoading, isValidating, mutate } = useSWR(name === "" ? undefined : ApiPath(resolver.method.get),
        HttpFetcher(
            resolver.method.get,
            create(StringValueSchema, { value: name }),
            isNew ? create(dnsSchema, { host: "8.8.8.8", type: type.udp }) : undefined
        ),
        { shouldRetryOnError: false, keepPreviousData: false, revalidateOnFocus: false })

    useEffect(() => { mutate(); }, [name, isNew, mutate])

    const handleSave = () => {
        setSaving(true);
        FetchHTTP(resolver.method.save,
            { name: name, resolver: data })
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
