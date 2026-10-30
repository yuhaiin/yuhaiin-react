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
import { motionTiming } from '@/component/v2/styles';
import { useEffect } from 'react';
import { Route, Router, Switch, useLocation } from 'wouter';
import { navigationOrder } from './docs/nav/navigation';
import { appRoutes } from './routes';

interface AndroidInterface {
    setRefreshEnabled?: (enabled: boolean) => void
}

declare global {
    interface Window {
        Android?: AndroidInterface
    }
}

// WebUI preferences are local to this browser and need no controller session.
const publicPaths = ['/login', '/docs/webui'];

function AppContent() {
    const [location, navigate] = useLocation();
    const session = useSession();
    useEffect(() => { if (!session && !publicPaths.includes(location)) navigate("/login"); }, [session, location, navigate]);

    useEffect(() => {
        window.Android?.setRefreshEnabled?.(!location.includes('/docs/config/log'))
    }, [location])

    const reducedMotion = useReducedMotion();
    const direction = useSmartAnimation(location, navigationOrder);
    const isStandalone = location === '/login' || !session;
    const content = (
        <div className={clsx(
            'relative w-auto min-h-screen h-screen overflow-hidden box-border',
            'h-[100dvh] min-h-[100dvh]'
        )}>
            {/* The next page mounts at once, so navigation and its requests never wait on an exit. */}
            <motion.div
                data-ui-transition="page"
                key={location}
                initial={{ opacity: 0, y: reducedMotion ? 0 : direction * 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={clsx(
                    'absolute inset-0 box-border h-full w-full',
                    'overflow-y-auto overflow-x-hidden',
                    !session && location === '/docs/webui' && 'p-4 sm:p-5',
                    !isStandalone && 'pt-[calc(var(--mobile-app-bar-height)+env(safe-area-inset-top)+12px)] px-3 sm:px-5 pb-[calc(20px+env(safe-area-inset-bottom))]',
                    !isStandalone && 'lg:pt-[20px] lg:pl-[292px]'
                )}
                transition={{ duration: reducedMotion ? 0 : motionTiming.normal, ease: "easeOut" }}
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
