import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import { useCloseGuard } from './use-editor-draft';
import { useHashLocation } from './useHashLocation';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
afterEach(() => vi.restoreAllMocks());

it('protects hash navigation, confirms once for multiple drafts, and blocks pending saves', () => {
    window.history.replaceState(null, '', '#/docs/config');
    let navigate: (to: string) => void;
    function Probe({ pending }: { pending: boolean }) {
        const [location, move] = useHashLocation();
        navigate = move;
        useCloseGuard(true, pending, () => undefined);
        useCloseGuard(true, false, () => undefined);
        return <span>{location}</span>;
    }
    const host = document.createElement('div');
    const root = createRoot(host);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    act(() => root.render(<Probe pending={false} />));
    act(() => navigate('/docs/group'));
    expect(window.location.hash).toBe('#/docs/config');
    expect(confirm).toHaveBeenCalledTimes(1);
    confirm.mockReturnValue(true);
    act(() => { navigate('/docs/group'); window.dispatchEvent(new HashChangeEvent('hashchange')); });
    expect(host.textContent).toBe('/docs/group');
    expect(confirm).toHaveBeenCalledTimes(2);
    confirm.mockReturnValue(false);
    act(() => { window.history.replaceState(null, '', '#/docs/config'); window.dispatchEvent(new HashChangeEvent('hashchange')); });
    expect(window.location.hash).toBe('#/docs/group');
    expect(host.textContent).toBe('/docs/group');
    act(() => root.render(<Probe pending />));
    act(() => navigate('/'));
    expect(window.location.hash).toBe('#/docs/group');
    act(() => root.unmount());
});
