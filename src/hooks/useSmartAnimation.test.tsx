import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { useSmartAnimation } from './useSmartAnimation';
import { navigationOrder } from '@/docs/nav/navigation';

it('slides in navigation order and retains direction through rerenders and trailing slashes', () => {
    const host = document.createElement('div');
    const root = createRoot(host);
    function Probe({ location }: { location: string }) {
        return <span>{useSmartAnimation(location, navigationOrder)}</span>;
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
    render('/docs/group/selectors');
    render('/docs/group/subscribe');
    expect(host.textContent).toBe('1');
    render('/docs/bypass/resolver');
    render('/docs/diagnostics');
    expect(host.textContent).toBe('1');
    act(() => root.unmount());
});
