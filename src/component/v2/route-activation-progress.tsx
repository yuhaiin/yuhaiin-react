import { useTranslation } from 'react-i18next';

import { applyRouteChanges } from "@/api/route";
import { Button } from "@/component/v2/button";
import { Card, CardBody } from "@/component/v2/card";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import type { RouteActivationStatus } from "@/contract/route";
import { Zap } from "lucide-react";
import { useContext, useEffect, useState } from "react";

export function RouteActivationProgress({ status, onApplied }: { status?: RouteActivationStatus; onApplied: () => void | Promise<unknown> }) {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');

    const ctx = useContext(GlobalToastContext);
    const [now, setNow] = useState(() => Date.now());
    const [applying, setApplying] = useState(false);
    const listPending = (status?.hostIndexRefreshAt ?? 0) > 0;
    const rulePending = (status?.ruleApplyAt ?? 0) > 0 || (status?.savedRevision ?? 0) > (status?.appliedRevision ?? 0);
    const hasWarnings = Boolean(status?.listIssues?.length || status?.skippedRules?.length || status?.degradedRules?.length);
    const target = Math.max(status?.hostIndexRefreshAt ?? 0, status?.ruleApplyAt ?? 0);
    const remaining = Math.max(0, target - now);
    const isPending = remaining > 0;

    useEffect(() => {
        if (!isPending) return;
        const timer = window.setInterval(() => setNow(Date.now()), 250);
        return () => window.clearInterval(timer);
    }, [isPending]);

    if (!listPending && !rulePending && !status?.error && !hasWarnings) return null;

    const progress = Math.min(100, Math.max(0, ((60_000 - remaining) / 60_000) * 100));
    const seconds = Math.ceil(remaining / 1000);
    const pending = status?.error ? t("activationFailed") : status?.applying ? t("activationRunning") : hasWarnings && !listPending && !rulePending ? t("activationDegraded") : remaining === 0 ? t("activationWaiting") : listPending && rulePending
        ? "Applying list index and route rules"
        : listPending ? "Applying list index" : "Applying route rules";
    const applyNow = async () => {
        if (applying) return;
        setApplying(true);
        try {
            await applyRouteChanges();
            await onApplied();
            ctx.Info("route changes applied");
        } catch (err) {
            const error = err as { msg?: string };
            ctx.Error(error.msg ?? String(err));
            await onApplied();
        } finally {
            setApplying(false);
        }
    };

    return (
        <Card className={`mb-4 ${hasWarnings ? "border-ui-warning/35 bg-ui-warning-soft" : "border-ui-primary/35 bg-ui-primary/5"}`}>
            <CardBody>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div>
                        <div className="font-semibold text-ui-heading">{pending}</div>
                        {status?.savedRevision !== undefined && <details className="mt-1 text-xs text-ui-muted"><summary className="cursor-pointer">{t("activationDetails")}</summary><p>{t("activationVersions", { saved: status.savedRevision, applied: status.appliedRevision })}</p></details>}
                        <div className="mt-0.5 text-xs text-ui-muted">{uiT("newConnectionsUseTheChangesAfterActivationCompletes")}</div>
                    </div>
                    <div className="flex items-center gap-3">
                        {remaining > 0 && <span className="shrink-0 text-ui-muted">{uiT("secondsRemaining", { count: seconds })}</span>}
                        <Button size="sm" onClick={applyNow} disabled={applying || status?.applying}>
                            {applying ? <Spinner size="sm" className="mr-1" /> : <Zap size={15} className="mr-1" />}
                            {uiT("applyNow")}</Button>
                    </div>
                </div>
                {status?.error && <div className="mb-3 space-y-1 text-sm text-ui-danger"><p role="alert">{status.error}</p>{status.appliedRevision > 0 && <p className="text-ui-muted">{t("previousConfigurationRunning")}</p>}</div>}
                {hasWarnings && <div className="mb-3 space-y-2 text-sm text-ui-heading" role="alert">
                    <p className="font-medium">{t("activationDegradedHelp")}</p>
                    {(status?.listIssues ?? []).map(issue => <p key={issue.id} className="break-all">
                        {issue.name || issue.id}: {issue.error}
                        {issue.unavailable && <span className="ml-1 text-ui-danger">({t("activationListUnavailable")})</span>}
                    </p>)}
                    {(status?.skippedRules ?? []).map(rule => <p key={rule.id} className="break-all text-ui-danger">
                        {t("activationSkippedRule")}: {rule.name || rule.id} ({rule.listIds.join(", ")})
                    </p>)}
                    {(status?.degradedRules ?? []).map(rule => <p key={rule.id} className="break-all text-ui-heading">
                        {t("activationPartialRule")}: {rule.name || rule.id} ({rule.listIds.join(", ")})
                    </p>)}
                </div>}
                {(listPending || rulePending) && <div className="h-2 overflow-hidden rounded-full bg-ui-primary/15" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label={uiT("routeActivationProgress")}>
                    <div className="h-full rounded-full bg-ui-primary transition-[width] duration-200" style={{ width: `${progress}%` }} />
                </div>}
            </CardBody>
        </Card>
    );
}
