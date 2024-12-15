"use client"

import { clone, fromJsonString, toJsonString } from "@bufbuild/protobuf";
import { useContext, useState } from "react";
import { Button, ButtonGroup, Spinner, Stack } from "react-bootstrap";
import useSWR from "swr";
import Loading from "../common/loading";
import { FetchProtobuf, ProtoESFetcher } from "../common/proto";
import { GlobalToastContext } from "../common/toast";
import { configSchema } from "../pbes/config/bypass/bypass_pb";
import { bypass } from "../pbes/config/grpc/config_pb";
import Bypass from "./bypass";
import { JsonModal } from "./modal";

function BypassComponent() {
    const ctx = useContext(GlobalToastContext);

    const [saving, setSaving] = useState(false);
    const [reloading, setReloading] = useState(false);
    const [modalData, setModalData] = useState<{ show: boolean, data?: string, import?: boolean, onSave?: (data: string) => void }>({ show: false });


    const { data: setting, error, isLoading, mutate: setSetting } =
        useSWR("/bypass", ProtoESFetcher(bypass.method.load), { revalidateOnFocus: false })

    if (error) return <Loading code={error.code}>{error.msg}</Loading>
    if (isLoading || !setting) return <Loading />

    return <>

        <JsonModal
            onHide={() => {
                setModalData(prev => { return { ...prev, show: false } })
            }}
            show={modalData.show}
            plaintext={!modalData.import}
            data={modalData.data}
            onSave={modalData.onSave}
        />

        <Bypass
            bypass={clone(configSchema, setting)}
            onChange={(x) => { setSetting(x, false) }}
            setModalData={setModalData}
        />

        <hr />

        <Stack gap={1} direction="horizontal">
            <ButtonGroup>
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
                    <i className="bi bi-floppy"></i> Save
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
                    <i className="bi bi-arrow-clockwise"></i> Refresh Now
                    {reloading && <>&nbsp;<Spinner size="sm" animation="border" variant='primary' /></>}
                </Button>
            </ButtonGroup>

            <ButtonGroup>
                <Button
                    variant="outline-success"
                    onClick={() => {
                        setModalData({
                            show: true,
                            import: true,
                            onSave: (data: string) => {
                                const v = fromJsonString(configSchema, data)
                                setSetting(v, false)
                                setModalData(prev => { return { ...prev, show: false } })
                            }
                        })
                    }}
                >
                    <i className="bi bi-box-arrow-in-down"></i> Import
                </Button>
                <Button
                    variant="outline-success"
                    onClick={() => {
                        const data = toJsonString(configSchema, setting, { prettySpaces: 2 })
                        setModalData({ show: true, data: data })
                    }}
                >
                    <i className="bi bi-box-arrow-in-up"></i> Export
                </Button>
            </ButtonGroup>
        </Stack>
    </>
}

export default BypassComponent;