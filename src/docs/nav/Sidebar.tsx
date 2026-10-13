
import { Activity, ArrowLeftRight, BookOpen, CircleHelp, Download, ExternalLink, FileClock, FileText, Filter, Gauge, History, House, Layers, ListFilter, Network, Radio, ScrollText, Settings, Share2, ShieldBan, SlidersHorizontal, Upload, Waypoints, Wrench } from 'lucide-react';
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
        active={normalizePath(pathname) === path} icon={icon}>{title}</SidebarItem>;
    const link = (path: string, title: string, icon: React.ReactNode) => <SelectableLink key={path}
        path={path} current={pathname} onSelect={handleNavLinkClick} icon={icon}>{title}</SelectableLink>;

    return <SidebarRoot id={id} show={show} onHide={onHide} triggerRef={triggerRef}>
        <SidebarNav aria-label={t('toggle')}>
            <SidebarSection title={t('monitoring')}>
                {taskLink('/', t('home'), <House size={20} />)}
                <SidebarGroup title={t('connections')} icon={<Activity size={20} />} activePath={pathname}
                    paths={['/docs/connections/v2', '/docs/connections/history', '/docs/connections/failed', '/docs/bypass/block']}>
                    {link('/docs/connections/v2', uiT('connections18'), <ArrowLeftRight />)}
                    {link('/docs/connections/history', uiT('history'), <History />)}
                    {link('/docs/connections/failed', uiT('failedHistory'), <FileClock />)}
                    {link('/docs/bypass/block', uiT('blockHistory'), <ShieldBan />)}
                </SidebarGroup>
            </SidebarSection>
            <SidebarSection title={t('trafficConfiguration')}>
                <SidebarGroup title={routeT('destinationsTask')} icon={<ExternalLink size={20} />} activePath={pathname}
                    paths={['/docs/group', '/docs/group/selectors', '/docs/group/subscribe', '/docs/group/publish', '/docs/group/activates']}>
                    {link('/docs/group', routeT('nodesTask'), <Network />)}
                    {link('/docs/group/selectors', routeT('selectorsTitle'), <Waypoints />)}
                    {link('/docs/group/subscribe', uiT('subscribe'), <Download />)}
                    <SidebarDivider className="mx-4 w-auto" />
                    {link('/docs/group/publish', uiT('publish'), <Share2 />)}
                    {link('/docs/group/activates', uiT('activeNodes'), <Radio />)}
                </SidebarGroup>
                <SidebarGroup title={routeT('routingTask')} icon={<Filter size={20} />} activePath={pathname}
                    paths={['/docs/bypass', '/docs/bypass/list', '/docs/bypass/test']}>
                    {link('/docs/bypass', t('routeRules'), <ListFilter />)}
                    {link('/docs/bypass/list', routeT('sharedMatchingData'), <Layers />)}
                    {link('/docs/bypass/test', uiT('testRoute'), <Waypoints />)}
                </SidebarGroup>
                {taskLink('/docs/inbound', routeT('trafficEntryTask'), <Download size={20} />)}
                {taskLink('/docs/bypass/resolver', routeT('dnsTask'), <Network size={20} />)}
            </SidebarSection>
            <SidebarSection title={t('system')}>
                <SidebarGroup title={t('diagnostics')} icon={<Wrench size={20} />} activePath={pathname}
                    paths={['/docs/diagnostics', '/docs/config/log', '/docs/config/pprof']}>
                    {link('/docs/diagnostics', uiT('networkDiagnostics'), <Activity />)}
                    {link('/docs/config/log', uiT('log'), <ScrollText />)}
                    {link('/docs/config/pprof', uiT('pprof'), <Gauge />)}
                </SidebarGroup>
                <SidebarGroup title={t('setting')} icon={<Settings size={20} />} activePath={pathname}
                    paths={['/docs/config', '/docs/webui', '/docs/config/backup']}>
                    {link('/docs/config', uiT('config'), <SlidersHorizontal />)}
                    {link('/docs/webui', uiT('webui'), <Settings />)}
                    {link('/docs/config/backup', uiT('backup'), <Upload />)}
                </SidebarGroup>
                <SidebarGroup title={t('help')} icon={<CircleHelp size={20} />} activePath={pathname}
                    paths={['/docs/config/documents', '/docs/config/about', '/docs/config/licenses']}>
                    {link('/docs/config/documents', uiT('documents'), <BookOpen />)}
                    {link('/docs/config/about', uiT('about'), <CircleHelp />)}
                    {link('/docs/config/licenses', uiT('licenses'), <FileText />)}
                </SidebarGroup>
            </SidebarSection>
        </SidebarNav>
    </SidebarRoot>;
}

const normalizePath = (path: string) => {
    if (path === '/') return '/';
    return path.replace(/\/+$/, '');
};

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
    return <section aria-label={title} className="flex flex-col gap-1 [&+section]:mt-4">
        <h2 className="px-3.5 pb-1 text-[0.6875rem] font-medium tracking-wide text-sidebar-color">{title}</h2>
        {children}
    </section>;
}

function SidebarGroup({ title, icon, activePath, paths, children }: {
    title: React.ReactNode;
    icon: React.ReactNode;
    activePath: string;
    paths: string[];
    children: React.ReactNode;
}) {
    const isActive = paths.includes(normalizePath(activePath));
    const [isOpen, setIsOpen] = useState(isActive);
    const [previousPath, setPreviousPath] = useState(activePath);
    // Reopen the active section as navigation changes, without an effect.
    // Manual collapse stays possible while the location is unchanged.
    if (previousPath !== activePath) {
        setPreviousPath(activePath);
        setIsOpen(isActive);
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


function SelectableLink({ path, current, onSelect, icon, children }: {
    path: string;
    current: string;
    onSelect: (key: string) => void;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    const active = normalizePath(current) === normalizePath(path);

    return (
        <SidebarSubLink
            onClick={(e) => { if (isPrimaryClick(e)) { e.preventDefault(); onSelect(path); } }}
            active={active}
            href={`#${path}`}
        >
            <span aria-hidden="true" className="mr-2.5 flex shrink-0 [&>svg]:size-4">{icon}</span>
            <span className="min-w-0">{children}</span>
        </SidebarSubLink>
    );
}

function isPrimaryClick(event: React.MouseEvent) {
    return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

export default Sidebar;
