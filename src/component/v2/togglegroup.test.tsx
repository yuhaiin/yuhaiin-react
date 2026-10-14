import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { ToggleGroup, ToggleItem } from './togglegroup';

it('keeps a required selection, handles keyboard navigation and respects disabled segments', async () => {
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    function Probe() {
        const [value, setValue] = useState('proxy');
        return <><ToggleGroup type="single" value={value} aria-label="Action" onValueChange={next => next && setValue(next)}><ToggleItem value="proxy">Proxy</ToggleItem><ToggleItem value="direct">Direct</ToggleItem><ToggleItem value="block" disabled>Block</ToggleItem></ToggleGroup><output>{value}</output></>;
    }
    try {
        act(() => root.render(<Probe />));
        const buttons = host.querySelectorAll<HTMLButtonElement>('button');
        act(() => buttons[1].click());
        expect(host.querySelector('output')?.textContent).toBe('direct');
        expect(buttons[1].getAttribute('aria-checked')).toBe('true');
        act(() => buttons[1].click());
        expect(host.querySelector('output')?.textContent).toBe('direct');
        act(() => buttons[2].click());
        expect(host.querySelector('output')?.textContent).toBe('direct');
        await act(async () => { buttons[0].focus(); buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); await vi.waitFor(() => expect(document.activeElement).toBe(buttons[1])); });
    } finally { act(() => root.unmount()); host.remove(); }
});
