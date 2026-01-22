"use client";

import { Card, CardBody, CardFooter, CardHeader, IconBox } from '@/app/component/cardlist';
import { FC, useContext, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { SettingInputText } from "../../../component/components";
import Loading from "../../../component/loading";
import { GlobalToastContext } from "../../../component/toast";
import { FetchProtobuf, useProtoSWR } from "../../common/proto";
import { resolver } from "../../pbes/api/config_pb";


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

    return <Card className={`d-flex flex-column`}>
        <CardHeader>
            <IconBox icon="hdd-rack" color="primary" title='DNS Server' description='Listen and Serve' />
        </CardHeader>
        <CardBody className="card-body px-4 py-3 flex-grow-1">
            <SettingInputText label="Listen Address" value={data.value} onChange={(v: string) => handleMutate(prev => ({ ...prev, value: v }))} />
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
                {saving ? <Spinner as="span" size="sm" animation="border" /> : <> <i className="bi bi-cloud-upload me-1" /> Save</>}
            </Button>
        </CardFooter>
    </Card>
}