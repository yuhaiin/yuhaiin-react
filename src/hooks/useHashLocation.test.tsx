import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { Route, Router, Switch, useLocation } from 'wouter';
import { useCloseGuard } from './use-editor-draft';
import { clearHashSearch, useHashLocation, useHashSearch } from './useHashLocation';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it('matches a hash route with query parameters and keeps rejected navigation from changing editor targets', () => {
    window.history.replaceState(null, '', '#/docs/bypass/?rule=stable-1');
    let navigate: (path: string) => void;
    function Page() {
        const [, move] = useLocation(); navigate = move;
        const query = useHashSearch();
        useCloseGuard(true, false, () => undefined);
        return <span>{query}</span>;
    }
    const host = document.createElement('div');
    const root = createRoot(host);
    act(() => root.render(<Router hook={useHashLocation}><Switch><Route path="/docs/bypass" component={Page} /></Switch></Router>));
    expect(host.textContent).toBe('rule=stable-1');
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    act(() => { window.history.replaceState(null, '', '#/docs/bypass?rule=stable-2'); window.dispatchEvent(new HashChangeEvent('hashchange')); });
    expect(host.textContent).toBe('rule=stable-1');
    expect(window.location.hash).toBe('#/docs/bypass?rule=stable-1');
    confirm.mockReturnValue(true);
    act(() => { navigate('/docs/bypass?match=process&value=%2Fopt%2FApp%2F'); window.dispatchEvent(new HashChangeEvent('hashchange')); });
    expect(new URLSearchParams(host.textContent!).get('value')).toBe('/opt/App/');
    act(() => clearHashSearch());
    expect(host.textContent).toBe('');
    expect(window.location.hash).toBe('#/docs/bypass');
    act(() => { navigate('/docs/bypass?rule=stable-3'); window.dispatchEvent(new HashChangeEvent('hashchange')); });
    expect(host.textContent).toBe('rule=stable-3');
    act(() => root.unmount());
});
