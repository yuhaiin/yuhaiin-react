import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { useTranslation } from 'react-i18next';

import { getBackupConfig, restoreBackup, runBackup, saveBackupConfig } from "@/api/backup"
import { Button } from "@/component/v2/button"
import { Card, CardBody, CardFooter, CardHeader, IconBox, ListItem, MainContainer, SettingLabel } from "@/component/v2/card"
import { ConfirmModal } from "@/component/v2/confirm"
import { SettingInputVertical, SettingPasswordVertical, SwitchCard } from "@/component/v2/forms"
import Loading from "@/component/v2/loading"
import { Spinner } from "@/component/v2/spinner"
import { GlobalToastContext } from "@/component/v2/toast"
import type { BackupOption } from "@/contract/backup"
import { createRestoreAll } from "@/contract/backup"
import { CloudUpload, Hash, Info, RotateCw, Save, ShieldCheck } from "lucide-react"
import { useContext, useState } from "react"
import useSWR from "swr"

function BackupPage() {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const { data: server, error, isLoading, mutate } = useSWR("/api/v2/backup/config", getBackupConfig, {
        revalidateOnFocus: false,
    });

    const { value: data, setValue, dirty, commit } = useEditorDraft("backup", server, () => undefined);
    const { pending: saving, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    useCloseGuard(dirty, saving, () => undefined);
    const update = (fn: (prev: BackupOption) => BackupOption) => setValue(prev => prev ? fn(prev) : prev);
    const handleSave = () => {
        if (!data || saving) return;
        void run(async () => {
            const next = await saveBackupConfig(data);
            commit(next);
            await mutate(next, { revalidate: false });
            ctx.Info(uiT("save"));
        });
    };
    const handleBackupNow = () => {
        if (saving) return;
        void run(async () => { await runBackup(); ctx.Info(uiT("backupNow")); });
    };
    const handleRestoreNow = () => {
        if (saving) return;
        void run(async () => {
            await restoreBackup(createRestoreAll());
            const next = await mutate();
            if (next) commit(next);
            ctx.Info(uiT("restoreBackup"));
        });
    };

    if (error !== undefined) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>
    if (isLoading || !data) return <Loading />

    return (
        <MainContainer>
            <ConfirmModal
                show={showConfirmModal}
                title={uiT("restoreBackup")}
                content={<p className="mb-0">{uiT("areYouSureYouWantToRestoreThisWill")}<strong>{uiT("overwriteAllCurrentConfigurations")}</strong>.</p>}
                onOk={handleRestoreNow}
                onHide={() => setShowConfirmModal(false)}
            />

            <fieldset disabled={saving} className="contents">
            <Card>
                <CardHeader className="py-3">
                    <IconBox icon={ShieldCheck} tone="primary" title={uiT("backupInstance")} description={uiT("identificationAndTiming")} />
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SettingInputVertical
                            label={uiT("instanceName")}
                            value={data.instanceName}
                            onChange={(instanceName) => update(prev => ({ ...prev, instanceName }))}
                            placeholder={uiT("uniqueIdentifierForThisNode")}
                        />
                        <SettingInputVertical
                            label={uiT("backupIntervalSeconds")}
                            value={String(data.interval)}
                            onChange={(value) => update(prev => ({ ...prev, interval: Math.max(0, Number.parseInt(value, 10) || 0) }))}
                            placeholder={uiT("eG")}
                        />
                        <div className="md:col-span-2">
                            <SettingLabel>{uiT("lastBackupHash")}</SettingLabel>
                            <ListItem className="cursor-default bg-ui-surface-muted">
                                <Hash className="mr-2 text-ui-muted" size={16} />
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
                            label={uiT("s3BackupEnabled")}
                            description={uiT("enableAutomaticS3Sync")}
                            checked={data.s3.enabled}
                            onCheckedChange={(checked) => update(prev => ({ ...prev, s3: { ...prev.s3, enabled: checked } }))}
                        />
                        <SwitchCard
                            label={uiT("usePathStyle")}
                            description={uiT("compatibilityForMinioS3Clones")}
                            checked={data.s3.usePathStyle}
                            onCheckedChange={(checked) => update(prev => ({ ...prev, s3: { ...prev.s3, usePathStyle: checked } }))}
                        />
                        <div className="md:col-span-2">
                            <SettingInputVertical
                                label={uiT("endpointUrl")}
                                value={data.s3.endpointUrl}
                                onChange={(endpointUrl) => update(prev => ({ ...prev, s3: { ...prev.s3, endpointUrl } }))}
                                placeholder="https://s3.amazonaws.com"
                            />
                        </div>
                        <SettingInputVertical
                            label={uiT("bucketName")}
                            value={data.s3.bucket}
                            onChange={(bucket) => update(prev => ({ ...prev, s3: { ...prev.s3, bucket } }))}
                            placeholder="my-backup-bucket"
                        />
                        <SettingInputVertical
                            label={uiT("region")}
                            value={data.s3.region}
                            onChange={(region) => update(prev => ({ ...prev, s3: { ...prev.s3, region } }))}
                            placeholder="us-east-1"
                        />
                        <SettingPasswordVertical
                            label={uiT("accessKey")}
                            value={data.s3.accessKey}
                            onChange={(accessKey) => update(prev => ({ ...prev, s3: { ...prev.s3, accessKey } }))}
                            placeholder={uiT("enterAccessKey")}
                        />
                        <SettingPasswordVertical
                            label={uiT("secretKey")}
                            value={data.s3.secretKey}
                            onChange={(secretKey) => update(prev => ({ ...prev, s3: { ...prev.s3, secretKey } }))}
                            placeholder={uiT("enterSecretKey")}
                        />
                    </div>
                </CardBody>

                <CardFooter>
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={handleBackupNow} disabled={saving} aria-label={uiT("backupNow")} title={uiT("triggerImmediateBackup")}>
                            {saving ? <Spinner size="sm" /> : <CloudUpload size={16} />}
                            <span className="ml-2 hidden sm:inline">{uiT("backupNow")}</span>
                        </Button>
                        <Button onClick={() => setShowConfirmModal(true)} disabled={saving} aria-label={uiT("restoreNow")} title={uiT("restoreFromCloud")}>
                            <RotateCw size={16} />
                            <span className="ml-2 hidden sm:inline">{uiT("restoreNow")}</span>
                        </Button>
                        <Button onClick={handleSave} disabled={saving} aria-label={uiT("saveConfig")} title={uiT("saveConfigurationChanges")}>
                            <Save size={16} />
                            <span className="ml-2 hidden sm:inline">{uiT("saveConfig")}</span>
                        </Button>
                    </div>
                </CardFooter>
            </Card>

            </fieldset>
            <div className="text-center mt-3 opacity-50 pb-20">
                <small className="text-ui-muted">
                    <Info className="mr-1 inline" size={14} />
                    {uiT("backupsIncludeAllListsRulesAndNodeConfigurations")}</small>
            </div>
        </MainContainer>
    );
}

export default BackupPage;
