import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { UpdateCompatibilityDetails } from './update-compatibility';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(() => { act(() => roots.forEach(root => root.unmount())); roots.length = 0; document.body.innerHTML = ''; });

async function mount(state?: string, required = false) {
    const host = document.createElement('div'); document.body.appendChild(host);
    const root = createRoot(host); roots.push(root);
    await act(async () => root.render(<UpdateCompatibilityDetails value={state ? {
        state, reason: 'fixture', currentConfiguration: 23, targetConfiguration: required ? 24 : 23,
        currentManagement: 0, targetManagement: 5, databaseRecoveryRequired: required,
    } : undefined} />));
    return host;
}
it('reports unverified legacy entries without inventing schema numbers', async () => {
    const host = await mount();
    expect(host.textContent).toContain('updateSafety.states.unknown');
    expect(host.querySelector('dl')).toBeNull();
});
it('shows migration requirements and actual current / target schemas separately from binary rollback', async () => {
    const host = await mount('migration_required', true);
    expect(host.textContent).toContain('23 → 24');
    expect(host.textContent).toContain('updateSafety.notEnabled');
    expect(host.textContent).toContain('updateSafety.recoveryRequired');
    expect(host.textContent).not.toContain('updateSafety.states.compatible');
});
it('does not imply a same-schema binary replacement will restore old credentials', async () => {
    const host = await mount('compatible');
    expect(host.textContent).toContain('updateSafety.binaryOnly');
    expect(host.textContent).not.toContain('updateSafety.recoveryRequired');
});
