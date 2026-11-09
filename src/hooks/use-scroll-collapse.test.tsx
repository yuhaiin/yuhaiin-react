import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { useScrollCollapse } from './use-scroll-collapse';

it('collapses on a long scroll down, restores on scroll up, near the top and on navigation', () => {
    const main = document.createElement('main');
    const scroller = document.createElement('div');
    Object.defineProperty(scroller, 'clientHeight', { value: window.innerHeight });
    main.append(scroller); document.body.append(main);
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    function Probe({ page }: { page: object }) { return <span>{String(useScrollCollapse(page, true).collapsed)}</span>; }
    const pageA = {}, pageB = {};
    const scrollTo = (top: number) => act(() => { scroller.scrollTop = top; scroller.dispatchEvent(new Event('scroll')); });
    try {
        act(() => root.render(<Probe page={pageA} />));
        scrollTo(100); scrollTo(110);
        expect(host.textContent).toBe('false'); // jitter below the threshold
        scrollTo(200);
        expect(host.textContent).toBe('true');
        scrollTo(170);
        expect(host.textContent).toBe('false');
        scrollTo(400); expect(host.textContent).toBe('true');
        scrollTo(20); expect(host.textContent).toBe('false'); // near the top
        scrollTo(400); expect(host.textContent).toBe('true');
        act(() => root.render(<Probe page={pageB} />));
        expect(host.textContent).toBe('false'); // a new navigation entry
        // Back to the first page is another snapshot object, as navigation.ts emits one per entry change.
        act(() => root.render(<Probe page={{ ...pageA }} />));
        expect(host.textContent).toBe('false');
    } finally { act(() => root.unmount()); host.remove(); main.remove(); }
});
