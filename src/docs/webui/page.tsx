"use client"

import { useTheme } from '@/common/ThemeProvider';
import type { ThemePreference } from '@/common/theme';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, IconBox, MainContainer, SettingLabel } from '@/component/v2/card';
import { SettingInputVertical, SwitchCard } from "@/component/v2/forms";
import { Input } from '@/component/v2/input';
import { Select } from '@/component/v2/select';
import { useLanguage } from '@/i18n/LanguageProvider';
import { languageOptions } from '@/i18n/languages';
import clsx from 'clsx';
import { Check, Gauge, Globe, Info, Languages, Link, MapPin, Network, Palette, Plus, Radio, Shield, Terminal, Trash } from 'lucide-react';
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { useLocalStorage } from "usehooks-ts";
import {
    APIUrlDefault,
    APIUrlKey,
    APIUrlListKey,
    LatencyDNSUrlDefault, LatencyDNSUrlKey,
    LatencyHTTPUrlDefault, LatencyHTTPUrlKey,
    LatencyIPUrlDefault, LatencyIPUrlKey,
    LatencyIPv6Default, LatencyIPv6Key,
    LatencyStunTCPUrlDefault, LatencyStunTCPUrlKey,
    LatencyStunUrlDefault, LatencyStunUrlKey,
    normalizeApiUrl,
    normalizeLatencyDNSUrl,
    uniqueApiUrls,
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
        <div className="bg-ui-surface-muted rounded-ui-md p-2 mt-4 hidden sm:block border border-ui-border">
            <span className="text-ui-muted text-lg flex"><Icon /></span>
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

function displayApiHost(url: string, sameOriginLabel: string) {
    return url ? url : sameOriginLabel;
}

function ApiHostsCard() {
    const { t } = useTranslation('webui');
    const [url, setUrl] = useLocalStorage(APIUrlKey, APIUrlDefault);
    const [hosts, setHosts] = useLocalStorage<string[]>(APIUrlListKey, []);
    const [draft, setDraft] = useState("");

    const active = normalizeApiUrl(url);
    const savedHosts = useMemo(
        () => uniqueApiUrls([active, ...(Array.isArray(hosts) ? hosts : [])]),
        [active, hosts],
    );

    useEffect(() => {
        const next = uniqueApiUrls([active, ...(Array.isArray(hosts) ? hosts : [])]);
        const same =
            next.length === (Array.isArray(hosts) ? hosts.length : 0) &&
            next.every((item, index) => item === (hosts?.[index] ?? undefined));
        if (!same) setHosts(next);
    }, [active, hosts, setHosts]);

    const refreshClients = async () => {
        await mutate(() => true, undefined, { revalidate: true });
    };

    const selectHost = async (next: string) => {
        const normalized = normalizeApiUrl(next);
        if (normalized === active) return;
        setUrl(normalized);
        setHosts(uniqueApiUrls([normalized, ...savedHosts]));
        await refreshClients();
    };

    const addHost = async () => {
        const normalized = normalizeApiUrl(draft);
        if (!normalized) return;
        const nextHosts = uniqueApiUrls([normalized, ...savedHosts]);
        setHosts(nextHosts);
        setDraft("");
        if (normalized !== active) {
            setUrl(normalized);
            await refreshClients();
        }
    };

    const removeHost = async (target: string) => {
        const normalized = normalizeApiUrl(target);
        if (!normalized) return;
        const nextHosts = savedHosts.filter((item) => item !== normalized);
        setHosts(nextHosts);
        if (normalized === active) {
            const fallback = nextHosts[0] ?? "";
            setUrl(fallback);
            await refreshClients();
        }
    };

    return (
        <Card>
            <CardHeader className="py-3">
                <IconBox icon={Link} tone="violet" title={t('api.title')} description={t('api.description')} />
            </CardHeader>
            <CardBody className="pt-2">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <SettingLabel className="mb-0">{t('api.controllerHost')}</SettingLabel>
                    <span className="text-xs text-ui-muted">
                        {savedHosts.filter(Boolean).length} {t('api.saved')}
                    </span>
                </div>

                <div className="flex flex-col gap-2">
                    {/* Always-available same-origin option */}
                    <button
                        type="button"
                        onClick={() => void selectHost("")}
                        className={clsx(
                            "flex w-full items-center gap-3 rounded-ui-lg border px-3 py-3 text-left transition-colors",
                            active === ""
                                ? "border-ui-primary/40 bg-ui-primary-soft/50"
                                : "border-ui-border bg-ui-surface hover:border-ui-primary/25 hover:bg-ui-surface-muted/50"
                        )}
                    >
                        <div className={clsx(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-ui-md border",
                            active === ""
                                ? "border-ui-primary/20 bg-ui-primary-soft text-ui-primary"
                                : "border-ui-border bg-ui-surface-muted text-ui-muted"
                        )}>
                            <Network size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-ui-heading">
                                {t('api.sameOrigin')}
                            </div>
                            <div className="mt-0.5 truncate font-mono text-[11px] text-ui-muted">
                                {typeof window !== "undefined" ? window.location.origin : "/"}
                            </div>
                        </div>
                        {active === "" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-ui-primary-soft px-2 py-0.5 text-[11px] font-semibold text-ui-primary">
                                <Check size={12} />
                                {t('api.active')}
                            </span>
                        )}
                    </button>

                    {savedHosts.filter(Boolean).map((host) => {
                        const isActive = host === active;
                        return (
                            <div
                                key={host}
                                className={clsx(
                                    "flex w-full items-center gap-2 rounded-ui-lg border px-2 py-2 transition-colors",
                                    isActive
                                        ? "border-ui-primary/40 bg-ui-primary-soft/50"
                                        : "border-ui-border bg-ui-surface hover:border-ui-primary/25 hover:bg-ui-surface-muted/50"
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={() => void selectHost(host)}
                                    className="flex min-w-0 flex-1 items-center gap-3 rounded-ui-md px-1 py-1 text-left"
                                >
                                    <div className={clsx(
                                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-ui-md border",
                                        isActive
                                            ? "border-ui-primary/20 bg-ui-primary-soft text-ui-primary"
                                            : "border-ui-border bg-ui-surface-muted text-ui-muted"
                                    )}>
                                        <Link size={16} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-mono text-sm font-semibold text-ui-heading" title={host}>
                                            {displayApiHost(host, t('api.sameOrigin'))}
                                        </div>
                                        <div className="mt-0.5 text-[11px] text-ui-muted">
                                            {isActive ? t('api.activeHint') : t('api.switchHint')}
                                        </div>
                                    </div>
                                    {isActive && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-ui-primary-soft px-2 py-0.5 text-[11px] font-semibold text-ui-primary">
                                            <Check size={12} />
                                            {t('api.active')}
                                        </span>
                                    )}
                                </button>
                                <Button
                                    size="icon"
                                    variant="outline-danger"
                                    className="h-9 w-9 shrink-0"
                                    onClick={() => void removeHost(host)}
                                    aria-label={t('api.remove')}
                                    title={t('api.remove')}
                                >
                                    <Trash size={15} />
                                </Button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-4 border-t border-ui-border/70 pt-4">
                    <SettingLabel className="mb-2">{t('api.addHost')}</SettingLabel>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    void addHost();
                                }
                            }}
                            placeholder="http://127.0.0.1:50051"
                            className="min-w-0 flex-1 font-mono"
                        />
                        <Button
                            size="sm"
                            className="shrink-0"
                            disabled={!normalizeApiUrl(draft)}
                            onClick={() => void addHost()}
                        >
                            <Plus size={16} className="mr-1" />
                            {t('api.add')}
                        </Button>
                    </div>
                    <p className="mt-2 text-xs text-ui-muted">{t('api.addHint')}</p>
                </div>
            </CardBody>
        </Card>
    );
}

function Setting() {
    const { t } = useTranslation('webui');
    const { preference, setPreference } = useLanguage();
    const { preference: themePreference, setPreference: setThemePreference } = useTheme();
    const [latencyHTTP, setLatencyHTTP] = useLocalStorage(LatencyHTTPUrlKey, LatencyHTTPUrlDefault);
    const [latencyDNS, setLatencyDNS] = useLocalStorage(LatencyDNSUrlKey, LatencyDNSUrlDefault);
    const [latencyIPv6, setLatencyIPv6] = useLocalStorage(LatencyIPv6Key, LatencyIPv6Default);
    const [latencyIPUrl, setLatencyIPUrl] = useLocalStorage(LatencyIPUrlKey, LatencyIPUrlDefault);
    const [latencyStunUrl, setLatencyStunUrl] = useLocalStorage(LatencyStunUrlKey, LatencyStunUrlDefault);
    const [latencyStunTCPUrl, setLatencyStunTCPUrl] = useLocalStorage(LatencyStunTCPUrlKey, LatencyStunTCPUrlDefault);

    return (
        <MainContainer>
            {/* 1. API Connection */}
            <ApiHostsCard />

            <Card>
                <CardHeader className="py-3">
                    <IconBox icon={Languages} tone="violet" title={t('language.title')} description={t('language.description')} />
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

            <Card>
                <CardHeader className="py-3">
                    <IconBox icon={Palette} tone="primary" title={t('theme.title')} description={t('theme.description')} />
                </CardHeader>
                <CardBody className="pt-2">
                    <div className="flex flex-col mb-4">
                        <SettingLabel className="mb-2 block">{t('theme.preference')}</SettingLabel>
                        <Select
                            value={themePreference}
                            onValueChange={(value) => setThemePreference(value as ThemePreference)}
                            items={[
                                { value: "system", label: t('theme.system') },
                                { value: "light", label: t('theme.light') },
                                { value: "dark", label: t('theme.dark') },
                            ]}
                        />
                    </div>
                </CardBody>
            </Card>

            {/* 2. Latency Targets */}
            <Card >
                <CardHeader className="py-3">
                    <IconBox icon={Gauge} tone="success" title={t('latency.title')} description={t('latency.description')} />
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
                        value={normalizeLatencyDNSUrl(latencyDNS)}
                        onChange={setLatencyDNS}
                        placeholder="dns.nextdns.io:853"
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
                <small className="text-ui-muted flex items-center justify-center">
                    <Info className="mr-1" />
                    {t('localNotice')}
                </small>
            </div>
        </MainContainer>
    );
}

export default Setting;
