import { confirmAction } from '@/component/v2/confirmation';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { useCloseGuard } from './use-editor-draft';
import { useHashLocation } from './useHashLocation';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
afterEach(() => vi.restoreAllMocks());

it('protects hash navigation, confirms once for multiple drafts, and blocks pending saves', async () => {
    window.history.replaceState(null, '', '#/docs/config');
    function Probe({ pending }: { pending: boolean }) {
        const [location, move] = useHashLocation();
        useCloseGuard(true, pending, () => undefined);
        useCloseGuard(true, false, () => undefined);
        return <>
            <span>{location}</span>
            <button onClick={() => move('/docs/group')}>to group</button>
            <button onClick={() => move('/')}>to root</button>
        </>;
    }
    const host = document.createElement('div');
    const root = createRoot(host);
    const confirm = vi.mocked(confirmAction).mockResolvedValue(false);
    const navigate = (index: number) => host.querySelectorAll('button')[index].click();
    try {
        act(() => root.render(<Probe pending={false} />));
        await act(async () => navigate(0));
        expect(window.location.hash).toBe('#/docs/config');
        expect(confirm).toHaveBeenCalledTimes(1);
        confirm.mockResolvedValue(true);
        await act(async () => { navigate(0); await Promise.resolve(); await Promise.resolve(); window.dispatchEvent(new HashChangeEvent('hashchange')); });
        expect(host.querySelector('span')?.textContent).toBe('/docs/group');
        expect(confirm).toHaveBeenCalledTimes(2);
        confirm.mockResolvedValue(false);
        await act(async () => { window.history.replaceState(null, '', '#/docs/config'); window.dispatchEvent(new HashChangeEvent('hashchange')); });
        expect(window.location.hash).toBe('#/docs/group');
        expect(host.querySelector('span')?.textContent).toBe('/docs/group');
        act(() => root.render(<Probe pending />));
        await act(async () => navigate(1));
        expect(window.location.hash).toBe('#/docs/group');
    } finally {
        act(() => root.unmount());
    }
});

vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
