/**
 * Client-side check of process list entries, mirroring the backend rules in
 * pkg/route/processpath so mistakes are shown on the line before saving. The
 * backend stays authoritative: it also knows the path syntax of the device.
 */

export type ProcessPatternProblem =
    | 'doubleStarComponent'
    | 'notAbsolute'
    | 'relativePath'
    | 'driveRelative'
    | 'noDrive'
    | 'wildcardDrive'
    | 'wildcardRoot'
    | 'aboveRoot'
    | 'dotDotAfterWildcard';

export interface ProcessPatternIssue {
    /** 1-based position of the entry in the list. */
    line: number;
    entry: string;
    problem: ProcessPatternProblem;
}

/** Same as the backend: drop a trailing "#" comment and surrounding space. */
export function trimListEntry(line: string): string {
    const hash = line.indexOf('#');
    return (hash >= 0 ? line.slice(0, hash) : line).trim();
}

const hasWildcard = (value: string) => /[*?]/.test(value);
const isLetter = (value: string | undefined) => value !== undefined && /^[A-Za-z]$/.test(value);
const isSep = (value: string | undefined) => value === '/' || value === '\\';

/** Splits a Windows-style path into its root names and the remaining text. */
function windowsRoot(entry: string): { names: string[]; rest: string } | undefined {
    const prefix = /^[\\/](?:[\\/][?.]|\?\?)[\\/]/.exec(entry);
    if (prefix) {
        const rest = entry.slice(prefix[0].length);
        const unc = /^UNC(?:[\\/]|$)/i.exec(rest);
        if (unc) return windowsUNC(rest.slice(3));
        if (isLetter(rest[0]) && rest[1] === ':' && (rest.length === 2 || isSep(rest[2]))) return { names: [rest.slice(0, 2)], rest: rest.slice(2) };
        const parts = rest.split(/[\\/]/);
        return parts[0] ? { names: [parts[0]], rest: parts.slice(1).join('/') } : undefined;
    }
    if (/^[\\/]Device[\\/]/i.test(entry)) {
        const parts = entry.split(/[\\/]/);
        return parts[2] ? { names: [parts[1], parts[2]], rest: parts.slice(3).join('/') } : undefined;
    }
    if (isSep(entry[0]) && isSep(entry[1])) return windowsUNC(entry.slice(2));
    if (isLetter(entry[0]) && entry[1] === ':' && isSep(entry[2])) return { names: [entry.slice(0, 2)], rest: entry.slice(2) };
    return undefined;
}

function windowsUNC(value: string): { names: string[]; rest: string } | undefined {
    const parts = value.replace(/^[\\/]+/, '').split(/[\\/]/);
    if (!parts[0] || !parts[1]) return undefined;
    return { names: [parts[0], parts[1]], rest: parts.slice(2).join('/') };
}

function checkComponents(components: string[]): ProcessPatternProblem | undefined {
    const kept: string[] = [];
    for (const component of components) {
        if (component === '' || component === '.') continue;
        if (component === '..') {
            if (kept.length === 0) return 'aboveRoot';
            if (hasWildcard(kept[kept.length - 1])) return 'dotDotAfterWildcard';
            kept.pop();
            continue;
        }
        if (component !== '**' && component.includes('**')) return 'doubleStarComponent';
        kept.push(component);
    }
    return undefined;
}

/** Returns the problem of one trimmed entry, or undefined when it is valid. */
export function processPatternProblem(entry: string): ProcessPatternProblem | undefined {
    if (entry.split(/[\\/]/).some(component => component !== '**' && component.includes('**'))) return 'doubleStarComponent';
    if (entry.split(/[\\/]/)[0] === '**') return checkComponents(entry.split(/[\\/]/));
    if (entry.startsWith('/') && !entry.startsWith('//')) return checkComponents(entry.split('/'));
    const windows = windowsRoot(entry);
    if (windows) {
        if (windows.names.some(hasWildcard)) return 'wildcardRoot';
        return checkComponents(windows.rest.split(/[\\/]/));
    }
    if ((entry[0] === '*' || entry[0] === '?') && entry[1] === ':') return 'wildcardDrive';
    if (isLetter(entry[0]) && entry[1] === ':') return 'driveRelative';
    if (entry.startsWith('\\')) return 'noDrive';
    if (hasWildcard(entry)) return 'notAbsolute';
    if (/[\\/]/.test(entry)) return 'relativePath';
    return undefined;
}

/** Validates every entry of a process list. */
export function processPatternIssues(lines: readonly string[]): ProcessPatternIssue[] {
    const issues: ProcessPatternIssue[] = [];
    lines.forEach((line, index) => {
        const entry = trimListEntry(line);
        if (!entry) return;
        const problem = processPatternProblem(entry);
        if (problem) issues.push({ line: index + 1, entry, problem });
    });
    return issues;
}
