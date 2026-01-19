"use client"

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import styles from './sidebar.module.css';

function NavBarContainer({ children }: { children: React.ReactNode }) {
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <>
            <button
                className={`${styles['mobile-toggle-btn']} d-lg-none`}
                onClick={() => setShowSidebar(!showSidebar)}
                aria-label="Toggle navigation"
            >
                <i className="bi bi-list"></i>
            </button>

            <Sidebar show={showSidebar} onHide={() => setShowSidebar(false)} />

            <main className={styles['main-content']}>
                {children}
            </main>
        </>
    );
}

export default NavBarContainer;