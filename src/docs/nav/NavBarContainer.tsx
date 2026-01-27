"use client"

import { Button } from '@/component/v2/button';
import { Menu } from 'lucide-react';
import React, { useState } from 'react';
import Sidebar from './Sidebar';

function NavBarContainer({ children }: { children: React.ReactNode }) {
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <>
            <Button
                className="fixed top-[15px] left-[15px] z-[1030] w-[44px] h-[44px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] min-[992px]:hidden"
                onClick={() => setShowSidebar(!showSidebar)}
                aria-label="Toggle navigation"
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
