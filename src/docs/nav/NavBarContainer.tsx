import { navigationLabel } from './navigation';
import { useLocation } from 'wouter';

import { Button } from '@/component/v2/button';
import { Menu } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';

function NavBarContainer({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation(['nav', 'ui', 'routing']);
    const [location] = useLocation();
    const label = navigationLabel(location);
    const title = label ? t(`${label.namespace}:${label.key}`) : 'Yuhaiin';
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-[1030] flex h-[calc(var(--mobile-app-bar-height)+env(safe-area-inset-top))] items-center gap-3 border-b border-ui-border px-3 pt-[env(safe-area-inset-top)] lg:hidden" style={{ backgroundColor: 'var(--sidebar-bg)' }}>
                <Button
                    variant="ghost" size="icon"
                    ref={triggerRef}
                    type="button"
                    aria-expanded={showSidebar}
                    aria-controls="app-sidebar"
                    className="h-11 w-11 shrink-0"
                    onClick={() => setShowSidebar(!showSidebar)}
                    aria-label={t('toggle')}
                >
                    <Menu />
                </Button>
                <span className="min-w-0 truncate text-sm font-semibold text-ui-heading" title={title}>{title}</span>
            </header>

            <Sidebar id="app-sidebar" triggerRef={triggerRef} show={showSidebar} onHide={() => setShowSidebar(false)} />

            <main className="min-h-screen lg:pt-0">
                {children}
            </main>
        </>
    );
}

export default NavBarContainer;
