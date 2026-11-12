import { useSession } from '@/auth/context';
import { canReadRoute } from '@/auth/policy';
import { motionTiming } from '@/component/v2/styles';
import { useHashSearch } from '@/hooks/useHashLocation';
import { useMediaQuery } from '@/hooks/use-media-query';
import clsx from 'clsx';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { bottomTabs, hasOpenDetail } from './BottomNav';
import { navigationSections, type NavigationLink } from './navigation';

const normalize = (path: string) => path.replace(/\/+$/, '') || '/';
const links = navigationSections.flatMap(section => section.items.flatMap(item => 'path' in item ? [item] : item.items));

/** The tab-bar section a page belongs to; pages under More have none. */
export const sectionOf = (path: string) => bottomTabs.find(tab => tab.owns(normalize(path)))?.key;

/** The pages a tab owns, in navigation order (Nodes: Nodes, Selectors, Subscribe …). */
export function sectionLinks(path: string): NavigationLink[] {
    const tab = bottomTabs.find(item => item.owns(normalize(path)));
    return tab ? links.filter(link => tab.owns(link.path)) : [];
}

/**
 * The sibling pages to offer below the phone App Bar; empty when the row is not
 * shown. A tab owns several pages, and without this row its other pages are
 * reachable only through the drawer.
 */
export function useSectionTabs(): NavigationLink[] {
    const [location] = useLocation();
    const session = useSession();
    const search = useHashSearch();
    const shell = useMediaQuery('(max-width: 1023px)');
    // An open record is its own screen on a phone, and a landscape phone has no height to spare.
    const phone = useMediaQuery('(max-width: 767px)');
    const short = useMediaQuery('(max-height: 499px)');
    const permissions = session?.principal.permissions;
    return useMemo(() => {
        if (!shell || short || (phone && hasOpenDetail(search))) return [];
        const items = sectionLinks(location).filter(link => !permissions || canReadRoute(link.path, permissions));
        return items.length > 1 ? items : [];
    }, [shell, short, phone, search, location, permissions]);
}

/** Second row of the phone App Bar: the pages of the current tab-bar section. */
export function SectionTabs({ items }: { items: NavigationLink[] }) {
    const { t } = useTranslation(['nav', 'ui', 'routing', 'android']);
    const [location, navigate] = useLocation();
    const reducedMotion = useReducedMotion();
    const row = useRef<HTMLDivElement>(null);
    const path = normalize(location);
    useEffect(() => {
        // Keep the current page's tab in view; only the row scrolls, never the page.
        const list = row.current;
        const active = list?.querySelector<HTMLElement>('[aria-current="page"]');
        if (!list || !active) return;
        const parent = list.getBoundingClientRect(), item = active.getBoundingClientRect();
        const margin = 24;
        if (item.left < parent.left + margin) list.scrollLeft += item.left - parent.left - margin;
        else if (item.right > parent.right - margin) list.scrollLeft += item.right - parent.right + margin;
    }, [path, items.length]);
    return <nav aria-label={t('sections')} className="h-11 min-w-0 border-t border-ui-border/60">
        <LayoutGroup id="section-tabs">
            <div ref={row} className="flex h-full items-stretch gap-1 overflow-x-auto overscroll-x-contain px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {items.map(link => {
                    const selected = link.path === path;
                    return <a key={link.path} href={`#${link.path}`} aria-current={selected ? 'page' : undefined}
                        className={clsx(
                            'relative flex shrink-0 items-center whitespace-nowrap px-3 text-sm no-underline outline-none',
                            'transition-colors duration-[var(--motion-fast)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus',
                            selected ? 'font-semibold text-ui-heading' : 'font-medium text-ui-muted hover:text-ui-fg',
                        )}
                        onClick={event => {
                            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                            event.preventDefault();
                            if (!selected) navigate(link.path);
                        }}>
                        {selected && <motion.span aria-hidden="true" layoutId="section-tab-active" className="absolute inset-x-0 inset-y-1.5 rounded-full bg-ui-primary-soft"
                            transition={reducedMotion ? { duration: 0 } : { duration: motionTiming.normal, ease: 'easeOut' }} />}
                        <span className="relative">{t(`${link.label.namespace}:${link.label.key}`)}</span>
                    </a>;
                })}
            </div>
        </LayoutGroup>
    </nav>;
}
