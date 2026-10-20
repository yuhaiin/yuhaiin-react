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

it('keeps disabled variants distinct from the pending state, including icon and slotted actions', () => {
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    const click = vi.fn();
    try {
        act(() => root.render(
            <>
                <Button variant="primary" disabled onClick={click}>Save</Button>
                <Button variant="outline-secondary" disabled onClick={click}>Discard</Button>
                <Button variant="ghost" size="icon" disabled aria-label="Add upstream" onClick={click}>+</Button>
                <Button variant="outline-danger" disabled onClick={click}>Delete</Button>
                <Button variant="primary" loading onClick={click}>Saving</Button>
                <Button asChild variant="ghost" disabled><a href="#disabled" onClick={click}>Unavailable</a></Button>
            </>,
        ));
        const buttons = [...host.querySelectorAll<HTMLButtonElement>('button')];
        expect(buttons.map((button) => button.dataset.variant)).toEqual([
            'primary', 'outline-secondary', 'ghost', 'outline-danger', 'primary',
        ]);
        for (const button of buttons.slice(0, 4)) {
            expect(button.disabled).toBe(true);
            expect(button.getAttribute('aria-busy')).toBeNull();
            act(() => button.click());
        }
        expect(buttons[4].disabled).toBe(true);
        expect(buttons[4].getAttribute('aria-busy')).toBe('true');
        const link = host.querySelector('a')!;
        expect(link.dataset.variant).toBe('ghost');
        expect(link.getAttribute('aria-disabled')).toBe('true');
        act(() => link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
        expect(click).not.toHaveBeenCalled();
    } finally { act(() => root.unmount()); host.remove(); }
});
