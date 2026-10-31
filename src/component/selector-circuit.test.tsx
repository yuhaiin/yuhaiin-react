import { act, useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Go } from '@/api/generated-contracts';
import { CircuitEvidence, SelectorCircuitEditor } from './selector-circuit';
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
let host: HTMLDivElement;
let root: Root;
beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });
it('preserves custom recovery limits when disabling and re-enabling the breaker', () => {
    let latest: Go.node.CircuitConfig = {};
    function Harness() {
        const [value, setValue] = useState<Go.node.CircuitConfig>({ halfOpenMaxRequests: 9 });
        useEffect(() => { latest = value; }, [value]);
        return <SelectorCircuitEditor value={value} recovery={3} cooldown={45000} onChange={setValue} />;
    }
    act(() => root.render(<Harness />));
    const toggle = host.querySelector<HTMLButtonElement>('[role="switch"]')!;
    const inputs = [...host.querySelectorAll<HTMLInputElement>('input')];
    expect(inputs.map(i => i.value)).toEqual(['45000', '1', '9', '30000']);
    act(() => toggle.click());
    expect(latest).toEqual({ halfOpenMaxRequests: 9, disabled: true });
    expect(inputs.every(i => i.disabled)).toBe(true);
    act(() => toggle.click());
    expect(latest).toEqual({ halfOpenMaxRequests: 9, disabled: false });
});
it('explains remote evidence separately from circuit recovery state', () => {
    const value = { evidence: 'reply', circuit: { state: 'half_open', reason: 'cooldown_elapsed', recovered: 1, issued: 2, inFlight: 1 } } as Go.node.SelectorCandidateStatus;
    act(() => root.render(<CircuitEvidence value={value} />));
    expect(host.textContent).toContain('circuit.evidenceKinds.reply');
    expect(host.textContent).toContain('circuit.states.half_open');
    expect(host.textContent).toContain('circuit.reasons.cooldown_elapsed');
    expect(host.textContent).toContain('circuit.permits');
});
