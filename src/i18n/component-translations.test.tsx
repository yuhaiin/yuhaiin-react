import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it } from 'vitest';
import i18n from './index';
import { SettingInputBytes } from '@/component/v2/forms';
import { ZeroTierForm } from '@/docs/node/zerotier-form';

it('translates real controls and interpolated Moon labels without losing an incomplete byte draft', async () => {
    const previousLanguage = i18n.language;
    const host = document.createElement('div');
    const root = createRoot(host);
    try {
        await act(async () => {
            await i18n.changeLanguage('en');
            root.render(<>
                <SettingInputBytes label="Bytes" value={new Uint8Array([97])} onChange={() => undefined} />
                <ZeroTierForm config={{ network_id: '8056c2e21c000001', moons: [{ id: 'fffffffffffffffe', seed: '0123456789abcdef' }] }} editable onChange={() => undefined} />
            </>);
        });
        expect(host.textContent).toContain('ZeroTier Network ID (16 hexadecimal digits)');
        expect(host.textContent).toContain('Moon 1 ID (hex)');
        expect(host.textContent).toContain('Add Moon');
        const input = host.querySelector('input')!;
        act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Y');
            input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await act(async () => i18n.changeLanguage('ja'));
        expect(input.value).toBe('Y');
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(host.textContent).toContain('ZeroTier ネットワーク ID（16 桁の16進数）');
        expect(host.textContent).toContain('Moon 1 ID（16進数）');
        expect(host.textContent).toContain('Moon を追加');
        expect(host.textContent).toContain('削除');
    } finally {
        act(() => root.unmount());
        await i18n.changeLanguage(previousLanguage);
    }
});
