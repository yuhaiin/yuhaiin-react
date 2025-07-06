"use client"

import { create } from "@bufbuild/protobuf"
import { EmptySchema } from "@bufbuild/protobuf/wkt"
import { useCallback, useContext, useState } from "react"
import { Button, Card, Spinner } from "react-bootstrap"
import { ConfirmModal } from "../../common/confirm"
import Loading, { Error } from "../../common/loading"
import { FetchProtobuf, useProtoSWR } from "../../common/proto"
import { SettingCheck } from "../../common/switch"
import { GlobalToastContext } from "../../common/toast"
import { backup, restore_optionSchema } from "../../pbes/backup/backup_pb"
import { SettingInputText } from "../components"


function Page() {
    const ctx = useContext(GlobalToastContext);

    const [saving, setSaving] = useState(false);

    const { data, error, isLoading, mutate: setSetting } = useProtoSWR(backup.method.get, { revalidateOnFocus: false })


    const setInstanceName = useCallback((x: string) => {
        setSetting(prev => { return { ...prev, instanceName: x } }, false)
    }, [setSetting])

    const setEndpointUrl = useCallback((x: string) => {
        setSetting(prev => { return { ...prev, s3: { ...prev.s3, endpointUrl: x } } }, false)
    }, [setSetting])

    const setAccessKey = useCallback((x: string) => {
        setSetting(prev => { return { ...prev, s3: { ...prev.s3, accessKey: x } } }, false)
    }, [setSetting])

    const setSecretKey = useCallback((x: string) => {
        setSetting(prev => { return { ...prev, s3: { ...prev.s3, secretKey: x } } }, false)
    }, [setSetting])

    const setRegion = useCallback((x: string) => {
        setSetting(prev => { return { ...prev, s3: { ...prev.s3, region: x } } }, false)
    }, [setSetting])

    const setBucket = useCallback((x: string) => {
        setSetting(prev => { return { ...prev, s3: { ...prev.s3, bucket: x } } }, false)
    }, [setSetting])

    const switchUsePathStyle = useCallback(() => {
        setSetting(prev => { return { ...prev, s3: { ...prev.s3, usePathStyle: !prev.s3.usePathStyle } } }, false)
    }, [setSetting])

    const switchEnabled = useCallback(() => {
        setSetting(prev => { return { ...prev, s3: { ...prev.s3, enabled: !prev.s3.enabled } } }, false)
    }, [setSetting])


    const save = useCallback(() => {
        setSaving(true);
        FetchProtobuf(backup.method.save, data)
            .then(async ({ error }) => {
                if (error !== undefined) ctx.Error(`save config failed, ${error.code}| ${error.msg}`)
                else {
                    ctx.Info("Save Config Successfully");
                    setSetting()
                }
            }).finally(() => setSaving(false))
    }, [data, setSetting, ctx, setSaving])

    const backupNow = useCallback(() => {
        setSaving(true);
        FetchProtobuf(backup.method.backup, create(EmptySchema, {}))
            .then(async ({ error }) => {
                if (error !== undefined) ctx.Error(`backup config failed, ${error.code}| ${error.msg}`)
                else {
                    ctx.Info("Backup Config Successfully");
                    setSetting()
                }
            }).finally(() => setSaving(false))
    }, [ctx, setSaving, setSetting])

    const restoreNow = useCallback(() => {
        setSaving(true);
        FetchProtobuf(backup.method.restore, create(restore_optionSchema, { all: true, }))
            .then(async ({ error }) => {
                if (error !== undefined) ctx.Error(`restore config failed, ${error.code}| ${error.msg}`)
                else {
                    ctx.Info("Restore Config Successfully");
                    setSetting()
                }
            }).finally(() => setSaving(false))
    }, [ctx, setSaving, setSetting])

    const [showConfirmModal, setShowConfirmModal] = useState(false)

    const switchShowConfirmModal = useCallback(() => {
        setShowConfirmModal(prev => !prev)
    }, [setShowConfirmModal])

    const setInterval = useCallback((x: number) => {
        if (x < 0 || Number.isNaN(x)) return
        setSetting(prev => { return { ...prev, interval: BigInt(x) } }, false)
    }, [setSetting])

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || !data) return <Loading />

    return <>
        <ConfirmModal
            show={showConfirmModal}
            content={<>
                <p>Are you sure you want to restore, this will override all config?</p>
            </>}
            onOk={restoreNow}
            onHide={switchShowConfirmModal}
        />
        <Card>
            <Card.Body>
                <SettingInputText
                    label="Instance Name"
                    value={data.instanceName}
                    onChange={setInstanceName}
                />

                <SettingInputText
                    label="Backup Interval"
                    value={Number(data.interval)}
                    onChange={setInterval}
                />

                <SettingInputText
                    label="Last Backup Hash"
                    value={data.lastBackupHash}
                    readonly
                    plaintext
                />

                <hr />

                <Card.Title>S3</Card.Title>

                <SettingCheck
                    label="Enabled"
                    checked={data.s3.enabled}
                    onChange={switchEnabled}
                />

                <SettingInputText
                    label="Endpoint Url"
                    value={data.s3.endpointUrl}
                    onChange={setEndpointUrl}
                />

                <SettingCheck
                    label="Use Path Style"
                    checked={data.s3.usePathStyle}
                    onChange={switchUsePathStyle}
                />

                <SettingInputText
                    label="Bucket"
                    value={data.s3.bucket}
                    onChange={setBucket}
                />

                <SettingInputText
                    label="Region"
                    value={data.s3.region}
                    onChange={setRegion}
                />

                <SettingInputText
                    label="Access Key"
                    password
                    value={data.s3.accessKey}
                    onChange={setAccessKey}
                />

                <SettingInputText
                    label="Secret Key"
                    password
                    value={data.s3.secretKey}
                    onChange={setSecretKey}
                />
            </Card.Body>

            <Card.Footer className='d-flex justify-content-md-end'>
                <Button
                    variant="outline-success"
                    onClick={backupNow}
                    disabled={saving}
                >
                    <i className="bi bi-save"></i> Backup Now
                    {saving && <>&nbsp;<Spinner size="sm" animation="border" variant='primary' /></>}
                </Button>

                <Button
                    className="ms-2"
                    variant="outline-info"
                    onClick={switchShowConfirmModal}
                    disabled={saving}
                >
                    <i className="bi bi-arrow-clockwise"></i> Restore Now
                    {saving && <>&nbsp;<Spinner size="sm" animation="border" variant='primary' /></>}
                </Button>

                <Button
                    className="ms-2"
                    variant="outline-primary"
                    onClick={save}
                    disabled={saving}
                >
                    <i className="bi bi-floppy"></i> Save
                    {saving && <>&nbsp;<Spinner size="sm" animation="border" variant='primary' /></>}
                </Button>
            </Card.Footer>
        </Card >
    </>
}

export default Page