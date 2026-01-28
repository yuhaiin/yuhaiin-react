"use client"

import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, IconBox, MainContainer, SettingLabel } from '@/component/v2/card';
import {
    SettingEnumSelectVertical,
    SettingInputVertical,
    SettingRangeVertical,
    SwitchCard
} from "@/component/v2/forms";
import { Spinner } from '@/component/v2/spinner';
import { ToggleGroup, ToggleItem } from '@/component/v2/togglegroup';
import { create, DescEnumValue } from '@bufbuild/protobuf';
import { Cpu, Globe, NotebookText, Save } from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useInterfaces } from '../../common/interfaces';
import { FetchProtobuf, useProtoSWR } from '../../common/proto';
import { mapSetting, updateIfPresent } from '../../common/utils';
import Loading, { Error } from '../../component/v2/loading';
import { GlobalToastContext } from '../../component/v2/toast';
import { config_service } from '../pbes/api/config_pb';
import { advanced_configSchema, setting as Setting, settingSchema, system_proxySchema } from '../pbes/config/config_pb';
import { log_level, log_levelSchema, logcatSchema } from '../pbes/config/log_pb';

function ConfigComponent() {
    const ctx = useContext(GlobalToastContext);
    const { data: setting, error, isLoading, mutate: setSetting } = useProtoSWR(config_service.method.load, {
        revalidateOnFocus: false,
        use: []
    });

    const interfaces = useInterfaces();
    const [saving, setSaving] = useState(false);
    const update = mapSetting(setSetting)

    // --- Logic Helpers ---

    const getSystemProxy = useCallback((data?: Setting) => {
        if (!data?.systemProxy) return [];
        const x: string[] = [];
        if (data.systemProxy.http) x.push("1");
        if (data.systemProxy.socks5) x.push("2");
        return x;
    }, []);

    const systemProxy = useMemo(() => getSystemProxy(setting), [setting, getSystemProxy]);

    const handleSystemProxyChange = (x: string[]) => {
        update(prev => ({
            ...prev,
            systemProxy: create(system_proxySchema, { http: x.includes("1"), socks5: x.includes("2") })
        }), false);
    };

    const LogcatLevelFilter = useCallback((v: DescEnumValue) =>
        v.number !== log_level.verbose && v.number !== log_level.fatal, []);

    // Initialize Advanced Config and Logcat if missing
    useEffect(() => {
        if (!setting) return;
        if (setting.advancedConfig && setting.logcat) return;

        update(prev => {
            const next = { ...prev };
            if (!next.advancedConfig) {
                next.advancedConfig = create(advanced_configSchema, {
                    relayBufferSize: 4096,
                    udpRingbufferSize: 250,
                    udpBufferSize: 2048,
                    happyeyeballsSemaphore: 250
                });
            }
            if (!next.logcat) {
                next.logcat = create(logcatSchema, {
                    level: log_level.info,
                    save: false,
                    ignoreDnsError: false,
                    ignoreTimeoutError: false,
                } as any);
            }
            return create(settingSchema, next as any);
        }, false);
    }, [setting, setSetting]);

    const handleSave = () => {
        setSaving(true);
        FetchProtobuf(config_service.method.save, setting)
            .then(({ error }) => {
                if (error) ctx.Error(`Save failed: ${error.msg}`);
                else {
                    ctx.Info("Configuration saved successfully");
                    setSetting();
                }
            }).finally(() => setSaving(false));
    };

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || setting === undefined) return <Loading />

    return (
        <MainContainer>
            {/* 1. General Network Settings */}
            <Card>
                <CardHeader>
                    <IconBox icon={Globe} color="#3b82f6" title='General Settings' description='Network and system integration' />
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <SwitchCard
                                label="Enable IPv6"
                                description="Global IPv6 traffic support"
                                checked={setting.ipv6}
                                onCheckedChange={() => update(prev => ({ ...prev, ipv6: !prev.ipv6 }), false)}
                            />
                        </div>
                        <div>
                            <SwitchCard
                                label="Default Interface"
                                description="Automatically detect exit"
                                checked={setting.useDefaultInterface}
                                onCheckedChange={() => update(prev => ({ ...prev, useDefaultInterface: !prev.useDefaultInterface }), false)}
                            />
                        </div>

                        {!setting.useDefaultInterface && (
                            <div className="md:col-span-2 mt-2">
                                <SettingInputVertical
                                    label="Manual Network Interface"
                                    reminds={interfaces.map(x => {
                                        return {
                                            value: x.name,
                                            label: x.name,
                                            label_children: x.addresses
                                        }
                                    })}
                                    value={setting.netInterface}
                                    onChange={(v) => update(prev => ({ ...prev, netInterface: v }), false)}
                                    placeholder="e.g. eth0, wlan0"
                                />
                            </div>
                        )}

                        <div className="md:col-span-2 mt-4">
                            <SettingLabel>System Proxy Integration</SettingLabel>
                            <ToggleGroup
                                type="multiple"
                                className="w-full"
                                value={systemProxy}
                                onValueChange={handleSystemProxyChange}
                            >
                                <ToggleItem value="1" className="flex-grow py-1" style={{ height: '40px' }}>HTTP Proxy</ToggleItem>
                                <ToggleItem value="2" className="flex-grow py-1" style={{ height: '40px' }}>SOCKS5 Proxy</ToggleItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </CardBody>
            </Card>


            <Card>
                <CardHeader>
                    <IconBox icon={NotebookText} color="#10b981" title="Logging (Logcat)" description="Debug and error reporting" />
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <SettingEnumSelectVertical
                                label="Log Level"
                                type={log_levelSchema}
                                value={setting.logcat?.level ?? log_level.info}
                                filter={LogcatLevelFilter}
                                onChange={(v) => update(prev => ({ ...prev, logcat: updateIfPresent(prev.logcat, (l) => create(logcatSchema, { ...l, level: v })) }), false)}
                            />
                        </div>
                        <div>
                            <SwitchCard
                                label="Persistent Logging"
                                description="Save logs to disk"
                                checked={setting.logcat?.save ?? false}
                                onCheckedChange={() => update(prev => ({ ...prev, logcat: updateIfPresent(prev.logcat, (l) => create(logcatSchema, { ...l, save: !l.save })) }), false)}
                            />
                        </div>
                        <div>
                            <SwitchCard
                                label="Ignore Timeouts"
                                description="Hide timeout errors in logs"
                                checked={setting.logcat?.ignoreTimeoutError ?? false}
                                onCheckedChange={() => update(prev => ({ ...prev, logcat: updateIfPresent(prev.logcat, (l) => create(logcatSchema, { ...l, ignoreTimeoutError: !l.ignoreTimeoutError })) }), false)}
                            />
                        </div>
                        <div>
                            <SwitchCard
                                label="Ignore DNS Errors"
                                description="Hide resolution failures"
                                checked={setting.logcat?.ignoreDnsError ?? false}
                                onCheckedChange={() => update(prev => ({ ...prev, logcat: updateIfPresent(prev.logcat, (l) => create(logcatSchema, { ...l, ignoreDnsError: !l.ignoreDnsError })) }), false)}
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* 3. Advanced Performance Card */}
            <Card>
                <CardHeader>
                    <IconBox icon={Cpu} color="#f59e0b" title="Performance & Advanced" description="Buffer sizes and concurrency limits" />
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <SettingRangeVertical
                                label="UDP Buffer Size"
                                unit="B"
                                value={setting.advancedConfig?.udpBufferSize || 2048}
                                min={2048} max={65536} step={1024}
                                onChange={(v: number) => update(prev => ({ ...prev, advancedConfig: updateIfPresent(prev.advancedConfig, (c) => create(advanced_configSchema, { ...c, udpBufferSize: v })) }), false)}
                            />
                        </div>

                        <div>
                            <SettingRangeVertical
                                label="Relay Buffer Size"
                                unit="B"
                                value={setting.advancedConfig?.relayBufferSize || 4096}
                                min={2048} max={65536} step={1024}
                                onChange={(v: number) => update(prev => ({ ...prev, advancedConfig: updateIfPresent(prev.advancedConfig, (c) => create(advanced_configSchema, { ...c, relayBufferSize: v })) }), false)}
                            />
                        </div>

                        <div>
                            <SettingRangeVertical
                                label="UDP Ring Buffer"
                                unit="Slots"
                                value={setting.advancedConfig?.udpRingbufferSize || 250}
                                min={100} max={2000} step={10}
                                onChange={(v: number) => update(prev => ({ ...prev, advancedConfig: updateIfPresent(prev.advancedConfig, (c) => create(advanced_configSchema, { ...c, udpRingbufferSize: v })) }), false)}
                            />
                        </div>

                        <div>
                            <SettingRangeVertical
                                label="Happy Eyeballs Concurrency"
                                unit="Sems"
                                value={setting.advancedConfig?.happyeyeballsSemaphore || 250}
                                min={0} max={10000} step={10}
                                onChange={(v: number) => update(prev => ({ ...prev, advancedConfig: updateIfPresent(prev.advancedConfig, (c) => create(advanced_configSchema, { ...c, happyeyeballsSemaphore: v })) }), false)}
                            />
                        </div>
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