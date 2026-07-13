import { getFakeDNS, saveFakeDNS } from '@/api/resolvers';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, IconBox } from '@/component/v2/card';
import { SettingInputVertical } from '@/component/v2/forms';
import { InputList } from '@/component/v2/listeditor';
import { Spinner } from '@/component/v2/spinner';
import Switch from '@/component/v2/switch';
import { GlobalToastContext } from '@/component/v2/toast';
import { FakeDNS, normalizeFakeDNS } from '@/contract/resolver';
import { RotateCw, Save, Wand2 } from 'lucide-react';
import { FC, useContext, useState } from "react";
import useSWR from "swr";
import Loading from "../../../component/v2/loading";

export const Fakedns: FC = () => {
    const ctx = useContext(GlobalToastContext);
    const [saving, setSaving] = useState(false);
    const [isDirty, setDirty] = useState(false);

    const { data, error, isLoading, mutate } = useSWR("/api/v2/resolver/fakedns", getFakeDNS, {
        onSuccess: () => setDirty(false)
    });

    if (error !== undefined) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const handleSave = () => {
        setSaving(true)
        saveFakeDNS(data)
            .then(() => {
                ctx.Info("save fakedns successful")
                mutate()
            })
            .catch((error) => ctx.Error(error.msg ?? String(error)))
            .finally(() => setSaving(false))
    }

    const handleMutate = (mutator: (prev: FakeDNS) => FakeDNS) => {
        mutate(prev => mutator(normalizeFakeDNS(prev)), false);
        setDirty(true);
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex justify-between items-center">
                <IconBox icon={Wand2} tone="success" title='FakeDNS' description='Virtual IP Strategy' />
                <div className="flex items-center gap-2">
                    <span className="text-xs text-ui-muted font-medium">{data.enabled ? "ACTIVE" : "DISABLED"}</span>
                    <Switch
                        checked={data.enabled}
                        onCheckedChange={() => handleMutate(prev => ({ ...prev, enabled: !prev.enabled }))}
                    />
                </div>
            </CardHeader>
            <CardBody className="flex-grow">
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <SettingInputVertical
                                label='IPv4 Range'
                                value={data.ipv4Range}
                                onChange={(v: string) => handleMutate(prev => ({ ...prev, ipv4Range: v }))}
                            />
                        </div>
                        <div>
                            <SettingInputVertical
                                label='IPv6 Range'
                                value={data.ipv6Range}
                                onChange={(v: string) => handleMutate(prev => ({ ...prev, ipv6Range: v }))}
                            />
                        </div>
                    </div>

                    <hr className="my-0 border-gray-500/10 opacity-10" />

                    <InputList
                        title="Domain Whitelist"
                        data={data.whitelist}
                        onChange={(v) => handleMutate(prev => ({ ...prev, whitelist: v }))}
                    />

                    <hr className="my-0 border-gray-500/10 opacity-10" />

                    <InputList
                        title="Skip Check List"
                        data={data.skipCheckList ? data.skipCheckList : []}
                        onChange={(v) => handleMutate(prev => ({ ...prev, skipCheckList: v }))}
                    />
                </div>
            </CardBody>

            <CardFooter className="flex justify-end gap-2">
                <Button
                    size="sm"
                    disabled={!isDirty}
                    onClick={() => mutate()}
                >
                    <RotateCw className="mr-2" size={16} />Reset
                </Button>
                <Button
                    size="sm"
                    disabled={saving || !isDirty}
                    onClick={handleSave}
                >
                    {saving ? <Spinner size="sm" /> : <><Save className="mr-2" size={16} />Save</>}
                </Button>
            </CardFooter>
        </Card>
    );
}
