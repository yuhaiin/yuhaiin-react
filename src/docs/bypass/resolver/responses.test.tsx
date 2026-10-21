import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { GlobalToastContext } from '@/component/v2/toast';
import { CustomResponses } from './responses';

const api = vi.hoisted(() => ({ getResponseRules: vi.fn(), saveResponseRules: vi.fn(), listDNSQueryTypes: vi.fn() }));
vi.mock('@/api/resolvers', () => api);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, values?: { number: number }) => values ? `${key} ${values.number}` : key }) }));
let root: Root, host: HTMLDivElement;
const toast = { Info: vi.fn(), Error: vi.fn() };
beforeEach(() => {
    vi.clearAllMocks();
    api.getResponseRules.mockResolvedValue({ rules: [] });
    api.saveResponseRules.mockImplementation(async value => value);
    api.listDNSQueryTypes.mockResolvedValue({ types: ['A', 'AAAA', 'HTTPS', 'TXT'] });
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });
async function render() {
    await act(async () => root.render(<SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}><GlobalToastContext.Provider value={toast}><CustomResponses /></GlobalToastContext.Provider></SWRConfig>));
}
async function click(label: string, index = 0) {
    const buttons = [...host.querySelectorAll('button')].filter(button => button.getAttribute('aria-label') === label || button.textContent?.trim() === label);
    if (!buttons[index]) throw Error('Missing ' + label);
    await act(async () => buttons[index].click());
}
async function save() {
    await act(async () => host.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}

it('adds the requested examples, reorders them, saves and clears rules', async () => {
    await render();
    expect(host.textContent).toContain('dnsResponsesEmpty');
    await click('dnsResponseBlockHTTPS');
    await click('dnsResponseMapAAAA');
    await click('dnsResponseMoveUp', 1);
    expect([...host.querySelectorAll('input')].filter(input => input.type === 'text').map(input => input.value)).toEqual(['*.a.example.com', '*.example.com']);
    await save();
    expect(api.saveResponseRules).toHaveBeenLastCalledWith({ rules: [
        { domain: '*.a.example.com', queryType: 'AAAA', rcode: 'NOERROR', ttl: 300, answers: ['::1'] },
        { domain: '*.example.com', queryType: 'HTTPS', rcode: 'NXDOMAIN', ttl: 0, answers: [] },
    ] });
    await click('dnsResponseRemove');
    await click('dnsResponseRemove');
    await save();
    expect(api.saveResponseRules).toHaveBeenLastCalledWith({ rules: [] });
});

it('retains a failed save for retry and resets edits to the server version', async () => {
    await render();
    await click('dnsResponseMapAAAA');
    api.saveResponseRules.mockRejectedValueOnce({ msg: 'Invalid response data' });
    await save();
    expect(toast.Error).toHaveBeenCalledWith('Invalid response data');
    expect(host.querySelector('textarea')?.value).toBe('::1');
    await save();
    expect(api.saveResponseRules).toHaveBeenCalledTimes(2);
    await click('dnsResponseBlockHTTPS');
    await click('reset');
    expect(host.querySelectorAll('section')).toHaveLength(1);
    expect(host.querySelector('textarea')?.value).toBe('::1');
});

it('locks edits while saving and prevents duplicate submissions', async () => {
    let complete: (value: unknown) => void = () => undefined;
    api.saveResponseRules.mockImplementationOnce(() => new Promise(resolve => { complete = resolve; }));
    await render();
    await click('dnsResponseMapAAAA');
    await save(); await save();
    expect(api.saveResponseRules).toHaveBeenCalledOnce();
    expect(host.querySelector('fieldset')?.disabled).toBe(true);
    await act(async () => complete({ rules: [{ domain: '*.a.example.com', queryType: 'AAAA', rcode: 'NOERROR', ttl: 300, answers: ['::1'] }] }));
    expect(host.querySelector('fieldset')?.disabled).toBe(false);
});
