import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { SettingRangeVertical } from './forms';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it('retains keyboard steps and limits, and removes a disabled slider from the tab order', () => {
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    function Fixture({ disabled = false }) {
        const [value, setValue] = useState(40);
        return <SettingRangeVertical label="Limit" value={value} onChange={setValue} min={0} max={100} step={5} disabled={disabled} unit="%" />;
    }
    try {
        act(() => root.render(<Fixture />));
        const slider = host.querySelector<HTMLElement>('[role="slider"]')!;
        const key = (key: string) => act(() => slider.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true })));
        slider.focus(); key('ArrowRight');
        expect(slider.getAttribute('aria-valuenow')).toBe('45');
        expect(slider.getAttribute('aria-valuetext')).toBe('45 %');
        key('End'); expect(slider.getAttribute('aria-valuenow')).toBe('100');
        key('ArrowRight'); expect(slider.getAttribute('aria-valuenow')).toBe('100');
        key('Home'); expect(slider.getAttribute('aria-valuenow')).toBe('0');
        act(() => root.render(<Fixture disabled />));
        expect(slider.hasAttribute('data-disabled')).toBe(true);
        expect(slider.tabIndex).toBeLessThan(0);
    } finally { act(() => root.unmount()); host.remove(); vi.unstubAllGlobals(); }
});
