"use client"

import { create, DescEnumValue } from '@bufbuild/protobuf';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { useInterfaces } from '../common/interfaces';
import Loading, { Error } from '../common/loading';
import { FetchProtobuf, useProtoSWR } from '../common/proto';
import { SettingCheck, SettingTypeSelect } from "../common/switch";
import { GlobalToastContext } from '../common/toast';
import { config_service } from '../pbes/api/config_pb';
import { advanced_configSchema, setting as Setting, system_proxySchema } from '../pbes/config/config_pb';
import { log_level, log_levelSchema, logcat } from '../pbes/config/log_pb';
import { Remind, SettingInputText } from './components';


function ConfigComponent() {
    const ctx = useContext(GlobalToastContext);

    const { data: setting, error, isLoading, mutate: setSetting } =
        useProtoSWR(config_service.method.load, {
            revalidateOnFocus: false,
            use: []
        })

    const interfaces = useInterfaces();


    const switchIPv6 = useCallback(() => {
        setSetting(prev => ({ ...prev, ipv6: !prev.ipv6 }), false)
    }, [setSetting])


    const getSystemProxy = useCallback((data: Setting) => {
        if (!data) return []
        if (!data?.systemProxy) setSetting(prev => { return { ...prev, systemProxy: create(system_proxySchema, { http: false, socks5: false }) } }, false)

        const x: number[] = []
        if (data.systemProxy?.http) x.push(1)
        if (data.systemProxy?.socks5) x.push(2)
        return x
    }, [setSetting])

    const systemProxy = useMemo(() => getSystemProxy(setting), [setting, getSystemProxy])

    const setSystemProxy = useCallback((x: number[]) => {
        let http = false, socks5 = false;

        for (const y of x) {
            if (y === 1) http = true
            if (y === 2) socks5 = true
        }

        setSetting(prev => ({ ...prev, systemProxy: create(system_proxySchema, { http: http, socks5: socks5 }) }), false)
    }, [setSetting])

    const switchDefaultInterface = useCallback(() => {
        setSetting(prev => ({ ...prev, useDefaultInterface: !prev.useDefaultInterface }), false)
    }, [setSetting])

    const reminds = useMemo(() => {
        return interfaces.map((v) => {
            if (!v.name) return undefined
            const r: Remind = {
                label: v.name,
                value: v.name,
                label_children: v.addresses?.map((vv) => !vv ? "" : vv)
            }
            return r
        })
            .filter((e): e is Exclude<Remind, null | undefined> => !!e)

    }, [interfaces])

    const setDefaultInterface = useCallback((v: string) => {
        setSetting(prev => ({ ...prev, netInterface: v }), false)
    }, [setSetting])

    const setLogcat = useCallback((change: (v: logcat) => logcat) => {
        setSetting(prev => ({ ...prev, logcat: change(prev.logcat) }), false)
    }, [setSetting])

    const setLogcatSave = useCallback((v: boolean) => {
        setLogcat(prev => ({ ...prev, save: v }))
    }, [setLogcat])

    const setLogcatLevel = useCallback((v: log_level) => {
        setLogcat(prev => ({ ...prev, level: v }))
    }, [setLogcat])

    const LogcatLevelFilter = useCallback((v: DescEnumValue) => v.number !== log_level.verbose && v.number !== log_level.fatal, [])

    const setLogcatIgnoreTimeoutError = useCallback((v: boolean) => {
        setLogcat(prev => ({ ...prev, ignoreTimeoutError: v }))
    }, [setLogcat])

    const setLogcatIgnoreDnsError = useCallback((v: boolean) => {
        setLogcat(prev => ({ ...prev, ignoreDnsError: v }))
    }, [setLogcat])

    useEffect(() => {
        if (!setting) return
        if (!setting.advancedConfig) {
            setSetting(prev => ({
                ...prev,
                advancedConfig:
                    create(advanced_configSchema, {
                        relayBufferSize: 4096,
                        udpRingbufferSize: 250,
                        udpBufferSize: 2048,
                        happyeyeballsSemaphore: 250
                    })
            }), false)
            return
        }

        if (!setting.advancedConfig.udpBufferSize) {
            setSetting(prev => ({ ...prev, advancedConfig: { ...prev.advancedConfig, udpBufferSize: 2048 } }), false)
        }

        if (!setting.advancedConfig.relayBufferSize) {
            setSetting(prev => ({ ...prev, advancedConfig: { ...prev.advancedConfig, relayBufferSize: 4096 } }), false)
        }

        if (!setting.advancedConfig.udpRingbufferSize) {
            setSetting(prev => ({ ...prev, advancedConfig: { ...prev.advancedConfig, udpRingbufferSize: 250 } }), false)
        }

        if (!setting.advancedConfig.happyeyeballsSemaphore) {
            setSetting(prev => ({ ...prev, advancedConfig: { ...prev.advancedConfig, happyeyeballsSemaphore: 250 } }), false)
        }
    }, [setting, setSetting])

    const setRelayBufferSize = useCallback((v: React.ChangeEvent<HTMLInputElement>) => {
        setSetting(prev => ({ ...prev, advancedConfig: { ...prev.advancedConfig, relayBufferSize: Number(v.target.value) } }), false)
    }, [setSetting])

    const setUdpRingbufferSize = useCallback((v: React.ChangeEvent<HTMLInputElement>) => {
        setSetting(prev => ({ ...prev, advancedConfig: { ...prev.advancedConfig, udpRingbufferSize: Number(v.target.value) } }), false)
    }, [setSetting])

    const setUdpBufferSize = useCallback((v: React.ChangeEvent<HTMLInputElement>) => {
        setSetting(prev => ({ ...prev, advancedConfig: { ...prev.advancedConfig, udpBufferSize: Number(v.target.value) } }), false)
    }, [setSetting])

    const setHappyEyeballsSemaphore = useCallback((v: React.ChangeEvent<HTMLInputElement>) => {
        setSetting(prev => ({ ...prev, advancedConfig: { ...prev.advancedConfig, happyeyeballsSemaphore: Number(v.target.value) } }), false)
    }, [setSetting])

    const [saving, setSaving] = useState(false);

    const save = useCallback(() => {
        setSaving(true);
        FetchProtobuf(config_service.method.save, setting)
            .then(async ({ error }) => {
                if (error !== undefined) ctx.Error(`save config failed, ${error.code}| ${error.msg}`)
                else {
                    ctx.Info("Save Config Successfully");
                    setSetting()
                }
            }).finally(() => setSaving(false));
    }, [setting, setSetting, ctx])


    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || setting === undefined) return <Loading />

    return (
        <>
            <Card className='mb-3'>
                <Card.Body>

                    <SettingCheck
                        label='IPv6'
                        checked={setting.ipv6}
                        onChange={switchIPv6}
                    />
                    <SettingCheck
                        label='Use Default Interface'
                        checked={setting.useDefaultInterface}
                        onChange={switchDefaultInterface}
                    />

                    {
                        setting.useDefaultInterface ? <></> :
                            <SettingInputText
                                label='Network Interface'
                                value={setting.netInterface}
                                onChange={setDefaultInterface}
                                reminds={reminds}
                            />
                    }

                    <Form.Group as={Row} className={"mb-2"}>
                        <Form.Label column sm={2} className="nowrap">System Proxy</Form.Label>
                        <Col sm={10}>
                            <ToggleButtonGroup
                                type="checkbox"
                                className='d-flex'
                                defaultValue={systemProxy}
                                value={systemProxy}
                                onChange={setSystemProxy}
                            >
                                <ToggleButton variant='outline-primary' className='w-100' id="system-proxy-tbg-btn-1" value={1}>HTTP</ToggleButton>
                                <ToggleButton variant='outline-primary' className='w-100' id="system-proxy-tbg-btn-2" value={2}>SOCKS5</ToggleButton>
                            </ToggleButtonGroup>
                        </Col>
                    </Form.Group >

                    <hr />

                    <Card.Title className='mb-2'>Logcat</Card.Title>
                    <SettingCheck label='Save'
                        checked={setting.logcat.save}
                        onChange={setLogcatSave} />
                    <SettingTypeSelect
                        label='Level'
                        type={log_levelSchema}
                        value={setting.logcat.level}
                        filter={LogcatLevelFilter}
                        onChange={setLogcatLevel}
                    />
                    <SettingCheck label='Ignore Timeout Error'
                        checked={setting.logcat.ignoreTimeoutError}
                        onChange={setLogcatIgnoreTimeoutError} />
                    <SettingCheck label='Ignore DNS Error'
                        checked={setting.logcat.ignoreDnsError}
                        onChange={setLogcatIgnoreDnsError} />
                    <hr />

                    <Card.Title className='mb-2'>Advanced</Card.Title>

                    <Form.Label>UDP Buffer Size ({setting.advancedConfig?.udpBufferSize} Bytes)</Form.Label>
                    <Form.Range value={setting.advancedConfig?.udpBufferSize}
                        min={2048} max={65536} step={1024} onChange={setUdpBufferSize} />

                    <Form.Label>UDP Ring Buffer Size ({setting.advancedConfig?.udpRingbufferSize})</Form.Label>
                    <Form.Range value={setting.advancedConfig?.udpRingbufferSize}
                        min={100} max={2000} step={10} onChange={setUdpRingbufferSize} />

                    <Form.Label>Relay Buffer Size ({setting.advancedConfig?.relayBufferSize} Bytes)</Form.Label>
                    <Form.Range value={setting.advancedConfig?.relayBufferSize}
                        min={2048} max={65536} step={1024} onChange={setRelayBufferSize} />

                    <Form.Label>Happy Eyeballs Semaphore ({setting.advancedConfig?.happyeyeballsSemaphore})</Form.Label>
                    <Form.Range value={setting.advancedConfig?.happyeyeballsSemaphore}
                        min={0} step={10} max={10000} onChange={setHappyEyeballsSemaphore} />

                </Card.Body>

                <Card.Footer className='d-flex justify-content-md-end'>
                    <Button
                        variant="outline-primary"
                        onClick={save}
                        disabled={saving}
                    >
                        <i className="bi bi-floppy"></i> Save
                        {saving && <>&nbsp;<Spinner size="sm" animation="border" variant='primary' /></>}
                    </Button>
                </Card.Footer>
            </Card >
        </>
    );
}

export default ConfigComponent;
