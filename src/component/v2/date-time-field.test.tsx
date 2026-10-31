import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { DateTimeField } from './date-time-field';

vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });

async function render(type: 'date' | 'datetime-local', initial: string) {
    const changes: string[] = [];
    function Field() {
        const [value, setValue] = useState(initial);
        return <DateTimeField type={type} value={value} onChange={next => { changes.push(next); setValue(next); }} required />;
    }
    const host = document.createElement('div'); document.body.append(host); const root = createRoot(host);
    await act(async () => root.render(<Field />));
    const press = async (label: string) => { await act(async () => [...document.querySelectorAll<HTMLButtonElement>('button')].find(button => button.textContent === label || button.getAttribute('aria-label') === label)!.click()); };
    const openPicker = async () => { await act(async () => host.querySelector('button')!.click()); };
    return { host, changes, press, openPicker, close: () => { act(() => root.unmount()); host.remove(); } };
}

it('keeps the native value format and time while picking a day and a time', async () => {
    const view = await render('datetime-local', '2026-10-31T20:17');
    try {
        await view.openPicker();
        await act(async () => [...document.querySelectorAll<HTMLButtonElement>('[role=dialog] button')].find(button => button.textContent === '15')!.click());
        expect(view.changes[view.changes.length - 1]).toBe('2026-10-15T20:17');
        await view.press('dateTime.hour 07');
        expect(view.changes[view.changes.length - 1]).toBe('2026-10-15T07:17');
        await view.press('dateTime.minute 05');
        expect(view.changes[view.changes.length - 1]).toBe('2026-10-15T07:05');
        await view.press('dateTime.clear');
        expect(view.changes[view.changes.length - 1]).toBe('');
        expect(document.querySelector('[role=dialog]')).toBeNull();
        expect(view.host.querySelector<HTMLInputElement>('input[type=datetime-local]')!.required).toBe(true);
    } finally { view.close(); }
});

it('closes after picking a date in date mode and offers no time columns', async () => {
    const view = await render('date', '2026-02-10');
    try {
        await view.openPicker();
        expect(document.querySelector('[aria-label="dateTime.hour"]')).toBeNull();
        await act(async () => [...document.querySelectorAll<HTMLButtonElement>('[role=dialog] button')].find(button => button.textContent === '20')!.click());
        expect(view.changes).toEqual(['2026-02-20']);
        expect(document.querySelector('[role=dialog]')).toBeNull();
    } finally { view.close(); }
});

it('moves through days with arrow keys across a month boundary', async () => {
    const view = await render('date', '2026-02-28');
    try {
        await view.openPicker();
        const dialog = document.querySelector('[role=dialog]')!;
        await act(async () => dialog.querySelector('[tabindex="0"]')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
        expect(dialog.querySelector<HTMLElement>('[tabindex="0"]')!.textContent).toBe('1');
        expect(document.activeElement).toBe(dialog.querySelector('[tabindex="0"]'));
    } finally { view.close(); }
});
