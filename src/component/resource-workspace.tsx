import { WorkspaceDetail, WorkspaceDirectory, WorkspaceLayout, WorkspaceSelectionMarker } from './workspace-layout';
import { Button } from './v2/button';
import { Input } from './v2/input';
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from './v2/modal';
import { allowNavigation } from '@/hooks/navigation-guard';
import { clearHashSearch } from '@/hooks/useHashLocation';
import { useMediaQuery } from '@/hooks/use-media-query';
import clsx from 'clsx';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/** Selection survives directory filtering, pagination and server refreshes. */
export function useResourceSelection(ids: string[], linkedId?: string | null) {
    const [id, setId] = useState('');
    const [creating, setCreating] = useState(false);
    const initialized = useRef(false);
    const desktop = useMediaQuery('(min-width: 768px)');
    useEffect(() => {
        if (!initialized.current && desktop && ids.length && !linkedId && !creating) {
            initialized.current = true;
            setId(ids[0]);
        }
    }, [desktop, ids, linkedId, creating]);
    const update = (next: string, create = false) => {
        initialized.current = true;
        if (linkedId) clearHashSearch();
        setId(next); setCreating(create);
    };
    return {
        id: creating ? '' : linkedId || id,
        creating,
        select: (next: string) => { if (!creating && next === (linkedId || id)) return; if (allowNavigation()) update(next); },
        create: (onStart?: () => void) => { if (allowNavigation()) { update('', true); onStart?.(); } },
        saved: (next: string) => update(next),
        close: () => update(''),
    };
}

export interface ResourceDirectoryItem {
    id: string;
    name: string;
    description?: ReactNode;
    icon: ReactNode;
    status?: ReactNode;
}

/** Uniform directory/detail shell. Data fetching and forms stay with their owners. */
export function ResourceWorkspace({ title, description, items, selectedId, editing, onSelect, onCreate, children, actions, search, pagination, createDisabled = false, embedded = false }: {
    title: string;
    embedded?: boolean;
    createDisabled?: boolean;
    description?: ReactNode;
    items: ResourceDirectoryItem[];
    selectedId: string;
    editing: boolean;
    onSelect: (id: string) => void;
    onCreate: () => void;
    children: ReactNode;
    actions?: ReactNode;
    search?: { value: string; onChange: (query: string) => void };
    pagination?: { page: number; pageSize: number; total: number; onChange: (page: number) => void };
}) {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    const { t: commonT } = useTranslation('common');
    const Heading = embedded ? 'h2' : 'h1';
    const pages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize)) : 1;
    return <>
        <header className={clsx('mb-6 flex-wrap items-center justify-between gap-4', editing ? 'hidden md:flex' : 'flex')}>
            <div className="min-w-0"><Heading className={clsx("font-semibold tracking-tight text-ui-heading", embedded ? "text-base" : "sr-only text-2xl lg:not-sr-only")}>{title}</Heading>
                {description && <p className="mt-1 text-sm text-ui-muted">{description}</p>}</div>
            <div className="flex flex-wrap items-center gap-2">{actions}<Button variant="primary" onClick={onCreate} disabled={createDisabled} className="gap-1.5"><Plus size={16} aria-hidden="true" />{uiT('add')}</Button></div>
        </header>
        <WorkspaceLayout>
            <WorkspaceDirectory label={title} hiddenOnMobile={editing}>
                <div className="mb-2 space-y-3 border-b border-ui-border/50 px-1 pb-3">
                    <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold text-ui-heading">{title}</h2><span className="text-xs tabular-nums text-ui-muted">{pagination?.total ?? items.length}</span></div>
                    {search && <div className="relative"><Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ui-muted" aria-hidden="true" />
                        <Input type="search" aria-label={commonT('state.search')} placeholder={commonT('state.search')} value={search.value} onChange={event => search.onChange(event.target.value)} className="h-9 bg-ui-surface-muted/70 pl-9 text-xs" /></div>}
                </div>
                <ul className="m-0 max-h-[min(72vh,900px)] list-none space-y-1 overflow-y-auto overscroll-contain p-0">
                    {items.map(item => <li key={item.id}><button type="button" aria-label={item.name} aria-current={selectedId === item.id ? 'true' : undefined}
                        className={clsx('relative flex min-h-[52px] w-full min-w-0 items-center gap-2.5 rounded-ui-md px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus', selectedId === item.id ? 'bg-ui-primary-soft' : 'hover:bg-ui-surface-muted/75')}
                        onClick={() => onSelect(item.id)}>
                        {selectedId === item.id && <WorkspaceSelectionMarker />}
                        <span aria-hidden="true" className="shrink-0 text-ui-muted [&>svg]:size-4">{item.icon}</span>
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-ui-heading" title={item.name}>{item.name}</span>
                            {item.description && <span className="mt-1 block truncate text-xs text-ui-muted">{item.description}</span>}</span>{item.status}
                    </button></li>)}
                    {!items.length && <li className="px-3 py-8 text-center text-sm text-ui-muted">{uiT('noRecordsFound')}</li>}
                </ul>
                {pagination && pages > 1 && <div className="mt-3 flex items-center justify-between border-t border-ui-border/50 pt-3 text-xs text-ui-muted">
                    <Button variant="outline-secondary" size="icon" disabled={pagination.page <= 1} aria-label={t('previousPage')} onClick={() => pagination.onChange(pagination.page - 1)}><ChevronLeft size={16} /></Button>
                    <span className="tabular-nums">{pagination.page} / {pages}</span>
                    <Button variant="outline-secondary" size="icon" disabled={pagination.page >= pages} aria-label={t('nextPage')} onClick={() => pagination.onChange(pagination.page + 1)}><ChevronRight size={16} /></Button>
                </div>}
            </WorkspaceDirectory>
            <WorkspaceDetail hiddenOnMobile={!editing} transitionKey={selectedId || (editing ? 'new-resource' : 'empty')}>
                {editing ? children : <div className="flex min-h-80 flex-col items-center justify-center gap-3 p-6 text-center text-ui-muted"><h2 className="text-lg font-medium text-ui-heading">{t('selectResource')}</h2><p className="max-w-sm text-sm">{t('selectResourceHelp')}</p><Button variant="outline-primary" className="gap-2" onClick={onCreate}><Plus size={16} />{uiT('add')}</Button></div>}
            </WorkspaceDetail>
        </WorkspaceLayout>
    </>;
}

/** One frame for inline editors and their existing quick-create dialogs. */
export function ResourceEditorFrame({ title, label, presentation = 'modal', open, onClose, children, footer }: {
    title: ReactNode;
    label: string;
    presentation?: 'modal' | 'inline';
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    footer: ReactNode;
}) {
    const { t } = useTranslation('routing');
    if (presentation === 'inline') return <section aria-label={label} className="min-w-0">
        <header className="mb-4 space-y-3 border-b border-ui-border pb-4"><Button variant="outline-secondary" className="gap-2 md:hidden" onClick={onClose}><ArrowLeft size={16} />{t('backToDirectory')}</Button><h2 className="break-words text-xl font-semibold text-ui-heading">{title}</h2></header>
        <div className="min-w-0">{children}</div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ui-border/60 pt-5">{footer}</div>
    </section>;
    return <Modal open={open} onOpenChange={next => !next && onClose()}><ModalContent width={760}>
        <ModalHeader closeButton><ModalTitle>{title}</ModalTitle></ModalHeader><ModalBody>{children}</ModalBody><ModalFooter className="flex flex-wrap items-center justify-between gap-3">{footer}</ModalFooter>
    </ModalContent></Modal>;
}
