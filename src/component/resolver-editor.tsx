import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { createResolver, getResolver, saveResolver } from '@/api/resolvers';
import { Button } from '@/component/v2/button';
import { SettingsBox } from '@/component/v2/card';
import { SettingInputVertical, SettingSelectVertical } from '@/component/v2/forms';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import Loading from '@/component/v2/loading';
import { createDefaultResolver, normalizeResolver, type Resolver, type ResolverType } from '@/contract/resolver';
import { Check, Network, Trash } from 'lucide-react';
import { useContext, useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { useSWRConfig } from 'swr';

const resolverTypes: ResolverType[] = ['udp', 'tcp', 'doh', 'dot', 'doq', 'doh3', 'system'];
function errorOf(error: unknown): { code: number; msg: string } | undefined {
    if (!error) return;
    return { code: Number((error as { code?: number })?.code ?? 500), msg: error instanceof Error ? error.message : String((error as { msg?: string })?.msg ?? error) };
}

export const ResolverModal: FC<{
    id: string,
    show: boolean,
    isNew?: boolean,
    onHide: (save?: boolean) => void,
    onDelete?: (id: string) => void,
    onSaved?: (resolver: Resolver) => void
}> = ({ id, show, isNew, onHide, onDelete, onSaved }) => {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');
    const [actionError, setActionError] = useState('');
    useEffect(() => { setActionError(''); }, [show, id]);

    const ctx = useContext(GlobalToastContext);
    const { mutate: refreshCaches } = useSWRConfig();
    const shouldFetch = show && id !== "" && !isNew;
    const { data, error, isLoading, mutate } = useSWR(
        shouldFetch ? `/api/v2/resolvers/${id}` : null,
        () => getResolver(id),
        { shouldRetryOnError: false, keepPreviousData: false, revalidateOnFocus: false },
    );

    const { value: draft, setValue: setDraft, dirty } = useEditorDraft(show ? id : null, shouldFetch ? data : undefined, () => createDefaultResolver(id));
    const { pending: saving, run } = useAsyncAction(error => { const message = errorOf(error)?.msg ?? "Save failed"; setActionError(message); ctx.Error(message); });
    const close = useCloseGuard(show && dirty, saving, () => onHide());

    const apiError = errorOf(error);
    const resolver = isNew ? draft : data ? draft : undefined;

    const handleSave = () => {
        if (!resolver || saving || error || isLoading) return;
        const nextID = isNew ? resolver.id : id;
        setActionError('');
        const next = normalizeResolver({ ...resolver, id: nextID });
        void run(async () => {
            const saved = isNew ? await createResolver(next) : await saveResolver(next);
            ctx.Info("Save successful");
            await mutate(saved, { revalidate: false });
            onSaved?.(saved);
            await refreshCaches(key => typeof key === "string" && key.startsWith("/api/v2/resolvers"));
            onHide(true);
        });
    };

    return (
        <Modal open={show} onOpenChange={(open) => !open && close()}>
            <ModalContent width={760}>
                <ModalHeader closeButton>
                    <ModalTitle className="flex items-center gap-2">
                        <Network size={18} />
                        {resolver?.name || t("addResolver")}
                    </ModalTitle>
                </ModalHeader>
                <ModalBody>
                    <fieldset disabled={saving} className="contents">
                    {apiError ?
                        <Loading code={apiError.code} onRetry={() => void mutate()}>{apiError.msg}</Loading> :
                        isLoading || !resolver ? <Loading /> :
                            <SettingsBox>
                                <ResolverEditor value={resolver} onChange={setDraft} />
                                {actionError && <p role="alert" className="text-sm text-ui-danger">{actionError}</p>}
                            </SettingsBox>
                    }
                </fieldset>
                </ModalBody>
                <ModalFooter className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        {onDelete && id !== 'bootstrap' && !isNew &&
                            <Button variant="outline-danger" onClick={() => { onHide(false); onDelete?.(id); }}>
                                <Trash className="mr-2" size={16} />{uiT("delete")}</Button>
                        }
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button onClick={close} disabled={saving}>{uiT("cancel")}</Button>
                        <Button disabled={saving || !resolver || isLoading || Boolean(error)} onClick={handleSave}>
                            {saving ? <Spinner size="sm" /> : <><Check className="mr-2" size={16} />{isNew ? "Create" : "Save"}</>}
                        </Button>
                    </div>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export const ResolverEditor: FC<{ value: Resolver, onChange: (x: Resolver) => void }> = ({ value, onChange }) => {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');

    const patch = (patchValue: Partial<Resolver>) => onChange(normalizeResolver({ ...value, ...patchValue }));
    const endpoint = resolverEndpointMeta(value.type);
    const hasTLSName = ["tcp", "doh", "dot", "doq", "doh3"].includes(value.type);

    return (
        <div className="grid gap-4">
            <div className="rounded-ui-lg border border-ui-border bg-ui-surface-muted p-4">
                <div className="mb-3 font-bold">{t("dnsResolver")}</div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <SettingInputVertical label={uiT("name")} value={value.name} onChange={(name) => patch({ name })} />
                    <SettingSelectVertical
                        label={uiT("type")}
                        value={value.type}
                        values={resolverTypes.map(type => [t(`dnsProtocol.${type}`), type] as [string, string])}
                        onChange={(type) => patch({ type: type as ResolverType, system: type === "system", host: type === "system" ? "system default" : value.type === "system" ? "" : value.host })}
                    />
                </div>
            </div>

            <div className="rounded-ui-lg border border-ui-border bg-ui-surface-muted p-4">
                <div className="mb-3 font-bold">{uiT("endpoint")}</div>
                {value.type === "system" ? (
                    <div className="rounded-ui-lg border border-dashed border-ui-border p-4 text-sm text-ui-muted">{uiT("usesTheOperatingSystemResolver")}</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <SettingInputVertical label={endpoint.label} value={value.host} onChange={(host) => patch({ host })} placeholder={endpoint.placeholder} />
                        <details className="md:col-span-2"><summary className="cursor-pointer text-sm font-medium">{t("advancedEditor")}</summary>
                        <SettingInputVertical label={uiT("subnet")} value={value.subnet ?? ""} onChange={(subnet) => patch({ subnet })} placeholder={uiT("optionalEcsSubnet")} />
                        {hasTLSName && <SettingInputVertical label={uiT("tlsServerName")} value={value.tlsServerName ?? ""} onChange={(tlsServerName) => patch({ tlsServerName })} placeholder="dns.example" />}
                        </details>
                    </div>
                )}
            </div>


        </div>
    )
}

function resolverEndpointMeta(type: ResolverType): { label: string; placeholder: string } {
    switch (type) {
        case "doh":
        case "doh3":
            return { label: "DoH URL", placeholder: "https://dns.example/dns-query" };
        case "dot":
            return { label: "DoT Address", placeholder: "dns.example:853" };
        case "doq":
            return { label: "DoQ Address", placeholder: "dns.example:853" };
        case "tcp":
            return { label: "TCP Address", placeholder: "8.8.8.8:53" };
        case "udp":
            return { label: "UDP Address", placeholder: "8.8.8.8:53" };
        case "system":
            return { label: "System Resolver", placeholder: "system default" };
    }
}
