import { Activity, ArrowLeftRight, BookOpen, CircleHelp, Download, ExternalLink, FileClock, FileText, Filter, Gauge, History, House, Layers, ListFilter, Network, Radio, ScrollText, Settings, Share2, ShieldBan, SlidersHorizontal, Upload, Waypoints, Wrench, type LucideIcon } from 'lucide-react';

type Label = { namespace: 'nav' | 'ui' | 'routing'; key: string };
export interface NavigationLink { path: string; label: Label; icon: LucideIcon; divider?: boolean }
interface NavigationGroup { label: Label; icon: LucideIcon; items: NavigationLink[] }
interface NavigationSection { label: Label; items: (NavigationLink | NavigationGroup)[] }
const nav = (key: string): Label => ({ namespace: 'nav', key });
const ui = (key: string): Label => ({ namespace: 'ui', key });
const routing = (key: string): Label => ({ namespace: 'routing', key });

/** The sidebar and page transitions share this visible order. */
export const navigationSections: NavigationSection[] = [
    { label: nav('monitoring'), items: [
        { path: '/', label: nav('home'), icon: House },
        { label: nav('connections'), icon: Activity, items: [
            { path: '/docs/connections/v2', label: ui('connections18'), icon: ArrowLeftRight },
            { path: '/docs/connections/history', label: ui('history'), icon: History },
            { path: '/docs/connections/failed', label: ui('failedHistory'), icon: FileClock },
            { path: '/docs/bypass/block', label: ui('blockHistory'), icon: ShieldBan },
        ] },
    ] },
    { label: nav('trafficConfiguration'), items: [
        { label: routing('destinationsTask'), icon: ExternalLink, items: [
            { path: '/docs/group', label: routing('nodesTask'), icon: Network },
            { path: '/docs/group/selectors', label: routing('selectorsTitle'), icon: Waypoints },
            { path: '/docs/group/subscribe', label: ui('subscribe'), icon: Download },
            { path: '/docs/group/publish', label: ui('publish'), icon: Share2, divider: true },
            { path: '/docs/group/activates', label: ui('activeNodes'), icon: Radio },
        ] },
        { label: routing('routingTask'), icon: Filter, items: [
            { path: '/docs/bypass', label: nav('routeRules'), icon: ListFilter },
            { path: '/docs/bypass/list', label: routing('sharedMatchingData'), icon: Layers },
            { path: '/docs/bypass/test', label: ui('testRoute'), icon: Waypoints },
        ] },
        { path: '/docs/gateway', label: nav('gateway'), icon: Network },
        { path: '/docs/traffic-control', label: nav('trafficControl'), icon: Gauge },
        { path: '/docs/inbound', label: routing('trafficEntryTask'), icon: Download },
        { path: '/docs/bypass/resolver', label: routing('dnsTask'), icon: Network },
    ] },
    { label: nav('system'), items: [
        { path: '/docs/security', label: nav('accountSecurity'), icon: Settings },
        { label: nav('diagnostics'), icon: Wrench, items: [
            { path: '/docs/diagnostics', label: ui('networkDiagnostics'), icon: Activity },
            { path: '/docs/config/log', label: ui('log'), icon: ScrollText },
            { path: '/docs/config/pprof', label: ui('pprof'), icon: Gauge },
        ] },
        { label: nav('setting'), icon: Settings, items: [
            { path: '/docs/config', label: ui('config'), icon: SlidersHorizontal },
            { path: '/docs/webui', label: ui('webui'), icon: Settings },
            { path: '/docs/config/backup', label: ui('backup'), icon: Upload },
        ] },
        { label: nav('help'), icon: CircleHelp, items: [
            { path: '/docs/config/documents', label: ui('documents'), icon: BookOpen },
            { path: '/docs/config/about', label: ui('about'), icon: CircleHelp },
            { path: '/docs/config/licenses', label: ui('licenses'), icon: FileText },
        ] },
    ] },
];
export const navigationOrder = ['/login', ...navigationSections.flatMap(section => section.items.flatMap(item => 'path' in item ? [item.path] : item.items.map(link => link.path)))];

/** Route aliases and resource queries share the title of their owning page. */
export function navigationLabel(location: string): Label | undefined {
    const path = location.split('?')[0].replace(/\/+$/, '') || '/';
    const links = navigationSections.flatMap(section => section.items.flatMap(item => 'path' in item ? [item] : item.items));
    return links.find(link => link.path === path)?.label;
}
