import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ProcessPatternHelp, ProcessPatternIssues, routeListPatternIssues } from './process-patterns';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, options?: Record<string, unknown>) => options ? `${key} ${JSON.stringify(options)}` : key }) }));

let host: HTMLDivElement;
let root: Root;
beforeEach(() => { host = document.createElement('div'); document.body.append(host); root = createRoot(host); });
afterEach(() => { act(() => root.unmount()); host.remove(); });

const list = (type: string, lists: string[], source = 'local') => ({ type, source: { type: source, local: { lists } } });

it('names each invalid line of a local process list', () => {
    const issues = routeListPatternIssues(list('process', ['/opt/app/**', 'foo**bar', '**/aaa/**', 'chrome*']));
    act(() => root.render(<ProcessPatternIssues issues={issues} />));
    const alert = host.querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain('processPatterns.invalid {"count":2}');
    const items = [...alert.querySelectorAll('li')].map(item => item.textContent);
    expect(items[0]).toContain('processPatterns.line {"line":2}');
    expect(items[0]).toContain('foo**bar');
    expect(items[0]).toContain('processPatterns.problems.doubleStarComponent');
    expect(items[1]).toContain('processPatterns.line {"line":4}');
    expect(items[1]).toContain('processPatterns.problems.notAbsolute');
});

it('does not validate host lists or remote process lists', () => {
    expect(routeListPatternIssues(list('host', ['foo**bar']))).toEqual([]);
    expect(routeListPatternIssues(list('process', ['foo**bar'], 'remote'))).toEqual([]);
    act(() => root.render(<ProcessPatternIssues issues={[]} />));
    expect(host.innerHTML).toBe('');
});

it('explains the syntax and the Windows drive rules', () => {
    act(() => root.render(<ProcessPatternHelp />));
    const text = host.textContent ?? '';
    for (const example of ['/Applications/ExampleEditor.app/**', '**/aaa/**', 'C:\\Program Files\\ExampleEditor\\**', '**/Program Files/ExampleEditor/**']) {
        expect(text).toContain(example);
    }
    expect(text).toContain('processPatterns.windowsFixedDrive');
    expect(text).toContain('processPatterns.windowsAnyDrive');
});
