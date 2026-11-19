import { describe, expect, it } from 'vitest';
import { processPatternIssues, processPatternProblem } from './process-pattern';

describe('process path patterns', () => {
    it.each([
        '/usr/bin/curl',
        '/Applications/ExampleEditor.app/**',
        '/usr/lib/example-editor/**',
        '**/aaa/**',
        '**/ExampleEditor.app/**',
        '**/Example*/bin/**',
        '**/Example*/bin/helper?.exe',
        '/srv/**/tools/run?',
        'C:\\Program Files\\ExampleEditor\\**',
        'c:/program files/exampleeditor/bin.exe',
        '**/Program Files/ExampleEditor/**',
        '\\\\server\\share\\ExampleEditor\\**',
        '\\\\?\\C:\\Program Files\\**',
        '\\Device\\HarddiskVolume3\\Program Files\\**',
        'com.example.app',
        ':System',
        '/opt/a/../b',
    ])('accepts %s', entry => {
        expect(processPatternProblem(entry)).toBeUndefined();
    });

    it.each([
        ['**foo', 'doubleStarComponent'],
        ['foo**bar', 'doubleStarComponent'],
        ['/opt/app**', 'doubleStarComponent'],
        ['C:\\Program Files\\foo**', 'doubleStarComponent'],
        ['foo/**', 'notAbsolute'],
        ['chrome*', 'notAbsolute'],
        ['bin/curl', 'relativePath'],
        ['C:relative\\path', 'driveRelative'],
        ['\\Program Files\\ExampleEditor\\**', 'noDrive'],
        ['*:\\Program Files\\**', 'wildcardDrive'],
        ['\\\\*\\share\\app.exe', 'wildcardRoot'],
        ['/..', 'aboveRoot'],
        ['**/../x', 'dotDotAfterWildcard'],
    ] as const)('rejects %s', (entry, problem) => {
        expect(processPatternProblem(entry)).toBe(problem);
    });

    it('reports lines like the backend, skipping comments and blanks', () => {
        expect(processPatternIssues(['/usr/bin/curl', '# note', '', 'foo**bar  # bad', 'chrome*'])).toEqual([
            { line: 4, entry: 'foo**bar', problem: 'doubleStarComponent' },
            { line: 5, entry: 'chrome*', problem: 'notAbsolute' },
        ]);
    });
});
