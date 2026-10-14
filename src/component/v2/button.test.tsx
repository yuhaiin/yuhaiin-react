import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { Button } from './button';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
it('keeps the action label mounted and blocks duplicate clicks while loading', () => {
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    const click = vi.fn();
    const render = (loading: boolean) => <Button loading={loading} onClick={click}>Save configuration</Button>;
    try {
        act(() => root.render(render(false)));
        const button = host.querySelector('button')!;
        const label = button.firstElementChild;
        act(() => root.render(render(true)));
        expect(button.disabled).toBe(true);
        expect(button.getAttribute('aria-busy')).toBe('true');
        expect(button.firstElementChild).toBe(label);
        expect(label?.textContent).toBe('Save configuration');
        act(() => button.click());
        expect(click).not.toHaveBeenCalled();
        act(() => root.render(render(false)));
        expect(button.disabled).toBe(false);
        expect(button.getAttribute('aria-busy')).toBeNull();
        expect(button.firstElementChild).toBe(label);
        act(() => button.click());
        expect(click).toHaveBeenCalledOnce();
    } finally { act(() => root.unmount()); host.remove(); }
});
