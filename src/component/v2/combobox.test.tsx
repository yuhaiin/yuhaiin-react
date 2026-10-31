import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { Combobox } from './combobox';

vi.mock('@radix-ui/react-popover', () => ({
    Root: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Anchor: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Portal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

it('retains the highlighted option on rerender and falls back when that option disappears', () => {
    const onChange = vi.fn();
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    function Probe() {
        const [, setEpoch] = useState(0);
        const [withoutBeta, setWithoutBeta] = useState(false);
        return <><button type="button" onClick={() => setEpoch(value => value + 1)}>rerender options</button><button type="button" onClick={() => setWithoutBeta(true)}>remove beta</button><Combobox value="" onChange={onChange} options={[
            { value: 'alpha', label: 'Alpha' },
            ...withoutBeta ? [] : [{ value: 'beta', label: 'Beta' }],
            { value: 'gamma', label: 'Gamma' },
        ]}/></>;
    }
    try {
        act(() => root.render(<Probe />));
        const input = host.querySelector('input')!;
        act(() => input.focus());
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })));
        expect(host.querySelectorAll('[data-highlighted="true"]')[0]?.textContent).toContain('Beta');
        act(() => host.querySelector('button')!.click());
        expect(host.querySelectorAll('[data-highlighted="true"]')[0]?.textContent).toContain('Beta');
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
        expect(onChange).toHaveBeenCalledWith('beta');
        // Reopen before removing the highlighted option.
        act(() => input.blur());
        act(() => input.focus());
        expect(host.querySelector('[data-highlighted="true"]')?.textContent).toContain('Beta');
        act(() => host.querySelectorAll('button')[1].click());
        expect(host.querySelectorAll('[data-highlighted="true"]')[0]?.textContent).toContain('Alpha');
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
        expect(onChange).toHaveBeenLastCalledWith('alpha');
    } finally {
        act(() => root.unmount());
        host.remove();
    }
});
