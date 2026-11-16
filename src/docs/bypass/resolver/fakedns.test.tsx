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
const createList = vi.hoisted(() => ({ props: undefined as undefined | { open: boolean; onSaved: (id: string) => void } }));
vi.mock('@/api/resolvers', () => api);
vi.mock('@/api/route', () => route);
vi.mock('../list/page', () => ({ CreateListModal: (props: { open: boolean; onSaved: (id: string) => void }) => { createList.props = props; return null; } }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, values?: { id?: string }) => values?.id ? `${key} ${values.id}` : key }) }));

let root: Root, host: HTMLDivElement;
const sharedLists = [
    { id: 'vpn', name: 'VPN hosts', type: 'host', source: 'local', itemCount: 2, errorCount: 0, preview: '' },
    { id: 'hosts', name: 'Hosts file', type: 'hosts_as_host', source: 'remote', itemCount: 2, errorCount: 0, preview: '' },
    { id: 'apps', name: 'Apps', type: 'process', source: 'local', itemCount: 1, errorCount: 0, preview: '' },
    { id: 'owned', name: 'Rule private', ownerRuleId: 'r1', type: 'host', source: 'local', itemCount: 1, errorCount: 0, preview: '' },
];
beforeEach(() => {
    vi.clearAllMocks();
    createList.props = undefined;
    api.getFakeDNS.mockResolvedValue({ enabled: true, ipv4Range: '198.18.0.0/16', ipv6Range: '', whitelistListIds: ['deleted'], skipCheckListIds: [] });
    api.saveFakeDNS.mockImplementation(async (next: unknown) => next);
    route.listRouteLists.mockImplementation(async () => ({ items: sharedLists, page: { page: 1, pageSize: 100, total: sharedLists.length } }));
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
beforeEach(authorizeTest);
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });

async function render() { await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><Fakedns /></SWRConfig>)); }
const pickers = () => [...host.querySelectorAll('fieldset fieldset')] as HTMLFieldSetElement[];
const chips = (picker: Element) => [...picker.querySelectorAll('label')].map(label => label.textContent?.trim());
const button = (picker: Element | Document, text: string) => [...picker.querySelectorAll('button')].find(b => b.textContent?.trim() === text)!;

it('edits FakeDNS lists only through shared host lists and saves the selected IDs', async () => {
    await render();
    expect(host.querySelector('textarea')).toBeNull();
    const [whitelist, skipCheck] = pickers();
    expect(chips(whitelist)).toEqual(['VPN hosts', 'Hosts file', 'fakednsMissingList deleted']);
    expect(chips(skipCheck)).toEqual(['VPN hosts', 'Hosts file']);
    expect(whitelist.querySelector('a')?.getAttribute('href')).toContain('/docs/bypass/list');

    const vpn = [...skipCheck.querySelectorAll('label')].find(label => label.textContent?.includes('VPN hosts'))!.querySelector('input')!;
    await act(async () => vpn.click());
    await act(async () => button(document, 'save').click());
    const saved = api.saveFakeDNS.mock.calls[0][0];
    expect(saved).toMatchObject({ whitelistListIds: ['deleted'], skipCheckListIds: ['vpn'] });
    expect(saved).not.toHaveProperty('whitelist');
});

it('selects a list created from the FakeDNS card', async () => {
    await render();
    await act(async () => button(pickers()[1], 'fakednsNewList').click());
    expect(createList.props?.open).toBe(true);
    sharedLists.push({ id: 'new', name: 'New list', type: 'host', source: 'local', itemCount: 1, errorCount: 0, preview: '' });
    await act(async () => createList.props!.onSaved('new'));
    expect(createList.props?.open).toBe(false);
    expect(chips(pickers()[1])).toContain('New list');
    expect((pickers()[1].querySelector('input[type=checkbox]:checked')?.closest('label'))?.textContent).toContain('New list');
    sharedLists.pop();
});

it('keeps the inline editors for an older Core that still stores entries inline', async () => {
    api.getFakeDNS.mockResolvedValue({ enabled: true, ipv4Range: '198.18.0.0/16', ipv6Range: '', whitelist: ['inline.example'], skipCheckList: [] });
    await render();
    expect(pickers()).toHaveLength(0);
    expect(host.querySelectorAll('textarea')).toHaveLength(2);
    expect(host.textContent).toContain('inline.example');
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
