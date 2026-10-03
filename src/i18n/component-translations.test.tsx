import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import { expect, it } from 'vitest';
import i18n from './index';
import { SettingInputBytes } from '@/component/v2/forms';

it('updates dynamic accessible names on language change while preserving the local input draft', async () => {
    function Probe() {
        const { t } = useTranslation('ui');
        const [paused, setPaused] = useState(false);
        return <>
            <button aria-label={t(paused ? 'resumeCollection' : 'pauseCollection')} onClick={() => setPaused(value => !value)} />
            <SettingInputBytes label={t('nodeJson')} value={new Uint8Array([97])} onChange={() => undefined} />
        </>;
    }
    const host = document.createElement('div');
    const root = createRoot(host);
    await act(async () => { await i18n.changeLanguage('en'); root.render(<Probe />); });
    const input = host.querySelector('input')!;
    act(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, 'Y');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await act(async () => i18n.changeLanguage('ja'));
    expect(input.value).toBe('Y');
    expect(host.querySelector('button')!.getAttribute('aria-label')).toBe(i18n.t('ui:pauseCollection'));
    act(() => host.querySelector('button')!.click());
    expect(host.querySelector('button')!.getAttribute('aria-label')).toBe(i18n.t('ui:resumeCollection'));
    expect(input.getAttribute('aria-invalid')).toBe('true');
    act(() => root.unmount());
    await i18n.changeLanguage('en');
});
