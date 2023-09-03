import { useContext, useEffect, useState } from 'react';
import { Form, Card, Row, Col, Button, Tabs, Tab } from 'react-bootstrap';
import DNS, { DefaultDnsConfig, } from './dns';
import Bypass, { defaultBypassConfig, } from './bypass';
import Inbound, { defaultServers } from './inbound';
import { APIUrl } from '../apiurl';
import Loading from '../loading';
import { SettingCheck, SettingInputText } from './components';
import { GlobalToastContext } from '../toast';
import {
    log_level as LogLevel,
    log_levelToJSON as LogLevelToJSON,
    log_levelFromJSON as LogLevelFromJSON,
} from '../../protos/config/log/log';
import { setting as Setting } from '../../protos/config/config';

function ConfigComponent() {
    const ctx = useContext(GlobalToastContext);

    const config: Setting = {
        ipv6: true,
        net_interface: "",
        system_proxy: { http: true, socks5: false },
        bypass: defaultBypassConfig,
        dns: DefaultDnsConfig,
        server: { servers: defaultServers },
        logcat: { level: LogLevel.verbose, save: true }
    };

    const [setting, setSetting] = useState<Setting>(config);
    const [loading, setLoading] = useState({ value: true })
    const [isAndroid, setIsAndroid] = useState({ value: false })

    const updateState = (modify: (x: Setting) => void) => {
        let x = setting;
        modify(x)
        setSetting({ ...x })
    }

    const refresh = async () => {
        try {
            const resp = await fetch(
                APIUrl + "/config",
                {
                    method: "GET",
                },
            )

            if (!resp.ok) return

            setSetting({ ...Setting.decode(new Uint8Array(await resp.arrayBuffer())) })
            setLoading({ value: false })
            setIsAndroid({ value: resp.headers.get("Core-OS") === "android" })
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => { (async () => { await refresh() })() }, [])

    return (
        <>
            {loading.value && <Loading />}
            {!loading.value &&
                <Card className='mb-3'>
                    <Card.Body>
                        <Tabs
                            defaultActiveKey="home"
                            className="mb-3"
                        >
                            <Tab eventKey="home" title="Home">

                                <SettingCheck label='IPv6' checked={setting.ipv6} onChange={() => setSetting({ ...setting, ipv6: !setting.ipv6 })} />
                                <SettingInputText label='Network Interface' value={setting.net_interface} onChange={(v) => updateState((x) => x.net_interface = v)} />

                                <hr />

                                <Card.Title className='mb-2'>System Proxy</Card.Title>


                                <SettingCheck label='SOCKS5'
                                    checked={setting.system_proxy!!.socks5}
                                    onChange={() => updateState((x) => x.system_proxy!!.socks5 = !x.system_proxy!!.socks5)} />

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


                        {!isAndroid.value &&
                            <>
                                <hr />
                                <Button
                                    onClick={async () => {
                                        console.log(setting)

                                        const resp = await fetch(APIUrl + "/config", {
                                            method: "POST",
                                            headers: {
                                                'content-type': 'application/protobuf',
                                            },
                                            body: Setting.encode(setting).finish(),
                                        })

                                        if (!resp.ok) console.log(await resp.text())
                                        else {
                                            await refresh()
                                            ctx.Info("Save Config Successfully");
                                            console.log("save successful")
                                        }
                                    }
                                    }
                                >
                                    Save
                                </Button>
                            </>
                        }
                    </Card.Body>
                </Card >
            }
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