"use client"

import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardFooter, CardHeader, CardRowList, ErrorMsg, IconBox, MainContainer, SettingsBox } from '@/component/v2/card';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { Spinner } from "@/component/v2/spinner";
import { SwitchCard } from "@/component/v2/switch";
import { clone, create } from "@/common/plain";
import { StringValueSchema } from "@/common/plain";
import { Check, ChevronRight, DoorOpen, LogIn, Save, Settings, Trash } from "lucide-react";
import { FC, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { FetchHTTP, HttpFetcher, ApiPath, useHttpSWR, useHttpSWRRequest } from "../../common/http";
import Loading, { Error as ErrorDisplay } from "../../component/v2/loading";
import { GlobalToastContext } from "../../component/v2/toast";
import { inbound as inboundService, inbound_item } from "@/common/api";
import { inboundSchema, type inbound as inboundConfig } from "../schema/config/inbound";
import { Inbound, normalizeInbound, toPlainInbound } from "./inboud";

const InboundModal: FC<{
    show: boolean,
    name: string,
    onHide: (save?: boolean) => void,
    onDelete: () => void,
    isNew?: boolean,
}> = ({ show, name, onHide, onDelete, isNew }) => {
    const ctx = useContext(GlobalToastContext);
    const [saving, setSaving] = useState(false);
    const [draftInbound, setDraftInbound] = useState<inboundConfig | undefined>(undefined);
    const shouldFetch = name !== "" && !isNew;

    const { data: fetchedInbound, error, isLoading, isValidating, mutate } = useSWR(
        shouldFetch ? `${ApiPath(inboundService.method.get)}:${name}` : null,
        shouldFetch ? HttpFetcher(
            inboundService.method.get,
            create(StringValueSchema, { value: name }),
        ) : null,
        { shouldRetryOnError: false, keepPreviousData: false, revalidateOnFocus: false }
    )

    useEffect(() => {
        if (isNew && name !== "") {
            setDraftInbound(normalizeInbound(create(inboundSchema, { name, enabled: false })));
            return;
        }
        setDraftInbound(undefined);
    }, [name, isNew])

    const inbound = isNew ? draftInbound : fetchedInbound;

    const handleSave = () => {
        if (!inbound) return;
        setSaving(true);
        const next = toPlainInbound(clone(inboundSchema, inbound));
        next.name = name;
        FetchHTTP(inboundService.method.save, next)
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
            <ModalContent className="max-w-[800px]">
                <ModalHeader closeButton className="border-b-0 pb-0">
                    <ModalTitle className="font-bold">{name}</ModalTitle>
                </ModalHeader>
                <ModalBody className="pt-2">
                    {error ? <ErrorMsg msg={error.msg} code={error.code} raw={error.raw} /> : isValidating || isLoading || !inbound ? (
                        <Loading />
                    ) : (
                        <SettingsBox>
                            <Inbound
                                inbound={inbound}
                                onChange={(x) => {
                                    const next = clone(inboundSchema, x);
                                    if (isNew) setDraftInbound(next);
                                    else mutate(next, false);
                                }}
                            />
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

const InboundItem: FC<{ item: inbound_item, }> = ({ item }) => {
    return <>
        <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(180px,0.38fr)_minmax(0,1fr)] md:items-center">
            <div className="flex min-w-0 items-center">
                <div className="bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center mr-4 shrink-0 w-9 h-9">
                    <LogIn size={20} />
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="truncate font-medium">{item.name}</span>
                    <Badge variant={item.enabled ? "success" : "muted"} className="shrink-0">
                        {item.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                </div>
            </div>
            <div className="grid min-w-0 gap-2 text-xs text-ui-muted sm:grid-cols-2 lg:grid-cols-4">
                <div className="min-w-0">
                    <span className="mr-1 text-ui-muted/70">Protocol</span>
                    <span className="font-medium text-ui-fg">{item.protocol || "-"}</span>
                </div>
                <div className="min-w-0">
                    <span className="mr-1 text-ui-muted/70">Network</span>
                    <span className="font-medium text-ui-fg">{item.network || "-"}</span>
                </div>
                <div className="min-w-0">
                    <span className="mr-1 text-ui-muted/70">Listen</span>
                    <span className="truncate font-mono font-medium text-ui-fg">{item.listen || "-"}</span>
                </div>
                <div className="min-w-0">
                    <span className="mr-1 text-ui-muted/70">Transport</span>
                    <span className="truncate font-mono font-medium text-ui-fg">{item.transports.join(" / ") || "-"}</span>
                </div>
            </div>
        </div>
        <ChevronRight className="text-gray-500 opacity-25" size={16} />
    </>
}

const PAGE_SIZE = 8;

function InboudComponent() {
    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1);
    const { data: inbounds, error, isLoading, mutate } = useHttpSWRRequest(
        inboundService.method.list_page,
        { page, pageSize: PAGE_SIZE },
    );
    const { data: allInbounds, mutate: mutateAllInbounds } = useHttpSWR(inboundService.method.list, { revalidateOnFocus: false });

    const [saving, setSaving] = useState(false);
    const [showdata, setShowdata] = useState({ show: false, name: "", new: false });

    if (error !== undefined) return <ErrorDisplay statusCode={error.code} title={error.msg} />
    if (isLoading || inbounds === undefined) return <Loading />

    const deleteInbound = (name: string) => {
        FetchHTTP(inboundService.method.remove, create(StringValueSchema, { value: name }))
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("Removed successful");
                    mutate();
                    mutateAllInbounds();
                    setShowdata(prev => ({ ...prev, show: false })); // Ensure modal closes on delete
                } else {
                    ctx.Error(error.msg);
                }
            });
    }

    const handleApply = () => {
        setSaving(true);
        FetchHTTP(inboundService.method.apply, inbounds)
            .then(async ({ error }) => {
                if (error === undefined) ctx.Info("Settings applied successfully");
                else ctx.Error(error.msg);
                mutate();
                mutateAllInbounds();
            })
            .finally(() => setSaving(false));
    };

    const handleCreate = (v: string) => {
        if (!allInbounds?.names.includes(v) && !inbounds.names.includes(v)) setShowdata({ show: true, name: v, new: true });
    };

    const totalInbounds = inbounds.page?.total ?? inbounds.names.length;
    const inboundItems: inbound_item[] = inbounds.items.length > 0
        ? inbounds.items
        : inbounds.names.map((name) => ({ name, enabled: false, network: "", listen: "", protocol: "", transports: [] }));

    return (
        <MainContainer>
            <InboundModal
                show={showdata.show}
                name={showdata.name}
                isNew={showdata.new}
                onHide={(save) => {
                    if (save) {
                        mutate();
                        mutateAllInbounds();
                    }
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
            <CardRowList
                layout="list"
                paginated
                pageSize={PAGE_SIZE}
                currentPage={inbounds.page?.page || page}
                totalItems={totalInbounds}
                onPageChange={setPage}
                items={inboundItems}
                getKey={(item) => item.name}
                renderListItem={(item) => <InboundItem item={item} />}
                onClickItem={(item) => setShowdata({ show: true, name: item.name, new: false })}
                onAddNew={handleCreate}
                adding={saving}
                header={<IconBox icon={DoorOpen} color="#0d6efd" title="Entry Points" description={`${totalInbounds} active inbounds`} />}
            />
        </MainContainer>
    );
}

export default InboudComponent;
