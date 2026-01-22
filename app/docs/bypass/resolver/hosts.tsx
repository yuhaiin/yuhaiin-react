"use client";

import { Card, CardBody, CardFooter, CardHeader, IconBox } from '@/app/component/cardlist';
import { FC, useContext, useState } from "react";
import { Button, Form, InputGroup, Spinner } from "react-bootstrap";
import Loading from "../../../component/loading";
import { GlobalToastContext } from "../../../component/toast";
import { FetchProtobuf, useProtoSWR } from "../../common/proto";
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

    return <Card className={`h-100`}>
        <CardHeader>
            <IconBox icon="signpost-split" color="primary" title="Static Hosts" description="Static Host Mapping" />
        </CardHeader>
        <CardBody>
            {
                Object.entries(data.hosts)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v], i) =>
                        <InputGroup className="mb-3" key={"hosts" + k}>
                            <Form.Control value={k} readOnly style={{ background: 'rgba(255,255,255,0.03)', opacity: 0.7 }} />
                            <InputGroup.Text style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-dim)' }}>
                                <i className="bi bi-chevron-right small"></i>
                            </InputGroup.Text>
                            <Form.Control
                                value={v}
                                onChange={(e) => handleMutate(prev => { return { ...prev, hosts: { ...prev.hosts, [k]: e.target.value } } })}
                            />
                            <Button variant='link' className="text-danger p-1 ms-2" onClick={() => {
                                handleMutate(prev => {
                                    const tmp = { ...prev.hosts };
                                    delete tmp[k];
                                    return { ...prev, hosts: tmp };
                                })
                            }}>
                                <i className="bi bi-x-circle"></i>
                            </Button>
                        </InputGroup>
                    )
            }

            <InputGroup className="mt-3">
                <Form.Control value={newHosts.key} onChange={(e) => setNewHosts({ ...newHosts, key: e.target.value })} placeholder="Domain..." />
                <InputGroup.Text style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-dim)' }}>
                    <i className="bi bi-chevron-right small"></i>
                </InputGroup.Text>
                <Form.Control
                    value={newHosts.value}
                    onChange={(e) => setNewHosts({ ...newHosts, value: e.target.value })}
                    placeholder="IP Address..."
                />
                <Button variant='outline-primary' onClick={() => {
                    if (newHosts.key === "" || data.hosts[newHosts.key] !== undefined) return
                    handleMutate(prev => ({ ...prev, hosts: { ...prev.hosts, [newHosts.key]: newHosts.value } }));
                    setNewHosts({ key: "", value: "" });
                }}>
                    <i className="bi bi-plus-lg"></i>
                </Button>
            </InputGroup>
        </CardBody>

        <CardFooter className="d-flex justify-content-end gap-2">
            <Button
                variant='outline-secondary'
                size="sm"
                disabled={!isDirty}
                onClick={() => mutate()}
            >
                <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
            </Button>
            <Button
                variant="primary"
                size="sm"
                disabled={saving || !isDirty}
                onClick={handleSave}
            >
                {saving ? <Spinner as="span" size="sm" animation="border" /> : <><i className="bi bi-cloud-upload me-1"></i> Save</>}
            </Button>
        </CardFooter>
    </Card>
}