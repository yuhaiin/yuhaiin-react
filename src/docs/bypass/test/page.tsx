"use client"

import { testRule } from '@/api/route';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, IconBox, MainContainer, SettingsBox } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import type { RuleTestResponse } from '@/contract/route';
import { CheckCircle2, Clipboard, ClipboardCheck, ClipboardList, GitBranch, Info, ListChecks, Play, Tags, Terminal, XCircle } from 'lucide-react';
import { type ElementType, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useClipboard } from "../../../component/v2/clipboard";

function formatTestResponse(value: RuleTestResponse): string {
    return JSON.stringify(value, (_key, v) => {
        if (typeof v === "bigint") return v.toString();
        if (v instanceof Date) return v.toISOString();
        return v;
    }, 2);
}

function displayValue(value: string | undefined): string {
    return value?.trim() || "-";
}

function ResultSection({ title, icon: Icon, children }: { title: string; icon: ElementType; children: ReactNode }) {
    return (
        <div className="rounded-ui-lg border border-ui-border bg-ui-surface-muted/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ui-heading">
                <Icon size={16} className="text-ui-primary" />
                {title}
            </div>
            {children}
        </div>
    );
}

function EmptyResult({ children }: { children: ReactNode }) {
    return (
        <div className="rounded-ui-md border border-dashed border-ui-border px-3 py-4 text-center text-sm font-medium text-ui-muted">
            {children}
        </div>
    );
}

function ChipList({ items, empty }: { items: string[]; empty: string }) {
    if (items.length === 0) return <EmptyResult>{empty}</EmptyResult>;

    return (
        <div className="flex flex-wrap gap-2">
            {items.map((item) => (
                <Badge key={item} variant="secondary" className="max-w-full font-mono">
                    <span className="truncate">{item}</span>
                </Badge>
            ))}
        </div>
    );
}

function ResultView({ value }: { value: RuleTestResponse }) {
    const hasHistory = value.matchResult.length > 0;

    return (
        <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-ui-lg border border-ui-border bg-ui-list px-4 py-3">
                    <div className="mb-1 text-xs font-bold uppercase tracking-[0.5px] text-ui-muted">Mode</div>
                    <Badge variant="info" className="text-sm">{displayValue(value.mode)}</Badge>
                </div>
                <div className="rounded-ui-lg border border-ui-border bg-ui-list px-4 py-3">
                    <div className="mb-1 text-xs font-bold uppercase tracking-[0.5px] text-ui-muted">Tag</div>
                    <div className="truncate font-semibold text-ui-heading">{displayValue(value.tag)}</div>
                </div>
                <div className="rounded-ui-lg border border-ui-border bg-ui-list px-4 py-3">
                    <div className="mb-1 text-xs font-bold uppercase tracking-[0.5px] text-ui-muted">Resolver</div>
                    <div className="truncate font-semibold text-ui-heading">{displayValue(value.resolver)}</div>
                </div>
                <div className="rounded-ui-lg border border-ui-border bg-ui-list px-4 py-3">
                    <div className="mb-1 text-xs font-bold uppercase tracking-[0.5px] text-ui-muted">After Address</div>
                    <div className="truncate font-mono font-semibold text-ui-heading">{displayValue(value.afterAddr)}</div>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <ResultSection title="Matched Lists" icon={ListChecks}>
                    <ChipList items={value.lists ?? []} empty="No matched lists." />
                </ResultSection>

                <ResultSection title="Resolved IPs" icon={Tags}>
                    <ChipList items={value.ips ?? []} empty="No resolved IPs." />
                </ResultSection>
            </div>

            <ResultSection title="Match History" icon={GitBranch}>
                {!hasHistory ? (
                    <EmptyResult>No match history.</EmptyResult>
                ) : (
                    <div className="grid gap-3">
                        {value.matchResult.map((result, index) => (
                            <div key={`${result.ruleName}-${index}`} className="rounded-ui-md border border-ui-border bg-ui-surface px-3 py-3">
                                <div className="mb-2 flex min-w-0 items-center gap-2">
                                    <Badge variant="secondary">#{index + 1}</Badge>
                                    <span className="truncate font-bold text-ui-heading">{displayValue(result.ruleName)}</span>
                                </div>
                                {result.history.length === 0 ? (
                                    <div className="text-sm font-medium text-ui-muted">No list checks.</div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {result.history.map((history) => (
                                            <Badge key={`${result.ruleName}-${history.listName}`} variant={history.matched ? "success" : "secondary"} className="max-w-full gap-1 font-mono">
                                                {history.matched ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                                                <span className="truncate">{history.listName}</span>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </ResultSection>
        </div>
    );
}

function Test() {
    const ctx = useContext(GlobalToastContext);
    const [value, setValue] = useState("");
    const [resp, setResp] = useState<RuleTestResponse | undefined>(undefined);
    const [testing, setTesting] = useState(false);

    // Clipboard hook for copying results
    const { copy, copied, manualCopyModal } = useClipboard({ usePromptAsFallback: true });

    useEffect(() => {
        if (copied) ctx.Info("Result copied to clipboard!");
    }, [copied, ctx]);

    const handleTest = useCallback(() => {
        if (!value.trim()) return;

        setTesting(true);
        setResp(undefined);

        testRule(value)
            .then(setResp)
            .catch((error) => ctx.Error(`Test failed: ${error.code ?? 500} | ${error.msg ?? error}`))
            .finally(() => setTesting(false));
    }, [value, ctx]);

    return (
        <MainContainer>
            {manualCopyModal}

            {/* 1. Input Card */}
            <Card className="mb-4">
                <CardHeader>
                    <IconBox icon={Terminal} tone="warning" title='Rule Testing' description='Simulate traffic to verify routing' />
                </CardHeader>
                <CardBody className="p-6">
                    <p className="text-xs text-ui-muted mb-6 px-1">
                        Enter a domain or IP address below to see which rule and outbound node would be selected.
                    </p>
                    <div className="flex gap-2">
                        <Input
                            placeholder="e.g. www.google.com or 8.8.8.8"
                            value={value}
                            className="flex-grow"
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleTest(); }}
                        />
                        <Button
                            onClick={handleTest}
                            disabled={testing || !value.trim()}
                            className="min-w-[100px]"
                        >
                            {testing ? <Spinner size="sm" /> : <><Play className="mr-1" size={16} /> Run</>}
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* 2. Loading State */}
            {
                testing && (
                    <div className="text-center py-12">
                        <Spinner size="md" className="mb-3" />
                        <div className="text-ui-muted text-xs font-medium">Analyzing routing table...</div>
                    </div>
                )
            }

            {/* 3. Result Card */}
            {
                resp && !testing &&
                <Card className="animate-dataUpdate">
                    <CardHeader>
                        <IconBox icon={ClipboardList} tone="success" title='Analysis Result' description='Raw decision path metadata' />

                        <Button
                            size="sm"
                            onClick={() => copy(formatTestResponse(resp))}
                        >
                            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                        </Button>
                    </CardHeader>
                    <CardBody>
                        <SettingsBox>
                            <ResultView value={resp} />
                        </SettingsBox>
                    </CardBody>
                </Card>
            }

            <div className="flex justify-center mt-6 opacity-50 pb-12">
                <small className="text-ui-muted italic flex items-center">
                    <Info className="mr-1" size={14} />
                    This tool tests the core logic using the current active configuration.
                </small>
            </div>
        </MainContainer >
    );
}

export default Test;
