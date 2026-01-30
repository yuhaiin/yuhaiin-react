import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { GlobalToastProvider as GlobalToastProviderv2 } from '../component/v2/toast'
import NavBarContainer from '../docs/nav/NavBarContainer'
import { RouteAnimationContainer } from '@/component/RouteAnimationContainer'

interface AndroidInterface {
    setRefreshEnabled?: (enabled: boolean) => void
}

declare global {
    interface Window {
        Android?: AndroidInterface
    }
}

export const Route = createRootRoute({
    component: RootComponent,
})

function RootComponent() {
    const [colorScheme, setColorScheme] = useState<'light' | 'dark' | undefined>(undefined)
    const pathname = useLocation({ select: (location) => location.pathname })

    useEffect(() => {
        window.Android?.setRefreshEnabled?.(!pathname.includes('/docs/config/log'))
    }, [pathname])

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

    // data-bs-theme needs to be applied to html, but we are in a component inside body.
    useEffect(() => {
        if (colorScheme) {
            document.documentElement.setAttribute('data-bs-theme', colorScheme)
        }
    }, [colorScheme])

    return (
        <GlobalToastProviderv2>
            {colorScheme &&
                <NavBarContainer>
                    <div className={clsx(
                        // base
                        'relative w-auto min-h-screen h-screen overflow-hidden box-border',
                        'transition-[margin-left,max-width,padding] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',

                        // padding
                        'pt-[80px] px-[20px] pb-[20px]',
                        'lg:pt-[20px] lg:pl-[292px] lg:pr-[20px] lg:pb-[20px]',

                        // mobile
                        'lg:h-screen',
                        'h-[100dvh] min-h-[100dvh]'
                    )}>
                        <RouteAnimationContainer>
                            <Outlet />
                        </RouteAnimationContainer>
                    </div>
                </NavBarContainer>
            }
            <TanStackRouterDevtools position="bottom-right" />
        </GlobalToastProviderv2>
    )
}
