"use client"

import { Badge } from "@/app/component/v2/badge";
import { Card, CardBody, CardHeader, IconBox, ListItem, MainContainer } from '@/app/component/v2/card';
import { ToggleGroup, ToggleItem } from "@/app/component/v2/togglegroup";
import { FC, useState } from "react";
import { FileEarmarkMedical, HeartFill, Link45deg, ShieldCheck } from "react-bootstrap-icons";
import Loading, { Error } from "../../../component/loading";
import { useProtoSWR } from "../../common/proto";
import { tools } from "../../pbes/api/tools_pb";
import { License } from "../../pbes/tools/tools_pb";

const LicenseItem: FC<{ item: License, index: number }> = ({ item, index }) => {
    return (
        <div className="col-12">
            <ListItem style={{ cursor: 'default' }}>
                <div className="d-flex align-items-center flex-grow-1 overflow-hidden gap-3">
                    {/* Index or Icon */}
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '32px', height: '32px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {index + 1}
                    </div>

                    {/* Content */}
                    <div className="d-flex flex-column overflow-hidden" style={{ minWidth: 0 }}>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="fw-bold text-truncate">{item.name}</span>
                            <Badge variant="secondary" className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 py-1 px-2" style={{ fontSize: '0.65rem' }}>
                                {item.license}
                            </Badge>
                        </div>

                        <div className="d-flex flex-column gap-1">
                            <a href={item.url} target="_blank" rel="noreferrer"
                                className="text-muted small text-truncate text-decoration-none font-monospace opacity-75 hover-opacity-100">
                                <Link45deg className="me-1" />{item.url}
                            </a>
                            <a href={item.licenseUrl} target="_blank" rel="noreferrer"
                                className="text-muted small text-truncate text-decoration-none font-monospace opacity-75">
                                <ShieldCheck className="me-1" />License Source
                            </a>
                        </div>
                    </div>
                </div>
            </ListItem>
        </div>
    );
};

const LicensesList: FC<{ value: License[] }> = ({ value }) => {
    return (
        <div className="row g-2">
            {value.map((v, i) => (
                <LicenseItem key={i} item={v} index={i} />
            ))}
        </div>
    );
};

export default function Licenses() {
    const { data, isLoading, isValidating, error } = useProtoSWR(tools.method.licenses, { revalidateOnFocus: false });
    const [activeTab, setActiveTab] = useState("yuhaiin");

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || isValidating || !data) return <Loading />

    const currentList = activeTab === "yuhaiin" ? data.yuhaiin : data.android;

    return (
        <MainContainer style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Card style={{ flex: 1, marginBottom: '0px', display: 'flex', flexDirection: 'column' }}>
                <CardHeader>
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center w-100 gap-3">
                        <IconBox
                            icon={FileEarmarkMedical}
                            color="#10b981"
                            title={`Open Source Licenses (${currentList.length})`}
                            description="Third-party credits and legal info"
                        />

                        {/* Top-mounted Tab Navigation styled as a modern toggle bar */}
                        <div className="bg-body-tertiary p-1 rounded-3 d-inline-flex shadow-sm border border-secondary border-opacity-10" style={{ minWidth: '220px' }}>
                            <ToggleGroup
                                type="single"
                                value={activeTab}
                                onValueChange={(v) => v && setActiveTab(v)}
                                className="w-100"
                            >
                                <ToggleItem value="yuhaiin" className="flex-grow-1 py-1 px-3" style={{ fontSize: '0.85rem' }}>
                                    Core
                                </ToggleItem>
                                <ToggleItem value="android" className="flex-grow-1 py-1 px-3" style={{ fontSize: '0.85rem' }}>
                                    Android
                                </ToggleItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="p-4" style={{ flex: 1, overflow: 'auto', borderBottomLeftRadius: 'inherit', borderBottomRightRadius: 'inherit' }}>
                    {/* List Content */}
                    <div className="mt-2">
                        <LicensesList value={currentList} />
                    </div>
                </CardBody>
            </Card>

            <div className="text-center mt-3 opacity-50 pb-5">
                <small className="text-muted">
                    <HeartFill className="text-danger me-1" />
                    Built with love and open-source software.
                </small>
            </div>
        </MainContainer>
    );
}