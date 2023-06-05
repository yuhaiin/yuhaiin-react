import React, { useState } from 'react';
import { Form, FormGroup, InputGroup, Card } from 'react-bootstrap';

function Config() {

    const config = {
        "ipv6": true,
        "net_interface": "",
        "system_proxy": {
            "http": true,
            "socks5": false
        },
        "bypass": {
            "tcp": "bypass",
            "udp": "bypass",
            "bypass_file": "/home/asutorufa/Documents/Programming/ACL/yuhaiin/yuhaiin.conf",
            "custom_rule_v3": [
                {
                    "hostname": [
                        "dns.google",
                        "jc72n2xbdh.cloudflare-gateway.com",
                        "dns.nextdns.io"
                    ],
                    "mode": "proxy",
                    "tag": "remote_dns",
                    "resolve_strategy": "default"
                },
                {
                    "hostname": [
                        "ssl.gstatic.com",
                        "yuubinsya.com",
                        "yuubinsya.dns.com"
                    ],
                    "mode": "proxy",
                    "tag": "",
                    "resolve_strategy": "default"
                },
                {
                    "hostname": [
                        "gpt.nloli.xyz"
                    ],
                    "mode": "proxy",
                    "tag": "test-gpt",
                    "resolve_strategy": "default"
                },
                {
                    "hostname": [
                        "223.5.5.5",
                        "*.edgesrv.xyz",
                        "dns.pub",
                        "*.right.com.cn"
                    ],
                    "mode": "direct",
                    "tag": "",
                    "resolve_strategy": "default"
                },
                {
                    "hostname": [
                        "example.block.domain.com"
                    ],
                    "mode": "block",
                    "tag": "",
                    "resolve_strategy": "default"
                }
            ]
        },
        "dns": {
            "server": "127.0.0.1:5454",
            "fakedns": false,
            "fakedns_ip_range": "10.0.2.1/24",
            "resolve_remote_domain": false,
            "remote": {
                "host": "https://jc72n2xbdh.cloudflare-gateway.com/dns-query",
                "type": "doh",
                "subnet": "",
                "tls_servername": ""
            },
            "local": {
                "host": "dns.pub",
                "type": "doh",
                "subnet": "223.5.5.5/24",
                "tls_servername": ""
            },
            "bootstrap": {
                "host": "223.5.5.5",
                "type": "udp",
                "subnet": "",
                "tls_servername": ""
            },
            "hosts": {
                "203.104.209.7": "203.104.209.150",
                "asutorufa": "127.0.1.1",
                "example.com": "example.com",
                "syncthing.13547982.xyz": "162.159.128.2"
            }
        },
        "server": {
            "servers": {
                "http": {
                    "name": "http",
                    "enabled": true,
                    "http": {
                        "host": "0.0.0.0:8188",
                        "username": "",
                        "password": ""
                    }
                },
                "redir": {
                    "name": "redir",
                    "enabled": false,
                    "redir": {
                        "host": "127.0.0.1:8088"
                    }
                },
                "socks5": {
                    "name": "socks5",
                    "enabled": true,
                    "socks5": {
                        "host": "0.0.0.0:1080",
                        "username": "",
                        "password": ""
                    }
                },
                "tun": {
                    "name": "tun",
                    "enabled": false,
                    "tun": {
                        "name": "tun://tun0",
                        "mtu": 1500,
                        "gateway": "172.19.0.1",
                        "dns_hijacking": true,
                        "skip_multicast": true,
                        "driver": "fdbased",
                        "portal": "172.19.0.2"
                    }
                },
                "yuubinsya": {
                    "name": "yuubinsya",
                    "enabled": true,
                    "yuubinsya": {
                        "host": ":40501",
                        "password": "123",
                        "force_disable_encrypt": false,
                        "normal": {}
                    }
                },
                "yuubinsya-grpc": {
                    "name": "yuubinsya-grpc",
                    "enabled": true,
                    "yuubinsya": {
                        "host": ":31579",
                        "password": "xczdsa/,;[]daea/';",
                        "force_disable_encrypt": true,
                        "websocket": {
                            "tls": null
                        }
                    }
                }
            }
        },
        "logcat": {
            "level": "verbose",
            "save": true
        }
    };

    const [state, setState] = useState(config);

    return (
        <div>
            <Form>
                <FormGroup>
                    <Form.Check
                        type='switch'
                        checked={state.ipv6}
                        onChange={() => { setState({ ...state, ipv6: !state.ipv6 }) }}
                        label="IPv6"
                    />
                </FormGroup>
            </Form>

            <Card>
                <Card.Body>
                    <InputGroup className="mb-3">
                        <InputGroup.Text>TCP</InputGroup.Text>
                        <Form.Select value={state.bypass.tcp} onChange={(e) => setState({ ...state, bypass: { ...state.bypass, tcp: e.target.value } })} id="TCP">
                            <option value="bypass">BYPASS</option>
                            <option value="direct">DIRECT</option>
                            <option value="proxy">PROXY</option>
                            <option value="block">BLOCK</option>
                        </Form.Select>
                        <InputGroup.Text>UDP</InputGroup.Text>
                        <Form.Select value={state.bypass.udp} onChange={(e) => setState({ ...state, bypass: { ...state.bypass, udp: e.target.value } })} id="UDP">
                            <option value="bypass">BYPASS</option>
                            <option value="direct">DIRECT</option>
                            <option value="proxy">PROXY</option>
                            <option value="block">BLOCK</option>
                        </Form.Select>
                    </InputGroup>

                    {
                        state.bypass.custom_rule_v3.map((value, index) => (
                            <div key={index}>
                                <div>{value.mode}</div>
                                <div>{value.tag}</div>
                            </div>
                        ))
                    }
                </Card.Body>
            </Card>
        </div >
    );
}

export default Config;
