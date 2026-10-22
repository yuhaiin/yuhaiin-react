import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
import SecurityPage from './page';

vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); });

it.each([true, false])('keeps sessions and OAuth alongside permission-gated credentials (upstream=%s)', async upstream => {
    setApiUrl('https://controller.example');
    const permissions = ['identity:read', 'proxy-credentials:own', ...(upstream ? ['upstream-credentials:manage'] : [])];
    establishSession('', { userId: 'alice', credentialType: 'session', permissions }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
    const fetch = vi.fn(async (_url: URL) => Response.json([])); vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    try {
        await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><SecurityPage /></SWRConfig>));
        const headings = [...host.querySelectorAll('h2')].map(heading => heading.textContent);
        expect(headings).toContain('sessions');
        expect(headings).toContain('oauthAccounts');
        expect(headings).toContain('proxyCredentials');
        expect(headings.includes('upstreamCredentials')).toBe(upstream);
        const paths = fetch.mock.calls.map(([url]) => new URL(String(url)).pathname);
        expect(paths.includes('/api/v2/auth/upstream-credentials')).toBe(upstream);
        expect(host.querySelector('[role=alert]')).toBeNull();
    } finally { act(() => root.unmount()); host.remove(); }
});
