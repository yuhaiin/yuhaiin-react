"use client"

import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { Collapse, Nav } from 'react-bootstrap';
import styles from './sidebar.module.css';

interface SidebarProps {
    show: boolean;
    onHide: () => void;
}

function Sidebar({ show, onHide }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const sidebarRef = useRef<HTMLDivElement>(null);

    const handleNavLinkClick = (key: string | null, e: React.SyntheticEvent) => {
        if (key) {
            if (key.startsWith('http')) {
                window.open(key, '_blank');
            } else {
                router.push(key);
            }
        }
        // Auto-close on mobile
        if (window.innerWidth < 992) {
            onHide();
        }
    };

    // Click outside to close (Mobile)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && show) {
                onHide();
            }
        };

        if (show) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [show, onHide]);

    return (
        <>
            <div ref={sidebarRef} className={`${styles.sidebar} ${show ? styles.show : ''}`}>
                <Nav
                    className="flex-column"
                    activeKey={pathname}
                    onSelect={handleNavLinkClick}
                >
                    <Nav.Item>
                        <Nav.Link eventKey='/' active={pathname === '/'}><i className="bi bi-house-door"></i>HOME</Nav.Link>
                    </Nav.Item>

                    <SidebarCollapseItem
                        title={<><i className="bi bi-box-arrow-up-right"></i>OUTBOUND</>}
                        eventKey='/docs/group/'
                        onSelect={handleNavLinkClick}
                        currentPathname={pathname}
                        alwaysOpen={window.innerWidth >= 992}
                    >
                        <Nav.Link eventKey='/docs/group/' active={pathname === '/docs/group/'}>Outbound</Nav.Link>
                        <Nav.Link eventKey='/docs/group/subscribe' active={pathname.startsWith('/docs/group/subscribe')}>Subscribe</Nav.Link>
                        <Nav.Link eventKey='/docs/group/publish' active={pathname.startsWith('/docs/group/publish')}>Publish</Nav.Link>
                        <Nav.Link eventKey='/docs/group/activates' active={pathname.startsWith('/docs/group/activates')}>Activates</Nav.Link>
                    </SidebarCollapseItem>

                    <SidebarCollapseItem
                        title={<><i className="bi bi-box-arrow-in-down-right"></i>INBOUND</>}
                        eventKey='/docs/inbound/'
                        onSelect={handleNavLinkClick}
                        currentPathname={pathname}
                        alwaysOpen={window.innerWidth >= 992}
                    >
                        <Nav.Link eventKey='/docs/inbound/' active={pathname === '/docs/inbound/'}>Config</Nav.Link>
                    </SidebarCollapseItem>

                    <SidebarCollapseItem
                        title={<><i className="bi bi-funnel"></i>BYPASS</>}
                        eventKey='/docs/bypass/'
                        onSelect={handleNavLinkClick}
                        currentPathname={pathname}
                        alwaysOpen={window.innerWidth >= 992}
                    >
                        <Nav.Link eventKey='/docs/bypass/' active={pathname === '/docs/bypass/'}>Rule</Nav.Link>
                        <Nav.Link eventKey='/docs/bypass/list' active={pathname.startsWith('/docs/bypass/list')}>List</Nav.Link>
                        <Nav.Link eventKey='/docs/bypass/tag' active={pathname.startsWith('/docs/bypass/tag')}>Tag</Nav.Link>
                        <div className={styles['dropdown-divider']}></div>
                        <Nav.Link eventKey='/docs/bypass/resolver/' active={pathname.startsWith('/docs/bypass/resolver')}>Resolver</Nav.Link>
                        <div className={styles['dropdown-divider']}></div>
                        <Nav.Link eventKey='/docs/bypass/test' active={pathname.startsWith('/docs/bypass/test')}>Test Route</Nav.Link>
                        <Nav.Link eventKey='/docs/bypass/block' active={pathname.startsWith('/docs/bypass/block')}>Block History</Nav.Link>
                    </SidebarCollapseItem>

                    <SidebarCollapseItem
                        title={<><i className="bi bi-arrow-left-right"></i>CONNECTIONS</>}
                        eventKey='/docs/connections/'
                        onSelect={handleNavLinkClick}
                        currentPathname={pathname}
                        alwaysOpen={window.innerWidth >= 992}
                    >
                        <Nav.Link eventKey='/docs/connections/v2' active={pathname.startsWith('/docs/connections/v2')}>Connections</Nav.Link>
                        <Nav.Link eventKey='/docs/connections/history' active={pathname.startsWith('/docs/connections/history')}>History</Nav.Link>
                        <Nav.Link eventKey='/docs/connections/failed' active={pathname.startsWith('/docs/connections/failed')}>Failed History</Nav.Link>
                    </SidebarCollapseItem>

                    <SidebarCollapseItem
                        title={<><i className="bi bi-gear"></i>SETTING</>}
                        eventKey='/docs/config/'
                        onSelect={handleNavLinkClick}
                        currentPathname={pathname}
                        alwaysOpen={window.innerWidth >= 992}
                    >
                        <Nav.Link eventKey='/docs/config/' active={pathname === '/docs/config/'}>Config</Nav.Link>
                        <Nav.Link eventKey='/docs/webui/' active={pathname.startsWith('/docs/webui')}>WebUI</Nav.Link>
                        <div className={styles['dropdown-divider']}></div>
                        <Nav.Link eventKey='/docs/config/backup/' active={pathname.startsWith('/docs/config/backup')}>Backup</Nav.Link>
                        <div className={styles['dropdown-divider']}></div>
                        <Nav.Link eventKey='/docs/config/log/' active={pathname.startsWith('/docs/config/log')}>Log</Nav.Link>
                        <div className={styles['dropdown-divider']}></div>
                        <Nav.Link eventKey='/docs/config/pprof/' active={pathname.startsWith('/docs/config/pprof')}>Pprof</Nav.Link>
                        <Nav.Link eventKey='/docs/config/documents/' active={pathname.startsWith('/docs/config/documents')}>Documents</Nav.Link>
                        <div className={styles['dropdown-divider']}></div>
                        <Nav.Link eventKey='/docs/config/licenses' active={pathname.startsWith('/docs/config/licenses')}>Licenses</Nav.Link>
                        <Nav.Link eventKey='/docs/config/about' active={pathname.startsWith('/docs/config/about')}>About</Nav.Link>
                    </SidebarCollapseItem>
                </Nav>
            </div>
            {/* Overlay */}
            <div className={`${styles.overlay} d-lg-none ${show ? styles.show : ''}`} onClick={onHide}></div>
        </>
    );
}


interface SidebarCollapseItemProps {
    title: React.ReactNode;
    eventKey: string;
    children: React.ReactNode;
    onSelect: (key: string | null, e: React.SyntheticEvent) => void;
    currentPathname: string;
    alwaysOpen?: boolean;
}

interface ChildProps {
    active?: boolean;
    eventKey?: string;
}

function SidebarCollapseItem({ title, eventKey, children, onSelect, currentPathname, alwaysOpen = false }: SidebarCollapseItemProps) {
    const isChildActive = React.Children.toArray(children).some(child => {
        if (React.isValidElement(child)) {
            const element = child as React.ReactElement<ChildProps>;

            if (element.props.active) {
                return true;
            }

            if (typeof element.props.eventKey === 'string' && currentPathname.startsWith(element.props.eventKey || '')) {
                return true;
            }
        }
        return false;
    });

    const [open, setOpen] = useState(isChildActive || alwaysOpen);

    useEffect(() => {
        if (isChildActive && !open) {
            setOpen(true);
        }
    }, [isChildActive, open]);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setOpen(!open);
    };

    const handleSelect = (key: string | null, e: React.SyntheticEvent) => {
        if (key && !e.currentTarget.classList.contains(styles['collapse-toggle'])) {
            onSelect(key, e);
        }
    }

    return (
        <Nav.Item className={styles['collapse-nav-item']}>
            <Nav.Link
                onClick={handleClick}
                aria-controls={`collapse-menu-${eventKey}`}
                aria-expanded={open}
                className={`${styles['collapse-toggle']} ${isChildActive ? 'active' : ''}`}
            >
                {title}
                <i className={`bi ${open ? 'bi-chevron-down' : 'bi-chevron-right'} ms-auto ${styles['collapse-icon']}`}></i>
            </Nav.Link>
            <Collapse in={open}>
                <div id={`collapse-menu-${eventKey}`} className={styles['sub-menu']}>
                    <Nav onSelect={handleSelect} className={styles['sub-menu-nav']} activeKey={currentPathname}>
                        {children}
                    </Nav>
                </div>
            </Collapse>
        </Nav.Item>
    );
}

export default Sidebar;