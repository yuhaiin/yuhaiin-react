import { navigationLabel } from './navigation';
import { useLocation } from 'wouter';

import { Button } from '@/component/v2/button';
import { Menu, RotateCw } from 'lucide-react';
import { useAndroidPlatform } from '@/hooks/use-android-platform';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import { BottomNav, useBottomNavVisible } from './BottomNav';
import { useScrollCollapse } from '@/hooks/use-scroll-collapse';
import { useNavigationSnapshot } from '@/hooks/navigation';
import { useMediaQuery } from '@/hooks/use-media-query';
import clsx from 'clsx';

function NavBarContainer({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation(['nav', 'ui', 'routing']);
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
    const collapsed = useScrollCollapse(useNavigationSnapshot(), phone && !showSidebar);
    // The Android app has no browser chrome, so its WebView gets a reload control here.
    const android = useAndroidPlatform();
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
    // Sticky page actions follow the App Bar up (see --app-bar-collapse in global.css).
    useLayoutEffect(() => {
        document.documentElement.dataset.appBar = collapsed ? 'collapsed' : 'shown';
        return () => { delete document.documentElement.dataset.appBar; };
    }, [collapsed]);

    return (
        <>
            {/* The status bar strip stays put; the App Bar slides up beneath it. */}
            <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[1031] h-[env(safe-area-inset-top)] lg:hidden" style={{ backgroundColor: 'var(--sidebar-bg)' }} />
            <header inert={collapsed} className={clsx(
                "fixed inset-x-0 top-0 z-[1030] flex h-[calc(var(--mobile-app-bar-height)+env(safe-area-inset-top))] items-center gap-2 border-b border-ui-border px-1.5 pt-[env(safe-area-inset-top)] lg:hidden",
                "transition-transform duration-[var(--motion-slow)] ease-[var(--ease-standard)] will-change-transform",
                collapsed && "-translate-y-[var(--mobile-app-bar-height)]",
            )} style={{ backgroundColor: 'var(--sidebar-bg)' }}>
                <Button
                    variant="ghost" size="icon"
                    ref={menuRef}
                    type="button"
                    aria-expanded={showSidebar}
                    aria-controls="app-sidebar"
                    className="h-11 w-11 shrink-0"
                    onClick={() => openFrom(menuRef)}
                    aria-label={t('toggle')}
                >
                    <Menu />
                </Button>
                <span className="min-w-0 truncate text-base font-semibold text-ui-heading" title={title}>{title}</span>
                {android && <Button variant="ghost" size="icon" type="button" className="ml-auto h-11 w-11 shrink-0" onClick={() => window.location.reload()} aria-label={t('reload')}>
                    <RotateCw />
                </Button>}
            </header>

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
