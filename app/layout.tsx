"use client"

import './globals.css'
import { Container } from 'react-bootstrap';
import NavBar from './docs/nav';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>ユハイイン</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/docs/favicon.ico" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="yuhaiin" />
        <link rel="apple-touch-icon" href="/docs/logo192.png" />
      </head>
      <body>
        <NavBar />

        <Container className="mt-3">
          {children}
        </Container>
      </body>
    </html>
  )
}
