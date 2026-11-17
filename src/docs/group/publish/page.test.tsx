import { authorizeTest } from '@/test/auth';
import { operationPermissions } from '@/auth/operations';
import { establishSession } from '@/auth/session';
import { getApiUrl } from '@/common/apiurl';
import { confirmAction } from '@/component/v2/confirmation';
import { secretPlaceholder } from '@/auth/secret-fields';
import type { ShareFeed } from '@/contract/subscription';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import SharePage from './page';
import { moveEntry, toggleEntry } from './share-entries';

const api = vi.hoisted(() => ({
    shareFeedsKey: '/api/v2/share-feeds',
    listShareFeeds: vi.fn(), createShareFeed: vi.fn(), updateShareFeed: vi.fn(), deleteShareFeed: vi.fn(),
    rotateShareFeed: vi.fn(), previewShareFeed: vi.fn(), getShareFeedToken: vi.fn(),
}));
const nodes = vi.hoisted(() => ({ listNodeGroups: vi.fn(), getNode: vi.fn(), listNodes: vi.fn() }));
vi.mock('@/api/subscriptions', () => api);
vi.mock('@/api/nodes', () => nodes);
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }) }));
vi.mock('@/hooks/use-media-query', () => ({ useMediaQuery: () => true }));
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));

let root: Root, host: HTMLDivElement;
let items: ShareFeed[];
const writeText = vi.fn();
const feed = (value: Partial<ShareFeed>): ShareFeed => ({ id: 'feed', name: 'Friends', enabled: true, token: 'tok', baseUrl: 'https://example.com', entries: [], createdAt: 1, updatedAt: 1, lastAccess: 0, accessCount: 0, ...value });

beforeEach(() => {
    vi.clearAllMocks();
    items = [
        feed({ id: 'a', name: 'Alpha', token: 'alpha-token', entries: [{ kind: 'group', value: 'aws' }, { kind: 'node', value: 'n1' }] }),
        feed({ id: 'b', name: 'Beta', enabled: false, token: '' }),
    ];
    api.listShareFeeds.mockImplementation(async () => ({ items }));
    api.previewShareFeed.mockResolvedValue({ nodes: [{ id: 'n1', name: 'one', group: 'aws', from: 'node' }], skipped: [{ id: 'set', name: 'balanced', reason: 'references_local_nodes' }], missing: [] });
    api.createShareFeed.mockImplementation(async (next: ShareFeed) => { const saved = { ...next, id: 'created', token: 'new-token' }; items = [...items, saved]; return saved; });
    api.updateShareFeed.mockImplementation(async (next: ShareFeed) => next);
    nodes.listNodeGroups.mockResolvedValue({ items: [{ name: 'aws', count: 3, enabled: 2 }, { name: 'tokyo', count: 1, enabled: 1 }] });
    nodes.getNode.mockImplementation(async (id: string) => ({ id, name: `node ${id}` }));
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    writeText.mockResolvedValue(undefined);
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
beforeEach(authorizeTest);
afterEach(() => { act(() => root.unmount()); host.remove(); vi.restoreAllMocks(); });

async function render() { await act(async () => root.render(<SWRConfig value={{ provider: () => new Map() }}><SharePage /></SWRConfig>)); }
function button(label: string) {
    const found = [...host.ownerDocument.querySelectorAll('button')].find(item => item.getAttribute('aria-label') === label || item.textContent?.trim() === label)
        ?? [...host.ownerDocument.querySelectorAll<HTMLButtonElement>('button[aria-pressed]')].find(item => item.textContent?.trim().startsWith(label));
    if (!found) throw Error('Missing ' + label);
    return found;
}
async function click(label: string) { await act(async () => button(label).click()); }
async function settle() { await act(async () => { await new Promise(resolve => setTimeout(resolve, 350)); }); }

it('shows the feed link, copies it and summarizes the published nodes', async () => {
    await render(); await settle();
    const link = [...host.querySelectorAll('input')].find(input => input.readOnly)!;
    expect(link.value).toBe('https://example.com/share/alpha-token');
    expect(host.textContent).toContain('share.summary');
    expect(host.textContent).toContain('node n1');
    expect(host.textContent).toContain('share.reason.references_local_nodes');
    expect(api.previewShareFeed).toHaveBeenLastCalledWith([{ kind: 'group', value: 'aws' }, { kind: 'node', value: 'n1' }]);
    await click('share.copy');
    expect(writeText).toHaveBeenCalledWith('https://example.com/share/alpha-token');
    expect(api.getShareFeedToken).not.toHaveBeenCalled();
});

it('reads a masked token only when copying', async () => {
    items = [feed({ id: 'a', name: 'Alpha', token: secretPlaceholder })];
    api.getShareFeedToken.mockResolvedValue('revealed');
    establishSession('test-only-session', { userId: 'test-admin', credentialType: 'session', permissions: [...new Set([...Object.values(operationPermissions), 'secrets:read'])] }, Math.floor(Date.now() / 1000) + 600, getApiUrl());
    await render();
    const link = [...host.querySelectorAll('input')].find(input => input.readOnly)!;
    expect(link.value).not.toContain(secretPlaceholder);
    await click('share.copy');
    expect(api.getShareFeedToken).toHaveBeenCalledWith('a');
    expect(writeText).toHaveBeenCalledWith('https://example.com/share/revealed');
});

it('creates a feed from chosen groups without sending a token', async () => {
    await render();
    await click('add');
    const name = host.querySelector<HTMLInputElement>('section[aria-label="share.title"] input')!;
    act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(name, ' Team '); name.dispatchEvent(new Event('input', { bubbles: true })); });
    await click('share.addGroup');
    await click('tokyo');
    await click('close');
    await click('save');
    expect(api.createShareFeed).toHaveBeenCalledOnce();
    const created = api.createShareFeed.mock.calls[0][0] as ShareFeed;
    expect(created).toMatchObject({ name: 'Team', enabled: true, entries: [{ kind: 'group', value: 'tokyo' }] });
    expect(created.token).toBe('');
});

it('reissues the link after confirmation and marks feeds without a link', async () => {
    api.rotateShareFeed.mockImplementation(async () => feed({ id: 'a', name: 'Alpha', token: 'rotated' }));
    await render();
    expect(host.querySelector('aside')?.textContent ?? host.textContent).toContain('share.disabled');
    vi.mocked(confirmAction).mockResolvedValue(false);
    await click('share.rotate');
    expect(api.rotateShareFeed).not.toHaveBeenCalled();
    vi.mocked(confirmAction).mockResolvedValue(true);
    await click('share.rotate');
    expect(api.rotateShareFeed).toHaveBeenCalledWith('a');
    await click('Beta');
    expect(host.textContent).toContain('share.noToken');
});

it('toggles and reorders entries', () => {
    const entries = [{ kind: 'group', value: 'a' }, { kind: 'node', value: 'b' }];
    expect(toggleEntry(entries, { kind: 'group', value: 'a' })).toEqual([{ kind: 'node', value: 'b' }]);
    expect(toggleEntry(entries, { kind: 'node', value: 'a' })).toHaveLength(3);
    expect(moveEntry(entries, 1, -1)).toEqual([entries[1], entries[0]]);
    expect(moveEntry(entries, 1, 1)).toBe(entries);
});
