"use client";

import { FC, useContext, useState } from "react";
import { Button, Card, Form, InputGroup, Spinner } from "react-bootstrap";
import Loading from "../../common/loading";
import { FetchProtobuf, useProtoSWR } from "../../common/proto";
import { GlobalToastContext } from "../../common/toast";
import { resolver } from "../../pbes/api/config_pb";
import styles from './resolver.module.css';

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

    return <Card className={`${styles.configCard} h-100`}>
        <Card.Header className={styles.cardHeaderCustom}>
            <div className="d-flex align-items-center">
                <div className={styles.iconBox}><i className="bi bi-signpost-split"></i></div>
                <div>
                    <h5 className="mb-0 fw-bold">Static Hosts</h5>
                    <small className="text-muted">Static Host Mapping</small>
                </div>
            </div>
        </Card.Header>
        <Card.Body>
            {
                Object.entries(data.hosts)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([k, v], i) =>
                        <InputGroup className="mb-3" key={"hosts" + k}>
                            <Form.Control value={k} readOnly style={{ background: 'rgba(255,255,255,0.03)', opacity: 0.7 }} />
                            <InputGroup.Text className={styles.inputGroupText}><i className="bi bi-chevron-right small"></i></InputGroup.Text>
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
                <InputGroup.Text className={styles.inputGroupText}><i className="bi bi-chevron-right small"></i></InputGroup.Text>
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
        </Card.Body>

        {/* Changed: Removed isDirty check, used styles.cardFooterCustom */}
        <Card.Footer className={styles.cardFooterCustom}>
            <Button
                variant='outline-secondary'
                size="sm"
                disabled={!isDirty}
                onClick={() => mutate()}
            >
                <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
            </Button>
            <Button
                variant="primary" // Changed to solid primary for better visibility
                size="sm"
                disabled={saving || !isDirty} // Optional: keep disabled if no changes
                onClick={handleSave}
            >
                {saving ? <Spinner as="span" size="sm" animation="border" /> : <><i className="bi bi-cloud-upload me-1"></i> Save</>}
            </Button>
        </Card.Footer>
    </Card>
}