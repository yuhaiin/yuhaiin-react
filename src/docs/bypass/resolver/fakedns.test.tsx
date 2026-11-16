import { authorizeTest } from '@/test/auth';
import { establishSession } from '@/auth/session';
import { getApiUrl } from '@/common/apiurl';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Fakedns } from './fakedns';

const api = vi.hoisted(() => ({ getFakeDNS: vi.fn(), saveFakeDNS: vi.fn() }));
const route = vi.hoisted(() => ({ listRouteLists: vi.fn() }));
vi.mock('@/api/resolvers', () => api);
vi.mock('@/api/route', () => route);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, values?: { id?: string }) => values?.id ? `${key} ${values.id}` : key }) }));

let root: Root, host: HTMLDivElement;
beforeEach(() => {
    vi.clearAllMocks();
    api.getFakeDNS.mockResolvedValue({ enabled: true, ipv4Range: '198.18.0.0/16', ipv6Range: '', whitelist: ['inline.example'], skipCheckList: [], whitelistListIds: ['deleted'], skipCheckListIds: [] });
    api.saveFakeDNS.mockImplementation(async (next: unknown) => next);
    route.listRouteLists.mockResolvedValue({
        items: [
            { id: 'vpn', name: 'VPN hosts', type: 'host', source: 'local', itemCount: 2, errorCount: 0, preview: '' },
            { id: 'hosts', name: 'Hosts file', type: 'hosts_as_host', source: 'remote', itemCount: 2, errorCount: 0, preview: '' },
            { id: 'apps', name: 'Apps', type: 'process', source: 'local', itemCount: 1, errorCount: 0, preview: '' },
            { id: 'owned', name: 'Rule private', ownerRuleId: 'r1', type: 'host', source: 'local', itemCount: 1, errorCount: 0, preview: '' },
        ],
        page: { page: 1, pageSize: 100, total: 4 },
    });
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
beforeEach(authorizeTest);
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });

async function render() { await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><Fakedns /></SWRConfig>)); }
const pickers = () => [...host.querySelectorAll('fieldset fieldset')] as HTMLFieldSetElement[];
const chips = (picker: Element) => [...picker.querySelectorAll('label')].map(label => label.textContent?.trim());

it('offers shared host lists for both FakeDNS lists and saves the selected IDs', async () => {
    await render();
    const [whitelist, skipCheck] = pickers();
    expect(chips(whitelist)).toEqual(['VPN hosts', 'Hosts file', 'fakednsMissingList deleted']);
    expect(chips(skipCheck)).toEqual(['VPN hosts', 'Hosts file']);

    const vpn = [...skipCheck.querySelectorAll('label')].find(label => label.textContent?.includes('VPN hosts'))!.querySelector('input')!;
    await act(async () => vpn.click());
    const save = [...host.querySelectorAll('button')].find(button => button.textContent?.trim() === 'save')!;
    await act(async () => save.click());
    expect(api.saveFakeDNS).toHaveBeenCalledWith(expect.objectContaining({ whitelist: ['inline.example'], whitelistListIds: ['deleted'], skipCheckListIds: ['vpn'] }));
});

it('keeps references read-only without routes:read', async () => {
    establishSession('test-only-session', { userId: 'resolver-admin', credentialType: 'session', permissions: ['resolver:read', 'resolver:write'] }, Math.floor(Date.now() / 1000) + 600, getApiUrl());
    await render();
    expect(route.listRouteLists).not.toHaveBeenCalled();
    for (const picker of pickers()) {
        expect(picker.disabled).toBe(true);
        expect(picker.textContent).toContain('fakednsSharedListsNoPermission');
    }
});
