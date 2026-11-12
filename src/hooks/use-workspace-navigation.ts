import { useCallback, useEffect, useMemo } from 'react';
import { allowNavigation } from './navigation-guard';
import { navigation, useNavigationSnapshot } from './navigation';
import { useMediaQuery } from './use-media-query';

/** `?new=<param>` marks a draft for that workspace; `?<param>=<id>` an open record. */
export const CREATE_PARAM = 'new';
const NONE: readonly string[] = [];

/** Set or remove query parameters on a hash location. */
export function withQuery(location: string, edit: (query: URLSearchParams) => void) {
    const at = location.indexOf('?');
    const path = at < 0 ? location : location.slice(0, at);
    const query = new URLSearchParams(at < 0 ? '' : location.slice(at + 1));
    edit(query);
    const search = query.toString();
    return search ? `${path}?${search}` : path;
}

/** The location a detail closes to: the same page without this workspace's selection. */
export function parentLocation(location: string, param: string, owns: readonly string[] = []) {
    return withQuery(location, query => {
        query.delete(param);
        owns.forEach(name => query.delete(name));
        if (query.get(CREATE_PARAM) === param) query.delete(CREATE_PARAM);
    });
}

export interface WorkspaceNavigation {
    /** Selected record, `''` when none. */
    id: string;
    /** A new record's draft is open. */
    creating: boolean;
    /** The user closed the detail; desktop does not auto-select again. */
    closed: boolean;
    /** Open a record as a new step (asks about unsaved changes). */
    open: (id: string) => Promise<boolean>;
    /** Open a new draft as a new step (asks about unsaved changes). */
    create: (onStart?: () => void) => Promise<boolean>;
    /** The draft was saved as `id`: same step, now showing the record. */
    saved: (id: string) => void;
    /**
     * Return to the list. Goes Back when the list is the previous entry, so a
     * later system Back does not reopen the detail; otherwise (deep link)
     * replaces the entry with the list. The caller has already confirmed
     * unsaved changes.
     */
    close: () => void;
}

/**
 * List/detail state kept in the URL, so Back/Forward, reload and deep links all
 * restore it. On desktop, `autoSelect` fills an empty detail pane by replacing
 * the entry, which never adds history.
 */
export function useWorkspaceNavigation(param: string, { autoSelect, autoSelectOnMobile = false, owns = NONE }: {
    autoSelect?: string;
    /** Also select `autoSelect` on narrow screens (pages without a mobile directory step). */
    autoSelectOnMobile?: boolean;
    /** Other query parameters of this workspace (e.g. a prefilled draft), dropped with the selection. */
    owns?: readonly string[];
} = {}): WorkspaceNavigation {
    const { location, state } = useNavigationSnapshot();
    const desktop = useMediaQuery('(min-width: 768px)');
    const query = useMemo(() => new URLSearchParams(location.includes('?') ? location.slice(location.indexOf('?') + 1) : ''), [location]);
    const creating = query.get(CREATE_PARAM) === param;
    const id = creating ? '' : query.get(param) ?? '';
    const closed = Boolean(state.closed);

    useEffect(() => {
        if (!(desktop || autoSelectOnMobile) || !autoSelect || id || creating || closed) return;
        navigation.replace(withQuery(navigation.current.location, next => next.set(param, autoSelect)), { auto: true });
    }, [desktop, autoSelectOnMobile, autoSelect, id, creating, closed, param]);

    const open = useCallback(async (next: string) => {
        const current = new URLSearchParams(navigation.current.location.split('?')[1] ?? '');
        if (current.get(param) === next && current.get(CREATE_PARAM) !== param) return false;
        if (!await allowNavigation()) return false;
        navigation.push(withQuery(navigation.current.location, query => {
            query.set(param, next);
            owns.forEach(name => query.delete(name));
            if (query.get(CREATE_PARAM) === param) query.delete(CREATE_PARAM);
        }));
        return true;
    }, [param, owns]);

    const create = useCallback(async (onStart?: () => void) => {
        if (!await allowNavigation()) return false;
        navigation.push(withQuery(navigation.current.location, query => { query.delete(param); owns.forEach(name => query.delete(name)); query.set(CREATE_PARAM, param); }));
        onStart?.();
        return true;
    }, [param, owns]);

    const saved = useCallback((next: string) => {
        navigation.replace(withQuery(navigation.current.location, query => {
            query.set(param, next);
            owns.forEach(name => query.delete(name));
            if (query.get(CREATE_PARAM) === param) query.delete(CREATE_PARAM);
        }));
    }, [param, owns]);

    const close = useCallback(() => {
        const { location, state } = navigation.current;
        const parent = parentLocation(location, param, owns);
        if (parent === location) return;
        if (state.from === parent && navigation.canGoBack()) navigation.back({ approved: true });
        else navigation.replace(parent, { closed: true });
    }, [param, owns]);

    return { id, creating, closed, open, create, saved, close };
}
