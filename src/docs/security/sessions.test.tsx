import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { Sessions } from './sessions';
import { clearSession, establishSession, getSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); });
it('marks the current session and lets a user revoke another session or sign themselves out', async () => {
    setApiUrl('https://controller.example'); establishSession('test', { userId: 'reader', credentialType: 'session', permissions: ['identity:read'] }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
    const sessions = [{ id: 'current', current: true, userAgent: 'Browser A', remoteAddr: '192.0.2.1', authMethod: 'github', createdAt: 1, expiresAt: 9999999999, lastSeen: 1 }, { id: 'other', current: false, userAgent: 'Browser B', remoteAddr: '192.0.2.2', authMethod: 'password', createdAt: 1, expiresAt: 9999999999, lastSeen: 1 }];
    const fetch = vi.fn(async (url: URL, init: RequestInit) => {
        if (init.method === 'DELETE') { const id = url.pathname.split('/').pop(); const index = sessions.findIndex(item => item.id === id); sessions.splice(index, 1); return Response.json({}); }
        return Response.json(sessions);
    }); vi.stubGlobal('fetch', fetch);
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><Sessions /></SWRConfig>));
    expect(host.textContent).toContain('currentSession'); expect(host.textContent).toContain('Browser B');
    await act(async () => { [...host.querySelectorAll('section')].find(node => node.textContent?.includes('Browser B'))!.querySelector('button')!.click(); });
    expect(host.textContent).not.toContain('Browser B'); expect(getSession()).not.toBeNull();
    await act(async () => { [...host.querySelectorAll('section')].find(node => node.textContent?.includes('Browser A'))!.querySelector('button')!.click(); });
    expect(getSession()).toBeNull(); expect(fetch.mock.calls.filter(([, init]) => init.method === 'DELETE')).toHaveLength(2);
    act(() => root.unmount()); host.remove();
});
