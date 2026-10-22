import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import LoginPage from './page';
import { initializationStatus, initialize, login } from '@/auth/api';
import { getApiUrl, setApiUrl } from '@/common/apiurl';
import { clearSession, getSession, authHeaders } from '@/auth/session';
import { SessionMonitor } from '@/auth/context';

vi.mock('./oauth', () => ({ OAuthLogin: () => null }));
vi.mock('@/auth/api', () => ({ initializationStatus: vi.fn(), initialize: vi.fn(), login: vi.fn(), enroll: vi.fn() }));
vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
let host: HTMLDivElement; let root: Root;
beforeEach(() => {
    vi.useFakeTimers(); setApiUrl('https://controller.example');
    vi.mocked(initializationStatus).mockReset(); vi.mocked(initialize).mockReset(); vi.mocked(login).mockReset();
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); clearSession(); localStorage.clear(); vi.useRealTimers(); });
async function mount() { await act(async () => root.render(<LoginPage />)); await act(async () => { await vi.advanceTimersByTimeAsync(300); }); }
async function input(label: string, value: string) {
    const field = [...host.querySelectorAll('label')].find(node => node.querySelector('span')?.textContent === label)!.querySelector('input')!;
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(field, value); field.dispatchEvent(new Event('input', { bubbles: true })); });
}
async function submit() { await act(async () => { host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); }); }
it('automatically shows first-time setup, checks confirmation, and returns to login with no retained secret', async () => {
    vi.mocked(initializationStatus).mockResolvedValue({ authentication: 'local-users', required: true, expiresAt: 1234567890 });
    vi.mocked(initialize).mockResolvedValue(undefined);
    await mount();
    expect(host.textContent).toContain('createAdministrator'); expect(host.textContent).toContain('setupRestartHint');
    expect(host.querySelector('button[type=submit]')!.textContent).toBe('createAdministrator');
    await input('loginName', 'owner'); await input('initializationCode', 'once-only-code'); await input('newPassword', 'chosen password'); await input('confirmPassword', 'different');
    await submit(); expect(initialize).not.toHaveBeenCalled(); expect(host.textContent).toContain('passwordMismatch');
    await input('confirmPassword', 'chosen password'); await submit();
    expect(initialize).toHaveBeenCalledWith('once-only-code', 'owner', 'chosen password');
    expect(host.textContent).toContain('setupComplete'); expect(host.textContent).not.toContain('initializationCode');
    expect(host.querySelector<HTMLInputElement>('input[type=password]')!.value).toBe('');
    expect([...Array(localStorage.length)].map((_, i) => localStorage.getItem(localStorage.key(i)!)).join('')).not.toContain('once-only-code');
    await input('password', 'chosen password'); await submit(); expect(login).toHaveBeenCalledWith('owner', 'chosen password');
});
it('uses ordinary login and enrollment when the controller is initialized', async () => {
    vi.mocked(initializationStatus).mockResolvedValue({ authentication: 'local-users', required: false, expiresAt: 0 });
    await mount(); expect(host.textContent).not.toContain('createAdministrator'); expect(host.textContent).toContain('signIn');
    await act(async () => { [...host.querySelectorAll('button')].find(button => button.textContent === 'activateAccount')!.click(); });
    expect(host.textContent).toContain('enrollmentCapability'); expect(host.textContent).not.toContain('initializationCode');
});
it('enters local Android management directly and never polls identity endpoints', async () => {
    setApiUrl('http://127.0.0.1:50051');
    vi.mocked(initializationStatus).mockResolvedValue({ authentication: 'none', required: false, expiresAt: 0 });
    await mount();
    expect(getSession()?.principal.credentialType).toBe('local'); expect(authHeaders()).toEqual({});
    expect(initialize).not.toHaveBeenCalled(); expect(login).not.toHaveBeenCalled();
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    await act(async () => root.render(<SessionMonitor />));
    await act(async () => { await vi.advanceTimersByTimeAsync(60000); window.dispatchEvent(new Event('focus')); });
    expect(fetch).not.toHaveBeenCalled(); vi.unstubAllGlobals();
});
it('ignores a stale setup response after editing the controller without persisting the draft address', async () => {
    let release!: (value: { authentication: 'local-users', required: boolean; expiresAt: number }) => void;
    vi.mocked(initializationStatus).mockImplementationOnce(() => new Promise(resolve => { release = resolve; })).mockResolvedValue({ authentication: 'local-users', required: false, expiresAt: 0 });
    await mount(); await input('controller', 'https://new.example');
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    await act(async () => { release({ authentication: 'local-users', required: true, expiresAt: 1234567890 }); });
    expect(host.textContent).toContain('signIn'); expect(host.textContent).not.toContain('createAdministrator'); expect(getApiUrl()).toBe('https://controller.example');
});
it('takes a proxy-only user directly to credential self-service after login', async () => {
    vi.mocked(initializationStatus).mockResolvedValue({ authentication: 'local-users', required: false, expiresAt: 0 });
    const { establishSession } = await import('@/auth/session');
    vi.mocked(login).mockImplementationOnce(async () => { establishSession('session', { userId: 'alice', credentialType: 'session', permissions: ['identity:read', 'proxy-credentials:own'] }, 2000000000, 'https://controller.example'); });
    await mount(); await input('loginName', 'alice'); await input('password', 'password'); await submit();
    expect(window.location.hash).toBe('#/docs/security');
});
