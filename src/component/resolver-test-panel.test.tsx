import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ResolverTestPanel } from './resolver-test-panel';
import { createDefaultResolver } from '@/contract/resolver';

const api = vi.hoisted(() => ({ listDNSQueryTypes: vi.fn(), testResolver: vi.fn() }));
vi.mock('@/api/resolvers', () => api);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
let root: Root, host: HTMLDivElement;
const notify = vi.fn();
const resolver = { ...createDefaultResolver('draft'), name: 'Draft', type: 'udp' as const, host: '192.0.2.1:53' };

beforeEach(() => {
    vi.clearAllMocks();
    api.listDNSQueryTypes.mockResolvedValue({ types: ['A', 'AAAA', 'TXT', 'MX', 'CAA'] });
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });
async function render() {
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}>
        <ResolverTestPanel resolver={resolver} disabled={false} onPendingChange={notify} />
    </SWRConfig>));
}
function click(label: string) {
    const button = [...host.querySelectorAll('button')].find(button => button.textContent?.trim() === label);
    if (!button) throw Error('Missing ' + label);
    return act(async () => button.click());
}

it('tests the displayed draft with defaults and shows diagnostic errors and latency', async () => {
    api.testResolver.mockResolvedValue({ domain: 'example.com.', queryType: 'A', elapsedMs: 12.5, rcode: '', records: [], error: 'Connection refused' });
    await render();
    await click('runResolverTest');
    expect(api.testResolver).toHaveBeenCalledWith({ resolver, domain: 'example.com', queryType: 'A' }, expect.any(AbortSignal));
    expect(host.querySelector('[role="alert"]')?.textContent).toBe('Connection refused');
    expect(host.textContent).toContain('12.5 ms');
    expect(notify).toHaveBeenCalledWith(true);
    expect(notify).toHaveBeenLastCalledWith(false);
});

it('aborts a pending query and does not display a late result', async () => {
    let finish: (value: unknown) => void = () => undefined;
    api.testResolver.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    await render();
    await click('runResolverTest');
    expect(host.querySelector('input')?.matches(':disabled')).toBe(true);
    await click('cancelTest');
    expect(api.testResolver.mock.calls[0][1].aborted).toBe(true);
    await act(async () => finish({ domain: 'old.example.', queryType: 'A', elapsedMs: 1, rcode: 'NOERROR', records: [] }));
    expect(host.textContent).not.toContain('old.example.');
    expect(notify).toHaveBeenLastCalledWith(false);
});
