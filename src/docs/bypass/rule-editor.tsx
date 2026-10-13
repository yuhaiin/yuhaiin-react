import { applyRouteChanges, createRule, deleteRule, getRule, saveRule } from '@/api/route';
import Loading from '@/component/v2/loading';
import { Button } from '@/component/v2/button';
import { Spinner } from '@/component/v2/spinner';
import { GlobalToastContext } from '@/component/v2/toast';
import { createDefaultRuleDraft, type RuleDraft, type RuleItem } from '@/contract/route';
import { useAsyncAction, useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import { ArrowLeft, Save, Trash } from 'lucide-react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR, { useSWRConfig } from 'swr';
import { draftForSave } from './draft';
import { RuleDraftForm } from './draft-form';
import type { RuleEditorOptions } from './rule-form';

export function RuleEditor({ item, creating, initial, options, blocked = false, onSaved, onBack, onStateChange }: {
    item: Pick<RuleItem, 'id' | 'name'> | null;
    creating: boolean;
    initial?: RuleDraft;
    options: RuleEditorOptions;
    blocked?: boolean;
    onSaved: (draft: RuleDraft | null) => void;
    onBack: () => void;
    onStateChange: (state: { dirty: boolean; pending: boolean }) => void;
}) {
    const { t } = useTranslation('routing');
    const { t: uiT } = useTranslation('ui');
    const ctx = useContext(GlobalToastContext);
    const { mutate: refreshCache } = useSWRConfig();
    const [actionError, setActionError] = useState('');
    const [deleted, setDeleted] = useState(false);
    const { data, error, isLoading, mutate } = useSWR(!creating && item ? ['/api/v2/route/rules/detail', item.id] : null,
        () => getRule(item!.id), { revalidateOnFocus: false });
    const createDraft = useCallback(() => initial ?? createDefaultRuleDraft(), [initial]);
    const { value: draft, setValue: setDraft, dirty, commit } = useEditorDraft(creating ? 'new-rule' : item?.id ?? null, data, createDraft);
    const { pending, run } = useAsyncAction(error => {
        const message = error instanceof Error ? error.message : String((error as { msg?: string })?.msg ?? error);
        setActionError(message); ctx.Error(message); void refreshCache('/api/v2/route/activation');
    });
    const busy = pending || blocked;
    const back = useCloseGuard(dirty, busy, onBack);
    useEffect(() => { onStateChange({ dirty, pending: busy }); }, [dirty, busy, onStateChange]);
    const unavailable = !creating && (!data || Boolean(error) || isLoading);
    const save = () => {
        if (busy || unavailable || !draft.rule.name.trim()) return;
        void run(async () => {
            setActionError('');
            let saved = draft;
            if (!deleted && (dirty || creating && draft.rule.revision === 0)) {
                saved = creating && draft.rule.revision === 0 ? await createRule(draftForSave(draft)) : await saveRule(draft.rule.id, draftForSave(draft));
                commit(saved);
                await mutate(saved, { revalidate: false });
                void refreshCache('/api/v2/route/lists/options');
            }
            void refreshCache('/api/v2/route/activation');
            await applyRouteChanges();
            ctx.Info(deleted ? 'rule deleted' : 'rule applied');
            onSaved(deleted ? null : saved);
        });
    };
    const remove = () => {
        if (!item || busy || unavailable || deleted || !window.confirm(t('deleteRuleConfirm'))) return;
        void run(async () => {
            setActionError('');
            await deleteRule(item.id);
            setDeleted(true);
            commit(draft);
            void refreshCache('/api/v2/route/activation');
            await applyRouteChanges();
            ctx.Info('rule deleted');
            onSaved(null);
        });
    };
    const reset = () => {
        if (busy || !data || !dirty || !window.confirm(t('discardRuleChanges'))) return;
        commit(data);
        setActionError('');
    };
    return <section aria-label={t('ruleEditor')} className="min-w-0">
        <header className="mb-5 flex min-w-0 items-start justify-between gap-3 border-b border-ui-border/60 pb-5">
            <div className="min-w-0">
                <Button size="sm" variant="outline-secondary" className="mb-3 gap-2 border-transparent bg-transparent md:hidden" onClick={back}><ArrowLeft size={16} />{t('backToRules')}</Button>
                <p className="mb-1 text-xs font-medium text-ui-muted">{creating ? uiT('newRouteRule') : t('ruleEditor')}</p>
                <h2 className="break-words text-xl font-semibold tracking-tight text-ui-heading">{draft.rule.name || item?.name || uiT('newRouteRule')}</h2>
            </div>
            {dirty && <span role="status" className="mt-1 shrink-0 rounded-full bg-ui-warning-soft px-2.5 py-1 text-xs text-ui-warning">{t('unsavedChanges')}</span>}
        </header>
        <fieldset disabled={busy} className="min-w-0">
            {error && <Loading code={error.code} onRetry={() => void mutate()}>{error.msg}</Loading>}
            {isLoading && <Loading />}
            {actionError && <p role="alert" className="mb-4 text-sm text-ui-danger">{actionError}</p>}
            {!unavailable && !deleted && <RuleDraftForm value={draft} onChange={setDraft} options={options} />}
        </fieldset>
        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ui-border/60 pt-4">
            {item && !creating ? <Button variant="outline-danger" className="gap-2 border-transparent" disabled={busy || deleted || unavailable} onClick={remove}><Trash size={16} />{uiT('deleteRule')}</Button> : <Button disabled={busy} onClick={back}>{uiT('cancel')}</Button>}
            <div className="flex flex-wrap items-center gap-2">
                {!creating && dirty && <Button disabled={busy} onClick={reset}>{t('discardChanges')}</Button>}
                <Button variant="primary" className="gap-2" disabled={busy || unavailable || !draft.rule.name.trim()} onClick={save}>{pending ? <Spinner size="sm" /> : <Save size={16} />}{t(actionError && !dirty ? 'retryApply' : 'saveAndApply')}</Button>
            </div>
        </footer>
    </section>;
}
