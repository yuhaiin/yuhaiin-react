"use client"

import React, { useState } from 'react';
import { List } from 'react-bootstrap-icons';
import Sidebar from './Sidebar';
import styles from './navbar.module.css';

function NavBarContainer({ children }: { children: React.ReactNode }) {
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <>
            <button
                className={`${styles['mobile-toggle-btn']} d-lg-none`}
                onClick={() => setShowSidebar(!showSidebar)}
                aria-label="Toggle navigation"
            >
                <List />
            </button>

            <Sidebar show={showSidebar} onHide={() => setShowSidebar(false)} />

            <main style={{
                // Add padding on mobile to account for the fixed toggle button (approx 60px)
                // We use a media query check via CSS or simple conditional style if we had the hook,
                // but since this is SSR component (maybe), CSS solution is better.
                // However, doing it inline with a class is standard.
                // Let's use a class "pt-5 mt-4 d-lg-pt-0 d-lg-mt-0"?
                // Bootstrap doesn't have d-lg-pt-0 easily.
                // Let's use the styles module.
            }} className={styles.mainContent}>
                {children}
            </main>
        </>
    );
}

export default NavBarContainer;