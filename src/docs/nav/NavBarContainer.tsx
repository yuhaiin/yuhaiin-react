"use client"

import { Button } from '@/component/v2/button';
import { clsx } from 'clsx';
import { Menu } from 'lucide-react';
import React, { useState } from 'react';
import Sidebar from './Sidebar';

function NavBarContainer({ children }: { children: React.ReactNode }) {
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <>
            <Button
                className="fixed top-4 left-4 z-[1030] w-11 h-11 rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-200 shadow-md bg-[var(--sidebar-bg)] text-[var(--sidebar-color)] border border-[var(--sidebar-border-color)] active:scale-95 active:text-[var(--sidebar-active-color)] active:border-[var(--sidebar-active-color)] lg:hidden"
                onClick={() => setShowSidebar(!showSidebar)}
                aria-label="Toggle navigation"
            >
                <Menu />
            </Button>

            <Sidebar show={showSidebar} onHide={() => setShowSidebar(false)} />

            <main className={clsx(
                "min-h-screen transition-all duration-300",
                "pt-16 px-4 pb-4", // Mobile padding (top for menu button)
                "lg:pt-4 lg:pl-[296px] lg:pr-4" // Desktop padding (left for sidebar)
            )}>
                {children}
            </main>
        </>
    );
}

export default NavBarContainer;
