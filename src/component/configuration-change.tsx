import { changeAPI, type ConfigurationChange, type StageRequest } from '@/api/configuration-changes';
import { authAPI } from '@/auth/api';
import { useSession } from '@/auth/context';
import { authScope, updatePrincipal, type Principal } from '@/auth/session';
import { Button } from '@/component/v2/button';
import { confirmAction } from '@/component/v2/confirmation';
import { Modal, ModalBody, ModalContent, ModalHeader, ModalTitle } from '@/component/v2/modal';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

interface Difference { path: string; before: unknown; after: unknown }
export function configurationDiff(before: unknown, after: unknown, path = ''): Difference[] {
    if (JSON.stringify(before) === JSON.stringify(after)) return [];
    if (before && after && typeof before === 'object' && typeof after === 'object' && !Array.isArray(before) && !Array.isArray(after)) {
        const old = before as Record<string, unknown>; const next = after as Record<string, unknown>;
        return [...new Set([...Object.keys(old), ...Object.keys(next)])].flatMap(key => configurationDiff(old[key], next[key], path ? `${path}.${key}` : key));
    }
    return [{ path: path || '/', before, after }];
}
const display = (value: unknown) => value === undefined ? '—' : typeof value === 'string' ? value : JSON.stringify(value, null, 2);
export function ConfigurationDiff({ change }: { change: ConfigurationChange }) {
    const { t } = useTranslation('auth');
    const differences = change.diff ? configurationDiff(change.diff.before, change.diff.after) : [];
    return <section aria-label={t('changes.diff')} className="min-w-0 space-y-3">
        <p className="break-all text-xs text-ui-muted">{t(`changes.kinds.${change.kind}`)} · {change.resourceId} · {change.revision}</p>
        <p className="break-all text-xs text-ui-muted">{t('changes.actor')}: {change.committedBy || change.createdBy} · {new Date(change.committedAt || change.createdAt).toLocaleString()}</p>
        {change.rollbackOf && <p className="break-all text-xs text-ui-muted">{t('changes.rollbackOf')}: {change.rollbackOf}</p>}
        <p className="text-sm text-ui-muted">{t('changes.scopeHelp')}</p>
        <div className="max-h-96 space-y-3 overflow-auto">{differences.map(item => <div key={item.path} className="min-w-0 rounded-ui-sm border border-ui-border p-3">
            <h4 className="break-all text-xs font-medium">{item.path}</h4><div className="mt-2 grid min-w-0 gap-3 sm:grid-cols-2">
                <div className="min-w-0"><p className="text-xs text-ui-muted">{t('changes.before')}</p><pre className="whitespace-pre-wrap break-all text-xs">{display(item.before)}</pre></div>
                <div className="min-w-0"><p className="text-xs text-ui-muted">{t('changes.after')}</p><pre className="whitespace-pre-wrap break-all text-xs">{display(item.after)}</pre></div>
            </div></div>)}</div>
        {!differences.length && <p className="text-sm text-ui-muted">{t('changes.noDifference')}</p>}
    </section>;
}

export function ChangeReview({ initial, writable, rollback, onChanged }: { initial: ConfigurationChange; writable: boolean; rollback: boolean; onChanged: (change?: ConfigurationChange) => void | Promise<void> }) {
    const { t } = useTranslation('auth'); const scope = authScope(); const { mutate } = useSWRConfig();
    const [change, setChange] = useState(initial); const [busy, setBusy] = useState(false); const [valid, setValid] = useState(false); const [error, setError] = useState('');
    const request = useRef<AbortController | undefined>(undefined);
    useEffect(() => () => request.current?.abort(), [scope]);
    const run = async (operation: 'validate' | 'commit' | 'rollback' | 'discard') => {
        if (busy || !writable || scope !== authScope()) return;
        if (operation === 'rollback' && !rollback || operation === 'commit' && !valid) return;
        if ((operation === 'commit' || operation === 'discard') && !await confirmAction(t(`changes.${operation}Confirm`))) return;
        if (scope !== authScope()) return;
        const controller = new AbortController(); request.current = controller; setBusy(true); setError('');
        try {
            if (operation === 'validate') {
                const result = await changeAPI.validate(change, controller.signal);
                if (!controller.signal.aborted && scope === authScope()) setValid(result.valid);
                return;
            }
            const next = operation === 'discard' ? (await changeAPI.discard(change, controller.signal), undefined) : await changeAPI[operation](change, controller.signal);
            if (controller.signal.aborted || scope !== authScope()) return;
            setValid(false); if (next) setChange(next);
            // Permission edits can change this browser's authority immediately.
            if (operation === 'commit') {
                try { const principal = await authAPI<Principal>('GET', '/me', undefined, controller.signal); if (!controller.signal.aborted && scope === authScope()) updatePrincipal(principal); } catch { /* Transport handles revoked sessions. */ }
            }
            if (controller.signal.aborted || scope !== authScope()) return;
            await mutate(key => Array.isArray(key) && key[0] === scope && key[1] === 'configuration-changes');
            await onChanged(next);
        } catch (cause) {
            if (!controller.signal.aborted && scope === authScope()) { setValid(false); setError(t(cause && typeof cause === 'object' && 'code' in cause && cause.code === 409 ? 'changes.conflict' : 'requestFailed')); }
        } finally { if (!controller.signal.aborted && scope === authScope()) setBusy(false); }
    };
    return <div className="min-w-0 space-y-4"><ConfigurationDiff change={change} />
        <p role="status" className="text-sm">{t(`changes.states.${change.state}`)} · {t(`changes.activation.${change.activation || change.state}`)}</p>
        {valid && <p role="status" className="text-sm">{t('changes.valid')}</p>}{error && <p role="alert" className="text-sm text-ui-danger">{error}</p>}
        <div className="flex flex-wrap gap-2">{writable && change.state === 'staged' && <>
            <Button type="button" disabled={busy} onClick={() => void run('validate')}>{t('changes.validate')}</Button>
            <Button type="button" variant="primary" disabled={busy || !valid} onClick={() => void run('commit')}>{t('changes.commit')}</Button>
            <Button type="button" variant="outline-danger" disabled={busy} onClick={() => void run('discard')}>{t('changes.discard')}</Button>
        </>}{writable && rollback && change.state === 'committed' && <Button type="button" disabled={busy} onClick={() => void run('rollback')}>{t('changes.rollback')}</Button>}</div>
    </div>;
}

export function StageChangeButton({ request: payload, disabled, onCommitted, label }: { label?: string; request: StageRequest; disabled?: boolean; onCommitted?: (change: ConfigurationChange) => void | Promise<unknown> }) {
    const session = useSession(); const scope = authScope();
    if (!session?.principal.permissions.includes('configuration:read') || !session.principal.permissions.includes('configuration:write')) return null;
    const required: Record<string, string[]> = {
        group: ['users:manage'], role: ['roles:read', 'roles:write'], 'role-assignment': ['roles:read', 'roles:write', 'users:manage'],
        'access-policy': ['traffic-access:read', 'traffic-access:write'], 'resource-policy': ['resources:read', 'resources:write'],
        'oidc-provider': ['security:read', 'security:write'], 'audit-settings': ['security:read', 'security:write'],
        'route-rule': ['routes:read', 'routes:write'], 'route-defaults': ['routes:read', 'routes:write'], 'route-list': ['routes:read', 'routes:write'], 'route-order': ['routes:read', 'routes:write'],
    };
    if (!required[payload.kind]?.every(permission => session.principal.permissions.includes(permission)) || payload.kind === 'oidc-provider' && session.principal.credentialType !== 'session') return null;
    return <StageControl key={scope} request={payload} disabled={disabled} onCommitted={onCommitted} label={label} />;
}
function StageControl({ request: payload, disabled, onCommitted, label }: { label?: string; request: StageRequest; disabled?: boolean; onCommitted?: (change: ConfigurationChange) => void | Promise<unknown> }) {
    const { t } = useTranslation('auth'); const scope = authScope();
    const [change, setChange] = useState<ConfigurationChange>(); const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
    const request = useRef<AbortController | undefined>(undefined);
    useEffect(() => () => request.current?.abort(), [scope]);
    const stage = async (button: HTMLButtonElement) => {
        if (busy || disabled || scope !== authScope() || button.closest('form')?.reportValidity() === false) return;
        const controller = new AbortController(); request.current = controller; setBusy(true); setError('');
        try { const next = await changeAPI.stage(payload, controller.signal); if (!controller.signal.aborted && scope === authScope()) { setChange(next); setOpen(true); } }
        catch (cause) { if (!controller.signal.aborted && scope === authScope()) setError(t(cause && typeof cause === 'object' && 'code' in cause && cause.code === 409 ? 'changes.conflict' : 'requestFailed')); }
        finally { if (!controller.signal.aborted && scope === authScope()) setBusy(false); }
    };
    return <><Button type="button" title={t("changes.stage")} aria-label={label ? `${label} · ${t("changes.stage")}` : undefined} disabled={disabled || busy} onClick={event => void stage(event.currentTarget)}>{label || t("changes.stage")}</Button>
        {error && <p role="alert" className="text-sm text-ui-danger">{error}</p>}
        <Modal open={open} onOpenChange={setOpen}><ModalContent width={850} aria-describedby={undefined}><ModalHeader closeButton><ModalTitle>{t('changes.preview')}</ModalTitle></ModalHeader><ModalBody>
            {change && <ChangeReview key={change.id} initial={change} writable rollback={false} onChanged={async next => { if (!next || next.state === 'committed') { setOpen(false); if (next) await onCommitted?.(next); } }} />}
        </ModalBody></ModalContent></Modal>
    </>;
}
