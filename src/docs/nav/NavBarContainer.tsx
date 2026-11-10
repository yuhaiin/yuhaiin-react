import { navigationLabel } from './navigation';
import { useLocation } from 'wouter';

import { Button } from '@/component/v2/button';
import { ArrowLeft, Menu, RotateCw } from 'lucide-react';
import { useAndroidPlatform } from '@/hooks/use-android-platform';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import { BottomNav, useBottomNavVisible } from './BottomNav';
import { useScrollCollapse } from '@/hooks/use-scroll-collapse';
import { useNavigationSnapshot } from '@/hooks/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useAppBarBackHost } from '@/hooks/app-bar';
import { useSoftRefresh } from '@/hooks/use-soft-refresh';
import { PullToRefresh } from './PullToRefresh';
import { SectionTabs, useSectionTabs } from './SectionTabs';
import clsx from 'clsx';

function NavBarContainer({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation(['nav', 'ui', 'routing', 'android']);
    const [location] = useLocation();
    const label = navigationLabel(location);
    const title = label ? t(`${label.namespace}:${label.key}`) : 'Yuhaiin';
    const menuRef = useRef<HTMLButtonElement>(null);
    const moreRef = useRef<HTMLButtonElement>(null);
    // Focus returns to whichever control opened the drawer.
    const returnFocus = useRef<HTMLButtonElement>(null);
    const [showSidebar, setShowSidebar] = useState(false);
    const bottomNav = useBottomNavVisible();
    const phone = useMediaQuery('(max-width: 1023px)');
    // Scrolling down slides both bars away; scrolling up or a page change brings them back.
    const { collapsed, reclaim } = useScrollCollapse(useNavigationSnapshot(), phone && !showSidebar);
    // The Android app has no browser chrome, so its WebView gets a refresh control here.
    const android = useAndroidPlatform();
    // Refreshes the page's data in place; the drawer keeps a full reload for a stuck page.
    const { refreshing, refresh } = useSoftRefresh();
    // An open record on a phone turns the menu button into its Back arrow.
    const back = useAppBarBackHost(useMediaQuery('(max-width: 767px)'));
    const sections = useSectionTabs();
    const openFrom = (trigger: React.RefObject<HTMLButtonElement | null>) => {
        returnFocus.current = trigger.current;
        setShowSidebar(open => !open);
    };
    const hide = useCallback(() => setShowSidebar(false), []);
    // Fixed UI outside this tree (toasts, sheets) also stacks above the tab bar; see --bottom-nav-space.
    useLayoutEffect(() => {
        document.documentElement.dataset.bottomNav = bottomNav ? 'visible' : 'hidden';
        return () => { delete document.documentElement.dataset.bottomNav; };
    }, [bottomNav]);
    // Sticky page actions follow the App Bar up, and full-height pages reclaim its space (global.css).
    // The section row is part of the App Bar: --mobile-app-bar-height grows with it (global.css).
    useLayoutEffect(() => {
        const root = document.documentElement;
        if (sections.length) root.dataset.sectionTabs = ''; else delete root.dataset.sectionTabs;
        return () => { delete root.dataset.sectionTabs; };
    }, [sections.length]);
    useLayoutEffect(() => {
        const root = document.documentElement;
        root.dataset.appBar = collapsed ? 'collapsed' : 'shown';
        if (reclaim) root.dataset.chromeReclaim = ''; else delete root.dataset.chromeReclaim;
        return () => { delete root.dataset.appBar; delete root.dataset.chromeReclaim; };
    }, [collapsed, reclaim]);
    // Animate the page padding only while space is handed over or back. A
    // standing transition would also delay other padding changes, such as the
    // tab bar returning, and clamp the list scroll position restored on Back.
    const reclaimed = useRef(reclaim);
    useLayoutEffect(() => {
        if (reclaimed.current === reclaim) return;
        reclaimed.current = reclaim;
        const root = document.documentElement;
        root.dataset.chromeAnimate = '';
        const timer = window.setTimeout(() => { delete root.dataset.chromeAnimate; }, 300);
        return () => { window.clearTimeout(timer); delete root.dataset.chromeAnimate; };
    }, [reclaim]);

    return (
        <>
            {/* Covers the status bar while the App Bar slides beneath it, then fades so the
                page shows through the status bar, edge to edge, while the bars are away. */}
            <div aria-hidden="true" className={clsx(
                "pointer-events-none fixed inset-x-0 top-0 z-[1031] h-[env(safe-area-inset-top)] lg:hidden",
                "transition-opacity duration-[var(--motion-slow)] ease-[var(--ease-standard)]",
                collapsed && "opacity-0",
            )} style={{ backgroundColor: 'var(--sidebar-bg)' }} />
            <header inert={collapsed} data-app-chrome className={clsx(
                "fixed inset-x-0 top-0 z-[1030] flex h-[calc(var(--mobile-app-bar-height)+env(safe-area-inset-top))] flex-col border-b border-ui-border pt-[env(safe-area-inset-top)] lg:hidden",
                "transition-transform duration-[var(--motion-slow)] ease-[var(--ease-standard)] will-change-transform",
                collapsed && "-translate-y-full",
            )} style={{ backgroundColor: 'var(--sidebar-bg)' }}>
                <div className="flex h-14 shrink-0 items-center gap-2 px-1.5">
                    {back
                        ? <Button key="back" variant="ghost" size="icon" type="button" className="h-11 w-11 shrink-0" onClick={back.run} aria-label={back.label} title={back.label}>
                            <ArrowLeft />
                        </Button>
                        : <Button
                            key="menu"
                            variant="ghost" size="icon"
                            ref={menuRef}
                            type="button"
                            aria-expanded={showSidebar}
                            aria-controls="app-sidebar"
                            className="h-11 w-11 shrink-0"
                            onClick={() => openFrom(menuRef)}
                            aria-label={t('openMenu')}
                        >
                            <Menu />
                        </Button>}
                    <span className="min-w-0 truncate text-base font-semibold text-ui-heading" title={title}>{title}</span>
                    {android && <Button variant="ghost" size="icon" type="button" className="ml-auto h-11 w-11 shrink-0" onClick={() => void refresh()}
                        aria-label={t(refreshing ? 'refreshing' : 'refresh')} aria-busy={refreshing || undefined}>
                        <RotateCw className={clsx(refreshing && 'motion-safe:animate-spin')} />
                    </Button>}
                </div>
                {sections.length > 0 && <SectionTabs items={sections} />}
            </header>
            <PullToRefresh enabled={phone && !showSidebar} refreshing={refreshing} onRefresh={() => void refresh()} />

            <Sidebar id="app-sidebar" triggerRef={returnFocus} show={showSidebar} onHide={hide} />

            {/* The page scroller reserves the tab bar's height through --bottom-nav-space (global.css). */}
            <main className="min-h-screen lg:pt-0">
                {children}
            </main>
            <BottomNav ref={moreRef} visible={bottomNav} collapsed={collapsed} moreOpen={showSidebar} onMore={() => openFrom(moreRef)} />
        </>
    );
}

export default NavBarContainer;
