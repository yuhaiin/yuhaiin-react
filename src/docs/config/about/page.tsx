"use client"

import { applyUpdate, checkUpdate, getUpdateStatus } from "@/api/update";
import { getInfo } from "@/api/settings";
import { Card, CardBody, CardFooter, CardHeader, IconBadge, IconBox, IconBoxRounded, ListItem, MainContainer, SettingLabel } from '@/component/v2/card';
import { Button } from "@/component/v2/button";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import { GlobalToastContext } from "@/component/v2/toast";
import type { UpdateChannel, UpdateCheck, UpdateStatus } from "@/contract/update";
import { BadgeCheck, Calendar, Check, Code, Cpu, Download, ExternalLink, GitBranch, GitFork, Info, Laptop, Layers, LayoutGrid, RefreshCw, Rocket, Terminal } from 'lucide-react';
import React, { FC, useContext, useEffect, useState } from "react";
import useSWR from "swr";
import Loading, { Error } from "../../../component/v2/loading";

const updateChannelKey = "yuhaiin_update_channel";
const updateChannels: Array<{ value: UpdateChannel; label: string }> = [
    { value: "stable", label: "Stable" },
    { value: "beta", label: "Beta" },
    { value: "main", label: "Main" },
];

function updateStageLabel(stage: string): string {
    switch (stage) {
        case "preparing": return "Preparing update...";
        case "downloading": return "Downloading update...";
        case "verifying": return "Verifying downloaded file...";
        case "installing": return "Installing update...";
        default: return "Updating...";
    }
}

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
            <div className="flex w-full items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                    <IconBoxRounded
                        icon={icon || LayoutGrid}
                        tone="primary"
                        className="flex-shrink-0 w-8 h-8 text-[0.9rem] border-none"
                    />
                    <span className="text-ui-muted text-xs font-bold uppercase opacity-75 min-w-[90px] text-[0.7rem] tracking-[0.5px]">
                        {label}
                    </span>
                </div>

                <div className="text-right overflow-hidden">
                    {url ? (
                        <a href={url} target="_blank" rel="noreferrer" className="no-underline font-mono text-ui-primary truncate block">
                            {value} <ExternalLink className="ml-1" size={12} />
                        </a>
                    ) : isBadge ?
                        <IconBadge icon={icon || LayoutGrid} text={value} color="primary" />
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
    const ctx = useContext(GlobalToastContext);
    const { data: info, isLoading, isValidating, error } = useSWR("/api/v2/info", getInfo);
    const [channel, setChannel] = useState<UpdateChannel>(() => {
        if (typeof window === "undefined") return "stable";
        const saved = window.localStorage.getItem(updateChannelKey);
        return saved === "stable" || saved === "beta" || saved === "main" ? saved : "stable";
    });
    const [update, setUpdate] = useState<UpdateCheck>();
    const [updateStatus, setUpdateStatus] = useState<UpdateStatus>();
    const [checkingUpdate, setCheckingUpdate] = useState(false);
    const [applyingUpdate, setApplyingUpdate] = useState(false);

    useEffect(() => {
        let active = true;
        let timer: ReturnType<typeof setTimeout> | undefined;

        const poll = async () => {
            try {
                const status = await getUpdateStatus();
                if (!active) return;
                setUpdateStatus(status);
                if (status.running) timer = setTimeout(() => void poll(), 1000);
            } catch {
                // The service can briefly be unavailable while it restarts.
                if (active) timer = setTimeout(() => void poll(), 2000);
            }
        };

        void poll();
        return () => {
            active = false;
            if (timer) clearTimeout(timer);
        };
    }, [updateStatus?.running]);

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
        if (!update?.updateAvailable || !update.targetTag || updateStatus?.running) return;
        setApplyingUpdate(true);
        try {
            await applyUpdate(channel, update.targetTag);
            setUpdateStatus({ running: true, stage: "preparing", progress: 0, bytesDownloaded: 0, totalBytes: 0, error: "" });
            ctx.Info("Update started. The service will restart shortly.");
        } catch (err) {
            ctx.Error(`Update failed: ${updateErrorMessage(err)}`);
        } finally {
            setApplyingUpdate(false);
        }
    };

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || isValidating || !info) return <Loading />

    return (
        <MainContainer className="flex flex-col">
            <Card className="order-2">
                <CardHeader className="py-3">
                    <IconBox icon={Info} tone="violet" title='System Information' description='Software version and build environment' />
                </CardHeader>

                <CardBody>
                    <div className="grid grid-cols-1 gap-4">
                        {/* Primary Build Info */}
                        <InfoRow label="Version" value={info.version || "Unknown"} icon={BadgeCheck} isBadge />
                        <InfoRow
                            label="Commit"
                            value={info.commit?.substring(0, 7) || "N/A"}
                            icon={GitBranch}
                            url={`https://github.com/yuhaiin/yuhaiin/commit/${info.commit}`}
                            isMonospace
                        />
                        <InfoRow label="Build Time" value={info.buildTime || "N/A"} icon={Calendar} />

                        {/* Environment Info */}
                        <InfoRow label="Go Version" value={info.goVersion || "N/A"} icon={Code} isMonospace />
                        <InfoRow
                            label="GitHub"
                            value="yuhaiin/yuhaiin"
                            icon={GitFork}
                            url="https://github.com/yuhaiin/yuhaiin"
                        />

                        {/* Hardware Info */}
                        <InfoRow label="OS" value={info.os || "N/A"} icon={Cpu} />
                        <InfoRow label="Arch" value={info.arch || "N/A"} icon={Layers} isMonospace />
                        <InfoRow label="Compiler" value={info.compiler || "N/A"} icon={Terminal} />
                        <InfoRow label="Platform" value={info.platform || "N/A"} icon={Laptop} />
                    </div>
                </CardBody>

                {/* Build Tags / Features Section */}
                {info.build && info.build.length > 0 && (
                    <CardFooter className="p-4 bg-transparent border-t border-gray-500/10">
                        <SettingLabel className={"mb-2 block text-ui-muted"}>Build Parameters</SettingLabel>
                        <div className="flex flex-wrap gap-2">
                            {info.build.map((tag, idx) => (
                                <div key={idx} className="px-2 py-1 rounded border font-mono text-sm break-all dark:border-gray-700">
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </CardFooter>
                )}
            </Card>

            <Card className="order-1">
                <CardHeader className="py-3">
                    <IconBox icon={Rocket} tone="success" title="Software Update" description="Check GitHub Releases for a newer desktop build" />
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div>
                            <SettingLabel>Update Channel</SettingLabel>
                            <ToggleGroup
                                type="single"
                                value={channel}
                                onValueChange={(value) => value && setChannel(value as UpdateChannel)}
                                className="w-full"
                                noSlide
                            >
                                {updateChannels.map((item) => (
                                    <ToggleItem key={item.value} value={item.value} className="flex-grow py-1 h-10">
                                        {item.label}
                                    </ToggleItem>
                                ))}
                            </ToggleGroup>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Button variant="default" onClick={handleCheckUpdate} disabled={checkingUpdate || applyingUpdate || updateStatus?.running}>
                                <RefreshCw className={checkingUpdate ? "mr-2 animate-spin" : "mr-2"} size={16} />
                                Check for Updates
                            </Button>
                            {update?.updateAvailable && (
                                <Button variant="default" onClick={handleApplyUpdate} disabled={applyingUpdate || updateStatus?.running || !update.supported}>
                                    <Download className="mr-2" size={16} />
                                    {applyingUpdate || updateStatus?.running ? "Updating..." : `Update to ${update.targetVersion}`}
                                </Button>
                            )}
                        </div>

                        {updateStatus?.running && (
                            <div className="rounded-ui-md border border-ui-border bg-ui-surface-muted p-4 text-sm">
                                <div className="flex items-center justify-between gap-3 font-semibold text-ui-heading">
                                    <span>{updateStageLabel(updateStatus.stage)}</span>
                                    <span>{updateStatus.progress > 0 ? `${updateStatus.progress}%` : "..."}</span>
                                </div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-ui-border" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={updateStatus.progress}>
                                    <div className="h-full rounded-full bg-ui-primary transition-[width] duration-300" style={{ width: `${Math.max(2, updateStatus.progress)}%` }} />
                                </div>
                                {updateStatus.totalBytes > 0 && (
                                    <div className="mt-2 text-xs text-ui-muted">
                                        {formatBytes(updateStatus.bytesDownloaded)} / {formatBytes(updateStatus.totalBytes)}
                                    </div>
                                )}
                            </div>
                        )}

                        {!updateStatus?.running && updateStatus?.error && (
                            <div className="rounded-ui-md border border-ui-danger/40 bg-ui-danger-soft p-4 text-sm text-ui-danger">
                                Update failed: {updateStatus.error}
                            </div>
                        )}

                        {update && (
                            <div className="rounded-ui-md border border-ui-border bg-ui-surface-muted p-4 text-sm">
                                {update.updateAvailable ? (
                                    <>
                                        <div className="flex items-center gap-2 font-semibold text-ui-heading">
                                            <Check size={16} className="text-ui-success" />
                                            {update.targetVersion} is available
                                        </div>
                                        <div className="mt-2 space-y-1 text-ui-muted">
                                            <div>Current version: <span className="font-mono">{update.currentVersion || "Unknown"}</span></div>
                                            <div>Asset: <span className="font-mono">{update.assetName}</span></div>
                                            {update.publishedAt && <div>Published: {new Date(update.publishedAt).toLocaleString()}</div>}
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
                    &copy; {new Date().getFullYear()} yuhaiin project. Distributed under MIT License.
                </small>
            </div>
        </MainContainer>
    );
}
