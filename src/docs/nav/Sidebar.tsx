"use client"

import { ArrowLeftRight, Download, ExternalLink, Filter, House, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { SidebarCollapsible, SidebarDivider, SidebarItem, SidebarNav, Sidebar as SidebarRoot, SidebarSubLink } from '../../component/v2/sidebar';

interface SidebarProps {
    show: boolean;
    onHide: () => void;
}

function Sidebar({ show, onHide }: SidebarProps) {
    const [pathname, navigate] = useLocation();

    const handleNavLinkClick = (key: string) => {
        if (key) {
            if (key.startsWith('http')) {
                window.open(key, '_blank');
            } else {
                navigate(key);
            }
        }
        // Auto-close on mobile
        if (window.innerWidth < 1024) {
            onHide();
        }
    };

    return (
        <SidebarRoot show={show} onHide={onHide}>
            <SidebarNav>
                <SidebarItem
                    onClick={() => handleNavLinkClick('/')}
                    active={pathname === '/'}
                    icon={<House />}
                >
                    HOME
                </SidebarItem>

                <SidebarGroup
                    title="OUTBOUND"
                    icon={<ExternalLink />}
                    activePath={pathname}
                    matchPath="/docs/group/"
                >
                    <SelectableLink path="/docs/group/" current={pathname} onSelect={handleNavLinkClick}>
                        Outbound
                    </SelectableLink>
                    <SelectableLink path="/docs/group/subscribe" current={pathname} onSelect={handleNavLinkClick}>
                        Subscribe
                    </SelectableLink>
                    <SelectableLink path="/docs/group/publish" current={pathname} onSelect={handleNavLinkClick}>
                        Publish
                    </SelectableLink>
                    <SelectableLink path="/docs/group/activates" current={pathname} onSelect={handleNavLinkClick}>
                        Activates
                    </SelectableLink>
                </SidebarGroup>

                <SidebarGroup
                    title="INBOUND"
                    icon={<Download />}
                    activePath={pathname}
                    matchPath="/docs/inbound/"
                >
                    <SelectableLink path="/docs/inbound/" current={pathname} onSelect={handleNavLinkClick}>
                        Config
                    </SelectableLink>
                </SidebarGroup>

                <SidebarGroup
                    title="BYPASS"
                    icon={<Filter />}
                    activePath={pathname}
                    matchPath="/docs/bypass/"
                >
                    <SelectableLink path="/docs/bypass/" current={pathname} onSelect={handleNavLinkClick}>
                        Rule
                    </SelectableLink>
                    <SelectableLink path="/docs/bypass/list" current={pathname} onSelect={handleNavLinkClick}>
                        List
                    </SelectableLink>
                    <SelectableLink path="/docs/bypass/tag" current={pathname} onSelect={handleNavLinkClick}>
                        Tag
                    </SelectableLink>
                    <SidebarDivider />
                    <SelectableLink path="/docs/bypass/resolver/" current={pathname} onSelect={handleNavLinkClick}>
                        Resolver
                    </SelectableLink>
                    <SidebarDivider />
                    <SelectableLink path="/docs/bypass/test" current={pathname} onSelect={handleNavLinkClick}>
                        Test Route
                    </SelectableLink>
                    <SelectableLink path="/docs/bypass/block" current={pathname} onSelect={handleNavLinkClick}>
                        Block History
                    </SelectableLink>
                </SidebarGroup>

                <SidebarGroup
                    title="CONNECTIONS"
                    icon={<ArrowLeftRight />}
                    activePath={pathname}
                    matchPath="/docs/connections/"
                >
                    <SelectableLink path="/docs/connections/v2" current={pathname} onSelect={handleNavLinkClick}>
                        Connections
                    </SelectableLink>
                    <SelectableLink path="/docs/connections/history" current={pathname} onSelect={handleNavLinkClick}>
                        History
                    </SelectableLink>
                    <SelectableLink path="/docs/connections/failed" current={pathname} onSelect={handleNavLinkClick}>
                        Failed History
                    </SelectableLink>
                </SidebarGroup>

                <SidebarGroup
                    title="SETTING"
                    icon={<Settings />}
                    activePath={pathname}
                    matchPath="/docs/config/"
                >
                    <SelectableLink path="/docs/config/" current={pathname} onSelect={handleNavLinkClick}>
                        Config
                    </SelectableLink>
                    <SelectableLink path="/docs/webui/" current={pathname} onSelect={handleNavLinkClick}>
                        WebUI
                    </SelectableLink>
                    <SidebarDivider />
                    <SelectableLink path="/docs/config/backup/" current={pathname} onSelect={handleNavLinkClick}>
                        Backup
                    </SelectableLink>
                    <SidebarDivider />
                    <SelectableLink path="/docs/config/log/" current={pathname} onSelect={handleNavLinkClick}>
                        Log
                    </SelectableLink>
                    <SidebarDivider />
                    <SelectableLink path="/docs/config/pprof/" current={pathname} onSelect={handleNavLinkClick}>
                        Pprof
                    </SelectableLink>
                    <SelectableLink path="/docs/config/documents/" current={pathname} onSelect={handleNavLinkClick}>
                        Documents
                    </SelectableLink>
                    <SidebarDivider />
                    <SelectableLink path="/docs/config/licenses" current={pathname} onSelect={handleNavLinkClick}>
                        Licenses
                    </SelectableLink>
                    <SelectableLink path="/docs/config/about" current={pathname} onSelect={handleNavLinkClick}>
                        About
                    </SelectableLink>
                </SidebarGroup>
            </SidebarNav>
        </SidebarRoot>
    );
}

const normalizePath = (path: string) => {
    if (path === '/') return '/';
    return path.replace(/\/+$/, '');
};

function SidebarGroup({ title, icon, activePath, matchPath, children }: {
    title: React.ReactNode;
    icon: React.ReactNode;
    activePath: string;
    matchPath: string;
    children: React.ReactNode;
}) {
    // Determine initially open state based on path
    const isActive = normalizePath(activePath).startsWith(normalizePath(matchPath));
    // On desktop we might want it always open, but the new design usually implies collapsible
    // The original code had `alwaysOpen={window.innerWidth >= 992}`.
    // Here we can use a state that defaults to true if desktop, but since this is SSR friendly Next.js, 
    // `window` is not available initially. We'll rely on defaultOpen or controlled state.
    // For simplicity and robustness, we'll let it be controlled by user interaction + initial state.
    // We can use `useEffect` to set open if active.

    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (window.innerWidth >= 1024) {
            setIsOpen(true);
        } else if (isActive) {
            setIsOpen(true);
        }
    }, []);

    useEffect(() => {
        if (isActive && !isOpen) {
            setIsOpen(true);
        }
    }, [isActive]);

    // If not mounted yet (SSR), default to closed or open? 
    // To avoid hydration mismatch, better to wait for mount or use a hook.
    // But Collapsible `open` prop is controlled.

    // Simplification: Just use `isActive` to force open? No, user should be able to toggle.
    // So we use standard state.

    return (
        <SidebarCollapsible
            title={title}
            icon={icon}
            open={isMounted ? isOpen : false}
            onOpenChange={setIsOpen}
            active={isActive}
        >
            {children}
        </SidebarCollapsible>
    );
}


function SelectableLink({ path, current, onSelect, children }: {
    path: string;
    current: string;
    onSelect: (key: string) => void;
    children: React.ReactNode;
}) {
    // const isActive = current === path; // Exact match for some?
    // Original logic:
    // /docs/group/ -> active === '/docs/group/'
    // /docs/group/subscribe -> active startsWith
    // We should probably replicate that "startsWith" logic for sub items mostly, or strict for index.

    const active = normalizePath(current) === normalizePath(path);

    // Special case for root? No, these are sublinks.
    // Original: active={pathname === '/docs/group/'} for 'Outbound'
    // but active={pathname.startsWith...} for others.

    return (
        <SidebarSubLink
            onClick={(e) => { e.preventDefault(); onSelect(path); }}
            active={active}
            href={path}
        >
            {children}
        </SidebarSubLink>
    );
}

export default Sidebar;