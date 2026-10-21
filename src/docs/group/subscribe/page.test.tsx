import { authorizeTest, resetTestAuth } from '@/test/auth';
import { confirmAction } from '@/component/v2/confirmation';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Subscribe, { subscriptionSource } from './page';

const api = vi.hoisted(() => ({ listSubscriptions: vi.fn(), saveSubscriptions: vi.fn(), deleteSubscriptions: vi.fn(), updateSubscriptions: vi.fn() }));
vi.mock('@/api/subscriptions', () => api);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/hooks/use-media-query', () => ({ useMediaQuery: () => true }));
let root: Root, host: HTMLDivElement;
let items: { name: string; type: string; url: string }[];
beforeEach(() => {
    vi.clearAllMocks();
    items = [{ name: 'Alpha', type: 'reserve', url: 'https://alpha.example/sub?token=private' }, { name: 'Beta', type: 'reserve', url: 'https://beta.example/sub' }];
    api.listSubscriptions.mockImplementation(async () => ({ items }));
    api.saveSubscriptions.mockImplementation(async (next: typeof items) => { items = [...items.filter(item => item.name !== next[0].name), ...next]; });
    api.updateSubscriptions.mockResolvedValue(undefined);
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
beforeEach(authorizeTest);
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });
async function render() { await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><Subscribe /></SWRConfig>)); }
async function click(label: string) {
    const button = [...host.querySelectorAll('button')].find(button => button.getAttribute('aria-label') === label || button.textContent?.trim() === label);
    if (!button) throw Error('Missing ' + label);
    await act(async () => button.click());
}
function input(value: string, next: string) {
    const field = [...host.querySelectorAll('input')].find(input => input.value === value)!;
    act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(field, next); field.dispatchEvent(new Event('input', { bubbles: true })); });
}
it('guards selection, saves only the edited subscription, and updates saved settings', async () => {
    await render();
    expect(host.querySelector('aside')?.textContent).not.toContain('token=private');
    input(items[0].url, 'https://changed.example/sub');
    const confirm = vi.mocked(confirmAction).mockResolvedValue(false);
    await click('Beta');
    expect([...host.querySelectorAll('input')].some(input => input.value === 'https://changed.example/sub')).toBe(true);
    await click('save');
    expect(api.saveSubscriptions).toHaveBeenCalledExactlyOnceWith([{ name: 'Alpha', type: 'reserve', url: 'https://changed.example/sub' }]);
    await click('update'); expect(api.updateSubscriptions).toHaveBeenCalledExactlyOnceWith(['Alpha']);
    confirm.mockResolvedValue(true); await click('Beta');
    expect([...host.querySelectorAll('input')].some(input => input.value === 'https://beta.example/sub')).toBe(true);
});
it('rejects a duplicate name when adding instead of replacing the existing subscription', async () => {
    await render(); await click('add');
    const fields = [...host.querySelectorAll<HTMLInputElement>('section[aria-label="subscriptionsTitle"] input')];
    act(() => {
        for (const [field, value] of [[fields[0], 'Alpha'], [fields[1], 'https://other.example/sub']] as const) {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(field, value);
            field.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    await click('save'); expect(api.saveSubscriptions).not.toHaveBeenCalled(); expect(host.querySelector('[role=alert]')?.textContent).toBe('subscriptionNameConflict');
});

it('shows only a source summary for HTTP and encoded subscription links', () => {
    expect(subscriptionSource('https://user:secret@source.example/sub?token=private')).toBe('source.example');
    expect(subscriptionSource('yuhaiin://very-long-encoded-secret')).toBe('yuhaiin');
    expect(subscriptionSource('invalid encoded secret')).toBe('—');
});

vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));

afterEach(resetTestAuth);
