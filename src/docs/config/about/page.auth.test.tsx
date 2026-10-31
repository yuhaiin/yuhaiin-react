import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import useSWR from 'swr';
import About from './page';
import { clearSession, establishSession, updatePrincipal } from '@/auth/session';
import { setApiUrl } from '@/common/apiurl';

vi.mock('react-i18next', () => { const t = (key: string) => key; return { useTranslation: () => ({ t }) }; });
vi.mock('@/hooks/use-update-recovery', () => ({ useUpdateRecovery: () => ({ active: false, phase: 'idle', status: null }) }));
const fixture = vi.hoisted(() => ({ known: false }));
vi.mock('swr', () => ({ default: vi.fn((key: string | null) => ({
    data: key === '/api/v2/info' ? { version: 'current', build: [] } : key === '/api/v2/update/history' ? { items: [{ id: 'old-build', version: 'previous', savedAt: '2026-10-22T00:00:00Z', size: 4096, compatibility: fixture.known ? { state: 'compatible', reason: 'schema_catalog_matches', currentConfiguration: 23, targetConfiguration: 23, currentManagement: 5, targetManagement: 5, databaseRecoveryRequired: false } : undefined }] } : undefined,
    isLoading: false, error: undefined, mutate: vi.fn(),
})) }));
afterEach(() => { fixture.known = false; clearSession(); localStorage.clear(); vi.clearAllMocks(); });
it('only fetches update history and exposes restoration for update managers', async () => {
    setApiUrl('https://controller.example');
    establishSession('test', { userId: 'reader', credentialType: 'session', permissions: ['settings:read'] }, Math.floor(Date.now() / 1000) + 600, 'https://controller.example');
    const host = document.createElement('div'); const root = createRoot(host);
    await act(async () => root.render(<About />));
    expect(vi.mocked(useSWR).mock.calls.some(([key]) => key === '/api/v2/update/history')).toBe(false);
    expect(host.querySelector('[aria-label=previousVersions]')).toBeNull();
    await act(async () => updatePrincipal({ userId: 'reader', credentialType: 'session', permissions: ['settings:read', 'update:manage'] }));
    expect(vi.mocked(useSWR).mock.calls.some(([key]) => key === '/api/v2/update/history')).toBe(true);
    const restore = [...host.querySelectorAll('button')].find(button => button.textContent?.includes('restoreVersion'))!;
    expect(restore).toBeDefined(); expect(restore.disabled).toBe(true);
    fixture.known = true;
    await act(async () => root.render(<About />));
    expect([...host.querySelectorAll('button')].find(button => button.textContent?.includes('restoreVersion'))?.disabled).toBe(false);
    act(() => root.unmount());
});
