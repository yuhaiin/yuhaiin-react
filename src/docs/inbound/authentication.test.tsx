import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { SWRConfig } from 'swr';
import { createDefaultInbound, type Inbound } from '@/contract/inbound';
import { UserAuthentication } from './authentication';
vi.mock('@/auth/context', () => ({ useSession: () => ({ principal: { credentialType: 'session', permissions: ['users:manage'] } }) }));
vi.mock('@/auth/api', () => ({ authAPI: vi.fn(async () => [{ id: 'alice', login: 'Alice' }]) }));
vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
it('enables new user-only authentication and keeps that mode when selecting users', async () => {
    function Editor() { const [inbound, setInbound] = useState(createDefaultInbound('entry')); return <><UserAuthentication inbound={inbound} onChange={setInbound} /><output>{JSON.stringify(inbound.authentication)}</output></>; }
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><Editor /></SWRConfig>));
    await act(async () => { host.querySelector<HTMLButtonElement>('[role=switch]')!.click(); });
    expect(host.querySelector('output')!.textContent).toBe(JSON.stringify({ mode: 'users', users: [] }));
    expect(host.textContent).not.toContain('authenticationMode.mixedWarning');
    await act(async () => { host.querySelector<HTMLInputElement>('input[type=checkbox]')!.click(); });
    expect(host.querySelector('output')!.textContent).toBe(JSON.stringify({ mode: 'users', users: ['alice'] }));
    act(() => root.unmount()); host.remove();
});
it('shows the mixed authentication warning for a saved object without an explicit mode', async () => {
    const inbound: Inbound = { ...createDefaultInbound('entry'), authentication: { users: ['alice'] } };
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><UserAuthentication inbound={inbound} onChange={() => {}} /></SWRConfig>));
    expect(host.querySelector('[role=note]')!.textContent).toBe('authenticationMode.mixedWarning');
    act(() => root.unmount()); host.remove();
});
