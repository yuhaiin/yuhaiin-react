import { getRouteListConfig, listRouteRegistryCatalogs, saveRouteListConfig } from "@/api/route";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Input } from "@/component/v2/input";
import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Pagination } from "@/component/v2/pagination";
import { Select } from "@/component/v2/select";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import type { RegistryCatalog, RegistryFile, RouteListDetail } from "@/contract/route";
import { createDefaultRouteList } from "@/contract/route";
import { AlertTriangle, Database, ExternalLink, Library, PackagePlus, Plus, RefreshCw, Search, Settings2 } from "lucide-react";
import { useContext, useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { RegistryManagerModal } from "./registry-manager";

const CATALOG_KEY = "/api/v2/route/registries/catalogs";
const LIST_CONFIG_KEY = "/api/v2/route/lists/config";
const PAGE_SIZE = 50;

function formatBytes(value: number) {
    if (!Number.isFinite(value) || value <= 0) return "0 B";
    const units = ["B", "KiB", "MiB", "GiB"];
    let size = value;
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
        size /= 1024;
        unit++;
    }
    return `${size >= 10 || unit === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}

function toRouteList(file: RegistryFile): RouteListDetail {
    return {
        ...createDefaultRouteList(file.name || file.id.split("/").pop() || file.id),
        type: file.listType || "host",
        source: { type: "remote", remote: { urls: [file.url] } },
    };
}

function CatalogRow({
    catalog,
    file,
    onSelect,
    onUseMaxMind,
    pending,
}: {
    catalog: RegistryCatalog;
    file: RegistryFile;
    onSelect: (value: RouteListDetail) => void;
    onUseMaxMind: (file: RegistryFile) => void;
    pending: boolean;
}) {
    const maxMind = file.usage === "maxminddb";
    return (
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-ui-md border border-ui-border bg-ui-surface-muted text-ui-muted">
                    {maxMind ? <Database size={17} /> : <Library size={17} />}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate font-semibold text-ui-heading">{file.name || file.id}</span>
                        <Badge variant="secondary" pill>{file.category || file.kind || "rules"}</Badge>
                        <Badge variant={maxMind ? "info" : "muted"} pill>{maxMind ? "GeoIP DB" : file.listType || "host"}</Badge>
                    </div>
                    <div className="mt-1 truncate text-xs text-ui-muted" title={file.path}>
                        {catalog.registry.name} · {file.path || file.id} · {formatBytes(file.size)}
                    </div>
                </div>
            </div>
            <div className="flex shrink-0 items-center justify-end gap-2">
                {file.url && (
                    <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-ui-md border border-ui-border text-ui-muted hover:bg-ui-surface-muted hover:text-ui-fg"
                        title="Open raw file"
                    >
                        <ExternalLink size={15} />
                    </a>
                )}
                <Button size="sm" disabled={pending} onClick={() => maxMind ? onUseMaxMind(file) : onSelect(toRouteList(file))}>
                    {maxMind ? <Database size={15} className="mr-1.5" /> : <Plus size={15} className="mr-1.5" />}
                    {maxMind ? "Use GeoIP" : "Add list"}
                </Button>
            </div>
        </div>
    );
}

export function RegistryCatalogModal({
    open,
    onClose,
    onSelectList,
}: {
    open: boolean;
    onClose: () => void;
    onSelectList: (value: RouteListDetail) => void;
}) {
    const toast = useContext(GlobalToastContext);
    const { mutate: mutateGlobal } = useSWRConfig();
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [registryID, setRegistryID] = useState("all");
    const [category, setCategory] = useState("all");
    const [managerOpen, setManagerOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [pendingGeoIP, setPendingGeoIP] = useState(false);
    const { data, error, isLoading, mutate } = useSWR(
        open ? CATALOG_KEY : null,
        () => listRouteRegistryCatalogs(false),
        { revalidateOnFocus: false },
    );

    const allRows = useMemo(() =>
        (data?.items ?? []).flatMap(catalog =>
            (catalog.files ?? [])
                .filter(file => file.selectable && (file.usage === "route-list" || file.usage === "maxminddb"))
                .map(file => ({ catalog, file })),
        ), [data]);

    const registryOptions = useMemo(() => {
        const counts = new Map<string, { name: string; count: number }>();
        for (const row of allRows) {
            const id = row.catalog.registry.id;
            const current = counts.get(id);
            counts.set(id, {
                name: row.catalog.registry.name || id,
                count: (current?.count ?? 0) + 1,
            });
        }
        return [
            { value: "all", label: `All registries (${allRows.length})` },
            ...Array.from(counts.entries())
                .sort((a, b) => a[1].name.localeCompare(b[1].name))
                .map(([value, item]) => ({ value, label: `${item.name} (${item.count})` })),
        ];
    }, [allRows]);

    const registryRows = useMemo(
        () => registryID === "all" ? allRows : allRows.filter(row => row.catalog.registry.id === registryID),
        [allRows, registryID],
    );

    const categoryOptions = useMemo(() => {
        const counts = new Map<string, number>();
        for (const row of registryRows) {
            const value = row.file.category || row.file.kind || "other";
            counts.set(value, (counts.get(value) ?? 0) + 1);
        }
        return [
            { value: "all", label: `All categories (${registryRows.length})` },
            ...Array.from(counts.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([value, count]) => ({ value, label: `${value} (${count})` })),
        ];
    }, [registryRows]);

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        return registryRows
            .filter(row => category === "all" || (row.file.category || row.file.kind || "other") === category)
            .filter(row => !q || [
                row.catalog.registry.name,
                row.file.id,
                row.file.name,
                row.file.category,
                row.file.kind,
                row.file.listType,
                row.file.path,
            ].some(value => (value || "").toLowerCase().includes(q)));
    }, [registryRows, category, query]);

    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const refresh = async () => {
        if (refreshing) return;
        setRefreshing(true);
        try {
            await mutate(await listRouteRegistryCatalogs(true), { revalidate: false });
            toast.Info("registry catalogs refreshed");
        } catch (err) {
            toast.Error(String((err as { msg?: string })?.msg ?? err));
        } finally {
            setRefreshing(false);
        }
    };

    const useMaxMind = async (file: RegistryFile) => {
        if (pendingGeoIP) return;
        setPendingGeoIP(true);
        try {
            const config = await getRouteListConfig();
            await saveRouteListConfig({
                ...config,
                maxMindDbGeoIp: { ...config.maxMindDbGeoIp, downloadUrl: file.url, error: "" },
            });
            await mutateGlobal(LIST_CONFIG_KEY);
            toast.Info(`GeoIP database set to ${file.name || file.id}`);
        } catch (err) {
            toast.Error(String((err as { msg?: string })?.msg ?? err));
        } finally {
            setPendingGeoIP(false);
        }
    };

    return (
        <>
            <Modal open={open} onOpenChange={(next) => !next && onClose()}>
                <ModalContent width={940}>
                    <ModalHeader closeButton>
                        <ModalTitle className="flex items-center gap-2"><PackagePlus size={19} /> Registry Catalog</ModalTitle>
                    </ModalHeader>
                    <ModalBody>
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative min-w-0 flex-1">
                                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" />
                                <Input
                                    size="sm"
                                    value={query}
                                    onChange={e => { setQuery(e.target.value); setPage(1); }}
                                    placeholder="Search registry files..."
                                    className="pl-9"
                                />
                            </div>
                            <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:shrink-0">
                                <Select
                                    value={registryID}
                                    onValueChange={(value) => {
                                        setRegistryID(value);
                                        setCategory("all");
                                        setPage(1);
                                    }}
                                    items={registryOptions}
                                    size="sm"
                                    triggerClassName="min-w-0 sm:w-[170px]"
                                    viewportClassName="max-h-[320px]"
                                />
                                <Select
                                    value={category}
                                    onValueChange={(value) => { setCategory(value); setPage(1); }}
                                    items={categoryOptions}
                                    size="sm"
                                    triggerClassName="min-w-0 sm:w-[160px]"
                                    viewportClassName="max-h-[320px]"
                                />
                            </div>
                            <div className="flex shrink-0 gap-2">
                                <Button size="sm" variant="outline-secondary" onClick={() => setManagerOpen(true)}>
                                    <Settings2 size={15} className="mr-1.5" /> Manage
                                </Button>
                                <Button size="sm" variant="outline-secondary" disabled={refreshing} onClick={refresh}>
                                    {refreshing ? <Spinner size="sm" className="mr-1.5" /> : <RefreshCw size={15} className="mr-1.5" />} Refresh
                                </Button>
                            </div>
                        </div>
                        {error ? (
                            <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
                        ) : isLoading || !data ? (
                            <Loading />
                        ) : (
                            <div className="space-y-4">
                                {(data.items ?? []).filter(item => item.error).map(item => (
                                    <div key={item.registry.id} className="rounded-ui-md border border-ui-danger/30 bg-ui-danger/10 p-3 text-sm text-ui-danger">
                                        <div className="flex items-center gap-2 font-semibold"><AlertTriangle size={15} /> {item.registry.name}</div>
                                        <div className="mt-1 break-words text-xs">{item.error}</div>
                                    </div>
                                ))}
                                {rows.length === 0 ? (
                                    <div className="rounded-ui-lg border border-dashed border-ui-border px-4 py-10 text-center text-sm text-ui-muted">
                                        No selectable registry files match the current filters.
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ui-muted">
                                            <span>
                                                {rows.length} files · page {currentPage}/{totalPages}
                                            </span>
                                            <span>
                                                Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, rows.length)}
                                            </span>
                                        </div>
                                        <div className="divide-y divide-ui-border/70 overflow-hidden rounded-ui-lg border border-ui-border/70">
                                            {pageRows.map(({ catalog, file }) => (
                                                <CatalogRow
                                                    key={`${catalog.registry.id}:${file.id}`}
                                                    catalog={catalog}
                                                    file={file}
                                                    pending={pendingGeoIP}
                                                    onUseMaxMind={useMaxMind}
                                                    onSelect={(value) => { onSelectList(value); onClose(); }}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex justify-center pt-1">
                                            <Pagination
                                                currentPage={currentPage}
                                                totalItems={rows.length}
                                                pageSize={PAGE_SIZE}
                                                onPageChange={setPage}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter><Button onClick={onClose}>Close</Button></ModalFooter>
                </ModalContent>
            </Modal>
            <RegistryManagerModal open={managerOpen} onClose={() => setManagerOpen(false)} onChanged={() => void mutate()} />
        </>
    );
}
