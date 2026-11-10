import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import Loading from './v2/loading';
import { WorkspaceDetail, WorkspaceDirectory } from './workspace-layout';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/hooks/use-media-query', () => ({ useMediaQuery: () => true }));
const entry = { index: 0 };
vi.mock('@/hooks/navigation', () => ({ useNavigationSnapshot: () => ({ index: entry.index }) }));
let root: Root, host: HTMLDivElement;
beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); vi.useRealTimers(); });

const details = () => host.querySelectorAll<HTMLElement>('[data-ui-transition="detail"]');
const opacity = () => details()[0].parentElement!.style.opacity;
async function render(key: string, loading: boolean) {
    await act(async () => root.render(<WorkspaceDetail transitionKey={key}>{loading ? <Loading /> : <p>{key}</p>}</WorkspaceDetail>));
}

it('replaces the outgoing editor without stacking both editors', async () => {
    await render('a', false);
    await render('b', false);
    expect(details()).toHaveLength(1);
    expect(host.textContent).toBe('b');
    expect(opacity()).toBe('');
});

it('hides the next editor until it has loaded', async () => {
    await render('a', false);
    await render('b', true);
    expect(opacity()).toBe('0');
    await render('b', false);
    expect(opacity()).toBe('');
});

it('shows the spinner when loading is slow', async () => {
    vi.useFakeTimers();
    await render('a', false);
    await render('b', true);
    expect(opacity()).toBe('0');
    await act(async () => { await vi.advanceTimersByTimeAsync(200); });
    expect(opacity()).toBe('');
});

it('returns a phone list to the offset it was left at', async () => {
    const list = (hidden: boolean) => act(async () => root.render(
        <div data-ui-transition="page"><WorkspaceDirectory label="rules" hiddenOnMobile={hidden}><p>rules</p></WorkspaceDirectory></div>));
    entry.index = 0;
    await list(false);
    const scroller = host.querySelector<HTMLElement>('[data-ui-transition="page"]')!;
    scroller.scrollTop = 400;
    act(() => { scroller.dispatchEvent(new Event('scroll')); });
    // Hiding the list shortens the page, and the browser clamps the scroller before effects can read it.
    scroller.scrollTop = 0;
    entry.index = 1;
    await list(true);
    expect(scroller.scrollTop).toBe(0);
    entry.index = 0;
    await list(false);
    expect(scroller.scrollTop).toBe(400);
});
