"use client"

import { Badge } from "@/component/v2/badge";
import { Card, CardBody, CardHeader, IconBox, ListItem, MainContainer } from '@/component/v2/card';
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import { FileText, Heart, Link, ShieldCheck } from "lucide-react";
import { FC, useState } from "react";
import { useProtoSWR } from "../../../common/proto";
import Loading, { Error } from "../../../component/v2/loading";
import { tools } from "../../pbes/api/tools_pb";
import { License } from "../../pbes/tools/tools_pb";

const LicenseItem: FC<{ item: License, index: number }> = ({ item, index }) => {
    return (
        <div className="col-12">
            <ListItem style={{ cursor: 'default' }}>
                <div className="flex items-center flex-grow overflow-hidden gap-3">
                    {/* Index or Icon */}
                    <div className="bg-primary bg-opacity-10 text-primary rounded-full flex items-center justify-center shrink-0"
                        style={{ width: '32px', height: '32px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold truncate">{item.name}</span>
                            <Badge variant="secondary" className="bg-opacity-10 text-secondary border border-secondary border-opacity-25 py-1 px-2" style={{ fontSize: '0.65rem' }}>
                                {item.license}
                            </Badge>
                        </div>

                        <div className="flex flex-col gap-1">
                            <a href={item.url} target="_blank" rel="noreferrer"
                                className="text-gray-500 small truncate text-decoration-none font-monospace opacity-75 hover-opacity-100">
                                <Link className="mr-1" size={14} />{item.url}
                            </a>
                            <a href={item.licenseUrl} target="_blank" rel="noreferrer"
                                className="text-gray-500 small truncate text-decoration-none font-monospace opacity-75">
                                <ShieldCheck className="mr-1" size={14} />License Source
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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-3">
                        <IconBox
                            icon={FileText}
                            color="#10b981"
                            title={`Open Source Licenses (${currentList.length})`}
                            description="Third-party credits and legal info"
                        />

                        {/* Top-mounted Tab Navigation styled as a modern toggle bar */}
                        <div className="bg-tertiary p-1 rounded-lg inline-flex shadow-sm border border-secondary border-opacity-10" style={{ minWidth: '220px' }}>
                            <ToggleGroup
                                type="single"
                                value={activeTab}
                                onValueChange={(v) => v && setActiveTab(v)}
                                className="w-full"
                            >
                                <ToggleItem value="yuhaiin" className="flex-grow py-1 px-3" style={{ fontSize: '0.85rem' }}>
                                    Core
                                </ToggleItem>
                                <ToggleItem value="android" className="flex-grow py-1 px-3" style={{ fontSize: '0.85rem' }}>
                                    Android
                                </ToggleItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="p-4" style={{ flex: 1, overflow: 'auto', borderBottomLeftRadius: 'inherit', borderBottomRightRadius: 'inherit' }}>
                    <div className="mt-2">
                        <LicensesList value={currentList} />
                    </div>
                </CardBody>
            </Card>

            <div className="text-center mt-3 opacity-50 pb-5">
                <small className="text-gray-500">
                    <Heart className="text-danger mr-1" fill="currentColor" />
                    Built with love and open-source software.
                </small>
            </div>
        </MainContainer>
    );
}