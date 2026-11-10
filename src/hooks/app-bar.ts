import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from 'react';

/**
 * Lets an open record put its Back action in the phone App Bar, where native
 * apps keep it, instead of spending a row of the detail on a Back button.
 *
 * The App Bar is the host. Without one (wide layouts, the standalone pages,
 * component tests) nothing is hosted and the detail shows its own button.
 */
export interface AppBarBack { label: string; run: () => void }

interface Entry extends AppBarBack { id: symbol }

let entries: Entry[] = [];
let hosts = 0;
let snapshot: { hosted: boolean; back?: AppBarBack } = { hosted: false };
const listeners = new Set<() => void>();

function publish() {
    // The most recently opened detail wins (a detail opened from a detail).
    const back = entries[entries.length - 1];
    snapshot = { hosted: hosts > 0, back };
    listeners.forEach(listener => listener());
}

const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const getSnapshot = () => snapshot;

/** Registers the Back action of an open detail. Returns true while the App Bar shows it. */
export function useAppBarBack(label: string, onBack: () => void): boolean {
    const action = useRef(onBack);
    useEffect(() => { action.current = onBack; }, [onBack]);
    useLayoutEffect(() => {
        const entry: Entry = { id: Symbol('back'), label, run: () => action.current() };
        entries = [...entries, entry];
        publish();
        return () => { entries = entries.filter(item => item.id !== entry.id); publish(); };
    }, [label]);
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot).hosted;
}

/** The App Bar: hosts Back actions while `active` and returns the current one. */
export function useAppBarBackHost(active: boolean): AppBarBack | undefined {
    useLayoutEffect(() => {
        if (!active) return;
        hosts += 1;
        publish();
        return () => { hosts -= 1; publish(); };
    }, [active]);
    const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return active ? state.back : undefined;
}
