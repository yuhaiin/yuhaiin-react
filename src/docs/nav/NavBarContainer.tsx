"use client"

import { Button } from '@/component/v2/button';
import { Menu } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [matches, query]);
    return matches;
}

function NavBarContainer({ children }: { children: React.ReactNode }) {
    const [showSidebar, setShowSidebar] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 992px)");

    return (
        <>
            {!isDesktop && (
                <Button
                    className="fixed top-[15px] left-[15px] z-[1030] w-[44px] h-[44px] shadow-[0_4px_15px_rgba(0,0,0,0.1)]"
                    onClick={() => setShowSidebar(!showSidebar)}
                    aria-label="Toggle navigation"
                >
                    <Menu />
                </Button>
            )}

            <Sidebar show={showSidebar} onHide={() => setShowSidebar(false)} />

            <main className="min-h-screen lg:pt-0">
                {children}
            </main>
        </>
    );
}

export default NavBarContainer;
