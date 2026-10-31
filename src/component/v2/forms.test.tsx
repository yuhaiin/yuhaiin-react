import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SettingInputBytes } from './forms';
import { SwitchCard } from './switch';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

let root: Root;
let container: HTMLDivElement;
function mount(component: React.ReactNode) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    act(() => root.render(component));
    return container;
}
afterEach(() => { act(() => root?.unmount()); container?.remove(); });

describe('settings controls', () => {
    it('calls the card switch exactly once when its control is clicked', () => {
        const onCheckedChange = vi.fn();
        mount(<SwitchCard label="Enabled" checked={false} onCheckedChange={onCheckedChange} />);
        act(() => container.querySelector<HTMLButtonElement>('[role="switch"]')!.click());
        expect(onCheckedChange).toHaveBeenCalledExactlyOnceWith(true);
    });

    it('retains incomplete Base64 through unrelated parent renders, then follows external changes', () => {
        const onChange = vi.fn();
        const render = (value: Uint8Array) => <SettingInputBytes label="Bytes" value={value} onChange={onChange} />;
        mount(render(new Uint8Array([97])));
        const input = container.querySelector('input')!;
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Y');
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        expect(input.value).toBe('Y');
        expect(onChange).not.toHaveBeenCalled();
        act(() => root.render(render(new Uint8Array([97]))));
        expect(input.value).toBe('Y');
        act(() => root.render(render(new Uint8Array([98]))));
        expect(input.value).toBe('Yg==');
    });
});
