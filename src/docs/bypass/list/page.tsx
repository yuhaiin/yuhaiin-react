"use client"

import { createRouteList, deleteRouteList, getRouteActivationStatus, getRouteList, getRouteListConfig, listRouteLists, refreshRouteLists, saveRouteList, saveRouteListConfig } from "@/api/route";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardFooter, CardHeader, FilterSearch, IconBox, MainContainer, SettingLabel, SettingsBox } from "@/component/v2/card";
import { SettingInputVertical, SettingRangeVertical, SettingSelectVertical, SwitchCard } from "@/component/v2/forms";
import { InputList } from "@/component/v2/listeditor";
import Loading from "@/component/v2/loading";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Pagination } from "@/component/v2/pagination";
import { RouteActivationProgress } from "@/component/v2/route-activation-progress";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import type { ListItem, RouteListDetail } from "@/contract/route";
import { createDefaultRouteList, normalizeRouteList } from "@/contract/route";
import clsx from "clsx";
import {
    Check,
    Clock,
    Cloud,
    CloudDownload,
    FileText,
    Globe2,
    HardDrive,
    Hash,
    List,
    Network,
    Plus,
    RefreshCw,
    Regex,
    Save,
    TextCursorInput,
    Trash,
    TriangleAlert,
    Type,
} from "lucide-react";
import type { CSSProperties, ElementType, FC } from "react";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";

const routeListTypes = ["host", "process", "cidr", "domain", "regexp", "keyword", "suffix"];
const sourceTypes = ["local", "remote"];
const PAGE_SIZE = 12;

type BadgeVariant = "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "muted";

function shortPreview(value?: string) {
    const preview = (value || "").trim();
    if (!preview) return "Empty list";
    try {
        if (/^https?:\/\//i.test(preview)) {
            const url = new URL(preview);
            const leaf = url.pathname.split("/").filter(Boolean).pop();
            return leaf || url.host;
        }
    } catch {
        // keep original preview
    }
    return preview;
}

function listTypeVisual(type?: string): {
    icon: ElementType;
    tone: string;
    soft: string;
    badge: BadgeVariant;
} {
    switch ((type || "").toLowerCase()) {
        case "host":
        case "domain":
            return {
                icon: Globe2,
                tone: "text-ui-primary",
                soft: "bg-ui-primary-soft border-ui-primary/15",
                badge: "primary",
            };
        case "suffix":
            return {
                icon: Type,
                tone: "text-ui-info",
                soft: "bg-ui-info-soft border-ui-info/15",
                badge: "info",
            };
        case "keyword":
            return {
                icon: Hash,
                tone: "text-[var(--color-violet)]",
                soft: "bg-[var(--color-violet-soft)] border-[color-mix(in_srgb,var(--color-violet)_18%,transparent)]",
                badge: "secondary",
            };
        case "regexp":
            return {
                icon: Regex,
                tone: "text-ui-danger",
                soft: "bg-ui-danger-soft border-ui-danger/15",
                badge: "danger",
            };
        case "cidr":
            return {
                icon: Network,
                tone: "text-ui-success",
                soft: "bg-ui-success-soft border-ui-success/15",
                badge: "success",
            };
        case "process":
            return {
                icon: TextCursorInput,
                tone: "text-ui-warning",
                soft: "bg-ui-warning-soft border-ui-warning/15",
                badge: "warning",
            };
        default:
            return {
                icon: FileText,
                tone: "text-ui-muted",
                soft: "bg-ui-surface-muted border-ui-border",
                badge: "muted",
            };
    }
}

const DefinedListTile: FC<{ item: ListItem; onClick: () => void }> = ({ item, onClick }) => {
    const visual = listTypeVisual(item.type);
    const Icon = visual.icon;
    const hasError = item.errorCount > 0;
    const source = (item.source || "local").toLowerCase();
    const remote = source === "remote";
    const preview = shortPreview(item.preview);

    return (
        <button
            type="button"
            onClick={onClick}
            className={clsx(
                "group flex h-full min-h-[140px] w-full flex-col rounded-ui-lg border bg-ui-surface p-4 text-left",
                "shadow-sm transition-[border-color,box-shadow,transform,background-color] duration-150",
                "hover:-translate-y-0.5 hover:border-ui-primary/35 hover:bg-ui-surface-muted/40 hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-primary/35",
                hasError ? "border-ui-danger/30" : "border-ui-border"
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className={clsx(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-ui-lg border",
                        hasError ? "border-ui-danger/20 bg-ui-danger-soft text-ui-danger" : clsx(visual.soft, visual.tone)
                    )}>
                        {hasError ? <TriangleAlert size={18} strokeWidth={1.9} /> : <Icon size={18} strokeWidth={1.9} />}
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-[0.95rem] font-semibold text-ui-heading" title={item.name}>
                            {item.name}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <Badge variant={hasError ? "danger" : visual.badge} pill className="px-2 py-0.5 text-[0.65rem] uppercase tracking-wide">
                                {item.type || "list"}
                            </Badge>
                            <Badge variant={remote ? "info" : "muted"} pill className="px-2 py-0.5 text-[0.65rem]">
                                {remote ? "Remote" : "Local"}
                            </Badge>
                            {hasError && (
                                <Badge variant="danger" pill className="px-2 py-0.5 text-[0.65rem]">
                                    {item.errorCount} error{item.errorCount === 1 ? "" : "s"}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
                <div className="shrink-0 rounded-full border border-ui-border/70 bg-ui-surface-muted/70 px-2 py-1 text-[11px] font-semibold tabular-nums text-ui-muted">
                    {item.itemCount}
                </div>
            </div>

            <div className="mt-4 min-w-0 flex-1">
                <div className="text-[11px] font-medium uppercase tracking-wide text-ui-muted/80">Preview</div>
                <div className="mt-1 break-all font-mono text-[12.5px] font-medium leading-relaxed text-ui-fg" title={item.preview || undefined}>
                    {preview}
                </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 border-t border-ui-border/70 pt-3 text-[11px] text-ui-muted">
                {remote ? <Cloud size={13} className="shrink-0 opacity-70" /> : <HardDrive size={13} className="shrink-0 opacity-70" />}
                <span className="truncate">
                    {remote ? "Fetched remotely" : "Defined locally"}
                    <span className="mx-1.5 opacity-40">·</span>
                    {item.itemCount} {item.itemCount === 1 ? "entry" : "entries"}
                </span>
            </div>
        </button>
    );
};

function Lists() {
    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState("");
    const [editing, setEditing] = useState<string | null>(null);
    const [creating, setCreating] = useState(false);
    const [creatingName, setCreatingName] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { data: activation, mutate: mutateActivation } = useSWR(
        "/api/v2/route/activation",
        getRouteActivationStatus,
        {
            revalidateOnFocus: false,
            refreshInterval: (status) => Math.max(status?.hostIndexRefreshAt ?? 0, status?.ruleApplyAt ?? 0) > Date.now() ? 1000 : 0,
        },
    );
    const { data, error, isLoading, mutate } = useSWR(
        ["/api/v2/route/lists", page, query],
        () => listRouteLists({ page, pageSize: PAGE_SIZE, query }),
        { revalidateOnFocus: false, keepPreviousData: true },
    );

    const refresh = async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        try {
            await refreshRouteLists();
            ctx.Info("refresh successful");
            await Promise.all([mutate(), mutateActivation()]);
        } catch (err) {
            const e = err as { msg?: string };
            ctx.Error(e.msg ?? String(err));
        } finally {
            setIsRefreshing(false);
        }
    };

    const saved = () => {
        mutate();
        void mutateActivation();
        setEditing(null);
        setCreating(false);
        setCreatingName("");
    };

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || !data) return <Loading />

    return (
        <MainContainer>
            <ListConfigCard />
            <RouteActivationProgress status={activation} onApplied={mutateActivation} />
            <Card density="compact" className="overflow-hidden">
                <CardHeader>
                    <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <IconBox
                            icon={List}
                            tone="primary"
                            title="Defined Lists"
                            description="Match sources for route rules"
                        />
                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                            <FilterSearch className="min-w-0 flex-1 sm:w-[200px] sm:flex-none" onEnter={(v) => { setPage(1); setQuery(v); }} size="sm" />
                            <Button size="sm" variant="outline-secondary" onClick={refresh} disabled={isRefreshing}>
                                {isRefreshing ? <Spinner size="sm" className="mr-2" /> : <RefreshCw size={16} className="mr-2" />}
                                Sync
                            </Button>
                            <Button size="sm" onClick={() => { setCreatingName(""); setCreating(true); }}>
                                <Plus size={16} className="mr-1" /> Add
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardBody density="compact">
                    {data.items.length === 0 ? (
                        <div className="rounded-ui-lg border border-dashed border-ui-border px-4 py-10 text-center text-sm text-ui-muted">
                            No lists yet. Create a local list or sync remote sources.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {data.items.map((item) => (
                                <DefinedListTile
                                    key={item.name}
                                    item={item}
                                    onClick={() => setEditing(item.name)}
                                />
                            ))}
                        </div>
                    )}
                </CardBody>
                {data.page.total > PAGE_SIZE && (
                    <CardFooter compact className="flex items-center justify-between gap-3">
                        <div className="text-xs font-medium text-ui-muted">
                            {data.page.total} items · page {data.page.page || page}/{Math.max(1, Math.ceil(data.page.total / (data.page.pageSize || PAGE_SIZE)))}
                        </div>
                        <Pagination
                            currentPage={data.page.page || page}
                            totalItems={data.page.total}
                            pageSize={data.page.pageSize || PAGE_SIZE}
                            onPageChange={setPage}
                        />
                    </CardFooter>
                )}
            </Card>
            <ListEditorModal name={editing} onSaved={saved} onClose={() => setEditing(null)} />
            <CreateListModal open={creating} initialName={creatingName} onSaved={saved} onClose={() => setCreating(false)} />
        </MainContainer>
    );
}

function ListConfigCard() {
    const ctx = useContext(GlobalToastContext);
    const [saving, setSaving] = useState(false);
    const { data, error, isLoading, mutate } = useSWR("/api/v2/route/lists/config", getRouteListConfig, { revalidateOnFocus: false });

    const patch = (patchValue: Partial<NonNullable<typeof data>>) => {
        mutate(prev => prev ? { ...prev, ...patchValue } : prev, { revalidate: false });
    };

    const save = () => {
        if (!data) return;
        setSaving(true);
        saveRouteListConfig(data)
            .then((next) => {
                ctx.Info("list config saved");
                mutate(next, { revalidate: false });
            })
            .catch((err) => ctx.Error(err.msg ?? String(err)))
            .finally(() => setSaving(false));
    };

    const lastSync = data?.lastRefreshTime && data.lastRefreshTime !== "0"
        ? new Date(Number(data.lastRefreshTime) * 1000).toLocaleString()
        : "Never";

    return (
        <Card className="mb-4">
            <CardHeader>
                <IconBox icon={Clock} tone="success" title="List Synchronization" description={`Last Synced: ${lastSync}`} />
                {isLoading && <Spinner size="sm" />}
            </CardHeader>
            <CardBody>
                {error ? (
                    <Loading code={error.code}>{error.msg}</Loading>
                ) : data ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SettingRangeVertical
                            label="Auto-fetch Interval"
                            value={Math.floor(Number(data.refreshInterval || "0") / 60)}
                            min={0}
                            max={24 * 30}
                            step={1}
                            unit="Hours"
                            onChange={(refreshInterval) => patch({ refreshInterval: String(refreshInterval * 60) })}
                        />
                        <SettingInputVertical
                            label="Maxmind GeoIP Database URL"
                            value={data.maxMindDbGeoIp.downloadUrl}
                            onChange={(downloadUrl) => patch({ maxMindDbGeoIp: { ...data.maxMindDbGeoIp, downloadUrl } })}
                        />
                        <SwitchCard
                            label="Use Disk Host Index"
                            description="Use the disk-backed host index to reduce memory usage."
                            checked={data.hostIndexDisk}
                            onCheckedChange={(hostIndexDisk) => patch({ hostIndexDisk })}
                        />
                        {(data.error || data.maxMindDbGeoIp.error) && (
                            <div className="md:col-span-2 rounded-ui-lg border border-ui-danger/40 bg-ui-danger/10 p-3 text-sm text-ui-danger">
                                {data.error || data.maxMindDbGeoIp.error}
                            </div>
                        )}
                    </div>
                ) : (
                    <Loading />
                )}
            </CardBody>
            <CardFooter className="flex justify-end">
                <Button disabled={saving || !data} onClick={save}>
                    {saving ? <Spinner size="sm" className="mr-2" /> : <Save size={16} className="mr-2" />}
                    Save Configuration
                </Button>
            </CardFooter>
        </Card>
    );
}

function ListEditorModal({ name, onSaved, onClose }: { name: string | null; onSaved: () => void; onClose: () => void }) {
    const ctx = useContext(GlobalToastContext);
    const [draft, setDraft] = useState<RouteListDetail>(createDefaultRouteList());
    const { data, error, isLoading } = useSWR(name ? ["/api/v2/route/lists/detail", name] : null, () => getRouteList(name!), { revalidateOnFocus: false });

    useEffect(() => {
        if (data) setDraft(normalizeRouteList(data));
    }, [data]);

    const save = () => {
        if (!name) return;
        saveRouteList(name, draft)
            .then(() => {
                ctx.Info("list saved");
                onSaved();
            })
            .catch((err) => ctx.Error(err.msg ?? String(err)));
    };

    const remove = () => {
        if (!name || name === "bootstrap") return;
        deleteRouteList(name)
            .then(() => {
                ctx.Info("list deleted");
                onSaved();
            })
            .catch((err) => ctx.Error(err.msg ?? String(err)));
    };

    return (
        <Modal open={!!name} onOpenChange={(open) => !open && onClose()}>
            <ModalContent style={{ "--bs-modal-width": "760px" } as CSSProperties}>
                <ModalHeader closeButton><ModalTitle>{name}</ModalTitle></ModalHeader>
                <ModalBody>
                    {error && <Loading code={error.code}>{error.msg}</Loading>}
                    {isLoading && <Loading />}
                    {!isLoading && !error && <RouteListForm value={draft} onChange={setDraft} lockName />}
                </ModalBody>
                <ModalFooter className="flex justify-between">
                    <div>
                        {name !== "bootstrap" && (
                            <Button variant="outline-danger" onClick={remove}>
                                <Trash className="mr-2" size={16} />Delete List
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={onClose}>Cancel</Button>
                        <Button onClick={save}><Check className="mr-2" size={16} />Save</Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

function CreateListModal({ open, initialName, onSaved, onClose }: { open: boolean; initialName?: string; onSaved: () => void; onClose: () => void }) {
    const ctx = useContext(GlobalToastContext);
    const [draft, setDraft] = useState<RouteListDetail>(createDefaultRouteList());

    useEffect(() => {
        if (open) {
            setDraft(createDefaultRouteList(initialName ?? ""));
        }
    }, [open, initialName]);

    const save = () => {
        createRouteList(draft)
            .then(() => {
                ctx.Info("list created");
                onSaved();
            })
            .catch((err) => ctx.Error(err.msg ?? String(err)));
    };

    return (
        <Modal open={open} onOpenChange={(next) => !next && onClose()}>
            <ModalContent style={{ "--bs-modal-width": "760px" } as CSSProperties}>
                <ModalHeader closeButton><ModalTitle>New Route List</ModalTitle></ModalHeader>
                <ModalBody>
                    <RouteListForm value={draft} onChange={setDraft} />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={save} disabled={!draft.name.trim()}><Check className="mr-2" size={16} />Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

function RouteListForm({ value, onChange, lockName }: { value: RouteListDetail; onChange: (value: RouteListDetail) => void; lockName?: boolean }) {
    const sourceType = value.source.type || "local";
    const patch = (patchValue: Partial<RouteListDetail>) => onChange(normalizeRouteList({ ...value, ...patchValue }));
    const updateSourceType = (type: string) => {
        const currentLines = sourceType === "remote" ? value.source.remote?.urls ?? [] : value.source.local?.lists ?? [];
        patch({ source: type === "remote" ? { type, remote: { urls: currentLines } } : { type, local: { lists: currentLines } } });
    };
    const lines = sourceType === "remote" ? value.source.remote?.urls ?? [] : value.source.local?.lists ?? [];
    const updateLines = (values: string[]) => {
        patch({
            source: sourceType === "remote"
                ? { type: sourceType, remote: { urls: values } }
                : { type: sourceType, local: { lists: values } },
        });
    };

    return (
        <div className="flex flex-col gap-6">
            <SettingsBox>
                <div className="grid grid-cols-1 gap-6">
                    <SettingInputVertical label="Name" value={value.name} onChange={(name) => patch({ name })} disabled={lockName} />
                    <SettingSelectVertical label="Content Type" value={value.type} values={routeListTypes} onChange={(type) => patch({ type })} />
                    <div>
                        <SettingLabel className="mb-2">Source Mode</SettingLabel>
                        <ToggleGroup
                            type="single"
                            value={sourceType}
                            onValueChange={(type) => type && updateSourceType(type)}
                            className="w-full flex-nowrap"
                        >
                            <ToggleItem value={sourceTypes[0]} className="flex-grow whitespace-nowrap">
                                <Network className="mr-2" size={16} />Local
                            </ToggleItem>
                            <ToggleItem value={sourceTypes[1]} className="flex-grow whitespace-nowrap">
                                <CloudDownload className="mr-2" size={16} />Remote
                            </ToggleItem>
                        </ToggleGroup>
                    </div>
                </div>
            </SettingsBox>

            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-end justify-between gap-3 px-1">
                    <div>
                        <h6 className="mb-1 font-bold">{sourceType === "remote" ? "Remote Resource URLs" : "Local Rules"}</h6>
                        <small className="text-ui-muted">
                            {sourceType === "remote" ? "Files will be downloaded and updated automatically." : "Define rules manually for this list."}
                        </small>
                    </div>
                    <Badge variant="secondary" pill>{lines.length} Entries</Badge>
                </div>

                <div className="rounded-ui-lg border border-ui-border bg-ui-surface-muted p-4">
                    <InputList
                        title={sourceType === "remote" ? "URL" : "Rule"}
                        data={lines}
                        onChange={updateLines}
                        textarea
                        placeholder={sourceType === "remote" ? "https://example.com/list.txt" : "Add list entry"}
                    />
                </div>
            </div>

            {(value.errorMsgs?.length ?? 0) > 0 && (
                <div className="rounded-ui-lg border border-ui-danger/40 bg-ui-danger/10 p-4 text-sm text-ui-danger">
                    <div className="mb-2 flex items-center gap-2 font-bold">
                        <TriangleAlert size={16} />Error Messages
                    </div>
                    <pre className="whitespace-pre-wrap text-left font-mono text-xs">{value.errorMsgs?.join("\n")}</pre>
                </div>
            )}
        </div>
    );
}

export default Lists;
