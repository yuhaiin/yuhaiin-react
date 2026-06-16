"use client"

import { Card, CardBody, CardHeader, IconBox, MainContainer, SettingLabel } from '@/component/v2/card';
import { SettingInputVertical, SwitchCard } from "@/component/v2/forms";
import { Select } from '@/component/v2/select';
import { useLanguage } from '@/i18n/LanguageProvider';
import { languageOptions } from '@/i18n/languages';
import { Gauge, Globe, Info, Languages, Link, MapPin, Network, Radio, Shield, Terminal } from 'lucide-react';
import React from "react";
import { useTranslation } from 'react-i18next';
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
        <div className="bg-gray-500/10 rounded-lg p-2 mt-4 hidden sm:block border border-gray-500/10">
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
    const { t } = useTranslation('webui');
    const { preference, setPreference } = useLanguage();
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
                <CardHeader className="py-3">
                    <IconBox icon={Link} color="#6366f1" title={t('api.title')} description={t('api.description')} />
                </CardHeader>
                <CardBody className="pt-2">
                    <InputWithIcon
                        icon={Network}
                        label={t('api.controllerHost')}
                        value={url}
                        onChange={setUrl}
                        placeholder="http://127.0.0.1:50051"
                    />
                </CardBody>
            </Card>

            <Card>
                <CardHeader className="py-3">
                    <IconBox icon={Languages} color="#8b5cf6" title={t('language.title')} description={t('language.description')} />
                </CardHeader>
                <CardBody className="pt-2">
                    <div className="flex flex-col mb-4">
                        <SettingLabel className="mb-2 block">{t('language.preference')}</SettingLabel>
                        <Select
                            value={preference}
                            onValueChange={(value) => setPreference(value as typeof preference)}
                            items={languageOptions.map((option) => ({
                                value: option.value,
                                label: option.value === 'auto' ? t('common:language.auto') : option.label,
                            }))}
                        />
                    </div>
                </CardBody>
            </Card>

            {/* 2. Latency Targets */}
            <Card >
                <CardHeader className="py-3">
                    <IconBox icon={Gauge} color="#10b981" title={t('latency.title')} description={t('latency.description')} />
                </CardHeader>
                <CardBody>
                    {/* Toggle at the top */}
                    <div className="mb-3">
                        <SwitchCard
                            label={t('latency.ipv6')}
                            description={t('latency.ipv6Description')}
                            checked={latencyIPv6}
                            onCheckedChange={() => setLatencyIPv6(!latencyIPv6)}
                        />
                    </div>

                    {/* Vertical List of Targets */}
                    <InputWithIcon
                        icon={Globe}
                        label={t('latency.http')}
                        value={latencyHTTP}
                        onChange={setLatencyHTTP}
                        placeholder="https://..."
                    />
                    <InputWithIcon
                        icon={Shield}
                        label={t('latency.dns')}
                        value={latencyDNS}
                        onChange={setLatencyDNS}
                        placeholder="dns.example.com:853"
                    />
                    <InputWithIcon
                        icon={MapPin}
                        label={t('latency.ip')}
                        value={latencyIPUrl}
                        onChange={setLatencyIPUrl}
                        placeholder="http://ip.sb"
                    />
                    <InputWithIcon
                        icon={Radio}
                        label={t('latency.stunUdp')}
                        value={latencyStunUrl}
                        onChange={setLatencyStunUrl}
                        placeholder="stun.example.com:3478"
                    />
                    <InputWithIcon
                        icon={Terminal}
                        label={t('latency.stunTcp')}
                        value={latencyStunTCPUrl}
                        onChange={setLatencyStunTCPUrl}
                        placeholder="stun.example.com:3478"
                    />
                </CardBody>
            </Card>

            <div className="text-center mt-3 opacity-50 pb-20">
                <small className="text-gray-500 dark:text-gray-400 flex items-center justify-center">
                    <Info className="mr-1" />
                    {t('localNotice')}
                </small>
            </div>
        </MainContainer>
    );
}

export default Setting;
