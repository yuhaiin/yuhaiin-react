"use client"

import { Card, CardBody, CardHeader, IconBox, MainContainer } from '@/app/component/v2/card';
import { SettingInputVertical, SwitchCard } from "@/app/component/v2/forms";
import React from "react";
import { BroadcastPin, GeoAlt, Globe, HddNetwork, InfoCircle, Link45deg, ShieldShaded, Speedometer2, Terminal } from 'react-bootstrap-icons';
import { useLocalStorage } from "usehooks-ts";
import {
    APIUrlDefault, APIUrlKey,
    LatencyDNSUrlDefault, LatencyDNSUrlKey,
    LatencyHTTPUrlDefault, LatencyHTTPUrlKey,
    LatencyIPUrlDefault, LatencyIPUrlKey,
    LatencyIPv6Default, LatencyIPv6Key,
    LatencyStunTCPUrlDefault, LatencyStunTCPUrlKey,
    LatencyStunUrlDefault, LatencyStunUrlKey
} from "../common/apiurl";

// Internal helper for this page to add icons to inputs
const InputWithIcon: React.FC<{
    icon: React.ElementType;
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
}> = ({ icon: Icon, label, value, onChange, placeholder }) => (
    <div className="d-flex align-items-start gap-3 mb-4">
        <div className="bg-body-tertiary rounded-3 p-2 mt-4 d-none d-sm-block border border-secondary border-opacity-10">
            <span className="text-muted fs-5 d-flex"><Icon /></span>
        </div>
        <div className="flex-grow-1">
            <SettingInputVertical
                label={label}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
            />
        </div>
    </div>
);

function Setting() {
    const [url, setUrl] = useLocalStorage(APIUrlKey, APIUrlDefault);
    const [latencyHTTP, setLatencyHTTP] = useLocalStorage(LatencyHTTPUrlKey, LatencyHTTPUrlDefault);
    const [latencyDNS, setLatencyDNS] = useLocalStorage(LatencyDNSUrlKey, LatencyDNSUrlDefault);
    const [latencyIPv6, setLatencyIPv6] = useLocalStorage(LatencyIPv6Key, LatencyIPv6Default);
    const [latencyIPUrl, setLatencyIPUrl] = useLocalStorage(LatencyIPUrlKey, LatencyIPUrlDefault);
    const [latencyStunUrl, setLatencyStunUrl] = useLocalStorage(LatencyStunUrlKey, LatencyStunUrlDefault);
    const [latencyStunTCPUrl, setLatencyStunTCPUrl] = useLocalStorage(LatencyStunTCPUrlKey, LatencyStunTCPUrlDefault);

    return (
        <MainContainer>
            {/* 1. API Connection */}
            <Card>
                <CardHeader>
                    <IconBox icon={Link45deg} color="#6366f1" title="API Connection" description="Web-controller interface" />
                </CardHeader>
                <CardBody className="pt-2">
                    <InputWithIcon
                        icon={HddNetwork}
                        label="Controller Host"
                        value={url}
                        onChange={setUrl}
                        placeholder="http://127.0.0.1:50051"
                    />
                </CardBody>
            </Card>

            {/* 2. Latency Targets */}
            <Card >
                <CardHeader>
                    <IconBox icon={Speedometer2} color="#10b981" title="Latency Targets" description="Endpoints for connectivity checks" />
                </CardHeader>
                <CardBody>
                    {/* Toggle at the top */}
                    <div className="mb-3">
                        <SwitchCard
                            label="IPv6 Testing"
                            description="Use IPv6 resolution for latency checks"
                            checked={latencyIPv6}
                            onCheckedChange={() => setLatencyIPv6(!latencyIPv6)}
                        />
                    </div>

                    {/* Vertical List of Targets */}
                    <InputWithIcon
                        icon={Globe}
                        label="HTTP (TCP) Check"
                        value={latencyHTTP}
                        onChange={setLatencyHTTP}
                        placeholder="https://..."
                    />
                    <InputWithIcon
                        icon={ShieldShaded}
                        label="DNS (UDP/DOQ) Check"
                        value={latencyDNS}
                        onChange={setLatencyDNS}
                        placeholder="dns.example.com:853"
                    />
                    <InputWithIcon
                        icon={GeoAlt}
                        label="IP Info Service"
                        value={latencyIPUrl}
                        onChange={setLatencyIPUrl}
                        placeholder="http://ip.sb"
                    />
                    <InputWithIcon
                        icon={BroadcastPin}
                        label="STUN (UDP) Check"
                        value={latencyStunUrl}
                        onChange={setLatencyStunUrl}
                        placeholder="stun.example.com:3478"
                    />
                    <InputWithIcon
                        icon={Terminal}
                        label="STUN (TCP) Check"
                        value={latencyStunTCPUrl}
                        onChange={setLatencyStunTCPUrl}
                        placeholder="stun.example.com:3478"
                    />
                </CardBody>
            </Card>

            <div className="text-center mt-3 opacity-50 pb-5">
                <small className="text-muted d-flex align-items-center justify-content-center">
                    <InfoCircle className="me-1" />
                    These settings are stored locally in your browser cache.
                </small>
            </div>
        </MainContainer>
    );
}

export default Setting;