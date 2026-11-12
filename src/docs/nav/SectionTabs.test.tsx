import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';

const navigate = vi.fn();
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('wouter', () => ({ useLocation: () => ['/docs/group/selectors', navigate] }));
vi.mock('@/auth/context', () => ({ useSession: () => null }));

const { SectionTabs, sectionLinks, sectionOf } = await import('./SectionTabs');

it('groups pages by their tab-bar section', () => {
    expect(sectionOf('/docs/group/subscribe')).toBe('nodes');
    expect(sectionOf('/docs/bypass/resolver/')).toBe('routing');
    expect(sectionOf('/docs/config/log')).toBeUndefined();
    const nodes = sectionLinks('/docs/group/selectors').map(link => link.path);
    expect(nodes[0]).toBe('/docs/group');
    expect(nodes).toContain('/docs/group/subscribe');
    expect(nodes.every(path => sectionOf(path) === 'nodes')).toBe(true);
    expect(sectionLinks('/docs/config/log')).toEqual([]);
});

it('marks the current page and navigates to its siblings', async () => {
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    try {
        await act(async () => root.render(<SectionTabs items={sectionLinks('/docs/group/selectors')} />));
        expect(host.querySelector('[aria-current="page"]')?.getAttribute('href')).toBe('#/docs/group/selectors');
        act(() => host.querySelector<HTMLAnchorElement>('a[href="#/docs/group"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })));
        expect(navigate).toHaveBeenCalledWith('/docs/group');
        navigate.mockClear();
        act(() => host.querySelector<HTMLAnchorElement>('[aria-current="page"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })));
        expect(navigate).not.toHaveBeenCalled();
    } finally { act(() => root.unmount()); host.remove(); }
});
