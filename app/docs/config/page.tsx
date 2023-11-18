"use client"

import { useContext } from 'react';
import { Form, Card, Row, Col, Button, Tabs, Tab } from 'react-bootstrap';
import DNS from './dns';
import Bypass from './bypass';
import Inbound from './inbound';
import Loading from '../common/loading';
import { SettingCheck, SettingInputText } from './components';
import { GlobalToastContext } from '../common/toast';
import useSWR from "swr";
import { ProtoTSFetcher, Fetch } from '../common/proto';
import Error from 'next/error';
import { yuhaiin } from '../pbts/proto';

function ConfigComponent() {
    const ctx = useContext(GlobalToastContext);

    const { data: setting, error, isLoading, mutate: setSetting } = useSWR("/config", ProtoTSFetcher<yuhaiin.config.setting>(yuhaiin.config.setting), { revalidateOnFocus: false })

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || setting === undefined) return <Loading />

    // const [isAndroid, setIsAndroid] = useState({ value: false })

    const updateState = (modify: (x: yuhaiin.config.setting) => void) => {
        setSetting((x: yuhaiin.config.setting) => {
            let y = yuhaiin.config.setting.create(x)
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

                            <SettingCheck label='IPv6' checked={setting.ipv6} onChange={() => setSetting(yuhaiin.config.setting.create({ ...setting, ipv6: !setting.ipv6 }), false)} />
                            <SettingInputText label='Network Interface' value={setting.net_interface} onChange={(v) => updateState((x) => x.net_interface = v)} />

                            <hr />

                            <Card.Title className='mb-2'>System Proxy</Card.Title>

                            <SettingCheck label='SOCKS5'
                                checked={setting.system_proxy!!.socks5!!}
                                onChange={() => updateState((x: yuhaiin.config.setting) => x.system_proxy!!.socks5 = !x.system_proxy?.socks5)} />

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
                            <Bypass bypass={new yuhaiin.bypass.bypass_config(setting.bypass!!)} onChange={(e) => updateState((x) => x.bypass = e)} />
                        </Tab>
                        <Tab eventKey="dns" title="DNS">
                            <DNS data={new yuhaiin.dns.dns_config(setting.dns!!)} onChange={(e) => updateState((x) => x.dns = e)} />
                        </Tab>
                        <Tab eventKey="inbound" title="Inbound">
                            <Inbound server={setting.server!!.servers!!} onChange={(e) => updateState((x) => x.server!!.servers = e)} />
                        </Tab>

                    </Tabs>


                    {/* {!isAndroid.value && */}
                    <>
                        <hr />
                        <Button
                            onClick={() => {
                                Fetch("/config", { body: yuhaiin.config.setting.encode(setting).finish() })
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
                    {/* } */}
                </Card.Body>
            </Card >
        </>
    );
}



const LogLevel = yuhaiin.log.log_level;

export default ConfigComponent;

function SettingLogcatLevelSelect(props: { label: string, value: yuhaiin.log.log_level, onChange: (value: yuhaiin.log.log_level) => void }) {
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