import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { ConfirmationHost, confirmAction } from './confirmation';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it('queues confirmations, resolves each once, and cancels outstanding work on unmount', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
    const host = document.createElement('div'); document.body.append(host);
    const root = createRoot(host);
    let first!: Promise<boolean>, second!: Promise<boolean>, third!: Promise<boolean>;
    const click = async (label: string) => act(async () => { [...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')].find(button => button.textContent?.trim() === label)!.click(); });
    try {
        await act(async () => root.render(<ConfirmationHost />));
        await act(async () => { first = confirmAction('First action'); second = confirmAction('Second action'); });
        expect(document.querySelector('[role="dialog"]')?.textContent).toContain('First action');
        await click('action.cancel'); expect(await first).toBe(false);
        expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Second action');
        await click('action.ok'); expect(await second).toBe(true);
        await act(async () => { third = confirmAction('Unmount action'); });
        await act(async () => root.unmount());
        expect(await third).toBe(false);
        expect(await confirmAction('No host')).toBe(false);
    } finally { host.remove(); vi.unstubAllGlobals(); }
});
