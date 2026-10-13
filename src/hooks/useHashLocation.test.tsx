import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { Route, Router, Switch, useLocation } from 'wouter';
import { useCloseGuard } from './use-editor-draft';
import { clearHashSearch, useHashLocation, useHashSearch } from './useHashLocation';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

it('matches a hash route with query parameters and keeps rejected navigation from changing editor targets', () => {
    window.history.replaceState(null, '', '#/docs/bypass/?rule=stable-1');
    function Page() {
        const [, move] = useLocation();
        const query = useHashSearch();
        useCloseGuard(true, false, () => undefined);
        return <>
            <span>{query}</span>
            <button onClick={() => move('/docs/bypass?match=process&value=%2Fopt%2FApp%2F')}>to process</button>
            <button onClick={() => move('/docs/bypass?rule=stable-3')}>to rule 3</button>
        </>;
    }
    const host = document.createElement('div');
    const root = createRoot(host);
    try {
        act(() => root.render(<Router hook={useHashLocation}><Switch><Route path="/docs/bypass" component={Page} /></Switch></Router>));
        expect(host.querySelector('span')?.textContent).toBe('rule=stable-1');
        const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
        act(() => { window.history.replaceState(null, '', '#/docs/bypass?rule=stable-2'); window.dispatchEvent(new HashChangeEvent('hashchange')); });
        expect(host.querySelector('span')?.textContent).toBe('rule=stable-1');
        expect(window.location.hash).toBe('#/docs/bypass?rule=stable-1');
        confirm.mockReturnValue(true);
        act(() => { host.querySelectorAll('button')[0].click(); window.dispatchEvent(new HashChangeEvent('hashchange')); });
        expect(new URLSearchParams(host.querySelector('span')?.textContent).get('value')).toBe('/opt/App/');
        act(() => clearHashSearch());
        expect(host.querySelector('span')?.textContent).toBe('');
        expect(window.location.hash).toBe('#/docs/bypass');
        act(() => { host.querySelectorAll('button')[1].click(); window.dispatchEvent(new HashChangeEvent('hashchange')); });
        expect(host.querySelector('span')?.textContent).toBe('rule=stable-3');
    } finally {
        act(() => root.unmount());
        vi.restoreAllMocks();
    }
});
