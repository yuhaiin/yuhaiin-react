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
