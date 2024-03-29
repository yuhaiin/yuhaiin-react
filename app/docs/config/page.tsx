"use client"

import { useContext } from 'react';
import { Form, Card, Row, Col, Button, Tabs, Tab } from 'react-bootstrap';
import DNS from './dns';
import Bypass from './bypass';
import Inbound from './inbound';
import Loading from '../common/loading';
import {  SettingInputText, Remind, ItemList } from './components';
import {SettingCheck} from "../common/switch";
import { GlobalToastContext } from '../common/toast';
import useSWR from "swr";
import { ProtoTSFetcher, Fetch } from '../common/proto';
import Error from 'next/error';
import { yuhaiin as cp } from '../pbts/config';
import { yuhaiin as tp } from '../pbts/tools';

function ConfigComponent() {
    const ctx = useContext(GlobalToastContext);

    const { data: setting, error, isLoading, mutate: setSetting } =
        useSWR("/config", ProtoTSFetcher<cp.config.setting>(cp.config.setting),
            { revalidateOnFocus: false })
    const { data: info } =
        useSWR("/info", ProtoTSFetcher<cp.config.info>(cp.config.info),
            {})

    const { data: iffs } =
        useSWR("/interfaces", ProtoTSFetcher<tp.tools.Interfaces>(tp.tools.Interfaces),
            { revalidateOnFocus: true })


    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || setting === undefined) return <Loading />

    // const [isAndroid, setIsAndroid] = useState({ value: false })

    const updateState = (modify: (x: cp.config.setting) => void) => {
        setSetting((x: cp.config.setting) => {
            let y = cp.config.setting.create(x)
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
                        className="mb-3"
                    >
                        <Tab eventKey="home" title="Home">

                            <SettingCheck label='IPv6' checked={setting.ipv6} onChange={() => setSetting(cp.config.setting.create({ ...setting, ipv6: !setting.ipv6 }), false)} />
                            <SettingInputText
                                label='Network Interface'
                                value={setting.net_interface}
                                onChange={(v) => updateState((x) => x.net_interface = v)}
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
                                checked={setting.system_proxy!!.socks5!!}
                                onChange={() => updateState((x: cp.config.setting) => x.system_proxy!!.socks5 = !x.system_proxy?.socks5)} />

                            <SettingCheck label='HTTP'
                                checked={setting.system_proxy!!.http!!}
                                onChange={() => updateState((x) => x.system_proxy!!.http = !x.system_proxy!!.http)} />


                            <hr />

                            <Card.Title className='mb-2'>Logcat</Card.Title>
                            <SettingCheck label='Save'
                                checked={setting.logcat!!.save!!}
                                onChange={() => updateState((x) => x.logcat!!.save = !x.logcat!!.save)} />
                            <SettingLogcatLevelSelect label='Level' value={setting.logcat!!.level!!} onChange={(e) => updateState((x) => { x.logcat!!.level = e })} />


                        </Tab>
                        <Tab eventKey="bypass" title="Bypass">
                            <Bypass bypass={new cp.bypass.bypass_config(setting.bypass!!)} onChange={(e) => updateState((x) => x.bypass = e)} />
                        </Tab>
                        <Tab eventKey="dns" title="DNS">
                            <DNS data={new cp.dns.dns_config(setting.dns!!)} onChange={(e) => updateState((x) => x.dns = e)} />
                        </Tab>
                        <Tab eventKey="inbound" title="Inbound">
                            <Inbound server={setting.server!!} onChange={(e) => updateState((x) => x.server = e)} />
                        </Tab>
                        <Tab eventKey="info" title="Info">
                            <SettingInputText plaintext mb='mb-0' label='Version' value={info?.version} />
                            <SettingInputText url={"https://github.com/yuhaiin/yuhaiin/commit/" + info?.commit} plaintext mb='mb-0' label='Commit' value={info?.commit} />
                            <SettingInputText plaintext mb='mb-0' label='Build Time' value={info?.build_time} />
                            <SettingInputText plaintext mb='mb-0' label='Go Version' value={info?.go_version} />
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


                    {info?.os != "android" &&
                        <>
                            <hr />
                            <Button
                                onClick={() => {
                                    Fetch("/config", { body: cp.config.setting.encode(setting).finish() })
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
                        </>
                    }
                </Card.Body>
            </Card >
        </>
    );
}



const LogLevel = cp.log.log_level;

export default ConfigComponent;

function SettingLogcatLevelSelect(props: { label: string, value: cp.log.log_level, onChange: (value: cp.log.log_level) => void }) {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2}>{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Select value={LogLevel[props.value]} onChange={(e) => props.onChange(LogLevel[e.target.value])}>
                    <option value={LogLevel[LogLevel.debug]}>DEBUG</option>
                    <option value={LogLevel[LogLevel.info]}>INFO</option>
                    <option value={LogLevel[LogLevel.warning]}>WARN</option>
                    <option value={LogLevel[LogLevel.error]}>ERROR</option>
                </Form.Select>
            </Col>
        </Form.Group>
    )
}