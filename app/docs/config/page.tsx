"use client"

import { Button } from '@/app/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, IconBox, MainContainer, SettingLabel } from '@/app/component/v2/card';
import {
    SettingEnumSelectVertical,
    SettingInputVertical,
    SettingRangeVertical,
    SwitchCard
} from "@/app/component/v2/forms";
import { Spinner } from '@/app/component/v2/spinner';
import { ToggleGroup, ToggleItem } from '@/app/component/v2/togglegroup';
import { create, DescEnumValue } from '@bufbuild/protobuf';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Cpu, Globe2, JournalText, Save } from 'react-bootstrap-icons';
import Loading, { Error } from '../../component/loading';
import { GlobalToastContext } from '../../component/v2/toast';
import { useInterfaces } from '../common/interfaces';
import { FetchProtobuf, useProtoSWR } from '../common/proto';
import { config_service } from '../pbes/api/config_pb';
import { advanced_configSchema, setting as Setting, system_proxySchema } from '../pbes/config/config_pb';
import { log_level, log_levelSchema } from '../pbes/config/log_pb';

function ConfigComponent() {
    const ctx = useContext(GlobalToastContext);
    const { data: setting, error, isLoading, mutate: setSetting } = useProtoSWR(config_service.method.load, {
        revalidateOnFocus: false,
        use: []
    });

    const interfaces = useInterfaces();
    const [saving, setSaving] = useState(false);

    // --- Logic Helpers ---

    const getSystemProxy = useCallback((data: Setting) => {
        if (!data?.systemProxy) return [];
        const x: string[] = [];
        if (data.systemProxy.http) x.push("1");
        if (data.systemProxy.socks5) x.push("2");
        return x;
    }, []);

    const systemProxy = useMemo(() => getSystemProxy(setting), [setting, getSystemProxy]);

    const handleSystemProxyChange = (x: string[]) => {
        setSetting(prev => ({
            ...prev,
            systemProxy: create(system_proxySchema, { http: x.includes("1"), socks5: x.includes("2") })
        }), false);
    };

    const LogcatLevelFilter = useCallback((v: DescEnumValue) =>
        v.number !== log_level.verbose && v.number !== log_level.fatal, []);

    // Initialize Advanced Config if missing
    useEffect(() => {
        if (!setting || setting.advancedConfig) return;
        setSetting(prev => ({
            ...prev,
            advancedConfig: create(advanced_configSchema, {
                relayBufferSize: 4096,
                udpRingbufferSize: 250,
                udpBufferSize: 2048,
                happyeyeballsSemaphore: 250
            })
        }), false);
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
                    <IconBox icon={Globe2} color="#3b82f6" title='General Settings' description='Network and system integration' />
                </CardHeader>
                <CardBody>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <SwitchCard
                                label="Enable IPv6"
                                description="Global IPv6 traffic support"
                                checked={setting.ipv6}
                                onCheckedChange={() => setSetting(prev => ({ ...prev, ipv6: !prev.ipv6 }), false)}
                            />
                        </div>
                        <div className="col-md-6">
                            <SwitchCard
                                label="Default Interface"
                                description="Automatically detect exit"
                                checked={setting.useDefaultInterface}
                                onCheckedChange={() => setSetting(prev => ({ ...prev, useDefaultInterface: !prev.useDefaultInterface }), false)}
                            />
                        </div>

                        {!setting.useDefaultInterface && (
                            <div className="col-12 mt-2">
                                <SettingInputVertical
                                    label="Manual Network Interface"
                                    value={setting.netInterface}
                                    onChange={(v) => setSetting(prev => ({ ...prev, netInterface: v }), false)}
                                    placeholder="e.g. eth0, wlan0"
                                />
                            </div>
                        )}

                        <div className="col-12 mt-3">
                            <SettingLabel>System Proxy Integration</SettingLabel>
                            <ToggleGroup
                                type="multiple"
                                className="w-100"
                                value={systemProxy}
                                onValueChange={handleSystemProxyChange}
                            >
                                <ToggleItem value="1" className="flex-grow-1 py-1" style={{ height: '40px' }}>HTTP Proxy</ToggleItem>
                                <ToggleItem value="2" className="flex-grow-1 py-1" style={{ height: '40px' }}>SOCKS5 Proxy</ToggleItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* 2. Logging Card */}
            <Card>
                <CardHeader>
                    <IconBox icon={JournalText} color="#10b981" title="Logging (Logcat)" description="Debug and error reporting" />
                </CardHeader>
                <CardBody>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <SettingEnumSelectVertical
                                label="Log Level"
                                type={log_levelSchema}
                                value={setting.logcat.level}
                                filter={LogcatLevelFilter}
                                onChange={(v) => setSetting(prev => ({ ...prev, logcat: { ...prev.logcat, level: v } }), false)}
                            />
                        </div>
                        <div className="col-md-6">
                            <SwitchCard
                                label="Persistent Logging"
                                description="Save logs to disk"
                                checked={setting.logcat.save}
                                onCheckedChange={() => setSetting(prev => ({ ...prev, logcat: { ...prev.logcat, save: !prev.logcat.save } }), false)}
                            />
                        </div>
                        <div className="col-md-6">
                            <SwitchCard
                                label="Ignore Timeouts"
                                description="Hide timeout errors in logs"
                                checked={setting.logcat.ignoreTimeoutError}
                                onCheckedChange={() => setSetting(prev => ({ ...prev, logcat: { ...prev.logcat, ignoreTimeoutError: !prev.logcat.ignoreTimeoutError } }), false)}
                            />
                        </div>
                        <div className="col-md-6">
                            <SwitchCard
                                label="Ignore DNS Errors"
                                description="Hide resolution failures"
                                checked={setting.logcat.ignoreDnsError}
                                onCheckedChange={() => setSetting(prev => ({ ...prev, logcat: { ...prev.logcat, ignoreDnsError: !prev.logcat.ignoreDnsError } }), false)}
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
                    <div className="row g-4">
                        <div className="col-lg-6">
                            <SettingRangeVertical
                                label="UDP Buffer Size"
                                unit="B"
                                value={setting.advancedConfig?.udpBufferSize || 2048}
                                min={2048} max={65536} step={1024}
                                onChange={(v: number) => setSetting(prev => ({ ...prev, advancedConfig: { ...prev.advancedConfig, udpBufferSize: v } }), false)}
                            />
                        </div>

                        <div className="col-lg-6">
                            <SettingRangeVertical
                                label="Relay Buffer Size"
                                unit="B"
                                value={setting.advancedConfig?.relayBufferSize || 4096}
                                min={2048} max={65536} step={1024}
                                onChange={(v: number) => setSetting(prev => ({ ...prev, advancedConfig: { ...prev.advancedConfig, relayBufferSize: v } }), false)}
                            />
                        </div>

                        <div className="col-lg-6">
                            <SettingRangeVertical
                                label="UDP Ring Buffer"
                                unit="Slots"
                                value={setting.advancedConfig?.udpRingbufferSize || 250}
                                min={100} max={2000} step={10}
                                onChange={(v: number) => setSetting(prev => ({ ...prev, advancedConfig: { ...prev.advancedConfig, udpRingbufferSize: v } }), false)}
                            />
                        </div>

                        <div className="col-lg-6">
                            <SettingRangeVertical
                                label="Happy Eyeballs Concurrency"
                                unit="Sems"
                                value={setting.advancedConfig?.happyeyeballsSemaphore || 250}
                                min={0} max={10000} step={10}
                                onChange={(v: number) => setSetting(prev => ({ ...prev, advancedConfig: { ...prev.advancedConfig, happyeyeballsSemaphore: v } }), false)}
                            />
                        </div>
                    </div>
                </CardBody>

                <CardFooter className="d-flex justify-content-end">
                    <Button variant="outline-primary" disabled={saving} onClick={handleSave}>
                        {saving ? <Spinner size="sm" /> : <><Save className="me-2" />Apply Advanced Changes</>}
                    </Button>
                </CardFooter>
            </Card>
        </MainContainer>
    );
}

export default ConfigComponent;