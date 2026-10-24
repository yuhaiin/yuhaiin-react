import { useSession } from '@/auth/context';
import { authScope } from '@/auth/session';
import { authorizedFetch } from '@/auth/transport';
import { Button } from '@/component/v2/button';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { SecretEditContext, hasSecretPlaceholder, isSecretPlaceholder } from '@/auth/secret-fields';

export function revealedFields(masked: unknown, actual: unknown, path = ''): Array<{ path: string; value: string }> {
 if (isSecretPlaceholder(masked) || Array.isArray(masked) && masked.length === 1 && isSecretPlaceholder(masked[0])) return [{ path, value: typeof actual === 'string' ? actual : JSON.stringify(actual) ?? '' }];
 if (!masked || typeof masked !== 'object' || !actual || typeof actual !== 'object') return [];
 return Object.entries(masked).flatMap(([key,value]) => revealedFields(value, (actual as Record<string,unknown>)[key], path ? `${path}.${key}` : key));
}

export function useSecretIsolation() {
    const session = useSession();
    const scope = authScope();
    const { data: isolated } = useSWR(session && session.principal.credentialType !== 'local' ? [scope, 'secret-isolation'] : null, async () => {
        const response = await authorizedFetch('/api/v2/management');
        if (!response.ok) return false;
        const status: { features?: string[] } = await response.json();
        return status.features?.includes('secret-isolation') ?? false;
    }, { revalidateOnFocus: false, shouldRetryOnError: false });
    return isolated ?? false;
}

// Plaintext stays in this editor's React state, never a shared SWR cache or
// browser storage. Controller/session changes and unmount abort pending reads.
export function SecretValues<T>({ value, load, children }: { value: T; load?: (signal: AbortSignal) => Promise<T>; children: ReactNode }) {
    const session = useSession();
    const scope = authScope();
    const { t } = useTranslation('auth');
    const isolated = useSecretIsolation();
    const masked = hasSecretPlaceholder(value);
    const restricted = Boolean(isolated || masked);
    const manage = session?.principal.credentialType === 'local' || session?.principal.permissions.includes('secrets:manage') || false;
    const readable = session?.principal.permissions.includes('secrets:read');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(false);
    const [revealed, setRevealed] = useState<{ scope: string; fields: Array<{ path: string; value: string }> }>();
    const request = useRef<AbortController | undefined>(undefined);
    const [previousScope, setPreviousScope] = useState(scope);
    if (previousScope !== scope) { setPreviousScope(scope); setRevealed(undefined); setBusy(false); setError(false); }
    useEffect(() => () => request.current?.abort(), [scope]);
    const reveal = async () => {
        if (busy || !readable || !load || scope !== authScope()) return;
        request.current?.abort(); const controller = new AbortController(); request.current = controller;
        setBusy(true); setError(false);
        try { const next = await load(controller.signal); if (!controller.signal.aborted && scope === authScope()) setRevealed({ scope, fields: revealedFields(value,next) }); }
        catch { if (!controller.signal.aborted && scope === authScope()) setError(true); }
        finally { if (!controller.signal.aborted && scope === authScope()) setBusy(false); }
    };
    return <SecretEditContext.Provider value={{ restricted, manage, execute: session?.principal.credentialType === "local" || session?.principal.permissions.includes("system:execute") || false, security: session?.principal.credentialType === "local" || session?.principal.permissions.includes("security:write") || false }}>
        {restricted && <div className="mb-4 min-w-0 space-y-2 rounded-ui-sm border border-ui-border p-3 text-xs text-ui-muted">
            <p>{t(manage ? 'secrets.preservedHelp' : 'secrets.readOnlyHelp')}</p>
            {masked && readable && load && <Button type="button" size="sm" disabled={busy} onClick={() => void reveal()}>{t('secrets.reveal')}</Button>}
            {revealed?.scope === scope && readable && <section aria-label={t('secrets.revealedValues')} className="space-y-2"><Button type="button" size="sm" onClick={() => setRevealed(undefined)}>{t('secrets.hide')}</Button><dl className="space-y-3">{revealed.fields.map(field => <div key={field.path}><dt className="break-all font-medium">{field.path}</dt><dd><pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-ui-sm border border-ui-border p-2 select-text">{field.value}</pre></dd></div>)}</dl></section>}
            {error && <p role="alert" className="text-ui-danger">{t('requestFailed')}</p>}
        </div>}
        {children}
    </SecretEditContext.Provider>;
}
