
import { ArrowLeftRight, Download, ExternalLink, Filter, House, Network, Settings, Wrench } from 'lucide-react';
import React, { useState } from 'react';
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
    const { t: routeT } = useTranslation('routing');

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

    const taskLink = (path: string, title: string, icon: React.ReactNode) => <SidebarItem key={path}
        href={`#${path}`} onClick={event => { if (isPrimaryClick(event)) { event.preventDefault(); handleNavLinkClick(path); } }}
        active={pathname === path} icon={icon}>{title}</SidebarItem>;
    const toolPaths = ['/docs/bypass/list', '/docs/bypass/test', '/docs/bypass/block', '/docs/diagnostics', '/docs/config/log', '/docs/config/pprof', '/docs/config/documents', '/docs/group/publish', '/docs/group/activates'];
    return <SidebarRoot id={id} show={show} onHide={onHide} triggerRef={triggerRef}>
        <SidebarNav>
            {taskLink('/', t('home'), <House />)}
            {taskLink('/docs/bypass', routeT('routingTask'), <Filter />)}
            <SidebarGroup title={routeT('destinationsTask')} icon={<ExternalLink />} activePath={pathname} matchPath="/docs/group/">
                <SelectableLink path="/docs/group" current={pathname} onSelect={handleNavLinkClick}>{routeT('nodesTask')}</SelectableLink>
                <SelectableLink path="/docs/group/selectors" current={pathname} onSelect={handleNavLinkClick}>{routeT('selectorsTitle')}</SelectableLink>
                <SelectableLink path="/docs/group/subscribe" current={pathname} onSelect={handleNavLinkClick}>{uiT('subscribe')}</SelectableLink>
            </SidebarGroup>
            {taskLink('/docs/inbound', routeT('trafficEntryTask'), <Download />)}
            {taskLink('/docs/bypass/resolver', routeT('dnsTask'), <Network />)}
            <SidebarGroup title={t('connections')} icon={<ArrowLeftRight />} activePath={pathname} matchPath="/docs/connections/">
                <SelectableLink path="/docs/connections/v2" current={pathname} onSelect={handleNavLinkClick}>{uiT('connections18')}</SelectableLink>
                <SelectableLink path="/docs/connections/history" current={pathname} onSelect={handleNavLinkClick}>{uiT('history')}</SelectableLink>
                <SelectableLink path="/docs/connections/failed" current={pathname} onSelect={handleNavLinkClick}>{uiT('failedHistory')}</SelectableLink>
            </SidebarGroup>
            <SidebarDivider />
            <SidebarGroup title={t('setting')} icon={<Settings />} activePath={pathname} matchPath="/docs/settings" matchPaths={['/docs/config', '/docs/webui', '/docs/config/backup', '/docs/config/licenses', '/docs/config/about']}>
                <SelectableLink path="/docs/config" current={pathname} onSelect={handleNavLinkClick}>{uiT('config')}</SelectableLink>
                <SelectableLink path="/docs/webui" current={pathname} onSelect={handleNavLinkClick}>{uiT('webui')}</SelectableLink>
                <SelectableLink path="/docs/config/backup" current={pathname} onSelect={handleNavLinkClick}>{uiT('backup')}</SelectableLink>
                <SelectableLink path="/docs/config/licenses" current={pathname} onSelect={handleNavLinkClick}>{uiT('licenses')}</SelectableLink>
                <SelectableLink path="/docs/config/about" current={pathname} onSelect={handleNavLinkClick}>{uiT('about')}</SelectableLink>
            </SidebarGroup>
            <SidebarGroup title={routeT('advancedTools')} icon={<Wrench />} activePath={pathname} matchPath="/docs/advanced" matchPaths={toolPaths} initiallyOpen={false}>
                <SelectableLink path="/docs/bypass/list" current={pathname} onSelect={handleNavLinkClick}>{routeT('sharedMatchingData')}</SelectableLink>
                <SelectableLink path="/docs/bypass/test" current={pathname} onSelect={handleNavLinkClick}>{uiT('testRoute')}</SelectableLink>
                <SelectableLink path="/docs/bypass/block" current={pathname} onSelect={handleNavLinkClick}>{uiT('blockHistory')}</SelectableLink>
                <SelectableLink path="/docs/diagnostics" current={pathname} onSelect={handleNavLinkClick}>{uiT('networkDiagnostics')}</SelectableLink>
                <SidebarDivider />
                <SelectableLink path="/docs/config/log" current={pathname} onSelect={handleNavLinkClick}>{uiT('log')}</SelectableLink>
                <SelectableLink path="/docs/config/pprof" current={pathname} onSelect={handleNavLinkClick}>{uiT('pprof')}</SelectableLink>
                <SelectableLink path="/docs/group/publish" current={pathname} onSelect={handleNavLinkClick}>{uiT('publish')}</SelectableLink>
                <SelectableLink path="/docs/group/activates" current={pathname} onSelect={handleNavLinkClick}>{uiT('activates')}</SelectableLink>
                <SelectableLink path="/docs/config/documents" current={pathname} onSelect={handleNavLinkClick}>{uiT('documents')}</SelectableLink>
            </SidebarGroup>
        </SidebarNav>
    </SidebarRoot>;
}

const normalizePath = (path: string) => {
    if (path === '/') return '/';
    return path.replace(/\/+$/, '');
};

function SidebarGroup({ title, icon, activePath, matchPath, matchPaths, initiallyOpen, children }: {
    title: React.ReactNode;
    icon: React.ReactNode;
    activePath: string;
    matchPath: string;
    matchPaths?: string[];
    initiallyOpen?: boolean;
    children: React.ReactNode;
}) {
    const isActive = matchPaths ? matchPaths.includes(normalizePath(activePath)) : normalizePath(activePath).startsWith(normalizePath(matchPath));
    const [isOpen, setIsOpen] = useState(() => (initiallyOpen ?? window.innerWidth >= 1024) || isActive);
    const [previousPath, setPreviousPath] = useState(activePath);
    // Reopen the active section as navigation changes, without an effect.
    // Manual collapse stays possible while the location is unchanged.
    if (previousPath !== activePath) {
        setPreviousPath(activePath);
        if (isActive) setIsOpen(true);
    }

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
