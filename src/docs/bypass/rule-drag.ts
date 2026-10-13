import type { RuleItem } from '@/contract/route';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

export type RuleDrop = { target: RuleItem; placement: 'insert_before' | 'insert_after' };
type DragView = { source: RuleItem; target?: RuleDrop; x: number; y: number; left: number; width: number; offset: number };
const HOLD_MS = 400;

export function changesRuleOrder(items: RuleItem[], source: RuleItem, drop: RuleDrop): boolean {
    const from = items.findIndex(item => item.id === source.id);
    const to = items.findIndex(item => item.id === drop.target.id);
    return from >= 0 && to >= 0 && from !== to &&
        !(drop.placement === 'insert_before' && to === from + 1) &&
        !(drop.placement === 'insert_after' && to === from - 1);
}

/** Touch stays scrollable until a stationary long press activates the handle. */
export function useRuleDrag(items: RuleItem[], disabled: boolean, onDrop: (source: RuleItem, drop: RuleDrop) => void) {
    const listRef = useRef<HTMLUListElement>(null);
    const [drag, setDrag] = useState<DragView | null>(null);
    const latest = useRef({ items, disabled, onDrop });
    useEffect(() => { latest.current = { items, disabled, onDrop }; }, [items, disabled, onDrop]);
    const cleanup = useRef<() => void>(() => {});
    const session = useRef<{ pointerId: number } | null>(null);
    useEffect(() => () => cleanup.current(), []);

    const start = (event: ReactPointerEvent<HTMLButtonElement>, source: RuleItem) => {
        if (disabled || !event.isPrimary || event.button !== 0 || session.current) return;
        const list = listRef.current;
        const row = event.currentTarget.closest('li');
        const scroller = list?.parentElement;
        if (!list || !row || !scroller) return;
        const rect = row.getBoundingClientRect();
        const touch = event.pointerType !== 'mouse';
        const origin = { x: event.clientX, y: event.clientY };
        let point = { ...origin };
        let active = false;
        let drop: RuleDrop | undefined;
        let timer: ReturnType<typeof setTimeout> | undefined;
        let frame = 0;
        session.current = { pointerId: event.pointerId };
        event.currentTarget.focus({ preventScroll: true });
        if (!touch) event.preventDefault();

        const update = () => {
            const bounds = scroller.getBoundingClientRect();
            drop = undefined;
            if (point.x >= bounds.left - 24 && point.x <= bounds.right + 24 && point.y >= bounds.top - 8 && point.y <= bounds.bottom + 8) {
                const rows = [...list.querySelectorAll<HTMLLIElement>('li[data-rule-id]')].filter(item => item.dataset.ruleId !== source.id);
                const target = rows.find(item => point.y < item.getBoundingClientRect().bottom) ?? rows[rows.length - 1];
                const rule = latest.current.items.find(item => item.id === target?.dataset.ruleId);
                if (rule && target) {
                    const box = target.getBoundingClientRect();
                    drop = { target: rule, placement: point.y < box.top + box.height / 2 ? 'insert_before' : 'insert_after' };
                }
            }
            setDrag(previous => previous && previous.x === point.x && previous.y === point.y && previous.target?.target.id === drop?.target.id && previous.target?.placement === drop?.placement
                ? previous : { source, target: drop, ...point, left: rect.left, width: rect.width, offset: origin.y - rect.top });
        };
        const tick = () => {
            if (!active) return;
            const box = scroller.getBoundingClientRect();
            const edge = 40;
            const inside = point.x >= box.left - 24 && point.x <= box.right + 24;
            const speed = !inside ? 0 : point.y < box.top + edge ? -Math.min(12, (box.top + edge - point.y) / 3)
                : point.y > box.bottom - edge ? Math.min(12, (point.y - box.bottom + edge) / 3) : 0;
            if (speed) { scroller.scrollTop += speed; update(); }
            frame = requestAnimationFrame(tick);
        };
        const activate = () => {
            if (latest.current.disabled) { finish(false); return; }
            active = true;
            setDrag({ source, ...point, left: rect.left, width: rect.width, offset: origin.y - rect.top });
            frame = requestAnimationFrame(tick);
        };
        const detach = () => {
            clearTimeout(timer); cancelAnimationFrame(frame);
            document.removeEventListener('pointermove', move);
            document.removeEventListener('pointerup', up);
            document.removeEventListener('pointercancel', cancel);
            document.removeEventListener('touchmove', touchMove, true);
            document.removeEventListener('keydown', key);
            window.removeEventListener('blur', cancel);
            session.current = null;
            cleanup.current = () => {};
        };
        const finish = (commit: boolean) => {
            const result = drop;
            detach(); setDrag(null);
            if (commit && active && result && !latest.current.disabled && changesRuleOrder(latest.current.items, source, result)) latest.current.onDrop(source, result);
        };
        const move = (next: PointerEvent) => {
            if (next.pointerId !== event.pointerId) return;
            point = { x: next.clientX, y: next.clientY };
            const distance = Math.hypot(point.x - origin.x, point.y - origin.y);
            if (latest.current.disabled) { finish(false); return; }
            if (!active) {
                if (touch && distance > 10) { finish(false); return; }
                if (!touch && distance >= 5) activate();
            }
            if (active) { next.preventDefault(); update(); }
        };
        const up = (next: PointerEvent) => {
            if (next.pointerId !== event.pointerId) return;
            point = { x: next.clientX, y: next.clientY };
            if (active) update();
            finish(true);
        };
        const cancel = () => finish(false);
        const key = (next: KeyboardEvent) => { if (next.key === 'Escape' || next.key === 'Tab') finish(false); };
        // Pointer events alone cannot stop a touch pan after touch-action was
        // negotiated. Cancel touchmove only after the long press, before the UA scrolls.
        const touchMove = (next: TouchEvent) => {
            if (next.touches.length !== 1) { finish(false); return; }
            if (active) next.preventDefault();
        };
        cleanup.current = detach;
        document.addEventListener('pointermove', move, { passive: false });
        document.addEventListener('pointerup', up);
        document.addEventListener('pointercancel', cancel);
        document.addEventListener('touchmove', touchMove, { passive: false, capture: true });
        document.addEventListener('keydown', key);
        window.addEventListener('blur', cancel);
        if (touch) timer = setTimeout(activate, HOLD_MS);
    };
    return { listRef, drag, start };
}
