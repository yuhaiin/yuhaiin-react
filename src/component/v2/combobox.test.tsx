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

it('keeps the highlighted option across parent option-array re-renders', () => {
    const originalScroll = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = vi.fn();
    const onChange = vi.fn();
    let rerender = () => {};
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    function Probe() {
        const [, setEpoch] = useState(0);
        rerender = () => setEpoch(value => value + 1);
        return <Combobox value="" onChange={onChange} options={[
            { value: 'alpha', label: 'Alpha' },
            { value: 'beta', label: 'Beta' },
            { value: 'gamma', label: 'Gamma' },
        ]}/>;
    }
    try {
        act(() => root.render(<Probe />));
        const input = host.querySelector('input')!;
        act(() => input.focus());
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })));
        expect(host.querySelectorAll('[data-highlighted="true"]')[0]?.textContent).toContain('Beta');
        act(() => rerender());
        expect(host.querySelectorAll('[data-highlighted="true"]')[0]?.textContent).toContain('Beta');
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
        expect(onChange).toHaveBeenCalledWith('beta');
    } finally {
        act(() => root.unmount());
        host.remove();
        Element.prototype.scrollIntoView = originalScroll;
    }
});

it('falls back to the first available option if a highlighted option disappears', () => {
    const originalScroll = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = vi.fn();
    const onChange = vi.fn();
    let removeBeta = () => {};
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    function Probe() {
        const [withoutBeta, setWithoutBeta] = useState(false);
        removeBeta = () => setWithoutBeta(true);
        return <Combobox value="" onChange={onChange} options={[
            { value: 'alpha', label: 'Alpha' },
            ...withoutBeta ? [] : [{ value: 'beta', label: 'Beta' }],
            { value: 'gamma', label: 'Gamma' },
        ]}/>;
    }
    try {
        act(() => root.render(<Probe />));
        const input = host.querySelector('input')!;
        act(() => input.focus());
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })));
        act(() => removeBeta());
        expect(host.querySelectorAll('[data-highlighted="true"]')[0]?.textContent).toContain('Alpha');
        act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
        expect(onChange).toHaveBeenCalledWith('alpha');
    } finally {
        act(() => root.unmount());
        host.remove();
        Element.prototype.scrollIntoView = originalScroll;
    }
});
