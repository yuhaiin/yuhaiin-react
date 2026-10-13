import { ResolverModal } from "@/component/resolver-editor";
import { useServerPageClamp } from "@/hooks/use-pagination";
import { useTranslation } from 'react-i18next';

import { APIError } from "@/api/client";
import { deleteResolver, listResolvers } from "@/api/resolvers";
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, IconBox, MainContainer } from '@/component/v2/card';
import { ConfirmModal } from "@/component/v2/confirm";
import { Pagination } from "@/component/v2/pagination";
import { GlobalToastContext } from '@/component/v2/toast';
import { Resolver } from "@/contract/resolver";
import clsx from "clsx";
import {
    Globe2,
    Layers,
    Network,
    Plus,
    Shield,
} from 'lucide-react';
import type { ElementType } from "react";
import { FC, useContext, useMemo, useState } from "react";
import useSWR from "swr";
import Loading from "../../../component/v2/loading";
import { Fakedns } from "./fakedns";
import { Hosts } from "./hosts";
import { Server } from "./server";
import { DNSCache } from "./cache";
import { DNSRoles } from "./roles";

const PAGE_SIZE = 12;

function errorOf(error: unknown): APIError | undefined {
    if (!error) return undefined;
    if (typeof error === "object" && "code" in error && "msg" in error) return error as APIError;
    return { code: 500, msg: error instanceof Error ? error.message : String(error) };
}


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
    const { t: uiT } = useTranslation('ui');

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
                        <div className="truncate text-[0.95rem] font-semibold text-ui-heading" title={item.name}>
                            {item.name}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <Badge variant={visual.badge} pill className="px-2 py-0.5 text-[0.65rem] font-medium">
                                {item.type}
                            </Badge>
                            {item.system && (
                                <Badge variant="primary" pill className="px-2 py-0.5 text-[0.65rem]">
                                    {uiT("system")}</Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 min-w-0 flex-1">
                <div className="text-xs font-medium text-ui-muted">{uiT("endpoint")}</div>
                <div className="mt-1 break-all font-mono text-[12.5px] font-medium leading-relaxed text-ui-fg" title={host}>
                    {host}
                </div>
            </div>

            {(subnet || tls) && (
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-ui-border/70 pt-3 text-[11px] text-ui-muted">
                    {subnet && (
                        <span className="min-w-0">
                            <span className="opacity-70">{uiT("subnet")}</span>{" "}
                            <span className="font-mono font-medium text-ui-fg">{subnet}</span>
                        </span>
                    )}
                    {tls && (
                        <span className="min-w-0">
                            <span className="opacity-70">{uiT("tls")}</span>{" "}
                            <span className="font-mono font-medium text-ui-fg">{tls}</span>
                        </span>
                    )}
                </div>
            )}
        </button>
    );
};

export default function ResolverComponent() {
    const { t } = useTranslation("routing");
    return (
        <MainContainer>
            <div className="flex flex-col gap-6">
                <h1 className="text-xl font-semibold text-ui-heading">{t('dnsTask')}</h1>
                <p className="text-sm text-ui-muted">{t("dnsPageHelp")}</p>
                <DNSRoles />
                <ResolverList />
                <Server />
                <details><summary className="cursor-pointer text-sm font-semibold">{t('advancedDNSSettings')}</summary>
                    <div className="mt-4 space-y-6"><DNSCache />
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2"><Hosts /><Fakedns /></div>
                    </div>
                </details>
            </div>
        </MainContainer>
    );
}

function ResolverList() {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1);
    const [showdata, setShowdata] = useState({ show: false, id: "", new: false });
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: "" });
    const { data, error, isLoading, mutate } = useSWR(
        `/api/v2/resolvers?page=${page}&pageSize=${PAGE_SIZE}`,
        () => listResolvers({ page, pageSize: PAGE_SIZE }),
        { keepPreviousData: true },
    );
    useServerPageClamp(data?.page, page, setPage);

    const apiError = errorOf(error);
    const items = useMemo(() => data?.items ?? [], [data?.items]);

    if (apiError) return <Loading code={apiError.code} onRetry={() => void mutate()}>{apiError.msg}</Loading>
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
            title={uiT("deleteResolver")}
            content={<>{uiT("areYouSureToDelete")}<span className="font-bold text-red-500">{confirmDelete.id}</span>?</>}
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
                    <IconBox icon={Layers} tone="primary" title={uiT("resolvers")} description={uiT("upstreamDnsResolvers")} />
                    <Button size="sm" onClick={handleCreate}>
                        <Plus size={16} className="mr-1" /> {uiT("add")}</Button>
                </div>
            </CardHeader>
            <CardBody density="compact">
                {items.length === 0 ? (
                    <div className="rounded-ui-lg border border-dashed border-ui-border px-4 py-10 text-center text-sm text-ui-muted">
                        {uiT("noResolversYetAddAnUpstreamDnsEndpointToGetStarted")}</div>
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
