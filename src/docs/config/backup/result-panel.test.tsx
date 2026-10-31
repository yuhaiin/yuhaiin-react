import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import type { RecoveryRestoreStatus } from '@/api/backup';
import { RecoveryResultPanel } from './result-panel';

const mocked = vi.hoisted(() => ({ data: {} as RecoveryRestoreStatus, error: undefined as Error | undefined, imports: vi.fn(async () => undefined), mutate: vi.fn(async () => undefined) }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('swr', () => ({ useSWRConfig: () => ({ mutate: mocked.imports }), default: () => ({ data: mocked.data, error: mocked.error, isLoading: false, mutate: mocked.mutate }) }));
vi.mock('@/api/backup', () => ({ getRecoveryRestoreStatus: vi.fn() }));
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(() => { act(() => roots.forEach(root => root.unmount())); roots.length = 0; document.body.innerHTML = ''; mocked.data = {}; mocked.error = undefined; vi.clearAllMocks(); });

async function mount() {
    const host = document.createElement('div'); document.body.appendChild(host);
    const root = createRoot(host); roots.push(root);
    await act(async () => root.render(<RecoveryResultPanel />));
    return host;
}
function result(state: string, adoptStartup: boolean) {
    mocked.data = { result: { backupId: 'backup-fixture', transactionId: 'transaction-fixture', instanceId: 'instance-fixture', recoveryPoint: '.recovery-point-fixture', state, adoptStartup,
        runtime: { managementAuth: true, managementTLS: 'files', workingDirectory: '/private/deployment' } } };
}

it('shows the actual committed result, recovery point and persistent startup choice', async () => {
    result('committed', true);
    const host = await mount();
    expect(host.textContent).toContain('recoveryResult.states.committed');
    expect(host.textContent).toContain('recoveryResult.adopted');
    expect(host.textContent).toContain('.recovery-point-fixture');
    expect(host.textContent).toContain('backup-fixture');
    await act(async () => host.querySelector('button')!.click());
    expect(mocked.mutate).toHaveBeenCalledOnce();
});

it('reports rollback and host startup settings without describing a successful restore', async () => {
    result('rolled_back', false);
    const host = await mount();
    expect(host.textContent).toContain('recoveryResult.states.rolled_back');
    expect(host.textContent).toContain('recoveryResult.hostSettings');
    expect(host.textContent).not.toContain('recoveryResult.states.committed');
    expect(host.textContent).not.toContain('recoveryResult.adopted');
});

it('does not invent restore history when the deployment has no result', async () => {
    const host = await mount();
    expect(host.textContent).toContain('recoveryResult.empty');
    expect(host.querySelector('dl')).toBeNull();
});

it('hides cached success when the result can no longer be verified by the API', async () => {
    result('committed', true);
    mocked.error = new Error('unavailable');
    const host = await mount();
    expect(host.querySelector('[role=alert]')?.textContent).toBe('recoveryResult.error');
    expect(host.textContent).not.toContain('recoveryResult.states.committed');
    expect(host.querySelector('dl')).toBeNull();
});

it('suppresses cached committed history while another restore is admitted', async () => {
    result('committed', true);
    mocked.data.pendingImportId = 'pending-import';
    mocked.data.pendingPreviewId = 'pending-preview';
    const host = await mount();
    expect(host.querySelector('[role=status]')?.textContent).toBe('recoveryActivation.admitted');
    expect(host.textContent).not.toContain('recoveryResult.states.committed');
    expect(host.textContent).not.toContain('recoveryResult.empty');
});
