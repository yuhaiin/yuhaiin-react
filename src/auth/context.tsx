import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { authAPI, restoreSession } from './api';
import { getSession, subscribeAuth, updatePrincipal, type Principal } from './session';
export function useSession() { return useSyncExternalStore(subscribeAuth, getSession, () => null); }
export function usePermission(permission: string) { return useSession()?.principal.permissions.includes(permission) ?? false; }
export function SessionMonitor() {
    const session = useSession();
    useEffect(() => {
        if (!session || session.principal.credentialType === 'local') return;
        const refresh = () => { void authAPI<Principal>('GET', '/me').then(principal => { if (getSession() === session) updatePrincipal(principal); }).catch(() => undefined); };
        const timer = window.setInterval(refresh, 30000);
        window.addEventListener('focus', refresh);
        window.addEventListener('management-permissions', refresh);
        return () => { clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('management-permissions', refresh); };
    }, [session]);
    return null;
}

export function SessionBootstrap({ children }: { children: ReactNode }) {
    const { t } = useTranslation('auth');
    const [ready, setReady] = useState(false);
    useEffect(() => {
        const request = new AbortController();
        const timeout = window.setTimeout(() => request.abort(), 10000);
        void restoreSession(request.signal).catch(() => false).finally(() => {
            window.clearTimeout(timeout); if (!cancelled) setReady(true);
        });
        let cancelled = false;
        return () => { cancelled = true; window.clearTimeout(timeout); request.abort(); };
    }, []);
    return ready ? children : <p role="status" className="p-5 text-sm text-ui-muted">{t('restoringSession')}</p>;
}
