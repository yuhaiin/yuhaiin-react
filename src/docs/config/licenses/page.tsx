"use client"

import { getLicenses } from "@/api/tools";
import { Badge } from "@/component/v2/badge";
import { Card, CardBody, CardHeader, IconBox, ListItem, MainContainer } from '@/component/v2/card';
import { ToggleGroup, ToggleItem } from "@/component/v2/togglegroup";
import { PageHeader } from "@/component/v2/page-header";
import { ResourceWorkspace } from "@/component/v2/resource-workspace";
import type { License } from "@/contract/tools";
import { FileText, Heart, Link, ShieldCheck } from "lucide-react";
import { FC, useState } from "react";
import useSWR from "swr";
import Loading, { Error } from "../../../component/v2/loading";
import "./licenses.css";

const LicenseItem: FC<{ item: License, index: number }> = ({ item, index }) => {
    return (
        <div className="col-span-1">
            <ListItem className="cursor-default">
                <div className="flex items-center flex-grow overflow-hidden gap-3">
                    {/* Index or Icon */}
                    <div className="bg-ui-primary-soft text-ui-primary rounded-full flex items-center justify-center flex-shrink-0 w-8 h-8 text-[0.85rem] font-bold">
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
                                className="flex items-center text-ui-muted text-sm no-underline font-mono opacity-75 hover:opacity-100 min-w-0">
                                <Link className="mr-1 shrink-0" size={14} />
                                <span className="truncate">{item.url}</span>
                            </a>
                            <a href={item.licenseUrl} target="_blank" rel="noreferrer"
                                className="flex items-center text-ui-muted text-sm no-underline font-mono opacity-75 min-w-0">
                                <ShieldCheck className="mr-1 shrink-0" size={14} />
                                <span className="truncate">License Source</span>
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
    const { data, isLoading, isValidating, error } = useSWR("/api/v2/tools/licenses", getLicenses, { revalidateOnFocus: false });
    const [activeTab, setActiveTab] = useState("yuhaiin");

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || isValidating || !data) return <Loading />

    const currentList = activeTab === "yuhaiin" ? data.yuhaiin : data.android;

    return (
        <MainContainer className="product-page page-skin-workspace page-skin-licenses h-full flex flex-col">
            <PageHeader eyebrow="Workspace" title="Licenses" description="A transparent list of the open-source projects that make yuhaiin possible." icon={FileText} />
            <ResourceWorkspace
                icon={FileText}
                eyebrow="Transparency"
                title="Built in the open"
                description="Every dependency is listed by platform so you can understand what ships inside the app."
                links={[{ label: "About yuhaiin", href: "#/docs/config/about" }, { label: "Documents", href: "#/docs/config/documents" }]}
            >
            <Card className="flex-1 mb-0 flex flex-col">
                <CardHeader className="py-3">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-3">
                        <IconBox
                            icon={FileText}
                            tone="success"
                            title={`Open Source Licenses (${currentList.length})`}
                            description="Third-party credits and legal info"
                        />

                        {/* Top-mounted Tab Navigation styled as a modern toggle bar */}
                        <div className="ui-license-tab-shell">
                            <ToggleGroup
                                type="single"
                                value={activeTab}
                                onValueChange={(v) => v && setActiveTab(v)}
                                className="ui-license-tabs w-full"
                                noSlide
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
                    <div>
                        <LicensesList value={currentList} />
                    </div>
                </CardBody>
            </Card>
            </ResourceWorkspace>

            <div className="text-center mt-1 opacity-50">
                <small className="text-ui-muted">
                    <Heart className="text-red-500 mr-1 inline" fill="currentColor" />
                    Built with love and open-source software.
                </small>
            </div>
        </MainContainer>
    );
}
