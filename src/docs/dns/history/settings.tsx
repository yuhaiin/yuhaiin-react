import { clearDNSHistory, saveDNSHistorySettings, type DNSHistorySettings, type DNSHistoryStats } from "@/api/dns-history";
import { Button } from "@/component/v2/button";
import { SettingLabel } from "@/component/v2/card";
import { confirmAction } from "@/component/v2/confirmation";
import { DataListItem, DataSection } from "@/component/v2/datalist";
import { Input } from "@/component/v2/input";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/component/v2/modal";
import Switch from "@/component/v2/switch";
import { GlobalToastContext } from "@/component/v2/toast";
import { useAsyncAction } from "@/hooks/use-editor-draft";
import { useActionAllowed } from "@/auth/policy";
import { Trash } from "lucide-react";
import { useContext, useId, useState } from "react";
import { useTranslation } from "react-i18next";

export const retentionLimits = { minHours: 1, maxHours: 24 * 30, minRecords: 100, maxRecords: 200_000 };

export function validateSettings(settings: DNSHistorySettings): "retention" | "records" | undefined {
    if (!Number.isInteger(settings.retentionHours) || settings.retentionHours < retentionLimits.minHours || settings.retentionHours > retentionLimits.maxHours) return "retention";
    if (!Number.isInteger(settings.maxRecords) || settings.maxRecords < retentionLimits.minRecords || settings.maxRecords > retentionLimits.maxRecords) return "records";
    return undefined;
}

export function DNSHistorySettingsModal({ open, onOpenChange, settings, recorder, onSaved, onCleared }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    settings?: DNSHistorySettings;
    recorder?: DNSHistoryStats["recorder"];
    onSaved: (settings: DNSHistorySettings) => void;
    onCleared: () => void;
}) {
    return <Modal open={open} onOpenChange={onOpenChange}>
        <ModalContent width={560}>
            {/* Content mounts per opening, so the draft starts from the saved settings. */}
            <SettingsForm key={settings ? "loaded" : "loading"} settings={settings} recorder={recorder} onSaved={onSaved} onCleared={onCleared} close={() => onOpenChange(false)} />
        </ModalContent>
    </Modal>;
}

function SettingsForm({ settings, recorder, onSaved, onCleared, close }: {
    settings?: DNSHistorySettings;
    recorder?: DNSHistoryStats["recorder"];
    onSaved: (settings: DNSHistorySettings) => void;
    onCleared: () => void;
    close: () => void;
}) {
    const { t } = useTranslation("dns");
    const ctx = useContext(GlobalToastContext);
    const retentionId = useId(), recordsId = useId();
    const [draft, setDraft] = useState<DNSHistorySettings | undefined>(settings);
    const writable = useActionAllowed("dns-history:write", true);
    const { pending, run } = useAsyncAction(error => ctx.Error(String((error as { msg?: string })?.msg ?? error)));
    const invalid = draft ? validateSettings(draft) : undefined;
    const save = () => draft && !invalid && void run(async () => {
        const saved = await saveDNSHistorySettings(draft);
        ctx.Info(t("settings.saved"));
        onSaved(saved);
        close();
    });
    const clear = async () => {
        if (pending || !await confirmAction(t("settings.clearConfirm"))) return;
        void run(async () => {
            const result = await clearDNSHistory();
            ctx.Info(t("settings.cleared", { count: result.deleted }));
            onCleared();
        });
    };
    return <>
        <ModalHeader closeButton><ModalTitle>{t("settings.title")}</ModalTitle></ModalHeader>
        <ModalBody className="space-y-5">
            {draft && <fieldset disabled={pending || !writable} className="m-0 min-w-0 space-y-4 border-0 p-0">
                <Switch label={t("settings.enabled")} description={t("settings.enabledHelp")} checked={draft.enabled} onCheckedChange={enabled => setDraft({ ...draft, enabled })} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div><SettingLabel htmlFor={retentionId}>{t("settings.retentionHours")}</SettingLabel>
                        <Input id={retentionId} type="number" inputMode="numeric" min={retentionLimits.minHours} max={retentionLimits.maxHours} value={draft.retentionHours}
                            error={invalid === "retention" ? t("settings.retentionInvalid", { max: retentionLimits.maxHours }) : undefined}
                            onChange={event => setDraft({ ...draft, retentionHours: Number(event.target.value) })} /></div>
                    <div><SettingLabel htmlFor={recordsId}>{t("settings.maxRecords")}</SettingLabel>
                        <Input id={recordsId} type="number" inputMode="numeric" min={retentionLimits.minRecords} max={retentionLimits.maxRecords} value={draft.maxRecords}
                            error={invalid === "records" ? t("settings.recordsInvalid", { min: retentionLimits.minRecords, max: retentionLimits.maxRecords }) : undefined}
                            onChange={event => setDraft({ ...draft, maxRecords: Number(event.target.value) })} /></div>
                </div>
                <p className="m-0 text-xs text-ui-muted">{t("settings.privacy")}</p>
            </fieldset>}
            {recorder && <DataSection title={t("settings.recorder")}>
                <DataListItem label={t("settings.queue")} value={`${recorder.queueLength.toLocaleString()} / ${recorder.queueCapacity.toLocaleString()}`} />
                <DataListItem label={t("settings.persisted")} value={recorder.persisted.toLocaleString()} />
                <DataListItem label={t("settings.recordsDropped")} value={<span className={recorder.recordsDropped ? "text-ui-warning" : undefined}>{recorder.recordsDropped.toLocaleString()}</span>} />
                <DataListItem label={t("settings.persistenceErrors")} value={<span className={recorder.persistenceErrors ? "text-ui-danger" : undefined}>{recorder.persistenceErrors.toLocaleString()}</span>} />
                <DataListItem label={t("settings.lastError")} value={recorder.lastPersistenceError} />
                <DataListItem label={t("settings.since")} value={recorder.startedAt ? new Date(recorder.startedAt).toLocaleString() : undefined} />
            </DataSection>}
            {recorder && <p className="m-0 text-xs text-ui-muted">{t("settings.droppedHelp")}</p>}
        </ModalBody>
        <ModalFooter>
            <Button variant="outline-danger" className="mr-auto" onClick={() => void clear()} disabled={pending}><Trash size={14} aria-hidden="true" />{t("settings.clear")}</Button>
            <Button variant="outline-secondary" onClick={close}>{t("settings.cancel")}</Button>
            <Button variant="primary" onClick={save} disabled={!draft || Boolean(invalid) || pending}>{t("settings.save")}</Button>
        </ModalFooter>
    </>;
}
