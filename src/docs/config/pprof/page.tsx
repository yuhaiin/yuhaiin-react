"use client";

import { useLocalStorage } from "usehooks-ts";
import { APIUrlDefault, APIUrlKey } from "../../../common/apiurl";
import { IFramePage } from "../../../component/v2/iframe";

import { MainContainer } from "@/component/v2/card";
import { PageHeader } from "@/component/v2/page-header";
import { ResourceWorkspace } from "@/component/v2/resource-workspace";
import { Activity } from "lucide-react";

const PprofPage = () => {
    const [apiUrl] = useLocalStorage<string>(APIUrlKey, APIUrlDefault);

    return (
        <MainContainer className="product-page page-skin-workspace page-skin-diagnostics">
            <PageHeader eyebrow="Workspace" title="Diagnostics" description="Inspect runtime profiles from the connected controller." icon={Activity} />
            <ResourceWorkspace
                className="ui-diagnostic-workspace"
                railClassName="ui-diagnostic-rail"
                mainClassName="ui-diagnostic-main"
                icon={Activity}
                eyebrow="Runtime"
                title="Inspect the controller"
                description="Profiles are loaded from the configured API target. Use them when diagnosing CPU, memory, or goroutine pressure."
                links={[{ label: "Logs", href: "#/docs/config/log" }, { label: "Web UI & API", href: "#/docs/config/webui" }]}
            >
                <IFramePage src={apiUrl + "/debug/pprof"} appearance="light" />
            </ResourceWorkspace>
        </MainContainer>
    )
}

export default PprofPage;
