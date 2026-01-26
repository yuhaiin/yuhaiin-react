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
                className="fixed top-[15px] left-[15px] z-[1030] w-[44px] h-[44px] rounded-[14px] flex items-center justify-center cursor-pointer transition-all duration-200 shadow-[0_4px_15px_rgba(0,0,0,0.1)] bg-[var(--sidebar-bg)] text-[var(--sidebar-color)] border border-[var(--sidebar-border-color)] active:scale-95 active:text-[var(--sidebar-active-color)] active:border-[var(--sidebar-active-color)] lg:hidden"
                onClick={() => setShowSidebar(!showSidebar)}
                aria-label="Toggle navigation"
            >
                <Menu />
            </Button>

            <Sidebar show={showSidebar} onHide={() => setShowSidebar(false)} />

            <main className={clsx(
                "min-h-screen transition-all duration-300",
                "pt-[80px] px-4 pb-4", // Mobile padding (top for menu button) - Increased to avoid button overlap
                "lg:pt-4 lg:pl-[296px] lg:pr-4" // Desktop padding (left for sidebar: 260px width + 2*16px gap + some extra? Original sidebar is left:16px, width:260px. So gap is 16px + 260px + 20px buffer = 296px)
            )}>
                {children}
            </main>
        </>
    );
}

export default NavBarContainer;
