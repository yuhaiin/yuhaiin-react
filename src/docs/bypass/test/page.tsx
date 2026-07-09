"use client"

import { testRule } from '@/api/route';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, IconBox, MainContainer, SettingsBox } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import type { RuleTestResponse } from '@/contract/route';
import { Clipboard, ClipboardCheck, ClipboardList, Info, Play, Terminal } from 'lucide-react';
import { useCallback, useContext, useEffect, useState } from "react";
import { useClipboard } from "../../../component/v2/clipboard";

function formatTestResponse(value: RuleTestResponse): string {
    return JSON.stringify(value, (_key, v) => {
        if (typeof v === "bigint") return v.toString();
        if (v instanceof Date) return v.toISOString();
        return v;
    }, 2);
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
                    <IconBox icon={Terminal} color="#f59e0b" title='Rule Testing' description='Simulate traffic to verify routing' />
                </CardHeader>
                <CardBody className="p-6">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 px-1">
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
                        <div className="text-gray-500 dark:text-gray-400 text-xs font-medium">Analyzing routing table...</div>
                    </div>
                )
            }

            {/* 3. Result Card */}
            {
                resp && !testing &&
                <Card className="animate-dataUpdate">
                    <CardHeader>
                        <IconBox icon={ClipboardList} color="#10b981" title='Analysis Result' description='Raw decision path metadata' />

                        <Button
                            size="sm"
                            onClick={() => copy(formatTestResponse(resp))}
                        >
                            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                        </Button>
                    </CardHeader>
                    <CardBody>
                        <SettingsBox>
                            <pre
                                className="mb-0 font-mono"
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                    fontSize: '0.85rem',
                                    maxHeight: '500px',
                                    overflowY: 'auto'
                                }}
                            >
                                {formatTestResponse(resp)}
                            </pre>
                        </SettingsBox>
                    </CardBody>
                </Card>
            }

            <div className="flex justify-center mt-6 opacity-50 pb-12">
                <small className="text-gray-500 dark:text-gray-400 italic flex items-center">
                    <Info className="mr-1" size={14} />
                    This tool tests the core logic using the current active configuration.
                </small>
            </div>
        </MainContainer >
    );
}

export default Test;
