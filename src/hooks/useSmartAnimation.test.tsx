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
