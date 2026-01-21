"use client";

import { FC, useContext, useState } from "react";
import { Button, Card, Form, Spinner } from "react-bootstrap";
import Loading from "../../common/loading";
import { FetchProtobuf, useProtoSWR } from "../../common/proto";
import { GlobalToastContext } from "../../common/toast";
import { NewItemList, SettingInputText } from "../../config/components";
import { resolver } from "../../pbes/api/config_pb";
import styles from './resolver.module.css';

export const Fakedns: FC = () => {
    const ctx = useContext(GlobalToastContext);
    const [saving, setSaving] = useState(false);
    const [isDirty, setDirty] = useState(false);

    const { data, error, isLoading, mutate } = useProtoSWR(resolver.method.fakedns, {
        onSuccess: () => setDirty(false)
    });

    if (error !== undefined) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || data === undefined) return <Loading />

    const handleSave = () => {
        setSaving(true)
        FetchProtobuf(resolver.method.save_fakedns, data)
            .then(async ({ error }) => {
                if (error === undefined) {
                    ctx.Info("save fakedns successful")
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

    return <Card className={`${styles.configCard} h-100 d-flex flex-column`}>
        <Card.Header className={styles.cardHeaderCustom}>
            <div className="d-flex align-items-center">
                <div className={styles.iconBox}><i className="bi bi-magic"></i></div>
                <div>
                    <h5 className="mb-0 fw-bold">FakeDNS</h5>
                    <small className="text-muted">Virtual IP Strategy</small>
                </div>
            </div>
            <Form.Check
                type="switch"
                label="Enabled"
                checked={data.enabled}
                onChange={() => handleMutate(prev => ({ ...prev, enabled: !prev.enabled }))}
            />
        </Card.Header>
        <Card.Body>
            <SettingInputText label='IPv4 Range' value={data.ipv4Range} onChange={(v: string) => handleMutate(prev => ({ ...prev, ipv4Range: v }))} />
            <SettingInputText label='IPv6 Range' value={data.ipv6Range} onChange={(v: string) => handleMutate(prev => ({ ...prev, ipv6Range: v }))} />
            <hr className="my-3 opacity-25" />
            <NewItemList
                title="Whitelist"
                textarea
                dump
                data={data.whitelist}
                onChange={(v) => handleMutate(prev => ({ ...prev, whitelist: v }))}
            />
            <hr className="my-3 opacity-25" />
            <NewItemList
                title="Skip Check List"
                className="mt-2"
                textarea
                dump
                data={data.skipCheckList ? data.skipCheckList : []}
                onChange={(v) => handleMutate(prev => ({ ...prev, skipCheckList: v }))}
            />
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
