"use client"

import { Card, CardBody, CardFooter, CardHeader, IconBadge, IconBox, IconBoxRounded, ListItem, MainContainer, SettingLabel } from '@/component/v2/card';
import React, { FC } from "react";
import { App, BoxArrowUpRight, Calendar3, CodeSlash, Cpu, Git, Github, InfoCircle, Laptop, Layers, PatchCheck, Terminal } from 'react-bootstrap-icons';
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
    <div className="col-12">
        <ListItem style={{ cursor: url ? 'pointer' : 'default' }}>
            <div className="d-flex w-100 align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-3 overflow-hidden">
                    <IconBoxRounded
                        icon={icon || App}
                        color="#3b82f6"
                        className="flex-shrink-0"
                        style={{ width: '32px', height: '32px', fontSize: '0.9rem', border: "none" }}
                    />
                    <span className="text-muted small fw-bold text-uppercase opacity-75" style={{ minWidth: '90px', fontSize: '0.7rem', letterSpacing: '0.5px' }}>{label}</span>
                </div>

                <div className="text-end overflow-hidden">
                    {url ? (
                        <a href={url} target="_blank" rel="noreferrer" className="text-decoration-none font-monospace text-primary text-truncate d-block">
                            {value} <BoxArrowUpRight className="ms-1" style={{ fontSize: '0.7rem' }} />
                        </a>
                    ) : isBadge ?
                        <IconBadge icon={icon || App} text={value} color="primary" />
                        : (
                            <span className={`${isMonospace ? 'font-monospace' : ''} text-truncate d-block`} style={{ fontSize: '0.9rem' }}>
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
                <CardHeader>
                    <IconBox icon={InfoCircle} color="#6366f1" title='System Information' description='Software version and build environment' />
                </CardHeader>

                <CardBody>
                    <div className="row g-3">
                        {/* Primary Build Info */}
                        <InfoRow label="Version" value={info.version || "Unknown"} icon={PatchCheck} isBadge />
                        <InfoRow
                            label="Commit"
                            value={info.commit?.substring(0, 7) || "N/A"}
                            icon={Git}
                            url={`https://github.com/yuhaiin/yuhaiin/commit/${info.commit}`}
                            isMonospace
                        />
                        <InfoRow label="Build Time" value={info.buildTime || "N/A"} icon={Calendar3} />

                        {/* Environment Info */}
                        <InfoRow label="Go Version" value={info.goVersion || "N/A"} icon={CodeSlash} isMonospace />
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
                    <CardFooter className="p-4 bg-transparent border-top border-secondary border-opacity-10">
                        <SettingLabel className={"mb-2 d-block text-muted"}>Build Parameters</SettingLabel>
                        <div className="d-flex flex-wrap gap-2">
                            {info.build.map((tag, idx) => (
                                <div key={idx} className="px-2 py-1 rounded border font-monospace small text-break">
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </CardFooter>
                )}
            </Card>

            <div className="text-center mt-4 opacity-50 pb-5">
                <small className="text-muted">
                    &copy; {new Date().getFullYear()} yuhaiin project. Distributed under MIT License.
                </small>
            </div>
        </MainContainer>
    );
}