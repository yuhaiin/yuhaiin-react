"use client"

import { Card, CardBody, CardFooter, CardHeader, IconBadge, IconBox, IconBoxRounded, ListItem, MainContainer, SettingLabel } from '@/component/v2/card';
import { BadgeCheck, Calendar, Code, Cpu, ExternalLink, GitBranch, Github, Info, Laptop, Layers, LayoutGrid, Terminal } from 'lucide-react';
import React, { FC } from "react";
import { useProtoSWR } from "../../../common/proto";
import Loading, { Error } from "../../../component/v2/loading";
import { config_service } from "../../pbes/api/config_pb";

const InfoRow: FC<{
    label: string;
    value: string;
    icon?: React.ElementType;
    url?: string;
    isBadge?: boolean;
    isMonospace?: boolean;
}> = ({ label, value, icon, url, isBadge, isMonospace }) => (
    <div className="col-span-1">
        <ListItem className={url ? 'cursor-pointer' : 'cursor-default'}>
            <div className="flex w-full items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                    <IconBoxRounded
                        icon={icon || LayoutGrid}
                        color="#3b82f6"
                        className="flex-shrink-0 w-8 h-8 text-[0.9rem] border-none"
                    />
                    <span className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase opacity-75 min-w-[90px] text-[0.7rem] tracking-[0.5px]">
                        {label}
                    </span>
                </div>

                <div className="text-right overflow-hidden">
                    {url ? (
                        <a href={url} target="_blank" rel="noreferrer" className="no-underline font-mono text-blue-500 truncate block">
                            {value} <ExternalLink className="ml-1" size={12} />
                        </a>
                    ) : isBadge ?
                        <IconBadge icon={icon || LayoutGrid} text={value} color="primary" />
                        : (
                            <span className={`${isMonospace ? 'font-mono' : ''} truncate block text-[0.9rem]`} >
                                {value}
                            </span>
                        )
                    }
                </div>
            </div>
        </ListItem>
    </div>
);

export default function About() {
    const { data: info, isLoading, isValidating, error } = useProtoSWR(config_service.method.info);

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || isValidating || !info) return <Loading />

    return (
        <MainContainer>
            <Card >
                <CardHeader className="py-3">
                    <IconBox icon={Info} color="#6366f1" title='System Information' description='Software version and build environment' />
                </CardHeader>

                <CardBody>
                    <div className="grid grid-cols-1 gap-4">
                        {/* Primary Build Info */}
                        <InfoRow label="Version" value={info.version || "Unknown"} icon={BadgeCheck} isBadge />
                        <InfoRow
                            label="Commit"
                            value={info.commit?.substring(0, 7) || "N/A"}
                            icon={GitBranch}
                            url={`https://github.com/yuhaiin/yuhaiin/commit/${info.commit}`}
                            isMonospace
                        />
                        <InfoRow label="Build Time" value={info.buildTime || "N/A"} icon={Calendar} />

                        {/* Environment Info */}
                        <InfoRow label="Go Version" value={info.goVersion || "N/A"} icon={Code} isMonospace />
                        <InfoRow
                            label="GitHub"
                            value="yuhaiin/yuhaiin"
                            icon={Github}
                            url="https://github.com/yuhaiin/yuhaiin"
                        />

                        {/* Hardware Info */}
                        <InfoRow label="OS" value={info.os || "N/A"} icon={Cpu} />
                        <InfoRow label="Arch" value={info.arch || "N/A"} icon={Layers} isMonospace />
                        <InfoRow label="Compiler" value={info.compiler || "N/A"} icon={Terminal} />
                        <InfoRow label="Platform" value={info.platform || "N/A"} icon={Laptop} />
                    </div>
                </CardBody>

                {/* Build Tags / Features Section */}
                {info.build && info.build.length > 0 && (
                    <CardFooter className="p-4 bg-transparent border-t border-gray-500/10">
                        <SettingLabel className={"mb-2 block text-gray-500 dark:text-gray-400"}>Build Parameters</SettingLabel>
                        <div className="flex flex-wrap gap-2">
                            {info.build.map((tag, idx) => (
                                <div key={idx} className="px-2 py-1 rounded border font-mono text-sm break-all dark:border-gray-700">
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </CardFooter>
                )}
            </Card>

            <div className="text-center mt-4 opacity-50 pb-12">
                <small className="text-gray-500 dark:text-gray-400">
                    &copy; {new Date().getFullYear()} yuhaiin project. Distributed under MIT License.
                </small>
            </div>
        </MainContainer>
    );
}