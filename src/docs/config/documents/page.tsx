import { IFramePage } from "../../../component/v2/iframe";

import { MainContainer } from "@/component/v2/card";
import { PageHeader } from "@/component/v2/page-header";
import { ResourceWorkspace } from "@/component/v2/resource-workspace";
import { FileText } from "lucide-react";

const DocumentsPage = () => {
    return <MainContainer className="product-page page-skin-workspace page-skin-documents">
        <PageHeader eyebrow="Workspace" title="Documents" description="Browse the project documentation and learn how the network engine fits together." icon={FileText} />
        <ResourceWorkspace
            icon={FileText}
            eyebrow="Learn"
            title="Understand the pieces"
            description="The documentation opens beside the app so you can learn the network model without losing your place in the workspace."
            links={[{ label: "About yuhaiin", href: "#/docs/config/about" }, { label: "Diagnostics", href: "#/docs/config/pprof" }]}
        >
            <IFramePage src="https://yuhaiin.github.io/documents/" />
        </ResourceWorkspace>
    </MainContainer>
}

export default DocumentsPage;
