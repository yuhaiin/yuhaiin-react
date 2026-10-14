import { ResolverTestPanel } from './resolver-test-panel';
import { ResourceEditorFrame } from '@/component/resource-workspace';
import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { createResolver, getResolver, saveResolver } from '@/api/resolvers';
import { Button } from '@/component/v2/button';
import { SettingInputVertical, SettingSelectVertical } from '@/component/v2/forms';
import { GlobalToastContext } from '@/component/v2/toast';
import Loading from '@/component/v2/loading';
import { createDefaultResolver, normalizeResolver, type Resolver, type ResolverType } from '@/contract/resolver';
import { Check, Trash } from 'lucide-react';
import { useContext, useState, type FC } from 'react';
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
    presentation?: "modal" | "inline",
    onSaved?: (resolver: Resolver) => void
}> = ({ id, show, isNew, onHide, onDelete, onSaved, presentation = "modal" }) => {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');
    const [actionError, setActionError] = useState('');
    const [testing, setTesting] = useState(false);
    // Adjust only when the editing session changes; no post-commit reset effect.
    const [errorSession, setErrorSession] = useState({ show, id });
    if (errorSession.show !== show || errorSession.id !== id) {
        setErrorSession({ show, id });
        setActionError('');
    }

    const ctx = useContext(GlobalToastContext);
    const { mutate: refreshCaches } = useSWRConfig();
    const shouldFetch = show && id !== "" && !isNew;
    const { data, error, isLoading, mutate } = useSWR(
        shouldFetch ? `/api/v2/resolvers/${id}` : null,
        () => getResolver(id),
        { shouldRetryOnError: false, keepPreviousData: false, revalidateOnFocus: false },
    );

    const { value: draft, setValue: setDraft, dirty, commit } = useEditorDraft(show ? id : null, shouldFetch ? data : undefined, () => createDefaultResolver(id));
    const { pending: saving, run } = useAsyncAction(error => { const message = errorOf(error)?.msg ?? "Save failed"; setActionError(message); ctx.Error(message); });
    const close = useCloseGuard(show && dirty, saving || testing, () => onHide());

    const apiError = errorOf(error);
    const resolver = isNew ? draft : data ? draft : undefined;

    const handleSave = () => {
        if (!resolver || saving || testing || error || isLoading) return;
        const nextID = isNew ? resolver.id : id;
        setActionError('');
        const next = normalizeResolver({ ...resolver, id: nextID });
        void run(async () => {
            const saved = isNew ? await createResolver(next) : await saveResolver(next);
            ctx.Info("Save successful");
            await mutate(saved, { revalidate: false });
            commit(saved);
            onSaved?.(saved);
            await refreshCaches(key => typeof key === "string" && key.startsWith("/api/v2/resolvers"));
            if (presentation === "modal") onHide(true);
        });
    };

    return <ResourceEditorFrame title={resolver?.name || t("addResolver")} label={uiT("resolvers")} presentation={presentation} open={show} onClose={close}
        footer={<>
                    <div>
                        {onDelete && id !== 'bootstrap' && !isNew &&
                            <Button variant="outline-danger" disabled={saving || testing || isLoading || Boolean(error)} onClick={() => onDelete?.(id)}>
                                <Trash className="mr-2" size={16} />{uiT("delete")}</Button>
                        }
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button onClick={close} disabled={saving || testing}>{uiT("cancel")}</Button>
                        <Button loading={saving} variant="primary" disabled={saving || testing || !resolver || isLoading || Boolean(error)} onClick={handleSave}>
                            <Check className="mr-2" size={16} />{isNew ? uiT("add") : uiT("save")}
                        </Button>
                    </div>
                </>}>
                    <fieldset disabled={saving || testing} className="contents">
                    {apiError ?
                        <Loading code={apiError.code} onRetry={() => void mutate()}>{apiError.msg}</Loading> :
                        isLoading || !resolver ? <Loading /> :
                            <div className="min-w-0">
                                <ResolverEditor value={resolver} onChange={setDraft} />
                                {actionError && <p role="alert" className="text-sm text-ui-danger">{actionError}</p>}
                            </div>
                    }
                </fieldset>
                {resolver && !isLoading && !apiError && <ResolverTestPanel resolver={resolver} disabled={saving} onPendingChange={setTesting} />}
                </ResourceEditorFrame>
}

export const ResolverEditor: FC<{ value: Resolver, onChange: (x: Resolver) => void }> = ({ value, onChange }) => {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');

    const patch = (patchValue: Partial<Resolver>) => onChange(normalizeResolver({ ...value, ...patchValue }));
    const endpoint = resolverEndpointMeta(value.type);
    const hasTLSName = ["tcp", "doh", "dot", "doq", "doh3"].includes(value.type);

    return (
        <div className="grid gap-4">
            <div className="border-b border-ui-border pb-4">
                <div className="mb-3 text-sm font-semibold">{t("dnsResolver")}</div>
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

            <div className="border-b border-ui-border pb-4">
                <div className="mb-3 text-sm font-semibold">{uiT("endpoint")}</div>
                {value.type === "system" ? (
                    <div className="rounded-ui-md bg-ui-surface-muted px-3 py-2 text-sm text-ui-muted">{uiT("usesTheOperatingSystemResolver")}</div>
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
