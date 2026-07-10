"use client"

import { saveSettings, loadSettings } from "@/api/settings";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardFooter, CardHeader, IconBox, MainContainer, SettingLabel } from "@/component/v2/card";
import { SettingInputVertical, SettingRangeVertical, SwitchCard } from "@/component/v2/forms";
import Loading, { Error } from "@/component/v2/loading";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import type { Settings } from "@/contract/settings";
import { Cpu, Globe, NotebookText, Save } from "lucide-react";
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
        <MainContainer>
            <Card>
                <CardHeader className="py-3">
                    <IconBox icon={Globe} color="#3b82f6" title="General Settings" description="Network and system integration" />
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

            <Card>
                <CardHeader className="py-3">
                    <IconBox icon={NotebookText} color="#10b981" title="Logging (Logcat)" description="Debug and error reporting" />
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

            <Card>
                <CardHeader className="py-3">
                    <IconBox icon={Cpu} color="#f59e0b" title="Performance & Advanced" description="Buffer sizes and concurrency limits" />
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
                <CardFooter className="flex justify-end">
                    <Button disabled={saving} onClick={handleSave}>
                        {saving ? <Spinner size="sm" /> : <><Save className="mr-2" size={16} />Apply Advanced Changes</>}
                    </Button>
                </CardFooter>
            </Card>
        </MainContainer>
    );
}

export default ConfigComponent;
