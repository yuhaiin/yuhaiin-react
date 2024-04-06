"use client"

import { Container } from 'react-bootstrap';
import NavBar from './docs/nav';
import { GlobalToastProvider } from './docs/common/toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-bs-theme="auto">
      <head>
        <meta charSet="utf-8" />
        <title>Yuhaiin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/docs/favicon.ico" />
        {/* <meta name="theme-color" content="#000000" /> */}
        <meta name="description" content="yuhaiin" />
        <link rel="apple-touch-icon" href="/docs/logo192.png" />
      </head>
      <body>
        <NavBar>
          <Container className="mt-3">
            <GlobalToastProvider>
              {children}
            </GlobalToastProvider>
          </Container>
        </NavBar>
      </body>
    </html>
  )
}
