import { useSecretField, isSecretPlaceholder, useProtectedSetting } from "@/auth/secret-fields";
import { useTranslation } from 'react-i18next';

import { Lock, Plus, Trash } from 'lucide-react';
import { FC, useId, useRef, useState } from 'react';
import { Button } from './button';
import { Textarea } from './input';
import { cn, ui } from './styles';

const MIN_EDITOR_ROWS = 3;
const MAX_EDITOR_ROWS = 16;

const parseLines = (text: string) => text.split('\n').map(line => line.trim()).filter(line => line !== "");

/** Puts saved secrets back at their positions, since order can matter (commands). */
function mergeSaved(saved: { value: string; index: number }[], entries: string[]) {
    const merged = [...entries];
    for (const { value, index } of saved) merged.splice(Math.min(index, merged.length), 0, value);
    return merged;
}

export const InputList: FC<{
    title: string;
    data?: string[] | null;
    onChange: (data: string[]) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    secret?: boolean;
    executable?: boolean;
    /** The surrounding section already names the list and shows its size. */
    hideHeader?: boolean;
}> = ({ title, data, onChange, className, placeholder, disabled, secret, executable, hideHeader }) => {
    const { t: uiT } = useTranslation('ui');
    const { t: authT } = useTranslation('auth');
    const id = useId();
    const gutter = useRef<HTMLPreElement>(null);
    const items = Array.isArray(data) ? data : [];
    const access = useSecretField(items.find(isSecretPlaceholder), secret);
    const execute = useProtectedSetting("execute");
    disabled = disabled || access.disabled || Boolean(executable && !execute);

    // Saved secrets never enter the editable text: they show as locked rows and survive edits.
    const saved = items.flatMap((value, index) => isSecretPlaceholder(value) ? [{ value, index }] : []);
    const entries = items.filter(item => !isSecretPlaceholder(item));

    // Blank lines and spaces stay in the draft while typing so the caret never jumps;
    // the data only ever holds cleaned entries, and blur tidies the draft to match.
    const source = parseLines(entries.join('\n')).join('\n');
    const [draft, setDraft] = useState(entries.join('\n'));
    if (parseLines(draft).join('\n') !== source) setDraft(entries.join('\n'));

    const lineCount = draft.split('\n').length;
    const update = (text: string) => {
        setDraft(text);
        const next = parseLines(text);
        if (next.join('\n') !== source) onChange(mergeSaved(saved, next));
    };
    const removeSaved = (index: number) => onChange(items.filter((_, position) => position !== index));

    return (
        <div className={className}>
            {!hideHeader && (
                <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor={id} className="min-w-0 truncate text-sm font-medium text-ui-heading">{title}</label>
                    {items.length > 0 && <span className="shrink-0 text-xs tabular-nums text-ui-muted">{items.length}</span>}
                </div>
            )}
            {saved.map(({ index }) => (
                <div key={index} className="mb-2 flex min-h-field items-center gap-2 rounded-ui-sm border border-ui-border bg-ui-surface-muted/50 pl-3 pr-1 text-sm text-ui-muted">
                    <Lock size={14} aria-hidden="true" className="shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{authT('secrets.savedValue')}</span>
                    {!disabled && (
                        <Button variant="ghost" size="icon" className="hover:text-ui-danger" aria-label={`${uiT("delete")} ${title} ${index + 1}`} onClick={() => removeSaved(index)}>
                            <Trash size={16} />
                        </Button>
                    )}
                </div>
            ))}
            {/* The cap applies here because the full-height gutter would otherwise stretch the textarea past its rows. */}
            {(!disabled || saved.length === 0) && <div style={{ maxHeight: `calc(${MAX_EDITOR_ROWS} * 1.5rem + 1rem + 2px)` }} className={cn(
                "flex overflow-hidden rounded-ui-sm border border-ui-border bg-ui-surface transition-colors duration-[var(--motion-fast)] hover:border-ui-border-strong focus-within:border-ui-primary focus-within:ring-1 focus-within:ring-ui-primary",
                disabled && "border-ui-disabled-border bg-ui-disabled hover:border-ui-disabled-border",
            )}>
                <pre ref={gutter} aria-hidden="true" className="m-0 min-w-9 shrink-0 select-none overflow-hidden border-r border-ui-border bg-ui-surface-muted/50 px-2 py-2 text-right font-mono text-base leading-6 tabular-nums text-ui-muted sm:text-sm">
                    {Array.from({ length: lineCount }, (_, index) => index + 1).join('\n')}
                </pre>
                <textarea
                    id={id}
                    aria-label={title}
                    value={draft}
                    disabled={disabled}
                    rows={Math.min(Math.max(lineCount, MIN_EDITOR_ROWS), MAX_EDITOR_ROWS)}
                    wrap="off"
                    spellCheck={false}
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoComplete="off"
                    placeholder={placeholder ?? uiT("onePerLine")}
                    onChange={event => update(event.target.value)}
                    onBlur={() => setDraft(parseLines(draft).join('\n'))}
                    onScroll={event => { if (gutter.current) gutter.current.scrollTop = event.currentTarget.scrollTop; }}
                    className={cn(
                        "min-w-0 flex-1 resize-none overflow-auto whitespace-pre border-0 bg-transparent px-3 py-2 font-mono text-base leading-6 text-ui-fg outline-none placeholder:text-ui-muted sm:text-sm",
                        ui.fieldDisabled,
                        "disabled:bg-transparent",
                    )}
                />
            </div>}
        </div>
    );
}

export const InputBytesList: FC<{
    title: string;
    data: Uint8Array[] | undefined | null;
    onChange: (data: Uint8Array[]) => void;
    className?: string;
    disabled?: boolean;
}> = ({ title, data = [], onChange, className, disabled }) => {
    const { t: uiT } = useTranslation('ui');

    const items = Array.isArray(data) ? data : [];
    const [newItem, setNewItem] = useState("");

    const add = () => {
        if (!newItem.trim() || disabled) return;
        onChange([...items, new TextEncoder().encode(newItem)]);
        setNewItem("");
    }

    const remove = (i: number) => {
        if (disabled) return;
        const newData = [...items];
        newData.splice(i, 1);
        onChange(newData);
    }

    const edit = (i: number, val: string) => {
        if (disabled) return;
        const newData = [...items];
        newData[i] = new TextEncoder().encode(val);
        onChange(newData);
    }

    return (
        <div className={className}>
            <div className="mb-2 flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-medium text-ui-heading">{title}</span>
                {items.length > 0 && <span className="shrink-0 text-xs tabular-nums text-ui-muted">{items.length}</span>}
            </div>

            <div className="flex flex-col gap-3">
                {items.map((v, i) => (
                    <div key={i} className="relative">
                        <Textarea
                            code
                            aria-label={`${title} ${i + 1}`}
                            value={new TextDecoder().decode(v)}
                            onChange={(e) => edit(i, e.target.value)}
                            readOnly={disabled}
                            rows={3}
                            className={cn(!disabled && "pr-12")}
                        />
                        {!disabled && (
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 z-[3] text-ui-muted hover:text-ui-danger" aria-label={uiT("delete") + " " + `${title} ${i + 1}`} onClick={() => remove(i)}>
                                <Trash size={16} />
                            </Button>
                        )}
                    </div>
                ))}
                {disabled && items.length === 0 && (
                    <p className="m-0 text-sm text-ui-muted">{uiT("emptyEntries", { title })}</p>
                )}
                {!disabled && (
                    <div className="flex flex-col gap-2">
                        <Textarea
                            code
                            aria-label={title}
                            placeholder={uiT("pasteEntry")}
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            rows={3}
                        />
                        <Button size="sm" className="self-end" onClick={add} disabled={!newItem.trim()} aria-label={uiT("add") + " " + title}>
                            <Plus size={16} />{uiT("add")}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
