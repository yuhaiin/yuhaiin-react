import { confirmAction } from '@/component/v2/confirmation';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useCloseGuard, useEditorDraft } from '@/hooks/use-editor-draft';
import ResolverPage from './page';

const api = vi.hoisted(() => ({ listResolvers: vi.fn(), deleteResolver: vi.fn() }));
vi.mock('@/api/resolvers', () => api);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/hooks/use-media-query', () => ({ useMediaQuery: () => true }));
vi.mock('./roles', () => ({ DNSRoles: () => <div>Query policies</div> }));
vi.mock('./server', () => ({ Server: () => <div>DNS listener</div> }));
vi.mock('./hosts', () => ({ Hosts: () => null }));
vi.mock('./fakedns', () => ({ Fakedns: () => null }));
vi.mock('./fakeip', () => ({ FakeIPList: () => <div>FakeIP mappings</div> }));
vi.mock('./cache', () => ({ DNSCache: () => <div>Cache browser</div> }));
vi.mock('@/component/resolver-editor', () => ({ ResolverModal: ({ id }: { id: string }) => {
    const { value, setValue, dirty } = useEditorDraft(id, undefined, () => ({ name: id }));
    useCloseGuard(dirty, false, () => undefined);
    return <input aria-label="Editor name" value={value.name} onChange={event => setValue({ name: event.target.value })} />;
} }));
let root: Root, host: HTMLDivElement;
beforeEach(() => {
    vi.clearAllMocks();
    api.listResolvers.mockResolvedValue({ items: [{ id: 'one', name: 'One', type: 'udp', host: '192.0.2.1' }], page: { page: 1, pageSize: 12, total: 1 } });
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });
async function render() {
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><ResolverPage /></SWRConfig>));
}
async function tab(label: string) {
    const trigger = [...host.querySelectorAll<HTMLButtonElement>('[role=tab]')].find(button => button.textContent === label);
    if (!trigger) throw Error('Missing ' + label);
    await act(async () => {
        trigger.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0, ctrlKey: false }));
        trigger.click();
    });
}

it('switches between resolver editing, query policies, the listener and FakeIP mappings', async () => {
    await render();
    expect(host.querySelector('input[aria-label="Editor name"]')).not.toBeNull();
    expect(host.textContent).not.toContain('Query policies');
    expect(host.textContent).not.toContain('DNS listener');
    await tab('dnsRolesTab');
    expect(host.textContent).toContain('Query policies');
    expect(host.querySelector('input[aria-label="Editor name"]')).toBeNull();
    await tab('dnsServerTab');
    expect(host.textContent).toContain('DNS listener');
    await tab('fakeIPTab');
    expect(host.textContent).toContain('FakeIP mappings');
});

it('guards leaving a tab with an unsaved resolver draft', async () => {
    await render();
    const input = host.querySelector<HTMLInputElement>('[aria-label="Editor name"]')!;
    act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Changed');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const confirm = vi.mocked(confirmAction).mockResolvedValue(false);
    await tab('dnsCacheTab');
    expect(host.querySelector<HTMLInputElement>('[aria-label="Editor name"]')?.value).toBe('Changed');
    expect(confirm).toHaveBeenCalledOnce();
    confirm.mockResolvedValue(true);
    await tab('dnsCacheTab');
    expect(host.textContent).toContain('Cache browser');
});

vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
