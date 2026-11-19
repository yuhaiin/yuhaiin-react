import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, expect, it, vi } from 'vitest';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
import { CreateListModal } from './page';
import type { RouteListDetail } from '@/contract/route';

vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
afterEach(() => { clearSession(); localStorage.clear(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

const processList = (lists: string[]): RouteListDetail => ({ id: '', revision: 0, name: 'Editor', type: 'process', source: { type: 'local', local: { lists } }, errorMsgs: [] });

async function render(value: RouteListDetail) {
    setApiUrl('https://controller.example');
    establishSession('test', { userId: 'operator', credentialType: 'session', permissions: ['routes:read', 'routes:write'] }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ features: [] })));
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map(), shouldRetryOnError: false }}>
        <CreateListModal presentation="inline" open initialValue={value} onSaved={() => undefined} onClose={() => undefined} />
    </SWRConfig>));
    const save = () => [...host.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent?.includes('saveAndApply'))!;
    return { host, save, unmount: () => { act(() => root.unmount()); host.remove(); } };
}

it('shows invalid process patterns by line and blocks saving them', async () => {
    const view = await render(processList(['/Applications/ExampleEditor.app/**', 'foo**bar']));
    try {
        const alert = view.host.querySelector('[role="alert"]');
        expect(alert?.textContent).toContain('processPatterns.line');
        expect(alert?.textContent).toContain('foo**bar');
        expect(view.save().disabled).toBe(true);
        expect(view.host.textContent).toContain('processPatterns.title');
    } finally { view.unmount(); }
});

it('allows saving valid process patterns', async () => {
    const view = await render(processList(['/Applications/ExampleEditor.app/**', '**/aaa/**', 'C:\\Program Files\\ExampleEditor\\**']));
    try {
        expect(view.host.querySelector('[role="alert"]')).toBeNull();
        expect(view.save().disabled).toBe(false);
    } finally { view.unmount(); }
});
