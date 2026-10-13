import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { usePagination } from './use-pagination';

it('resets on filters and clamps before slicing when data shrinks', () => {
    function Probe({ total, filter }: { total: number; filter: string }) {
        const pagination = usePagination(total, 30, filter);
        return <>
            <output>{pagination.page}</output>
            <button onClick={() => pagination.setPage(2)}>page 2</button>
            <button onClick={() => pagination.setPage(4)}>page 4</button>
        </>;
    }
    const container = document.createElement('div');
    const root = createRoot(container);
    const number = () => container.querySelector('output')?.textContent;
    try {
        act(() => root.render(<Probe total={95} filter="all" />));
        act(() => container.querySelectorAll('button')[0].click());
        expect(number()).toBe('2');
        act(() => root.render(<Probe total={95} filter="udp" />));
        expect(number()).toBe('1');
        act(() => container.querySelectorAll('button')[1].click());
        act(() => root.render(<Probe total={1} filter="udp" />));
        expect(number()).toBe('1');
        act(() => root.render(<Probe total={95} filter="udp" />));
        expect(number()).toBe('1');
    } finally {
        act(() => root.unmount());
    }
});
