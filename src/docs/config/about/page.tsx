import { PageHeader } from '@/component/v2/page-header';
import { useUpdateRecovery } from '@/hooks/use-update-recovery';
import { usePermission } from '@/auth/context';
import { useTranslation } from 'react-i18next';

import { applyUpdate, checkUpdate, getUpdateHistory, rollbackUpdate } from "@/api/update";
import { getInfo } from "@/api/settings";
import { Card, CardBody, CardFooter, CardHeader, IconBox, IconBoxRounded, ListItem, MainContainer, SettingLabel } from '@/component/v2/card';
import { Button } from "@/component/v2/button";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import { GlobalToastContext } from "@/component/v2/toast";
import type { UpdateChannel, UpdateCheck, UpdateHistoryEntry } from "@/contract/update";
import { BadgeCheck, Calendar, Check, Code, Cpu, Download, ExternalLink, GitBranch, GitFork, Info, Laptop, Layers, LayoutGrid, RefreshCw, Rocket, Terminal, RotateCcw, History } from 'lucide-react';
import React, { FC, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import Loading, { Error } from "../../../component/v2/loading";

const updateChannelKey = "yuhaiin_update_channel";
const updateChannels: Array<{ value: UpdateChannel; label: string }> = [
    { value: "stable", label: "Stable" },
    { value: "beta", label: "Beta" },
    { value: "main", label: "Main" },
];

const COPYRIGHT_YEAR = new Date().getFullYear();

function formatBytes(value: number): string {
    if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function updateErrorMessage(error: unknown): string {
    if (error instanceof globalThis.Error) return error.message;
    if (error && typeof error === "object") {
        const value = error as { msg?: unknown; raw?: unknown };
        if (typeof value.msg === "string") return value.msg;
        if (value.raw && typeof value.raw === "object" && "error" in value.raw) {
            const message = (value.raw as { error?: { message?: unknown } }).error?.message;
            if (typeof message === "string") return message;
        }
    }
    return String(error);
}

const InfoRow: FC<{
    label: string;
    value: string;
    icon?: React.ElementType;
    url?: string;
    isBadge?: boolean;
    isMonospace?: boolean;
}> = ({ label, value, icon, url, isBadge, isMonospace }) => (
    <div className="col-span-1">
        <ListItem className={url ? 'cursor-pointer' : 'cursor-default'}>
            <div className="grid w-full min-w-0 grid-cols-1 items-center gap-2 sm:grid-cols-2 sm:gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
                    <IconBoxRounded
                        icon={icon || LayoutGrid}
                        tone="primary"
                        className="flex-shrink-0 w-8 h-8 text-[0.9rem] border-none"
                    />
                    <span className="text-ui-muted text-xs font-bold uppercase opacity-75 min-w-[90px] text-[0.7rem] tracking-[0.5px]">
                        {label}
                    </span>
                </div>

                <div className="min-w-0 text-left sm:text-right">
                    {url ? (
                        <a href={url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center justify-start sm:justify-end gap-1.5 font-mono text-ui-primary no-underline" title={value}>
                            <span className="min-w-0 truncate">{value}</span><ExternalLink className="shrink-0" size={12} aria-hidden="true" />
                        </a>
                    ) : isBadge ?
                        <span className="inline-flex max-w-full items-center gap-1.5 rounded-ui-sm bg-ui-primary-soft px-2 py-1 text-xs text-ui-primary" title={value}><BadgeCheck size={14} className="shrink-0" /><span className="min-w-0 truncate">{value}</span></span>
                        : (
                            <span className={`${isMonospace ? 'font-mono' : ''} truncate block text-[0.9rem]`} >
                                {value}
                            </span>
                        )
                    }
                </div>
            </div>
        </ListItem>
    </div>
);

export default function About() {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const { data: info, isLoading, error, mutate: refreshInfo } = useSWR("/api/v2/info", () => getInfo());
    const [channel, setChannel] = useState<UpdateChannel>(() => {
        if (typeof window === "undefined") return "stable";
        const saved = window.localStorage.getItem(updateChannelKey);
        return saved === "stable" || saved === "beta" || saved === "main" ? saved : "stable";
    });
    const [update, setUpdate] = useState<UpdateCheck>();
    const [checkingUpdate, setCheckingUpdate] = useState(false);
    const [applyingUpdate, setApplyingUpdate] = useState(false);
    const [restoringVersion, setRestoringVersion] = useState(false);
    const canManageUpdates = usePermission('update:manage');
    const { data: history, error: historyError, mutate: refreshHistory } = useSWR(
        canManageUpdates ? "/api/v2/update/history" : null,
        getUpdateHistory,
        { revalidateOnFocus: false },
    );

    const recovery = useUpdateRecovery(next => {
        void refreshInfo(next, { revalidate: false });
        setUpdate(undefined);
        void refreshHistory();
        ctx.Info(uiT('updateCompleted'));
    });
    const updateStatus = recovery.status;

    useEffect(() => {
        window.localStorage.setItem(updateChannelKey, channel);
    }, [channel]);

    const handleCheckUpdate = async () => {
        setCheckingUpdate(true);
        try {
            setUpdate(await checkUpdate(channel));
        } catch (err) {
            ctx.Error(`Check update failed: ${updateErrorMessage(err)}`);
        } finally {
            setCheckingUpdate(false);
        }
    };

    const handleApplyUpdate = async () => {
        if (!update?.updateAvailable || !update.targetTag || recovery.active || !info) return;
        setApplyingUpdate(true);
        recovery.begin(update, info);
        try {
            await applyUpdate(channel, update.targetTag);
            ctx.Info("Update started. The service will restart shortly.");
        } catch (err) {
            // A network disconnect may be the service restarting after accepting the update.
            if (err && typeof err === 'object' && 'code' in err && err.code !== 0) {
                recovery.fail(updateErrorMessage(err)); ctx.Error(`Update failed: ${updateErrorMessage(err)}`);
            }
        } finally {
            setApplyingUpdate(false);
        }
    };

    const handleRollback = async (entry: UpdateHistoryEntry) => {
        if (recovery.active || restoringVersion || applyingUpdate || !info) return;
        if (!window.confirm(uiT("restoreVersionConfirm", { version: entry.version || entry.id.slice(0, 8) }))) return;
        setRestoringVersion(true);
        recovery.beginTarget(entry.version || entry.id, info);
        try {
            await rollbackUpdate(entry.id);
            ctx.Info(uiT("restoreVersionStarted"));
        } catch (err) {
            if (err && typeof err === "object" && "code" in err && err.code !== 0) {
                recovery.fail(updateErrorMessage(err));
                ctx.Error(updateErrorMessage(err));
            }
        } finally {
            setRestoringVersion(false);
        }
    };

    if (!info && (recovery.active || recovery.phase === 'timeout')) return <MainContainer><Card><CardBody>
        <p role="status" data-update-phase={recovery.phase}>{uiT(recovery.phase === 'timeout' ? 'updateRecoveryTimeout' : 'updateWaitingForRestart')}</p>
        {recovery.phase === 'timeout' && <Button className="mt-3" onClick={recovery.retry}>{uiT('retry')}</Button>}
    </CardBody></Card></MainContainer>;
    if (error && !info) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || !info) return <Loading />

    return (
        <MainContainer className="flex flex-col">
            <PageHeader title={uiT("about")} className="order-first" />
            <Card className="order-2">
                <CardHeader className="py-3">
                    <IconBox icon={Info} tone="violet" title={uiT("systemInformation")} description={uiT("softwareVersionAndBuildEnvironment")} />
                </CardHeader>

                <CardBody>
                    <div className="grid grid-cols-1 gap-4">
                        {/* Primary Build Info */}
                        <InfoRow label={uiT("version")} value={info.version || "Unknown"} icon={BadgeCheck} isBadge />
                        <InfoRow
                            label={uiT("commit")}
                            value={info.commit?.substring(0, 7) || "N/A"}
                            icon={GitBranch}
                            url={info.commit ? `https://github.com/yuhaiin/yuhaiin/commit/${info.commit}` : undefined}
                            isMonospace
                        />
                        <InfoRow label={uiT("buildTime")} value={info.buildTime || "N/A"} icon={Calendar} />

                        {/* Environment Info */}
                        <InfoRow label={uiT("goVersion")} value={info.goVersion || "N/A"} icon={Code} isMonospace />
                        <InfoRow
                            label={uiT("github")}
                            value="yuhaiin/yuhaiin"
                            icon={GitFork}
                            url="https://github.com/yuhaiin/yuhaiin"
                        />

                        {/* Hardware Info */}
                        <InfoRow label={uiT("os")} value={info.os || "N/A"} icon={Cpu} />
                        <InfoRow label={uiT("arch")} value={info.arch || "N/A"} icon={Layers} isMonospace />
                        <InfoRow label={uiT("compiler")} value={info.compiler || "N/A"} icon={Terminal} />
                        <InfoRow label={uiT("platform")} value={info.platform || "N/A"} icon={Laptop} />
                    </div>
                </CardBody>

                {/* Build Tags / Features Section */}
                {info.build && info.build.length > 0 && (
                    <CardFooter className="border-ui-border bg-transparent p-4">
                        <SettingLabel className={"mb-2 block text-ui-muted"}>{uiT("buildParameters")}</SettingLabel>
                        <div className="flex flex-wrap gap-2">
                            {info.build.map((tag, idx) => (
                                <div key={idx} className="rounded-ui-sm border border-ui-border bg-ui-surface-muted px-2 py-1 font-mono text-sm break-all">
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </CardFooter>
                )}
            </Card>

            <Card className="order-1">
                <CardHeader className="py-3">
                    <IconBox icon={Rocket} tone="success" title={uiT("softwareUpdate")} description={uiT("checkGithubReleasesForANewerDesktopBuild")} />
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div>
                            <SettingLabel>{uiT("updateChannel")}</SettingLabel>
                            <ToggleGroup
                                type="single"
                                value={channel}
                                onValueChange={(value) => value && setChannel(value as UpdateChannel)}
                                className="w-full"
                            >
                                {updateChannels.map((item) => (
                                    <ToggleItem key={item.value} value={item.value} className="flex-grow py-1 h-10">
                                        {item.label}
                                    </ToggleItem>
                                ))}
                            </ToggleGroup>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button permission="update:manage" variant="default" onClick={handleCheckUpdate} disabled={checkingUpdate || applyingUpdate || recovery.active}>
                                <RefreshCw className={checkingUpdate ? "mr-2 animate-spin" : "mr-2"} size={16} />
                                {uiT("checkForUpdates")}</Button>
                            {update?.updateAvailable && (
                                <Button permission="update:manage" className="min-w-0 max-w-full" variant="default" onClick={handleApplyUpdate} disabled={applyingUpdate || recovery.active || !update.supported}>
                                    <Download className="mr-2" size={16} />
                                    <span className="min-w-0 truncate">{applyingUpdate || recovery.active ? uiT('updateInProgress') : uiT('updateToVersion', { version: update.targetVersion })}</span>
                                </Button>
                            )}
                        </div>

                        {recovery.active && (
                            <div role="status" data-update-phase={recovery.phase} className="rounded-ui-md border border-ui-border bg-ui-surface-muted p-4 text-sm">
                                <div className="flex items-center justify-between gap-3 font-semibold text-ui-heading">
                                    <span>{uiT(recovery.phase === 'restarting' ? 'updateWaitingForRestart' : 'updateInProgress')}</span>
                                    <span>{(updateStatus?.progress ?? 0) > 0 ? `${(updateStatus?.progress ?? 0)}%` : "..."}</span>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-ui-border" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={(updateStatus?.progress ?? 0)}>
                                    <div className="h-full rounded-full bg-ui-primary transition-[width] duration-300" style={{ width: `${Math.max(2, (updateStatus?.progress ?? 0))}%` }} />
                                </div>
                                {(updateStatus?.totalBytes ?? 0) > 0 && (
                                    <div className="mt-2 text-xs text-ui-muted">
                                        {formatBytes((updateStatus?.bytesDownloaded ?? 0))} / {formatBytes((updateStatus?.totalBytes ?? 0))}
                                    </div>
                                )}
                            </div>
                        )}

                        {recovery.phase === 'error' && (
                            <div className="rounded-ui-md border border-ui-danger/40 bg-ui-danger-soft p-4 text-sm text-ui-danger">
                                {uiT("updateFailed")} {recovery.failure}
                            </div>
                        )}

                        {(recovery.phase === 'complete' || recovery.phase === 'timeout') && <div role="status" data-update-phase={recovery.phase} className="rounded-ui-md border border-ui-border bg-ui-surface-muted p-4 text-sm">
                            {uiT(recovery.phase === 'complete' ? 'updateCompleted' : 'updateRecoveryTimeout')}
                            {recovery.phase === 'timeout' && <Button size="sm" className="ml-3" onClick={recovery.retry}>{uiT('retry')}</Button>}
                        </div>}

                        {canManageUpdates && <section className="border-t border-ui-border pt-4" aria-label={uiT("previousVersions")}>
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 font-semibold text-ui-heading">
                                    <History size={16} />
                                    <span>{uiT("previousVersions")}</span>
                                </div>
                                <span className="text-xs text-ui-muted">{uiT("retainTwoVersions")}</span>
                            </div>
                            {historyError && <p role="alert" className="text-sm text-ui-danger">{uiT("versionHistoryUnavailable")}</p>}
                            {!historyError && history && history.items.length === 0 && (
                                <p className="text-sm text-ui-muted">{uiT("noPreviousVersions")}</p>
                            )}
                            <div className="space-y-2">
                                {history?.items.map(entry => (
                                    <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-ui-md border border-ui-border bg-ui-surface-muted p-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="font-mono text-sm font-semibold break-all">{entry.version || entry.id.slice(0, 12)}</div>
                                            <div className="mt-1 text-xs text-ui-muted">
                                                {new Date(entry.savedAt).toLocaleString()} · {formatBytes(entry.size)}
                                                {entry.commit ? ` · ${entry.commit.slice(0, 7)}` : ""}
                                            </div>
                                        </div>
                                        <Button
                                            permission="update:manage"
                                            size="sm"
                                            variant="default"
                                            disabled={recovery.active || applyingUpdate || restoringVersion}
                                            onClick={() => void handleRollback(entry)}
                                        >
                                            <RotateCcw size={14} className="mr-1.5" />
                                            {uiT("restoreVersion")}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            {history?.items.length ? <p className="mt-3 text-xs text-ui-muted">{uiT("rollbackBinaryOnly")}</p> : null}
                        </section>}

                        {update && (
                            <div className="rounded-ui-md border border-ui-border bg-ui-surface-muted p-4 text-sm">
                                {update.updateAvailable ? (
                                    <>
                                        <div className="flex items-center gap-2 font-semibold text-ui-heading">
                                            <Check size={16} className="text-ui-success" />
                                            <span className="min-w-0 break-all">{update.targetVersion} {uiT("isAvailable")}</span></div>
                                        <div className="mt-2 space-y-1 text-ui-muted">
                                            <div>{uiT("currentVersion")}<span className="break-all font-mono">{update.currentVersion || "Unknown"}</span></div>
                                            <div>{uiT("asset")}<span className="break-all font-mono">{update.assetName}</span></div>
                                            {update.publishedAt && <div>{uiT("published")} {new Date(update.publishedAt).toLocaleString()}</div>}
                                        </div>
                                        {update.releaseNotes && <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap text-xs text-ui-muted">{update.releaseNotes}</pre>}
                                    </>
                                ) : (
                                    <div className="text-ui-muted">{update.reason || "You are using the latest available version."}</div>
                                )}
                            </div>
                        )}
                    </div>
                </CardBody>
            </Card>

            <div className="order-3 text-center mt-4 opacity-50 pb-12">
                <small className="text-ui-muted">
                    {uiT("copy")} {COPYRIGHT_YEAR} {uiT("yuhaiinProjectDistributedUnderMitLicense")}</small>
            </div>
        </MainContainer>
    );
}
