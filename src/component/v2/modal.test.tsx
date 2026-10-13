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

it('uses the trigger click position on the first opened render', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }));
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    try {
        await act(async () => root.render(<Modal open={false}><ModalContent>Dialog content</ModalContent></Modal>));
        act(() => document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 120, clientY: 80 })));
        await act(async () => root.render(<Modal open><ModalContent>Dialog content</ModalContent></Modal>));
        const content = document.querySelector<HTMLElement>('[role="dialog"]');
        expect(content?.style.transformOrigin).toBe('120px 80px');
    } finally {
        act(() => root.unmount());
        host.remove();
        vi.unstubAllGlobals();
    }
});
