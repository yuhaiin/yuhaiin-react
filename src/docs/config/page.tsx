import { useAsyncAction, useCloseGuard, useEditorDraft } from "@/hooks/use-editor-draft";
import { useTranslation } from 'react-i18next';

import { saveSettings, loadSettings } from "@/api/settings";
import { Button } from "@/component/v2/button";
import { Card, CardBody, CardHeader, IconBox, MainContainer, SettingLabel } from "@/component/v2/card";
import { SettingInputVertical, SettingRangeVertical, SwitchCard } from "@/component/v2/forms";
import { Textarea } from "@/component/v2/input";
import Loading from "@/component/v2/loading";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import type { Settings } from "@/contract/settings";
import { Cpu, Globe, NotebookText, Save, ShieldCheck } from "lucide-react";
import { useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import useSWR from "swr";
import { useInterfaces } from "../../common/interfaces";

const logLevels = ["debug", "info", "warning", "error"] as const;
const builtinTrustedOrigin = "https://yuhaiin.github.io";

// An Origin is a single scheme/host/port tuple, not a URL path or wildcard.
function validTrustedOrigin(value: string): boolean {
    try {
        const url = new URL(value);
        if (url.origin !== value || url.username || url.password || value.includes("*")) return false;
        if (url.protocol === "https:") return true;
        if (url.protocol !== "http:") return false;
        return url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]";
    } catch { return false; }
}
function additionalOrigins(value: string): string[] {
    return value.split(/\r?\n/).map((origin) => origin.trim()).filter(Boolean);
}


function ConfigComponent() {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const { data: server, error, isLoading, mutate } = useSWR("/api/v2/settings", loadSettings, {
        revalidateOnFocus: false,
    });
    const interfaces = useInterfaces();
    const [originsText, setOriginsText] = useState<string | null>(null);
    const { value: setting, setValue: setSetting, commit, dirty } = useEditorDraft("settings", server, () => undefined);
    const { pending: saving, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    useCloseGuard(dirty, saving, () => undefined);

    const origins = additionalOrigins(originsText ?? setting?.trustedOrigins?.join("\n") ?? "");
    const invalidOrigin = origins.length > 32 || origins.some((origin) => !validTrustedOrigin(origin)) || new Set(origins).size !== origins.length;

    const systemProxy = useMemo(() => {
        const value: string[] = [];
        if (setting?.systemProxy.http) value.push("http");
        if (setting?.systemProxy.socks5) value.push("socks5");
        return value;
    }, [setting]);

    const update = (fn: (prev: Settings) => Settings) => {
        setSetting(prev => prev ? fn(prev) : prev);
    };

    const handleSave = () => {
        if (!setting || saving || error || isLoading) return;
        if (invalidOrigin) {
            ctx.Error(uiT("trustedOriginsInvalid"));
            return;
        }
        void run(async () => {
            const next = await saveSettings(setting);
            commit(next);
            setOriginsText(null);
            await mutate(next, { revalidate: false });
            ctx.Info(uiT("saveSuccess"));
        });
    };

    if (error !== undefined) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
    if (isLoading || setting === undefined) return <Loading />

    return (
        <MainContainer>
            <fieldset disabled={saving} className="contents">
            <Card>
                <CardHeader className="py-3">
                    <IconBox icon={Globe} tone="primary" title={uiT("generalSettings")} description={uiT("networkAndSystemIntegration")} />
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SwitchCard
                            label={uiT("enableIpv6")}
                            description={uiT("globalIpv6TrafficSupport")}
                            checked={setting.ipv6}
                            onCheckedChange={(checked) => update(prev => ({ ...prev, ipv6: checked }))}
                        />
                        <SwitchCard
                            label={uiT("defaultInterface")}
                            description={uiT("automaticallyDetectExit")}
                            checked={setting.useDefaultInterface}
                            onCheckedChange={(checked) => update(prev => ({ ...prev, useDefaultInterface: checked }))}
                        />
                        <SwitchCard
                            label={uiT("enablePprof")}
                            description={uiT("allowRuntimeProfilingDisablingStopsProfilersAndReleasesUnusedMemory")}
                            checked={setting.pprof}
                            onCheckedChange={(checked) => update(prev => ({ ...prev, pprof: checked }))}
                        />

                        {!setting.useDefaultInterface && (
                            <div className="md:col-span-2">
                                <SettingInputVertical
                                    label={uiT("manualNetworkInterface")}
                                    reminds={interfaces.map(x => ({ value: x.name, label: x.name, label_children: x.addresses }))}
                                    value={setting.netInterface}
                                    onChange={(v) => update(prev => ({ ...prev, netInterface: v }))}
                                    placeholder={uiT("eGEth0Wlan0")}
                                />
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <SettingLabel>{uiT("systemProxyIntegration")}</SettingLabel>
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
                            >
                                <ToggleItem value="http" className="flex-grow py-1 h-10">{uiT("httpProxy")}</ToggleItem>
                                <ToggleItem value="socks5" className="flex-grow py-1 h-10">{uiT("socks5Proxy")}</ToggleItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardHeader className="py-3">
                    <IconBox icon={NotebookText} tone="success" title={uiT("loggingLogcat")} description={uiT("debugAndErrorReporting")} />
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <SettingLabel>{uiT("logLevel")}</SettingLabel>
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
                            label={uiT("persistentLogging")}
                            description={uiT("saveLogsToDisk")}
                            checked={setting.logcat.save}
                            onCheckedChange={(checked) => update(prev => ({ ...prev, logcat: { ...prev.logcat, save: checked } }))}
                        />
                        <SwitchCard
                            label={uiT("ignoreTimeouts")}
                            description={uiT("hideTimeoutErrorsInLogs")}
                            checked={setting.logcat.ignoreTimeoutError}
                            onCheckedChange={(checked) => update(prev => ({ ...prev, logcat: { ...prev.logcat, ignoreTimeoutError: checked } }))}
                        />
                        <SwitchCard
                            label={uiT("ignoreDnsErrors")}
                            description={uiT("hideResolutionFailures")}
                            checked={setting.logcat.ignoreDnsError}
                            onCheckedChange={(checked) => update(prev => ({ ...prev, logcat: { ...prev.logcat, ignoreDnsError: checked } }))}
                        />
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardHeader className="py-3">
                    <IconBox icon={ShieldCheck} tone="neutral" title={uiT("trustedUiOrigins")} description={uiT("trustedUiOriginsDescription")} />
                </CardHeader>
                <CardBody>
                    <div className="max-w-3xl space-y-3">
                        <div>
                            <SettingLabel>{uiT("builtinTrustedOrigin")}</SettingLabel>
                            <p className="mt-1 rounded-ui-sm border border-ui-border bg-ui-surface-muted/40 px-3 py-2 font-mono text-sm text-ui-secondary">{builtinTrustedOrigin}</p>
                        </div>
                        <div>
                            <SettingLabel htmlFor="trusted-ui-origins">{uiT("additionalTrustedOrigins")}</SettingLabel>
                            <Textarea id="trusted-ui-origins" aria-label={uiT("additionalTrustedOrigins")} spellCheck={false}
                                rows={4} autoCapitalize="off" autoComplete="off"
                                placeholder="https://admin.example.com"
                                value={originsText ?? setting.trustedOrigins.join("\n")}
                                aria-invalid={invalidOrigin}
                                onChange={(event) => {
                                    setOriginsText(event.target.value);
                                    update((prev) => ({ ...prev, trustedOrigins: additionalOrigins(event.target.value) }));
                                }}
                            />
                            {invalidOrigin && <p role="alert" className="mt-2 text-sm text-ui-danger">{uiT("trustedOriginsInvalid")}</p>}
                            <p className="mt-2 text-sm text-ui-secondary">{uiT("trustedOriginsHelp")}</p>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardHeader className="py-3">
                    <IconBox icon={Cpu} tone="warning" title={uiT("performanceAdvanced")} description={uiT("bufferSizesAndConcurrencyLimits")} />
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <SettingRangeVertical
                            label={uiT("udpBufferSize")}
                            unit="B"
                            value={setting.advanced.udpBufferSize}
                            min={2048} max={65536} step={1024}
                            onChange={(udpBufferSize: number) => update(prev => ({ ...prev, advanced: { ...prev.advanced, udpBufferSize } }))}
                        />
                        <SettingRangeVertical
                            label={uiT("relayBufferSize")}
                            unit="B"
                            value={setting.advanced.relayBufferSize}
                            min={2048} max={65536} step={1024}
                            onChange={(relayBufferSize: number) => update(prev => ({ ...prev, advanced: { ...prev.advanced, relayBufferSize } }))}
                        />
                        <SettingRangeVertical
                            label={uiT("udpRingBuffer")}
                            unit="Slots"
                            value={setting.advanced.udpRingbufferSize}
                            min={100} max={2000} step={10}
                            onChange={(udpRingbufferSize: number) => update(prev => ({ ...prev, advanced: { ...prev.advanced, udpRingbufferSize } }))}
                        />
                        <SettingRangeVertical
                            label={uiT("happyEyeballsConcurrency")}
                            unit="Sems"
                            value={setting.advanced.happyEyeballsSemaphore}
                            min={0} max={10000} step={10}
                            onChange={(happyEyeballsSemaphore: number) => update(prev => ({ ...prev, advanced: { ...prev.advanced, happyEyeballsSemaphore } }))}
                        />
                    </div>
                </CardBody>
            </Card>

            {createPortal(
                <div className="fixed bottom-10 right-10 z-[100] sm:bottom-12 sm:right-12">
                    <Button
                        variant="primary"
                        size="icon"
                        className="h-12 w-12 rounded-full shadow-ui-elevated"
                        disabled={saving}
                        onClick={handleSave}
                        aria-label={uiT("saveAllSettings")}
                        title={uiT("saveAllSettings")}
                    >
                        {saving ? <Spinner size="sm" /> : <Save size={20} />}
                    </Button>
                </div>,
                document.body,
            )}
            </fieldset>
        </MainContainer>
    );
}

export default ConfigComponent;
