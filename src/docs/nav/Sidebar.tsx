
import { Activity, ArrowLeftRight, Download, ExternalLink, Filter, House, Settings } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { SidebarCollapsible, SidebarDivider, SidebarItem, SidebarNav, Sidebar as SidebarRoot, SidebarSubLink } from '../../component/v2/sidebar';

interface SidebarProps {
    id?: string;
    show: boolean;
    onHide: () => void;
    triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

function Sidebar({ id, show, onHide, triggerRef }: SidebarProps) {
    const { t: uiT } = useTranslation('ui');

    const { t } = useTranslation('nav');
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
        <SidebarRoot id={id} show={show} onHide={onHide} triggerRef={triggerRef}>
            <SidebarNav>
                <SidebarItem
                    href="#/"
                    onClick={e => { if (isPrimaryClick(e)) { e.preventDefault(); handleNavLinkClick('/'); } }}
                    active={pathname === '/'}
                    icon={<House />}
                >
                    {t('home')}
                </SidebarItem>

                <SidebarItem
                    href="#/docs/diagnostics"
                    onClick={e => { if (isPrimaryClick(e)) { e.preventDefault(); handleNavLinkClick('/docs/diagnostics'); } }}
                    active={pathname === '/docs/diagnostics'}
                    icon={<Activity />}
                >
                    {uiT('networkDiagnostics')}
                </SidebarItem>

                <SidebarGroup
                    title={t('outbound')}
                    icon={<ExternalLink />}
                    activePath={pathname}
                    matchPath="/docs/group/"
                >
                    <SelectableLink path="/docs/group/" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("outbound6")}</SelectableLink>
                    <SelectableLink path="/docs/group/subscribe" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("subscribe")}</SelectableLink>
                    <SelectableLink path="/docs/group/publish" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("publish")}</SelectableLink>
                    <SelectableLink path="/docs/group/activates" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("activates")}</SelectableLink>
                </SidebarGroup>

                <SidebarGroup
                    title={t('inbound')}
                    icon={<Download />}
                    activePath={pathname}
                    matchPath="/docs/inbound"
                >
                    <SelectableLink path="/docs/inbound" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("config")}</SelectableLink>
                </SidebarGroup>

                <SidebarGroup
                    title={t('bypass')}
                    icon={<Filter />}
                    activePath={pathname}
                    matchPath="/docs/bypass/"
                >
                    <SelectableLink path="/docs/bypass/" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("rule")}</SelectableLink>
                    <SelectableLink path="/docs/bypass/list" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("list")}</SelectableLink>
                    <SelectableLink path="/docs/bypass/tag" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("tag")}</SelectableLink>
                    <SidebarDivider />
                    <SelectableLink path="/docs/bypass/resolver/" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("resolver")}</SelectableLink>
                    <SidebarDivider />
                    <SelectableLink path="/docs/bypass/test" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("testRoute")}</SelectableLink>
                    <SelectableLink path="/docs/bypass/block" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("blockHistory")}</SelectableLink>
                </SidebarGroup>

                <SidebarGroup
                    title={t('connections')}
                    icon={<ArrowLeftRight />}
                    activePath={pathname}
                    matchPath="/docs/connections/"
                >
                    <SelectableLink path="/docs/connections/v2" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("connections18")}</SelectableLink>
                    <SelectableLink path="/docs/connections/history" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("history")}</SelectableLink>
                    <SelectableLink path="/docs/connections/failed" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("failedHistory")}</SelectableLink>
                </SidebarGroup>

                <SidebarGroup
                    title={t('setting')}
                    icon={<Settings />}
                    activePath={pathname}
                    matchPath="/docs/config/"
                >
                    <SelectableLink path="/docs/config/" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("config")}</SelectableLink>
                    <SelectableLink path="/docs/webui/" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("webui")}</SelectableLink>
                    <SidebarDivider />
                    <SelectableLink path="/docs/config/backup/" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("backup")}</SelectableLink>
                    <SidebarDivider />
                    <SelectableLink path="/docs/config/log/" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("log")}</SelectableLink>
                    <SidebarDivider />
                    <SelectableLink path="/docs/config/pprof/" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("pprof")}</SelectableLink>
                    <SelectableLink path="/docs/config/documents/" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("documents")}</SelectableLink>
                    <SidebarDivider />
                    <SelectableLink path="/docs/config/licenses" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("licenses")}</SelectableLink>
                    <SelectableLink path="/docs/config/about" current={pathname} onSelect={handleNavLinkClick}>
                        {uiT("about")}</SelectableLink>
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
    const isActive = normalizePath(activePath).startsWith(normalizePath(matchPath))
        || (matchPath === '/docs/config/' && activePath.startsWith('/docs/webui'));
    const [isOpen, setIsOpen] = useState(() => window.innerWidth >= 1024 || isActive);
    useEffect(() => { if (isActive) setIsOpen(true); }, [activePath, isActive]);

    return (
        <SidebarCollapsible
            title={title}
            icon={icon}
            open={isOpen}
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
    const active = normalizePath(current) === normalizePath(path);

    return (
        <SidebarSubLink
            onClick={(e) => { if (isPrimaryClick(e)) { e.preventDefault(); onSelect(path); } }}
            active={active}
            href={`#${path}`}
        >
            {children}
        </SidebarSubLink>
    );
}

function isPrimaryClick(event: React.MouseEvent) {
    return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export default Sidebar;
