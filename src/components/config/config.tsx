import React, { useEffect, useState } from 'react';
import { Form, FormGroup, InputGroup, Card, Row, Col, Button, Tabs, Tab, FloatingLabel } from 'react-bootstrap';
import DNS, { DefaultDnsConfig, DnsConfig } from './dns';
import Bypass, { defaultBypassConfig, BypassConfig } from './bypass';
import Inbound, { ServerConfig, defaultServers } from './inbound';
import { APIUrl } from '../apiurl';
import SwitchSelect from '../common/switch';


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

    const updateState = (modify: (x: typeof config) => void) => {
        let x = state.data;
        modify(x)
        setState({ data: x })
    }

    useEffect(() => {
        (async () => {
            try {
                await fetch(
                    APIUrl + "/config/json",
                    {
                        method: "get",
                    },
                ).then(async (resp) => {
                    setState({ data: await resp.json() as Config })
                })

            } catch (e) {
                console.log(e)
            }
        })()
    }, [])

    return (
        <>
            <Card className='mb-3'>
                <Card.Body>
                    <Tabs
                        defaultActiveKey="home"
                        className="mb-3"
                    >
                        <Tab eventKey="home" title="Home">

                            <FloatingLabel label="IPv6" className="mb-2">
                                <SwitchSelect value={state.data.ipv6} onChange={(e) => setState({ data: { ...state.data, ipv6: e } })} />
                            </FloatingLabel >

                            <FloatingLabel label="Network Interface" className="mb-2" >
                                <Form.Control value={state.data.net_interface} onChange={(v) => updateState((x) => x.net_interface = v.target.value)} />
                            </FloatingLabel>

                            <Card className='mb-2'>
                                <Card.Body>
                                    <Card.Title className='mb-2'>System Proxy</Card.Title>

                                    <FloatingLabel label="SOCKS5" className="mb-2">
                                        <SwitchSelect value={state.data.system_proxy.socks5 != undefined ? state.data.system_proxy.socks5 : false}
                                            onChange={(e) => updateState((x) => x.system_proxy.socks5 = e)} />
                                    </FloatingLabel >

                                    <FloatingLabel label="HTTP" className="mb-2">
                                        <SwitchSelect value={state.data.system_proxy.http != undefined ? state.data.system_proxy.http : false}
                                            onChange={(e) => updateState((x) => x.system_proxy.http = e)} />
                                    </FloatingLabel >

                                </Card.Body>
                            </Card>
                            <Card className='mb-2'>
                                <Card.Body>
                                    <Card.Title className='mb-2'>Logcat</Card.Title>

                                    <FloatingLabel label="Level" className="mb-2">
                                        <Form.Select value={state.data.logcat.level} onChange={(e) => updateState((x) => x.logcat.level = e.target.value)}>
                                            <option value="debug">DEBUG</option>
                                            <option value="info">INFO</option>
                                            <option value="warning">WARN</option>
                                            <option value="error">ERROR</option>
                                        </Form.Select>
                                    </FloatingLabel >

                                    <FloatingLabel label="Save" className="mb-2">
                                        <SwitchSelect value={state.data.logcat.save} onChange={(e) => updateState((x) => x.logcat.save = e)} />
                                    </FloatingLabel >

                                </Card.Body>
                            </Card>

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
                    <Button onClick={async () => {
                        console.log(state.data)

                        const resp = await fetch(APIUrl + "/config", {
                            method: "post",
                            headers: {
                                'content-type': 'application/json;charset=UTF-8',
                            },
                            body: JSON.stringify(state.data),
                        })

                        if (!resp.ok) console.log(await resp.text())
                        else console.log("save successful")
                    }
                    }>Save</Button>
                </Card.Body>
            </Card >
        </>


    );
}




export default Config;
