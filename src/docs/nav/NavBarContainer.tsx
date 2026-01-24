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

            <main>
                {children}
            </main>
        </>
    );
}

export default NavBarContainer;