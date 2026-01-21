"use client";

import { FC, useContext, useState } from "react";
import { Button, Card, Spinner } from "react-bootstrap";
import Loading from "../../common/loading";
import { FetchProtobuf, useProtoSWR } from "../../common/proto";
import { GlobalToastContext } from "../../common/toast";
import { SettingInputText } from "../../config/components";
import { resolver } from "../../pbes/api/config_pb";
import styles from './resolver.module.css';


export const Server: FC = () => {
    const ctx = useContext(GlobalToastContext);
    const [saving, setSaving] = useState(false);
    const [isDirty, setDirty] = useState(false);
    const { data, error, isLoading, mutate } = useProtoSWR(resolver.method.server, {
        onSuccess: () => setDirty(false)
    });

    if (error !== undefined) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const handleSave = () => {
        setSaving(true)
        FetchProtobuf(resolver.method.save_server, data)
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("save server successful")
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

    return <Card className={`${styles.configCard} d-flex flex-column`}>
        <Card.Header className={styles.cardHeaderCustom}>
            <div className="d-flex align-items-center">
                <div className={styles.iconBox}><i className="bi bi-hdd-rack"></i></div>
                <div>
                    <h5 className="mb-0 fw-bold">DNS Server</h5>
                    <small className="text-muted">Listen and Serve</small>
                </div>
            </div>
        </Card.Header>
        <Card.Body className="card-body px-4 py-3 flex-grow-1">
            <SettingInputText label="Listen Address" value={data.value} onChange={(v: string) => handleMutate(prev => ({ ...prev, value: v }))} />
        </Card.Body>

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
                variant="primary"
                size="sm"
                disabled={saving || !isDirty}
                onClick={handleSave}
            >
                {saving ? <Spinner as="span" size="sm" animation="border" /> : <> <i className="bi bi-cloud-upload me-1" /> Save</>}
            </Button>
        </Card.Footer>
    </Card>
}