import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';

let path = '/docs/group/selectors';
const navigate = vi.fn();
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('wouter', () => ({ useLocation: () => [path, navigate] }));
vi.mock('@/auth/context', () => ({ useSession: () => null }));

const { BottomNav, bottomTabs, hasOpenDetail } = await import('./BottomNav');
const { transitionDirection } = await import('@/hooks/useSmartAnimation');

it('hides for open records and drafts, not for tabs or filters', () => {
    for (const search of ['node=node-0', 'rule=r', 'new=rule', 'gateway=g', 'match=host&value=a', 'tab=x&inbound=i']) expect(hasOpenDetail(search)).toBe(true);
    for (const search of ['', 'tab=resolvers', 'group=work&q=a']) expect(hasOpenDetail(search)).toBe(false);
});

it('maps every sub-page to its tab and leaves the rest to More', () => {
    const owner = (p: string) => bottomTabs.find(tab => tab.owns(p))?.key ?? 'more';
    expect(owner('/')).toBe('home');
    expect(owner('/docs/group/subscribe')).toBe('nodes');
    expect(owner('/docs/bypass/resolver')).toBe('routing');
    expect(owner('/docs/bypass/block')).toBe('connections');
    expect(owner('/docs/connections/failed')).toBe('connections');
    expect(owner('/docs/config/log')).toBe('more');
    expect(owner('/docs/gateway')).toBe('more');
});

it('marks the owning tab, navigates to section roots and opens More', async () => {
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    const onMore = vi.fn();
    try {
        await act(async () => root.render(<BottomNav visible moreOpen={false} onMore={onMore} />));
        expect(host.querySelector('[aria-current="page"]')?.getAttribute('href')).toBe('#/docs/group');
        act(() => host.querySelector<HTMLAnchorElement>('a[href="#/docs/group"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true, button: 0 })));
        expect(navigate).toHaveBeenCalledWith('/docs/group');
        act(() => host.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!.click());
        expect(onMore).toHaveBeenCalled();
        await act(async () => root.render(<BottomNav visible={false} moreOpen={false} onMore={onMore} />));
        expect(host.querySelector('nav')?.hasAttribute('inert')).toBe(true);
    } finally { act(() => root.unmount()); host.remove(); }
});

it('reads Back as backwards and hierarchy before menu order', () => {
    const order = ['/', '/docs/group', '/docs/group/selectors', '/docs/bypass'];
    expect(transitionDirection('/docs/bypass', '/docs/group', order, 3, 2)).toBe(-1);
    expect(transitionDirection('/docs/group', '/docs/bypass', order, 2, 2)).toBe(1);
    expect(transitionDirection('/docs/bypass', '/docs/group/selectors', order, 1, 2)).toBe(-1);
    expect(transitionDirection('/docs/group/selectors', '/docs/group', order, 1, 2)).toBe(-1);
    expect(transitionDirection('/docs/group', '/docs/group/selectors', order, 1, 2)).toBe(1);
});
