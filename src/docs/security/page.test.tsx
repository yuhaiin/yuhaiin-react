import { act, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { canReadRoute } from '@/auth/policy';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
import AdministrationPage from './admin/page';
import CredentialsPage from './credentials/page';
import SecurityPage from './page';

vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); });

async function render(page: ReactNode, permissions: string[]) {
    setApiUrl('https://controller.example');
    establishSession('', { userId: 'alice', credentialType: 'session', permissions }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
    const fetch = vi.fn(async (_url: URL) => Response.json([])); vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}>{page}</SWRConfig>));
    return {
        host,
        headings: () => [...host.querySelectorAll('h2')].map(heading => heading.textContent),
        tabs: () => [...host.querySelectorAll('[role=tab]')].map(tab => tab.textContent),
        paths: () => fetch.mock.calls.map(([url]) => new URL(String(url)).pathname),
        close: () => { act(() => root.unmount()); host.remove(); },
    };
}

it('keeps the account page to personal sign-in settings and requests nothing administrative', async () => {
    const view = await render(<SecurityPage />, ['identity:read', 'proxy-credentials:own', 'usage:own', 'users:manage', 'security:read']);
    try {
        expect(view.headings()).toEqual(expect.arrayContaining(['sessions', 'passkeys', 'oauthAccounts', 'roles.effective']));
        expect(view.headings()).not.toContain('proxyCredentials');
        expect(view.headings()).not.toContain('users');
        expect(view.paths().filter(path => /\/(usage|users|events|proxy-credentials)/.test(path))).toEqual([]);
        expect(view.host.querySelector('[role=alert]')).toBeNull();
    } finally { view.close(); }
});

it('omits the tab list when a user can only reach one credential type', async () => {
    const view = await render(<CredentialsPage />, ['identity:read', 'proxy-credentials:own']);
    try {
        expect(view.tabs()).toEqual([]);
        expect(view.headings()).toEqual(['proxyCredentials']);
        expect(view.paths()).not.toContain('/api/v2/auth/upstream-credentials');
    } finally { view.close(); }
});

it('loads only the selected credential type', async () => {
    const view = await render(<CredentialsPage />, ['tokens:own', 'proxy-credentials:own', 'upstream-credentials:manage']);
    try {
        expect(view.tabs()).toEqual(['tokens', 'proxyCredentials', 'upstreamCredentials']);
        expect(view.paths()).toEqual(['/api/v2/auth/tokens']);
        await act(async () => { view.host.querySelectorAll('[role=tab]')[2].dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 })); });
        expect(view.headings()).toEqual(['upstreamCredentials']);
        expect(view.paths()).toContain('/api/v2/auth/upstream-credentials');
    } finally { view.close(); }
});

it('shows administration tabs by permission', async () => {
    const auditor = await render(<AdministrationPage />, ['identity:read', 'configuration:read']);
    try { expect(auditor.tabs()).toEqual([]); expect(auditor.paths().some(path => path.endsWith('/users'))).toBe(false); } finally { auditor.close(); }
    const manager = await render(<AdministrationPage />, ['users:manage', 'security:read']);
    try { expect(manager.tabs()).toEqual(['securityTabs.access', 'securityTabs.settings', 'securityTabs.audit']); } finally { manager.close(); }
});

it('opens a route with any of its listed read permissions', () => {
    expect(canReadRoute('/docs/security/credentials', ['proxy-credentials:own'])).toBe(true);
    expect(canReadRoute('/docs/security/credentials', ['identity:read'])).toBe(false);
    expect(canReadRoute('/docs/security/admin', ['identity:read', 'usage:own'])).toBe(false);
    expect(canReadRoute('/docs/security/usage', ['usage:own'])).toBe(true);
    expect(canReadRoute('/docs/webui', [])).toBe(true);
});
