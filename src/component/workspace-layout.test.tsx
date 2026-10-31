import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Loading from './v2/loading';
import { WorkspaceDetail } from './workspace-layout';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/hooks/use-media-query', () => ({ useMediaQuery: () => true }));
let root: Root, host: HTMLDivElement;
beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); vi.useRealTimers(); });

const details = () => host.querySelectorAll<HTMLElement>('[data-ui-transition="detail"]');
const opacity = () => details()[0].parentElement!.style.opacity;
async function render(key: string, loading: boolean) {
    await act(async () => root.render(<WorkspaceDetail transitionKey={key}>{loading ? <Loading /> : <p>{key}</p>}</WorkspaceDetail>));
}

it('swaps editors without stacking, hides fast loads and reveals slow-loading feedback', async () => {
    vi.useFakeTimers();
    await render('a', false);
    await render('b', false);
    expect(details()).toHaveLength(1);
    expect(host.textContent).toBe('b');
    expect(opacity()).toBe('');
    await render('c', true);
    expect(opacity()).toBe('0');
    await render('c', false);
    expect(opacity()).toBe('');
    expect(details()).toHaveLength(1);
    expect(host.textContent).toBe('c');
    await render('d', true);
    expect(opacity()).toBe('0');
    await act(async () => { await vi.advanceTimersByTimeAsync(200); });
    expect(opacity()).toBe('');
});
