"use client"

import { getBackupConfig, restoreBackup, runBackup, saveBackupConfig } from "@/api/backup"
import { Button } from "@/component/v2/button"
import { Card, CardBody, CardFooter, CardHeader, IconBox, ListItem, MainContainer, SettingLabel } from "@/component/v2/card"
import { ConfirmModal } from "@/component/v2/confirm"
import { SettingInputVertical, SettingPasswordVertical, SwitchCard } from "@/component/v2/forms"
import Loading, { Error } from "@/component/v2/loading"
import { Spinner } from "@/component/v2/spinner"
import { GlobalToastContext } from "@/component/v2/toast"
import type { BackupOption } from "@/contract/backup"
import { createRestoreAll } from "@/contract/backup"
import { CloudUpload, Hash, Info, RotateCw, Save, ShieldCheck } from "lucide-react"
import { useContext, useState } from "react"
import useSWR from "swr"

function BackupPage() {
    const ctx = useContext(GlobalToastContext);
    const [saving, setSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const { data, error, isLoading, mutate } = useSWR("/api/v2/backup/config", getBackupConfig, {
        revalidateOnFocus: false,
    });

    const update = (fn: (prev: BackupOption) => BackupOption) => {
        mutate(prev => prev ? fn(prev) : prev, { revalidate: false });
    };

    const handleSave = () => {
        if (!data) return;
        setSaving(true);
        saveBackupConfig(data)
            .then(next => {
                ctx.Info("configuration saved successfully");
                mutate(next, { revalidate: false });
            })
            .catch((err) => ctx.Error(`save failed: ${err.msg ?? err}`))
            .finally(() => setSaving(false));
    };

    const handleBackupNow = () => {
        setSaving(true);
        runBackup()
            .then(() => {
                ctx.Info("backup completed successfully");
                mutate();
            })
            .catch((err) => ctx.Error(`backup failed: ${err.msg ?? err}`))
            .finally(() => setSaving(false));
    };

    const handleRestoreNow = () => {
        setSaving(true);
        restoreBackup(createRestoreAll())
            .then(() => {
                ctx.Info("configuration restored successfully");
                mutate();
            })
            .catch((err) => ctx.Error(`restore failed: ${err.msg ?? err}`))
            .finally(() => setSaving(false));
    };

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

            <Card>
                <CardHeader className="py-3">
                    <IconBox icon={ShieldCheck} color="#3b82f6" title="Backup Instance" description="Identification and timing" />
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SettingInputVertical
                            label="Instance Name"
                            value={data.instanceName}
                            onChange={(instanceName) => update(prev => ({ ...prev, instanceName }))}
                            placeholder="Unique identifier for this node"
                        />
                        <SettingInputVertical
                            label="Backup Interval (Seconds)"
                            value={String(data.interval)}
                            onChange={(value) => update(prev => ({ ...prev, interval: Math.max(0, Number.parseInt(value, 10) || 0) }))}
                            placeholder="e.g. 3600"
                        />
                        <div className="md:col-span-2">
                            <SettingLabel>Last Backup Hash</SettingLabel>
                            <ListItem className="cursor-default bg-black/10 dark:bg-white/10">
                                <Hash className="mr-2 text-gray-500 dark:text-gray-400" size={16} />
                                <span className="font-mono text-sm truncate opacity-75">
                                    {data.lastBackupHash || "No backup records found"}
                                </span>
                            </ListItem>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SwitchCard
                            label="S3 Backup Enabled"
                            description="Enable automatic S3 sync"
                            checked={data.s3.enabled}
                            onCheckedChange={() => update(prev => ({ ...prev, s3: { ...prev.s3, enabled: !prev.s3.enabled } }))}
                        />
                        <SwitchCard
                            label="Use Path Style"
                            description="Compatibility for MinIO/S3 clones"
                            checked={data.s3.usePathStyle}
                            onCheckedChange={() => update(prev => ({ ...prev, s3: { ...prev.s3, usePathStyle: !prev.s3.usePathStyle } }))}
                        />
                        <div className="md:col-span-2">
                            <SettingInputVertical
                                label="Endpoint URL"
                                value={data.s3.endpointUrl}
                                onChange={(endpointUrl) => update(prev => ({ ...prev, s3: { ...prev.s3, endpointUrl } }))}
                                placeholder="https://s3.amazonaws.com"
                            />
                        </div>
                        <SettingInputVertical
                            label="Bucket Name"
                            value={data.s3.bucket}
                            onChange={(bucket) => update(prev => ({ ...prev, s3: { ...prev.s3, bucket } }))}
                            placeholder="my-backup-bucket"
                        />
                        <SettingInputVertical
                            label="Region"
                            value={data.s3.region}
                            onChange={(region) => update(prev => ({ ...prev, s3: { ...prev.s3, region } }))}
                            placeholder="us-east-1"
                        />
                        <SettingPasswordVertical
                            label="Access Key"
                            value={data.s3.accessKey}
                            onChange={(accessKey) => update(prev => ({ ...prev, s3: { ...prev.s3, accessKey } }))}
                            placeholder="Enter Access Key"
                        />
                        <SettingPasswordVertical
                            label="Secret Key"
                            value={data.s3.secretKey}
                            onChange={(secretKey) => update(prev => ({ ...prev, s3: { ...prev.s3, secretKey } }))}
                            placeholder="Enter Secret Key"
                        />
                    </div>
                </CardBody>

                <CardFooter>
                    <div className="flex gap-2">
                        <Button onClick={handleBackupNow} disabled={saving} title="Trigger immediate backup">
                            {saving ? <Spinner size="sm" /> : <CloudUpload size={16} />}
                            <span className="ml-2 hidden sm:inline">Backup Now</span>
                        </Button>
                        <Button onClick={() => setShowConfirmModal(true)} disabled={saving} title="Restore from cloud">
                            <RotateCw size={16} />
                            <span className="ml-2 hidden sm:inline">Restore Now</span>
                        </Button>
                        <Button onClick={handleSave} disabled={saving} title="Save configuration changes">
                            <Save size={16} />
                            <span className="ml-2 hidden sm:inline">Save Config</span>
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            <div className="text-center mt-3 opacity-50 pb-20">
                <small className="text-gray-500 dark:text-gray-400">
                    <Info className="mr-1 inline" size={14} />
                    Backups include all lists, rules, and node configurations.
                </small>
            </div>
        </MainContainer>
    );
}

export default BackupPage;
