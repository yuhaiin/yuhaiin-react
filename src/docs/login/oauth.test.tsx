import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { beginOAuth, oauthProviders } from '@/auth/oauth';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
import { OAuthLogin } from './oauth';

vi.mock('@/auth/oauth', async original => ({ ...await original<typeof import('@/auth/oauth')>(), beginOAuth: vi.fn(), oauthProviders: vi.fn() }));
vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
afterEach(() => { clearSession(); localStorage.clear(); window.location.hash = ''; });

it.each([
    { permissions: ['identity:read', 'proxy-credentials:own'], destination: '#/docs/security' },
    { permissions: ['identity:read', 'connections:read'], destination: '#/' },
])('routes OAuth users to $destination according to their permissions', async ({ permissions, destination }) => {
    setApiUrl('https://controller.example');
    vi.mocked(oauthProviders).mockResolvedValue(['github']);
    vi.mocked(beginOAuth).mockImplementationOnce(async () => {
        establishSession('', { userId: 'alice', credentialType: 'session', permissions }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
    });
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    try {
        await act(async () => root.render(<OAuthLogin controller="https://controller.example" />));
        await act(async () => host.querySelector('button')!.click());
        expect(beginOAuth).toHaveBeenCalledWith('github', false, expect.any(AbortSignal));
        expect(window.location.hash).toBe(destination);
    } finally { act(() => root.unmount()); host.remove(); }
});
