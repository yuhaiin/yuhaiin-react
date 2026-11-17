import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { AuthorizedApplications } from './authorized-apps';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
afterEach(() => { clearSession(); vi.unstubAllGlobals(); });

it('lists active authorizations and revokes one', async () => {
    setApiUrl('https://y.example');
    establishSession('s', { userId: 'u', credentialType: 'session', permissions: ['identity:read'] }, Math.floor(Date.now() / 1000) + 600, 'https://y.example');
    const future = Math.floor(Date.now() / 1000) + 3600;
    const grants = [
        { id: 'g1', clientName: 'Claude', resource: 'https://y.example/mcp', resourceId: 'mcp', scopes: ['mcp:connect', 'nodes:read'], createdAt: 1, expiresAt: future, lastUsedAt: 0, revoked: false, revokedReason: '' },
        { id: 'g2', clientName: 'Old app', resource: 'https://y.example/api', resourceId: 'api', scopes: ['nodes:read'], createdAt: 1, expiresAt: future, lastUsedAt: 0, revoked: true, revokedReason: 'user_revoked' },
    ];
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        if (init.method === 'DELETE') { grants.find(grant => url.pathname.endsWith(grant.id))!.revoked = true; return Response.json({}); }
        return Response.json(grants);
    }); vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><AuthorizedApplications /></SWRConfig>));
    expect(host.textContent).toContain('Claude'); expect(host.textContent).toContain('nodes:read');
    expect(host.textContent).not.toContain('Old app');
    await act(async () => { [...host.querySelectorAll('button')].find(button => button.textContent === 'oauthServer.revokeAccess')!.click(); });
    expect(fetch.mock.calls.some(([url, init]) => init.method === 'DELETE' && String(url).endsWith('/api/v2/auth/oauth-server/grants/g1'))).toBe(true);
    expect(host.textContent).toContain('oauthServer.noAuthorizedApps');
    act(() => root.unmount()); host.remove();
});
