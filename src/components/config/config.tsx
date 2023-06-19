import React, { useContext, useEffect, useState } from 'react';
import { Form, FormGroup, InputGroup, Card, Row, Col, Button, Tabs, Tab, FloatingLabel } from 'react-bootstrap';
import DNS, { DefaultDnsConfig, DnsConfig } from './dns';
import Bypass, { defaultBypassConfig, BypassConfig } from './bypass';
import Inbound, { ServerConfig, defaultServers } from './inbound';
import { APIUrl } from '../apiurl';
import SwitchSelect from '../common/switch';
import Loading from '../loading';
import { SettingCheck, SettingInputText } from './components';
import { GlobalToastContext } from '../toast';


type Config = {
    ipv6: boolean,
    net_interface: string,
    system_proxy: {
        socks5?: boolean,
        http?: boolean,
    }
    bypass: BypassConfig,
    dns: DnsConfig,
    server: {
        servers: { [key: string]: ServerConfig },
    }
    logcat: {
        level: string,
        save: boolean,
    }
}

function Config() {
    const ctx = useContext(GlobalToastContext);

    const config: Config = {
        "ipv6": true,
        "net_interface": "",
        "system_proxy": {
            "http": true,
            "socks5": false
        },
        "bypass": defaultBypassConfig,
        "dns": DefaultDnsConfig,
        "server": {
            "servers": defaultServers,
        },
        "logcat": {
            "level": "verbose",
            "save": true
        }
    };

    const [state, setState] = useState({ data: config });
    const [loading, setLoading] = useState({ value: true })

    const updateState = (modify: (x: typeof config) => void) => {
        let x = state.data;
        modify(x)
        setState({ data: x })
    }

    const refresh = async () => {
        try {
            const resp = await fetch(
                APIUrl + "/config/json",
                {
                    method: "GET",
                },
            )

            if (!resp.ok) return

            setState({ data: await resp.json() as Config })
            setLoading({ value: false })
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

                                <SettingCheck label='IPv6' checked={state.data.ipv6} onChange={() => setState({ data: { ...state.data, ipv6: !state.data.ipv6 } })} />
                                <SettingInputText label='Network Interface' value={state.data.net_interface} onChange={(v) => updateState((x) => x.net_interface = v)} />

                                <hr />

                                <Card.Title className='mb-2'>System Proxy</Card.Title>


                                <SettingCheck label='SOCKS5'
                                    checked={state.data.system_proxy.socks5 != undefined ? state.data.system_proxy.socks5 : false}
                                    onChange={() => updateState((x) => x.system_proxy.socks5 = !x.system_proxy.socks5)} />

                                <SettingCheck label='HTTP'
                                    checked={state.data.system_proxy.http != undefined ? state.data.system_proxy.http : false}
                                    onChange={() => updateState((x) => x.system_proxy.http = !x.system_proxy.http)} />


                                <hr />

                                <Card.Title className='mb-2'>Logcat</Card.Title>
                                <SettingCheck label='Save'
                                    checked={state.data.logcat.save}
                                    onChange={() => updateState((x) => x.logcat.save = !x.logcat.save)} />
                                <SettingLogcatLevelSelect label='Level' value={state.data.logcat.level} onChange={(e) => updateState((x) => x.logcat.level = e)} />


                            </Tab>
                            <Tab eventKey="bypass" title="Bypass">
                                <Bypass bypass={state.data.bypass} onChange={(e) => updateState((x) => x.bypass = e)} />
                            </Tab>
                            <Tab eventKey="dns" title="DNS">
                                <DNS data={state.data.dns} onChange={(e) => updateState((x) => x.dns = e)} />
                            </Tab>
                            <Tab eventKey="inbound" title="Inbound">
                                <Inbound server={state.data.server.servers} onChange={(e) => updateState((x) => x.server.servers = e)} />
                            </Tab>

                        </Tabs>

                        <hr />

                        <Button onClick={async () => {
                            console.log(state.data)

                            const resp = await fetch(APIUrl + "/config", {
                                method: "POST",
                                headers: {
                                    'content-type': 'application/json;charset=UTF-8',
                                },
                                body: JSON.stringify(state.data),
                            })

                            if (!resp.ok) console.log(await resp.text())
                            else {
                                await refresh()
                                ctx.Info("Save Config Successful!!");
                                console.log("save successful")
                            }
                        }
                        }>Save</Button>
                    </Card.Body>
                </Card >
            }
        </>


    );
}




export default Config;

function SettingLogcatLevelSelect(props: { label: string, value: string, onChange: (value: string) => void }) {
    return (
        <Form.Group as={Row} className='mb-3'>
            <Form.Label column sm={2}>{props.label}</Form.Label>
            <Col sm={10}>
                <Form.Select value={props.value} onChange={(e) => props.onChange(e.target.value)}>
                    <option value="debug">DEBUG</option>
                    <option value="info">INFO</option>
                    <option value="warning">WARN</option>
                    <option value="error">ERROR</option>
                </Form.Select>
            </Col>
        </Form.Group>
    )
}