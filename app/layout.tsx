"use client"

import { usePathname } from 'next/navigation';
import { useEffect, useState, ViewTransition } from 'react';
import { GlobalToastProvider as GlobalToastProviderv2 } from './component/v2/toast';
import NavBarContainer from './docs/nav/NavBarContainer';
import './global.css';

interface AndroidInterface {
  setRefreshEnabled?: (enabled: boolean) => void
}

declare global {
  interface Window {
    Android?: AndroidInterface
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark' | undefined>(undefined);
  const pathname = usePathname();

  useEffect(() => {
    window.Android?.setRefreshEnabled?.(!pathname.includes("/docs/config/log"));
  }, [pathname]);


  useEffect(() => {
    if (!window.matchMedia) {
      setColorScheme('light')
      return
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setColorScheme(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', (evt) => { setColorScheme(evt.matches ? 'dark' : 'light'); });
  }, []);

  return (
    <html lang="en" data-bs-theme={colorScheme}>
      <head>
        <meta charSet="utf-8" />
        <title>Yuhaiin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/docs/faviconv2.ico" />
        {/* <meta name="theme-color" content="#000000" /> */}
        <meta name="description" content="yuhaiin" />
        <link rel="apple-touch-icon" href="/docs/logov2192.png" />
      </head>
      <body>
        {colorScheme &&
          <NavBarContainer> {/* Updated component name */}
            <div className="main-content">
              <GlobalToastProviderv2>
                <ViewTransition>
                  {children}
                </ViewTransition>
              </GlobalToastProviderv2>
            </div>
          </NavBarContainer>
        }
      </body>
    </html>
  )
}
