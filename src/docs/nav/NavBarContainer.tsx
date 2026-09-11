"use client"

import { Button } from '@/component/v2/button';
import { Menu } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';

function NavBarContainer({ children }: { children: React.ReactNode }) {
    const { t } = useTranslation('nav');
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <>
            <Button
                className="lg:!hidden !fixed top-[15px] left-[15px] z-[1030] h-11 w-11 shadow-ui-card"
                onClick={() => setShowSidebar(!showSidebar)}
                aria-label={t('toggle')}
            >
                <Menu />
            </Button>

            <Sidebar show={showSidebar} onHide={() => setShowSidebar(false)} />

            <main className="min-h-screen lg:pt-0">
                {children}
            </main>
        </>
    );
}

export default NavBarContainer;
