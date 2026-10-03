import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { useTranslation } from 'react-i18next';
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
import { FC, useContext } from "react";
import useSWR from "swr";
import Loading from "../../../component/v2/loading";

export const Fakedns: FC = () => {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);

    const { data: server, error, isLoading, mutate } = useSWR("/api/v2/resolver/fakedns", getFakeDNS, { revalidateOnFocus: false });
    const { value: data, setValue, dirty: isDirty, commit } = useEditorDraft("fakedns", server, () => undefined);
    const { pending: saving, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    useCloseGuard(isDirty, saving, () => undefined);

    if (error !== undefined) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const handleSave = () => {
        if (!data || saving) return;
        void run(async () => {
            const next = await saveFakeDNS(data);
            commit(next);
            await mutate(next, { revalidate: false });
            ctx.Info(uiT("save"));
        });
    };
    const handleMutate = (mutator: (prev: FakeDNS) => FakeDNS) => {
        setValue(prev => prev ? mutator(normalizeFakeDNS(prev)) : prev);
    };

    return (
        <Card className="h-full flex flex-col">
            <fieldset disabled={saving} className="contents">
            <CardHeader className="flex justify-between items-center">
                <IconBox icon={Wand2} tone="success" title={uiT("fakedns")} description={uiT("virtualIpStrategy")} />
                <div className="flex items-center gap-2">
                    <span className="text-xs text-ui-muted font-medium">{data.enabled ? "ACTIVE" : "DISABLED"}</span>
                    <Switch
                        checked={data.enabled}
                        onCheckedChange={(checked) => handleMutate(prev => ({ ...prev, enabled: checked }))}
                    />
                </div>
            </CardHeader>
            <CardBody className="flex-grow">
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <SettingInputVertical
                                label={uiT("ipv4Range")}
                                value={data.ipv4Range}
                                onChange={(v: string) => handleMutate(prev => ({ ...prev, ipv4Range: v }))}
                            />
                        </div>
                        <div>
                            <SettingInputVertical
                                label={uiT("ipv6Range")}
                                value={data.ipv6Range}
                                onChange={(v: string) => handleMutate(prev => ({ ...prev, ipv6Range: v }))}
                            />
                        </div>
                    </div>

                    <hr className="my-0 border-ui-border/70" />

                    <InputList
                        title={uiT("domainWhitelist")}
                        data={data.whitelist}
                        onChange={(v) => handleMutate(prev => ({ ...prev, whitelist: v }))}
                    />

                    <hr className="my-0 border-ui-border/70" />

                    <InputList
                        title={uiT("skipCheckList")}
                        data={data.skipCheckList ? data.skipCheckList : []}
                        onChange={(v) => handleMutate(prev => ({ ...prev, skipCheckList: v }))}
                    />
                </div>
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
