import { useEffect, useRef, useState } from 'react';
import { getInfo } from '@/api/settings';
import { getUpdateStatus } from '@/api/update';
import { getApiUrl } from '@/common/apiurl';
import type { Info } from '@/contract/settings';
import type { UpdateCheck, UpdateStatus } from '@/contract/update';

type PendingUpdate = { operationId?: string; expectedSha256?: string; requireReceipt?: boolean; target: string; previous: Pick<Info, 'version' | 'commit' | 'buildTime'>; startedAt: number };
export type RecoveryPhase = 'idle' | 'updating' | 'restarting' | 'complete' | 'recovered' | 'timeout' | 'error';
const storageKey = () => `yuhaiin:update-pending:${getApiUrl()}`;
function readPending(): PendingUpdate | undefined {
    try {
        const value = JSON.parse(sessionStorage.getItem(storageKey()) || 'null');
        if (value && typeof value.target === 'string' && typeof value.startedAt === 'number' && value.previous && typeof value.previous.version === 'string') return value;
    } catch { /* Storage can be unavailable; in-memory monitoring still works. */ }
}
function persist(value?: PendingUpdate) {
    try { if (value) sessionStorage.setItem(storageKey(), JSON.stringify(value)); else sessionStorage.removeItem(storageKey()); } catch { /* Optional persistence. */ }
}

/** An HTTP response or completed installer helper does not prove the new build is running. */
export function isInstalledUpdate(info: Info, pending: PendingUpdate): boolean {
    const normalize = (value: string) => value.trim().replace(/^v(?=\d)/, '').toLowerCase();
    const changed = info.version !== pending.previous.version || info.commit !== pending.previous.commit || info.buildTime !== pending.previous.buildTime;
    if (!changed) return false;
    const target = normalize(pending.target);
    if (normalize(info.version || '') === target) return true;
    const commit = target.match(/(?:^|-)([a-f\d]{7,40})$/)?.[1];
    if (commit && info.commit?.length >= 7 && (info.commit.startsWith(commit) || commit.startsWith(info.commit))) return true;
    return ['main', 'beta', 'stable', ''].includes(target);
}

export function useUpdateRecovery(onVerified: (info: Info) => void, enabled = true) {
    const [pending, setPending] = useState<PendingUpdate | undefined>(readPending);
    const [phase, setPhase] = useState<RecoveryPhase>(() => readPending() ? 'restarting' : 'idle');
    const [status, setStatus] = useState<UpdateStatus>();
    const [failure, setFailure] = useState('');
    const [attempt, setAttempt] = useState(0);
    const verified = useRef(onVerified);
    useEffect(() => { verified.current = onVerified; }, [onVerified]);
    useEffect(() => {
        if (!enabled) return;
        let stopped = false;
        let timer: ReturnType<typeof setTimeout> | undefined;
        let request: AbortController | undefined;
        let recoveryStartedAt: number | undefined;
        const poll = async () => {
            if (pending && recoveryStartedAt && Date.now() - recoveryStartedAt >= 5 * 60_000) { setPhase('timeout'); return; }
            request = new AbortController();
            const timeout = setTimeout(() => request?.abort(), 5000);
            let again = Boolean(pending);
            try {
                let next: UpdateStatus | undefined;
                try { next = await getUpdateStatus(request.signal); } catch { if (pending && !stopped) { recoveryStartedAt ??= Date.now(); setPhase('restarting'); } }
                if (stopped) return;
                if (next) {
                    setStatus(next);
                    if (pending?.requireReceipt && next.operation && next.operation.id !== pending.operationId) {
                        recoveryStartedAt ??= Date.now(); setPhase('restarting');
                    }
                    else if (next.error) {
                        setFailure(next.error); setPhase('error'); persist(); setPending(undefined); return;
                    }
                    if (next.running && (!pending?.requireReceipt || !next.operation || next.operation.id === pending.operationId)) {
                        recoveryStartedAt = undefined; setPhase('updating'); again = true;
                        if (!pending) {
                            const info = await getInfo(request.signal);
                            if (stopped) return;
                            const resumed = { operationId: next.operation?.id, expectedSha256: next.operation?.targetSha256, requireReceipt: Boolean(next.operation), target: '', previous: { version: info.version, commit: info.commit, buildTime: info.buildTime }, startedAt: Date.now() };
                            persist(resumed); setPending(resumed);
                        }
                    }
                    else if (!pending) { if (next.operation?.phase === 'recovered') { setFailure(''); setPhase('recovered'); } else setPhase(previous => previous === 'updating' ? 'idle' : previous); }
                    else if (pending) {
                        recoveryStartedAt ??= Date.now();
                        setPhase('restarting');
                    }
                }
                if (pending && !next?.running) {
                    const info = await getInfo(request.signal);
                    if (stopped) return;
                    const receipt = next?.operation;
                    if (pending.requireReceipt && receipt && receipt.id === pending.operationId && receipt.phase === 'recovered' && receipt.targetSha256 === pending.expectedSha256) {
                        persist(); setPending(undefined); setFailure(''); setPhase('recovered'); return;
                    }
                    const installed = pending.requireReceipt
                        ? Boolean(receipt && receipt.id === pending.operationId && receipt.phase === 'completed' && pending.expectedSha256 && receipt.targetSha256 === pending.expectedSha256)
                        : isInstalledUpdate(info, pending);
                    if (installed) {
                        persist(); setPending(undefined); setPhase('complete'); verified.current(info); return;
                    }
                    setPhase('restarting');
                }
            } catch { if (!stopped && pending) setPhase('restarting'); }
            finally {
                clearTimeout(timeout);
                if (!stopped && again) timer = setTimeout(() => void poll(), 1500);
            }
        };
        void poll();
        return () => { stopped = true; clearTimeout(timer); request?.abort(); };
    }, [pending, attempt, enabled]);
    return {
        phase, status, failure,
        active: enabled && (phase === 'updating' || phase === 'restarting'),
        beginTarget: (target: string, info: Info, operationId?: string, expectedSha256?: string, requireReceipt = false) => {
            const next = { target, operationId, expectedSha256, requireReceipt, previous: { version: info.version, commit: info.commit, buildTime: info.buildTime }, startedAt: Date.now() };
            persist(next); setPending(next); setFailure(''); setPhase('updating');
        },
        begin: (update: UpdateCheck, info: Info, operationId?: string) => {
            const next = { operationId, expectedSha256: update.assetSha256, requireReceipt: Boolean(update.recovery?.supported), target: update.targetVersion || update.targetTag, previous: { version: info.version, commit: info.commit, buildTime: info.buildTime }, startedAt: Date.now() };
            persist(next); setPending(next); setFailure(''); setPhase('updating');
        },
        fail: (message: string) => { persist(); setPending(undefined); setFailure(message); setPhase('error'); },
        retry: () => {
            const previous = pending || readPending();
            if (previous) { const next = { ...previous, startedAt: Date.now() }; persist(next); setPending(next); setPhase('restarting'); }
            setAttempt(value => value + 1);
        },
    };
}
