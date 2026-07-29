import clsx from "clsx";
import type { ElementType, ReactNode } from "react";

export type PageStat = {
    label: string;
    value: ReactNode;
    hint?: string;
    icon?: ElementType;
    tone?: "primary" | "success" | "violet" | "warning" | "danger";
};

export function PageStatStrip({ stats, className }: { stats: PageStat[]; className?: string }) {
    return (
        <section className={clsx("ui-page-stat-strip", className)} aria-label="Page summary">
            {stats.map(({ label, value, hint, icon: Icon, tone = "primary" }) => (
                <div className={clsx("ui-page-stat", `ui-page-stat-${tone}`)} key={label}>
                    {Icon && <div className="ui-page-stat-icon"><Icon size={16} strokeWidth={2} /></div>}
                    <div className="ui-page-stat-copy">
                        <div className="ui-page-stat-label">{label}</div>
                        <div className="ui-page-stat-value">{value}</div>
                        {hint && <div className="ui-page-stat-hint">{hint}</div>}
                    </div>
                </div>
            ))}
        </section>
    );
}

export function FlowRail({ steps, className }: { steps: { label: string; value: ReactNode; icon: ElementType }[]; className?: string }) {
    return (
        <div className={clsx("ui-flow-rail", className)} aria-label="Network flow">
            {steps.map(({ label, value, icon: Icon }, index) => (
                <div className="ui-flow-step" key={label}>
                    <div className="ui-flow-step-mark"><Icon size={18} strokeWidth={1.9} /></div>
                    <div className="ui-flow-step-copy">
                        <span>{label}</span>
                        <strong>{value}</strong>
                    </div>
                    {index < steps.length - 1 && <span className="ui-flow-connector" aria-hidden="true" />}
                </div>
            ))}
        </div>
    );
}
