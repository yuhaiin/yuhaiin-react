"use client"

import { create } from '@bufbuild/protobuf';
import { useContext } from 'react';
import { Button, Card, Col, Form, Row, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { Interfaces } from '../common/interfaces';
import Loading, { Error } from '../common/loading';
import { FetchProtobuf, useProtoSWR } from '../common/proto';
import { SettingCheck, SettingTypeSelect } from "../common/switch";
import { GlobalToastContext } from '../common/toast';
import { advanced_configSchema, setting as Setting, system_proxySchema } from '../pbes/config/config_pb';
import { config_service } from '../pbes/config/grpc/config_pb';
import { log_level, log_levelSchema } from '../pbes/config/log/log_pb';
import { Remind, SettingInputText } from './components';

function ConfigComponent() {
    const ctx = useContext(GlobalToastContext);

    const { data: setting, error, isLoading, mutate: setSetting } =
        useProtoSWR(config_service.method.load, { revalidateOnFocus: false })

    const interfaces = Interfaces();

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || setting === undefined) return <Loading />

    const getSystemProxy = (data: Setting) => {
        const x: number[] = []
        if (data.systemProxy?.http) x.push(1)
        if (data.systemProxy?.socks5) x.push(2)
        return x
    }

    const setSystemProxy = (x: number[]) => {
        let http = false, socks5 = false;

        for (const y of x) {
            if (y === 1) http = true
            if (y === 2) socks5 = true
        }

        setSetting({ ...setting, systemProxy: create(system_proxySchema, { http: http, socks5: socks5 }) }, false)
    }

    return (
        <>
            <Card className='mb-3'>
                <Card.Body>
                    <fieldset disabled={setting.platform?.androidApp}>

                        <SettingCheck label='IPv6' checked={setting.ipv6} onChange={() => setSetting({ ...setting, ipv6: !setting.ipv6 }, false)} />
                        <SettingCheck label='Use Default Interface' checked={setting.useDefaultInterface} onChange={() => setSetting({ ...setting, useDefaultInterface: !setting.useDefaultInterface }, false)} />
                        {!setting.useDefaultInterface &&
                            <SettingInputText
                                label='Network Interface'
                                value={setting.netInterface}
                                onChange={(v) => setSetting({ ...setting, netInterface: v }, false)}
                                reminds={interfaces.map((v) => {
                                    if (!v.name) return undefined
                                    const r: Remind = {
                                        label: v.name,
                                        value: v.name,
                                        label_children: v.addresses?.map((vv) => !vv ? "" : vv)
                                    }
                                    return r
                                })
                                    .filter((e): e is Exclude<Remind, null | undefined> => !!e)
                                }
                            />
                        }

                        <Form.Group as={Row} className={"mb-2"}>
                            <Form.Label column sm={2} className="nowrap">System Proxy</Form.Label>
                            <Col sm={10}>
                                <ToggleButtonGroup type="checkbox" className='d-flex' defaultValue={getSystemProxy(setting)} value={getSystemProxy(setting)} onChange={setSystemProxy}>
                                    <ToggleButton variant='outline-primary' className='w-100' id="system-proxy-tbg-btn-1" value={1}>HTTP</ToggleButton>
                                    <ToggleButton variant='outline-primary' className='w-100' id="system-proxy-tbg-btn-2" value={2}>SOCKS5</ToggleButton>
                                </ToggleButtonGroup>

                            </Col>
                        </Form.Group >

                        <hr />
                        <Card.Title className='mb-2'>Inbound</Card.Title>
                        <SettingCheck label='DNS Hijack'
                            checked={!setting.server?.hijackDns ? false : true}
                            onChange={() => setSetting({ ...setting, server: { ...setting.server, hijackDns: !setting.server.hijackDns } }, false)} />

                        <SettingCheck label='Fakedns'
                            checked={!setting.server?.hijackDnsFakeip ? false : true}
                            onChange={() => setSetting({ ...setting, server: { ...setting.server, hijackDnsFakeip: !setting.server.hijackDnsFakeip } }, false)} />

                        <SettingCheck label='Sniff'
                            checked={!setting.server?.sniff?.enabled ? false : true}
                            onChange={() => setSetting({ ...setting, server: { ...setting.server, sniff: { ...setting.server.sniff, enabled: !setting.server.sniff.enabled } } }, false)} />

                        <hr />


                        <Card.Title className='mb-2'>DNS</Card.Title>
                        <SettingInputText label='DNS Server'
                            value={setting.dns?.server ? setting.dns?.server : ""}
                            onChange={(e) => setSetting({ ...setting, dns: { ...setting.dns, server: e } }, false)} />
                        <hr />

                        <Card.Title className='mb-2'>Logcat</Card.Title>
                        <SettingCheck label='Save'
                            checked={setting.logcat.save}
                            onChange={(x) => setSetting({ ...setting, logcat: { ...setting.logcat, save: x } }, false)} />
                        <SettingTypeSelect
                            label='Level'
                            type={log_levelSchema}
                            value={setting.logcat.level}
                            filter={(v) => v.number !== log_level.verbose && v.number !== log_level.fatal}
                            onChange={(e) => setSetting({ ...setting, logcat: { ...setting.logcat, level: e } }, false)}
                        />

                        <hr />

                        <Card.Title className='mb-2'>Advanced</Card.Title>

                        <Form.Label>UDP Buffer Size ({setting.advancedConfig ? setting.advancedConfig.udpBufferSize : 2048} Bytes)</Form.Label>
                        <Form.Range value={setting.advancedConfig ? setting.advancedConfig.udpBufferSize : 2048} min={2048} max={65535}
                            onChange={(v) => {
                                setSetting(prev => {
                                    const tmp = { ...prev }
                                    if (!tmp.advancedConfig) tmp.advancedConfig = create(advanced_configSchema, { udpBufferSize: v.target.valueAsNumber, relayBufferSize: 4096 })
                                    else tmp.advancedConfig = { ...tmp.advancedConfig, udpBufferSize: v.target.valueAsNumber }
                                    return tmp
                                }, false)
                            }
                            } />

                        <Form.Label>Relay Buffer Size ({setting.advancedConfig ? setting.advancedConfig.relayBufferSize : 4096} Bytes)</Form.Label>
                        <Form.Range value={setting.advancedConfig ? setting.advancedConfig.relayBufferSize : 4096} min={2048} max={65535}
                            onChange={(v) => setSetting(prev => {
                                const tmp = { ...prev }
                                if (!tmp.advancedConfig) tmp.advancedConfig = create(advanced_configSchema, { relayBufferSize: v.target.valueAsNumber, udpBufferSize: 2048 })
                                else tmp.advancedConfig = { ...tmp.advancedConfig, relayBufferSize: v.target.valueAsNumber }
                                return tmp
                            }, false)} />
                    </fieldset>

                </Card.Body>


                {!setting.platform?.androidApp &&
                    <Card.Footer className='d-flex justify-content-md-end'>
                        <Button
                            variant="outline-primary"
                            onClick={() => {
                                FetchProtobuf(config_service.method.save, setting)
                                    .then(async ({ error }) => {
                                        if (error !== undefined) ctx.Error(`save config failed, ${error.code}| ${await error.msg}`)
                                        else {
                                            ctx.Info("Save Config Successfully");
                                            setSetting()
                                        }
                                    })
                            }}
                        >
                            Save
                        </Button>
                    </Card.Footer>
                }
            </Card >
        </>
    );
}

export default ConfigComponent;
