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
        <div className="col-span-1">
            <ListItem className="cursor-default">
                <div className="flex items-center flex-grow overflow-hidden gap-3">
                    {/* Index or Icon */}
                    <div className="bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center flex-shrink-0 w-8 h-8 text-[0.85rem] font-bold">
                        {index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col overflow-hidden min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold truncate">{item.name}</span>
                            <Badge variant="secondary" className="text-[0.65rem] px-2 py-1">
                                {item.license}
                            </Badge>
                        </div>

                        <div className="flex flex-col gap-1">
                            <a href={item.url} target="_blank" rel="noreferrer"
                                className="text-gray-500 dark:text-gray-400 text-sm truncate no-underline font-mono opacity-75 hover:opacity-100">
                                <Link className="mr-1" size={14} />{item.url}
                            </a>
                            <a href={item.licenseUrl} target="_blank" rel="noreferrer"
                                className="text-gray-500 dark:text-gray-400 text-sm truncate no-underline font-mono opacity-75">
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
        <div className="grid grid-cols-1 gap-2">
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
        <MainContainer className="h-full flex flex-col">
            <Card className="flex-1 mb-0 flex flex-col">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-3">
                        <IconBox
                            icon={FileText}
                            color="#10b981"
                            title={`Open Source Licenses (${currentList.length})`}
                            description="Third-party credits and legal info"
                        />

                        {/* Top-mounted Tab Navigation styled as a modern toggle bar */}
                        <div className="bg-gray-100 dark:bg-[#18181b] p-1 rounded-lg inline-flex shadow-sm border border-gray-500/10 min-w-[220px]">
                            <ToggleGroup
                                type="single"
                                value={activeTab}
                                onValueChange={(v) => v && setActiveTab(v)}
                                className="w-full"
                            >
                                <ToggleItem value="yuhaiin" className="flex-grow py-1 px-3 text-[0.85rem]">
                                    Core
                                </ToggleItem>
                                <ToggleItem value="android" className="flex-grow py-1 px-3 text-[0.85rem]">
                                    Android
                                </ToggleItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </CardHeader>

                <CardBody className="p-4 flex-1 overflow-auto rounded-b-[inherit]">
                    <div className="mt-2">
                        <LicensesList value={currentList} />
                    </div>
                </CardBody>
            </Card>

            <div className="text-center mt-3 opacity-50 pb-20">
                <small className="text-gray-500 dark:text-gray-400">
                    <Heart className="text-red-500 mr-1 inline" fill="currentColor" />
                    Built with love and open-source software.
                </small>
            </div>
        </MainContainer>
    );
}