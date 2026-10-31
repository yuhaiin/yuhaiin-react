import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Popover } from 'radix-ui';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { cn, motionTiming, ui } from './styles';

const pad = (value: number) => String(value).padStart(2, '0');
const dayKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const timeKey = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;
const parseDay = (day: string) => { const [year, month, date] = day.split('-').map(Number); return year && month && date ? new Date(year, month - 1, date) : undefined; };
const arrowDays: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };

/**
 * A themed replacement for native date inputs, whose popups cannot be styled. Values keep
 * the native `YYYY-MM-DD[THH:mm]` format, and a hidden native input carries form validation.
 */
export function DateTimeField({ type = 'datetime-local', value, onChange, disabled, required, ariaLabel }: {
    type?: 'date' | 'datetime-local';
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    required?: boolean;
    ariaLabel?: string;
}) {
    const { t, i18n } = useTranslation('common');
    const reduced = useReducedMotion();
    const [open, setOpen] = useState(false);
    const locale = i18n?.language;
    const [day, time = ''] = value.split('T');
    const selected = parseDay(day);
    const hasTime = type === 'datetime-local';
    const shown = selected && new Intl.DateTimeFormat(locale, { dateStyle: 'medium', ...(hasTime && time ? { timeStyle: 'short' } : {}) }).format(new Date(`${day}T${time || '00:00'}`));
    return <div className="relative min-w-0">
        <Popover.Root open={open} onOpenChange={setOpen}>
            <Popover.Trigger type="button" disabled={disabled} aria-label={ariaLabel} className={cn(ui.field, ui.fieldFocus, ui.fieldDisabled, 'flex min-h-field items-center justify-between gap-2 text-left max-sm:min-h-11')}>
                <span className={cn('min-w-0 truncate', !shown && 'text-ui-muted')}>{shown ?? t(hasTime ? 'dateTime.placeholderDateTime' : 'dateTime.placeholderDate')}</span>
                <CalendarDays size={16} aria-hidden="true" className="shrink-0 text-ui-muted" />
            </Popover.Trigger>
            <Popover.Portal><Popover.Content asChild align="start" sideOffset={4} collisionPadding={12} onOpenAutoFocus={event => event.preventDefault()}>
                <motion.div data-ui-transition="popover" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : motionTiming.normal, ease: 'easeOut' }}
                    style={{ maxHeight: 'var(--radix-popover-content-available-height)' }}
                    className="z-[2000] overflow-y-auto rounded-ui-lg border border-ui-border bg-ui-surface-raised p-3 shadow-ui-elevated">
                    <DatePanel locale={locale} selected={selected} time={time} hasTime={hasTime} onChange={onChange} onClose={() => setOpen(false)} />
                </motion.div>
            </Popover.Content></Popover.Portal>
        </Popover.Root>
        <input type={type} tabIndex={-1} aria-hidden="true" className="sr-only" value={value} required={required} disabled={disabled} onChange={event => onChange(event.target.value)} />
    </div>;
}

function DatePanel({ locale, selected, time, hasTime, onChange, onClose }: {
    locale?: string;
    selected?: Date;
    time: string;
    hasTime: boolean;
    onChange: (value: string) => void;
    onClose: () => void;
}) {
    const { t } = useTranslation('common');
    // The panel mounts on open, so this clock is current for as long as it is shown.
    const [opened] = useState(() => new Date());
    const [cursor, setCursor] = useState(selected ?? opened);
    const focusCursor = useRef(true);
    const grid = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!focusCursor.current) return;
        focusCursor.current = false;
        grid.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
    }, [cursor]);
    const today = dayKey(opened);
    const fallback = timeKey(opened);
    const selectedKey = selected && dayKey(selected);
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const days = Array.from({ length: 42 }, (_, index) => new Date(first.getFullYear(), first.getMonth(), index + 1 - first.getDay()));
    const weekdays = Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(new Date(2023, 0, index + 1)));
    const shiftMonth = (offset: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + offset, 1));
    const pickDay = (date: Date) => {
        setCursor(date);
        if (hasTime) onChange(`${dayKey(date)}T${time || fallback}`);
        else { onChange(dayKey(date)); onClose(); }
    };
    const keyDown = (event: KeyboardEvent) => {
        const days = arrowDays[event.key];
        if (!days) return;
        event.preventDefault();
        focusCursor.current = true;
        setCursor(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + days));
    };
    const [hour = '', minute = ''] = time.split(':');
    const setTime = (next: string) => onChange(`${selectedKey ?? dayKey(cursor)}T${next}`);
    return <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
            <div className="w-[17.5rem] max-w-full">
                <div className="mb-2 flex items-center justify-between gap-2">
                    <Button variant="outline-secondary" size="icon" aria-label={t('dateTime.previousMonth')} onClick={() => shiftMonth(-1)}><ChevronLeft size={16} /></Button>
                    <span aria-live="polite" className="text-sm font-medium text-ui-heading">{new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(cursor)}</span>
                    <Button variant="outline-secondary" size="icon" aria-label={t('dateTime.nextMonth')} onClick={() => shiftMonth(1)}><ChevronRight size={16} /></Button>
                </div>
                <div className="grid grid-cols-7 text-center text-xs text-ui-muted">{weekdays.map((name, index) => <span key={index} aria-hidden="true" className="py-1">{name}</span>)}</div>
                <div ref={grid} className="grid grid-cols-7 gap-0.5" onKeyDown={keyDown}>
                    {days.map(date => {
                        const key = dayKey(date);
                        return <button key={key} type="button" tabIndex={key === dayKey(cursor) ? 0 : -1} aria-pressed={key === selectedKey} aria-label={new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date)} onClick={() => pickDay(date)} className={cn(
                            'flex aspect-square min-w-0 items-center justify-center rounded-ui-sm text-sm tabular-nums transition-colors', ui.focusRing,
                            key === selectedKey ? 'bg-ui-primary font-medium text-ui-primary-foreground' : 'hover:bg-ui-hover',
                            key !== selectedKey && (date.getMonth() === first.getMonth() ? 'text-ui-fg' : 'text-ui-muted/60'),
                            key === today && key !== selectedKey && 'font-medium text-ui-primary ring-1 ring-inset ring-ui-primary/50',
                        )}>{date.getDate()}</button>;
                    })}
                </div>
            </div>
            {hasTime && <div className="flex gap-1 border-ui-border max-sm:border-t max-sm:pt-3 sm:border-l sm:pl-3">
                <TimeColumn label={t('dateTime.hour')} count={24} value={hour} onSelect={next => setTime(`${next}:${minute || fallback.split(':')[1]}`)} />
                <TimeColumn label={t('dateTime.minute')} count={60} value={minute} onSelect={next => setTime(`${hour || fallback.split(':')[0]}:${next}`)} />
            </div>}
        </div>
        <div className="flex items-center justify-between gap-2 border-t border-ui-border pt-3">
            <Button size="sm" variant="outline-secondary" onClick={() => { onChange(''); onClose(); }}>{t('dateTime.clear')}</Button>
            <div className="flex gap-2">
                <Button size="sm" variant="outline-secondary" onClick={() => { const now = new Date(); setCursor(now); onChange(hasTime ? `${dayKey(now)}T${timeKey(now)}` : dayKey(now)); if (!hasTime) onClose(); }}>{t(hasTime ? 'dateTime.now' : 'dateTime.today')}</Button>
                {hasTime && <Button size="sm" variant="primary" onClick={onClose}>{t('dateTime.done')}</Button>}
            </div>
        </div>
    </div>;
}

function TimeColumn({ label, count, value, onSelect }: { label: string; count: number; value: string; onSelect: (value: string) => void }) {
    const center = (item: HTMLButtonElement | null) => {
        // Moves only this list; scrollIntoView would also scroll the page behind the popover.
        const column = item?.parentElement;
        if (item && column) column.scrollTop = item.offsetTop - (column.clientHeight - item.clientHeight) / 2;
    };
    return <div role="group" aria-label={label} className="relative flex w-full flex-col gap-0.5 overflow-y-auto overscroll-contain [scrollbar-width:none] max-sm:h-28 sm:h-[19rem] sm:w-12">
        {Array.from({ length: count }, (_, index) => pad(index)).map(item => <button key={item} type="button" ref={item === value ? center : undefined} aria-pressed={item === value} aria-label={`${label} ${item}`} onClick={() => onSelect(item)} className={cn(
            'min-h-9 shrink-0 rounded-ui-sm text-sm tabular-nums transition-colors', ui.focusRing,
            item === value ? 'bg-ui-primary font-medium text-ui-primary-foreground' : 'text-ui-fg hover:bg-ui-hover',
        )}>{item}</button>)}
    </div>;
}
