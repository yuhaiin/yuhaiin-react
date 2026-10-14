import initialHTML from '../../index.html?raw';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AccentPicker } from '@/component/accent-picker';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { ACCENTS, ACCENT_STORAGE_KEY, THEME_STORAGE_KEY, readAccent, readThemePreference } from './theme';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
let root: Root | undefined;
let host: HTMLDivElement;
let systemListener: ((event: { matches: boolean }) => void) | undefined;
let systemDark = false;
beforeEach(() => {
    window.localStorage.clear();
    systemDark = false;
    systemListener = undefined;
    vi.stubGlobal('matchMedia', () => ({ matches: systemDark, addEventListener: (_: string, listener: typeof systemListener) => { systemListener = listener; }, removeEventListener: () => { systemListener = undefined; } }));
    host = document.createElement('div');
    document.body.append(host);
});
afterEach(() => {
    act(() => root?.unmount()); root = undefined;
    host.remove();
    document.documentElement.removeAttribute('data-accent');
    document.documentElement.removeAttribute('data-bs-theme');
    vi.restoreAllMocks(); vi.unstubAllGlobals();
});
function Probe() {
    const { preference, resolved, setPreference, accent } = useTheme();
    return <><output>{preference}:{resolved}:{accent}</output>
        <button onClick={() => setPreference('dark')}>Dark</button>
        <button onClick={() => setPreference('system')}>System</button>
        <AccentPicker /></>;
}
function mount() { root = createRoot(host); act(() => root!.render(<ThemeProvider><Probe /></ThemeProvider>)); }

it('keeps an existing mode preference and defaults the independent accent to olive', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    mount();
    expect(host.querySelector('output')?.textContent).toBe('dark:dark:olive');
    expect(document.documentElement.dataset.accent).toBe('olive');
    expect(document.documentElement.dataset.bsTheme).toBe('dark');
});
it('previews and persists every accent without changing the mode or remounting its content', () => {
    mount();
    const output = host.querySelector('output');
    for (const accent of [...ACCENTS.slice(1), ACCENTS[0]]) {
        act(() => host.querySelector<HTMLButtonElement>(`[role="radio"][aria-label="theme.accents.${accent}"]`)!.click());
        expect(window.localStorage.getItem(ACCENT_STORAGE_KEY)).toBe(accent);
        expect(document.documentElement.dataset.accent).toBe(accent);
        expect(document.documentElement.dataset.bsTheme).toBe('light');
        expect(host.querySelector('output')).toBe(output);
        expect(host.querySelector('[role="radio"][aria-checked="true"]')?.getAttribute('aria-label')).toBe(`theme.accents.${accent}`);
    }
    act(() => host.querySelector<HTMLButtonElement>('button')!.click());
    expect(window.localStorage.getItem(ACCENT_STORAGE_KEY)).toBe('olive');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    act(() => root!.unmount()); root = undefined;
    mount();
    expect(host.querySelector('output')?.textContent).toBe('dark:dark:olive');
});
it('selects with quick arrow presses and Home/End while keeping focus and the checked state aligned', () => {
    mount();
    const first = host.querySelector<HTMLButtonElement>('[role="radio"]')!;
    act(() => first.focus());
    act(() => { first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })); first.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight', bubbles: true })); });
    expect(document.documentElement.dataset.accent).toBe('terracotta');
    expect(document.activeElement?.getAttribute('aria-checked')).toBe('true');
    act(() => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true })));
    expect(document.documentElement.dataset.accent).toBe('graphite');
    act(() => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true })));
    expect(document.documentElement.dataset.accent).toBe('olive');
});
it('follows system changes and ignores them after selecting a fixed mode', () => {
    window.localStorage.setItem(ACCENT_STORAGE_KEY, 'plum');
    mount();
    act(() => { systemDark = true; systemListener!({ matches: true }); });
    expect(host.querySelector('output')?.textContent).toBe('system:dark:plum');
    act(() => host.querySelector<HTMLButtonElement>('button')!.click());
    expect(host.querySelector('output')?.textContent).toBe('dark:dark:plum');
    expect(systemListener).toBeUndefined();
    act(() => host.querySelectorAll<HTMLButtonElement>('button')[1].click());
    expect(host.querySelector('output')?.textContent).toBe('system:dark:plum');
});
it('handles invalid or inaccessible storage without losing live accent selection', () => {
    window.localStorage.setItem(ACCENT_STORAGE_KEY, 'blue');
    window.localStorage.setItem(THEME_STORAGE_KEY, 'invalid');
    expect(readAccent()).toBe('olive');
    expect(readThemePreference()).toBe('system');
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    mount();
    act(() => host.querySelector<HTMLButtonElement>('[aria-label="theme.accents.brass"]')!.click());
    expect(document.documentElement.dataset.accent).toBe('brass');
});
it('applies the saved mode and accent before the application starts, with safe storage fallbacks', () => {
    const boot = initialHTML.match(/<script>([\s\S]*?)<\/script>/)![1];
    const run = () => new Function('window', 'document', 'localStorage', boot)(window, document, window.localStorage);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    window.localStorage.setItem(ACCENT_STORAGE_KEY, 'terracotta');
    run();
    expect(document.documentElement.dataset).toMatchObject({ bsTheme: 'dark', accent: 'terracotta' });
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    systemDark = true;
    run();
    expect(document.documentElement.dataset).toMatchObject({ bsTheme: 'dark', accent: 'olive' });
});
