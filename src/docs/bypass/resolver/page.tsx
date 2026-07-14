"use client"

import { APIError } from "@/api/client";
import { createResolver, deleteResolver, getResolver, listResolvers, saveResolver } from "@/api/resolvers";
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, IconBox, MainContainer, SettingsBox } from '@/component/v2/card';
import { ConfirmModal } from "@/component/v2/confirm";
import { SettingInputVertical, SettingSelectVertical, SwitchCard } from "@/component/v2/forms";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { Pagination } from "@/component/v2/pagination";
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { createDefaultResolver, normalizeResolver, Resolver, ResolverType } from "@/contract/resolver";
import clsx from "clsx";
import {
    Check,
    Globe2,
    Layers,
    Network,
    Plus,
    Shield,
    Trash,
} from 'lucide-react';
import type { ElementType } from "react";
import { FC, useContext, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import Loading, { Error as ErrorDisplay } from "../../../component/v2/loading";
import { Fakedns } from "./fakedns";
import { Hosts } from "./hosts";
import { Server } from "./server";

const PAGE_SIZE = 12;

function errorOf(error: unknown): APIError | undefined {
    if (!error) return undefined;
    if (typeof error === "object" && "code" in error && "msg" in error) return error as APIError;
    return { code: 500, msg: error instanceof Error ? error.message : String(error) };
}

const resolverTypes: ResolverType[] = ["udp", "tcp", "doh", "dot", "doq", "doh3", "system"];

type BadgeVariant = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "muted";

function resolverTypeVisual(type?: string): {
    icon: ElementType;
    tone: string;
    soft: string;
    badge: BadgeVariant;
} {
    switch ((type || "").toLowerCase()) {
        case "doh":
        case "doh3":
            return {
                icon: Globe2,
                tone: "text-ui-info",
                soft: "bg-ui-info-soft border-ui-info/15",
                badge: "info",
            };
        case "dot":
        case "doq":
            return {
                icon: Shield,
                tone: "text-ui-success",
                soft: "bg-ui-success-soft border-ui-success/15",
                badge: "success",
            };
        case "tcp":
            return {
                icon: Network,
                tone: "text-ui-warning",
                soft: "bg-ui-warning-soft border-ui-warning/15",
                badge: "warning",
            };
        case "udp":
            return {
                icon: Network,
                tone: "text-ui-primary",
                soft: "bg-ui-primary-soft border-ui-primary/15",
                badge: "primary",
            };
        case "system":
            return {
                icon: Layers,
                tone: "text-[var(--color-violet)]",
                soft: "bg-[var(--color-violet-soft)] border-[color-mix(in_srgb,var(--color-violet)_18%,transparent)]",
                badge: "secondary",
            };
        default:
            return {
                icon: Network,
                tone: "text-ui-muted",
                soft: "bg-ui-surface-muted border-ui-border",
                badge: "muted",
            };
    }
}

function displayHost(item: Resolver) {
    const host = (item.host || "").trim();
    if (host) return host;
    if (item.type === "system" || item.system) return "system default";
    return "Not configured";
}

const ResolverTile: FC<{ item: Resolver; onClick: () => void }> = ({ item, onClick }) => {
    const visual = resolverTypeVisual(item.type);
    const Icon = visual.icon;
    const host = displayHost(item);
    const subnet = item.subnet?.trim();
    const tls = item.tlsServerName?.trim();

    return (
        <button
            type="button"
            onClick={onClick}
            className={clsx(
                "group flex h-full min-h-[132px] w-full flex-col rounded-ui-lg border border-ui-border bg-ui-surface p-4 text-left",
                "shadow-sm transition-[border-color,box-shadow,transform,background-color] duration-150",
                "hover:-translate-y-0.5 hover:border-ui-primary/35 hover:bg-ui-surface-muted/40 hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-primary/35"
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className={clsx(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-ui-lg border",
                        visual.soft,
                        visual.tone
                    )}>
                        <Icon size={18} strokeWidth={1.9} />
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-[0.95rem] font-semibold text-ui-heading" title={item.id}>
                            {item.id}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <Badge variant={visual.badge} pill className="px-2 py-0.5 text-[0.65rem] uppercase tracking-wide">
                                {item.type}
                            </Badge>
                            {item.system && (
                                <Badge variant="primary" pill className="px-2 py-0.5 text-[0.65rem]">
                                    System
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 min-w-0 flex-1">
                <div className="text-[11px] font-medium uppercase tracking-wide text-ui-muted/80">Endpoint</div>
                <div className="mt-1 break-all font-mono text-[12.5px] font-medium leading-relaxed text-ui-fg" title={host}>
                    {host}
                </div>
            </div>

            {(subnet || tls) && (
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-ui-border/70 pt-3 text-[11px] text-ui-muted">
                    {subnet && (
                        <span className="min-w-0">
                            <span className="opacity-70">Subnet</span>{" "}
                            <span className="font-mono font-medium text-ui-fg">{subnet}</span>
                        </span>
                    )}
                    {tls && (
                        <span className="min-w-0">
                            <span className="opacity-70">TLS</span>{" "}
                            <span className="font-mono font-medium text-ui-fg">{tls}</span>
                        </span>
                    )}
                </div>
            )}
        </button>
    );
};

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

        <Card density="compact" className="overflow-hidden">
            <CardHeader>
                <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <IconBox icon={Layers} tone="primary" title="Resolvers" description="Upstream DNS Resolvers" />
                    <Button size="sm" onClick={handleCreate}>
                        <Plus size={16} className="mr-1" /> Add
                    </Button>
                </div>
            </CardHeader>
            <CardBody density="compact">
                {items.length === 0 ? (
                    <div className="rounded-ui-lg border border-dashed border-ui-border px-4 py-10 text-center text-sm text-ui-muted">
                        No resolvers yet. Add an upstream DNS endpoint to get started.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => (
                            <ResolverTile
                                key={item.id}
                                item={item}
                                onClick={() => setShowdata({ show: true, id: item.id, new: false })}
                            />
                        ))}
                    </div>
                )}
            </CardBody>
            {data.page.total > PAGE_SIZE && (
                <CardFooter compact className="flex justify-center">
                    <Pagination
                        currentPage={data.page.page || page}
                        totalItems={data.page.total}
                        pageSize={data.page.pageSize || PAGE_SIZE}
                        onPageChange={setPage}
                    />
                </CardFooter>
            )}
        </Card>
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
