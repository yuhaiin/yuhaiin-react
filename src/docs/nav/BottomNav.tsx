import { useSession } from '@/auth/context';
import { canReadRoute } from '@/auth/policy';
import { motionTiming } from '@/component/v2/styles';
import { useHashSearch } from '@/hooks/useHashLocation';
import { useMediaQuery } from '@/hooks/use-media-query';
import clsx from 'clsx';
import { Activity, Ellipsis, House, ListFilter, Server, type LucideIcon } from 'lucide-react';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { forwardRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';

interface Tab { key: string; path: string; icon: LucideIcon; owns: (path: string) => boolean }

const normalize = (path: string) => path.replace(/\/+$/, '') || '/';
const under = (root: string) => (path: string) => path === root || path.startsWith(`${root}/`);

/** Phone tabs for the most used areas; every other page stays one tap away under More. */
export const bottomTabs: Tab[] = [
    { key: 'home', path: '/', icon: House, owns: path => path === '/' },
    { key: 'nodes', path: '/docs/group', icon: Server, owns: under('/docs/group') },
    { key: 'routing', path: '/docs/bypass', icon: ListFilter, owns: path => ['/docs/bypass', '/docs/bypass/list', '/docs/bypass/test', '/docs/bypass/resolver'].includes(path) },
    { key: 'connections', path: '/docs/connections/v2', icon: Activity, owns: path => under('/docs/connections')(path) || path === '/docs/bypass/block' },
];

/**
 * Query parameters that open a record or a draft in a list/detail workspace
 * (see docs/navigation.md). Editors take the whole screen on a phone, so the
 * tab bar steps aside while one is open.
 */
const detailParams = ['node', 'rule', 'list', 'resolver', 'selector', 'subscription', 'publish', 'inbound', 'gateway', 'new', 'match'];
export const hasOpenDetail = (search: string) => {
    const query = new URLSearchParams(search);
    return detailParams.some(name => query.has(name));
};

const textEntry = (element: Element | null) => {
    if (!(element instanceof HTMLElement)) return false;
    if (element.isContentEditable || element instanceof HTMLTextAreaElement) return true;
    return element instanceof HTMLInputElement && !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'color', 'file', 'image'].includes(element.type);
};

/**
 * True while a text field has focus. On a phone that means the soft keyboard is
 * up; the WebView resizes above it, so a fixed tab bar would ride on the keyboard.
 */
export function useTextEntryFocus() {
    const [focused, setFocused] = useState(() => typeof document !== 'undefined' && textEntry(document.activeElement));
    useEffect(() => {
        const update = () => setFocused(textEntry(document.activeElement));
        // focusout fires before the next element gains focus; wait for it.
        const later = () => requestAnimationFrame(update);
        document.addEventListener('focusin', update);
        document.addEventListener('focusout', later);
        return () => { document.removeEventListener('focusin', update); document.removeEventListener('focusout', later); };
    }, []);
    return focused;
}

/**
 * Whether the phone tab bar is shown for this location (CSS hides it from lg up).
 * A landscape phone has too little height to spare 64px; its App Bar menu
 * still reaches every page.
 */
export function useBottomNavVisible() {
    const search = useHashSearch();
    const typing = useTextEntryFocus();
    const short = useMediaQuery('(max-height: 499px)');
    // From md the detail sits beside its list (and is auto-selected), so it is not a separate screen.
    const phone = useMediaQuery('(max-width: 767px)');
    return !(phone && hasOpenDetail(search)) && !typing && !short;
}

export const BottomNav = forwardRef<HTMLButtonElement, {
    visible: boolean;
    /** Slid away while the page scrolls down; unlike !visible it keeps the page's bottom space. */
    collapsed?: boolean;
    moreOpen: boolean;
    onMore: () => void;
}>(({ visible, collapsed = false, moreOpen, onMore }, moreRef) => {
    const { t } = useTranslation('nav');
    const [location, navigate] = useLocation();
    const session = useSession();
    const reducedMotion = useReducedMotion();
    const path = normalize(location);
    const tabs = bottomTabs.filter(tab => !session || canReadRoute(tab.path, session.principal.permissions));
    const current = tabs.find(tab => tab.owns(path))?.key ?? 'more';
    const active = moreOpen ? 'more' : current;

    const select = (tab: Tab) => {
        if (path === tab.path) {
            // Tapping the current tab returns to the top, as in native apps.
            document.querySelector('[data-ui-transition="page"]')?.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
            return;
        }
        navigate(tab.path);
    };

    const item = (key: string, Icon: LucideIcon, props: { onClick: () => void; href?: string; ref?: typeof moreRef; expanded?: boolean }) => {
        const selected = active === key;
        const content = <>
            <span className="relative flex h-8 w-12 max-w-full items-center justify-center min-[360px]:w-14">
                {selected && <motion.span aria-hidden="true" layoutId="bottom-nav-active" className="absolute inset-0 rounded-full bg-ui-primary-soft"
                    transition={reducedMotion ? { duration: 0 } : { duration: motionTiming.normal, ease: 'easeOut' }} />}
                <Icon size={20} strokeWidth={selected ? 2.2 : 1.8} className="relative" aria-hidden="true" />
            </span>
            <span className="max-w-full truncate px-0.5 text-xs leading-4">{t(`tabs.${key}`)}</span>
        </>;
        const className = clsx(
            'flex min-h-14 min-w-0 flex-1 basis-auto flex-col items-center justify-center gap-0.5 rounded-ui-md border-0 bg-transparent px-0 pt-1.5 pb-1 no-underline outline-none',
            'transition-colors duration-[var(--motion-fast)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ui-focus',
            'motion-safe:active:scale-[0.96] motion-safe:transition-[color,transform]',
            selected ? 'font-semibold text-ui-heading' : 'font-medium text-ui-muted hover:text-ui-fg',
        );
        if (props.href) return <a key={key} href={props.href} aria-current={selected ? 'page' : undefined} className={className}
            onClick={event => { if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); props.onClick(); } }}>{content}</a>;
        return <button key={key} ref={props.ref} type="button" aria-haspopup="dialog" aria-expanded={props.expanded} aria-label={t('more')} className={className} onClick={props.onClick}>{content}</button>;
    };

    return <nav aria-label={t('primary')} data-bottom-nav={visible ? 'visible' : 'hidden'}
        className={clsx(
            'fixed inset-x-0 bottom-0 z-[1030] border-t border-ui-border pb-[env(safe-area-inset-bottom)] lg:hidden',
            'transition-transform duration-[var(--motion-slow)] ease-[var(--ease-standard)] will-change-transform',
            (!visible || collapsed) && 'pointer-events-none translate-y-full',
        )}
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
        aria-hidden={visible && !collapsed ? undefined : true}
        inert={!visible || collapsed}>
        <LayoutGroup id="bottom-nav">
            <div className="mx-auto flex h-[var(--bottom-nav-height)] max-w-xl items-stretch gap-1 px-2 py-1">
                {tabs.map(tab => item(tab.key, tab.icon, { href: `#${tab.path}`, onClick: () => select(tab) }))}
                {item('more', Ellipsis, { onClick: onMore, ref: moreRef, expanded: moreOpen })}
            </div>
        </LayoutGroup>
    </nav>;
});
BottomNav.displayName = 'BottomNav';
