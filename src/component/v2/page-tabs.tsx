import { allowNavigation } from '@/hooks/navigation-guard';
import { navigation } from '@/hooks/navigation';
import { useHashSearch } from '@/hooks/useHashLocation';
import { withQuery } from '@/hooks/use-workspace-navigation';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { Tabs } from 'radix-ui';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { TabContent } from './tab-content';

export interface PageTab { value: string; label: string; content: ReactNode; className?: string }

/**
 * Underlined section tabs. Inactive panels unmount, so their requests and polling stop.
 * The active tab is kept in the URL (`?tab=`) by replacing the entry: reload and
 * links restore it, and switching tabs adds no Back steps.
 */
export function PageTabs({ label, items, param = 'tab' }: { label: string; items: PageTab[]; param?: string }) {
    const selected = new URLSearchParams(useHashSearch()).get(param) ?? undefined;
    const [direction, setDirection] = useState(1);
    const groupId = useId();
    const reduced = useReducedMotion();
    const tabs = useRef<HTMLDivElement>(null);
    const tab = items.some(item => item.value === selected) ? selected : items[0]?.value;
    useEffect(() => {
        // Keep the active tab visible without scrolling the settings page.
        const reveal = () => {
            const list = tabs.current;
            const active = list?.querySelector<HTMLElement>('[data-state=active]');
            if (!list || !active || !list.clientWidth) return;
            const parent = list.getBoundingClientRect(), item = active.getBoundingClientRect();
            if (item.left < parent.left) list.scrollLeft += item.left - parent.left;
            else if (item.right > parent.right) list.scrollLeft += item.right - parent.right;
        };
        reveal(); window.addEventListener('resize', reveal);
        return () => window.removeEventListener('resize', reveal);
    }, [tab, items.length]);
    if (items.length === 0) return null;
    if (items.length === 1) return <div className={items[0].className}>{items[0].content}</div>;
    const position = (value: string | undefined) => items.findIndex(item => item.value === value);
    return <LayoutGroup id={groupId}><Tabs.Root activationMode="manual" value={tab} onValueChange={async next => {
        if (next === tab || !await allowNavigation()) return;
        setDirection(Math.sign(position(next) - position(tab)));
        navigation.replace(withQuery(navigation.current.location, query => query.set(param, next)));
    }}>
        <Tabs.List ref={tabs} aria-label={label} className="mb-6 flex min-w-0 gap-1 overflow-x-auto border-b border-ui-border">
            {items.map(item => <Tabs.Trigger key={item.value} value={item.value} className="relative min-h-11 shrink-0 whitespace-nowrap rounded-t-ui-md px-3 py-2 text-sm text-ui-muted transition-colors hover:text-ui-heading focus-visible:bg-ui-selected focus-visible:outline-none data-[state=active]:font-semibold data-[state=active]:text-ui-primary">{item.label}{item.value === tab && <motion.span aria-hidden="true" layoutId="page-active-tab" className="pointer-events-none absolute bottom-0 inset-x-0 h-0.5 bg-ui-primary" transition={{ duration: reduced ? 0 : 0.2, ease: "easeOut" }} />}</Tabs.Trigger>)}
        </Tabs.List>
        {items.map(item => <TabContent key={item.value} direction={direction} value={item.value} className={item.className ?? 'min-w-0'}>{item.content}</TabContent>)}
    </Tabs.Root></LayoutGroup>;
}
