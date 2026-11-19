import { processPatternIssues, type ProcessPatternIssue } from '@/contract/process-pattern';
import { TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const syntax: [string, string][] = [
    ['/usr/bin/curl', 'exact'],
    ['*', 'star'],
    ['?', 'question'],
    ['**', 'doubleStar'],
    ['**/aaa/**', 'anyDirectory'],
];

const examples = [
    '/Applications/ExampleEditor.app/**',
    '/usr/lib/example-editor/**',
    '**/aaa/**',
    '**/Example*/bin/helper?.exe',
];

/** Explains the process path pattern syntax next to a process list editor. */
export function ProcessPatternHelp() {
    const { t } = useTranslation('routing');
    const code = 'rounded-ui-sm bg-ui-surface-muted px-1 py-0.5 font-mono text-xs text-ui-fg';
    return <details className="rounded-ui-md border border-ui-border px-3 py-2 text-sm">
        <summary className="cursor-pointer font-medium text-ui-heading">{t('processPatterns.title')}</summary>
        <div className="mt-3 space-y-3 text-ui-muted">
            <dl className="grid grid-cols-[minmax(0,auto)_1fr] gap-x-3 gap-y-1.5">
                {syntax.map(([pattern, key]) => <div key={key} className="contents">
                    <dt><code className={code}>{pattern}</code></dt>
                    <dd>{t(`processPatterns.syntax.${key}`)}</dd>
                </div>)}
            </dl>
            <div>
                <p className="mb-1 font-medium text-ui-heading">{t('processPatterns.examples')}</p>
                <ul className="space-y-1">{examples.map(example => <li key={example}><code className={code}>{example}</code></li>)}</ul>
            </div>
            <div>
                <p className="mb-1 font-medium text-ui-heading">{t('processPatterns.windowsTitle')}</p>
                <ul className="space-y-1.5">
                    <li><code className={code}>{'C:\\Program Files\\ExampleEditor\\**'}</code> — {t('processPatterns.windowsFixedDrive')}</li>
                    <li><code className={code}>**/Program Files/ExampleEditor/**</code> — {t('processPatterns.windowsAnyDrive')}</li>
                </ul>
                <p className="mt-1.5">{t('processPatterns.windowsCase')}</p>
            </div>
            <p>{t('processPatterns.lookup')}</p>
        </div>
    </details>;
}

/** Lists invalid entries by line; renders nothing when all are valid. */
export function ProcessPatternIssues({ issues }: { issues: ProcessPatternIssue[] }) {
    const { t } = useTranslation('routing');
    if (issues.length === 0) return null;
    return <div role="alert" className="rounded-ui-lg border border-ui-danger/40 bg-ui-danger/10 p-3 text-sm text-ui-danger">
        <div className="mb-1.5 flex items-center gap-2 font-medium"><TriangleAlert size={16} aria-hidden="true" />{t('processPatterns.invalid', { count: issues.length })}</div>
        <ul className="space-y-1">
            {issues.map(issue => <li key={issue.line}>
                {t('processPatterns.line', { line: issue.line })} <code className="break-all font-mono text-xs">{issue.entry}</code>: {t(`processPatterns.problems.${issue.problem}`)}
            </li>)}
        </ul>
    </div>;
}

/** Invalid process entries of a list draft; empty for other list kinds. */
export function routeListPatternIssues(list: { type: string; source: { type?: string; local?: { lists?: string[] } } }): ProcessPatternIssue[] {
    if (list.type !== 'process' || (list.source.type || 'local') !== 'local') return [];
    return processPatternIssues(list.source.local?.lists ?? []);
}
