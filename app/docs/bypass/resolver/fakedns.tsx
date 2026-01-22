"use client";

import { Card, CardBody, CardFooter, CardHeader, IconBox } from '@/app/component/cardlist';
import { FC, useContext, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { NewItemList } from "../../../component/components";
import Loading from "../../../component/loading";
import { SettingInputVertical } from '../../../component/switch';
import { GlobalToastContext } from "../../../component/toast";
import { FetchProtobuf, useProtoSWR } from "../../common/proto";
import { resolver } from "../../pbes/api/config_pb";

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

    return <Card className={`h-100 d-flex flex-column`}>
        <CardHeader >
            <IconBox icon="magic" color="primary" title='FakeDNS' description='Virtual IP Strategy' />
            <Form.Check
                type="switch"
                label="Enabled"
                checked={data.enabled}
                onChange={() => handleMutate(prev => ({ ...prev, enabled: !prev.enabled }))}
            />
        </CardHeader>
        <CardBody>
            <SettingInputVertical label='IPv4 Range' value={data.ipv4Range} onChange={(v: string) => handleMutate(prev => ({ ...prev, ipv4Range: v }))} />
            <SettingInputVertical label='IPv6 Range' value={data.ipv6Range} onChange={(v: string) => handleMutate(prev => ({ ...prev, ipv6Range: v }))} />
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
