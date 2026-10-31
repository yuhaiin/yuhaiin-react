import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, expect, it, vi } from 'vitest';
import { clearSession, establishSession, updatePrincipal } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';
import { secretPlaceholder, isSecretPlaceholder } from '@/auth/secret-fields';
import { Input, Textarea } from './v2/input';
import { SecretValues, revealedFields } from './secret-values';

vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
let root: Root | undefined;
let host: HTMLDivElement;
afterEach(() => { if (root) act(() => root!.unmount()); root = undefined; host?.remove(); clearSession(); vi.unstubAllGlobals(); });
function session(permissions: string[]) {
    setApiUrl('https://controller.example');
    establishSession('session', { userId: 'user', credentialType: 'session', permissions }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ features: ['secret-isolation'] })));
}
async function render(view: React.ReactNode) {
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
    await act(async () => root!.render(<SWRConfig value={{ provider: () => new Map(), shouldRetryOnError: false }}>{view}</SWRConfig>));
    return host;
}
const signed = `${secretPlaceholder}.resource.snapshot.signature`;
it('recognizes signed markers and byte markers without treating arbitrary base64 as private', () => {
    expect(isSecretPlaceholder(signed)).toBe(true);
    expect(isSecretPlaceholder(btoa(signed))).toBe(true);
    expect(isSecretPlaceholder(btoa('public certificate'))).toBe(false);
    expect(revealedFields({ password: signed, key: [signed], name: 'node' }, { password: 'private', key: ['one','two'], name: 'node' })).toEqual([{ path: 'password', value: 'private' }, { path: 'key', value: '["one","two"]' }]);
});
it('preserves an opaque draft while allowing ordinary settings and disabling secret fields', async () => {
    session(['nodes:write']);
    const change = vi.fn();
    const view = await render(<SecretValues value={{ password: signed }}><Input aria-label="name" value="node" onChange={change} /><Input secret aria-label="password" value={signed} onChange={change} /><Textarea secret aria-label="new private key" value="" onChange={change} /></SecretValues>);
    expect(view.querySelector<HTMLInputElement>('[aria-label="name"]')!.disabled).toBe(false);
    const password = view.querySelector<HTMLInputElement>('[aria-label="password"]')!;
    expect(password.disabled).toBe(true); expect(password.value).toBe(''); expect(password.placeholder).toBe('secrets.savedValue');
    expect(view.querySelector<HTMLTextAreaElement>('textarea')!.disabled).toBe(true);
    expect(change).not.toHaveBeenCalled(); expect(view.textContent).not.toContain(signed);
    expect(view.textContent).not.toContain('secrets.reveal');
});
it('replaces a saved value with exactly the typed text, never its display label', async () => {
    session(['secrets:manage']);
    let draft = signed;
    function Editor() { const [value,setValue] = useState(signed); return <SecretValues value={{ password: value }}><Input secret required value={value} onChange={event => { draft = event.target.value; setValue(draft); }} /></SecretValues>; }
    const view = await render(<Editor />);
    const input = view.querySelector<HTMLInputElement>('input')!;
    expect(input.value).toBe(''); expect(input.required).toBe(false); expect(draft).toBe(signed);
    await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'replacement'); input.dispatchEvent(new Event('input', { bubbles: true })); });
    expect(draft).toBe('replacement'); expect(input.value).toBe('replacement'); expect(input.required).toBe(true);
});
it('reveals only after an explicit action and clears plaintext on permission changes', async () => {
    session(['secrets:read']); const load = vi.fn(async () => ({ password: 'private-proof', name: 'node' }));
    const value = { password: signed, name: 'node' };
    const view = await render(<SecretValues value={value} load={load}><Input secret value={signed} readOnly /></SecretValues>);
    expect(load).not.toHaveBeenCalled();
    await act(async () => view.querySelector<HTMLButtonElement>('button')!.click());
    expect(view.textContent).toContain('private-proof'); expect(value.password).toBe(signed);
    expect(view.querySelector<HTMLInputElement>('input')!.value).toBe('');
    expect(JSON.stringify(localStorage)).not.toContain('private-proof');
    await act(async () => updatePrincipal({ userId: 'user', credentialType: 'session', permissions: [] }));
    expect(view.textContent).not.toContain('private-proof'); expect(view.textContent).not.toContain('secrets.reveal');
});
it('aborts an in-flight reveal when the authenticated account changes', async () => {
    session(['secrets:read']); let signal: AbortSignal | undefined; let complete!: (value: { password: string }) => void;
    const load = vi.fn((s: AbortSignal) => { signal = s; return new Promise<{ password: string }>(resolve => { complete = resolve; }); });
    const view = await render(<SecretValues value={{ password: signed }} load={load}><span>editor</span></SecretValues>);
    await act(async () => view.querySelector<HTMLButtonElement>('button')!.click());
    await act(async () => updatePrincipal({ userId: 'other', credentialType: 'session', permissions: ['secrets:read'] }));
    expect(signal?.aborted).toBe(true);
    await act(async () => complete({ password: 'late-private-proof' }));
    expect(view.textContent).not.toContain('late-private-proof');
});
