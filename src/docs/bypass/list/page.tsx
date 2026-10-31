import { StageChangeButton } from "@/component/configuration-change";
import { SecretValues } from "@/component/secret-values";
import { hasSecretPlaceholder, isSecretPlaceholder, useProtectedSetting } from "@/auth/secret-fields";
import { confirmAction } from '@/component/v2/confirmation';
import { ResourceEditorFrame, ResourceWorkspace, useResourceSelection } from '@/component/resource-workspace';
import { useHashSearch } from '@/hooks/useHashLocation';
import { useServerPageClamp } from "@/hooks/use-pagination";
import { useTranslation } from 'react-i18next';
import { useAsyncAction, useCloseGuard, useEditorDraft } from "@/hooks/use-editor-draft";

import { applyRouteChanges, createRouteList, deleteRouteList, getRouteActivationStatus, getRouteList, getRouteListSecrets, getRouteListConfig, listRouteLists, refreshRouteLists, saveRouteList, saveRouteListConfig } from "@/api/route";
import { Badge } from "@/component/v2/badge";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardFooter, CardHeader, IconBox, MainContainer, SettingLabel, SettingsBox } from "@/component/v2/card";
import { SettingInputVertical, SettingRangeVertical, SettingSelectVertical, SwitchCard } from "@/component/v2/forms";
import { InputList } from "@/component/v2/listeditor";
import Loading from "@/component/v2/loading";
import { RouteActivationProgress } from "@/component/v2/route-activation-progress";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import type { RouteListDetail } from "@/contract/route";
import { createDefaultRouteList, normalizeRouteList } from "@/contract/route";
import { RegistryCatalogModal } from "./registry-catalog";
import {
    Check,
    Clock,
    CloudDownload,
    Network,
    RefreshCw,
    Save,
    Trash,
    TriangleAlert,
} from "lucide-react";
import { useCallback, useContext, useState } from "react";
import useSWR, { useSWRConfig } from "swr";

const routeListTypes = ["host", "process", "cidr", "domain", "regexp", "keyword", "suffix"];
const sourceTypes = ["local", "remote"];
const PAGE_SIZE = 12;

function shortPreview(value: string | undefined, savedLabel: string) {
    if (isSecretPlaceholder(value)) return savedLabel;
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

function Lists() {
    const { t: uiT } = useTranslation('ui');
    const { t: authT } = useTranslation('auth');
    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const search = useHashSearch();
    const [creatingDraft, setCreatingDraft] = useState<RouteListDetail | undefined>();
    const [registryOpen, setRegistryOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { data: activation, mutate: mutateActivation } = useSWR('/api/v2/route/activation', getRouteActivationStatus, {
        revalidateOnFocus: false,
        refreshInterval: status => Math.max(status?.hostIndexRefreshAt ?? 0, status?.ruleApplyAt ?? 0) > 0 || (status?.savedRevision ?? 0) > (status?.appliedRevision ?? 0) ? 1000 : 0,
    });
    const { data, error, isLoading, mutate } = useSWR(['/api/v2/route/lists', page, query], () => listRouteLists({ page, pageSize: PAGE_SIZE, query }), { revalidateOnFocus: false, keepPreviousData: true });
    useServerPageClamp(data?.page, page, setPage);
    const items = data?.items ?? [];
    const selection = useResourceSelection(items.map(item => item.id), new URLSearchParams(search).get('list'));
    const refresh = async () => {
        if (isRefreshing) return;
        setIsRefreshing(true);
        try { await refreshRouteLists(); await Promise.all([mutate(), mutateActivation()]); }
        catch (error) { ctx.Error(String((error as { msg?: string })?.msg ?? error)); }
        finally { setIsRefreshing(false); }
    };
    const saved = (deleted = false) => { void mutate(); void mutateActivation(); if (deleted) selection.close(); };
    if (error && !data) return <Loading onRetry={() => void mutate()}>{error.msg}</Loading>;
    if (isLoading && !data) return <Loading />;
    return <MainContainer className="max-w-[1440px]">
        <RouteActivationProgress status={activation} onApplied={mutateActivation} />
        <ResourceWorkspace createDisabled={selection.creating} title={uiT('definedLists')} description={uiT('matchSourcesForRouteRules')} selectedId={selection.id} editing={selection.creating || Boolean(selection.id)}
            onSelect={selection.select} onCreate={() => selection.create(() => setCreatingDraft(undefined))}
            search={{ value: query, onChange: value => { setPage(1); setQuery(value); } }}
            pagination={{ page: data?.page.page || page, pageSize: PAGE_SIZE, total: data?.page.total ?? 0, onChange: setPage }}
            items={items.map(item => ({ id: item.id, name: item.name, description: `${item.type === 'host' ? '' : `${item.type} · `}${shortPreview(item.preview, authT("secrets.saved"))}`, status: <span className="flex shrink-0 items-center gap-1.5 text-xs tabular-nums text-ui-muted" title={uiT('entries')}>{item.errorCount > 0 && <TriangleAlert size={14} className="text-ui-danger" aria-hidden="true" />}{item.itemCount}</span> }))}
            actions={<><Button size="sm" variant="outline-secondary" onClick={refresh} disabled={isRefreshing}>{isRefreshing ? <Spinner size="sm" /> : <RefreshCw size={16} className="mr-2" />}{uiT('sync')}</Button><Button size="sm" variant="outline-secondary" onClick={() => setRegistryOpen(true)}><CloudDownload size={16} className="mr-2" />Registry</Button></>}>
            {selection.creating ? <CreateListModal presentation="inline" open initialValue={creatingDraft} initialName={creatingDraft?.name}
                onSaved={id => { saved(); selection.saved(id); }} onClose={selection.close} />
                : <ListEditorModal presentation="inline" name={selection.id || null} onSaved={saved} onClose={selection.close} />}
        </ResourceWorkspace>
        <details className="mt-8"><summary className="cursor-pointer text-sm font-semibold text-ui-heading">{uiT('listSynchronization')}</summary><div className="mt-4"><ListConfigCard onSaved={() => void mutateActivation()} /></div></details>
        <RegistryCatalogModal open={registryOpen} onClose={() => setRegistryOpen(false)} onSelectList={value => selection.create(() => { setCreatingDraft(value); setRegistryOpen(false); })} />
    </MainContainer>;
}

function ListConfigCard({ onSaved }: { onSaved: () => void }) {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');
    const { mutate: refreshCache } = useSWRConfig();
    const [actionError, setActionError] = useState('');

    const ctx = useContext(GlobalToastContext);
    const { data: server, error, isLoading, mutate } = useSWR("/api/v2/route/lists/config", getRouteListConfig, { revalidateOnFocus: false });

    const { value: data, setValue: setDraft, commit, dirty } = useEditorDraft("getRouteListConfig", server, () => undefined);
    const { pending: saving, run } = useAsyncAction(error => { const message = String((error as { msg?: string })?.msg ?? error); setActionError(message); ctx.Error(message); void refreshCache("/api/v2/route/activation"); });
    useCloseGuard(dirty, saving, () => undefined);
    const patch = (patchValue: Partial<NonNullable<typeof data>>) => setDraft(prev => prev ? { ...prev, ...patchValue } : prev);
    const save = () => {
        if (!data || saving || error || isLoading) return;
        void run(async () => {
            setActionError('');
            if (dirty) {
                const next = await saveRouteListConfig(data);
                commit(next);
                await mutate(next, { revalidate: false });
            }
            void refreshCache("/api/v2/route/activation");
            await applyRouteChanges();
            onSaved();
            ctx.Info("list config saved");
        });
    };

    const refreshTimestamp = Number(data?.lastRefreshTime);
    const refreshDate = Number.isFinite(refreshTimestamp) && refreshTimestamp > 0
        ? new Date(refreshTimestamp * 1000)
        : undefined;
    const lastSync = refreshDate && !Number.isNaN(refreshDate.getTime())
        ? refreshDate.toLocaleString()
        : "Never";
    const refreshMinutes = Number(data?.refreshInterval ?? 0) / 60;
    const refreshHours = Number.isFinite(refreshMinutes) ? Math.max(0, Math.floor(refreshMinutes)) : 0;

    return (
        <Card className="mb-4">
            <fieldset disabled={saving} className="contents">
            <CardHeader>
                <IconBox icon={Clock} tone="success" title={uiT("listSynchronization")} description={uiT("lastSynced", { time: lastSync })} />
                {isLoading && <Spinner size="sm" />}
            </CardHeader>
            <CardBody>
                {actionError && <p role="alert" className="mb-3 text-sm text-ui-danger">{actionError}</p>}
                {error ? (
                    <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
                ) : data ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SettingRangeVertical
                            label={uiT("autoFetchInterval")}
                            value={refreshHours}
                            min={0}
                            max={24 * 30}
                            step={1}
                            unit="Hours"
                            onChange={(refreshInterval) => patch({ refreshInterval: String(refreshInterval * 60) })}
                        />
                        <SettingInputVertical
                            label={uiT("maxmindGeoipDatabaseUrl")}
                            value={data.maxMindDbGeoIp.downloadUrl}
                            onChange={(downloadUrl) => patch({ maxMindDbGeoIp: { ...data.maxMindDbGeoIp, downloadUrl } })}
                        />
                        <SwitchCard
                            label={uiT("useDiskHostIndex")}
                            description={uiT("useTheDiskBackedHostIndexToReduceMemoryUsage")}
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
                <Button permission="routes:write" disabled={saving || !data || Boolean(error)} onClick={save}>
                    {saving ? <Spinner size="sm" className="mr-2" /> : <Save size={16} className="mr-2" />}
                    {t(actionError && !dirty ? "retryApply" : "saveAndApply")}</Button>
            </CardFooter>
            </fieldset>
        </Card>
    );
}

function ListEditorModal({ name, onSaved, onClose, presentation = "modal" }: { name: string | null; onSaved: (deleted?: boolean) => void; onClose: () => void; presentation?: "modal" | "inline" }) {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');
    const { mutate: refreshCache } = useSWRConfig();
    const [actionError, setActionError] = useState('');
    const [deleted, setDeleted] = useState(false);
    const [previousName, setPreviousName] = useState(name);
    if (previousName !== name) {
        setPreviousName(name);
        setActionError('');
        setDeleted(false);
    }

    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useSWR(name ? ["/api/v2/route/lists/detail", name] : null, () => getRouteList(name!), { revalidateOnFocus: false });

    const { value: draft, setValue: setDraft, dirty, commit } = useEditorDraft(name, data, createDefaultRouteList);
    const { pending, run } = useAsyncAction(error => { const message = error instanceof Error ? error.message : String((error as { msg?: string })?.msg ?? error); setActionError(message); ctx.Error(message); void refreshCache("/api/v2/route/activation"); });
    const close = useCloseGuard(dirty, pending, onClose);
    const save = () => {
        if (!name || !data || error || isLoading || pending) return;
        void run(async () => {
            setActionError('');
            if (dirty && !deleted) { const saved = await saveRouteList(name, draft); commit(saved); await mutate(saved, { revalidate: false }); }
            void refreshCache("/api/v2/route/activation");
            await applyRouteChanges();
            ctx.Info("list saved");
            onSaved(deleted);
        });
    };
    const remove = async () => {
        if (!name || name === "bootstrap" || pending || !data || error || isLoading || !await confirmAction("Delete this list?")) return;
        void run(async () => {
            await deleteRouteList(name);
            setDeleted(true);
            commit(draft);
            void refreshCache("/api/v2/route/activation");
            await applyRouteChanges();
            ctx.Info("list deleted");
            onSaved(true);
        });
    };

    return <ResourceEditorFrame title={draft.name || (isLoading ? ' ' : name)} label={uiT('definedLists')} presentation={presentation} open={!!name} onClose={close}
        footer={<>
                    <div>
                        {name !== "bootstrap" && (
                            <Button permission="routes:write" variant="outline-danger" disabled={pending || deleted || isLoading || Boolean(error) || !data} onClick={remove}>
                                <Trash className="mr-2" size={16} />{uiT("deleteList")}</Button>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button onClick={close} disabled={pending}>{uiT("cancel")}</Button>
                        <StageChangeButton disabled={pending || deleted || isLoading || Boolean(error) || !data} request={{ store: "configuration", kind: "route-list", resourceId: draft.id, payload: draft }} onCommitted={async () => { const next = await getRouteList(draft.id); commit(next); await mutate(next, { revalidate: false }); onSaved(); }} />
                        <Button permission="routes:write" variant="primary" disabled={pending || isLoading || Boolean(error) || !data} onClick={save}><Check className="mr-2" size={16} />{t(actionError && !dirty ? "retryApply" : "saveAndApply")}</Button>
                    </div>
                </>}>
                    <fieldset disabled={pending} className="contents">
                    {actionError && <p role="alert" className="mb-3 text-sm text-ui-danger">{actionError}</p>}
                    {error && <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>}
                    {isLoading && <Loading />}
                    {!isLoading && !error && data && !deleted && <RouteListForm value={draft} onChange={setDraft} />}
                </fieldset>
                </ResourceEditorFrame>;
}

function CreateListModal({ open, initialName, initialValue, onSaved, onClose, presentation = "modal" }: { open: boolean; initialName?: string; initialValue?: RouteListDetail; onSaved: (id: string) => void; onClose: () => void; presentation?: "modal" | "inline" }) {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');
    const { mutate: refreshCache } = useSWRConfig();
    const [actionError, setActionError] = useState('');
    const [previousOpen, setPreviousOpen] = useState(open);
    if (previousOpen !== open) {
        setPreviousOpen(open);
        setActionError('');
    }

    const ctx = useContext(GlobalToastContext);
    const createDraft = useCallback(() => initialValue ? normalizeRouteList(initialValue) : createDefaultRouteList(initialName ?? ''), [initialName, initialValue]);
    const { value: draft, setValue: setDraft, commit, dirty } = useEditorDraft(open ? `new-list:${initialName ?? ''}` : null, undefined, createDraft);
    const { pending, run } = useAsyncAction(error => { const message = String((error as { msg?: string })?.msg ?? error); setActionError(message); ctx.Error(message); void refreshCache("/api/v2/route/activation"); });
    const close = useCloseGuard(dirty, pending, onClose);

    const save = () => {
        if (pending || !draft.name.trim()) return;
        void run(async () => {
        setActionError('');
        const saved = dirty || draft.revision === 0 ? (draft.revision > 0 ? await saveRouteList(draft.id, draft) : await createRouteList(draft)) : draft;
        commit(saved);
        await refreshCache(["/api/v2/route/lists/detail", saved.id], saved, { revalidate: false });
        void refreshCache("/api/v2/route/activation");
        await applyRouteChanges();
        ctx.Info("list created");
        onSaved(saved.id);
        });
    };

    return <ResourceEditorFrame title={uiT("newRouteList")} label={uiT('definedLists')} presentation={presentation} open={open} onClose={close}
        footer={<>
                    <Button onClick={close} disabled={pending}>{uiT("cancel")}</Button>
                    <StageChangeButton disabled={pending || !draft.name.trim()} request={{ store: "configuration", kind: "route-list", resourceId: draft.id || undefined, payload: draft }} onCommitted={async change => { onSaved(change.resourceId); }} />
                    <Button permission="routes:write" variant="primary" onClick={save} disabled={pending || !draft.name.trim()}><Check className="mr-2" size={16} />{t(actionError && !dirty && draft.revision > 0 ? "retryApply" : "saveAndApply")}</Button>
                </>}>
                    <fieldset disabled={pending} className="contents">
                    {actionError && <p role="alert" className="mb-3 text-sm text-ui-danger">{actionError}</p>}
                    <RouteListForm value={draft} onChange={setDraft} />
                </fieldset>
                </ResourceEditorFrame>;
}

type RouteListFormProps = { value: RouteListDetail; onChange: (value: RouteListDetail) => void; lockName?: boolean };
export function RouteListForm(props: RouteListFormProps) {
    return <SecretValues value={props.value} load={props.value.revision > 0 ? signal => getRouteListSecrets(props.value.id, signal) : undefined}><RouteListFormFields {...props} /></SecretValues>;
}
function RouteListFormFields({ value, onChange, lockName }: RouteListFormProps) {
    const manageSecrets = useProtectedSetting("manage");
    const { t: uiT } = useTranslation('ui');

    const sourceType = value.source.type || "local";
    const patch = (patchValue: Partial<RouteListDetail>) => onChange(normalizeRouteList({ ...value, ...patchValue }));
    const updateSourceType = (type: string) => {
        const previousLines = sourceType === "remote" ? value.source.remote?.urls ?? [] : value.source.local?.lists ?? [];
        const currentLines = hasSecretPlaceholder(previousLines) ? [] : previousLines;
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
                    <SettingInputVertical label={uiT("name")} value={value.name} onChange={(name) => patch({ name })} disabled={lockName} />
                    <SettingSelectVertical label={uiT("contentType")} value={value.type} values={routeListTypes} onChange={(type) => patch({ type })} />
                    <div>
                        <SettingLabel className="mb-2">{uiT("sourceMode")}</SettingLabel>
                        <ToggleGroup
                            type="single"
                            value={sourceType}
                            onValueChange={(type) => type && updateSourceType(type)}
                            className="w-full flex-nowrap"
                        >
                            <ToggleItem disabled={sourceType === "remote" && !manageSecrets} value={sourceTypes[0]} className="flex-grow whitespace-nowrap">
                                <Network className="mr-2" size={16} />{uiT("local")}</ToggleItem>
                            <ToggleItem disabled={!manageSecrets} value={sourceTypes[1]} className="flex-grow whitespace-nowrap">
                                <CloudDownload className="mr-2" size={16} />{uiT("remote")}</ToggleItem>
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
                    <Badge variant="secondary" pill>{lines.length} {uiT("entries")}</Badge>
                </div>

                <div className="rounded-ui-lg border border-ui-border bg-ui-surface-muted p-4">
                    <InputList
                        title={sourceType === "remote" ? "URL" : "Rule"}
                        data={lines}
                        secret={sourceType === "remote"}
                        onChange={updateLines}
                        textarea
                        placeholder={sourceType === "remote" ? "https://example.com/list.txt" : "Add list entry"}
                    />
                </div>
            </div>

            {(value.errorMsgs?.length ?? 0) > 0 && (
                <div className="rounded-ui-lg border border-ui-danger/40 bg-ui-danger/10 p-4 text-sm text-ui-danger">
                    <div className="mb-2 flex items-center gap-2 font-bold">
                        <TriangleAlert size={16} />{uiT("errorMessages")}</div>
                    <pre className="whitespace-pre-wrap text-left font-mono text-xs">{value.errorMsgs?.join("\n")}</pre>
                </div>
            )}
        </div>
    );
}

export default Lists;
