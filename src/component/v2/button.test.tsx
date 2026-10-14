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

it('blocks disabled actions and disabled slotted links without confusing them with pending actions', () => {
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    const click = vi.fn();
    try {
        act(() => root.render(<><Button variant="destructive" disabled onClick={click}>Delete entry</Button><Button asChild disabled><a href="#disabled" onClick={click}>Unavailable link</a></Button></>));
        const button = host.querySelector('button')!;
        expect(button.disabled).toBe(true);
        expect(button.getAttribute('aria-busy')).toBeNull();
        act(() => button.click());
        const link = host.querySelector('a')!;
        expect(link.getAttribute('aria-disabled')).toBe('true');
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        act(() => link.dispatchEvent(event));
        expect(event.defaultPrevented).toBe(true);
        expect(click).not.toHaveBeenCalled();
    } finally { act(() => root.unmount()); host.remove(); }
});
