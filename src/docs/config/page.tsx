"use client"

import { saveSettings, loadSettings } from "@/api/settings";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardHeader, IconBox, MainContainer, SettingLabel } from "@/component/v2/card";
import { SettingInputVertical, SettingRangeVertical, SwitchCard } from "@/component/v2/forms";
import Loading, { Error } from "@/component/v2/loading";
import { PageHeader } from "@/component/v2/page-header";
import { PageStatStrip } from "@/component/v2/page-patterns";
import { GlobalToastContext } from "@/component/v2/toast";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import type { Settings } from "@/contract/settings";
import { Cpu, Gauge, Globe, NotebookText, Save, ShieldCheck } from "lucide-react";
import { useContext, useMemo, useState } from "react";
import useSWR from "swr";
import { useInterfaces } from "../../common/interfaces";

const logLevels = ["debug", "info", "warning", "error"] as const;

function ConfigComponent() {
    const ctx = useContext(GlobalToastContext);
    const { data: setting, error, isLoading, mutate } = useSWR("/api/v2/settings", loadSettings, {
        revalidateOnFocus: false,
    });
    const interfaces = useInterfaces();
    const [saving, setSaving] = useState(false);

    const systemProxy = useMemo(() => {
        const value: string[] = [];
        if (setting?.systemProxy.http) value.push("http");
        if (setting?.systemProxy.socks5) value.push("socks5");
        return value;
    }, [setting]);

    const update = (fn: (prev: Settings) => Settings) => {
        mutate(prev => prev ? fn(prev) : prev, { revalidate: false });
    };

    const handleSave = () => {
        if (!setting) return;
        setSaving(true);
        saveSettings(setting)
            .then(next => {
                ctx.Info("save successful");
                mutate(next, { revalidate: false });
            })
            .catch((err) => ctx.Error(`save failed: ${err.msg ?? err}`))
            .finally(() => setSaving(false));
    };

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || setting === undefined) return <Loading />

    return (
        <MainContainer className="product-page page-skin-workspace page-skin-settings">
            <PageHeader
                eyebrow="Workspace"
                title="Settings"
                description="Keep network behavior, logging, and performance preferences in one calm workspace."
                icon={Globe}
                actions={<Button onClick={handleSave} disabled={saving}><Save size={16} className="mr-1" /> Save changes</Button>}
            />
            <PageStatStrip
                stats={[
                    { label: "IPv6", value: setting.ipv6 ? "On" : "Off", hint: "network capability", icon: Globe, tone: "primary" },
                    { label: "System proxy", value: systemProxy.length ? systemProxy.join(" + ") : "Off", hint: "desktop integration", icon: ShieldCheck, tone: "success" },
                    { label: "Log level", value: setting.logcat.level, hint: setting.logcat.save ? "persistent" : "session only", icon: NotebookText, tone: "violet" },
                    { label: "Advanced", value: setting.pprof ? "Profiling on" : "Balanced", hint: "runtime posture", icon: Gauge, tone: "warning" },
                ]}
                className="mb-5"
            />
            <div className="ui-settings-workspace ui-settings-workspace--single">
                <div className="ui-settings-panels">
            <section id="general">
            <Card>
                <CardHeader className="py-3">
                    <IconBox icon={Globe} tone="primary" title="General Settings" description="Network and system integration" />
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SwitchCard
                            label="Enable IPv6"
                            description="Global IPv6 traffic support"
                            checked={setting.ipv6}
                            onCheckedChange={() => update(prev => ({ ...prev, ipv6: !prev.ipv6 }))}
                        />
                        <SwitchCard
                            label="Default Interface"
                            description="Automatically detect exit"
                            checked={setting.useDefaultInterface}
                            onCheckedChange={() => update(prev => ({ ...prev, useDefaultInterface: !prev.useDefaultInterface }))}
                        />
                        <SwitchCard
                            label="Enable Pprof"
                            description="Allow runtime profiling; disabling stops profilers and releases unused memory"
                            checked={setting.pprof}
                            onCheckedChange={() => update(prev => ({ ...prev, pprof: !prev.pprof }))}
                        />

                        {!setting.useDefaultInterface && (
                            <div className="md:col-span-2">
                                <SettingInputVertical
                                    label="Manual Network Interface"
                                    reminds={interfaces.map(x => ({ value: x.name, label: x.name, label_children: x.addresses }))}
                                    value={setting.netInterface}
                                    onChange={(v) => update(prev => ({ ...prev, netInterface: v }))}
                                    placeholder="e.g. eth0, wlan0"
                                />
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <SettingLabel>System Proxy Integration</SettingLabel>
                            <ToggleGroup
                                type="multiple"
                                className="w-full"
                                value={systemProxy}
                                onValueChange={(value) => update(prev => ({
                                    ...prev,
                                    systemProxy: {
                                        http: value.includes("http"),
                                        socks5: value.includes("socks5"),
                                    },
                                }))}
                                noSlide
                            >
                                <ToggleItem value="http" className="flex-grow py-1 h-10">HTTP Proxy</ToggleItem>
                                <ToggleItem value="socks5" className="flex-grow py-1 h-10">SOCKS5 Proxy</ToggleItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </CardBody>
            </Card>
            </section>

            <section id="logging">
            <Card>
                <CardHeader className="py-3">
                    <IconBox icon={NotebookText} tone="success" title="Logging (Logcat)" description="Debug and error reporting" />
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <SettingLabel>Log Level</SettingLabel>
                            <ToggleGroup
                                type="single"
                                value={setting.logcat.level}
                                onValueChange={(level) => level && update(prev => ({ ...prev, logcat: { ...prev.logcat, level } }))}
                                className="w-full"
                            >
                                {logLevels.map(level => <ToggleItem key={level} value={level} className="grow">{level}</ToggleItem>)}
                            </ToggleGroup>
                        </div>
                        <SwitchCard
                            label="Persistent Logging"
                            description="Save logs to disk"
                            checked={setting.logcat.save}
                            onCheckedChange={() => update(prev => ({ ...prev, logcat: { ...prev.logcat, save: !prev.logcat.save } }))}
                        />
                        <SwitchCard
                            label="Ignore Timeouts"
                            description="Hide timeout errors in logs"
                            checked={setting.logcat.ignoreTimeoutError}
                            onCheckedChange={() => update(prev => ({ ...prev, logcat: { ...prev.logcat, ignoreTimeoutError: !prev.logcat.ignoreTimeoutError } }))}
                        />
                        <SwitchCard
                            label="Ignore DNS Errors"
                            description="Hide resolution failures"
                            checked={setting.logcat.ignoreDnsError}
                            onCheckedChange={() => update(prev => ({ ...prev, logcat: { ...prev.logcat, ignoreDnsError: !prev.logcat.ignoreDnsError } }))}
                        />
                    </div>
                </CardBody>
            </Card>
            </section>

            <section id="performance">
            <Card>
                <CardHeader className="py-3">
                    <IconBox icon={Cpu} tone="warning" title="Performance & Advanced" description="Buffer sizes and concurrency limits" />
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SettingRangeVertical
                            label="UDP Buffer Size"
                            unit="B"
                            value={setting.advanced.udpBufferSize}
                            min={2048} max={65536} step={1024}
                            onChange={(udpBufferSize: number) => update(prev => ({ ...prev, advanced: { ...prev.advanced, udpBufferSize } }))}
                        />
                        <SettingRangeVertical
                            label="Relay Buffer Size"
                            unit="B"
                            value={setting.advanced.relayBufferSize}
                            min={2048} max={65536} step={1024}
                            onChange={(relayBufferSize: number) => update(prev => ({ ...prev, advanced: { ...prev.advanced, relayBufferSize } }))}
                        />
                        <SettingRangeVertical
                            label="UDP Ring Buffer"
                            unit="Slots"
                            value={setting.advanced.udpRingbufferSize}
                            min={100} max={2000} step={10}
                            onChange={(udpRingbufferSize: number) => update(prev => ({ ...prev, advanced: { ...prev.advanced, udpRingbufferSize } }))}
                        />
                        <SettingRangeVertical
                            label="Happy Eyeballs Concurrency"
                            unit="Sems"
                            value={setting.advanced.happyEyeballsSemaphore}
                            min={0} max={10000} step={10}
                            onChange={(happyEyeballsSemaphore: number) => update(prev => ({ ...prev, advanced: { ...prev.advanced, happyEyeballsSemaphore } }))}
                        />
                    </div>
                </CardBody>
            </Card>
            </section>
                </div>
            </div>

        </MainContainer>
    );
}

export default ConfigComponent;
