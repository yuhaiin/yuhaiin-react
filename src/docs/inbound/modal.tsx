import { ResourceEditorFrame } from '@/component/resource-workspace';
import { useAsyncAction, useCloseGuard, useEditorDraft } from "@/hooks/use-editor-draft";
import { InboundRuntimePanel } from "./runtime";
import { InboundTaskEditor } from "./task-editor";
import { initialInbound, presetInbound, type InboundPreset } from "./presets";
import { SettingSelectVertical } from "@/component/v2/forms";

import { useTranslation } from 'react-i18next';
import { createInbound, getInbound, getInboundCapabilities, InboundRuntimeStatus, listInboundEvents, saveInbound } from "@/api/inbounds";
import { APIError } from "@/api/client";
import { Button } from "@/component/v2/button";
import { SettingsBox } from "@/component/v2/card";

import { Spinner } from "@/component/v2/spinner";

import { normalizeInbound } from "@/contract/inbound";
import { Check, Trash } from "lucide-react";
import { FC, useContext, useState } from "react";
import useSWR from "swr";
import Loading from "../../component/v2/loading";
import { GlobalToastContext } from "../../component/v2/toast";

function errorOf(error: unknown): APIError | undefined {
    if (!error) return undefined;
    if (typeof error === "object" && "code" in error && "msg" in error) return error as APIError;
    return { code: 500, msg: error instanceof Error ? error.message : String(error) };
}

function errorRaw(raw: unknown): string | undefined {
    if (raw === undefined || raw === null) return undefined;
    if (typeof raw === "string") return raw;
    try {
        return JSON.stringify(raw);
    } catch {
        return String(raw);
    }
}

const InboundModal: FC<{
    show: boolean;
    id: string;
    onHide: (save?: boolean) => void;
    onDelete: () => void;
    isNew?: boolean;
    runtime?: InboundRuntimeStatus;
    onRetry?: () => void;
    retrying?: boolean;
    presentation?: "modal" | "inline";
    onSaved?: (value: import("@/contract/inbound").Inbound) => void;
}> = ({ show, id, onHide, onDelete, isNew, runtime, onRetry, retrying, presentation = "modal", onSaved }) => {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');
    const [preset, setPreset] = useState('local');
    const [saveError, setSaveError] = useState('');
    const [previousSession, setPreviousSession] = useState({ show, id });
    if (previousSession.show !== show || previousSession.id !== id) {
        setPreviousSession({ show, id });
        setPreset('local');
        setSaveError('');
    }
    const { data: capabilities, error: capabilitiesError, mutate: refreshCapabilities } = useSWR(show ? '/api/v2/inbounds/capabilities' : null, getInboundCapabilities);

    const ctx = useContext(GlobalToastContext);
    const shouldFetch = show && id !== "" && !isNew;

    const { data, error, isLoading, mutate } = useSWR(
        shouldFetch ? `/api/v2/inbounds/${id}` : null,
        () => getInbound(id),
        { shouldRetryOnError: false, keepPreviousData: false, revalidateOnFocus: false },
    );
    const { data: events = [], isLoading: eventsLoading } = useSWR(
        shouldFetch ? `/api/v2/inbounds/${id}/events` : null,
        () => listInboundEvents(id),
        { refreshInterval: 3000, revalidateOnFocus: true, shouldRetryOnError: false },
    );

    const { value: draft, setValue: setDraft, dirty, commit } = useEditorDraft(show ? id : null, shouldFetch ? data : undefined, () => initialInbound(id));
    const { pending: saving, run } = useAsyncAction(error => { const message = errorOf(error)?.msg ?? "Save failed"; setSaveError(message); ctx.Error(message); });
    const close = useCloseGuard(dirty && show, saving, () => onHide());

    const supportedProtocols = capabilities?.protocols ?? ['mixed', 'http', 'socks5', 'socks4a', 'hysteria2', 'yuubinsya', 'krunlet', 'reverse_http', 'reverse_tcp', 'none'];
    const apiError = errorOf(error);
    const inbound = isNew ? draft : data ? draft : undefined;
    const title = isNew ? "New Inbound" : inbound?.name || id || "Inbound";

    const handleSave = () => {
        if (!inbound || saving || error || isLoading || inbound.enabled && !supportedProtocols.includes(inbound.protocol.type)) return;
        setSaveError('');
        const next = normalizeInbound({ ...inbound, id, name: inbound.name || t(preset === "tun" ? "presetTun" : preset === "lan" ? "presetLAN" : "presetLocal") });
        void run(async () => {
            const saved = isNew ? await createInbound(next) : await saveInbound(next);
            ctx.Info("Save successful");
            await mutate(saved, { revalidate: false });
            commit(saved);
            onSaved?.(saved);
            if (presentation === "modal") onHide(true);
        });
    };

    return <ResourceEditorFrame title={title} label={uiT("entryPoints")} presentation={presentation} open={show} onClose={close}
        footer={<>
                    <div>
                        {!isNew && (
                            <Button variant="outline-danger" disabled={saving || isLoading || Boolean(error)} onClick={onDelete}>
                                <Trash className="mr-2" size={16} />{uiT("delete")}</Button>
                        )}
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button onClick={close} disabled={saving}>{uiT("cancel")}</Button>
                        <Button variant="primary" disabled={saving || !inbound || isLoading || Boolean(error) || inbound.enabled && !supportedProtocols.includes(inbound.protocol.type)} onClick={handleSave}>
                            {saving ? <Spinner size="sm" /> : <><Check className="mr-1" size={16} /> {uiT("save")}</>}
                        </Button>
                    </div>
                </>}>
                    <fieldset disabled={saving} className="contents">
                    {apiError ? <Loading code={apiError.code} onRetry={() => void mutate()}>{apiError.msg}</Loading> : isLoading || !inbound ? (
                        <Loading />
                    ) : (
                        <SettingsBox>
                            {(!isNew || runtime) && (
                                <InboundRuntimePanel
                                    status={runtime}
                                    events={events}
                                    eventsLoading={eventsLoading}
                                    onRetry={onRetry}
                                    retrying={retrying}
                                />
                            )}
                            {isNew && <SettingSelectVertical label={t('entryPreset')} value={preset}
                                values={[[t('presetLocal'), 'local'], [t('presetLAN'), 'lan'], ...(capabilities?.protocols.includes('tun') ? [[t('presetTun'), 'tun'] as [string, string]] : []), [t('presetCustom'), 'custom']]}
                                onChange={next => {
                                    if (next === 'custom') { setPreset(next); return; }
                                    if (!dirty || window.confirm(t('entryPresetReplace'))) {
                                        setPreset(next); setDraft(presetInbound(inbound, next as InboundPreset, capabilities?.platform ?? ''));
                                    }
                                }} />}
                            {capabilitiesError && <p role="alert" className="mb-3 text-sm text-ui-danger">{t('entryCapabilitiesFailed')} <Button size="sm" onClick={() => void refreshCapabilities()}>{t('retry')}</Button></p>}
                            <InboundTaskEditor key={`${id}:${preset}`} value={inbound} onChange={setDraft} protocols={supportedProtocols} defaultAdvanced={preset === 'custom'} />
                            {saveError && <p role="alert" className="mt-3 text-sm text-ui-danger">{saveError}</p>}
                        </SettingsBox>
                    )}
                </fieldset>
                </ResourceEditorFrame>;
};

export { InboundModal };

export { errorOf, errorRaw };
