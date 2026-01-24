import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, IconBox } from '@/component/v2/card';
import { Input } from '@/component/v2/input';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { FC, useContext, useState } from "react";
import { ArrowCounterclockwise, ArrowRight, PlusLg, Save, SignpostSplit, Trash } from 'react-bootstrap-icons';
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
        <Card className="h-100 d-flex flex-column">
            <CardHeader>
                <IconBox icon={SignpostSplit} color="#3b82f6" title="Static Hosts" description="Local Domain Mappings" />
            </CardHeader>
            <CardBody className="flex-grow-1">
                <div className="d-flex flex-column gap-3">
                    {Object.entries(data.hosts)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([k, v]) => (
                            <div className="d-flex align-items-center gap-2" key={"hosts" + k}>
                                <div className="flex-grow-1 d-flex gap-2 align-items-center bg-body-tertiary p-2 rounded border border-secondary border-opacity-10">
                                    <span className="font-monospace small text-truncate px-2" style={{ flex: 1, minWidth: 0 }}>{k}</span>
                                    <ArrowRight className="text-muted opacity-25 flex-shrink-0" />
                                    <Input
                                        size="sm"
                                        value={v}
                                        className="bg-transparent border-0 shadow-none font-monospace text-primary"
                                        style={{ flex: 1.2, minWidth: 0 }}
                                        onChange={(e) => handleMutate(prev => ({
                                            ...prev,
                                            hosts: { ...prev.hosts, [k]: e.target.value }
                                        }))}
                                    />
                                </div>
                                <Button
                                    variant="outline-danger"
                                    size="icon"
                                    className="flex-shrink-0 border-0"
                                    style={{ width: '32px', height: '32px' }}
                                    onClick={() => handleMutate(prev => {
                                        const tmp = { ...prev.hosts };
                                        delete tmp[k];
                                        return { ...prev, hosts: tmp };
                                    })}
                                >
                                    <Trash />
                                </Button>
                            </div>
                        ))}

                    <div className="d-flex align-items-center gap-2 mt-2 pt-3 border-top border-secondary border-opacity-10">
                        <div className="flex-grow-1 d-flex gap-2">
                            <Input
                                size="sm"
                                value={newHosts.key}
                                onChange={(e) => setNewHosts({ ...newHosts, key: e.target.value })}
                                placeholder="Domain..."
                                className="flex-grow-1"
                            />
                            <Input
                                size="sm"
                                value={newHosts.value}
                                onChange={(e) => setNewHosts({ ...newHosts, value: e.target.value })}
                                placeholder="IP Address..."
                                className="flex-grow-1"
                            />
                        </div>
                        <Button
                            variant="primary"
                            size="icon"
                            className="flex-shrink-0"
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => {
                                if (newHosts.key === "" || data.hosts[newHosts.key] !== undefined) return
                                handleMutate(prev => ({ ...prev, hosts: { ...prev.hosts, [newHosts.key]: newHosts.value } }));
                                setNewHosts({ key: "", value: "" });
                            }}
                        >
                            <PlusLg />
                        </Button>
                    </div>
                </div>
            </CardBody>

            <CardFooter className="d-flex justify-content-end gap-2">
                <Button
                    variant='outline-secondary'
                    size="sm"
                    disabled={!isDirty}
                    onClick={() => mutate()}
                >
                    <ArrowCounterclockwise className="me-2" />Reset
                </Button>
                <Button
                    variant="primary"
                    size="sm"
                    disabled={saving || !isDirty}
                    onClick={handleSave}
                >
                    {saving ? <Spinner size="sm" /> : <><Save className="me-2" />Save</>}
                </Button>
            </CardFooter>
        </Card>
    );
}