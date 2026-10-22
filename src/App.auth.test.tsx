import { act, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import App from './App';
import { clearSession } from '@/auth/session';
import { getApiUrl, LatencyHTTPUrlKey, setApiUrl } from '@/common/apiurl';

vi.mock('react-i18next', async importOriginal => {
    const actual = await importOriginal<typeof import('react-i18next')>();
    const t = (key: string) => key;
    return { ...actual, useTranslation: () => ({ t }) };
});
vi.mock('@/auth/api', () => ({ initializationStatus: vi.fn().mockResolvedValue({ authentication: 'local-users', required: false, expiresAt: 0 }) }));
vi.mock('@/docs/login/oauth', () => ({ OAuthLogin: () => null }));
vi.mock('@/docs/nav/NavBarContainer', () => ({ default: ({ children }: { children: ReactNode }) => <div data-management-navigation>{children}</div> }));
vi.mock('motion/react', () => ({
    useReducedMotion: () => true,
    MotionConfig: ({ children }: { children: ReactNode }) => children,
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    motion: { div: ({ children, className }: { children: ReactNode; className?: string }) => <div className={className}>{children}</div>, create: (component: unknown) => component },
}));

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
    clearSession();
    setApiUrl('https://controller.example');
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
});
afterEach(() => {
    act(() => root.unmount());
    host.remove();
    clearSession();
    localStorage.clear();
    window.history.replaceState(null, '', '/');
});

async function mount(path: string) {
    await import('@/docs/login/page');
    await import('@/docs/webui/page');
    window.history.replaceState(null, '', `/#${path}`);
    await act(async () => root.render(<App />));
}

async function waitFor(check: () => void) {
    for (let attempt = 0; ; attempt++) {
        try { check(); return; }
        catch (error) { if (attempt === 20) throw error; }
        await act(async () => { await new Promise(resolve => window.setTimeout(resolve, 25)); });
    }
}

it('opens WebUI settings from sign-in, edits local preferences, and returns to sign-in', async () => {
    await mount('/login');
    await waitFor(() => expect(host.querySelector('a[href="#/docs/webui"]')).not.toBeNull());
    await act(async () => host.querySelector<HTMLAnchorElement>('a[href="#/docs/webui"]')!.click());
    await waitFor(() => expect(host.textContent).toContain('latency.title'));
    expect(window.location.hash).toBe('#/docs/webui');
    expect(host.querySelector('[data-management-navigation]')).toBeNull();
    const input = host.querySelector<HTMLInputElement>('input[placeholder="https://..."]')!;
    await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'https://latency.example/check');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    expect(JSON.parse(localStorage.getItem(LatencyHTTPUrlKey)!)).toBe('https://latency.example/check');
    await act(async () => host.querySelector<HTMLAnchorElement>('a[href="#/login"]')!.click());
    await waitFor(() => expect(window.location.hash).toBe('#/login'));
    await waitFor(() => expect(host.textContent).toContain('controller'));
});

it('allows a direct WebUI link and controller changes before sign-in', async () => {
    await mount('/docs/webui');
    await waitFor(() => expect(host.textContent).toContain('api.title'));
    await act(async () => [...host.querySelectorAll('button')].find(button => button.textContent?.includes('api.sameOrigin'))!.click());
    expect(getApiUrl()).toBe('');
    expect(window.location.hash).toBe('#/docs/webui');
});

it('redirects backend settings to sign-in without rendering their controls', async () => {
    await mount('/docs/config');
    await waitFor(() => expect(window.location.hash).toBe('#/login'));
    await waitFor(() => expect(host.textContent).toContain('controller'));
    expect(host.querySelector('[data-management-navigation]')).toBeNull();
    expect(host.textContent).not.toContain('api.title');
});
