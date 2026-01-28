"use client"

import { Card, CardBody, CardHeader, IconBox, MainContainer } from '@/component/v2/card';
import { SettingInputVertical, SwitchCard } from "@/component/v2/forms";
import { Gauge, Globe, Info, Link, MapPin, Network, Radio, Shield, Terminal } from 'lucide-react';
import React from "react";
import { useLocalStorage } from "usehooks-ts";
import {
    APIUrlDefault, APIUrlKey,
    LatencyDNSUrlDefault, LatencyDNSUrlKey,
    LatencyHTTPUrlDefault, LatencyHTTPUrlKey,
    LatencyIPUrlDefault, LatencyIPUrlKey,
    LatencyIPv6Default, LatencyIPv6Key,
    LatencyStunTCPUrlDefault, LatencyStunTCPUrlKey,
    LatencyStunUrlDefault, LatencyStunUrlKey
} from "../../common/apiurl";

// Internal helper for this page to add icons to inputs
const InputWithIcon: React.FC<{
    icon: React.ElementType;
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
}> = ({ icon: Icon, label, value, onChange, placeholder }) => (
    <div className="flex items-start gap-3 mb-4">
        <div className="bg-gray-100 dark:bg-[#18181b] rounded-lg p-2 mt-4 hidden sm:block border border-gray-500/10">
            <span className="text-gray-500 dark:text-gray-400 text-lg flex"><Icon /></span>
        </div>
        <div className="flex-grow">
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
                    <IconBox icon={Link} color="#6366f1" title="API Connection" description="Web-controller interface" />
                </CardHeader>
                <CardBody className="pt-2">
                    <InputWithIcon
                        icon={Network}
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
                    <IconBox icon={Gauge} color="#10b981" title="Latency Targets" description="Endpoints for connectivity checks" />
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
                        icon={Shield}
                        label="DNS (UDP/DOQ) Check"
                        value={latencyDNS}
                        onChange={setLatencyDNS}
                        placeholder="dns.example.com:853"
                    />
                    <InputWithIcon
                        icon={MapPin}
                        label="IP Info Service"
                        value={latencyIPUrl}
                        onChange={setLatencyIPUrl}
                        placeholder="http://ip.sb"
                    />
                    <InputWithIcon
                        icon={Radio}
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

            <div className="text-center mt-3 opacity-50 pb-20">
                <small className="text-gray-500 dark:text-gray-400 flex items-center justify-center">
                    <Info className="mr-1" />
                    These settings are stored locally in your browser cache.
                </small>
            </div>
        </MainContainer>
    );
}

export default Setting;