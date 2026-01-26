"use client"

import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, IconBox, MainContainer, SettingsBox } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { create, toJsonString } from "@bufbuild/protobuf";
import { StringValueSchema } from "@bufbuild/protobuf/wkt";
import { Clipboard, ClipboardCheck, ClipboardList, Info, Play, Terminal } from 'lucide-react';
import { useCallback, useContext, useEffect, useState } from "react";
import { FetchProtobuf } from "../../../common/proto";
import { useClipboard } from "../../../component/v2/clipboard";
import { rules, test_response, test_responseSchema } from "../../pbes/api/config_pb";

function Test() {
    const ctx = useContext(GlobalToastContext);
    const [value, setValue] = useState("");
    const [resp, setResp] = useState<test_response | undefined>(undefined);
    const [testing, setTesting] = useState(false);

    // Clipboard hook for copying results
    const { copy, copied } = useClipboard({ usePromptAsFallback: true });

    useEffect(() => {
        if (copied) ctx.Info("Result copied to clipboard!");
    }, [copied, ctx]);

    const handleTest = useCallback(() => {
        if (!value.trim()) return;

        setTesting(true);
        setResp(undefined);

        FetchProtobuf(
            rules.method.test,
            create(StringValueSchema, { value })
        )
            .then(async ({ data, error }) => {
                if (error) ctx.Error(`Test failed: ${error.code} | ${error.msg}`);
                else setResp(data);
            })
            .finally(() => setTesting(false));
    }, [value, ctx]);

    return (
        <MainContainer>
            {/* 1. Input Card */}
            <Card className="mb-4">
                <CardHeader>
                    <IconBox icon={Terminal} color="#f59e0b" title='Rule Testing' description='Simulate traffic to verify routing' />
                </CardHeader>
                <CardBody className="p-4">
                    <p className="small text-gray-500 mb-4 px-1">
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
                            style={{ minWidth: '100px' }}
                        >
                            {testing ? <Spinner size="sm" /> : <><Play className="mr-1" size={16} /> Run</>}
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* 2. Loading State */}
            {
                testing && (
                    <div className="text-center py-5">
                        <Spinner size="md" className="mb-3" />
                        <div className="text-gray-500 small font-medium">Analyzing routing table...</div>
                    </div>
                )
            }

            {/* 3. Result Card */}
            {
                resp && !testing &&
                <Card className="animate__animated animate__fadeIn">
                    <CardHeader>
                        <IconBox icon={ClipboardList} color="#10b981" title='Analysis Result' description='Raw decision path metadata' />

                        <Button
                            size="sm"
                            onClick={() => copy(toJsonString(test_responseSchema, resp, { prettySpaces: 2 }))}
                        >
                            {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                        </Button>
                    </CardHeader>
                    <CardBody>
                        <SettingsBox>
                            <pre
                                className="mb-0 font-monospace"
                                style={{
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-all',
                                    fontSize: '0.85rem',
                                    maxHeight: '500px',
                                    overflowY: 'auto'
                                }}
                            >
                                {toJsonString(test_responseSchema, resp, { prettySpaces: 2 })}
                            </pre>
                        </SettingsBox>
                    </CardBody>
                </Card>
            }

            <div className="text-center mt-4 opacity-50 pb-5">
                <small className="text-gray-500 italic">
                    <Info className="mr-1" />
                    This tool tests the core logic using the current active configuration.
                </small>
            </div>
        </MainContainer >
    );
}

export default Test;