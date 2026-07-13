import { ThemeProvider, useTheme } from '@/common/ThemeProvider';
import { GlobalToastProvider } from '@/component/v2/toast';
import NavBarContainer from '@/docs/nav/NavBarContainer';
import { useHashLocation } from '@/hooks/useHashLocation';
import { useSmartAnimation } from '@/hooks/useSmartAnimation';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';
import { Route, Router, Switch } from 'wouter';
import { appRoutes } from './routes';

interface AndroidInterface {
    setRefreshEnabled?: (enabled: boolean) => void
}

declare global {
    interface Window {
        Android?: AndroidInterface
    }
}

const variants = {
    enter: (direction: number) => ({
        y: direction > 0 ? '100%' : '-100%',
        opacity: 0,
    }),
    center: {
        zIndex: 1,
        y: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        zIndex: 0,
        y: direction < 0 ? '100%' : '-100%',
        opacity: 0,
    }),
};

function AppContent() {
    const { direction, location } = useSmartAnimation();
    const { ready } = useTheme();

    useEffect(() => {
        window.Android?.setRefreshEnabled?.(!location.includes('/docs/config/log'))
    }, [location])

    const isLogin = location === '/login';
    const content = (
        <div className={clsx(
            'relative w-auto min-h-screen h-screen overflow-hidden box-border',
            'transition-[margin-left,max-width,padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
            !isLogin && 'pt-[80px] px-[20px] pb-[20px]',
            !isLogin && 'lg:pt-[20px] lg:pl-[292px] lg:pr-[20px] lg:pb-[20px]',
            !isLogin && 'lg:h-screen',
            'h-[100dvh] min-h-[100dvh]'
        )}>
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.div
                    key={location}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className={clsx(
                        'absolute inset-0 box-border h-full w-full',
                        'overflow-y-auto overflow-x-hidden',
                        'will-change-[transform,opacity]',
                        !isLogin && 'pt-[80px] px-[20px] pb-[20px]',
                        !isLogin && 'lg:pt-[20px] lg:pl-[292px]'
                    )}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    <Router hook={() => [location, () => { }] as const}>
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
            {ready && (
                isLogin ? content : <NavBarContainer>{content}</NavBarContainer>
            )}
        </GlobalToastProvider>
    )
}

export default function App() {
    return (
        <ThemeProvider>
            <Router hook={useHashLocation}>
                <AppContent />
            </Router>
        </ThemeProvider>
    );
}
