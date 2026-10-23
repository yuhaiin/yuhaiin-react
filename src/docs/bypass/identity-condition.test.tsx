import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { IdentityCondition, identityCondition } from './identity-condition';
vi.mock('@/auth/context', () => ({ useSession: () => null }));
vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
it('keeps an unfinished separator so a second stable ID can be entered', async () => {
    function Editor() {
        const [ids, setIDs] = useState(['alice']);
        return <><IdentityCondition kind="user" ids={ids} onChange={setIDs} /><output>{JSON.stringify(identityCondition('user', ids))}</output></>;
    }
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<Editor />));
    const input = host.querySelector('input')!;
    const type = async (value: string) => { await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value); input.dispatchEvent(new Event('input', { bubbles: true })); }); };
    await type('alice,');
    expect(input.value).toBe('alice,');
    await type('alice,bob');
    expect(host.querySelector('output')!.textContent).toBe(JSON.stringify({ type: 'user', user: { ids: ['alice', 'bob'] } }));
    act(() => root.unmount()); host.remove();
});
