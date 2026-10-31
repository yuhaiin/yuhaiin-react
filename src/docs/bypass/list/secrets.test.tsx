import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, expect, it, vi } from 'vitest';
import { clearSession, establishSession } from '@/auth/session';
import { secretPlaceholder } from '@/auth/secret-fields';
import { setApiUrl } from '@/common/apiurl';
import { RouteListForm } from './page';
import type { RouteListDetail } from '@/contract/route';
vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });
it('keeps a saved URL masked while allowing metadata edits without secret management', async () => {
    setApiUrl('https://controller.example'); establishSession('test', { userId: 'operator', credentialType: 'session', permissions: ['routes:read', 'routes:write'] }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ features: ['secret-isolation'] })));
    const value: RouteListDetail = { id: 'private', revision: 1, name: 'Private', type: 'host', source: { type: 'remote', remote: { urls: [`${secretPlaceholder}.signed-reference`] } }, errorMsgs: [] };
    const changed = vi.fn(); const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    try {
        await act(async () => root.render(<SWRConfig value={{ provider: () => new Map(), shouldRetryOnError: false }}><RouteListForm value={value} onChange={changed} /></SWRConfig>));
        expect(host.querySelector<HTMLInputElement>('input')!.disabled).toBe(false);
        expect(host.querySelector<HTMLButtonElement>('button[data-state="off"]')?.disabled).toBe(true);
        const privateInputs = [...host.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input,textarea')].filter(node => node.value.includes(secretPlaceholder));
        expect(privateInputs).toHaveLength(0); expect(host.textContent).not.toContain('.signed-reference');
        expect(host.textContent).toContain('secrets.readOnlyHelp');
    } finally { act(() => root.unmount()); host.remove(); }
});
