import { ApiCacheBoundary } from '@/common/ApiCacheBoundary';
import { useSession, SessionMonitor } from '@/auth/context';
import { PagePermissions } from '@/auth/policy';
import { ConfirmationHost } from '@/component/v2/confirmation';
import { useSmartAnimation } from "@/hooks/useSmartAnimation";
import { ThemeProvider } from '@/common/ThemeProvider';
import { GlobalToastProvider } from '@/component/v2/toast';
import NavBarContainer from '@/docs/nav/NavBarContainer';
import { useHashLocation } from '@/hooks/useHashLocation';
import clsx from 'clsx';
import { MotionConfig, motion, useReducedMotion } from 'motion/react';
import { motionEase, motionTiming } from '@/component/v2/styles';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useNavigationSnapshot } from '@/hooks/navigation';
import { useEffect, useMemo, useState } from 'react';
import { initializationStatus } from '@/auth/api';
import { establishLocalConnection, getSession } from '@/auth/session';
import { getApiUrl } from '@/common/apiurl';
import { Route, Router, Switch, useLocation } from 'wouter';
import { navigationOrder } from './docs/nav/navigation';
import { sectionOf } from './docs/nav/SectionTabs';
import { pageExitGhost } from './component/page-ghost';
import { appRoutes } from './routes';

// WebUI preferences are local to this browser and need no controller session.
const publicPaths = ['/login', '/docs/webui'];

const loopbackHosts = ['localhost', '127.0.0.1', '[::1]'];

function isLoopbackController(controller: string) {
    try { return loopbackHosts.includes(new URL(controller || window.location.href).hostname); }
    catch { return false; }
}

/**
 * Sessions live in memory, so every load starts without one. A loopback
 * controller without an identity module (the Android app, a local desktop core)
 * needs no sign-in: connect before rendering, so a reload neither flashes the
 * sign-in card nor loses the current page.
 */
function useLocalConnection() {
    const [checking, setChecking] = useState(() => !getSession() && isLoopbackController(getApiUrl()));
    useEffect(() => {
        if (!checking) return;
        const request = new AbortController();
        const timeout = window.setTimeout(() => request.abort(), 3000);
        const controller = getApiUrl();
        let cancelled = false;
        void initializationStatus(controller, request.signal)
            .then(status => { if (!cancelled && status.authentication === 'none') establishLocalConnection(controller); })
            .catch(() => undefined)
            // A timeout falls through to the sign-in page, which reports the error.
            .finally(() => { window.clearTimeout(timeout); if (!cancelled) setChecking(false); });
        return () => { cancelled = true; window.clearTimeout(timeout); request.abort(); };
    }, [checking]);
    return checking;
}

function AppContent() {
    const [location, navigate] = useLocation();
    const session = useSession();
    const connecting = useLocalConnection();
    useEffect(() => { if (!connecting && !session && !publicPaths.includes(location)) navigate("/login"); }, [connecting, session, location, navigate]);

    const reducedMotion = useReducedMotion();
    const { index: historyIndex } = useNavigationSnapshot();
    // Phones move pages sideways like an app stack; wide screens keep a quiet vertical settle.
    const desktop = useMediaQuery('(min-width: 1024px)');
    // Switching between tab-bar sections on a phone cross-fades, as native tabs do.
    const direction = useSmartAnimation(location, navigationOrder, historyIndex, desktop ? undefined : sectionOf);
    const leavePage = useMemo(() => pageExitGhost(location), [location]);
    const offset = reducedMotion ? 0 : direction * (desktop ? 6 : 16);
    const isStandalone = location === '/login' || !session;
    const content = (
        <div className={clsx(
            'relative w-auto min-h-screen h-screen overflow-hidden box-border',
            'h-[100dvh] min-h-[100dvh]'
        )}>
            {/* The next page mounts at once, so navigation and its requests never wait on an exit;
                the page left behind fades out as an inert copy (page-ghost.ts). */}
            <motion.div
                ref={leavePage}
                data-ui-transition="page"
                key={location}
                initial={{ opacity: 0, x: desktop ? 0 : offset, y: desktop ? offset : 0 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                className={clsx(
                    'absolute inset-0 box-border h-full w-full',
                    'overflow-y-auto overflow-x-hidden',
                    !session && location === '/docs/webui' && 'p-4 sm:p-5',
                    // --chrome-*-reclaim give a full-height page the space of scrolled-away bars (global.css).
                    !isStandalone && 'pt-[calc(var(--mobile-app-bar-height)+env(safe-area-inset-top)+12px-var(--chrome-top-reclaim,0px))] px-[var(--page-gutter)] pb-[calc(20px+var(--bottom-nav-space)-var(--chrome-bottom-reclaim,0px))]',
                    // Past --content-max the page centers in the area beside the sidebar instead of stretching.
                    !isStandalone && 'lg:pt-[calc(20px+env(safe-area-inset-top))] lg:pl-[calc(292px+max(0px,(100%-312px-var(--content-max))/2))] lg:pr-[calc(20px+max(0px,(100%-312px-var(--content-max))/2))]'
                )}
                transition={{ duration: reducedMotion ? 0 : motionTiming.slow, ease: motionEase.standard }}
            >
                <Router hook={() => [location, navigate]}>
                    <Switch>
                        {appRoutes.filter(route => session || publicPaths.includes(route.path)).map(({ path, component }) => (
                            <Route key={path} path={path}>{() => {
                                const Page = component;
                                return <PagePermissions path={path}><Page /></PagePermissions>;
                            }}</Route>
                        ))}
                    </Switch>
                </Router>
            </motion.div>
        </div>
    );

    // A blank page in the app background; the check takes a few milliseconds.
    if (connecting) return <div className="h-[100dvh] bg-ui-bg" aria-busy="true" />;
    return (
        <GlobalToastProvider>
            <ConfirmationHost />
            <SessionMonitor />
            {isStandalone ? content : <ApiCacheBoundary><NavBarContainer>{content}</NavBarContainer></ApiCacheBoundary>}
        </GlobalToastProvider>
    )
}

export default function App() {
    return (
        <MotionConfig reducedMotion="user">
        <ThemeProvider>
            <Router hook={useHashLocation}>
                <AppContent />
            </Router>
        </ThemeProvider>
        </MotionConfig>
    );
}
