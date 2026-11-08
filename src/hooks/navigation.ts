import { useSyncExternalStore } from 'react';
import { navigationBlocker } from './navigation-guard';
import { confirmAction } from '@/component/v2/confirmation';

/**
 * One owner for the browser history of the hash router.
 *
 * Every entry the app creates carries `EntryState` in `history.state`. Its
 * `index` gives the direction of a Back/Forward traversal, so a guarded
 * traversal is undone with `history.go(-delta)` instead of rewriting entries:
 * the stack stays exactly as the browser (or Android WebView) built it.
 *
 * - push: a new step the user can return from (open a detail, change page)
 * - replace: the same step in another form (auto-selection, saved draft, URL cleanup)
 * - back / forward: browser traversal; `approved` skips the unsaved-changes prompt
 *   when the caller already asked
 * - layers: same-URL entries that let Back close a modal
 */
export interface EntryState {
    yuhaiin: 1;
    /** Position in this tab's stack; only differences matter. */
    index: number;
    /** Location of the entry that pushed this one. */
    from?: string;
    /** Selected automatically, not by the user. */
    auto?: boolean;
    /** Detail explicitly closed; do not auto-select again. */
    closed?: boolean;
    /** Modal layer owning this entry. */
    layer?: string;
    /** Page load that created the entry (tests discard older ones). */
    session?: number;
}

export interface Snapshot { location: string; index: number; state: EntryState }

/** Path without trailing slash, query kept. `''` and `#` mean `/`. */
export function normalizeLocation(location: string) {
    const raw = location.replace(/^#/, '');
    const queryAt = raw.indexOf('?');
    const path = queryAt < 0 ? raw : raw.slice(0, queryAt);
    const search = queryAt < 0 ? '' : raw.slice(queryAt);
    return `${path.replace(/\/+$/, '') || '/'}${search === '?' ? '' : search}`;
}
const readLocation = () => normalizeLocation(window.location.hash || '/');
const urlFor = (location: string) => `${window.location.pathname}${window.location.search}#${location}`;
const isEntry = (state: unknown): state is EntryState =>
    typeof state === 'object' && state !== null && (state as EntryState).yuhaiin === 1 && Number.isInteger((state as EntryState).index);

type Expected = { kind: 'revert' | 'accept'; index: number; delta?: number; done?: () => void };
let session = 0;
/** Set only by the test reset: traversals into older sessions are stale. */
let staleBefore = 0;
let snapshot: Snapshot;
let expected: Expected | null = null;
/** Index the next approved traversal lands on; its guard was already answered. */
let approvedIndex: number | null = null;
let confirming = false;
const layers = new Set<string>();
/** A closed modal's Back waits one task: a navigation in the same tick wins. */
let pendingRelease: { id: string; timer: ReturnType<typeof setTimeout> } | null = null;
function cancelPendingRelease() {
    if (!pendingRelease) return;
    clearTimeout(pendingRelease.timer);
    pendingRelease = null;
}
const listeners = new Set<() => void>();
let installed = false;

/**
 * A Back started by the app lands asynchronously. A push or replace issued
 * before it lands waits for it, so the traversal cannot undo the new entry.
 */
let traversal: { queue: (() => void)[]; timer: ReturnType<typeof setTimeout> } | null = null;
function startTraversal() {
    if (traversal) return;
    traversal = { queue: [], timer: setTimeout(finishTraversal, 500) };
}
function finishTraversal() {
    if (!traversal) return;
    const { queue, timer } = traversal;
    clearTimeout(timer);
    traversal = null;
    queue.forEach(run => run());
}
function afterTraversal(run: () => void) {
    if (traversal) traversal.queue.push(run);
    else run();
}

function emit() { listeners.forEach(listener => listener()); }
function commit(location: string, state: EntryState) {
    snapshot = { location, index: state.index, state };
    emit();
}

function initialize() {
    const location = readLocation();
    let state = window.history.state;
    session = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    if (!isEntry(state)) state = { yuhaiin: 1, index: 0, session } satisfies EntryState;
    // A reload cannot restore a modal; keep the URL, drop the layer.
    if (state.layer) state = { ...state, layer: undefined };
    window.history.replaceState(state, '', urlFor(location));
    snapshot = { location, index: state.index, state };
}

async function onPopState(event: PopStateEvent) {
    try { await handlePop(event); }
    finally { finishTraversal(); }
}

async function handlePop(event: PopStateEvent) {
    const location = readLocation();
    const raw = event.state;
    if (isEntry(raw) && (raw.session ?? 0) < staleBefore) return;
    // Our own undo/redo traversals.
    if (expected && isEntry(raw) && raw.index === expected.index) {
        const { kind, done, delta } = expected;
        expected = null;
        if (kind === 'accept') land(location, raw, delta ?? 0);
        done?.();
        return;
    }
    // An entry without our state: a typed URL, `location.hash = …`, or history
    // from an older release. Treat it as a new step after the current one.
    if (!isEntry(raw)) {
        const state: EntryState = { yuhaiin: 1, index: snapshot.index + 1, from: snapshot.location, session };
        const block = location === snapshot.location ? undefined : navigationBlocker();
        if (!block) {
            window.history.replaceState(state, '', urlFor(location));
            commit(location, state);
            return;
        }
        // The traversal direction is unknown, so only this entry is rewritten.
        window.history.replaceState(snapshot.state, '', urlFor(snapshot.location));
        if (block.message && await confirmAction(block.message)) {
            window.history.replaceState(state, '', urlFor(location));
            commit(location, state);
        }
        return;
    }
    const delta = raw.index - snapshot.index;
    if (approvedIndex === raw.index) {
        approvedIndex = null;
        land(location, raw, delta);
        return;
    }
    approvedIndex = null;
    if (confirming) {
        // Back while the unsaved-changes dialog is open answers "stay".
        undo(delta);
        // Handled by ConfirmationHost; an event keeps this module free of its internals.
        window.dispatchEvent(new Event('yuhaiin:dismiss-confirmations'));
        return;
    }
    // Same URL (a modal layer): never guarded.
    const block = location === snapshot.location ? undefined : navigationBlocker();
    if (!block) { land(location, raw, delta); return; }
    // Undo first, so the URL and the mounted draft agree while the dialog is open.
    const reverted = undo(delta);
    if (!block.message) return;
    confirming = true;
    let accepted = false;
    try {
        const answer = confirmAction(block.message);
        // Browsers drop a traversal started while another is pending.
        await reverted;
        accepted = await answer;
    } finally { confirming = false; }
    if (accepted) {
        expected = { kind: 'accept', index: raw.index, delta };
        window.history.go(delta);
    }
}

/**
 * Accept a traversal. An entry of a modal that is no longer open (closed by a
 * page change, or lost by a reload) is passed over in the same direction.
 */
function land(location: string, raw: EntryState, delta: number) {
    commit(location, raw);
    if (!raw.layer || layers.has(raw.layer) || !delta) return;
    const step = delta > 0 ? 1 : -1;
    approvedIndex = raw.index + step;
    startTraversal();
    window.history.go(step);
}

/** Traverse back to the current entry; resolves once it has landed. */
function undo(delta: number): Promise<void> {
    if (!delta) return Promise.resolve();
    return new Promise(resolve => {
        const timer = setTimeout(() => { if (expected?.kind === 'revert') expected = null; resolve(); }, 1000);
        expected = { kind: 'revert', index: snapshot.index, done: () => { clearTimeout(timer); resolve(); } };
        window.history.go(-delta);
    });
}

const handlePopState = (event: PopStateEvent) => { void onPopState(event); };
function install() {
    if (installed) return;
    installed = true;
    initialize();
    window.addEventListener('popstate', handlePopState);
}

function subscribe(listener: () => void) {
    install();
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}
function getSnapshot() {
    install();
    // The URL was replaced outside the router (an older caller, or a test):
    // adopt it as the current step instead of rendering a stale location.
    if (!isEntry(window.history.state) && readLocation() !== snapshot.location) {
        const state: EntryState = { yuhaiin: 1, index: snapshot.index, from: snapshot.state.from, session };
        window.history.replaceState(state, '', urlFor(readLocation()));
        snapshot = { location: readLocation(), index: state.index, state };
    }
    return snapshot;
}

export const navigation = {
    get current(): Snapshot { return getSnapshot(); },
    subscribe,
    /** Add a step. `to` is a hash location (`/docs/group?node=a`). */
    push(to: string, extra: Partial<Omit<EntryState, 'yuhaiin' | 'index'>> = {}) {
        install();
        if (traversal) { afterTraversal(() => navigation.push(to, extra)); return; }
        cancelPendingRelease();
        const location = normalizeLocation(to);
        const state: EntryState = { yuhaiin: 1, index: snapshot.index + 1, from: snapshot.location, session, ...extra };
        window.history.pushState(state, '', urlFor(location));
        commit(location, state);
    },
    /** Change the current step without adding one. */
    replace(to: string, extra: Partial<Omit<EntryState, 'yuhaiin' | 'index' | 'from'>> = {}) {
        install();
        if (traversal) { afterTraversal(() => navigation.replace(to, extra)); return; }
        cancelPendingRelease();
        const location = normalizeLocation(to);
        const state: EntryState = { yuhaiin: 1, index: snapshot.index, from: snapshot.state.from, session, ...extra };
        window.history.replaceState(state, '', urlFor(location));
        commit(location, state);
    },
    /** Browser Back. `approved` when the caller already confirmed unsaved changes. */
    back({ approved = false } = {}) {
        install();
        if (approved) approvedIndex = snapshot.index - 1;
        startTraversal();
        window.history.back();
    },
    forward() { install(); window.history.forward(); },
    /** Whether Back stays inside this app's history. */
    canGoBack() { install(); return snapshot.index > 0; },
    /** Push a same-URL entry for a modal; Back pops it. Returns its index. */
    pushLayer(id: string) {
        install();
        layers.add(id);
        // Reopened in the same tick (React StrictMode re-runs effects): keep the entry.
        if (pendingRelease?.id === id && snapshot.state.layer === id) {
            cancelPendingRelease();
            return snapshot.index;
        }
        cancelPendingRelease();
        const state: EntryState = { yuhaiin: 1, index: snapshot.index + 1, from: snapshot.location, layer: id, session };
        window.history.pushState(state, '', urlFor(snapshot.location));
        commit(snapshot.location, state);
        return state.index;
    },
    /** The modal closed itself: drop its entry if it is still on top. */
    releaseLayer(id: string) {
        layers.delete(id);
        if (snapshot.state.layer !== id) return;
        cancelPendingRelease();
        pendingRelease = {
            id, timer: setTimeout(() => {
                pendingRelease = null;
                if (snapshot.state.layer === id && !layers.has(id)) navigation.back({ approved: true });
            }, 0),
        };
    },
};

export function useNavigationSnapshot(): Snapshot {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Test hook: forget module state so each test starts from `window.history`. */
export const RESET_NAVIGATION_EVENT = 'yuhaiin:reset-navigation';
if (typeof window !== 'undefined') window.addEventListener(RESET_NAVIGATION_EVENT, () => resetNavigationForTests());
export function resetNavigationForTests({ reload = false } = {}) {
    window.removeEventListener('popstate', handlePopState);
    cancelPendingRelease();
    if (traversal) clearTimeout(traversal.timer);
    traversal = null;
    expected = null; approvedIndex = null; confirming = false; layers.clear();
    installed = false; install();
    // A simulated reload keeps the stack usable; a reset between tests does not.
    if (!reload) staleBefore = session;
    emit();
}
