"use client"

import { applyUpdate, checkUpdate } from "@/api/update";
import { getInfo } from "@/api/settings";
import { Card, CardBody, CardFooter, CardHeader, IconBadge, IconBox, IconBoxRounded, ListItem, MainContainer, SettingLabel } from '@/component/v2/card';
import { Button } from "@/component/v2/button";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import { GlobalToastContext } from "@/component/v2/toast";
import type { UpdateChannel, UpdateCheck } from "@/contract/update";
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
                        color="#3b82f6"
                        className="flex-shrink-0 w-8 h-8 text-[0.9rem] border-none"
                    />
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase opacity-75 min-w-[90px] text-[0.7rem] tracking-[0.5px]">
                        {label}
                    </span>
                </div>

                <div className="text-right overflow-hidden">
                    {url ? (
                        <a href={url} target="_blank" rel="noreferrer" className="no-underline font-mono text-blue-500 truncate block">
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
    const [checkingUpdate, setCheckingUpdate] = useState(false);
    const [applyingUpdate, setApplyingUpdate] = useState(false);

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
        if (!update?.updateAvailable || !update.targetTag) return;
        setApplyingUpdate(true);
        try {
            await applyUpdate(channel, update.targetTag);
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
                    <IconBox icon={Info} color="#6366f1" title='System Information' description='Software version and build environment' />
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
                        <SettingLabel className={"mb-2 block text-gray-500 dark:text-gray-400"}>Build Parameters</SettingLabel>
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
                    <IconBox icon={Rocket} color="#10b981" title="Software Update" description="Check GitHub Releases for a newer desktop build" />
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
                            <Button variant="default" onClick={handleCheckUpdate} disabled={checkingUpdate || applyingUpdate}>
                                <RefreshCw className={checkingUpdate ? "mr-2 animate-spin" : "mr-2"} size={16} />
                                Check for Updates
                            </Button>
                            {update?.updateAvailable && (
                                <Button variant="default" onClick={handleApplyUpdate} disabled={applyingUpdate || !update.supported}>
                                    <Download className="mr-2" size={16} />
                                    {applyingUpdate ? "Updating..." : `Update to ${update.targetVersion}`}
                                </Button>
                            )}
                        </div>

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
                <small className="text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} yuhaiin project. Distributed under MIT License.
                </small>
            </div>
        </MainContainer>
    );
}
