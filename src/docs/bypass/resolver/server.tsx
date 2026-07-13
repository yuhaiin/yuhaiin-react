import { getResolverServer, saveResolverServer } from '@/api/resolvers';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, IconBox } from '@/component/v2/card';
import { SettingInputVertical } from '@/component/v2/forms';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { RotateCw, Save, Server as ServerIcon } from 'lucide-react';
import { FC, useContext, useState } from "react";
import useSWR from "swr";
import Loading from "../../../component/v2/loading";

export const Server: FC = () => {
    const ctx = useContext(GlobalToastContext);
    const [saving, setSaving] = useState(false);
    const [isDirty, setDirty] = useState(false);
    const { data, error, isLoading, mutate } = useSWR("/api/v2/resolver/server", getResolverServer, {
        onSuccess: () => setDirty(false)
    });

    if (error !== undefined) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const handleSave = () => {
        setSaving(true)
        saveResolverServer(data)
            .then(() => {
                ctx.Info("save server successful")
                mutate()
            })
            .catch((error) => ctx.Error(error.msg ?? String(error)))
            .finally(() => setSaving(false))
    }

    const handleMutate = (mutator: (prev: typeof data) => typeof data) => {
        mutate(mutator, false);
        setDirty(true);
    }

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <IconBox icon={ServerIcon} tone="violet" title='DNS Server' description='Listen and Serve' />
            </CardHeader>
            <CardBody className="p-6">
                <SettingInputVertical
                    label="Listen Address"
                    placeholder="e.g. 127.0.0.1:53"
                    value={data.server}
                    onChange={(v: string) => handleMutate(prev => ({ ...prev, server: v }))}
                />
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
