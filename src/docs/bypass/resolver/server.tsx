import { Button } from '@/component/v2/button';
import { Card, CardBody, CardFooter, CardHeader, IconBox } from '@/component/v2/card';
import { SettingInputVertical } from '@/component/v2/forms';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { FC, useContext, useState } from "react";
import { ArrowCounterclockwise, HddRack, Save } from 'react-bootstrap-icons';
import { FetchProtobuf, useProtoSWR } from "../../../common/proto";
import Loading from "../../../component/v2/loading";
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

    return (
        <Card className="d-flex flex-column">
            <CardHeader>
                <IconBox icon={HddRack} color="#8b5cf6" title='DNS Server' description='Listen and Serve' />
            </CardHeader>
            <CardBody className="px-4 py-4">
                <SettingInputVertical
                    label="Listen Address"
                    placeholder="e.g. 127.0.0.1:53"
                    value={data.value}
                    onChange={(v: string) => handleMutate(prev => ({ ...prev, value: v }))}
                />
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