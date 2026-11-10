import { confirmAction } from '@/component/v2/confirmation';
import { ResourceEditorFrame, ResourceWorkspace, useResourceSelection } from '@/component/resource-workspace';
import { Modal, ModalContent, ModalTitle } from '@/component/v2/modal';
import { PageTabs } from '@/component/v2/page-tabs';
import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Router, Switch, useLocation } from 'wouter';
import { navigation, resetNavigationForTests } from './navigation';
import { useCloseGuard, useEditorDraft } from './use-editor-draft';
import { useHashLocation } from './useHashLocation';

const viewport = vi.hoisted(() => ({ desktop: false }));
vi.mock('@/hooks/use-media-query', () => ({ useMediaQuery: () => viewport.desktop }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/component/v2/confirmation', () => ({ confirmAction: vi.fn(async () => true) }));
vi.mock('motion/react', async importOriginal => {
    const actual = await importOriginal<typeof import('motion/react')>();
    return { ...actual, animate: () => ({ stop() {} }) };
});

let records = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }, { id: 'c', name: 'Gamma' }];

function Home() {
    const [, navigate] = useLocation();
    return <main><h1>home</h1><button onClick={() => navigate('/docs/list')}>open list</button><button onClick={() => navigate('/docs/other')}>open other</button></main>;
}
function Other() {
    const [, navigate] = useLocation();
    return <main><h1>other</h1><button onClick={() => navigate('/docs/list')}>open list</button></main>;
}
function List() {
    const [, navigate] = useLocation();
    const [query, setQuery] = useState('');
    const [modal, setModal] = useState(false);
    const visible = records.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
    const selection = useResourceSelection(visible.map(item => item.id), 'item');
    const record = records.find(item => item.id === selection.id);
    const { value, setValue, dirty } = useEditorDraft(selection.creating ? 'new' : selection.id, record, () => ({ id: '', name: '' }));
    const close = useCloseGuard(dirty, false, selection.close);
    return <>
        <button onClick={() => navigate('/docs/other')}>sidebar other</button>
        <button onClick={() => setModal(true)}>open modal</button>
        <Modal open={modal} onOpenChange={setModal}><ModalContent><ModalTitle>modal</ModalTitle><p>modal body</p></ModalContent></Modal>
        <ResourceWorkspace title="Resources" selectedId={selection.id} editing={selection.creating || Boolean(selection.id)}
            onSelect={selection.select} onCreate={() => selection.create()} search={{ value: query, onChange: setQuery }}
            items={visible}>
            {selection.id && !record ? <p role="alert">missing {selection.id}</p> :
                <ResourceEditorFrame presentation="inline" open title={value.name || 'new'} label="Editor" onClose={close} footer={null}>
                    <input aria-label="Name" value={value.name} onChange={event => setValue({ ...value, name: event.target.value })} />
                </ResourceEditorFrame>}
        </ResourceWorkspace>
    </>;
}
function Tabs() {
    return <PageTabs label="sections" items={[{ value: 'one', label: 'One', content: <p>tab one</p> }, { value: 'two', label: 'Two', content: <p>tab two</p> }]} />;
}
function TestApp() {
    return <Router hook={useHashLocation}><Switch>
        <Route path="/" component={Home} />
        <Route path="/docs/list" component={List} />
        <Route path="/docs/other" component={Other} />
        <Route path="/docs/tabs" component={Tabs} />
    </Switch></Router>;
}

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
    viewport.desktop = false;
    records = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }, { id: 'c', name: 'Gamma' }];
    vi.mocked(confirmAction).mockResolvedValue(true);
    host = document.createElement('div'); document.body.append(host); root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); document.body.innerHTML = ''; });

const settle = () => act(async () => { for (let i = 0; i < 4; i++) await new Promise(resolve => setTimeout(resolve, 10)); });
async function start(path = '/') {
    window.history.replaceState(null, '', `#${path}`);
    await act(async () => root.render(<TestApp />));
    await settle();
}
async function click(text: string) {
    const button = [...document.querySelectorAll('button')].find(item => item.getAttribute('aria-label') === text || item.textContent === text);
    if (!button) throw Error(`Missing button ${text}: ${document.body.textContent}`);
    await act(async () => button.click());
    await settle();
}
async function waitGone(text: string) {
    for (let i = 0; i < 50 && document.body.textContent?.includes(text); i++) await act(async () => { await new Promise(resolve => setTimeout(resolve, 20)); });
}
const back = async () => { await act(async () => window.history.back()); await settle(); };
const forward = async () => { await act(async () => window.history.forward()); await settle(); };
const hash = () => decodeURIComponent(window.location.hash);
const editorName = () => document.querySelector<HTMLInputElement>('input[aria-label="Name"]')?.value;
function edit(name: string) {
    const input = document.querySelector<HTMLInputElement>('input[aria-label="Name"]')!;
    act(() => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, name); input.dispatchEvent(new Event('input', { bubbles: true })); });
}

describe('mobile list and detail', () => {
    it('1. Home → list → detail → Back → list → Back → Home', async () => {
        await start();
        await click('open list'); await click('Beta');
        expect(hash()).toBe('#/docs/list?item=b'); expect(editorName()).toBe('Beta');
        await back(); expect(hash()).toBe('#/docs/list'); expect(editorName()).toBeUndefined();
        await back(); expect(hash()).toBe('#/'); expect(host.textContent).toContain('home');
    });

    it('2. detail A → detail B → Back → detail A', async () => {
        viewport.desktop = true;
        await start('/docs/list');
        await click('Alpha'); await click('Beta');
        expect(editorName()).toBe('Beta');
        await back(); expect(hash()).toBe('#/docs/list?item=a'); expect(editorName()).toBe('Alpha');
    });

    it('3. Back then Forward restores the detail', async () => {
        await start();
        await click('open list'); await click('Gamma');
        await back(); expect(editorName()).toBeUndefined();
        await forward(); expect(hash()).toBe('#/docs/list?item=c'); expect(editorName()).toBe('Gamma');
    });

    it('4. the in-screen Back and browser Back agree', async () => {
        await start();
        await click('open list'); await click('Beta');
        await click('backToDirectory');
        expect(hash()).toBe('#/docs/list'); expect(editorName()).toBeUndefined();
        // System Back now leaves the list instead of reopening the closed detail.
        await back(); expect(hash()).toBe('#/'); expect(host.textContent).toContain('home');
        // Forward goes to the list, then the detail that was closed.
        await forward(); expect(hash()).toBe('#/docs/list');
    });

    it('5. a deep link opens the detail, and closing it stays on the list', async () => {
        await start('/docs/list?item=c');
        expect(editorName()).toBe('Gamma');
        const index = navigation.current.index;
        await click('backToDirectory');
        expect(hash()).toBe('#/docs/list'); expect(editorName()).toBeUndefined();
        expect(navigation.current.index).toBe(index);
    });

    it('6. a reload restores the detail from the URL and keeps Back working', async () => {
        await start();
        await click('open list'); await click('Beta');
        act(() => root.unmount());
        root = createRoot(host);
        resetNavigationForTests({ reload: true });
        await act(async () => root.render(<TestApp />));
        await settle();
        expect(editorName()).toBe('Beta');
        await back(); expect(hash()).toBe('#/docs/list');
        await back(); expect(hash()).toBe('#/');
    });
});

describe('unsaved changes', () => {
    it('7. cancelling Back keeps the editor, URL and history', async () => {
        await start();
        await click('open list'); await click('Beta'); edit('Draft');
        vi.mocked(confirmAction).mockResolvedValue(false);
        await back();
        expect(confirmAction).toHaveBeenCalledTimes(1);
        expect(hash()).toBe('#/docs/list?item=b'); expect(editorName()).toBe('Draft');
        // The stack is intact: an approved Back afterwards reaches the list, then home.
        vi.mocked(confirmAction).mockResolvedValue(true);
        await back(); expect(hash()).toBe('#/docs/list'); expect(editorName()).toBeUndefined();
        await back(); expect(hash()).toBe('#/');
        await forward(); await forward(); expect(hash()).toBe('#/docs/list?item=b');
    });

    it('8. approving Back discards the draft and goes back once', async () => {
        await start();
        await click('open list'); await click('Beta'); edit('Draft');
        await back();
        expect(confirmAction).toHaveBeenCalledTimes(1);
        expect(hash()).toBe('#/docs/list'); expect(editorName()).toBeUndefined();
    });

    it('cancelling Forward, sidebar navigation and another detail keeps the draft', async () => {
        await start();
        await click('open list'); await click('Alpha'); await back(); await click('Beta'); edit('Draft');
        vi.mocked(confirmAction).mockResolvedValue(false);
        await click('sidebar other'); expect(hash()).toBe('#/docs/list?item=b');
        await click('Gamma'); expect(editorName()).toBe('Draft');
        await click('backToDirectory'); expect(editorName()).toBe('Draft');
        await back(); await back(); expect(hash()).toBe('#/docs/list?item=b');
        expect(editorName()).toBe('Draft');
    });

    it('Back while the discard dialog is open answers "stay"', async () => {
        await start();
        await click('open list'); await click('Beta'); edit('Draft');
        let answer: (value: boolean) => void = () => undefined;
        vi.mocked(confirmAction).mockImplementation(() => new Promise(resolve => {
            answer = resolve;
            window.addEventListener('yuhaiin:dismiss-confirmations', () => resolve(false), { once: true });
        }));
        await back();
        expect(hash()).toBe('#/docs/list?item=b');
        await back();
        answer(true);
        await settle();
        expect(hash()).toBe('#/docs/list?item=b'); expect(editorName()).toBe('Draft');
    });
});

describe('history shape', () => {
    it('9. quick Back/Forward sequences end on the right entry', async () => {
        await start();
        await click('open list'); await click('Alpha'); await back(); await click('Beta');
        await act(async () => { window.history.back(); window.history.back(); window.history.forward(); });
        await settle();
        expect(hash()).toBe('#/docs/list');
        await act(async () => { window.history.forward(); window.history.back(); window.history.back(); });
        await settle();
        expect(hash()).toBe('#/'); expect(host.textContent).toContain('home');
    });

    it('10. desktop auto-selection adds no history', async () => {
        viewport.desktop = true;
        await start();
        const index = navigation.current.index;
        await click('open list');
        expect(hash()).toBe('#/docs/list?item=a'); expect(editorName()).toBe('Alpha');
        expect(navigation.current.index).toBe(index + 1);
        await back(); expect(hash()).toBe('#/');
    });

    it('12. Back closes an open modal first', async () => {
        await start();
        await click('open list'); await click('open modal');
        expect(document.body.textContent).toContain('modal body');
        await back(); await waitGone('modal body');
        expect(document.body.textContent).not.toContain('modal body');
        expect(hash()).toBe('#/docs/list');
        await back(); expect(hash()).toBe('#/');
    });

    it('a modal closed by its own controls leaves no entry behind', async () => {
        await start();
        await click('open list'); await click('open modal');
        await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
        await settle(); await waitGone('modal body');
        expect(document.body.textContent).not.toContain('modal body');
        await back(); expect(hash()).toBe('#/');
    });

    it('Back skips the entry of a modal left open by a page change', async () => {
        await start();
        await click('open list'); await click('open modal');
        await click('sidebar other');
        expect(hash()).toBe('#/docs/other');
        await back();
        expect(hash()).toBe('#/docs/list');
        expect(navigation.current.state.layer).toBeUndefined();
        await back(); expect(hash()).toBe('#/');
    });

    it('13. history into a deleted record is handled', async () => {
        await start();
        await click('open list'); await click('Beta'); await back();
        records = records.filter(item => item.id !== 'b');
        await forward();
        expect(hash()).toBe('#/docs/list?item=b');
        expect(host.textContent).toContain('missing b');
        await click('Alpha'); expect(editorName()).toBe('Alpha');
    });

    it('14. typing in search adds no history', async () => {
        viewport.desktop = true;
        await start('/docs/list');
        const index = navigation.current.index;
        const search = document.querySelector<HTMLInputElement>('input[type="search"]')!;
        for (const text of ['G', 'Ga', 'Gam']) act(() => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(search, text);
            search.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await settle();
        expect(navigation.current.index).toBe(index);
        expect(hash()).toBe('#/docs/list?item=a');
    });

    it('15. moving between top-level pages keeps the open detail in history', async () => {
        await start();
        await click('open list'); await click('Beta'); await click('sidebar other');
        expect(hash()).toBe('#/docs/other');
        await back(); expect(hash()).toBe('#/docs/list?item=b'); expect(editorName()).toBe('Beta');
        await back(); await back(); expect(hash()).toBe('#/');
    });

    it('tab switches replace the entry and survive a reload', async () => {
        await start('/docs/tabs');
        const index = navigation.current.index;
        const tab = [...document.querySelectorAll('button')].find(item => item.textContent === 'Two')!;
        await act(async () => { tab.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button: 0 })); });
        await settle();
        expect(hash()).toBe('#/docs/tabs?tab=two'); expect(navigation.current.index).toBe(index);
        act(() => root.unmount()); root = createRoot(host);
        resetNavigationForTests({ reload: true });
        await act(async () => root.render(<TestApp />)); await settle();
        expect(host.textContent).toContain('tab two');
    });

    it('creating then saving keeps one step', async () => {
        await start('/docs/list');
        await click('add');
        expect(hash()).toBe('#/docs/list?new=item');
        act(() => navigation.replace('/docs/list?item=c'));
        await settle();
        await back(); expect(hash()).toBe('#/docs/list');
    });
});
