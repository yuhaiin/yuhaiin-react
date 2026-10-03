import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import { usePagination } from './use-pagination';

it('resets on filters and clamps before slicing when data shrinks', () => {
    let pagination: ReturnType<typeof usePagination>;
    function Probe({ total, filter }: { total: number; filter: string }) {
        pagination = usePagination(total, 30, filter);
        return <div>{pagination.page}</div>;
    }
    const container = document.createElement('div');
    const root = createRoot(container);
    act(() => root.render(<Probe total={95} filter="all" />));
    act(() => pagination.setPage(2));
    expect(container.textContent).toBe('2');
    act(() => root.render(<Probe total={95} filter="udp" />));
    expect(container.textContent).toBe('1');
    act(() => pagination.setPage(4));
    act(() => root.render(<Probe total={1} filter="udp" />));
    expect(container.textContent).toBe('1');
    act(() => root.render(<Probe total={95} filter="udp" />));
    expect(container.textContent).toBe('1');
    act(() => root.unmount());
});
