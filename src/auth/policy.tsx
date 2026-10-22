import { createContext, useContext, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from './context';
export const ActionPermissionContext = createContext<string | null>(null);
export const routePermissions: Record<string, { read: string; write?: string }> = {
    '/': { read: 'connections:read' },
    '/docs/group': { read: 'nodes:read', write: 'nodes:write' },
    '/docs/group/selectors': { read: 'nodes:read', write: 'nodes:write' },
    '/docs/group/subscribe': { read: 'nodes:read', write: 'nodes:write' },
    '/docs/group/publish': { read: 'nodes:read', write: 'nodes:write' },
    '/docs/group/activates': { read: 'nodes:read', write: 'nodes:write' },
    '/docs/gateway': { read: 'gateway:read', write: 'gateway:write' },
    '/docs/traffic-control': { read: 'settings:read', write: 'settings:write' },
    '/docs/inbound': { read: 'inbounds:read', write: 'inbounds:write' },
    '/docs/bypass': { read: 'routes:read', write: 'routes:write' },
    '/docs/bypass/list': { read: 'routes:read', write: 'routes:write' },
    '/docs/bypass/test': { read: 'routes:read' }, '/docs/bypass/block': { read: 'routes:read' },
    '/docs/bypass/resolver': { read: 'resolver:read', write: 'resolver:write' },
    '/docs/connections/v2': { read: 'connections:read' },
    '/docs/connections/history': { read: 'connections:read' }, '/docs/connections/failed': { read: 'connections:read' },
    '/docs/config': { read: 'settings:read', write: 'settings:write' },
    '/docs/config/backup': { read: 'backup:manage', write: 'backup:manage' },
    '/docs/config/log': { read: 'diagnostics:run' }, '/docs/config/pprof': { read: 'diagnostics:run' },
    '/docs/diagnostics': { read: 'diagnostics:run', write: 'diagnostics:run' },
    '/docs/config/about': { read: 'settings:read' }, '/docs/config/licenses': { read: 'settings:read' },
    '/docs/security': { read: 'identity:read' },
};
export function useActionAllowed(permission: string | undefined, isAction: boolean) {
    const inherited = useContext(ActionPermissionContext);
    const session = useSession();
    const required = permission ?? (isAction ? inherited : null);
    return !required || Boolean(session?.principal.permissions.includes(required));
}
export function PagePermissions({ path, children }: { path: string; children: ReactNode }) {
    const { t } = useTranslation('auth');
    const session = useSession();
    const policy = routePermissions[path.split('?')[0]];
    if (policy && !session?.principal.permissions.includes(policy.read)) return <p role="alert">{t('forbidden')}</p>;
    const readOnly = policy?.write && !session?.principal.permissions.includes(policy.write);
    return <ActionPermissionContext value={policy?.write ?? null}>
        {readOnly && <p role="status" className="mb-4 rounded-ui-md border border-ui-border bg-ui-surface p-3 text-sm text-ui-muted">{t('readOnlyNotice')}</p>}
        {children}
    </ActionPermissionContext>;
}
