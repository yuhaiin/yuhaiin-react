"use client"

import { APIError } from "@/api/client";
import { createResolver, deleteResolver, getResolver, listResolvers, saveResolver } from "@/api/resolvers";
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { CardRowList, IconBox, MainContainer, SettingsBox } from '@/component/v2/card';
import { ConfirmModal } from "@/component/v2/confirm";
import { SettingInputVertical, SettingSelectVertical, SwitchCard } from "@/component/v2/forms";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { createDefaultResolver, normalizeResolver, Resolver, ResolverType } from "@/contract/resolver";
import { Check, ChevronRight, Layers, Network, Plus, Trash } from 'lucide-react';
import { FC, useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import Loading, { Error as ErrorDisplay } from "../../../component/v2/loading";
import { Fakedns } from "./fakedns";
import { Hosts } from "./hosts";
import { Server } from "./server";

const PAGE_SIZE = 8;

function errorOf(error: unknown): APIError | undefined {
    if (!error) return undefined;
    if (typeof error === "object" && "code" in error && "msg" in error) return error as APIError;
    return { code: 500, msg: error instanceof Error ? error.message : String(error) };
}

const resolverTypes: ResolverType[] = ["udp", "tcp", "doh", "dot", "doq", "doh3", "system"];

const ResolverItem: FC<{ item: Resolver }> = ({ item }) => {
    return (
        <>
            <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(190px,0.34fr)_minmax(0,1fr)] md:items-center">
                <div className="flex min-w-0 items-center">
                    <Network className="mr-4 shrink-0 text-ui-muted" size={20} />
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate font-medium">{item.id}</span>
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
                        <span className="truncate font-mono font-medium text-ui-fg">{item.tlsServerName || "-"}</span>
                    </div>
                </div>
            </div>
            <ChevronRight className="ml-2 shrink-0 text-ui-muted opacity-25" size={16} />
        </>
    )
}

export default function ResolverComponent() {
    return (
        <MainContainer>
            <div className="flex flex-col gap-6">
                <ResolverList />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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

function ResolverList() {
    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1);
    const [showdata, setShowdata] = useState({ show: false, id: "", new: false });
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: "" });
    const { data, error, isLoading, mutate } = useSWR(
        `/api/v2/resolvers?page=${page}&pageSize=${PAGE_SIZE}`,
        () => listResolvers({ page, pageSize: PAGE_SIZE }),
        { keepPreviousData: true },
    );

    const apiError = errorOf(error);
    const items = useMemo(() => data?.items ?? [], [data?.items]);

    if (apiError) return <Loading code={apiError.code}>{apiError.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const handleCreate = () => setShowdata({ show: true, id: "", new: true });

    const handleDelete = (id: string) => {
        deleteResolver(id)
            .then(() => {
                ctx.Info("remove successful");
                setShowdata((prev) => ({ ...prev, show: false }));
                void mutate();
            })
            .catch((err: unknown) => {
                const apiErr = errorOf(err);
                ctx.Error(apiErr?.msg ?? "Remove failed");
            });
    };

    return <>
        <ConfirmModal
            show={confirmDelete.show}
            title="Delete Resolver"
            content={<>Are you sure to delete <span className="font-bold text-red-500">{confirmDelete.id}</span>?</>}
            onOk={() => handleDelete(confirmDelete.id)}
            onHide={() => setConfirmDelete({ show: false, id: "" })}
        />

        <ResolverModal
            id={showdata.id}
            show={showdata.show}
            isNew={showdata.new}
            onHide={(save) => {
                if (save) void mutate();
                setShowdata(prev => ({ ...prev, show: false }));
            }}
            onDelete={(id) => setConfirmDelete({ show: true, id })}
        />

        <CardRowList
            layout="list"
            paginated
            pageSize={PAGE_SIZE}
            currentPage={data.page.page || page}
            totalItems={data.page.total}
            onPageChange={setPage}
            items={items}
            getKey={(item) => item.id}
            renderListItem={(item) => <ResolverItem item={item} />}
            onClickItem={(item) => setShowdata({ show: true, id: item.id, new: false })}
            header={
                <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <IconBox icon={Layers} tone="primary" title='Resolvers' description='Upstream DNS Resolvers' />
                    <Button size="sm" onClick={handleCreate}><Plus size={16} className="mr-1" /> Add</Button>
                </div>
            }
        />
    </>
}

const ResolverModal: FC<{
    id: string,
    show: boolean,
    isNew?: boolean,
    onHide: (save?: boolean) => void,
    onDelete: (id: string) => void
}> = ({ id, show, isNew, onHide, onDelete }) => {
    const ctx = useContext(GlobalToastContext);
    const [saving, setSaving] = useState(false);
    const [draft, setDraft] = useState<Resolver>(() => createDefaultResolver(id));
    const shouldFetch = show && id !== "" && !isNew;
    const { data, error, isLoading, mutate } = useSWR(
        shouldFetch ? `/api/v2/resolvers/${id}` : null,
        () => getResolver(id),
        { shouldRetryOnError: false, keepPreviousData: false, revalidateOnFocus: false },
    );

    useEffect(() => {
        if (!show) return;
        setDraft(createDefaultResolver(id));
    }, [show, id]);

    useEffect(() => {
        if (data) setDraft(normalizeResolver(data));
    }, [data]);

    const apiError = errorOf(error);
    const resolver = isNew ? draft : data ? draft : undefined;

    const handleSave = () => {
        if (!resolver) return;
        setSaving(true);
        const next = normalizeResolver({ ...resolver, id });
        const request = isNew ? createResolver(next) : saveResolver(next);
        request
            .then((saved) => {
                ctx.Info("save successful");
                void mutate(saved, false);
                onHide(true);
            })
            .catch((err: unknown) => {
                const apiErr = errorOf(err);
                ctx.Error(apiErr?.msg ?? "Save failed");
            })
            .finally(() => setSaving(false));
    }

    return (
        <Modal open={show} onOpenChange={(open) => !open && onHide()}>
            <ModalContent className="max-w-[760px]">
                <ModalHeader closeButton>
                    <ModalTitle className="flex items-center gap-2">
                        <Network size={18} />
                        {id}
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    {apiError ?
                        <ErrorDisplay statusCode={apiError.code} title={apiError.msg} /> :
                        isLoading || !resolver ? <Loading /> :
                            <SettingsBox>
                                <ResolverEditor value={resolver} onChange={setDraft} />
                            </SettingsBox>
                    }
                </ModalBody>
                <ModalFooter className="flex justify-between">
                    <div>
                        {id !== 'bootstrap' && !isNew &&
                            <Button variant="outline-danger" onClick={() => { onHide(false); onDelete(id); }}>
                                <Trash className="mr-2" size={16} />Delete
                            </Button>
                        }
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => onHide()}>Cancel</Button>
                        <Button disabled={saving || !resolver} onClick={handleSave}>
                            {saving ? <Spinner size="sm" /> : <><Check className="mr-2" size={16} />{isNew ? "Create" : "Save"}</>}
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

const ResolverEditor: FC<{ value: Resolver, onChange: (x: Resolver) => void }> = ({ value, onChange }) => {
    const patch = (patchValue: Partial<Resolver>) => onChange(normalizeResolver({ ...value, ...patchValue }));
    const endpoint = resolverEndpointMeta(value.type);
    const hasTLSName = ["tcp", "doh", "dot", "doq", "doh3"].includes(value.type);

    return (
        <div className="grid gap-4">
            <div className="rounded-ui-lg border border-ui-border bg-ui-surface-muted p-4">
                <div className="mb-3 font-bold">Identity</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <SettingInputVertical label="ID" value={value.id} onChange={(id) => patch({ id })} />
                    <SettingSelectVertical
                        label="Type"
                        value={value.type}
                        values={resolverTypes}
                        onChange={(type) => patch({ type: type as ResolverType, system: type === "system", host: type === "system" ? "system default" : value.host })}
                    />
                </div>
            </div>

            <div className="rounded-ui-lg border border-ui-border bg-ui-surface-muted p-4">
                <div className="mb-3 font-bold">Endpoint</div>
                {value.type === "system" ? (
                    <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">Uses the operating system resolver.</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SettingInputVertical label={endpoint.label} value={value.host} onChange={(host) => patch({ host })} placeholder={endpoint.placeholder} />
                        <SettingInputVertical label="Subnet" value={value.subnet ?? ""} onChange={(subnet) => patch({ subnet })} placeholder="Optional ECS subnet" />
                        {hasTLSName && <SettingInputVertical label="TLS Server Name" value={value.tlsServerName ?? ""} onChange={(tlsServerName) => patch({ tlsServerName })} placeholder="dns.example" />}
                    </div>
                )}
            </div>

            <SwitchCard label="System Resolver" checked={Boolean(value.system)} onCheckedChange={(system) => patch({ system, type: system ? "system" : "udp", host: system ? "system default" : value.host })} />
        </div>
    )
}

function resolverEndpointMeta(type: ResolverType): { label: string; placeholder: string } {
    switch (type) {
        case "doh":
        case "doh3":
            return { label: "DoH URL", placeholder: "https://dns.example/dns-query" };
        case "dot":
            return { label: "DoT Address", placeholder: "dns.example:853" };
        case "doq":
            return { label: "DoQ Address", placeholder: "dns.example:853" };
        case "tcp":
            return { label: "TCP Address", placeholder: "8.8.8.8:53" };
        case "udp":
            return { label: "UDP Address", placeholder: "8.8.8.8:53" };
        case "system":
            return { label: "System Resolver", placeholder: "system default" };
    }
}
