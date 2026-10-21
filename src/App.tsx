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
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
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

type AnimationContext = { direction: number; reducedMotion: boolean | null };
const variants = {
    enter: ({ direction, reducedMotion }: AnimationContext) => ({
        y: reducedMotion ? 0 : direction > 0 ? 12 : -12, opacity: 0,
    }),
    center: { y: 0, opacity: 1 },
    exit: ({ direction, reducedMotion }: AnimationContext) => ({
        y: reducedMotion ? 0 : direction > 0 ? -8 : 8, opacity: 0,
    }),
};

function AppContent() {
    const [location, navigate] = useLocation();
    const session = useSession();
    useEffect(() => { if (!session && location !== "/login") navigate("/login"); }, [session, location, navigate]);

    useEffect(() => {
        window.Android?.setRefreshEnabled?.(!location.includes('/docs/config/log'))
    }, [location])

    const reducedMotion = useReducedMotion();
    const direction = useSmartAnimation(location, navigationOrder);
    const animationContext = { direction, reducedMotion };
    const isLogin = location === '/login' || !session;
    const content = (
        <div className={clsx(
            'relative w-auto min-h-screen h-screen overflow-hidden box-border',
            'h-[100dvh] min-h-[100dvh]'
        )}>
            <AnimatePresence mode="wait" initial={false} custom={animationContext}>
                <motion.div
                    data-ui-transition="page"
                    key={location}
                    custom={animationContext}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className={clsx(
                        'absolute inset-0 box-border h-full w-full',
                        'overflow-y-auto overflow-x-hidden',
                        !isLogin && 'pt-[calc(var(--mobile-app-bar-height)+env(safe-area-inset-top)+12px)] px-3 sm:px-5 pb-[calc(20px+env(safe-area-inset-bottom))]',
                        !isLogin && 'lg:pt-[20px] lg:pl-[292px]'
                    )}
                    transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
                >
                    <Router hook={() => [location, navigate]}>
                        <Switch>
                            {appRoutes.filter(route => !isLogin || route.path === "/login").map(({ path, component }) => (
                                <Route key={path} path={path}>{() => {
                                    const Page = component;
                                    return <PagePermissions path={path}><Page /></PagePermissions>;
                                }}</Route>
                            ))}
                        </Switch>
                    </Router>
                </motion.div>
            </AnimatePresence>
        </div>
    );

    return (
        <GlobalToastProvider>
            <ConfirmationHost />
            <SessionMonitor />
            {isLogin ? content : <ApiCacheBoundary><NavBarContainer>{content}</NavBarContainer></ApiCacheBoundary>}
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
