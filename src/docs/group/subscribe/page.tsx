import { confirmAction } from '@/component/v2/confirmation';
import { ResourceEditorFrame, ResourceWorkspace, useResourceSelection } from '@/component/resource-workspace';
import { deleteSubscriptions, listSubscriptions, saveSubscriptions, updateSubscriptions } from '@/api/subscriptions';
import { Button } from '@/component/v2/button';
import { MainContainer } from '@/component/v2/card';
import { SettingInputVertical, SettingSelectVertical } from '@/component/v2/forms';
import { useClipboard } from '@/component/v2/clipboard';
import Loading from '@/component/v2/loading';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { normalizeLink, type Link } from '@/contract/subscription';
import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { Check, Copy, RefreshCw, Rss, Trash } from 'lucide-react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

const subscriptionTypes = ['reserve', 'trojan', 'vmess', 'shadowsocks', 'shadowsocksr'];
/** Keep credentials and long encoded configurations out of directory summaries. */
export function subscriptionSource(url: string) {
    try { const source = new URL(url); return ['http:', 'https:'].includes(source.protocol) ? source.hostname : source.protocol.replace(/:$/, ''); }
    catch { return '—'; }
}

function SubscriptionEditor({ item, creating, onClose, onSaved, onDeleted, refresh, existingNames }: {
    item?: Link; creating: boolean; onClose: () => void; onSaved: (item: Link) => void; existingNames: string[]; onDeleted: () => void; refresh: () => Promise<unknown>;
}) {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    const ctx = useContext(GlobalToastContext);
    const { value, setValue, dirty, commit } = useEditorDraft(creating ? 'new-subscription' : item?.name ?? '', item, () => normalizeLink(undefined));
    const [actionError, setActionError] = useState('');
    const { pending, run } = useAsyncAction(error => { const message = String((error as { msg?: string })?.msg ?? error); setActionError(message); ctx.Error(message); });
    const close = useCloseGuard(dirty, pending, onClose);
    const { copy, copied, manualCopyModal } = useClipboard({ usePromptAsFallback: true });
    const valid = Boolean(value.name.trim() && value.url.trim());
    const execute = (action: () => Promise<unknown>) => { setActionError(''); void run(action); };
    const save = () => {
        if (!valid || pending) return;
        if (creating && existingNames.includes(value.name.trim())) { setActionError(t('subscriptionNameConflict')); return; }
        execute(async () => {
            const next = normalizeLink({ ...value, name: value.name.trim(), url: value.url.trim() });
            await saveSubscriptions([next]);
            commit(next); onSaved(next); await refresh(); ctx.Info(uiT('save'));
        });
    };
    const update = () => {
        if (!item || dirty || pending) return;
        execute(async () => { await updateSubscriptions([item.name]); await refresh(); ctx.Info(uiT('update')); });
    };
    const remove = async () => {
        if (!item || pending || !await confirmAction(`${uiT('removeSubscription')} ${item.name}?`)) return;
        execute(async () => { await deleteSubscriptions([item.name]); onDeleted(); await refresh(); });
    };
    return <ResourceEditorFrame title={creating ? uiT('addSubscription') : value.name} label={t('subscriptionsTitle')} presentation="inline" open onClose={close}
        footer={<>
            <div>{!creating && <Button permission="nodes:write" variant="outline-danger" disabled={pending} className="gap-2" onClick={remove}><Trash size={16} />{uiT('delete')}</Button>}</div>
            <div className="flex flex-wrap justify-end gap-2"><Button disabled={pending} onClick={close}>{uiT('cancel')}</Button><Button permission="nodes:write" variant="primary" disabled={pending || !valid} className="gap-2" onClick={save}>{pending ? <Spinner size="sm" /> : <Check size={16} />}{uiT('save')}</Button></div>
        </>}>
        {manualCopyModal}
        <fieldset disabled={pending} className="min-w-0 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2"><SettingInputVertical label={uiT('name')} value={value.name} disabled={!creating} onChange={name => setValue(previous => ({ ...previous, name }))} />
                <SettingSelectVertical label={uiT('type')} value={value.type || 'reserve'} values={subscriptionTypes.map(type => [type === 'reserve' ? t('subscriptionAutoDetect') : type, type] as [string, string])} onChange={type => setValue(previous => ({ ...previous, type }))} /></div>
            <div className="rounded-ui-lg border border-ui-border p-4"><SettingInputVertical label={uiT('subscriptionUrl')} value={value.url} placeholder="https://example.com/sub/..." onChange={url => setValue(previous => ({ ...previous, url }))} />
                <Button variant="outline-secondary" className="gap-2" disabled={!value.url} onClick={() => copy(value.url)}><Copy size={15} />{copied ? t('subscriptionCopied') : t('copySubscription')}</Button></div>
            {!creating && <div className="flex flex-wrap items-center justify-between gap-3 rounded-ui-lg border border-ui-border bg-ui-surface-muted/50 p-4"><p className="max-w-md text-sm text-ui-muted">{dirty ? t('saveSubscriptionBeforeUpdate') : t('subscriptionUpdateHelp')}</p><Button permission="nodes:write" variant="outline-primary" className="gap-2" disabled={dirty || pending} onClick={update}><RefreshCw size={16} />{uiT('update')}</Button></div>}
        </fieldset>
        {actionError && <p role="alert" className="mt-3 break-words text-sm text-ui-danger">{actionError}</p>}
    </ResourceEditorFrame>;
}

export default function Subscribe() {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    const { data, error, isLoading, mutate } = useSWR('/api/v2/subscriptions', listSubscriptions, { revalidateOnFocus: false });
    const [query, setQuery] = useState('');
    const all = [...(data?.items ?? [])].sort((a, b) => a.name.localeCompare(b.name));
    const items = all.filter(item => `${item.name} ${subscriptionSource(item.url)} ${item.type}`.toLowerCase().includes(query.toLowerCase()));
    const selection = useResourceSelection(items.map(item => item.name));
    const selected = all.find(item => item.name === selection.id);
    if (error && !data) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>;
    if (isLoading && !data) return <Loading />;
    return <MainContainer><ResourceWorkspace title={t('subscriptionsTitle')} description={uiT('manageRemoteConfigurationLinks')}
        items={items.map(item => ({ id: item.name, name: item.name, description: subscriptionSource(item.url), icon: <Rss />, status: <span className="text-[0.625rem] uppercase text-ui-muted">{!item.type || item.type === 'reserve' ? t('subscriptionAutoDetect') : item.type}</span> }))}
        selectedId={selection.id} editing={selection.creating || Boolean(selected)} onSelect={selection.select} onCreate={() => selection.create()} createDisabled={selection.creating}
        search={{ value: query, onChange: setQuery }}>
        {(selection.creating || selected) && <SubscriptionEditor key={selection.creating ? 'new' : selection.id} item={selected} creating={selection.creating} onClose={selection.close}
            existingNames={all.map(item => item.name)} onSaved={next => {
                void mutate(previous => ({ items: [...(previous?.items ?? []).filter(item => item.name !== next.name), next] }), { revalidate: false });
                selection.saved(next.name);
            }} onDeleted={selection.close} refresh={() => mutate()} />}
    </ResourceWorkspace></MainContainer>;
}
