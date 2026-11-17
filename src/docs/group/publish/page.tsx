import { createShareFeed, deleteShareFeed, getShareFeedToken, listShareFeeds, previewShareFeed, rotateShareFeed, shareFeedsKey, updateShareFeed } from '@/api/subscriptions';
import { isSecretPlaceholder } from '@/auth/secret-fields';
import { can, getSession } from '@/auth/session';
import { apiURL } from '@/auth/transport';
import { EditorDeleteButton, ResourceEditorFrame, ResourceWorkspace, editorActionsClass, useResourceSelection } from '@/component/resource-workspace';
import { Badge } from '@/component/v2/badge';
import { Button } from '@/component/v2/button';
import { MainContainer } from '@/component/v2/card';
import { useClipboard } from '@/component/v2/clipboard';
import { confirmAction } from '@/component/v2/confirmation';
import { FormSection } from '@/component/v2/form-section';
import { SettingInputVertical } from '@/component/v2/forms';
import { Input } from '@/component/v2/input';
import Loading from '@/component/v2/loading';
import { SwitchCard } from '@/component/v2/switch';
import { GlobalToastContext } from '@/component/v2/toast';
import { defaultShareFeed, shareFeedURL, type ShareFeed, type ShareFeedList } from '@/contract/subscription';
import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { Check, ChevronDown, Copy, RefreshCw, Share2 } from 'lucide-react';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { useDebounceValue } from 'usehooks-ts';
import { ShareEntriesEditor } from './share-entries';

const errorMessage = (error: unknown) => String((error as { msg?: string })?.msg ?? error);

/** Where subscribers reach this instance when the feed sets no base URL. */
export function defaultShareBase() {
    try { return apiURL('/').origin; } catch { return window.location.origin; }
}

function relativeTime(seconds: number, language: string) {
    const delta = Math.round(seconds - Date.now() / 1000);
    const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [['day', 86400], ['hour', 3600], ['minute', 60]];
    const format = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
    for (const [unit, size] of units) if (Math.abs(delta) >= size) return format.format(Math.round(delta / size), unit);
    return format.format(0, 'minute');
}

function ShareLinkPanel({ feed, onChanged }: { feed: ShareFeed; onChanged: (feed: ShareFeed) => void }) {
    const { t } = useTranslation('group');
    const ctx = useContext(GlobalToastContext);
    const { copy, copied, manualCopyModal } = useClipboard({ usePromptAsFallback: true });
    const { pending, run } = useAsyncAction(error => ctx.Error(errorMessage(error)));
    const base = feed.baseUrl || defaultShareBase();
    const masked = isSecretPlaceholder(feed.token);
    const readable = !masked || getSession()?.principal.credentialType === 'local' || can('secrets:read');
    const link = masked ? `${base.replace(/\/+$/, '')}/share/${'•'.repeat(12)}` : shareFeedURL(base, feed.token);
    const copyLink = () => void run(async () => {
        const token = masked ? await getShareFeedToken(feed.id) : feed.token;
        await copy(shareFeedURL(base, token));
    });
    const rotate = async () => {
        if (pending || !await confirmAction(t('share.rotateConfirm'))) return;
        void run(async () => { onChanged(await rotateShareFeed(feed.id)); ctx.Info(t('share.rotated')); });
    };
    return <div className="grid min-w-0 grid-cols-1 gap-3">
        {manualCopyModal}
        {feed.token ? <>
            <div className="flex min-w-0 gap-2 max-sm:flex-col">
                <Input readOnly aria-label={t('share.link')} value={link} className="min-w-0 flex-1 font-mono text-xs" onFocus={event => event.currentTarget.select()} />
                <Button variant="primary" className="shrink-0 gap-2" disabled={pending || !readable} onClick={copyLink}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? t('share.copied') : t('share.copy')}</Button>
            </div>
            {!readable && <p className="text-xs text-ui-muted">{t('share.copyNeedsSecrets')}</p>}
            <p className="text-xs leading-relaxed text-ui-muted">{t('share.linkHelp')}</p>
        </> : <p className="rounded-ui-md border border-ui-warning/40 bg-ui-warning-soft px-3 py-2 text-sm text-ui-warning">{t('share.noToken')}</p>}
        <div><Button permission="nodes:write" variant="outline-secondary" size="sm" className="gap-2" disabled={pending} onClick={() => void rotate()}><RefreshCw size={14} />{t('share.rotate')}</Button></div>
    </div>;
}

function ShareFeedEditor({ item, creating, onClose, onSaved, onDeleted }: {
    item?: ShareFeed; creating: boolean; onClose: () => void; onSaved: (feed: ShareFeed) => void; onDeleted: () => void;
}) {
    const { t, i18n } = useTranslation('group');
    const { t: uiT } = useTranslation('ui');
    const ctx = useContext(GlobalToastContext);
    const { value, setValue, dirty, commit } = useEditorDraft(creating ? 'new-share-feed' : item?.id ?? '', item, defaultShareFeed);
    const [actionError, setActionError] = useState('');
    const { pending, run } = useAsyncAction(error => { const message = errorMessage(error); setActionError(message); ctx.Error(message); });
    const close = useCloseGuard(dirty, pending, onClose);
    const [entriesKey] = useDebounceValue(JSON.stringify(value.entries), 300);
    const { data: preview, error: previewError } = useSWR(['/api/v2/share-feeds/preview', entriesKey], ([, key]) => previewShareFeed(JSON.parse(key)), { revalidateOnFocus: false, keepPreviousData: true });
    const origin = defaultShareBase();
    const insecure = /^http:\/\//i.test(value.baseUrl || origin) && !/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(value.baseUrl || origin);
    const valid = Boolean(value.name.trim());
    const save = () => {
        if (pending) return;
        if (!valid) { setActionError(t('share.nameRequired')); return; }
        setActionError('');
        void run(async () => {
            const next = { ...value, name: value.name.trim(), baseUrl: value.baseUrl.trim() };
            const saved = creating ? await createShareFeed(next) : await updateShareFeed(next);
            commit(saved); onSaved(saved); ctx.Info(uiT('save'));
        });
    };
    const remove = async () => {
        if (!item || pending || !await confirmAction(t('share.deleteConfirm', { name: item.name }))) return;
        void run(async () => { await deleteShareFeed(item.id); onDeleted(); });
    };
    return <ResourceEditorFrame title={creating ? t('share.newFeed') : item?.name || value.name} label={t('share.title')} presentation="inline" open onClose={close}
        footer={<>
            <div>{!creating && <EditorDeleteButton permission="nodes:write" label={uiT('delete')} disabled={pending} onClick={() => void remove()} />}</div>
            <div className={editorActionsClass}>
                <Button disabled={pending} onClick={close}>{uiT('cancel')}</Button>
                <Button permission="nodes:write" variant="primary" loading={pending} disabled={pending} className="gap-2" onClick={save}><Check size={16} />{uiT('save')}</Button>
            </div>
        </>}>
        <fieldset disabled={pending} className="min-w-0 flex flex-col gap-4">
            <FormSection title={t('share.general')}>
                <div className="grid min-w-0 max-w-2xl grid-cols-1 gap-3">
                    <SettingInputVertical label={t('share.name')} value={value.name} placeholder={t('share.namePlaceholder')} onChange={name => setValue(previous => ({ ...previous, name }))} />
                    <SwitchCard label={t('share.enabled')} description={t('share.enabledHelp')} checked={value.enabled} onCheckedChange={enabled => setValue(previous => ({ ...previous, enabled }))} />
                </div>
            </FormSection>
            <FormSection title={t('share.link')}>
                <div className="grid min-w-0 max-w-2xl grid-cols-1 gap-3">
                    {creating || !item ? <p className="text-sm text-ui-muted">{t('share.linkAfterSave')}</p> : <ShareLinkPanel feed={{ ...item, baseUrl: value.baseUrl }} onChanged={next => { onSaved(next); }} />}
                    <details className="group rounded-ui-md border border-ui-border px-3 py-2" open={Boolean(value.baseUrl) || undefined}>
                        <summary className="flex cursor-pointer list-none items-center gap-1 text-sm text-ui-heading"><ChevronDown size={14} className="transition-transform group-open:rotate-180" aria-hidden="true" />{t('share.advanced')}</summary>
                        <div className="mt-3">
                            <SettingInputVertical label={t('share.baseUrl')} value={value.baseUrl} placeholder={origin} onChange={baseUrl => setValue(previous => ({ ...previous, baseUrl }))} />
                            <p className="text-xs text-ui-muted">{t('share.baseUrlHelp', { origin })}</p>
                        </div>
                    </details>
                    {insecure && <p role="note" className="text-xs text-ui-warning">{t('share.httpWarning')}</p>}
                </div>
            </FormSection>
            <FormSection title={t('share.content')} description={t('share.contentHelp')}>
                <ShareEntriesEditor entries={value.entries} disabled={pending} preview={preview} previewError={Boolean(previewError)}
                    onChange={entries => setValue(previous => ({ ...previous, entries }))} />
            </FormSection>
            {!creating && item && <FormSection title={t('share.access')}>
                <p className="text-sm text-ui-muted">{item.lastAccess ? t('share.lastFetched', { time: relativeTime(item.lastAccess, i18n.language), count: item.accessCount }) : t('share.neverFetched')}</p>
            </FormSection>}
        </fieldset>
        {actionError && <p role="alert" className="mt-3 break-words text-sm text-ui-danger">{actionError}</p>}
    </ResourceEditorFrame>;
}

export function shareFeedSummary(feed: ShareFeed, t: (key: string, options: Record<string, unknown>) => string) {
    const groups = feed.entries.filter(entry => entry.kind === 'group').length;
    return t('share.summary', { groups, nodes: feed.entries.length - groups });
}

export default function SharePage() {
    const { t } = useTranslation('group');
    const { data, error, isLoading, mutate } = useSWR(shareFeedsKey, listShareFeeds, { revalidateOnFocus: false });
    const [query, setQuery] = useState('');
    const all = data?.items ?? [];
    const items = all.filter(item => item.name.toLowerCase().includes(query.trim().toLowerCase()));
    const selection = useResourceSelection(items.map(item => item.id), 'publish');
    const selected = all.find(item => item.id === selection.id);
    if (error && !data) return <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>;
    if (isLoading && !data) return <Loading />;
    const replace = (feed: ShareFeed) => void mutate((previous?: ShareFeedList) => ({ items: [...(previous?.items ?? []).filter(item => item.id !== feed.id), feed].sort((a, b) => a.name.localeCompare(b.name)) }), { revalidate: true });
    return <MainContainer className="max-w-[1440px]">
        <ResourceWorkspace title={t('share.title')} description={t('share.description')} selectedId={selection.id} editing={selection.creating || Boolean(selected)}
            onSelect={selection.select} onCreate={() => selection.create()} createDisabled={selection.creating} search={{ value: query, onChange: setQuery }}
            items={items.map(item => ({
                id: item.id, name: item.name, icon: <Share2 />, description: shareFeedSummary(item, t),
                status: !item.enabled ? <Badge variant="muted">{t('share.disabled')}</Badge> : !item.token ? <Badge variant="warning">{t('share.noLink')}</Badge> : undefined,
            }))}>
            {(selection.creating || selected) && <ShareFeedEditor key={selection.creating ? 'new' : selection.id} item={selection.creating ? undefined : selected} creating={selection.creating}
                onClose={selection.close} onDeleted={() => { selection.close(); void mutate(); }}
                onSaved={feed => { replace(feed); selection.saved(feed.id); }} />}
        </ResourceWorkspace>
    </MainContainer>;
}
