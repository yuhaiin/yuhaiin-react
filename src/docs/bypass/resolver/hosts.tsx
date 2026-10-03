import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { useTranslation } from 'react-i18next';
import { getResolverHosts, saveResolverHosts } from '@/api/resolvers';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, IconBox } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import { InputGroup, InputGroupText } from '@/component/v2/inputgroup';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { normalizeHosts, ResolverHosts } from '@/contract/resolver';
import { Plus, RotateCw, Save, Signpost, Trash } from 'lucide-react';
import { FC, useContext, useState } from "react";
import useSWR from "swr";
import Loading from "../../../component/v2/loading";

const hostsInputGroupClass = "max-[639px]:flex-col max-[639px]:gap-2 max-[639px]:[&>input]:!w-full max-[639px]:[&>div]:!w-full max-[639px]:[&>button]:!w-full max-[639px]:[&>*]:!rounded-ui-md";

export const Hosts: FC = () => {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const [newHosts, setNewHosts] = useState({ key: "", value: "" })

    const { data: server, error, isLoading, mutate } = useSWR("/api/v2/resolver/hosts", getResolverHosts, { revalidateOnFocus: false });
    const { value: data, setValue, dirty: isDirty, commit } = useEditorDraft("hosts", server, () => undefined);
    const { pending: saving, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    useCloseGuard(isDirty, saving, () => undefined);

    if (error !== undefined) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const handleSave = () => {
        if (!data || saving) return;
        void run(async () => {
            const next = await saveResolverHosts(data);
            commit(next);
            await mutate(next, { revalidate: false });
            ctx.Info(uiT("save"));
        });
    };
    const handleMutate = (mutator: (prev: ResolverHosts) => ResolverHosts) => {
        setValue(prev => prev ? mutator(normalizeHosts(prev)) : prev);
    };

    return (
        <Card className="h-full flex flex-col">
            <fieldset disabled={saving} className="contents">
            <CardHeader>
                <IconBox icon={Signpost} tone="primary" title={uiT("staticHosts")} description={uiT("localDomainMappings")} />
            </CardHeader>
            <CardBody className="flex-grow">
                <div className="flex flex-col gap-4">
                    {Object.entries(data.hosts)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([k, v]) => (
                            <InputGroup key={"hosts" + k} className={hostsInputGroupClass}>
                                <InputGroupText className="font-mono text-xs px-2 flex-1 min-w-0 justify-start">
                                    <span className="truncate">{k}</span>
                                </InputGroupText>
                                <Input
                                    value={v}
                                    className="font-mono text-ui-primary flex-[1.2] min-w-0"
                                    onChange={(e) => handleMutate(prev => ({
                                        ...prev,
                                        hosts: { ...prev.hosts, [k]: e.target.value }
                                    }))}
                                />
                                <Button
                                    variant="outline-danger"
                                    onClick={() => handleMutate(prev => {
                                        const tmp = { ...prev.hosts };
                                        delete tmp[k];
                                        return { ...prev, hosts: tmp };
                                    })}
                                >
                                    <Trash size={16} />
                                </Button>
                            </InputGroup>
                        ))}

                    <div className="mt-2 border-t border-ui-border/70 pt-4">
                        <InputGroup className={hostsInputGroupClass}>
                            <Input
                                value={newHosts.key}
                                onChange={(e) => setNewHosts({ ...newHosts, key: e.target.value })}
                                placeholder={uiT("domain")}
                                className="flex-grow"
                            />
                            <Input
                                value={newHosts.value}
                                onChange={(e) => setNewHosts({ ...newHosts, value: e.target.value })}
                                placeholder={uiT("ipAddress")}
                                className="flex-grow"
                            />
                            <Button
                                onClick={() => {
                                    if (newHosts.key === "" || data.hosts[newHosts.key] !== undefined) return
                                    handleMutate(prev => ({ ...prev, hosts: { ...prev.hosts, [newHosts.key]: newHosts.value } }));
                                    setNewHosts({ key: "", value: "" });
                                }}
                            >
                                <Plus size={16} />
                            </Button>
                        </InputGroup>
                    </div>
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
