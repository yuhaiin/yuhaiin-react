import { useSmartAnimation } from "@/hooks/useSmartAnimation";
import { ThemeProvider } from '@/common/ThemeProvider';
import { GlobalToastProvider } from '@/component/v2/toast';
import NavBarContainer from '@/docs/nav/NavBarContainer';
import { useHashLocation } from '@/hooks/useHashLocation';
import clsx from 'clsx';
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from 'motion/react';
import { useEffect } from 'react';
import { Route, Router, Switch, useLocation } from 'wouter';
import { appRoutes } from './routes';

interface AndroidInterface {
    setRefreshEnabled?: (enabled: boolean) => void
}

declare global {
    interface Window {
        Android?: AndroidInterface
    }
}

const routeOrder = appRoutes.map(route => route.path);
type AnimationContext = { direction: number; reducedMotion: boolean | null };
const variants = {
    enter: ({ direction, reducedMotion }: AnimationContext) => ({
        y: reducedMotion ? 0 : direction > 0 ? '100%' : '-100%', opacity: 0,
    }),
    center: { y: 0, opacity: 1 },
    exit: ({ direction, reducedMotion }: AnimationContext) => ({
        y: reducedMotion ? 0 : direction > 0 ? '-100%' : '100%', opacity: 0,
    }),
};

function AppContent() {
    const [location] = useLocation();

    useEffect(() => {
        window.Android?.setRefreshEnabled?.(!location.includes('/docs/config/log'))
    }, [location])

    const reducedMotion = useReducedMotion();
    const direction = useSmartAnimation(location, routeOrder);
    const animationContext = { direction, reducedMotion };
    const isLogin = location === '/login';
    const content = (
        <div className={clsx(
            'relative w-auto min-h-screen h-screen overflow-hidden box-border',
            'h-[100dvh] min-h-[100dvh]'
        )}>
            <AnimatePresence mode="wait" initial={false} custom={animationContext}>
                <motion.div
                    key={location}
                    custom={animationContext}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className={clsx(
                        'absolute inset-0 box-border h-full w-full',
                        'overflow-y-auto overflow-x-hidden',
                        !isLogin && 'pt-[calc(80px+env(safe-area-inset-top))] px-3 sm:px-5 pb-[calc(20px+env(safe-area-inset-bottom))]',
                        !isLogin && 'lg:pt-[20px] lg:pl-[292px]'
                    )}
                    transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
                >
                    <Router hook={() => [location, () => { }]}>
                        <Switch>
                            {appRoutes.map(({ path, component }) => (
                                <Route key={path} path={path} component={component} />
                            ))}
                        </Switch>
                    </Router>
                </motion.div>
            </AnimatePresence>
        </div>
    );

    return (
        <GlobalToastProvider>
            {isLogin ? content : <NavBarContainer>{content}</NavBarContainer>}
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
