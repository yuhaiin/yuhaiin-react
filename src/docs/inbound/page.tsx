import { useAsyncAction, useCloseGuard, useEditorDraft } from "@/hooks/use-editor-draft";
import { runtimeVariant, runtimeLabel, formatBytes } from "./runtime";
import { InboundModal, errorOf } from "./modal";

import { useServerPageClamp } from "@/hooks/use-pagination";
import { useTranslation } from 'react-i18next';

import { deleteInbound, getInboundConfig, InboundRuntimeStatus, listInboundStatuses, listInbounds, retryInbound, saveInbound, saveInboundConfig } from "@/api/inbounds";

import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardHeader, CardRowList, IconBox, MainContainer } from "@/component/v2/card";
import { SwitchCard } from "@/component/v2/forms";

import { Spinner } from "@/component/v2/spinner";
import { Switch } from "@/component/v2/switch";
import { InboundConfig, inboundListen, Inbound, normalizeInbound, normalizeInboundConfig } from "@/contract/inbound";
import { DoorOpen, Plus, Save, Settings } from "lucide-react";
import { FC, useContext, useMemo, useState } from "react";
import useSWR from "swr";
import Loading from "../../component/v2/loading";
import { GlobalToastContext } from "../../component/v2/toast";

const PAGE_SIZE = 8;

function transportLabel(value: Inbound): string {
    return value.transports.map((transport) => transport.type).join(" / ");
}

const inboundTableGrid = "lg:grid lg:grid-cols-[minmax(145px,1.25fr)_minmax(96px,.75fr)_minmax(150px,1.3fr)_minmax(130px,1fr)_56px] lg:gap-x-4 xl:grid-cols-[minmax(145px,1.25fr)_minmax(96px,.75fr)_minmax(150px,1.3fr)_minmax(130px,1fr)_minmax(0,1.2fr)_56px]";

function newInboundID(): string {
    return globalThis.crypto?.randomUUID?.() ?? `inbound-${Date.now()}`;
}

const InboundItem: FC<{
    item: Inbound;
    runtime?: InboundRuntimeStatus;
    onToggle: (item: Inbound) => void;
    onOpen: () => void;
    toggling: boolean;
}> = ({ item, runtime, onToggle, onOpen, toggling }) => {
    const { t: uiT } = useTranslation('ui');

    const status = runtime?.status ?? (item.enabled ? "starting" : "disabled");
    const name = item.name || item.id;
    const listen = inboundListen(item) || "-";
    const transport = transportLabel(item) || "-";
    return (
        <div className={`-mx-3.5 -my-3 flex min-w-0 flex-1 items-center gap-3 bg-ui-surface px-3.5 py-2.5 ${inboundTableGrid}`}>
            <div className="flex min-w-0 flex-1 items-center lg:contents">
                <button
                    type="button"
                    className="flex min-w-0 flex-1 flex-col items-start text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus lg:block"
                    aria-label={`Edit ${name}`}
                    onClick={(event) => {
                        event.stopPropagation();
                        onOpen();
                    }}
                >
                    <span className="flex min-w-0 max-w-full items-center gap-2">
                        <span className="truncate font-semibold text-ui-heading" title={name}>{name}</span>
                        <Badge variant={runtimeVariant(status)} title={runtime?.lastError ?? undefined} className="shrink-0 lg:hidden">
                            {runtimeLabel(status)}
                        </Badge>
                    </span>
                    <span className="mt-0.5 flex min-w-0 max-w-full items-center text-xs text-ui-muted lg:hidden">
                        <span className="min-w-0 flex-1 break-all font-mono" title={listen}>{listen}</span>
                        <span className="mx-1 shrink-0" aria-hidden="true">·</span>
                        <span className="shrink-0 whitespace-nowrap" title={item.protocol.type}>{item.protocol.type}</span>
                    </span>
                </button>

                <div className="hidden min-w-0 lg:block">
                    <Badge variant={runtimeVariant(status)} title={runtime?.lastError ?? undefined}>
                        {runtimeLabel(status)}
                    </Badge>
                </div>

                <div className="hidden min-w-0 lg:block">
                    <div className="truncate font-mono text-sm font-medium text-ui-fg">{listen}</div>
                    <div className="truncate text-[11px] text-ui-muted">{item.network.type} · {transport}</div>
                </div>

                <div className="hidden min-w-0 lg:block">
                    <div className="truncate text-sm font-medium text-ui-fg">{item.protocol.type}</div>
                </div>

                {runtime ? (
                    <div className="hidden min-w-0 text-xs text-ui-muted xl:block">
                        <div className="truncate font-medium text-ui-fg">
                            {uiT("tcp")} {runtime.statistics.activeTcp} {uiT("udp")} {runtime.statistics.activeUdp}
                        </div>
                        <div className="truncate text-[11px]">↑ {formatBytes(runtime.statistics.uploadBytes)} / ↓ {formatBytes(runtime.statistics.downloadBytes)}</div>
                    </div>
                ) : (
                    <div className="hidden text-sm text-ui-muted xl:block">—</div>
                )}
            </div>

            <div
                className="flex shrink-0 items-center lg:justify-self-end"
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
            >
                <Switch
                    checked={item.enabled}
                    onCheckedChange={() => onToggle(item)}
                    disabled={toggling}
                    aria-label={`${item.enabled ? "Disable" : "Enable"} ${name}`}
                />
            </div>
        </div>
    );
};

const InboundConfigCard: FC = () => {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useSWR(
        "/api/v2/inbounds/config",
        getInboundConfig,
        { revalidateOnFocus: false },
    );
    const apiError = errorOf(error);

    const { value: draft, setValue: setDraft, commit, dirty } = useEditorDraft("inbound-config", data, normalizeInboundConfig);
    const { pending: saving, run } = useAsyncAction(error => ctx.Error(errorOf(error)?.msg ?? "Apply failed"));
    useCloseGuard(dirty, saving, () => undefined);

    const patch = (value: Partial<InboundConfig>) => {
        setDraft((prev) => normalizeInboundConfig({ ...prev, ...value }));
    };

    const handleSave = () => {
        if (!data || saving || error || isLoading) return;
        void run(async () => {
            const saved = await saveInboundConfig(draft);
            commit(saved);
            await mutate(saved, { revalidate: false });
            ctx.Info("Apply successful");
        });
    };

    return (
        <Card className="mb-4">
            <fieldset disabled={saving} className="contents">
            <CardHeader>
                <IconBox icon={Settings} tone="primary" title={uiT("inboundConfiguration")} description={uiT("dnsInterceptionAndTrafficInspection")} />
                <Button disabled={saving || isLoading || !data || Boolean(apiError)} onClick={handleSave}>
                    {saving ? <Spinner size="sm" /> : <><Save className="mr-1" size={16} /> {uiT("applySettings")}</>}
                </Button>
            </CardHeader>
            <CardBody>
                {apiError ? (
                    <Loading code={apiError.code} onRetry={() => void mutate()}>{apiError.msg}</Loading>
                ) : (
                    <div className="grid gap-3 md:grid-cols-3">
                        <SwitchCard
                            label={uiT("dnsHijack")}
                            description={uiT("interceptDnsRequestsFromInboundTraffic")}
                            checked={draft.hijackDns}
                            onCheckedChange={(hijackDns) => patch({ hijackDns })}
                            disabled={isLoading}
                        />
                        <SwitchCard
                            label={uiT("fakedns")}
                            description={uiT("useFakeipResponsesForHijackedDnsRequests")}
                            checked={draft.hijackDnsFakeIp}
                            onCheckedChange={(hijackDnsFakeIp) => patch({ hijackDnsFakeIp })}
                            disabled={isLoading}
                        />
                        <SwitchCard
                            label={uiT("trafficSniffing")}
                            description={uiT("inferDestinationMetadataFromAcceptedConnections")}
                            checked={draft.sniff}
                            onCheckedChange={(sniff) => patch({ sniff })}
                            disabled={isLoading}
                        />
                    </div>
                )}
            </CardBody>
            </fieldset>
        </Card>
    );
};

export default function InboudComponent() {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1);
    const [showdata, setShowdata] = useState({ show: false, id: "", new: false });
    const { data, error, isLoading, mutate } = useSWR(
        `/api/v2/inbounds?page=${page}&pageSize=${PAGE_SIZE}`,
        () => listInbounds({ page, pageSize: PAGE_SIZE }),
        { keepPreviousData: true },
    );
    useServerPageClamp(data?.page, page, setPage);
    const { data: runtimeStatuses = [], mutate: mutateStatuses } = useSWR(
        "/api/v2/inbounds/status",
        listInboundStatuses,
        { refreshInterval: 3000, revalidateOnFocus: true },
    );
    const [togglingID, setTogglingID] = useState<string>();
    const [retryingID, setRetryingID] = useState<string>();

    const apiError = errorOf(error);
    const items = useMemo(() => data?.items ?? [], [data?.items]);
    const statusByID = useMemo(() => new Map(runtimeStatuses.map((status) => [status.id, status])), [runtimeStatuses]);

    if (apiError) return <Loading code={apiError.code} onRetry={() => void mutate()}>{apiError.msg}</Loading>;
    if (isLoading || data === undefined) return <Loading />;

    const deleteCurrentInbound = () => {
        const id = showdata.id;
        deleteInbound(id)
            .then(() => {
                ctx.Info("Removed successful");
                setShowdata((prev) => ({ ...prev, show: false }));
                void mutate();
                void mutateStatuses();
            })
            .catch((err: unknown) => {
                const apiErr = errorOf(err);
                ctx.Error(apiErr?.msg ?? "Remove failed");
            });
    };

    const handleCreate = (id: string) => {
        if (items.some((item) => item.id === id)) {
            ctx.Error(`Inbound ${id} already exists`);
            return;
        }
        setShowdata({ show: true, id, new: true });
    };

    const toggleInbound = (item: Inbound) => {
        setTogglingID(item.id);
        saveInbound(normalizeInbound({ ...item, enabled: !item.enabled }))
            .then(async () => {
                ctx.Info(item.enabled ? "Inbound stopping" : "Inbound starting");
                await Promise.all([mutate(), mutateStatuses()]);
            })
            .catch((err: unknown) => {
                const apiErr = errorOf(err);
                ctx.Error(apiErr?.msg ?? "Update failed");
            })
            .finally(() => setTogglingID(undefined));
    };

    const retryCurrentInbound = () => {
        const id = showdata.id;
        setRetryingID(id);
        retryInbound(id)
            .then(async () => {
                ctx.Info("Inbound retry requested");
                await mutateStatuses();
            })
            .catch((err: unknown) => {
                const apiErr = errorOf(err);
                ctx.Error(apiErr?.msg ?? "Retry failed");
            })
            .finally(() => setRetryingID(undefined));
    };

    return (
        <MainContainer>
            <InboundModal
                show={showdata.show}
                id={showdata.id}
                isNew={showdata.new}
                onHide={(save) => {
                    if (save) {
                        void mutate();
                        void mutateStatuses();
                    }
                    setShowdata((prev) => ({ ...prev, show: false }));
                }}
                onDelete={deleteCurrentInbound}
                runtime={statusByID.get(showdata.id)}
                onRetry={retryCurrentInbound}
                retrying={retryingID === showdata.id}
            />

            <InboundConfigCard />

            <CardRowList
                layout="list"
                paginated
                pageSize={PAGE_SIZE}
                currentPage={data.page.page || page}
                totalItems={data.page.total}
                onPageChange={setPage}
                items={items}
                getKey={(item) => item.id}
                renderListItem={(item) => (
                    <InboundItem
                        item={item}
                        runtime={statusByID.get(item.id)}
                        onToggle={toggleInbound}
                        onOpen={() => setShowdata({ show: true, id: item.id, new: false })}
                        toggling={togglingID === item.id}
                    />
                )}
                onClickItem={(item) => setShowdata({ show: true, id: item.id, new: false })}
                header={
                    <div className="flex w-full flex-col gap-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <IconBox icon={DoorOpen} tone="primary" title={uiT("entryPoints")} description={`${data.page.total} inbounds`} />
                            </div>
                            <Button className="shrink-0 self-start whitespace-nowrap sm:self-auto" size="sm" onClick={() => handleCreate(newInboundID())}>
                                <Plus className="mr-1" size={16} /> {uiT("add")}</Button>
                        </div>
                        <div className={`hidden min-w-0 ${inboundTableGrid} lg:-mx-5 lg:px-[18px] lg:text-[11px] lg:font-semibold lg:uppercase lg:tracking-wide lg:text-ui-muted`}>
                            <span>{uiT("name")}</span>
                            <span>{uiT("statusLabel")}</span>
                            <span>{uiT("listenAddressLabel")}</span>
                            <span>{uiT("protocol")}</span>
                            <span className="hidden xl:block">{uiT("traffic")}</span>
                            <span className="text-right">{uiT("enabled")}</span>
                        </div>
                    </div>
                }
            />
        </MainContainer>
    );
}
