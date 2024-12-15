"use client"

import { create } from '@bufbuild/protobuf';
import Error from 'next/error';
import { useContext } from 'react';
import { Button, Card, Col, Form, Nav, Row, Tab, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import useSWR from "swr";
import { Interfaces } from '../common/interfaces';
import Loading from '../common/loading';
import { FetchProtobuf, ProtoESFetcher } from '../common/proto';
import { SettingCheck } from "../common/switch";
import { GlobalToastContext } from '../common/toast';
import { setting as Setting, system_proxySchema } from '../pbes/config/config_pb';
import { dns_configSchema } from '../pbes/config/dns/dns_pb';
import { config_service } from '../pbes/config/grpc/config_pb';
import { log_level } from '../pbes/config/log/log_pb';
import { Remind, SettingInputText } from './components';
import DNS from './dns';

function ConfigComponent() {
    const ctx = useContext(GlobalToastContext);

    const { data: setting, error, isLoading, mutate: setSetting } =
        useSWR("/config", ProtoESFetcher(config_service.method.load),
            { revalidateOnFocus: false })

    const interfaces = Interfaces();

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || setting === undefined) return <Loading />

    const getSystemProxy = (data: Setting) => {
        var x: number[] = []
        if (data.systemProxy?.http) x.push(1)
        if (data.systemProxy?.socks5) x.push(2)
        return x
    }

    const setSystemProxy = (x: number[]) => {
        let http = false, socks5 = false;

        for (var y of x) {
            if (y === 1) http = true
            if (y === 2) socks5 = true
        }

        setSetting({ ...setting, systemProxy: create(system_proxySchema, { http: http, socks5: socks5 }) }, false)
    }

    return (
        <>
            <Tab.Container defaultActiveKey={"home"}>
                <Card className='mb-3'>
                    <Card.Header>
                        <Nav variant='tabs'
                            style={{ flexWrap: 'nowrap', overflow: 'auto hidden' }}
                        >
                            <Nav.Item><Nav.Link eventKey="home">Setting</Nav.Link></Nav.Item>
                            <Nav.Item><Nav.Link eventKey="dns">DNS</Nav.Link></Nav.Item>
                        </Nav>
                    </Card.Header>
                    <Card.Body>
                        <Tab.Content>
                            <Tab.Pane eventKey="home">
                                <fieldset disabled={setting.platform?.androidApp}>

                                    <SettingCheck label='IPv6' checked={setting.ipv6} onChange={() => setSetting({ ...setting, ipv6: !setting.ipv6 }, false)} />
                                    <SettingInputText
                                        label='Network Interface'
                                        value={setting.netInterface}
                                        onChange={(v) => setSetting({ ...setting, netInterface: v }, false)}
                                        reminds={interfaces.map((v) => {
                                            if (!v.name) return undefined
                                            var r: Remind = {
                                                label: v.name,
                                                value: v.name,
                                                label_children: v.addresses?.map((vv) => !vv ? "" : vv)
                                            }
                                            return r
                                        })
                                            .filter((e): e is Exclude<Remind, null | undefined> => !!e)
                                        }
                                    />

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
                                        onChange={() => setSetting({ ...setting, server: { ...setting.server!!, hijackDns: !setting.server!!.hijackDns } }, false)} />

                                    <SettingCheck label='Fakedns'
                                        checked={!setting.server?.hijackDnsFakeip ? false : true}
                                        onChange={() => setSetting({ ...setting, server: { ...setting.server!!, hijackDnsFakeip: !setting.server!!.hijackDnsFakeip } }, false)} />

                                    <SettingCheck label='Sniff'
                                        checked={!setting.server?.sniff?.enabled ? false : true}
                                        onChange={() => setSetting({ ...setting, server: { ...setting.server!!, sniff: { ...setting.server!!.sniff!!, enabled: !setting.server!!.sniff!!.enabled } } }, false)} />

                                    <hr />

                                    <Card.Title className='mb-2'>Logcat</Card.Title>
                                    <SettingCheck label='Save'
                                        checked={setting.logcat!!.save!!}
                                        onChange={(x) => setSetting({ ...setting, logcat: { ...setting.logcat!!, save: x } }, false)} />
                                    <SettingLogcatLevelSelect label='Level' value={setting.logcat!!.level!!} onChange={(e) => setSetting({ ...setting, logcat: { ...setting.logcat!!, level: e } }, false)} />

                                </fieldset>
                            </Tab.Pane>

                            <Tab.Pane eventKey="dns" title="DNS">
                                <fieldset disabled={setting.platform?.androidApp}>
                                    <DNS value={create(dns_configSchema, setting.dns!!)} onChange={(e) => setSetting({ ...setting, dns: e }, false)} />
                                </fieldset>
                            </Tab.Pane>

                        </Tab.Content>

                    </Card.Body>


                    {!setting.platform?.androidApp &&
                        <Card.Footer className='d-flex justify-content-md-end'>
                            <Button
                                variant="outline-primary"
                                onClick={() => {
                                    FetchProtobuf(config_service.method.save, "/config", "POST", setting,)
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
            </Tab.Container>
        </>
    );
}

export default ConfigComponent;

function SettingLogcatLevelSelect(props: { label: string, value: log_level, onChange: (value: log_level) => void }) {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2}>{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Select value={log_level[props.value]} onChange={(e) => props.onChange(log_level[e.target.value as keyof typeof log_level])}>
                    <option value={log_level[log_level.debug]}>DEBUG</option>
                    <option value={log_level[log_level.info]}>INFO</option>
                    <option value={log_level[log_level.warning]}>WARN</option>
                    <option value={log_level[log_level.error]}>ERROR</option>
                </Form.Select>
            </Col>
        </Form.Group>
    )
}