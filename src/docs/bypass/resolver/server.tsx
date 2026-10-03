import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { useTranslation } from 'react-i18next';
import { getResolverServer, saveResolverServer } from '@/api/resolvers';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, IconBox } from '@/component/v2/card';
import { SettingInputVertical } from '@/component/v2/forms';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import type { ResolverServer } from "@/contract/resolver";
import { RotateCw, Save, Server as ServerIcon } from 'lucide-react';
import { FC, useContext } from "react";
import useSWR from "swr";
import Loading from "../../../component/v2/loading";

export const Server: FC = () => {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const { data: server, error, isLoading, mutate } = useSWR("/api/v2/resolver/server", getResolverServer, { revalidateOnFocus: false });
    const { value: data, setValue, dirty: isDirty, commit } = useEditorDraft("server", server, () => undefined);
    const { pending: saving, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    useCloseGuard(isDirty, saving, () => undefined);

    if (error !== undefined) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const handleSave = () => {
        if (!data || saving) return;
        void run(async () => {
            const next = await saveResolverServer(data);
            commit(next);
            await mutate(next, { revalidate: false });
            ctx.Info(uiT("save"));
        });
    };
    const handleMutate = (mutator: (prev: ResolverServer) => ResolverServer) => {
        setValue(prev => prev ? mutator(prev) : prev);
    };

    return (
        <Card className="flex flex-col">
            <fieldset disabled={saving} className="contents">
            <CardHeader>
                <IconBox icon={ServerIcon} tone="violet" title={uiT("dnsServer")} description={uiT("listenAndServe")} />
            </CardHeader>
            <CardBody className="p-6">
                <SettingInputVertical
                    label={uiT("listenAddress")}
                    placeholder={uiT("eG")}
                    value={data.server}
                    onChange={(v: string) => handleMutate(prev => ({ ...prev, server: v }))}
                />
            </CardBody>

            <CardFooter className="flex justify-end gap-2">
                <Button
                    size="sm"
                    disabled={saving || !isDirty}
                    onClick={() => server && commit(server)}
                >
                    <RotateCw className="mr-2" size={16} />{uiT("reset")}</Button>
                <Button
                    size="sm"
                    disabled={saving || !isDirty}
                    onClick={handleSave}
                >
                    {saving ? <Spinner size="sm" /> : <><Save className="mr-2" size={16} />{uiT("save")}</>}
                </Button>
            </CardFooter>
            </fieldset>
        </Card>
    );
}
