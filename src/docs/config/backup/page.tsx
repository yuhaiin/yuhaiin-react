"use client"

import { Button } from "@/component/v2/button"
import { Card, CardBody, CardFooter, CardHeader, IconBox, ListItem, MainContainer, SettingLabel } from '@/component/v2/card'
import { ConfirmModal } from "@/component/v2/confirm"
import { SettingInputVertical, SettingPasswordVertical, SwitchCard } from "@/component/v2/forms"
import { Spinner } from "@/component/v2/spinner"
import { create } from "@bufbuild/protobuf"
import { EmptySchema } from "@bufbuild/protobuf/wkt"
import { CloudUpload, Hash, Info, RotateCw, Save, ShieldCheck } from "lucide-react"
import { useCallback, useContext, useState } from "react"
import { FetchProtobuf, useProtoSWR } from "../../../common/proto"
import Loading, { Error } from "../../../component/v2/loading"
import { GlobalToastContext } from "../../../component/v2/toast"
import { backup } from "../../pbes/api/backup_pb"
import { restore_optionSchema } from "../../pbes/backup/backup_pb"

function BackupPage() {
    const ctx = useContext(GlobalToastContext);
    const [saving, setSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const { data, error, isLoading, mutate: setSetting } = useProtoSWR(backup.method.get, {
        revalidateOnFocus: false
    });

    // --- Action Handlers ---

    const handleSave = useCallback(() => {
        setSaving(true);
        FetchProtobuf(backup.method.save, data)
            .then(({ error }) => {
                if (error) ctx.Error(`Save failed: ${error.msg}`);
                else {
                    ctx.Info("Configuration saved successfully");
                    setSetting();
                }
            }).finally(() => setSaving(false))
    }, [data, setSetting, ctx]);

    const handleBackupNow = useCallback(() => {
        setSaving(true);
        FetchProtobuf(backup.method.backup, create(EmptySchema, {}))
            .then(({ error }) => {
                if (error) ctx.Error(`Backup failed: ${error.msg}`);
                else {
                    ctx.Info("Backup completed successfully");
                    setSetting();
                }
            }).finally(() => setSaving(false))
    }, [ctx, setSetting]);

    const handleRestoreNow = useCallback(() => {
        setSaving(true);
        FetchProtobuf(backup.method.restore, create(restore_optionSchema, { all: true }))
            .then(({ error }) => {
                if (error) ctx.Error(`Restore failed: ${error.msg}`);
                else {
                    ctx.Info("Configuration restored successfully");
                    setSetting();
                }
            }).finally(() => setSaving(false))
    }, [ctx, setSetting]);

    if (error !== undefined) return <Error statusCode={error.code} title={error.msg} />
    if (isLoading || !data) return <Loading />

    return (
        <MainContainer>
            <ConfirmModal
                show={showConfirmModal}
                title="Restore Backup"
                content={<p className="mb-0">Are you sure you want to restore? This will <strong>overwrite all current configurations</strong>.</p>}
                onOk={handleRestoreNow}
                onHide={() => setShowConfirmModal(false)}
            />

            {/* 1. General Backup Settings */}
            <Card>
                <CardHeader>
                    <IconBox icon={ShieldCheck} color="#3b82f6" title='Backup Instance' description='Identification and timing' />
                </CardHeader>
                <CardBody>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <SettingInputVertical
                                label="Instance Name"
                                value={data.instanceName}
                                onChange={(v) => setSetting(prev => ({ ...prev, instanceName: v }), false)}
                                placeholder="Unique identifier for this node"
                            />
                        </div>
                        <div className="col-md-6">
                            <SettingInputVertical
                                label="Backup Interval (Seconds)"
                                value={data.interval.toString()}
                                onChange={(v: string) => {
                                    const val = parseInt(v);
                                    if (!isNaN(val) && val >= 0) setSetting(prev => ({ ...prev, interval: BigInt(val) }), false);
                                }}
                                placeholder="e.g. 3600"
                            />
                        </div>
                        <div className="col-12">
                            <SettingLabel>Last Backup Hash</SettingLabel>
                            <ListItem style={{ cursor: 'default', background: 'rgba(0,0,0,0.1)' }}>
                                <Hash className="me-2 text-muted" size={16} />
                                <span className="font-monospace small text-truncate opacity-75">
                                    {data.lastBackupHash || "No backup records found"}
                                </span>
                            </ListItem>
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* 2. S3 Storage Configuration */}
            <Card>
                <CardBody>
                    <div className="row g-4">
                        {/* Toggles Row */}
                        <div className="col-md-6">
                            <SwitchCard
                                label="S3 Backup Enabled"
                                description="Enable automatic S3 sync"
                                checked={data.s3.enabled}
                                onCheckedChange={() => setSetting(prev => ({ ...prev, s3: { ...prev.s3, enabled: !prev.s3.enabled } }), false)}
                            />
                        </div>
                        <div className="col-md-6">
                            <SwitchCard
                                label="Use Path Style"
                                description="Compatibility for MinIO/S3 clones"
                                checked={data.s3.usePathStyle}
                                onCheckedChange={() => setSetting(prev => ({ ...prev, s3: { ...prev.s3, usePathStyle: !prev.s3.usePathStyle } }), false)}
                            />
                        </div>

                        <div className="col-12 mt-2">
                            <SettingInputVertical
                                label="Endpoint URL"
                                value={data.s3.endpointUrl}
                                onChange={(v) => setSetting(prev => ({ ...prev, s3: { ...prev.s3, endpointUrl: v } }), false)}
                                placeholder="https://s3.amazonaws.com"
                            />
                        </div>

                        <div className="col-md-6">
                            <SettingInputVertical
                                label="Bucket Name"
                                value={data.s3.bucket}
                                onChange={(v) => setSetting(prev => ({ ...prev, s3: { ...prev.s3, bucket: v } }), false)}
                                placeholder="my-backup-bucket"
                            />
                        </div>
                        <div className="col-md-6">
                            <SettingInputVertical
                                label="Region"
                                value={data.s3.region}
                                onChange={(v) => setSetting(prev => ({ ...prev, s3: { ...prev.s3, region: v } }), false)}
                                placeholder="us-east-1"
                            />
                        </div>

                        {/* Credential Row with Password Toggles */}
                        <div className="col-md-6">
                            <SettingPasswordVertical
                                label="Access Key"
                                value={data.s3.accessKey}
                                onChange={(v) => setSetting(prev => ({ ...prev, s3: { ...prev.s3, accessKey: v } }), false)}
                                placeholder="Enter Access Key"
                            />
                        </div>
                        <div className="col-md-6">
                            <SettingPasswordVertical
                                label="Secret Key"
                                value={data.s3.secretKey}
                                onChange={(v) => setSetting(prev => ({ ...prev, s3: { ...prev.s3, secretKey: v } }), false)}
                                placeholder="Enter Secret Key"
                            />
                        </div>
                    </div>
                </CardBody>

                <CardFooter>
                    <div className="d-flex gap-2">
                        <Button
                            onClick={handleBackupNow}
                            disabled={saving}
                            title="Trigger immediate backup"
                        >
                            {saving ? <Spinner size="sm" /> : <CloudUpload size={16} />}
                            <span className="ms-2 d-none d-sm-inline">Backup Now</span>
                        </Button>

                        <Button
                            onClick={() => setShowConfirmModal(true)}
                            disabled={saving}
                            title="Restore from cloud"
                        >
                            <RotateCw size={16} />
                            <span className="ms-2 d-none d-sm-inline">Restore Now</span>
                        </Button>

                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            title="Save configuration changes"
                        >
                            <Save size={16} />
                            <span className="ms-2 d-none d-sm-inline">Save Config</span>
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            <div className="text-center mt-3 opacity-50 pb-5">
                <small className="text-muted">
                    <Info className="me-1" />
                    Backups include all lists, rules, and node configurations.
                </small>
            </div>
        </MainContainer>
    )
}

export default BackupPage;