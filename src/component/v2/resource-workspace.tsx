import type { ElementType, ReactNode } from "react";
import { HintPopover } from "./hint-popover";

export type ResourceWorkspaceLink = {
    label: string;
    href: string;
};

export function ResourceWorkspace({
    className = "ui-resource-workspace",
    railClassName = "ui-resource-rail",
    mainClassName = "ui-resource-main",
    icon: Icon,
    eyebrow,
    title,
    description,
    links = [],
    children,
}: {
    className?: string;
    railClassName?: string;
    mainClassName?: string;
    icon?: ElementType;
    eyebrow?: string;
    title: string;
    description: string;
    links?: ResourceWorkspaceLink[];
    children: ReactNode;
}) {
    return (
        <section className={className}>
            <div className="ui-workspace-hint-bar">
                <HintPopover icon={Icon} title={title} description={description} links={links} />
            </div>
            <div className={mainClassName}>{children}</div>
        </section>
    );
}
