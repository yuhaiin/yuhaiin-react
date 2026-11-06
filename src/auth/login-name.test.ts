import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { LOGIN_NAME_PATTERN } from './login-name';

// The browser applies `pattern` as ^(?:pattern)$ with the v flag.
const compile = (pattern: string) => new RegExp(`^(?:${pattern})$`, 'v');

it('compiles under the v flag browsers use for pattern attributes', () => {
    const login = compile(LOGIN_NAME_PATTERN);
    expect(login.test('ops-team_1.admin')).toBe(true);
    expect(login.test('bad name')).toBe(false);
    expect(login.test('x'.repeat(65))).toBe(false);
});

it('keeps every literal pattern attribute valid under the v flag', () => {
    const files = (dir: string): string[] => readdirSync(dir).flatMap(name => {
        const path = join(dir, name);
        return statSync(path).isDirectory() ? files(path) : name.endsWith('.tsx') ? [path] : [];
    });
    for (const file of files(join(__dirname, '..'))) {
        for (const [, pattern] of readFileSync(file, 'utf8').matchAll(/\bpattern="([^"]*)"/g)) {
            expect(() => compile(pattern), `${file}: ${pattern}`).not.toThrow();
        }
    }
});
