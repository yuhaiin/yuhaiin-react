import { confirmAction } from '@/component/v2/confirmation';
import { ResourceWorkspace, useResourceSelection } from '@/component/resource-workspace';
import { useHashSearch } from '@/hooks/useHashLocation';
import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { useServerPageClamp } from '@/hooks/use-pagination';
import { deleteInbound, getInboundConfig, listInboundStatuses, listInbounds, retryInbound, saveInboundConfig } from '@/api/inbounds';
import { Button } from '@/component/v2/button';
import { Card, CardBody, CardHeader, IconBox, MainContainer } from '@/component/v2/card';
import { SwitchCard } from '@/component/v2/forms';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import Loading from '@/component/v2/loading';
import { type InboundConfig, inboundListen, normalizeInboundConfig } from '@/contract/inbound';
import { DoorOpen, Save, Settings } from 'lucide-react';
import { type FC, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { InboundModal, errorOf } from './modal';
import { runtimeLabel } from './runtime';

const PAGE_SIZE = 12;

const InboundConfigCard: FC = () => {
    const { t: uiT } = useTranslation('ui');

    const ctx = useContext(GlobalToastContext);
    const { data, error, isLoading, mutate } = useSWR(
        "/api/v2/inbounds/config",
        getInboundConfig,
        { revalidateOnFocus: false },
    );
    const apiError = errorOf(error);

    const { value: draft, setValue: setDraft, commit, dirty } = useEditorDraft("inbound-config", data, normalizeInboundConfig);
    const { pending: saving, run } = useAsyncAction(error => ctx.Error(errorOf(error)?.msg ?? "Apply failed"));
    useCloseGuard(dirty, saving, () => undefined);

    const patch = (value: Partial<InboundConfig>) => {
        setDraft((prev) => normalizeInboundConfig({ ...prev, ...value }));
    };

    const handleSave = () => {
        if (!data || saving || error || isLoading) return;
        void run(async () => {
            const saved = await saveInboundConfig(draft);
            commit(saved);
            await mutate(saved, { revalidate: false });
            ctx.Info("Apply successful");
        });
    };

    return (
        <Card className="mb-4">
            <fieldset disabled={saving} className="contents">
            <CardHeader>
                <IconBox icon={Settings} tone="neutral" title={uiT("inboundConfiguration")} description={uiT("dnsInterceptionAndTrafficInspection")} />
                <Button disabled={saving || isLoading || !data || Boolean(apiError)} onClick={handleSave}>
                    {saving ? <Spinner size="sm" /> : <><Save className="mr-1" size={16} /> {uiT("applySettings")}</>}
                </Button>
            </CardHeader>
            <CardBody>
                {apiError ? (
                    <Loading code={apiError.code} onRetry={() => void mutate()}>{apiError.msg}</Loading>
                ) : (
                    <div className="grid gap-3 md:grid-cols-3">
                        <SwitchCard
                            label={uiT("dnsHijack")}
                            description={uiT("interceptDnsRequestsFromInboundTraffic")}
                            checked={draft.hijackDns}
                            onCheckedChange={(hijackDns) => patch({ hijackDns })}
                            disabled={isLoading}
                        />
                        <SwitchCard
                            label={uiT("fakedns")}
                            description={uiT("useFakeipResponsesForHijackedDnsRequests")}
                            checked={draft.hijackDnsFakeIp}
                            onCheckedChange={(hijackDnsFakeIp) => patch({ hijackDnsFakeIp })}
                            disabled={isLoading}
                        />
                        <SwitchCard
                            label={uiT("trafficSniffing")}
                            description={uiT("inferDestinationMetadataFromAcceptedConnections")}
                            checked={draft.sniff}
                            onCheckedChange={(sniff) => patch({ sniff })}
                            disabled={isLoading}
                        />
                    </div>
                )}
            </CardBody>
            </fieldset>
        </Card>
    );
};

export default function InboundComponent() {
    const { t: uiT } = useTranslation('ui');
    const { t } = useTranslation('routing');
    const ctx = useContext(GlobalToastContext);
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [newId, setNewId] = useState('');
    const search = useHashSearch();
    const { data, error, isLoading, mutate } = useSWR(['/api/v2/inbounds', page, query], () => listInbounds({ page, pageSize: PAGE_SIZE, query }), { keepPreviousData: true });
    useServerPageClamp(data?.page, page, setPage);
    const items = data?.items ?? [];
    const selection = useResourceSelection(items.map(item => item.id), new URLSearchParams(search).get('inbound'));
    const { data: statuses = [], error: statusError, mutate: refreshStatuses } = useSWR('/api/v2/inbounds/status', listInboundStatuses, { refreshInterval: 3000 });
    const statusById = useMemo(() => new Map(statuses.map(item => [item.id, item])), [statuses]);
    const { pending, run } = useAsyncAction(error => ctx.Error(errorOf(error)?.msg ?? 'Operation failed'));
    useCloseGuard(false, pending, () => undefined);
    const id = selection.creating ? newId : selection.id;
    const create = () => selection.create(() => setNewId(crypto.randomUUID()));
    const remove = async () => {
        if (!await confirmAction(uiT('areYouSureToDelete'))) return;
        void run(async () => { await deleteInbound(id); selection.close(); await Promise.all([mutate(), refreshStatuses()]); });
    };
    if (error && !data) return <Loading onRetry={() => void mutate()}>{errorOf(error)?.msg}</Loading>;
    if (isLoading && !data) return <Loading />;
    return <MainContainer className="max-w-[1440px]">
        {statusError && <p role="alert" className="mb-4 text-sm text-ui-danger">{uiT('runtimeStatusIsNotAvailableYet')} <Button size="sm" onClick={() => void refreshStatuses()}>{uiT('retry')}</Button></p>}
        <ResourceWorkspace createDisabled={selection.creating} title={uiT('entryPoints')} description={t('entryTaskHelp')} selectedId={selection.id} editing={selection.creating || Boolean(selection.id)}
            onSelect={selection.select} onCreate={create} search={{ value: query, onChange: value => { setQuery(value); setPage(1); } }}
            pagination={{ page: data?.page.page || page, pageSize: PAGE_SIZE, total: data?.page.total ?? 0, onChange: setPage }}
            items={items.map(item => ({ id: item.id, name: item.name || item.id, icon: <DoorOpen />, description: `${item.protocol.type} · ${inboundListen(item) || '—'}`, status: <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.enabled ? 'bg-ui-success' : 'bg-ui-muted'}`} title={runtimeLabel(statusById.get(item.id)?.status ?? 'unknown')} /> }))}>
            <fieldset disabled={pending} className="min-w-0" aria-busy={pending}>
                <InboundModal presentation="inline" show={Boolean(id)} id={id} isNew={selection.creating} onHide={selection.close} onDelete={remove}
                    onSaved={value => { selection.saved(value.id); void mutate(); void refreshStatuses(); }} runtime={statusById.get(id)}
                    onRetry={() => void run(async () => { await retryInbound(id); await refreshStatuses(); })} retrying={pending} />
            </fieldset>
        </ResourceWorkspace>
        <details className="mt-8"><summary className="cursor-pointer text-sm font-semibold text-ui-heading">{uiT('inboundConfiguration')}</summary><div className="mt-4"><InboundConfigCard /></div></details>
    </MainContainer>;
}
