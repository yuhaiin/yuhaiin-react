import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { clearSession, establishSession } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';

const followed = vi.hoisted(() => vi.fn());
const translate = (key: string) => key;
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: translate }) }));
vi.mock('wouter', async original => ({ ...await original<typeof import('wouter')>(), useParams: () => ({ id: 'request-id' }) }));
vi.mock('@/auth/oauth-server', async original => ({ ...await original<typeof import('@/auth/oauth-server')>(), followRedirect: followed }));
const { default: ConsentPage } = await import('./page');

const details = {
    id: 'request-id', clientId: 'yuc_client', clientName: 'Claude', clientType: 'public', clientUri: '', registration: 'dynamic',
    redirectOrigin: 'http://127.0.0.1:8765', redirectUri: 'http://127.0.0.1:8765/cb', resource: 'https://y.example/mcp', resourceId: 'mcp', resourceName: 'Yuhaiin MCP server',
    accessTokenTtl: 900, grantTtl: 7776000, expiresAt: 0, existingGrant: false,
    scopes: [
        { id: 'mcp:connect', category: 'integrations', description: 'Connect MCP clients', access: 'connect', required: true, available: true, previouslyGranted: false },
        { id: 'nodes:read', category: 'nodes', description: 'View nodes', access: 'read', required: false, available: true, previouslyGranted: false },
        { id: 'nodes:write', category: 'nodes', description: 'Change nodes', access: 'write', required: false, available: false, previouslyGranted: false },
    ],
};

beforeEach(() => {
    setApiUrl('https://y.example');
    establishSession('s', { userId: 'u', credentialType: 'session', permissions: ['identity:read', 'nodes:read'] }, Math.floor(Date.now() / 1000) + 600, 'https://y.example');
});
afterEach(() => { clearSession(); vi.unstubAllGlobals(); followed.mockReset(); });

async function render() {
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<ConsentPage />));
    return { host, unmount: () => { act(() => root.unmount()); host.remove(); } };
}

it('shows the request and grants only the scopes the user keeps selected', async () => {
    const calls: { url: string; body?: unknown }[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: URL, init: RequestInit) => {
        calls.push({ url: url.pathname, body: init.body ? JSON.parse(String(init.body)) : undefined });
        return init.method === 'POST' ? Response.json({ redirectUri: 'http://127.0.0.1:8765/cb?code=c&state=s' }) : Response.json(details);
    }));
    const { host, unmount } = await render();
    expect(host.textContent).toContain('Claude');
    expect(host.textContent).toContain('http://127.0.0.1:8765');
    expect(host.textContent).toContain('oauthServer.selfRegistered');
    const boxes = [...host.querySelectorAll<HTMLInputElement>('input[type=checkbox]')];
    expect(boxes.map(box => [box.checked, box.disabled])).toEqual([[true, true], [true, false], [false, true]]);
    expect(host.textContent).toContain('oauthServer.notHeld');
    await act(async () => { boxes[1].click(); });
    const allow = [...host.querySelectorAll('button')].find(button => button.textContent === 'oauthServer.allow')!;
    await act(async () => { allow.click(); });
    expect(calls[calls.length - 1]).toEqual({ url: '/api/v2/auth/oauth-server/authorizations/request-id', body: { approve: true, scopes: ['mcp:connect'] } });
    expect(followed).toHaveBeenCalledWith('http://127.0.0.1:8765/cb?code=c&state=s');
    unmount();
});

it('denies with no scopes', async () => {
    const posted: unknown[] = [];
    vi.stubGlobal('fetch', vi.fn(async (_url: URL, init: RequestInit) => {
        if (init.method === 'POST') { posted.push(JSON.parse(String(init.body))); return Response.json({ redirectUri: 'http://127.0.0.1:8765/cb?error=access_denied' }); }
        return Response.json(details);
    }));
    const { host, unmount } = await render();
    await act(async () => { [...host.querySelectorAll('button')].find(button => button.textContent === 'oauthServer.deny')!.click(); });
    expect(posted).toEqual([{ approve: false, scopes: [] }]);
    expect(followed).toHaveBeenCalledWith('http://127.0.0.1:8765/cb?error=access_denied');
    unmount();
});

it('cannot approve when a required permission is missing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ ...details, scopes: details.scopes.map(scope => scope.required ? { ...scope, available: false } : scope) })));
    const { host, unmount } = await render();
    expect(host.textContent).toContain('oauthServer.requiredMissing');
    expect([...host.querySelectorAll('button')].find(button => button.textContent === 'oauthServer.allow')!.disabled).toBe(true);
    unmount();
});

it('reports an expired or already answered request', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 404 })));
    const { host, unmount } = await render();
    expect(host.textContent).toContain('oauthServer.requestExpired');
    unmount();
});

it('refuses to render inside a frame', async () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    const top = Object.getOwnPropertyDescriptor(window, 'top')!;
    Object.defineProperty(window, 'top', { configurable: true, get: () => ({}) });
    try {
        const { host, unmount } = await render();
        expect(host.textContent).toContain('oauthServer.framed');
        expect(fetch).not.toHaveBeenCalled();
        unmount();
    } finally { Object.defineProperty(window, 'top', top); }
});
