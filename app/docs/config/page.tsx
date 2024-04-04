"use client"

import { useContext } from 'react';
import { Form, Card, Row, Col, Button, Tabs, Tab } from 'react-bootstrap';
import DNS from './dns';
import Bypass from './bypass';
import Inbound from './server';
import Loading from '../common/loading';
import { SettingInputText, Remind, ItemList } from './components';
import { SettingCheck } from "../common/switch";
import { GlobalToastContext } from '../common/toast';
import useSWR from "swr";
import { Fetch, ProtoESFetcher } from '../common/proto';
import Error from 'next/error';
import { setting as Setting, info as Info } from '../pbes/config/config_pb';
import { Interfaces } from '../pbes/tools/tools_pb';
import { dns_config } from '../pbes/config/dns/dns_pb';
import { bypass_config } from '../pbes/config/bypass/bypass_pb';
import { log_level } from '../pbes/config/log/log_pb';
import { Inbounds } from './inboud';

function ConfigComponent() {
    const ctx = useContext(GlobalToastContext);

    const { data: setting, error, isLoading, mutate: setSetting } =
        useSWR("/config", ProtoESFetcher<Setting>(new Setting()),
            { revalidateOnFocus: false })
    const { data: info } =
        useSWR("/info", ProtoESFetcher<Info>(new Info()),
            {})

    const { data: iffs } =
        useSWR("/interfaces", ProtoESFetcher<Interfaces>(new Interfaces()),
            { revalidateOnFocus: true })


    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || setting === undefined) return <Loading />

    const updateState = (modify: (x: Setting) => void) => {
        setSetting((x: Setting) => {
            let y = new Setting(x)
            modify(y)
            return y
        }, false)
    }


    return (
        <>
            <Card className='mb-3'>
                <Card.Body>
                    <Tabs
                        defaultActiveKey="home"
                        className='mb-2'
                        style={{ flexWrap: 'nowrap', overflow: 'auto hidden', height: '40px' }}
                    >
                        <Tab eventKey="home" title="Home">

                            <SettingCheck label='IPv6' checked={setting.ipv6} onChange={() => setSetting(new Setting({ ...setting, ipv6: !setting.ipv6 }), false)} />
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

                            <hr />

                            <Card.Title className='mb-2'>System Proxy</Card.Title>

                            <SettingCheck label='SOCKS5'
                                checked={setting.systemProxy!!.socks5!!}
                                onChange={() => updateState((x) => x.systemProxy!!.socks5 = !x.systemProxy?.socks5)} />

                            <SettingCheck label='HTTP'
                                checked={setting.systemProxy!!.http!!}
                                onChange={() => updateState((x) => x.systemProxy!!.http = !x.systemProxy!!.http)} />


                            <hr />

                            <Card.Title className='mb-2'>Logcat</Card.Title>
                            <SettingCheck label='Save'
                                checked={setting.logcat!!.save!!}
                                onChange={() => updateState((x) => x.logcat!!.save = !x.logcat!!.save)} />
                            <SettingLogcatLevelSelect label='Level' value={setting.logcat!!.level!!} onChange={(e) => updateState((x) => { x.logcat!!.level = e })} />
                        </Tab>

                        <Tab eventKey="bypass" title="Bypass">
                            <Bypass bypass={new bypass_config(setting.bypass!!)} onChange={(e) => updateState((x) => x.bypass = e)} />
                        </Tab>

                        <Tab eventKey="dns" title="DNS">
                            <DNS data={new dns_config(setting.dns!!)} onChange={(e) => updateState((x) => x.dns = e)} />
                        </Tab>


                        <Tab eventKey="inbound" title="Inbound">
                            <Inbounds
                                inbounds={setting.server!!}
                                onChange={(x) => { updateState((y) => y.server = x) }}
                            />
                        </Tab>

                        <Tab eventKey="inbound_old" title="Inbound(Deprecated)">
                            <Inbound server={setting.server!!} onChange={(e) => updateState((x) => x.server = e)} />
                        </Tab>

                        <Tab eventKey="info" title="Info">
                            <SettingInputText plaintext mb='mb-0' label='Version' value={info?.version} />
                            <SettingInputText url={"https://github.com/yuhaiin/yuhaiin/commit/" + info?.commit} plaintext mb='mb-0' label='Commit' value={info?.commit} />
                            <SettingInputText plaintext mb='mb-0' label='Build Time' value={info?.buildTime} />
                            <SettingInputText plaintext mb='mb-0' label='Go Version' value={info?.goVersion} />
                            <SettingInputText
                                url="https://github.com/yuhaiin/yuhaiin"
                                plaintext mb='mb-0'
                                label='Github'
                                value={"yuhaiin/yuhaiin"}
                            />
                            <SettingInputText plaintext mb='mb-0' label='OS' value={info?.os} />
                            <SettingInputText plaintext mb='mb-0' label='Arch' value={info?.arch} />
                            <SettingInputText plaintext mb='mb-0' label='Compiler' value={info?.compiler} />
                            <SettingInputText plaintext mb='mb-0' label='Platform' value={info?.platform} />
                            <ItemList title='Build' data={info?.build} mb='mb-0' />
                        </Tab>
                    </Tabs>

                </Card.Body>


                {info?.os != "android" &&
                    <Card.Footer className='d-flex justify-content-md-end'>
                        <Button
                            variant="outline-primary"
                            onClick={() => {
                                Fetch("/config", { body: setting.toBinary() })
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