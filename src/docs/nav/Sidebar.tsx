"use client"

import {
    Activity,
    ArrowLeftRight,
    CloudDownload,
    House,
    Link2,
    Network,
    Radio,
    Route,
    Settings,
    Shield,
    Sparkles,
    Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { getApiUrl } from '../../common/apiurl';
import { SidebarCollapsible, SidebarDivider, SidebarItem, SidebarNav, Sidebar as SidebarRoot, SidebarSubLink } from '../../component/v2/sidebar';

interface SidebarProps {
    show: boolean;
    onHide: () => void;
}

function Sidebar({ show, onHide }: SidebarProps) {
    const [pathname, navigate] = useLocation();
    const apiHost = getApiUrl() || (typeof window !== 'undefined' ? window.location.origin : 'same origin');

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
            <div className="product-brand px-5 pb-7">
                <div className="flex items-center gap-3">
                    <div className="product-brand-mark flex h-10 w-10 items-center justify-center rounded-[14px] bg-ui-primary-soft text-ui-primary">
                        <Sparkles size={20} />
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-[1.05rem] font-bold tracking-[-0.03em] text-sidebar-header">yuhaiin</div>
                        <div className="text-[11px] font-medium text-sidebar-color">Your private network</div>
                        <div className="mt-1 truncate font-mono text-[10px] text-sidebar-color/60" title={apiHost}>
                            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('mock') ? 'Preview data' : 'API'} · {apiHost}
                        </div>
                    </div>
                </div>
            </div>
            <SidebarNav>
                <SidebarItem onClick={() => handleNavLinkClick('/')} active={pathname === '/'} icon={<House />}>Home</SidebarItem>
                <SidebarItem onClick={() => handleNavLinkClick('/docs/connections/v2')} active={normalizePath(pathname) === '/docs/connections/v2'} icon={<Link2 />}>Live connections</SidebarItem>
                <SidebarItem onClick={() => handleNavLinkClick('/docs/connections/history')} active={normalizePath(pathname) === '/docs/connections/history'} icon={<Activity />}>Activity history</SidebarItem>
                <SidebarItem onClick={() => handleNavLinkClick('/docs/connections/failed')} active={normalizePath(pathname) === '/docs/connections/failed'} icon={<Radio />}>Failed connections</SidebarItem>

                <SidebarSectionLabel>Build your network</SidebarSectionLabel>

                <SidebarGroup title="Outbound" icon={<ArrowLeftRight />} activePath={pathname} matchPaths={["/docs/group/"]}>
                    <SelectableLink path="/docs/group/" current={pathname} onSelect={handleNavLinkClick}>Outbound</SelectableLink>
                    <SelectableLink path="/docs/group/subscribe" current={pathname} onSelect={handleNavLinkClick}>Subscriptions</SelectableLink>
                    <SelectableLink path="/docs/group/publish" current={pathname} onSelect={handleNavLinkClick}>Publish</SelectableLink>
                    <SelectableLink path="/docs/group/activates" current={pathname} onSelect={handleNavLinkClick}>Active connections</SelectableLink>
                </SidebarGroup>

                <SidebarItem onClick={() => handleNavLinkClick('/docs/inbound')} active={normalizePath(pathname) === '/docs/inbound'} icon={<CloudDownload />}>Inbound</SidebarItem>
                <SidebarItem onClick={() => handleNavLinkClick('/docs/users')} active={normalizePath(pathname) === '/docs/users'} icon={<Users />}>Users</SidebarItem>

                <SidebarSectionLabel>Traffic decisions</SidebarSectionLabel>

                <SidebarGroup title="Routing & DNS" icon={<Route />} activePath={pathname} matchPaths={["/docs/bypass/"]}>
                    <SelectableLink path="/docs/bypass/" current={pathname} onSelect={handleNavLinkClick}>Rules</SelectableLink>
                    <SelectableLink path="/docs/bypass/list" current={pathname} onSelect={handleNavLinkClick}>Lists</SelectableLink>
                    <SelectableLink path="/docs/bypass/tag" current={pathname} onSelect={handleNavLinkClick}>Tags</SelectableLink>
                    <SidebarDivider />
                    <SelectableLink path="/docs/bypass/resolver/" current={pathname} onSelect={handleNavLinkClick}>DNS resolver</SelectableLink>
                    <SelectableLink path="/docs/bypass/test" current={pathname} onSelect={handleNavLinkClick}>Route test</SelectableLink>
                    <SelectableLink path="/docs/bypass/block" current={pathname} onSelect={handleNavLinkClick}>Block history</SelectableLink>
                </SidebarGroup>

                <SidebarSectionLabel>Workspace</SidebarSectionLabel>

                <SidebarGroup title="Settings & tools" icon={<Settings />} activePath={pathname} matchPaths={["/docs/config", "/docs/webui"]}>
                    <SelectableLink path="/docs/config/" current={pathname} onSelect={handleNavLinkClick}>General settings</SelectableLink>
                    <SelectableLink path="/docs/webui/" current={pathname} onSelect={handleNavLinkClick}>Web UI & API</SelectableLink>
                    <SidebarDivider />
                    <SelectableLink path="/docs/config/backup/" current={pathname} onSelect={handleNavLinkClick}>Backup</SelectableLink>
                    <SelectableLink path="/docs/config/log/" current={pathname} onSelect={handleNavLinkClick}>Logs</SelectableLink>
                    <SelectableLink path="/docs/config/pprof/" current={pathname} onSelect={handleNavLinkClick}>Diagnostics</SelectableLink>
                    <SelectableLink path="/docs/config/documents/" current={pathname} onSelect={handleNavLinkClick}>Documents</SelectableLink>
                    <SidebarDivider />
                    <SelectableLink path="/docs/config/licenses" current={pathname} onSelect={handleNavLinkClick}>Licenses</SelectableLink>
                    <SelectableLink path="/docs/config/about" current={pathname} onSelect={handleNavLinkClick}>About yuhaiin</SelectableLink>
                </SidebarGroup>

                <SidebarSectionLabel>Quick references</SidebarSectionLabel>
                <div className="px-3 pb-3 pt-1 text-[11px] leading-5 text-sidebar-color/70">
                    <div className="flex items-center gap-2"><Network size={13} /> Manage how traffic moves</div>
                    <div className="mt-1 flex items-center gap-2"><Shield size={13} /> Keep private routes together</div>
                </div>
            </SidebarNav>
        </SidebarRoot>
    );
}

const normalizePath = (path: string) => {
    if (path === '/') return '/';
    return path.replace(/\/+$/, '');
};

function SidebarGroup({ title, icon, activePath, matchPath, matchPaths, children }: {
    title: React.ReactNode;
    icon: React.ReactNode;
    activePath: string;
    matchPath?: string;
    matchPaths?: string[];
    children: React.ReactNode;
}) {
    // Determine initially open state based on path
    const isActive = (matchPaths ?? (matchPath ? [matchPath] : [])).some((path) =>
        normalizePath(activePath).startsWith(normalizePath(path))
    );
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

function SidebarSectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-3 pb-1 pt-5 text-[10px] font-bold uppercase tracking-[0.12em] text-sidebar-color/55">
            {children}
        </div>
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
