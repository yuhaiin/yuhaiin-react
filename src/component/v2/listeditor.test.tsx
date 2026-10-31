import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { InputList } from './listeditor';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/auth/secret-fields', () => ({
    useSecretField: () => ({ disabled: false, masked: false }),
    isSecretPlaceholder: (value: unknown) => value === '__saved__',
    useProtectedSetting: () => true,
}));

let host: HTMLDivElement;
let root: Root;
const seen: string[][] = [];

function Fixture({ external }: { external?: string[] }) {
    const [data, setData] = useState(['a.example', 'b.example']);
    return <>
        <InputList title="Rules" data={external ?? data} onChange={next => { seen.push(next); setData(next); }} />
        <span data-testid="count">{data.length}</span>
    </>;
}

const editor = () => host.querySelector<HTMLTextAreaElement>('textarea')!;
const type = (value: string) => act(() => {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(editor(), value);
    editor().dispatchEvent(new Event('input', { bubbles: true }));
});

beforeEach(() => {
    seen.length = 0;
    host = document.createElement('div');
    document.body.append(host);
    root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); });

it('emits cleaned entries but keeps what is being typed', () => {
    act(() => root.render(<Fixture />));
    expect(editor().value).toBe('a.example\nb.example');
    type('a.example\nb.example\n');
    expect(seen).toEqual([]);
    expect(editor().value).toBe('a.example\nb.example\n');
    type('a.example\n  c.example \n\nb.example');
    expect(seen[seen.length - 1]).toEqual(['a.example', 'c.example', 'b.example']);
    expect(editor().value).toBe('a.example\n  c.example \n\nb.example');
});

it('tidies the draft on blur and numbers every line', () => {
    act(() => root.render(<Fixture />));
    type('a.example\n\n  b.example');
    expect(host.querySelector('pre')!.textContent).toBe('1\n2\n3');
    act(() => editor().dispatchEvent(new FocusEvent('focusout', { bubbles: true })));
    expect(editor().value).toBe('a.example\nb.example');
    expect(host.querySelector('pre')!.textContent).toBe('1\n2');
});

it('follows data replaced from outside', () => {
    act(() => root.render(<Fixture />));
    act(() => root.render(<Fixture external={['z.example']} />));
    expect(editor().value).toBe('z.example');
});

it('keeps saved secrets out of the text and in place through edits', () => {
    const changed = vi.fn();
    act(() => root.render(<InputList title="Commands" data={['first', '__saved__', 'last']} onChange={changed} />));
    expect(editor().value).toBe('first\nlast');
    expect(host.textContent).toContain('secrets.savedValue');
    type('first\nsecond\nlast');
    expect(changed).toHaveBeenLastCalledWith(['first', '__saved__', 'second', 'last']);
    act(() => host.querySelector<HTMLButtonElement>('button[aria-label="delete Commands 2"]')!.click());
    expect(changed).toHaveBeenLastCalledWith(['first', 'last']);
});
