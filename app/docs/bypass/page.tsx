"use client"

import { clone } from "@bufbuild/protobuf";
import { useContext, useState } from "react";
import { Button, Spinner, Stack } from "react-bootstrap";
import useSWR from "swr";
import Loading from "../common/loading";
import { FetchProtobuf, ProtoESFetcher } from "../common/proto";
import { GlobalToastContext } from "../common/toast";
import { configSchema } from "../pbes/config/bypass/bypass_pb";
import { bypass } from "../pbes/config/grpc/config_pb";
import Bypass from "./bypass";

function BypassComponent() {
    const ctx = useContext(GlobalToastContext);

    const [saving, setSaving] = useState(false);
    const [reloading, setReloading] = useState(false);

    const { data: setting, error, isLoading, mutate: setSetting } =
        useSWR("/bypass", ProtoESFetcher(bypass.method.load), { revalidateOnFocus: false })

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || !setting) return <Loading />

    return <>
        <Bypass bypass={clone(configSchema, setting)} onChange={(x) => { setSetting(x, false) }} />

        <hr />

        <Stack gap={1} direction="horizontal">
            <Button
                variant="outline-primary"
                disabled={saving}
                onClick={() => {
                    setSaving(true)
                    FetchProtobuf(
                        bypass.method.save,
                        "/bypass",
                        "PATCH",
                        setting,
                    )
                        .then(async ({ error }) => {
                            if (error !== undefined) ctx.Error(`save config failed, ${error.code}| ${error.msg}`)
                            else {
                                ctx.Info("Save Successfully");
                                setSetting()
                            }
                            setSaving(false)
                        })
                }}
            >
                Save
                {saving && <>&nbsp;<Spinner size="sm" animation="border" variant='primary' /></>}
            </Button>
            <Button
                variant="outline-primary"
                disabled={reloading}
                onClick={() => {
                    setReloading(true)
                    FetchProtobuf(bypass.method.reload, "/bypass/reload", "POST",)
                        .then(async ({ error }) => {
                            if (error !== undefined) ctx.Error(`reload failed, ${error.code}| ${error.msg}`)
                            else {
                                ctx.Info("Reload Successfully");
                                setSetting()
                            }
                            setReloading(false)
                        })
                }}
            >
                Refresh Now
                {reloading && <>&nbsp;<Spinner size="sm" animation="border" variant='primary' /></>}
            </Button>
        </Stack>
    </>
}

export default BypassComponent;