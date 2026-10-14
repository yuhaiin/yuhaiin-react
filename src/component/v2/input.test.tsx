import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, expect, it } from 'vitest';
import { Input, Textarea } from './input';

describe('field feedback and native editing behavior', () => {
    it('associates validation with the control and preserves an existing description', () => {
        const host = document.createElement('div'); document.body.append(host);
        const root = createRoot(host);
        try {
            const render = (error: string) => <><p id="help">Use a host name.</p><Input id="host" aria-describedby="help" error={error} /></>;
            act(() => root.render(render('Invalid host.')));
            const input = host.querySelector('input')!;
            expect(input.getAttribute('aria-invalid')).toBe('true');
            expect(input.getAttribute('aria-describedby')).toBe('help host-error');
            expect(document.getElementById('host-error')?.textContent).toBe('Invalid host.');
            act(() => root.render(render('')));
            expect(host.querySelector('input')).toBe(input);
            expect(input.getAttribute('aria-invalid')).toBeNull();
            expect(input.getAttribute('aria-describedby')).toBe('help');
            expect(document.getElementById('host-error')).not.toBeNull();
        } finally { act(() => root.unmount()); host.remove(); }
    });
    it('keeps read-only data selectable and reserves textarea validation feedback', () => {
        const host = document.createElement('div'); document.body.append(host);
        const root = createRoot(host);
        try {
            act(() => root.render(<><Input readOnly value="Copy this value" /><Textarea error="One address per line." /></>));
            const input = host.querySelector('input')!;
            input.focus(); input.select();
            expect(input.disabled).toBe(false);
            expect(document.activeElement).toBe(input);
            expect(input.selectionEnd).toBe(input.value.length);
            const textarea = host.querySelector('textarea')!;
            expect(textarea.getAttribute('aria-invalid')).toBe('true');
            expect(document.getElementById(textarea.getAttribute('aria-describedby')!)?.textContent).toBe('One address per line.');
        } finally { act(() => root.unmount()); host.remove(); }
    });
});
