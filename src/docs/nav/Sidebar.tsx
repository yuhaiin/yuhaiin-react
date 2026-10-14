import { navigationSections } from './navigation';
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

    const labels = { nav: t, ui: uiT, routing: routeT };
    return <SidebarRoot id={id} show={show} onHide={onHide} triggerRef={triggerRef}>
        <SidebarNav aria-label={t('toggle')}>
            {navigationSections.map(section => <SidebarSection key={section.label.key} title={labels[section.label.namespace](section.label.key)}>
                {section.items.map(item => {
                    const Icon = item.icon;
                    const title = labels[item.label.namespace](item.label.key);
                    if ('path' in item) return taskLink(item.path, title, <Icon size={20} />);
                    return <SidebarGroup key={item.label.key} title={title} icon={<Icon size={20} />} activePath={pathname} paths={item.items.map(link => link.path)}>
                        {item.items.map(child => {
                            const ChildIcon = child.icon;
                            const childLink = link(child.path, labels[child.label.namespace](child.label.key), <ChildIcon />);
                            return child.divider ? <React.Fragment key={child.path}><SidebarDivider className="mx-4 w-auto" />{childLink}</React.Fragment> : childLink;
                        })}
                    </SidebarGroup>;
                })}
            </SidebarSection>)}
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
