"use client"

import { useContext } from 'react';
import { Form, Card, Row, Col, Button, Tabs, Tab } from 'react-bootstrap';
import DNS from './dns';
import Bypass from './bypass';
import Inbound from './inbound';
import Loading from '../common/loading';
import { SettingCheck, SettingInputText } from './components';
import { GlobalToastContext } from '../common/toast';
import {
    log_level as LogLevel,
    log_levelToJSON as LogLevelToJSON,
    log_levelFromJSON as LogLevelFromJSON,
} from '../protos/config/log/log';
import { setting as Setting } from '../protos/config/config';
import useSWR from "swr";
import { ProtoFetcher, Fetch } from '../common/proto';
import { produce } from "immer"
import Error from 'next/error';

function ConfigComponent() {
    const ctx = useContext(GlobalToastContext);

    const { data: setting, error, isLoading, mutate: setSetting } = useSWR("/config", ProtoFetcher(Setting), { revalidateOnFocus: false })

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || setting === undefined) return <Loading />

    // const [isAndroid, setIsAndroid] = useState({ value: false })

    const updateState = (modify: (x: Setting) => void) => {
        setSetting((x: Setting) => { return produce(x, (v) => { modify(v) }) }, false)
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

                            <SettingCheck label='IPv6' checked={setting.ipv6} onChange={() => setSetting({ ...setting, ipv6: !setting.ipv6 }, false)} />
                            <SettingInputText label='Network Interface' value={setting.net_interface} onChange={(v) => updateState((x) => x.net_interface = v)} />

                            <hr />

                            <Card.Title className='mb-2'>System Proxy</Card.Title>

                            <SettingCheck label='SOCKS5'
                                checked={setting.system_proxy!!.socks5}
                                onChange={() => updateState((x: Setting) => x.system_proxy!!.socks5 = !x.system_proxy?.socks5)} />

                            <SettingCheck label='HTTP'
                                checked={setting.system_proxy!!.http}
                                onChange={() => updateState((x) => x.system_proxy!!.http = !x.system_proxy!!.http)} />


                            <hr />

                            <Card.Title className='mb-2'>Logcat</Card.Title>
                            <SettingCheck label='Save'
                                checked={setting.logcat!!.save}
                                onChange={() => updateState((x) => x.logcat!!.save = !x.logcat!!.save)} />
                            <SettingLogcatLevelSelect label='Level' value={setting.logcat!!.level} onChange={(e) => updateState((x) => { x.logcat!!.level = e })} />


                        </Tab>
                        <Tab eventKey="bypass" title="Bypass">
                            <Bypass bypass={setting.bypass!!} onChange={(e) => updateState((x) => x.bypass = e)} />
                        </Tab>
                        <Tab eventKey="dns" title="DNS">
                            <DNS data={setting.dns!!} onChange={(e) => updateState((x) => x.dns = e)} />
                        </Tab>
                        <Tab eventKey="inbound" title="Inbound">
                            <Inbound server={setting.server!!.servers} onChange={(e) => updateState((x) => x.server!!.servers = e)} />
                        </Tab>

                    </Tabs>


                    {/* {!isAndroid.value && */}
                    <>
                        <hr />
                        <Button
                            onClick={() => {
                                Fetch("/config", { body: Setting.encode(setting).finish() })
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



export default ConfigComponent;

function SettingLogcatLevelSelect(props: { label: string, value: LogLevel, onChange: (value: LogLevel) => void }) {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2}>{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Select value={LogLevelToJSON(props.value)} onChange={(e) => props.onChange(LogLevelFromJSON(e.target.value))}>
                    <option value={LogLevelToJSON(LogLevel.debug)}>DEBUG</option>
                    <option value={LogLevelToJSON(LogLevel.info)}>INFO</option>
                    <option value={LogLevelToJSON(LogLevel.warning)}>WARN</option>
                    <option value={LogLevelToJSON(LogLevel.error)}>ERROR</option>
                </Form.Select>
            </Col>
        </Form.Group>
    )
}