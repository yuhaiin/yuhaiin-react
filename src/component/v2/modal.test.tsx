import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { Modal, ModalContent, ModalTitle } from './modal';

it('renders an uncontrolled default-open dialog with the requested width', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    await act(async () => root.render(<Modal defaultOpen><ModalContent width={820}><ModalTitle>Rule editor</ModalTitle></ModalContent></Modal>));
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    expect(dialog?.style.maxWidth).toBe('820px');
    expect(dialog?.textContent).toContain('Rule editor');
    expect(dialog?.className).toContain('w-[calc(100vw-24px)]');
    act(() => root.unmount());
    host.remove();
    vi.unstubAllGlobals();
});
