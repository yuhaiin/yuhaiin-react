import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, IconBox } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import { InputGroup, InputGroupText } from '@/component/v2/inputgroup';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { Plus, RotateCw, Save, Signpost, Trash } from 'lucide-react';
import { FC, useContext, useState } from "react";
import { FetchProtobuf, useProtoSWR } from "../../../common/proto";
import Loading from "../../../component/v2/loading";
import { resolver } from "../../pbes/api/config_pb";

export const Hosts: FC = () => {
    const ctx = useContext(GlobalToastContext);
    const [newHosts, setNewHosts] = useState({ key: "", value: "" })
    const [saving, setSaving] = useState(false);
    const [isDirty, setDirty] = useState(false);

    const { data, error, isLoading, mutate } = useProtoSWR(resolver.method.hosts, {
        onSuccess: () => setDirty(false)
    })

    if (error !== undefined) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const handleSave = () => {
        setSaving(true)
        FetchProtobuf(resolver.method.save_hosts, data)
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("save hosts successful")
                } else {
                    ctx.Error(error.msg)
                    console.error(error.code, error.msg)
                }
                mutate()
                setSaving(false)
            })
    }

    const handleMutate = (mutator: (prev: typeof data) => typeof data) => {
        mutate(mutator, false);
        setDirty(true);
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <IconBox icon={Signpost} color="#3b82f6" title="Static Hosts" description="Local Domain Mappings" />
            </CardHeader>
            <CardBody className="flex-grow">
                <div className="flex flex-col gap-4">
                    {Object.entries(data.hosts)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([k, v]) => (
                            <InputGroup key={"hosts" + k}>
                                <InputGroupText className="font-mono text-xs px-2 flex-1 min-w-0 justify-start">
                                    <span className="truncate">{k}</span>
                                </InputGroupText>
                                <Input
                                    value={v}
                                    className="font-mono text-blue-600 dark:text-blue-400 flex-[1.2] min-w-0"
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

                    <div className="pt-4 mt-2 border-t border-gray-500/10">
                        <InputGroup>
                            <Input
                                value={newHosts.key}
                                onChange={(e) => setNewHosts({ ...newHosts, key: e.target.value })}
                                placeholder="Domain..."
                                className="flex-grow"
                            />
                            <Input
                                value={newHosts.value}
                                onChange={(e) => setNewHosts({ ...newHosts, value: e.target.value })}
                                placeholder="IP Address..."
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