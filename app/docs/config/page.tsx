"use client"

import { useContext } from 'react';
import { Form, Card, Row, Col, Button, Tab, ToggleButtonGroup, ToggleButton, Nav } from 'react-bootstrap';
import DNS from './dns';
import Loading from '../common/loading';
import { SettingInputText, Remind } from './components';
import { SettingCheck } from "../common/switch";
import { GlobalToastContext } from '../common/toast';
import useSWR from "swr";
import { Fetch, ProtoESFetcher } from '../common/proto';
import Error from 'next/error';
import { setting as Setting, settingSchema, system_proxySchema } from '../pbes/config/config_pb';
import { InterfacesSchema } from '../pbes/tools/tools_pb';
import { dns_configSchema } from '../pbes/config/dns/dns_pb';
import { log_level } from '../pbes/config/log/log_pb';
import { Inbounds } from './inboud';
import { clone, create, toBinary } from '@bufbuild/protobuf';
import { inbound_configSchema } from '../pbes/config/listener/listener_pb';

function ConfigComponent() {
    const ctx = useContext(GlobalToastContext);

    const { data: setting, error, isLoading, mutate: setSetting } =
        useSWR("/config", ProtoESFetcher(settingSchema),
            { revalidateOnFocus: false })

    const { data: iffs } =
        useSWR(setting?.platform?.androidApp ? null : "/interfaces", ProtoESFetcher(InterfacesSchema),
            { revalidateOnFocus: true })

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || setting === undefined) return <Loading />


    const updateState = (modify: (x: Setting) => void) => {
        setSetting((x: Setting) => {
            let y = clone(settingSchema, x)
            modify(y)
            return y
        }, false)
    }

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

        updateState((x) => { x.systemProxy = create(system_proxySchema, { http: http, socks5: socks5 }) })
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
                            <Nav.Item><Nav.Link eventKey="inbound">Inbound</Nav.Link></Nav.Item>
                        </Nav>
                    </Card.Header>
                    <Card.Body>
                        <Tab.Content>
                            <Tab.Pane eventKey="home">
                                <fieldset disabled={setting.platform?.androidApp}>

                                    <SettingCheck label='IPv6' checked={setting.ipv6} onChange={() => setSetting(create(settingSchema, { ...setting, ipv6: !setting.ipv6 }), false)} />
                                    <SettingInputText
                                        label='Network Interface'
                                        value={setting.netInterface}
                                        onChange={(v) => updateState((x) => x.netInterface = v)}
                                        reminds={
                                            iffs?.
                                                interfaces.
                                                map((v) => {
                                                    if (!v.name) return undefined
                                                    var r: Remind = {
                                                        label: v.name,
                                                        value: v.name,
                                                        label_children: v.addresses?.map((vv) => !vv ? "" : vv)
                                                    }
                                                    return r
                                                }).
                                                filter((e): e is Exclude<Remind, null | undefined> => !!e)
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

                                    <Card.Title className='mb-2'>Logcat</Card.Title>
                                    <SettingCheck label='Save'
                                        checked={setting.logcat!!.save!!}
                                        onChange={() => updateState((x) => x.logcat!!.save = !x.logcat!!.save)} />
                                    <SettingLogcatLevelSelect label='Level' value={setting.logcat!!.level!!} onChange={(e) => updateState((x) => { x.logcat!!.level = e })} />

                                </fieldset>
                            </Tab.Pane>

                            <Tab.Pane eventKey="dns" title="DNS">
                                <fieldset disabled={setting.platform?.androidApp}>
                                    <DNS data={create(dns_configSchema, setting.dns!!)} onChange={(e) => updateState((x) => x.dns = clone(dns_configSchema, e))} />
                                </fieldset>
                            </Tab.Pane>


                            <Tab.Pane eventKey="inbound" title="Inbound">
                                <fieldset disabled={setting.platform?.androidApp}>
                                    <Inbounds
                                        inbounds={create(inbound_configSchema, setting.server!!)}
                                        onChange={(e) => updateState((x) => x.server = clone(inbound_configSchema, e))}
                                    />
                                </fieldset>
                            </Tab.Pane>

                        </Tab.Content>

                    </Card.Body>


                    {!setting.platform?.androidApp &&
                        <Card.Footer className='d-flex justify-content-md-end'>
                            <Button
                                variant="outline-primary"
                                onClick={() => {
                                    Fetch("/config", { body: toBinary(settingSchema, setting) })
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
                <Form.Select value={log_level[props.value]} onChange={(e) => props.onChange(log_level[e.target.value])}>
                    <option value={log_level[log_level.debug]}>DEBUG</option>
                    <option value={log_level[log_level.info]}>INFO</option>
                    <option value={log_level[log_level.warning]}>WARN</option>
                    <option value={log_level[log_level.error]}>ERROR</option>
                </Form.Select>
            </Col>
        </Form.Group>
    )
}