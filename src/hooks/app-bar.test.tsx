import { DetailBack } from '@/component/v2/detail-back';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { useAppBarBackHost } from './app-bar';

function Host({ active }: { active: boolean }) {
    const back = useAppBarBackHost(active);
    return back ? <button data-host onClick={back.run}>{back.label}</button> : null;
}

it('moves the detail Back action into the App Bar only while one hosts it', async () => {
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    const onBack = vi.fn();
    try {
        await act(async () => root.render(<><Host active={false} /><DetailBack label="Back to list" onBack={onBack} /></>));
        expect(host.querySelector('[data-host]')).toBeNull();
        expect(host.querySelector('button')?.textContent).toBe('Back to list');

        await act(async () => root.render(<><Host active /><DetailBack label="Back to list" onBack={onBack} /></>));
        const buttons = host.querySelectorAll('button');
        expect(buttons).toHaveLength(1);
        expect(buttons[0].hasAttribute('data-host')).toBe(true);
        act(() => buttons[0].click());
        expect(onBack).toHaveBeenCalledTimes(1);

        await act(async () => root.render(<Host active />));
        expect(host.querySelector('button')).toBeNull();
    } finally { act(() => root.unmount()); host.remove(); }
});
