import { Router, Switch, Route } from 'wouter';
import { useHashLocation } from '@/hooks/useHashLocation';
import { useSmartAnimation } from '@/hooks/useSmartAnimation';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { GlobalToastProvider } from '@/component/v2/toast';
import NavBarContainer from '@/docs/nav/NavBarContainer';

// Imports for Pages
import HomePage from '@/docs/home/page';
import ConfigPage from '@/docs/config/page';
import ConfigLicensesPage from '@/docs/config/licenses/page';
import ConfigLogPage from '@/docs/config/log/page';
import ConfigBackupPage from '@/docs/config/backup/page';
import ConfigAboutPage from '@/docs/config/about/page';
import ConfigDocumentsPage from '@/docs/config/documents/page';
import ConfigPprofPage from '@/docs/config/pprof/page';
import InboundPage from '@/docs/inbound/page';
import GroupActivatesPage from '@/docs/group/activates/page';
import GroupPage from '@/docs/group/page';
import GroupSubscribePage from '@/docs/group/subscribe/page';
import GroupPublishPage from '@/docs/group/publish/page';
import WebUIPage from '@/docs/webui/page';
import ConnectionsFailedPage from '@/docs/connections/failed/page';
import ConnectionsHistoryPage from '@/docs/connections/history/page';
import ConnectionsV2Page from '@/docs/connections/v2/page';
import BypassBlockPage from '@/docs/bypass/block/page';
import BypassPage from '@/docs/bypass/page';
import BypassTestPage from '@/docs/bypass/test/page';
import BypassResolverPage from '@/docs/bypass/resolver/page';
import BypassTagPage from '@/docs/bypass/tag/page';
import BypassListPage from '@/docs/bypass/list/page';

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
    const [colorScheme, setColorScheme] = useState<'light' | 'dark' | undefined>(undefined);

    useEffect(() => {
        window.Android?.setRefreshEnabled?.(!location.includes('/docs/config/log'))
    }, [location])

    useEffect(() => {
        if (!window.matchMedia) {
            setColorScheme('light')
            return
        }
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        setColorScheme(mq.matches ? 'dark' : 'light')
        const listener = (evt: MediaQueryListEvent) => setColorScheme(evt.matches ? 'dark' : 'light');
        mq.addEventListener('change', listener);
        return () => mq.removeEventListener('change', listener);
    }, [])

    useEffect(() => {
        if (colorScheme) {
            document.documentElement.setAttribute('data-bs-theme', colorScheme)
        }
    }, [colorScheme])

    return (
        <GlobalToastProvider>
            {colorScheme &&
                <NavBarContainer>
                    <div className={clsx(
                        'relative w-auto min-h-screen h-screen overflow-hidden box-border',
                        'transition-[margin-left,max-width,padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
                        'pt-[80px] px-[20px] pb-[20px]',
                        'lg:pt-[20px] lg:pl-[292px] lg:pr-[20px] lg:pb-[20px]',
                        'lg:h-screen',
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
                                    'pt-[80px] px-[20px] pb-[20px]',
                                    'lg:pt-[20px] lg:pl-[292px]'
                                )}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                            >
                                <Router hook={() => [location, () => {}] as const}>
                                    <Switch>
                                        <Route path="/" component={HomePage} />

                                        <Route path="/docs/group" component={GroupPage} />
                                        <Route path="/docs/group/subscribe" component={GroupSubscribePage} />
                                        <Route path="/docs/group/publish" component={GroupPublishPage} />
                                        <Route path="/docs/group/activates" component={GroupActivatesPage} />

                                        <Route path="/docs/inbound" component={InboundPage} />

                                        <Route path="/docs/bypass" component={BypassPage} />
                                        <Route path="/docs/bypass/list" component={BypassListPage} />
                                        <Route path="/docs/bypass/tag" component={BypassTagPage} />
                                        <Route path="/docs/bypass/resolver" component={BypassResolverPage} />
                                        <Route path="/docs/bypass/test" component={BypassTestPage} />
                                        <Route path="/docs/bypass/block" component={BypassBlockPage} />

                                        <Route path="/docs/connections/v2" component={ConnectionsV2Page} />
                                        <Route path="/docs/connections/history" component={ConnectionsHistoryPage} />
                                        <Route path="/docs/connections/failed" component={ConnectionsFailedPage} />

                                        <Route path="/docs/config" component={ConfigPage} />
                                        <Route path="/docs/webui" component={WebUIPage} />
                                        <Route path="/docs/config/backup" component={ConfigBackupPage} />
                                        <Route path="/docs/config/log" component={ConfigLogPage} />
                                        <Route path="/docs/config/pprof" component={ConfigPprofPage} />
                                        <Route path="/docs/config/documents" component={ConfigDocumentsPage} />
                                        <Route path="/docs/config/licenses" component={ConfigLicensesPage} />
                                        <Route path="/docs/config/about" component={ConfigAboutPage} />

                                        {/* Fallback route - maybe redirect to home or show 404 */}
                                    </Switch>
                                </Router>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </NavBarContainer>
            }
        </GlobalToastProvider>
    )
}

export default function App() {
    return (
        <Router hook={useHashLocation}>
            <AppContent />
        </Router>
    );
}
