
import { Button } from '@/component/v2/button';
import { Menu } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';

function NavBarContainer({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation('nav');
    const triggerRef = useRef<HTMLButtonElement>(null);
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <>
            <div className="fixed inset-x-0 top-0 z-[1030] h-[calc(80px+env(safe-area-inset-top))] lg:hidden" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
                <Button
                    ref={triggerRef}
                    type="button"
                    aria-expanded={showSidebar}
                    aria-controls="app-sidebar"
                    className="absolute top-[calc(15px+env(safe-area-inset-top))] left-[15px] h-11 w-11 shadow-ui-card"
                    onClick={() => setShowSidebar(!showSidebar)}
                    aria-label={t('toggle')}
                >
                    <Menu />
                </Button>
            </div>

            <Sidebar id="app-sidebar" triggerRef={triggerRef} show={showSidebar} onHide={() => setShowSidebar(false)} />

            <main className="min-h-screen lg:pt-0">
                {children}
            </main>
        </>
    );
}

export default NavBarContainer;
