"use client"

import { applyRouteChanges } from "@/api/route";
import { Button } from "@/component/v2/button";
import { Card, CardBody } from "@/component/v2/card";
import { Spinner } from "@/component/v2/spinner";
import { GlobalToastContext } from "@/component/v2/toast";
import type { RouteActivationStatus } from "@/contract/route";
import { Zap } from "lucide-react";
import { useContext, useEffect, useState } from "react";

export function RouteActivationProgress({ status, onApplied }: { status?: RouteActivationStatus; onApplied: () => void | Promise<unknown> }) {
    const ctx = useContext(GlobalToastContext);
    const [now, setNow] = useState(() => Date.now());
    const [applying, setApplying] = useState(false);
    const listPending = (status?.hostIndexRefreshAt ?? 0) > now;
    const rulePending = (status?.ruleApplyAt ?? 0) > now;
    const target = Math.max(status?.hostIndexRefreshAt ?? 0, status?.ruleApplyAt ?? 0);
    const remaining = Math.max(0, target - now);

    useEffect(() => {
        if (remaining <= 0) return;
        const timer = window.setInterval(() => setNow(Date.now()), 250);
        return () => window.clearInterval(timer);
    }, [remaining]);

    if (!listPending && !rulePending) return null;

    const progress = Math.min(100, Math.max(0, ((60_000 - remaining) / 60_000) * 100));
    const seconds = Math.ceil(remaining / 1000);
    const pending = listPending && rulePending
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
        } finally {
            setApplying(false);
        }
    };

    return (
        <Card className="mb-4 border-ui-primary/35 bg-ui-primary/5">
            <CardBody>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div>
                        <div className="font-semibold text-ui-heading">{pending}</div>
                        <div className="mt-0.5 text-xs text-ui-muted">New connections use the changes after activation completes.</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="shrink-0 text-ui-muted">{seconds}s remaining</span>
                        <Button size="sm" onClick={applyNow} disabled={applying}>
                            {applying ? <Spinner size="sm" className="mr-1" /> : <Zap size={15} className="mr-1" />}
                            Apply now
                        </Button>
                    </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ui-primary/15" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-label="Route activation progress">
                    <div className="h-full rounded-full bg-ui-primary transition-[width] duration-200" style={{ width: `${progress}%` }} />
                </div>
            </CardBody>
        </Card>
    );
}
