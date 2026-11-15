import { getNode, listNodeGroups, type NodeGroup } from '@/api/nodes';
import { NodeSelectionDialog } from '@/component/node-select';
import { Button } from '@/component/v2/button';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/component/v2/modal';
import type { ShareFeedEntry, ShareFeedEntryKind, ShareFeedPreview } from '@/contract/subscription';
import clsx from 'clsx';
import { AlertTriangle, ArrowDown, ArrowUp, Check, ChevronDown, Folder, Plus, Server, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { useSWRConfig } from 'swr';

const sameEntry = (a: ShareFeedEntry, b: ShareFeedEntry) => a.kind === b.kind && a.value === b.value;

export function toggleEntry(entries: ShareFeedEntry[], entry: ShareFeedEntry): ShareFeedEntry[] {
    return entries.some(item => sameEntry(item, entry)) ? entries.filter(item => !sameEntry(item, entry)) : [...entries, entry];
}

export function moveEntry(entries: ShareFeedEntry[], index: number, direction: -1 | 1): ShareFeedEntry[] {
    const target = index + direction;
    if (target < 0 || target >= entries.length) return entries;
    const next = [...entries];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
}

/** Ordered groups and nodes of a share feed, with what the server would publish. */
export function ShareEntriesEditor({ entries, onChange, preview, previewError, disabled }: {
    entries: ShareFeedEntry[];
    onChange: (entries: ShareFeedEntry[]) => void;
    preview?: ShareFeedPreview;
    previewError: boolean;
    disabled: boolean;
}) {
    const { t } = useTranslation('group');
    const { t: routingT } = useTranslation('routing');
    const [dialog, setDialog] = useState<ShareFeedEntryKind>();
    const { mutate } = useSWRConfig();
    const { data: groups } = useSWR('/api/v2/nodes/groups', listNodeGroups, { revalidateOnFocus: false });
    const missing = (entry: ShareFeedEntry) => preview?.missing.some(item => sameEntry(item, entry)) ?? false;
    return <div className="grid min-w-0 grid-cols-1 gap-3">
        {entries.length ? <ol className="m-0 list-none divide-y divide-ui-border p-0">
            {entries.map((entry, index) => <EntryRow key={`${entry.kind}:${entry.value}`} entry={entry} index={index} last={index === entries.length - 1}
                group={groups?.items.find(item => item.name === entry.value)} missing={missing(entry)} disabled={disabled}
                onMove={direction => onChange(moveEntry(entries, index, direction))} onRemove={() => onChange(entries.filter((_, i) => i !== index))} />)}
        </ol> : <p className="rounded-ui-md border border-dashed border-ui-border px-4 py-6 text-center text-sm text-ui-muted">{t('share.emptyEntries')}</p>}
        {!disabled && <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline-secondary" className="gap-2" onClick={() => setDialog('group')}><Folder size={16} aria-hidden="true" />{t('share.addGroup')}</Button>
            <Button type="button" variant="outline-secondary" className="gap-2" onClick={() => setDialog('node')}><Plus size={16} aria-hidden="true" />{t('share.addNode')}</Button>
        </div>}
        {entries.length > 0 && <PreviewSummary preview={preview} failed={previewError} />}
        <GroupDialog open={dialog === 'group'} groups={groups?.items} entries={entries} onClose={() => setDialog(undefined)}
            onToggle={name => onChange(toggleEntry(entries, { kind: 'group', value: name }))} />
        <NodeSelectionDialog open={dialog === 'node'} label={routingT('chooseNode')} value="" enabledOnly={false} disabled={disabled}
            multiple={entries.filter(entry => entry.kind === 'node').map(entry => entry.value)} onClose={() => setDialog(undefined)}
            onChange={node => {
                void mutate(['/api/v2/nodes/detail', node.id], node, { revalidate: false });
                onChange(toggleEntry(entries, { kind: 'node', value: node.id }));
            }} />
    </div>;
}

function EntryRow({ entry, index, last, group, missing, disabled, onMove, onRemove }: {
    entry: ShareFeedEntry; index: number; last: boolean; group?: NodeGroup; missing: boolean; disabled: boolean;
    onMove: (direction: -1 | 1) => void; onRemove: () => void;
}) {
    const { t } = useTranslation('group');
    const node = entry.kind === 'node';
    const { data } = useSWR(node ? ['/api/v2/nodes/detail', entry.value] : null, () => getNode(entry.value), { revalidateOnFocus: false, shouldRetryOnError: false });
    const name = node ? data?.name || entry.value : entry.value;
    const detail = missing ? t(node ? 'share.missingNode' : 'share.missingGroup')
        : node ? t('share.nodeEntry') : group ? t('share.groupEntry', { enabled: group.enabled, count: group.count }) : '';
    return <li className="flex min-h-12 max-w-full items-center gap-3 py-2 text-sm">
        <span className="w-5 shrink-0 text-xs tabular-nums text-ui-muted">{index + 1}</span>
        <span aria-hidden="true" className="shrink-0 text-ui-muted">{node ? <Server size={16} /> : <Folder size={16} />}</span>
        <span className="min-w-0 flex-1">
            <span className="block truncate text-ui-heading" title={name}>{name}</span>
            {detail && <span className={clsx('mt-0.5 flex items-center gap-1 text-xs', missing ? 'text-ui-warning' : 'text-ui-muted')}>{missing && <AlertTriangle size={12} aria-hidden="true" />}{detail}</span>}
        </span>
        {!disabled && <div className="flex shrink-0 gap-1">
            <Button type="button" size="icon" variant="ghost" disabled={index === 0} aria-label={`${t('share.moveUp')} ${name}`} onClick={() => onMove(-1)}><ArrowUp size={14} /></Button>
            <Button type="button" size="icon" variant="ghost" disabled={last} aria-label={`${t('share.moveDown')} ${name}`} onClick={() => onMove(1)}><ArrowDown size={14} /></Button>
            <Button type="button" size="icon" variant="ghost" aria-label={`${t('share.remove')} ${name}`} onClick={onRemove}><X size={14} /></Button>
        </div>}
    </li>;
}

function PreviewSummary({ preview, failed }: { preview?: ShareFeedPreview; failed: boolean }) {
    const { t } = useTranslation('group');
    if (failed) return <p role="alert" className="text-xs text-ui-danger">{t('share.previewFailed')}</p>;
    if (!preview) return null;
    return <div className="rounded-ui-md bg-ui-surface-muted/60 px-3 py-2 text-sm" aria-live="polite">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="font-medium text-ui-heading">{t('share.publishedCount', { count: preview.nodes.length })}</span>
        </div>
        {preview.skipped.length > 0 && <details className="group mt-1">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-xs text-ui-muted"><ChevronDown size={12} className="transition-transform group-open:rotate-180" aria-hidden="true" />{t('share.skippedCount', { count: preview.skipped.length })}</summary>
            <ul className="mt-1 list-none space-y-1 p-0 text-xs text-ui-muted">
                {preview.skipped.map((node, index) => <li key={`${node.id}-${index}`} className="break-words"><span className="text-ui-fg">{node.name || node.id}</span> — {t(`share.reason.${node.reason}`, { defaultValue: node.reason })}</li>)}
            </ul>
        </details>}
    </div>;
}

function GroupDialog({ open, groups, entries, onClose, onToggle }: {
    open: boolean; groups?: NodeGroup[]; entries: ShareFeedEntry[]; onClose: () => void; onToggle: (name: string) => void;
}) {
    const { t } = useTranslation('group');
    const { t: routingT } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    return <Modal open={open} onOpenChange={next => !next && onClose()}><ModalContent width={520}>
        <ModalHeader closeButton><ModalTitle>{t('share.chooseGroups')}</ModalTitle></ModalHeader>
        <ModalBody>
            {!groups ? <p role="status" className="text-sm text-ui-muted">{routingT('loading')}</p>
                : !groups.length ? <p className="text-sm text-ui-muted">{uiT('noRecordsFound')}</p>
                    : <div className="max-h-[min(50vh,420px)] overflow-y-auto overscroll-contain">
                        {groups.map(group => {
                            const selected = entries.some(entry => entry.kind === 'group' && entry.value === group.name);
                            return <button key={group.name} type="button" aria-pressed={selected} onClick={() => onToggle(group.name)}
                                className={clsx('flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-ui-md px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus',
                                    selected ? 'bg-ui-primary-soft text-ui-primary' : 'text-ui-heading hover:bg-ui-surface-muted')}>
                                <span className="min-w-0 truncate" title={group.name}>{group.name}</span>
                                <span className="flex shrink-0 items-center gap-2 text-xs tabular-nums text-ui-muted">{group.enabled}/{group.count}{selected && <Check size={16} className="text-ui-primary" aria-hidden="true" />}</span>
                            </button>;
                        })}
                    </div>}
        </ModalBody>
        <ModalFooter><Button variant="primary" onClick={onClose}>{uiT('close')}</Button></ModalFooter>
    </ModalContent></Modal>;
}
