import { useEffect, useSyncExternalStore } from 'react';
import { authAPI } from './api';
import { getSession, subscribeAuth, updatePrincipal, type Principal } from './session';
export function useSession() { return useSyncExternalStore(subscribeAuth, getSession, () => null); }
export function usePermission(permission: string) { return useSession()?.principal.permissions.includes(permission) ?? false; }
export function SessionMonitor() {
    const session = useSession();
    useEffect(() => {
        if (!session) return;
        const refresh = () => { void authAPI<Principal>('GET', '/me').then(principal => { if (getSession() === session) updatePrincipal(principal); }).catch(() => undefined); };
        const timer = window.setInterval(refresh, 30000);
        window.addEventListener('focus', refresh);
        window.addEventListener('management-permissions', refresh);
        return () => { clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('management-permissions', refresh); };
    }, [session]);
    return null;
}
