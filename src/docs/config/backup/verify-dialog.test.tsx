import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { verifyRecoveryBackup } from '@/api/backup';
import { VerifyBackupDialog } from './verify-dialog';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/api/backup', () => ({ verifyRecoveryBackup: vi.fn(async () => ({ completeInventory: true })) }));
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(() => { act(() => roots.forEach(root => root.unmount())); roots.length = 0; document.body.innerHTML = ''; vi.clearAllMocks(); });

it('uses the private identity once and clears it when the dialog closes', async () => {
    const host = document.createElement('div'); document.body.appendChild(host);
    const root = createRoot(host); roots.push(root);
    function Harness() {
        const [open, setOpen] = useState(true);
        return <><button onClick={() => setOpen(true)}>Reopen</button><VerifyBackupDialog
            item={open ? { id: 'point', target: 'local', state: 'local_ready', createdAt: '2026-10-26T10:00:00Z', size: 10, includesHistory: false, uploadAttempts: 0 } : undefined}
            onClose={() => setOpen(false)} onVerified={vi.fn()} /></>;
    }
    await act(async () => root.render(<Harness />));
    const input = document.querySelector<HTMLInputElement>('input[type=password]')!;
    expect(input.autocomplete).toBe('off');
    await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'transient-private-fixture');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    const verify = [...document.querySelectorAll<HTMLButtonElement>('[role=dialog] button')].find(button => button.textContent === 'recoveryBackup.verify')!;
    await act(async () => verify.click());
    expect(verifyRecoveryBackup).toHaveBeenCalledWith('point', 'transient-private-fixture');
    await act(async () => host.querySelector('button')!.click());
    expect(document.querySelector<HTMLInputElement>('input[type=password]')!.value).toBe('');
});
