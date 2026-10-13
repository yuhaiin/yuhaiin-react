import { NAVIGATION_ATTEMPT } from './navigation-guard';
import { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

/** Server refreshes may update pristine forms, but must never erase local edits. */
export function useEditorDraft<T>(key: string | null, server: T | undefined, create: () => T) {
    const [state, setState] = useState(() => {
        const value = server ?? create();
        return { key, value, baseline: value, source: server };
    });
    // Reconcile a different record or a pristine server refresh during render.
    // React immediately retries this component without committing a stale draft.
    const changedKey = state.key !== key;
    const pristine = JSON.stringify(state.value) === JSON.stringify(state.baseline);
    let current = state;
    if (changedKey || (pristine && server !== undefined && server !== state.source)) {
        const next = server ?? create();
        current = { key, value: next, baseline: next, source: server };
        setState(current);
    }
    const dirty = JSON.stringify(current.value) !== JSON.stringify(current.baseline);
    const value = current.value;
    const setValue = (next: SetStateAction<T>) => setState(previous => ({
        key, value: typeof next === 'function' ? (next as (value: T) => T)(previous.key === key ? previous.value : server ?? create()) : next,
        baseline: previous.key === key ? previous.baseline : server ?? create(),
        source: previous.key === key ? previous.source : server,
    }));
    const commit = (next: T) => setState({ key, value: next, baseline: next, source: server });
    return { value, setValue, dirty, commit };
}

export function useCloseGuard(dirty: boolean, pending: boolean, onClose: () => void) {
    const { t } = useTranslation('common');
    useEffect(() => {
        if (!dirty) return;
        const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
        window.addEventListener('beforeunload', beforeUnload);
        return () => window.removeEventListener('beforeunload', beforeUnload);
    }, [dirty]);
    useEffect(() => {
        if (!dirty && !pending) return;
        const guard = (event: Event) => {
            const attempt = event as CustomEvent<{ confirmed: boolean }>;
            if (pending) { attempt.preventDefault(); return; }
            if (!attempt.defaultPrevented && !attempt.detail.confirmed) {
                if (!window.confirm(t('form.discardChanges'))) attempt.preventDefault();
                else attempt.detail.confirmed = true;
            }
        };
        window.addEventListener(NAVIGATION_ATTEMPT, guard);
        return () => window.removeEventListener(NAVIGATION_ATTEMPT, guard);
    }, [dirty, pending, t]);
    return () => {
        if (!pending && (!dirty || window.confirm(t('form.discardChanges')))) onClose();
    };
}

/** Lock synchronously, including two activations before React commits. */
export function useAsyncAction(onError: (error: unknown) => void) {
    const locked = useRef(false);
    const mounted = useRef(true);
    const [pending, setPending] = useState(false);
    useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
    const run = useCallback(async (action: () => Promise<unknown>) => {
        if (locked.current) return;
        locked.current = true;
        setPending(true);
        try { await action(); }
        catch (error) { onError(error); }
        finally {
            locked.current = false;
            if (mounted.current) setPending(false);
        }
    }, [onError]);
    return { pending, run };
}
