import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { useSmartAnimation } from './useSmartAnimation';

it('slides in navigation order and retains direction through rerenders and trailing slashes', () => {
    const paths = ['/', '/docs/group', '/docs/config/log', '/docs/config/licenses'];
    const host = document.createElement('div');
    const root = createRoot(host);
    function Probe({ location }: { location: string }) {
        return <span>{useSmartAnimation(location, paths)}</span>;
    }
    const render = (location: string) => act(() => root.render(<Probe location={location} />));
    render('/docs/group');
    expect(host.textContent).toBe('0');
    render('/docs/config/licenses');
    expect(host.textContent).toBe('1');
    render('/docs/config/licenses/');
    expect(host.textContent).toBe('1');
    render('/docs/config/log');
    expect(host.textContent).toBe('-1');
    render('/docs/config/log');
    expect(host.textContent).toBe('-1');
    render('/docs/group');
    expect(host.textContent).toBe('-1');
    render('/docs/config/log');
    expect(host.textContent).toBe('1');
    act(() => root.unmount());
});

it('follows the current sidebar order across groups', async () => {
    const { navigationOrder: order } = await import('@/docs/nav/navigation');
    const host = document.createElement('div');
    const root = createRoot(host);
    function Probe({ location }: { location: string }) { return <span>{useSmartAnimation(location, order)}</span>; }
    const render = (location: string) => act(() => root.render(<Probe location={location} />));
    try {
        render('/docs/connections/v2');
        render('/docs/group');
        expect(host.textContent).toBe('1');
        render('/docs/group/selectors');
        render('/docs/group/subscribe');
        expect(host.textContent).toBe('1');
        render('/docs/bypass/resolver');
        render('/docs/diagnostics');
        expect(host.textContent).toBe('1');
    } finally { act(() => root.unmount()); }
});

it('cross-fades between tab-bar sections but still slides on Back and inside a section', async () => {
    const { transitionDirection } = await import('./useSmartAnimation');
    const section = (path: string) => path.startsWith('/docs/group') ? 'nodes' : path.startsWith('/docs/bypass') ? 'routing' : undefined;
    expect(transitionDirection('/docs/group', '/docs/bypass', [], 1, 2, section)).toBe(0);
    expect(transitionDirection('/docs/bypass', '/docs/config/log', [], 1, 2, section)).toBe(0);
    expect(transitionDirection('/docs/bypass', '/docs/group', [], 2, 1, section)).toBe(-1);
    expect(transitionDirection('/docs/group', '/docs/group/selectors', [], 1, 2, section)).toBe(1);
});
