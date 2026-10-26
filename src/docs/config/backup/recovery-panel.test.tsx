import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import type { RecoveryBackup, RecoveryBackupStatus } from '@/api/backup';
import { createRecoveryBackup, deleteRecoveryBackup } from '@/api/backup';
import { defaultRecoveryPolicy, RecoveryBackupPanel } from './recovery-panel';

const mocked = vi.hoisted(() => ({ status: { supported: true, items: [] } as RecoveryBackupStatus, mutate: vi.fn(async () => undefined) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('swr', () => ({ default: () => ({ data: mocked.status, error: undefined, mutate: mocked.mutate }) }));
vi.mock('@/api/backup', () => ({ createRecoveryBackup: vi.fn(), deleteRecoveryBackup: vi.fn(), getRecoveryBackups: vi.fn(), retryRecoveryBackup: vi.fn(), verifyRecoveryBackup: vi.fn() }));
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(() => {
    act(() => roots.forEach(root => root.unmount()));
    roots.length = 0;
    document.body.innerHTML = '';
    mocked.status = { supported: true, items: [] };
    vi.clearAllMocks();
});

async function mount(dirty = false) {
    const host = document.createElement('div'); document.body.appendChild(host);
    const root = createRoot(host); roots.push(root);
    await act(async () => root.render(<RecoveryBackupPanel policy={{ ...defaultRecoveryPolicy, recipient: 'age1-fixture', allowMaintenance: true }}
        onChange={vi.fn()} dirty={dirty} saving={false} onSave={vi.fn()} />));
    return host;
}
const find = (host: ParentNode, key: string) => [...host.querySelectorAll('button')].find(button => button.textContent?.includes(key))!;
const point = (state: string): RecoveryBackup => ({ id: 'point', target: 'local', state, createdAt: '2026-10-26T10:00:00Z', size: 1024, includesHistory: false, uploadAttempts: 0 });

it('requires saved settings before accepting a disruptive snapshot', async () => {
    const host = await mount(true);
    expect(find(host, 'recoveryBackup.create').disabled).toBe(true);
    expect(createRecoveryBackup).not.toHaveBeenCalled();
});

it('requires maintenance confirmation before calling the backend', async () => {
    const item = point('queued');
    vi.mocked(createRecoveryBackup).mockResolvedValue(item);
    const host = await mount();
    await act(async () => find(host, 'recoveryBackup.create').click());
    expect(createRecoveryBackup).not.toHaveBeenCalled();
    const dialog = document.querySelector('[role=dialog]')!;
    expect(dialog.textContent).toContain('recoveryBackup.maintenanceWarning');
    await act(async () => find(dialog, 'action.ok').click());
    expect(createRecoveryBackup).toHaveBeenCalledTimes(1);
    expect(mocked.mutate).toHaveBeenCalled();
});

it('asks again before deleting a recorded recovery point', async () => {
    mocked.status.items = [point('local_ready')];
    const host = await mount();
    const button = host.querySelector<HTMLButtonElement>('[aria-label="recoveryBackup.delete"]')!;
    await act(async () => button.click());
    expect(deleteRecoveryBackup).not.toHaveBeenCalled();
    await act(async () => find(document.querySelector('[role=dialog]')!, 'action.ok').click());
    expect(deleteRecoveryBackup).toHaveBeenCalledWith('point');
});

it('does not expose deletion while an upload is active', async () => {
    mocked.status.items = [{ ...point('uploading'), target: 's3' }];
    const host = await mount();
    expect(host.querySelector('[aria-label="recoveryBackup.delete"]')).toBeNull();
    expect(host.textContent).toContain('recoveryBackup.waiting');
});
