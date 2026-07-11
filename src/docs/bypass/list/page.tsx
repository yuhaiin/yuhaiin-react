"use client"

import { createRouteList, deleteRouteList, getRouteActivationStatus, getRouteList, getRouteListConfig, listRouteLists, refreshRouteLists, saveRouteList, saveRouteListConfig } from "@/api/route";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardFooter, CardHeader, CardRowList, FilterSearch, IconBox, MainContainer, SettingLabel, SettingsBox } from "@/component/v2/card";
import { SettingInputVertical, SettingRangeVertical, SettingSelectVertical } from "@/component/v2/forms";
import { InputList } from "@/component/v2/listeditor";
import Loading from "@/component/v2/loading";
import { RouteActivationProgress } from "@/component/v2/route-activation-progress";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import type { RouteListDetail } from "@/contract/route";
import { createDefaultRouteList, normalizeRouteList } from "@/contract/route";
import { Check, ChevronRight, Clock, CloudDownload, FileText, List, Network, Plus, RefreshCw, Save, Trash, TriangleAlert } from "lucide-react";
import type { CSSProperties } from "react";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";

const routeListTypes = ["host", "process", "cidr", "domain", "regexp", "keyword", "suffix"];
const sourceTypes = ["local", "remote"];
const PAGE_SIZE = 8;

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
        { revalidateOnFocus: false },
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
            <CardRowList
                layout="list"
                paginated
                pageSize={PAGE_SIZE}
                currentPage={data.page.page || page}
                totalItems={data.page.total}
                onPageChange={setPage}
                items={data.items}
                getKey={(v) => v.name}
                renderListItem={(item) => (
                    <div className="grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ui-md bg-ui-primary-soft text-ui-primary">
                            <FileText size={19} />
                        </div>
                        <div className="min-w-0">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                                <span className="truncate font-semibold text-ui-heading">{item.name}</span>
                                <Badge variant="secondary" className="shrink-0">{item.type || "-"}</Badge>
                                {item.errorCount > 0 && <Badge variant="danger" className="shrink-0">{item.errorCount} errors</Badge>}
                            </div>
                            <div className="mt-2 grid min-w-0 gap-2 text-xs text-ui-muted sm:grid-cols-[auto_auto_minmax(0,1fr)]">
                                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-ui-sm bg-ui-surface-muted px-2 py-1">
                                    <span>Source</span>
                                    <span className="font-medium text-ui-fg">{item.source || "-"}</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-ui-sm bg-ui-surface-muted px-2 py-1">
                                    <span>Entries</span>
                                    <span className="font-medium text-ui-fg">{item.itemCount}</span>
                                </span>
                                <span className="flex min-w-0 items-center gap-1.5 rounded-ui-sm bg-ui-surface-muted px-2 py-1">
                                    <span className="shrink-0">Preview</span>
                                    <span className="min-w-0 truncate font-mono text-ui-fg">{item.preview || "-"}</span>
                                </span>
                            </div>
                        </div>
                        <ChevronRight className="shrink-0 text-ui-muted/55" size={20} />
                    </div>
                )}
                onClickItem={(item) => setEditing(item.name)}
                header={
                    <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <IconBox icon={List} color="#2563eb" title="Defined Lists" description={`${data.page.total} lists available`} />
                        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
                            <FilterSearch className="min-w-0 flex-1 sm:w-[180px] sm:flex-none" onEnter={(v) => { setPage(1); setQuery(v); }} size="sm" />
                            <Button size="sm" onClick={refresh} disabled={isRefreshing}>
                                {isRefreshing ? <Spinner size="sm" className="mr-2" /> : <RefreshCw size={16} className="mr-2" />}
                                Sync All Resources
                            </Button>
                            <Button size="sm" onClick={() => { setCreatingName(""); setCreating(true); }}><Plus size={16} className="mr-1" /> Add</Button>
                        </div>
                    </div>
                }
            />
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
                <IconBox icon={Clock} color="#10b981" title="List Synchronization" description={`Last Synced: ${lastSync}`} />
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
                        <small className="text-gray-500 dark:text-gray-400">
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
